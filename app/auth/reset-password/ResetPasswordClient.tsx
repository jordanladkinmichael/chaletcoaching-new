"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { AlertCircle, CheckCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, CardContent, H1, Input, Paragraph } from "@/components/ui";
import { useTranslations } from "@/lib/i18n/client";
import { THEME } from "@/lib/theme";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const returnTo = searchParams.get("returnTo");
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const isSettingPassword = !!(tokenParam && emailParam);

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const handleSetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(tAuth("passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(tAuth("passwordsMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          token: tokenParam,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || tAuth("resetPasswordFailed"));
      }

      setSuccess(true);
      setTimeout(() => {
        const signInUrl = returnTo
          ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
          : "/auth/sign-in";
        router.push(signInUrl as Route);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : tAuth("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || tAuth("requestResetFailed"));
      }

      setSuccess(true);
      if (data.devResetLink) {
        setDevResetLink(data.devResetLink);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tAuth("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const signInLink = returnTo
    ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
    : "/auth/sign-in";

  return (
    <AuthShell
      title={isSettingPassword ? tAuth("setPasswordTitle") : tAuth("resetPasswordTitle")}
    >
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <H1>
            {isSettingPassword ? tAuth("setPasswordTitle") : tAuth("resetPasswordTitle")}
          </H1>
          <Paragraph className="mt-2 text-text-muted">
            {isSettingPassword
              ? tAuth("setPasswordSubtitle")
              : tAuth("resetPasswordSubtitle")}
          </Paragraph>
        </div>

        <Card>
          <CardContent className="p-6">
            {isSettingPassword ? (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                    {tAuth("email")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    {tAuth("newPassword")}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={loading}
                    placeholder={tAuth("placeholderPasswordShort")}
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    {tAuth("confirmNewPassword")}
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    disabled={loading}
                    placeholder={tAuth("placeholderPasswordRepeat")}
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                {error ? (
                  <div
                    className="flex items-start gap-2 rounded-lg border p-3"
                    style={{
                      backgroundColor: `${THEME.danger}10`,
                      borderColor: THEME.danger,
                    }}
                  >
                    <AlertCircle
                      size={18}
                      style={{ color: THEME.danger }}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <p className="text-sm" style={{ color: THEME.danger }}>
                      {error}
                    </p>
                  </div>
                ) : null}

                {success ? (
                  <div
                    className="flex items-start gap-2 rounded-lg border p-3"
                    style={{
                      backgroundColor: `${THEME.success}10`,
                      borderColor: THEME.success,
                    }}
                  >
                    <CheckCircle
                      size={18}
                      style={{ color: THEME.success }}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <p className="text-sm" style={{ color: THEME.success }}>
                      {tAuth("passwordUpdated")}
                    </p>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                  disabled={loading || success}
                >
                  {tAuth("updatePassword")}
                </Button>
              </form>
            ) : (
              <>
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      {tAuth("email")}
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      disabled={loading || success}
                      placeholder={tAuth("placeholderEmail")}
                      autoComplete="email"
                    />
                  </div>

                  {error ? (
                    <div
                      className="flex items-start gap-2 rounded-lg border p-3"
                      style={{
                        backgroundColor: `${THEME.danger}10`,
                        borderColor: THEME.danger,
                      }}
                    >
                      <AlertCircle
                        size={18}
                        style={{ color: THEME.danger }}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm" style={{ color: THEME.danger }}>
                        {error}
                      </p>
                    </div>
                  ) : null}

                  {success ? (
                    <div
                      className="flex items-start gap-2 rounded-lg border p-3"
                      style={{
                        backgroundColor: `${THEME.success}10`,
                        borderColor: THEME.success,
                      }}
                    >
                      <CheckCircle
                        size={18}
                        style={{ color: THEME.success }}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: THEME.success }}>
                          {tAuth("resetLinkSent")}
                        </p>
                        {devResetLink ? (
                          <div className="mt-2 rounded bg-surface p-2 text-xs break-all">
                            <p className="mb-1 text-text-muted">
                              {tAuth("devResetLink")}
                            </p>
                            <a
                              href={devResetLink}
                              className="text-primary underline break-all"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {devResetLink}
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={loading}
                    disabled={loading || success}
                  >
                    {tAuth("sendResetLink")}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <Link
                    href={signInLink as Route}
                    className="text-primary underline transition-opacity hover:opacity-80"
                  >
                    {tAuth("backToSignIn")}
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
