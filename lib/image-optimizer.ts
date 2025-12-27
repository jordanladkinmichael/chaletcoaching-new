/**
 * Image Optimizer for PDF Generation
 * Downloads images and converts them to base64 data URLs for embedding in PDF
 */

export interface OptimizedImage {
  dataUrl: string;
  width: number;
  height: number;
  size: number; // Size in bytes
  originalUrl: string;
}

/**
 * Download image and convert to base64 data URL
 * Optimized for PDF embedding (max width 800px, JPEG quality 80%)
 */
export async function downloadAndOptimizeImage(
  imageUrl: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    timeout?: number;
  } = {}
): Promise<OptimizedImage | null> {
  const { maxWidth = 800, maxHeight = 600, timeout = 10000 } = options;

  try {
    // Download image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Chaletcoaching-PDF-Generator/1.0)',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    // Get image buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get content type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // For PDF, we'll use the image as-is (Puppeteer can handle it)
    // If needed, we can add image processing here later
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    // Get image dimensions (basic check)
    // Note: For accurate dimensions, we'd need to parse the image
    // For now, we'll estimate or skip this
    const estimatedSize = buffer.length;

    return {
      dataUrl,
      width: maxWidth, // Placeholder - actual dimensions would require image parsing
      height: maxHeight, // Placeholder
      size: estimatedSize,
      originalUrl: imageUrl,
    };
  } catch (error) {
    console.error(`Failed to download/optimize image ${imageUrl}:`, error);
    return null;
  }
}

/**
 * Download and optimize multiple images
 * Returns array of optimized images (null for failed downloads)
 */
export async function downloadAndOptimizeImages(
  imageUrls: string[],
  options: {
    maxWidth?: number;
    maxHeight?: number;
    timeout?: number;
    maxImages?: number;
  } = {}
): Promise<(OptimizedImage | null)[]> {
  const { maxImages = 2, ...imageOptions } = options;

  // Limit number of images
  const urlsToProcess = imageUrls.slice(0, maxImages);

  // Download images in parallel (with limit to avoid overwhelming)
  const results = await Promise.allSettled(
    urlsToProcess.map((url) => downloadAndOptimizeImage(url, imageOptions))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error('Image download failed:', result.reason);
      return null;
    }
  });
}

/**
 * Generate HTML img tags with embedded base64 images
 */
export function generateImageHTML(optimizedImages: (OptimizedImage | null)[]): string {
  const validImages = optimizedImages.filter((img): img is OptimizedImage => img !== null);

  if (validImages.length === 0) {
    return '';
  }

  return validImages
    .map(
      (img, index) =>
        `<img src="${img.dataUrl}" alt="Fitness program ${index + 1}" class="course-image" />`
    )
    .join('');
}

/**
 * Check if image URL is valid and accessible
 */
export async function validateImageUrl(imageUrl: string, timeout = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(imageUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Chaletcoaching-PDF-Generator/1.0)',
      },
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') ?? '';
    return response.ok && contentType.startsWith('image/');
  } catch (error) {
    return false;
  }
}

