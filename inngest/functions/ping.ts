import { inngest } from "../client";

type PingEvent = {
  name: "test/ping";
  data?: {
    note?: string;
  };
};

// Simple text function to verify Inngest wiring
export const ping = inngest.createFunction(
  { id: "test-ping", name: "Test Ping" },
  { event: "test/ping" },
  async ({ event, step }) => {
    const now = new Date().toISOString();

    await step.run("log-ping", async () => {
      console.log("[Inngest ping] received", { at: now, data: event.data ?? null });
    });

    return {
      ok: true,
      receivedAt: now,
      echo: event.data ?? null,
      message: "pong",
    };
  }
);

