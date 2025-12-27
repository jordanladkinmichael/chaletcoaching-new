"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Card, CardContent, H1, Paragraph, Button, Input } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import { THEME } from "@/lib/theme";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      if (result?.ok) {
        router.push(returnTo);
        return;
      }

      setError("Something went wrong. Please try again.");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Build links with returnTo preserved
  const signUpLink = returnTo !== "/dashboard" 
    ? `/auth/sign-up?returnTo=${encodeURIComponent(returnTo)}`
    : "/auth/sign-up";
  
  const resetLink = returnTo !== "/dashboard"
    ? `/auth/reset-password?returnTo=${encodeURIComponent(returnTo)}`
    : "/auth/reset-password";

  return (
    <AuthShell title="Sign in">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <H1>Sign in</H1>
          <Paragraph className="mt-2 text-text-muted">
            Use your email to sign in to your account.
          </Paragraph>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={loading}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                disabled={loading}
              >
                Sign in
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              <div>
                <Link
                  href={signUpLink}
                  className="text-primary hover:opacity-80 transition-opacity underline"
                >
                  Create an account
                </Link>
              </div>
              <div>
                <Link
                  href={resetLink}
                  className="text-text-muted hover:text-text transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

