import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/test/inngest
 * 
 * Тестовый endpoint для проверки связи с Inngest.
 * Отправляет событие test/connection в очередь Inngest.
 * 
 * Body (опционально):
 * {
 *   "message": "Test message",
 *   "userId": "user-id",
 *   "testSteps": true
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { message, userId, testSteps } = body;

    console.log("🧪 [Test Inngest] Received test request", {
      message,
      userId,
      testSteps,
    });

    // Отправляем событие в Inngest
    const eventId = await inngest.send({
      name: "test/connection",
      data: {
        message: message || "Test connection from API",
        userId: userId || "test-user",
        testSteps: testSteps ?? true,
      },
    });

    console.log("✅ [Test Inngest] Event sent successfully", { eventId });

    return NextResponse.json(
      {
        success: true,
        message: "Test event sent to Inngest",
        eventId,
        event: {
          name: "test/connection",
          data: {
            message: message || "Test connection from API",
            userId: userId || "test-user",
            testSteps: testSteps ?? true,
          },
        },
        instructions: {
          checkDashboard: "Go to Inngest Dashboard → Events to see the event",
          checkFunction: "Go to Inngest Dashboard → Functions → test-connection to see the run",
          checkLogs: "Open the run in Inngest Dashboard to see step-by-step logs",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ [Test Inngest] Error sending event:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test event to Inngest",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test/inngest
 * 
 * Возвращает информацию о тестовом endpoint.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/test/inngest",
    method: "POST",
    description: "Test endpoint for Inngest connection",
    usage: {
      curl: `curl -X POST https://your-domain.vercel.app/api/test/inngest \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Test message", "userId": "user-123"}'`,
      example: {
        message: "Test message",
        userId: "user-123",
        testSteps: true,
      },
    },
    response: {
      success: true,
      eventId: "event-id",
      event: {
        name: "test/connection",
        data: { /* your data */ },
      },
    },
  });
}

