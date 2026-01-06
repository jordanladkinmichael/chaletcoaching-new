import { inngest } from "../client";

// Типы для события
type TestConnectionEvent = {
  name: "test/connection";
  data?: {
    message?: string;
    userId?: string;
    testSteps?: boolean;
  };
};

// Тестовая функция для проверки связи с Inngest
export const testConnection = inngest.createFunction(
  {
    id: "test-connection",
    name: "Test Inngest Connection",
    retries: 1, // 1 попытка при ошибке
  },
  { event: "test/connection" },
  async ({ event, step }) => {
    const startTime = new Date().toISOString();

    // Шаг 1: Валидация входных данных
    const validatedData = await step.run("validate-input", async () => {
      console.log("[Test Connection] Step 1: Validating input data");
      const data = event.data ?? {};
      
      return {
        message: data.message || "Default test message",
        userId: data.userId || "anonymous",
        testSteps: data.testSteps ?? true,
        receivedAt: startTime,
      };
    });

    // Шаг 2: Обработка данных
    const processedData = await step.run("process-data", async () => {
      console.log("[Test Connection] Step 2: Processing data");
      
      // Имитация обработки данных
      const processed = {
        ...validatedData,
        processedAt: new Date().toISOString(),
        status: "processed",
        stepsCompleted: validatedData.testSteps ? 2 : 1,
      };
      
      return processed;
    });

    // Шаг 3: Логирование результатов
    await step.run("log-results", async () => {
      console.log("[Test Connection] Step 3: Logging results");
      console.log("[Test Connection] Full data:", JSON.stringify(processedData, null, 2));
    });

    // Шаг 4: Возврат результата
    const result = await step.run("return-response", async () => {
      console.log("[Test Connection] Step 4: Preparing response");
      
      const endTime = new Date().toISOString();
      const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
      
      return {
        success: true,
        message: "Inngest connection test completed successfully",
        data: processedData,
        execution: {
          startedAt: startTime,
          completedAt: endTime,
          durationMs: duration,
        },
        steps: {
          total: 4,
          completed: 4,
          status: "all_completed",
        },
      };
    });

    return result;
  }
);

