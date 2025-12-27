"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Card, CardContent, H1, Paragraph, Button, Input } from "@/components/ui";
import { AlertCircle, CheckCircle } from "lucide-react";
import { THEME } from "@/lib/theme";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("returnTo");
  const tokenParam = searchParams.get("token");
  const emailParam = searchParams.get("email");

  // Determine which state we're in
  const isSettingPassword = !!(tokenParam && emailParam);

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  // Handle setting new password
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          token: tokenParam,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      // Redirect to sign-in after 2 seconds
      setTimeout(() => {
        const signInUrl = returnTo
          ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
          : "/auth/sign-in";
        router.push(signInUrl);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle requesting reset link
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to request reset link");
      }

      setSuccess(true);
      // In dev mode, show the link
      if (data.devResetLink) {
        setDevResetLink(data.devResetLink);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Build sign-in link with returnTo preserved
  const signInLink = returnTo
    ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
    : "/auth/sign-in";

  return (
    <AuthShell title={isSettingPassword ? "Set a new password" : "Reset your password"}>
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <H1>{isSettingPassword ? "Set a new password" : "Reset your password"}</H1>
          <Paragraph className="mt-2 text-text-muted">
            {isSettingPassword
              ? "Enter your new password below."
              : "We'll email you a link to set a new password."}
          </Paragraph>
        </div>

        <Card>
          <CardContent className="p-6">
            {isSettingPassword ? (
              // State B: Set new password
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email
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
                  <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                    New password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                    Confirm new password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>

                {error && (
                  <div
                    className="flex items-start gap-2 p-3 rounded-lg border"
                    style={{
                      backgroundColor: `${THEME.danger}10`,
                      borderColor: THEME.danger,
                    }}
                  >
                    <AlertCircle size={18} style={{ color: THEME.danger }} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: THEME.danger }}>
                      {error}
                    </p>
                  </div>
                )}

                {success && (
                  <div
                    className="flex items-start gap-2 p-3 rounded-lg border"
                    style={{
                      backgroundColor: `${THEME.success}10`,
                      borderColor: THEME.success,
                    }}
                  >
                    <CheckCircle size={18} style={{ color: THEME.success }} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm" style={{ color: THEME.success }}>
                      Password updated successfully! Redirecting to sign in...
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={loading}
                  disabled={loading || success}
                >
                  Update password
                </Button>
              </form>
            ) : (
              // State A: Request reset link
              <>
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading || success}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>

                  {error && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-lg border"
                      style={{
                        backgroundColor: `${THEME.danger}10`,
                        borderColor: THEME.danger,
                      }}
                    >
                      <AlertCircle size={18} style={{ color: THEME.danger }} className="flex-shrink-0 mt-0.5" />
                      <p className="text-sm" style={{ color: THEME.danger }}>
                        {error}
                      </p>
                    </div>
                  )}

                  {success && (
                    <div
                      className="flex items-start gap-2 p-3 rounded-lg border"
                      style={{
                        backgroundColor: `${THEME.success}10`,
                        borderColor: THEME.success,
                      }}
                    >
                      <CheckCircle size={18} style={{ color: THEME.success }} className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: THEME.success }}>
                          If the email exists, we sent a link to reset your password.
                        </p>
                        {devResetLink && (
                          <div className="mt-2 p-2 rounded bg-surface text-xs break-all">
                            <p className="text-text-muted mb-1">Dev mode reset link:</p>
                            <a
                              href={devResetLink}
                              className="text-primary underline break-all"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {devResetLink}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={loading}
                    disabled={loading || success}
                  >
                    Send reset link
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <Link
                    href={signInLink}
                    className="text-primary hover:opacity-80 transition-opacity underline"
                  >
                    Back to sign in
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

