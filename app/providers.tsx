"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const noisyMessages = [
      "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received",
      "The message port closed before a response was received",
    ];

    const isIgnoredBrowserNoise = (value: unknown): boolean => {
      const message =
        typeof value === "string"
          ? value
          : value instanceof Error
            ? value.message
            : typeof value === "object" &&
                value !== null &&
                "message" in value &&
                typeof (value as { message?: unknown }).message === "string"
              ? ((value as { message: string }).message)
              : "";

      return noisyMessages.some((item) => message.includes(item));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isIgnoredBrowserNoise(event.reason)) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (isIgnoredBrowserNoise(event.error) || isIgnoredBrowserNoise(event.message)) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
