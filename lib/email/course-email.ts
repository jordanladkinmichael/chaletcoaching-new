/**
 * Email utilities for sending course PDFs to users
 */

import { Resend } from "resend";
import { prisma } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendCourseEmailOptions {
  courseId: string;
  userId: string;
  pdfBuffer: Buffer;
  courseTitle: string;
  createdAt: Date;
  options?: {
    weeks?: number;
    sessionsPerWeek?: number;
    workoutTypes?: string[];
    targetMuscles?: string[];
  };
}

/**
 * Generate HTML email template for course delivery
 */
function generateCourseEmailHTML(options: {
  courseTitle: string;
  userName?: string;
  createdAt: Date;
  dashboardUrl: string;
  weeks?: number;
  sessionsPerWeek?: number;
}): string {
  const { courseTitle, userName, createdAt, dashboardUrl, weeks, sessionsPerWeek } = options;
  const formattedDate = createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Fitness Course is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Your Fitness Course is Ready!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${userName ? `Hi ${userName},` : "Hi there,"}
              </p>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Great news! Your personalized fitness course has been generated and is ready for you.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 10px 0; color: #333333; font-size: 20px; font-weight: 600;">${courseTitle}</h2>
                <p style="margin: 5px 0; color: #666666; font-size: 14px;">
                  <strong>Created:</strong> ${formattedDate}
                </p>
                ${weeks ? `<p style="margin: 5px 0; color: #666666; font-size: 14px;"><strong>Duration:</strong> ${weeks} weeks</p>` : ""}
                ${sessionsPerWeek ? `<p style="margin: 5px 0; color: #666666; font-size: 14px;"><strong>Sessions per week:</strong> ${sessionsPerWeek}</p>` : ""}
              </div>
              
              <p style="margin: 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Your complete course PDF is attached to this email. You can also access it anytime from your dashboard.
              </p>
              
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View in Dashboard</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                If you have any questions or need support, feel free to reach out to us.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                <strong>Chaletcoaching</strong>
              </p>
              <p style="margin: 0 0 10px 0; color: #999999; font-size: 12px;">
                Your personalized fitness journey starts here
              </p>
              <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px;">
                <a href="mailto:info@chaletcoaching.co.uk" style="color: #667eea; text-decoration: none;">info@chaletcoaching.co.uk</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Send course PDF to user's email
 * @returns true if email was sent successfully, false otherwise
 */
export async function sendCourseEmail(options: SendCourseEmailOptions): Promise<boolean> {
  const { courseId, userId, pdfBuffer, courseTitle, createdAt, options: courseOptions } = options;

  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn("[Course Email] RESEND_API_KEY is not configured, skipping email send");
      return false;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "Chaletcoaching <info@chaletcoaching.co.uk>";
    
    // Get user email from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user || !user.email) {
      console.warn(`[Course Email] User ${userId} does not have an email address, skipping email send`);
      return false;
    }

    // Generate dashboard URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.chaletcoaching.co.uk";
    const dashboardUrl = `${baseUrl}/dashboard`;

    // Generate email HTML
    const emailHTML = generateCourseEmailHTML({
      courseTitle,
      userName: user.name || undefined,
      createdAt,
      dashboardUrl,
      weeks: courseOptions?.weeks,
      sessionsPerWeek: courseOptions?.sessionsPerWeek,
    });

    // Generate PDF filename
    const pdfFilename = `course-${courseId}-${Date.now()}.pdf`;

    // Send email with PDF attachment
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: user.email,
      subject: `Your Fitness Course: ${courseTitle}`,
      html: emailHTML,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    if (error) {
      console.error(`[Course Email] Failed to send email to ${user.email}:`, error);
      return false;
    }

    console.log(`[Course Email] Successfully sent course ${courseId} to ${user.email}`, data?.id);
    return true;
  } catch (error) {
    console.error(`[Course Email] Error sending course email for course ${courseId}:`, error);
    return false;
  }
}
