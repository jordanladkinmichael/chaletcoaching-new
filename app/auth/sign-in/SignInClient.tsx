"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import type { Route } from "next";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, CardContent, H1, Input, Paragraph } from "@/components/ui";
import { useTranslations } from "@/lib/i18n/client";
import { THEME } from "@/lib/theme";

export default function SignInClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(tAuth("invalidCredentials"));
        return;
      }

      if (result?.ok) {
        router.push(returnTo as Route);
        return;
      }

      setError(tAuth("somethingWentWrong"));
    } catch {
      setError(tAuth("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const signUpLink =
    returnTo !== "/dashboard"
      ? `/auth/sign-up?returnTo=${encodeURIComponent(returnTo)}`
      : "/auth/sign-up";

  const resetLink =
    returnTo !== "/dashboard"
      ? `/auth/reset-password?returnTo=${encodeURIComponent(returnTo)}`
      : "/auth/reset-password";

  return (
    <AuthShell title={tAuth("signInTitle")}>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <H1>{tAuth("signInTitle")}</H1>
          <Paragraph className="mt-2 text-text-muted">
            {tAuth("signInSubtitle")}
          </Paragraph>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={loading}
                  placeholder={tAuth("placeholderEmail")}
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {tAuth("password")}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                  placeholder={tAuth("placeholderPassword")}
                  autoComplete="current-password"
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

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                disabled={loading}
              >
                {tAuth("signInAction")}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <div>
                <Link
                  href={signUpLink as Route}
                  className="text-primary underline transition-opacity hover:opacity-80"
                >
                  {tAuth("createAccountLink")}
                </Link>
              </div>
              <div>
                <Link
                  href={resetLink as Route}
                  className="text-text-muted transition-colors hover:text-text"
                >
                  {tAuth("forgotPassword")}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
