// app/contact/ContactForm.tsx
"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle } from "lucide-react";
import { z } from "zod";
import { Button, Select } from "@/components/ui";
import { useLocale } from "@/lib/i18n/client";
import { getPublicPagesCopy } from "@/lib/public-pages-copy";
import { THEME } from "@/lib/theme";

export default function ContactForm() {
  const { locale } = useLocale();
  const copy = getPublicPagesCopy(locale).contactForm;
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const schema = React.useMemo(
    () =>
      z.object({
        name: z.string().min(2, copy.validation.name),
        email: z.string().email(copy.validation.email),
        topic: z.string().min(1, copy.validation.topic),
        message: z.string().min(20, copy.validation.message),
        companyWebsite: z.string().max(0, copy.validation.invalid),
      }),
    [copy.validation]
  );

  const topicOptions = React.useMemo(
    () => copy.topics.map(([value, label]) => ({ value, label })),
    [copy.topics]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = schema.safeParse({ name, email, topic, message, companyWebsite });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? copy.validation.invalid);
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
        throw new Error(response.error ?? copy.errors.failed);
      }

      if (response.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setTopic("");
        setMessage("");
        setCompanyWebsite("");
      } else {
        throw new Error(response.error ?? copy.errors.failed);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : copy.errors.generic;
      setError(
        errorMessage.includes("429")
          ? copy.errors.rateLimit
          : errorMessage.includes("Failed") || errorMessage === copy.errors.failed
            ? `${copy.errors.failed}. ${copy.errors.failedWithEmail}`
            : errorMessage || copy.errors.generic
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={onSubmit}>
      <div style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}>
        <label htmlFor="companyWebsite">{copy.labels.honeypot}</label>
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
          {copy.labels.name}
        </label>
        <input
          id="name"
          type="text"
          className="w-full rounded-lg border px-3 py-2 bg-transparent text-sm"
          style={{ borderColor: THEME.cardBorder }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={copy.placeholders.name}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs opacity-70 mb-1">
          {copy.labels.email}
        </label>
        <input
          id="email"
          type="email"
          className="w-full rounded-lg border px-3 py-2 bg-transparent text-sm"
          style={{ borderColor: THEME.cardBorder }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.placeholders.email}
          required
        />
      </div>

      <div>
        <label htmlFor="topic" className="block text-xs opacity-70 mb-1">
          {copy.labels.topic}
        </label>
        <Select id="topic" options={topicOptions} value={topic} onChange={(e) => setTopic(e.target.value)} required />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs opacity-70 mb-1">
          {copy.labels.message}
        </label>
        <textarea
          id="message"
          className="w-full rounded-lg border px-3 py-2 bg-transparent min-h-[120px] text-sm resize-y"
          style={{ borderColor: THEME.cardBorder }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={copy.placeholders.message}
          required
        />
      </div>

      {success && (
        <div
          className="rounded-lg p-4 flex items-start gap-3"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.2)" }}
        >
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-green-400 text-sm mb-1">{copy.states.successTitle}</div>
            <div className="text-sm" style={{ color: "rgba(34, 197, 94, 0.9)" }}>
              {copy.states.successBody}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div
          className="rounded-lg p-4 flex items-start gap-3"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-red-400 text-sm mb-1">{copy.states.errorTitle}</div>
            <div className="text-sm" style={{ color: "rgba(239, 68, 68, 0.9)" }}>
              {error}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" variant="primary" disabled={loading} className="flex-1 sm:flex-none">
          {loading ? copy.states.sending : copy.states.submit}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/faq">{copy.states.faq}</Link>
        </Button>
      </div>
    </form>
  );
}
