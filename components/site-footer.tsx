"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/client";
import { THEME } from "@/lib/theme";

interface SiteFooterProps {
  onNavigate?: (page: string) => void;
}

export default function SiteFooter({ onNavigate }: SiteFooterProps) {
  const tFooter = useTranslations("footer");

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      return;
    }

    window.location.href = `/${page}`;
  };

  return (
    <footer
      className="border-t py-8 text-sm"
      style={{ borderColor: THEME.cardBorder }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 grid gap-8 text-center md:grid-cols-4 md:text-left">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <Image
                src="/logo.webp"
                alt="Chalet Coaching"
                width={28}
                height={28}
                className="h-7 w-7"
                priority
              />
              <div className="font-extrabold tracking-tight">
                Chalet<span style={{ color: THEME.accent }}>coaching</span>
              </div>
            </div>
            <div className="space-y-1 text-sm opacity-80">
              <div>CHALET AQUARIUS LTD</div>
              <div>
                {tFooter("companyNumber")}: 15587263
              </div>
              <div>20 Wenlock Road, London, England, N1 7GU</div>
              <div>
                {tFooter("email")}:{" "}
                <a
                  href="mailto:info@chaletcoaching.co.uk"
                  className="underline"
                >
                  info@chaletcoaching.co.uk
                </a>
              </div>
              <div>{tFooter("phone")}: +44 7782 358363</div>
            </div>
          </div>

          <div>
            <div className="mb-2 font-semibold">{tFooter("company")}</div>
            <ul className="space-y-1 text-sm opacity-85">
              <li>
                <a
                  href="/about"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("about");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("about")}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("contact");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("contact")}
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("faq");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("faq")}
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("support");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("support")}
                </a>
              </li>
              <li>
                <a
                  href="/trust-safety"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("trust-safety");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("trustSafety")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-2 font-semibold">{tFooter("links")}</div>
            <ul className="space-y-1 text-sm opacity-85">
              <li>
                <Link
                  href="/coaches"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("coaches");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("coaches")}
                </Link>
              </li>
              <li>
                <a
                  href="/generator"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("generator");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("courses")}
                </a>
              </li>
              <li>
                <a
                  href="/how-it-works"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("how-it-works");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("howItWorks")}
                </a>
              </li>
              <li>
                <a
                  href="/payments-tokens"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("payments-tokens");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("paymentsTokens")}
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("pricing");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("pricing")}
                </a>
              </li>
              <li>
                <a
                  href="/what-you-receive"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("what-you-receive");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("whatYouReceive")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-2 font-semibold">{tFooter("policies")}</div>
            <ul className="space-y-1 text-sm opacity-85">
              <li>
                <a
                  href="/legal/refunds"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("legal/refunds");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("refundPolicy")}
                </a>
              </li>
              <li>
                <a
                  href="/legal/privacy"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("legal/privacy");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("privacyPolicy")}
                </a>
              </li>
              <li>
                <a
                  href="/legal/terms"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("legal/terms");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("terms")}
                </a>
              </li>
              <li>
                <a
                  href="/legal/cookies"
                  onClick={(event) => {
                    event.preventDefault();
                    handleNavigate("legal/cookies");
                  }}
                  className="hover:opacity-100"
                >
                  {tFooter("cookies")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 border-t pt-6 md:flex-row"
          style={{ borderColor: THEME.cardBorder }}
        >
          <div className="text-center text-sm opacity-80 md:text-left">
            {tFooter("copyright")}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/visa-logo.svg"
                alt={tFooter("visaAlt")}
                width={48}
                height={24}
                className="h-6 w-auto opacity-80 transition-opacity hover:opacity-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/images/mastercard-logo.svg"
                alt={tFooter("mastercardAlt")}
                width={48}
                height={24}
                className="h-6 w-auto opacity-80 transition-opacity hover:opacity-100"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
