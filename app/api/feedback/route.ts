import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  console.log("=== FEEDBACK API CALLED ===");
  try {
    const { name, email, message, page } = await req.json();
    console.log("Received data:", { name, email, message, page });

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Отправляем письмо через Resend
    const { data, error } = await resend.emails.send({
      from: "Chaletcoaching Contact Form <info@chaletcoaching.co.uk>",
      to: ["info@chaletcoaching.co.uk"],
      replyTo: email,
      subject: `Новое сообщение с сайта - ${page}`,
      html: `
        <h3>Новое сообщение с сайта</h3>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Страница:</strong> ${page}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message}</p>
        <hr>
        <p><em>Для ответа используйте: ${email}</em></p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data);
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}