/**
 * Vercel Blob Storage utilities for PDF files
 * Handles upload, retrieval, and deletion of PDF files
 */

import { put, del, head } from "@vercel/blob";

export interface BlobUploadResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Upload PDF buffer to Vercel Blob Storage
 * @param buffer - PDF file buffer
 * @param filename - Filename for the PDF (e.g., "course-{courseId}.pdf")
 * @returns Blob URL and metadata
 */
export async function uploadPDF(
  buffer: Buffer,
  filename: string
): Promise<BlobUploadResult> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "application/pdf",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const uploadedAt = new Date();

    return {
      url: blob.url,
      pathname: blob.pathname,
      size: buffer.length,
      uploadedAt,
    };
  } catch (error) {
    console.error("Failed to upload PDF to Blob Storage:", error);
    throw new Error(
      `PDF upload failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Delete PDF from Vercel Blob Storage
 * @param url - Blob URL to delete
 */
export async function deletePDF(url: string): Promise<void> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error("Failed to delete PDF from Blob Storage:", error);
    // Don't throw - deletion is not critical for functionality
  }
}

/**
 * Check if PDF exists in Blob Storage
 * @param url - Blob URL to check
 * @returns true if exists, false otherwise
 */
export async function pdfExists(url: string): Promise<boolean> {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return false;
    }

    await head(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate filename for course PDF
 * @param courseId - Course ID
 * @returns Filename string
 */
export function generatePDFFilename(courseId: string): string {
  return `courses/${courseId}/course-${courseId}-${Date.now()}.pdf`;
}

