"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Route } from "next";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Card, CardContent, H1, Paragraph, Button, Input } from "@/components/ui";
import { AlertCircle } from "lucide-react";
import { THEME } from "@/lib/theme";
import { COUNTRIES } from "@/lib/countries";

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  // Account fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

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
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          street: street.trim() || undefined,
          city: city.trim() || undefined,
          country: country || undefined,
          postalCode: postalCode.trim() || undefined,
        }),
      });

      const registerData = await registerRes.json().catch(() => ({}));

      if (!registerRes.ok) {
        if (
          registerRes.status === 409 ||
          registerData.error?.includes("already")
        ) {
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
        setError(
          "Account created but sign in failed. Please try signing in manually."
        );
        return;
      }

      if (signInResult?.ok) {
        router.push(returnTo as Route);
        return;
      }

      setError(
        "Account created but something went wrong. Please try signing in."
      );
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
  const signInLink =
    returnTo !== "/dashboard"
      ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
      : "/auth/sign-in";

  const inputClass =
    "w-full rounded-lg border px-3 py-2 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-focus";

  return (
    <AuthShell title="Create your account">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <H1>Create your account</H1>
          <Paragraph className="mt-2 text-text-muted">
            Sign up to get started with personalized fitness plans.
          </Paragraph>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1.5"
                  >
                    First name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="John"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1.5"
                  >
                    Last name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Doe"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email <span className="text-red-500">*</span>
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

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1.5"
                >
                  Phone number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  placeholder="+44 7700 900000"
                  autoComplete="tel"
                />
              </div>

              {/* Date of birth */}
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium mb-1.5"
                >
                  Date of birth
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                  style={{ borderColor: THEME.border }}
                  autoComplete="bday"
                />
              </div>

              {/* Address section */}
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium mb-1">Address</legend>

                <div>
                  <label htmlFor="street" className="sr-only">
                    Street
                  </label>
                  <Input
                    id="street"
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    disabled={loading}
                    placeholder="Street address"
                    autoComplete="street-address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="sr-only">
                      City
                    </label>
                    <Input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={loading}
                      placeholder="City"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="sr-only">
                      Postal code
                    </label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={loading}
                      placeholder="Postal code"
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="sr-only">
                    Country
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={loading}
                    className={inputClass}
                    style={{ borderColor: THEME.border }}
                    autoComplete="country-name"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              {/* Password fields */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                >
                  Password <span className="text-red-500">*</span>
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
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-1.5"
                >
                  Confirm password <span className="text-red-500">*</span>
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
                  <AlertCircle
                    size={18}
                    style={{ color: THEME.danger }}
                    className="flex-shrink-0 mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: THEME.danger }}>
                      {error}
                    </p>
                    {error.includes("already exists") && (
                      <Link
                        href={signInLink as Route}
                        className="text-sm underline mt-1 block"
                        style={{ color: THEME.primary }}
                      >
                        Sign in instead
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Terms and Conditions checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={loading}
                  className="mt-0.5 w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: THEME.cardBorder }}
                />
                <label
                  htmlFor="terms-checkbox"
                  className="text-sm cursor-pointer"
                  style={{ color: THEME.text }}
                >
                  I read and agree to{" "}
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:opacity-80 transition-opacity"
                    style={{ color: THEME.primary }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    terms and conditions
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={loading}
                disabled={
                  loading ||
                  !agreedToTerms ||
                  !email.trim() ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  !password ||
                  !confirmPassword
                }
              >
                Create account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-text-muted">
                Already have an account?{" "}
              </span>
              <Link
                href={signInLink as Route}
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
