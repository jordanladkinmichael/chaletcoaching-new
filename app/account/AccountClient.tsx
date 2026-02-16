"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { Card, Container, H1, Paragraph, Button, Input } from "@/components/ui";
import { useCurrencyStore } from "@/lib/stores/currency-store";
import { COUNTRIES } from "@/lib/countries";
import { THEME } from "@/lib/theme";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { Route } from "next";

type Region = "EU" | "UK" | "US";

interface ProfileData {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  street: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
}

export default function AccountClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currency } = useCurrencyStore();
  const region: Region =
    currency === "USD" ? "US" : currency === "GBP" ? "UK" : "EU";

  // Profile state
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Load profile
  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data: ProfileData = await res.json();
      setProfile(data);

      // Populate form fields
      setFirstName(data.firstName ?? "");
      setLastName(data.lastName ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setDateOfBirth(
        data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString().split("T")[0]
          : ""
      );
      setStreet(data.street ?? "");
      setCity(data.city ?? "");
      setCountry(data.country ?? "");
      setPostalCode(data.postalCode ?? "");
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      void loadProfile();
    }
  }, [session, loadProfile]);

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileSaving(true);

    try {
      const body: Record<string, string | undefined> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        street: street.trim() || undefined,
        city: city.trim() || undefined,
        country: country || undefined,
        postalCode: postalCode.trim() || undefined,
      };

      // Include email only if changed
      if (email.trim().toLowerCase() !== (profile?.email ?? "").toLowerCase()) {
        body.email = email.trim();
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      await loadProfile();
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to save profile"
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const setRegion = (newRegion: Region) => {
    const currencyMap: Record<Region, "EUR" | "GBP" | "USD"> = {
      EU: "EUR",
      UK: "GBP",
      US: "USD",
    };
    useCurrencyStore.getState().setCurrency(currencyMap[newRegion]);
  };

  const handleNavigate = (page: string) => {
    const target =
      page === "home" ? "/" : page.startsWith("/") ? page : `/${page}`;
    router.push(target as Route);
  };

  const inputClass =
    "w-full rounded-lg border px-3 py-2 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-focus";

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <SiteHeader
        onNavigate={handleNavigate}
        region={region}
        setRegion={setRegion}
        balance={null}
        balanceLoading={false}
      />
      <main className="flex-1 py-8 md:py-12">
        <Container>
          <div className="space-y-8 max-w-2xl">
            <H1>Account Settings</H1>

            {profileLoading ? (
              <Card>
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
                  <span className="ml-2 text-text-muted">
                    Loading profile...
                  </span>
                </div>
              </Card>
            ) : (
              <>
                {/* Profile Section */}
                <Card>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <h2 className="text-lg font-semibold mb-4">
                      Personal Information
                    </h2>

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="acc-firstName"
                          className="block text-sm font-medium mb-1.5"
                        >
                          First name
                        </label>
                        <Input
                          id="acc-firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={profileSaving}
                          placeholder="John"
                          autoComplete="given-name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="acc-lastName"
                          className="block text-sm font-medium mb-1.5"
                        >
                          Last name
                        </label>
                        <Input
                          id="acc-lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={profileSaving}
                          placeholder="Doe"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="acc-email"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Email
                      </label>
                      <Input
                        id="acc-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={profileSaving}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="acc-phone"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Phone number
                      </label>
                      <Input
                        id="acc-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={profileSaving}
                        placeholder="+44 7700 900000"
                        autoComplete="tel"
                      />
                    </div>

                    {/* Date of birth */}
                    <div>
                      <label
                        htmlFor="acc-dob"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Date of birth
                      </label>
                      <input
                        id="acc-dob"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        disabled={profileSaving}
                        className={inputClass}
                        style={{ borderColor: THEME.border }}
                        autoComplete="bday"
                      />
                    </div>

                    {/* Address */}
                    <fieldset className="space-y-3">
                      <legend className="text-sm font-medium mb-1">
                        Address
                      </legend>

                      <Input
                        id="acc-street"
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        disabled={profileSaving}
                        placeholder="Street address"
                        autoComplete="street-address"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          id="acc-city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={profileSaving}
                          placeholder="City"
                          autoComplete="address-level2"
                        />
                        <Input
                          id="acc-postalCode"
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          disabled={profileSaving}
                          placeholder="Postal code"
                          autoComplete="postal-code"
                        />
                      </div>

                      <select
                        id="acc-country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        disabled={profileSaving}
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
                    </fieldset>

                    {/* Status messages */}
                    {profileError && (
                      <div
                        className="flex items-center gap-2 p-3 rounded-lg border text-sm"
                        style={{
                          backgroundColor: `${THEME.danger}10`,
                          borderColor: THEME.danger,
                          color: THEME.danger,
                        }}
                      >
                        <AlertCircle size={16} className="flex-shrink-0" />
                        {profileError}
                      </div>
                    )}
                    {profileSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-lg border text-sm bg-green-50 border-green-300 text-green-800">
                        <CheckCircle2 size={16} className="flex-shrink-0" />
                        Profile updated successfully.
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={profileSaving}
                      disabled={profileSaving}
                    >
                      Save changes
                    </Button>
                  </form>
                </Card>

                {/* Password Section */}
                <Card>
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-4"
                  >
                    <h2 className="text-lg font-semibold mb-4">
                      Change Password
                    </h2>

                    <div>
                      <label
                        htmlFor="acc-currentPw"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Current password
                      </label>
                      <Input
                        id="acc-currentPw"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={passwordSaving}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="acc-newPw"
                        className="block text-sm font-medium mb-1.5"
                      >
                        New password
                      </label>
                      <Input
                        id="acc-newPw"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={passwordSaving}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="acc-confirmPw"
                        className="block text-sm font-medium mb-1.5"
                      >
                        Confirm new password
                      </label>
                      <Input
                        id="acc-confirmPw"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        disabled={passwordSaving}
                        placeholder="Re-enter new password"
                        autoComplete="new-password"
                        minLength={6}
                      />
                    </div>

                    {passwordError && (
                      <div
                        className="flex items-center gap-2 p-3 rounded-lg border text-sm"
                        style={{
                          backgroundColor: `${THEME.danger}10`,
                          borderColor: THEME.danger,
                          color: THEME.danger,
                        }}
                      >
                        <AlertCircle size={16} className="flex-shrink-0" />
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-lg border text-sm bg-green-50 border-green-300 text-green-800">
                        <CheckCircle2 size={16} className="flex-shrink-0" />
                        Password changed successfully.
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={passwordSaving}
                      disabled={
                        passwordSaving ||
                        !currentPassword ||
                        !newPassword ||
                        !confirmNewPassword
                      }
                    >
                      Change password
                    </Button>
                  </form>
                </Card>
              </>
            )}
          </div>
        </Container>
      </main>
      <SiteFooter onNavigate={handleNavigate} />
    </div>
  );
}
