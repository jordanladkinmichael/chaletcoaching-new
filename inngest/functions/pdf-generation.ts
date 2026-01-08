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
    // Используем переменную вне шага для хранения больших данных (не возвращаем их)
    let optimizedImages: Array<{ dataUrl: string; width: number; height: number; size: number; originalUrl: string } | null> = [];
    
    const imageMetadata = await step.run("optimize-images", async () => {
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

      // Если изображений нет, возвращаем метаданные пустого массива
      if (imageUrls.length === 0) {
        console.log("No images available for PDF - generating without images");
        optimizedImages = [];
        return { imageCount: 0, urls: [] };
      }

      // Скачиваем и оптимизируем изображения
      console.log(`Downloading and optimizing ${imageUrls.length} images...`);
      optimizedImages = await downloadAndOptimizeImages(imageUrls, {
        maxWidth: 800,
        maxHeight: 600,
        timeout: 10000,
        maxImages: 2,
      });

      const validImages = optimizedImages.filter((img) => img !== null);
      console.log(`Successfully optimized ${validImages.length} images`);

      // Возвращаем только метаданные, не сами изображения (base64 данные слишком большие)
      return {
        imageCount: validImages.length,
        urls: imageUrls,
        totalSize: validImages.reduce((sum, img) => sum + (img?.size || 0), 0),
      };
    });

    // Шаг 3: Форматируем контент через OpenAI для компактного PDF
    // Используем переменную вне шага для хранения HTML (не возвращаем большой HTML)
    let formattedContent = "";
    
    const contentMetadata = await step.run("format-content", async () => {
      const options = typeof course.options === "string"
        ? JSON.parse(course.options)
        : course.options;

      // Используем существующий контент курса
      const rawContent = course.content || "";

      if (!rawContent) {
        console.warn("No content available for course, using placeholder");
        formattedContent = "<p>Content not available for this course.</p>";
        return { contentLength: formattedContent.length, hasContent: false };
      }

      // Форматируем контент через OpenAI для компактного PDF (максимум 4 страницы)
      formattedContent = await formatContentForPDF({
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
      // Возвращаем только метаданные, не сам HTML (может быть большим)
      return {
        contentLength: formattedContent.length,
        hasContent: true,
      };
    });

    // Шаг 4: Создаем HTML контент и генерируем PDF через Puppeteer
    // Объединяем шаги, чтобы все данные были доступны в одном контексте
    // Это предотвращает потерю переменных при retry
    let pdfBuffer: Buffer;
    
    const pdfMetadata = await step.run("generate-pdf", async () => {
      const options = typeof course.options === "string"
        ? JSON.parse(course.options)
        : course.options;

      // Пересоздаем formattedContent, если он недоступен (может быть потерян при retry)
      // Проверяем, существует ли переменная formattedContent (может быть не определена при retry)
      let currentFormattedContent: string;
      try {
        // Пытаемся использовать formattedContent из предыдущего шага
        currentFormattedContent = formattedContent || "";
      } catch {
        // Если переменная не определена, используем пустую строку
        currentFormattedContent = "";
      }
      
      // Если formattedContent пустой или слишком короткий, пересоздаем его
      if (!currentFormattedContent || currentFormattedContent.length < 100) {
        console.log("Formatted content not available, recreating...");
        const rawContent = course.content || "";
        
        if (!rawContent) {
          console.warn("No content available for course, using placeholder");
          currentFormattedContent = "<p>Content not available for this course.</p>";
        } else {
          // Пересоздаем отформатированный контент
          currentFormattedContent = await formatContentForPDF({
            content: rawContent,
            nutritionAdvice: course.nutritionAdvice,
            weeks: options.weeks || 4,
            sessionsPerWeek: options.sessionsPerWeek || 4,
            workoutTypes: Array.isArray(options.workoutTypes) ? options.workoutTypes : [],
            targetMuscles: Array.isArray(options.targetMuscles) ? options.targetMuscles : [],
            injurySafe: options.injurySafe || false,
            specialEquipment: options.specialEquipment || false,
          });
          console.log("Formatted content recreated for PDF generation");
        }
      } else {
        console.log(`Using existing formatted content (${currentFormattedContent.length} characters)`);
      }

      // Пересоздаем optimizedImages, если они недоступны (могут быть потеряны при retry)
      // Проверяем, существует ли переменная optimizedImages (может быть не определена при retry)
      let currentOptimizedImages: Array<{ dataUrl: string; width: number; height: number; size: number; originalUrl: string } | null>;
      try {
        // Пытаемся использовать optimizedImages из предыдущего шага
        currentOptimizedImages = optimizedImages || [];
      } catch {
        // Если переменная не определена, используем пустой массив
        currentOptimizedImages = [];
      }
      
      if (!currentOptimizedImages || currentOptimizedImages.length === 0) {
        console.log("Optimized images not available, recreating...");
        
        // Получаем URL изображений из курса
        let imageUrls: string[] = [];
        if (course.images) {
          try {
            const parsedImages = typeof course.images === "string"
              ? JSON.parse(course.images)
              : course.images;
            
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              imageUrls = parsedImages.slice(0, 2); // Ограничиваем до 2 изображений
            }
          } catch (error) {
            console.error("Failed to parse course images:", error);
          }
        }

        if (imageUrls.length > 0) {
          // Пересоздаем оптимизированные изображения
          currentOptimizedImages = await downloadAndOptimizeImages(imageUrls, {
            maxWidth: 800,
            maxHeight: 600,
            timeout: 10000,
            maxImages: 2,
          });
          console.log(`Recreated ${currentOptimizedImages.filter(img => img !== null).length} optimized images`);
        } else {
          currentOptimizedImages = [];
          console.log("No images available for PDF - generating without images");
        }
      }

      // Генерируем HTML для изображений с встроенными base64 данными
      const imagesHtml = generateImageHTML(currentOptimizedImages);

      // Генерируем HTML используя компактный шаблон
      const htmlContent = generatePDFTemplate({
        title: course.title || "Fitness Program",
        createdAt: new Date(course.createdAt),
        weeks: options.weeks || 4,
        sessionsPerWeek: options.sessionsPerWeek || 4,
        workoutTypes: Array.isArray(options.workoutTypes) ? options.workoutTypes : [],
        targetMuscles: Array.isArray(options.targetMuscles) ? options.targetMuscles : [],
        injurySafe: options.injurySafe || false,
        specialEquipment: options.specialEquipment || false,
        nutritionTips: options.nutritionTips || false,
        formattedContent: currentFormattedContent,
        nutritionAdvice: course.nutritionAdvice,
        imagesHtml,
      });

      console.log(`HTML template generated. HTML size: ${htmlContent.length} characters`);
      console.log(`Formatted content length: ${currentFormattedContent.length} characters`);
      console.log(`Optimized images count: ${currentOptimizedImages.filter(img => img !== null).length}`);

      // Проверка HTML контента перед генерацией
      if (!htmlContent || htmlContent.length < 100) {
        const errorMsg = `HTML content is too small or empty: ${htmlContent?.length || 0} characters`;
        console.error(errorMsg);
        console.error('HTML content preview:', htmlContent?.substring(0, 500) || 'N/A');
        throw new Error(errorMsg);
      }

      console.log(`Starting PDF generation. HTML content size: ${htmlContent.length} characters`);

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
        
        console.log('Setting HTML content in Puppeteer...');
        // Устанавливаем контент (изображения уже встроены как base64)
        // Используем networkidle0 для полной загрузки всех ресурсов
        await page.setContent(htmlContent, {
          waitUntil: 'networkidle0', // Ждем полной загрузки всех ресурсов
          timeout: 60000 // Увеличили таймаут до 60 секунд
        });

        console.log('HTML content loaded, waiting for rendering...');
        // Пауза для рендеринга (изображения встроены, но нужна пауза для CSS)
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('Generating PDF from HTML...');
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

        console.log(`PDF generated. Size: ${generatedPdfBuffer.length} bytes`);

        // Проверка размера PDF с детальной информацией об ошибке
        if (generatedPdfBuffer.length < 1000) {
          const errorDetails = {
            pdfSize: generatedPdfBuffer.length,
            htmlSize: htmlContent.length,
            formattedContentSize: currentFormattedContent.length,
            htmlPreview: htmlContent.substring(0, 1000),
          };
          console.error('PDF is too small. Details:', JSON.stringify(errorDetails, null, 2));
          throw new Error(
            `Generated PDF is too small (${generatedPdfBuffer.length} bytes), likely corrupted. ` +
            `HTML content size: ${htmlContent.length} characters. ` +
            `Check logs for more details.`
          );
        }

        const pdfSizeKB = Math.round(generatedPdfBuffer.length / 1024);
        console.log(`PDF generated successfully: ${pdfSizeKB} KB`);
        
        // Сохраняем buffer в переменную вне шага
        // Конвертируем в Buffer для совместимости типов (page.pdf() может вернуть Uint8Array)
        pdfBuffer = Buffer.from(generatedPdfBuffer);
      } catch (error) {
        console.error('PDF generation error:', error);
        console.error('Error details:', {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        throw error;
      } finally {
        await browser.close();
      }

      // Возвращаем метаданные для логирования
      return {
        pdfSize: pdfBuffer.length,
        pdfSizeKB: Math.round(pdfBuffer.length / 1024),
        htmlLength: htmlContent.length,
        formattedContentLength: currentFormattedContent.length,
        imagesCount: currentOptimizedImages.filter(img => img !== null).length,
      };
    });

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

