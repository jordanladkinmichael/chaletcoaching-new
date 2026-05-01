"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import type { Route } from "next";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button, Card, CardContent, H1, Input, Paragraph } from "@/components/ui";
import { COUNTRIES } from "@/lib/countries";
import { useTranslations } from "@/lib/i18n/client";
import { THEME } from "@/lib/theme";

export default function SignUpClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const inputClass =
    "w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-focus";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError(tAuth("nameRequired"));
      return;
    }

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
          setError(tAuth("existingAccount"));
          return;
        }

        throw new Error(registerData.error || tAuth("somethingWentWrong"));
      }

      const signInResult = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(tAuth("signInAfterRegisterFailed"));
        return;
      }

      if (signInResult?.ok) {
        router.push(returnTo as Route);
        return;
      }

      setError(tAuth("accountCreatedButIssue"));
    } catch (err) {
      setError(err instanceof Error ? err.message : tAuth("unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  const signInLink =
    returnTo !== "/dashboard"
      ? `/auth/sign-in?returnTo=${encodeURIComponent(returnTo)}`
      : "/auth/sign-in";

  return (
    <AuthShell title={tAuth("createAccountTitle")}>
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <H1>{tAuth("createAccountTitle")}</H1>
          <Paragraph className="mt-2 text-text-muted">
            {tAuth("createAccountSubtitle")}
          </Paragraph>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    {tAuth("firstName")} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    disabled={loading}
                    placeholder={tAuth("placeholderFirstName")}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    {tAuth("lastName")} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    disabled={loading}
                    placeholder={tAuth("placeholderLastName")}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  {tAuth("email")} <span className="text-red-500">*</span>
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
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                  {tAuth("phoneNumber")}
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={loading}
                  placeholder={tAuth("placeholderPhone")}
                  autoComplete="tel"
                />
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {tAuth("dateOfBirth")}
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  disabled={loading}
                  className={inputClass}
                  style={{ borderColor: THEME.border }}
                  autoComplete="bday"
                />
              </div>

              <fieldset className="space-y-3">
                <legend className="mb-1 text-sm font-medium">
                  {tAuth("address")}
                </legend>

                <div>
                  <label htmlFor="street" className="sr-only">
                    {tAuth("streetAddress")}
                  </label>
                  <Input
                    id="street"
                    type="text"
                    value={street}
                    onChange={(event) => setStreet(event.target.value)}
                    disabled={loading}
                    placeholder={tAuth("streetAddress")}
                    autoComplete="street-address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="sr-only">
                      {tAuth("city")}
                    </label>
                    <Input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      disabled={loading}
                      placeholder={tAuth("city")}
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="sr-only">
                      {tAuth("postalCode")}
                    </label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                      disabled={loading}
                      placeholder={tAuth("postalCode")}
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="sr-only">
                    {tAuth("country")}
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    disabled={loading}
                    className={inputClass}
                    style={{ borderColor: THEME.border }}
                    autoComplete="country-name"
                  >
                    <option value="">{tAuth("selectCountry")}</option>
                    {COUNTRIES.map((countryOption) => (
                      <option key={countryOption.value} value={countryOption.value}>
                        {countryOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium"
                >
                  {tAuth("password")} <span className="text-red-500">*</span>
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
                  {tAuth("confirmPassword")} <span className="text-red-500">*</span>
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
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: THEME.danger }}>
                      {error}
                    </p>
                    {error === tAuth("existingAccount") ? (
                      <Link
                        href={signInLink as Route}
                        className="mt-1 block text-sm underline"
                        style={{ color: THEME.primary }}
                      >
                        {tAuth("signInInstead")}
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={agreedToTerms}
                  onChange={(event) => setAgreedToTerms(event.target.checked)}
                  disabled={loading}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-border bg-surface text-primary focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ borderColor: THEME.cardBorder }}
                />
                <label
                  htmlFor="terms-checkbox"
                  className="text-sm"
                  style={{ color: THEME.text }}
                >
                  {tAuth("termsAgreementPrefix")}{" "}
                  <Link
                    href="/legal/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline transition-opacity hover:opacity-80"
                    style={{ color: THEME.primary }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {tAuth("termsAgreementLink")}
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
                {tAuth("createAccountAction")}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-text-muted">{tAuth("alreadyHaveAccount")} </span>
              <Link
                href={signInLink as Route}
                className="text-primary underline transition-opacity hover:opacity-80"
              >
                {tAuth("signInAction")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthShell>
  );
}
