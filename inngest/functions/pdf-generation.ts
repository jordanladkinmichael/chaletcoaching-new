import { inngest } from "../client";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { formatContentForPDF } from "@/lib/pdf-formatter";
import { generatePDFTemplate } from "@/lib/pdf-template";
import { downloadAndOptimizeImages, generateImageHTML } from "@/lib/image-optimizer";
import { uploadPDF, generatePDFFilename } from "@/lib/blob-storage";

// Типы для события
type PDFGenerationEvent = {
  name: "pdf/generate";
  data: {
    courseId: string;
    userId: string;
  };
};

// Inngest функция для генерации PDF
export const generatePDF = inngest.createFunction(
  {
    id: "generate-pdf",
    name: "Generate Course PDF",
    retries: 2, // 2 попытки при ошибке
  },
  { event: "pdf/generate" },
  async ({ event, step }) => {
    const { courseId, userId } = event.data;

    // Шаг 1: Получаем курс из БД
    const course = await step.run("get-course", async () => {
      const courseData = await prisma.course.findFirst({
        where: {
          id: courseId,
          userId: userId,
        },
        select: {
          id: true,
          title: true,
          options: true,
          createdAt: true,
          tokensSpent: true,
          content: true,
          images: true,
          nutritionAdvice: true,
        },
      });

      if (!courseData) {
        throw new Error(`Course ${courseId} not found`);
      }

      return courseData;
    });

    // Шаг 2: Получаем и оптимизируем изображения (используем существующие из курса)
    const optimizedImages = await step.run("optimize-images", async () => {
      const options = typeof course.options === "string"
        ? JSON.parse(course.options)
        : course.options;

      // Используем существующие изображения из курса
      let imageUrls: string[] = [];
      
      if (course.images) {
        try {
          const parsedImages = typeof course.images === "string"
            ? JSON.parse(course.images)
            : course.images;
          
          if (Array.isArray(parsedImages) && parsedImages.length > 0) {
            // Ограничиваем до 2 изображений для компактности PDF
            imageUrls = parsedImages.slice(0, 2);
            console.log(`Found ${imageUrls.length} existing images from course`);
          }
        } catch (error) {
          console.error("Failed to parse course images:", error);
        }
      }

      // Если изображений нет, возвращаем пустой массив
      if (imageUrls.length === 0) {
        console.log("No images available for PDF - generating without images");
        return [];
      }

      // Скачиваем и оптимизируем изображения
      console.log(`Downloading and optimizing ${imageUrls.length} images...`);
      const optimized = await downloadAndOptimizeImages(imageUrls, {
        maxWidth: 800,
        maxHeight: 600,
        timeout: 10000,
        maxImages: 2,
      });

      const validImages = optimized.filter((img) => img !== null);
      console.log(`Successfully optimized ${validImages.length} images`);

      return optimized;
    });

    // Шаг 3: Форматируем контент через OpenAI для компактного PDF
    const formattedContent = await step.run("format-content", async () => {
      const options = typeof course.options === "string"
        ? JSON.parse(course.options)
        : course.options;

      // Используем существующий контент курса
      const rawContent = course.content || "";

      if (!rawContent) {
        console.warn("No content available for course, using placeholder");
        return "<p>Content not available for this course.</p>";
      }

      // Форматируем контент через OpenAI для компактного PDF (максимум 4 страницы)
      const formatted = await formatContentForPDF({
        content: rawContent,
        nutritionAdvice: course.nutritionAdvice,
        weeks: options.weeks || 4,
        sessionsPerWeek: options.sessionsPerWeek || 4,
        workoutTypes: Array.isArray(options.workoutTypes) ? options.workoutTypes : [],
        targetMuscles: Array.isArray(options.targetMuscles) ? options.targetMuscles : [],
        injurySafe: options.injurySafe || false,
        specialEquipment: options.specialEquipment || false,
      });

      console.log("Content formatted for PDF");
      return formatted;
    });

    // Шаг 4: Создаем HTML контент с использованием шаблона
    const htmlContent = await step.run("create-html", async () => {
      const options = typeof course.options === "string"
        ? JSON.parse(course.options)
        : course.options;

      // Генерируем HTML для изображений с встроенными base64 данными
      const imagesHtml = generateImageHTML(optimizedImages);

      // Генерируем HTML используя компактный шаблон
      const html = generatePDFTemplate({
        title: course.title || "Fitness Program",
        createdAt: new Date(course.createdAt),
        weeks: options.weeks || 4,
        sessionsPerWeek: options.sessionsPerWeek || 4,
        workoutTypes: Array.isArray(options.workoutTypes) ? options.workoutTypes : [],
        targetMuscles: Array.isArray(options.targetMuscles) ? options.targetMuscles : [],
        injurySafe: options.injurySafe || false,
        specialEquipment: options.specialEquipment || false,
        nutritionTips: options.nutritionTips || false,
        formattedContent,
        nutritionAdvice: course.nutritionAdvice,
        imagesHtml,
      });

      console.log("HTML template generated with embedded images");
      return html;
    });

    // Шаг 5: Генерируем PDF через Puppeteer
    const pdfBuffer = (await step.run("generate-pdf", async () => {
      const browser = await puppeteer.launch({
        args: [
          ...chromium.args,
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
        executablePath: await chromium.executablePath(),
        headless: true,
        defaultViewport: { width: 1200, height: 800 },
      });

      try {
        const page = await browser.newPage();
        
        // Устанавливаем контент (изображения уже встроены как base64)
        await page.setContent(htmlContent, {
          waitUntil: 'domcontentloaded', // Быстрее, так как изображения уже встроены
          timeout: 30000
        });

        // Минимальная пауза для рендеринга (изображения встроены, поэтому быстро)
        await new Promise(resolve => setTimeout(resolve, 500));

        const generatedPdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '8mm', // Минимальные отступы для максимальной компактности
            right: '8mm',
            bottom: '8mm',
            left: '8mm'
          },
          preferCSSPageSize: false,
          displayHeaderFooter: false, // Без заголовков/футеров для компактности
        });

        if (generatedPdfBuffer.length < 1000) {
          throw new Error('Generated PDF is too small, likely corrupted');
        }

        const pdfSizeKB = Math.round(generatedPdfBuffer.length / 1024);
        console.log(`PDF generated successfully: ${pdfSizeKB} KB`);
        
        return generatedPdfBuffer;
      } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
      } finally {
        await browser.close();
      }
    })) as unknown as Buffer;

    // Шаг 6: Загружаем PDF в Vercel Blob Storage
    const blobResult = await step.run("upload-pdf-to-blob", async () => {
      const filename = generatePDFFilename(courseId);
      const result = await uploadPDF(pdfBuffer, filename);
      
      console.log(`PDF uploaded to Blob: ${result.url} (${result.size} bytes)`);
      
      return result;
    });

    // Шаг 7: Сохраняем PDF URL в БД
    const pdfUrl = await step.run("save-pdf-url", async () => {
      await prisma.course.update({
        where: { id: courseId },
        data: { 
          pdfUrl: blobResult.url,
        },
      });

      console.log(`PDF URL saved to database: ${blobResult.url}`);
      
      return blobResult.url;
    });

    return {
      success: true,
      courseId,
      pdfUrl,
      pdfSize: blobResult.size,
      uploadedAt: blobResult.uploadedAt,
    };
  }
);

