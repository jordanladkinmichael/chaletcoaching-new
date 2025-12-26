// app/legal/privacy/page.tsx
import React from "react";
import { Metadata } from "next";
import { THEME } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Privacy Policy — Chaletcoaching",
  description: "Privacy policy and data handling practices for Chaletcoaching",
};

const EFFECTIVE_DATE = "12 August 2025";

// Малая локальная карточка, как в Terms/Refunds
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-5 md:p-6"
      style={{ background: THEME.card, borderColor: THEME.cardBorder }}
    >
      {children}
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8" style={{ color: THEME.text }}>
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1"
             style={{ background: "#19191f", border: `1px solid ${THEME.cardBorder}`, color: THEME.secondary }}>
          Policy
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          Privacy <span style={{ color: THEME.accent }}>Policy</span>
        </h1>
        <p className="opacity-80 text-sm">Effective date: {EFFECTIVE_DATE}</p>
      </header>

      {/* Data Controller Information */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Data Controller Information</h2>
        <div className="opacity-90 text-sm space-y-1">
          <p><strong>Data controller:</strong> CHALET AQUARIUS LTD (Company No. 15587263)</p>
          <p><strong>Registered office:</strong> 20 Wenlock Road, London, England, N1 7GU</p>
          <p><strong>Contact (Privacy / Support):</strong> info@chaletcoaching.co.uk • +44 7441 392840</p>
          <p><strong>Service:</strong> https://www.chaletcoaching.co.uk</p>
        </div>
      </Card>

      {/* Introduction */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
        <p className="opacity-90 text-sm">
          We respect your privacy. This Privacy Policy explains what personal data we collect, how we use it, how long we keep it, with whom we share it, &quot;and how you can exercise your rights. It applies when you use the Chaletcoaching website, app and services (the &quot;Service&quot;).
        </p>
      </Card>

      {/* Data we collect */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">2. Data we collect</h2>
        <p className="mb-3 opacity-90 text-sm">We only collect the personal data reasonably necessary to operate and improve the Service.</p>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>Identity & contact:</strong> name, email address; postal/billing address and phone number (where required for invoicing or support).</p>
          <p><strong>Account data:</strong> login email, hashed password, profile details, preferences, marketing choices, consent records.</p>
          <p><strong>Transactions & tokens:</strong> order references, token top-ups/redemptions, payment metadata (processor reference, amounts, dates). We do not store full card numbers or CVV.</p>
          <p><strong>Service usage:</strong> plan previews and generations, exports/downloads, access logs, device/session identifiers.</p>
          <p><strong>Fitness inputs you provide:</strong> training goals, constraints (time/equipment), experience level, and optional self-reported information (e.g., injuries, conditions, pregnancy status).</p>
          <p><strong>Technical data:</strong> IP address, device type, operating system, browser/user-agent, timestamps, diagnostic/error logs.</p>
          <p><strong>Support:</strong> emails and chat transcripts, attachments you send (screenshots, files, export IDs).</p>
          <p><strong>Special category data (health).</strong> We do not require medical data. If you choose to share health-related information to tailor your plan, we process that limited data only with your explicit consent and you can withdraw consent at any time (see §7).</p>
        </div>
      </Card>

      {/* Why we use your data & legal bases */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">3. Why we use your data & legal bases</h2>
        <p className="mb-3 opacity-90 text-sm">We process personal data for the following purposes under UK GDPR:</p>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>Provide and operate the Service</strong> (create/manage accounts, token balance, deliver plan previews/exports, maintain history).<br />
          <em>Legal basis: performance of a contract.</em></p>
          <p><strong>Payments, fraud prevention, and compliance</strong> (reconciliation, chargeback handling, record keeping, tax/VAT).<br />
          <em>Legal basis: legal obligation & legitimate interests (protect users and our business).</em></p>
          <p><strong>Support, complaints and refunds</strong> (identify you, investigate, resolve).<br />
          <em>Legal basis: performance of a contract & legitimate interests.</em></p>
          <p><strong>Improve reliability and security</strong> (metrics, diagnostics, abuse detection, rate-limiting).<br />
          <em>Legal basis: legitimate interests (we balance against your rights).</em></p>
          <p><strong>Marketing</strong> (newsletters, offers) where you opt in.<br />
          <em>Legal basis: consent (you can withdraw at any time).</em></p>
          <p><strong>Fitness personalisation</strong> that may include health hints you provide.<br />
          <em>Legal basis: explicit consent for any health-related details you choose to submit.</em></p>
          <p><strong>We do not sell personal data.</strong></p>
        </div>
      </Card>

      {/* AI personalisation & automated decisions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">4. AI personalisation & automated decisions</h2>
          <p className="opacity-90 text-sm">
            We use AI to help generate and tailor fitness plans based on your inputs. This is profiling for personalisation only and does not produce legal or similarly significant effects on you. You can opt out of marketing profiling at any time and you may use the Service without providing any health information (you will still receive general plans).
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">5. Sharing and international transfers</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p>We share data with trusted service providers strictly as needed to run the Service, for example:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>payment processors, fraud-prevention and chargeback services;</li>
              <li>cloud hosting, databases, storage and content delivery;</li>
              <li>email and customer-support tools;</li>
              <li>analytics and crash-reporting (limited, privacy-respecting where feasible);</li>
              <li>professional advisers (legal, accounting, audit).</li>
            </ul>
            <p>Some providers are outside the UK/EEA. Where we transfer data internationally, we use appropriate safeguards: UK adequacy decisions, Standard Contractual Clauses (SCCs), and additional measures where necessary, ensuring an adequate level of protection.</p>
          </div>
        </Card>
      </div>

      {/* Cookies and similar technologies */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">6. Cookies and similar technologies</h2>
        <p className="opacity-90 text-sm">
          We use cookies and similar technologies (e.g., localStorage, sessionStorage, pixels) to operate core functions (authentication, security), remember preferences, measure performance and—where you consent—enable analytics/marketing. Essential cookies do not require consent. For details and choices, see our Cookie Policy.
        </p>
      </Card>

      {/* How long we keep your data */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">7. How long we keep your data (retention)</h2>
        <p className="mb-3 opacity-90 text-sm">We retain data only as long as necessary for the purposes above and to meet legal, regulatory and accounting obligations.</p>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>Orders/payments/tokens</strong> (including checkout evidence): at least 24 months, and up to 6 years for compliance or disputed/enterprise transactions.</p>
          <p><strong>Account profile & access logs:</strong> while the account is active and for a reasonable period after closure for security/fraud prevention and legal compliance.</p>
          <p><strong>Support records:</strong> for the time needed to resolve the issue and a reasonable period thereafter.</p>
          <p><strong>Health-related details</strong> (if any): stored minimally and only as long as needed for the chosen plan; deleted or anonymised on withdrawal of consent or when no longer required.</p>
          <p>When retention ends, we delete or anonymise data unless a longer period is required by law.</p>
        </div>
      </Card>

      {/* Your rights */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">8. Your rights</h2>
        <p className="mb-3 opacity-90 text-sm">Under UK data protection law you may have the right to:</p>
        <div className="space-y-2 opacity-90 text-sm ml-4">
          <p>• Access your personal data;</p>
          <p>• Rectify inaccurate or incomplete data;</p>
          <p>• Erase data (in certain circumstances);</p>
          <p>• Restrict processing;</p>
          <p>• Data portability (for data you provided, where technically feasible);</p>
          <p>• Object to processing based on legitimate interests or to direct marketing;</p>
          <p>• Withdraw consent at any time (e.g., marketing or health-related inputs).</p>
        </div>
        <p className="mt-3 opacity-90 text-sm">
          To exercise your rights, contact info@chaletcoaching.co.uk. We may need to verify your identity. We respond within statutory timeframes (normally one month). Some rights may be limited by law (e.g., where we must retain records).
        </p>
      </Card>

      {/* Additional sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">9. Security</h2>
          <p className="opacity-90 text-sm">
            We implement reasonable technical and organisational measures, including encryption in transit, access controls, least-privilege policies, secure backups, logging and vulnerability management. No system is completely secure; we cannot guarantee absolute security.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">10. Children</h2>
          <p className="opacity-90 text-sm">
            The Service is intended for adults (18+). We do not knowingly collect data from children under 18. If you believe a child has provided data, contact info@chaletcoaching.co.uk and we will delete it.
          </p>
        </Card>
      </div>

      {/* Changes to this Policy */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">11. Changes to this Policy</h2>
        <p className="opacity-90 text-sm">
          We may update this Privacy Policy from time to time. Material changes will be notified via email to registered users and/or a prominent notice in the Service. The effective date above will be updated.
        </p>
      </Card>

      {/* Contact & complaints */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">12. Contact & complaints</h2>
        <div className="opacity-90 text-sm space-y-1">
          <p><strong>Questions or requests:</strong> info@chaletcoaching.co.uk • +44 7441 392840 • CHALET AQUARIUS LTD, 20 Wenlock Road, London, England, N1 7GU.</p>
        </div>
      </Card>
    </main>
  );
}
