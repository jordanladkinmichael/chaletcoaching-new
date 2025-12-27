// app/contact/ContactForm.tsx
"use client";
import React from "react";
import { z } from "zod";
import Link from "next/link";
import { CheckCircle, AlertCircle } from "lucide-react";
import { THEME } from "@/lib/theme";
import { Select, Button } from "@/components/ui";

const Schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  topic: z.string().min(1, "Please select a topic"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  companyWebsite: z.string().max(0, "Invalid input"), // Honeypot
});

const topicOptions = [
  { value: "", label: "Select a topic" },
  { value: "Tokens and billing", label: "Tokens and billing" },
  { value: "Coach requests", label: "Coach requests" },
  { value: "Instant AI generator", label: "Instant AI generator" },
  { value: "Account and dashboard", label: "Account and dashboard" },
  { value: "Partnerships", label: "Partnerships" },
  { value: "Other", label: "Other" },
];

export default function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState(""); // Honeypot
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = Schema.safeParse({ name, email, topic, message, companyWebsite });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          topic: parsed.data.topic,
          message: parsed.data.message,
          companyWebsite: parsed.data.companyWebsite,
        }),
      });

      const response = await r.json().catch(() => ({}));

      if (!r.ok) {
        throw new Error(response.error ?? "Failed to send message");
      }

      if (response.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setTopic("");
        setMessage("");
        setCompanyWebsite("");
      } else {
        throw new Error(response.error ?? "Failed to send message");
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Something went wrong";
      setError(
        errorMessage.includes("429")
          ? "Too many requests. Please try again in 10 minutes or email us directly."
          : errorMessage.includes("Failed")
          ? `${errorMessage} Please try again or email us directly at info@chaletcoaching.co.uk.`
          : errorMessage
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={onSubmit}>
      {/* Honeypot field - hidden from users */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
        <label htmlFor="companyWebsite">Company Website</label>
        <input
          type="text"
          id="companyWebsite"
          name="companyWebsite"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-xs opacity-70 mb-1">
          Full name
        </label>
        <input
          id="name"
          type="text"
          className="w-full rounded-lg border px-3 py-2 bg-transparent text-sm"
          style={{ borderColor: THEME.cardBorder }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs opacity-70 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-lg border px-3 py-2 bg-transparent text-sm"
          style={{ borderColor: THEME.cardBorder }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="topic" className="block text-xs opacity-70 mb-1">
          Topic
        </label>
        <Select
          id="topic"
          options={topicOptions}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs opacity-70 mb-1">
          Message
        </label>
        <textarea
          id="message"
          className="w-full rounded-lg border px-3 py-2 bg-transparent min-h-[120px] text-sm resize-y"
          style={{ borderColor: THEME.cardBorder }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your question or issue..."
          required
        />
      </div>

      {/* Success banner */}
      {success && (
        <div
          className="rounded-lg p-4 flex items-start gap-3"
          style={{
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
          }}
        >
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-green-400 text-sm mb-1">Success</div>
            <div className="text-sm" style={{ color: "rgba(34, 197, 94, 0.9)" }}>
              We received your message. We&apos;ll reply by email.
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          className="rounded-lg p-4 flex items-start gap-3"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-red-400 text-sm mb-1">Error</div>
            <div className="text-sm" style={{ color: "rgba(239, 68, 68, 0.9)" }}>
              {error}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          {loading ? "Sending…" : "Send message"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/faq">Read FAQ</Link>
        </Button>
      </div>
    </form>
  );
}
