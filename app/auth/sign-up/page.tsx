"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Card, CardContent, H1, Paragraph, Button, Input } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import { THEME } from "@/lib/theme";

export default function SignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
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
      // Register user
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const registerData = await registerRes.json().catch(() => ({}));

      if (!registerRes.ok) {
        // Handle email already exists
        if (registerRes.status === 409 || registerData.error?.includes("already")) {
          setError(
            "An account with this email already exists. Please sign in instead."
          );
          return;
        }
        throw new Error(registerData.error || "Registration failed");
      }

      // Auto sign-in after successful registration
      const signInResult = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but sign in failed. Please try signing in manually.");
        return;
      }

      if (signInResult?.ok) {
        router.push(returnTo);
        return;
      }

      setError("Account created but something went wrong. Please try signing in.");
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

  // Build link with returnTo preserved
  const signInLink = returnTo !== "/dashboard"
    ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
    : "/auth/sign-in";

  return (
    <AuthShell title="Create your account">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <H1>Create your account</H1>
          <Paragraph className="mt-2 text-text-muted">
            Sign up to get started with personalized fitness plans.
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
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                  Confirm password
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
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: THEME.danger }}>
                      {error}
                    </p>
                    {error.includes("already exists") && (
                      <Link
                        href={signInLink}
                        className="text-sm underline mt-1 block"
                        style={{ color: THEME.primary }}
                      >
                        Sign in instead
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                disabled={loading}
              >
                Create account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-text-muted">Already have an account? </span>
              <Link
                href={signInLink}
                className="text-primary hover:opacity-80 transition-opacity underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}

