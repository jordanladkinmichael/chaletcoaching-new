// app/legal/cookies/page.tsx
import React from "react";
import { THEME } from "@/lib/theme";

export const metadata = { title: "Cookies Policy — Chaletcoaching" };

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

export default function CookiesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8" style={{ color: THEME.text }}>
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1"
             style={{ background: "#19191f", border: `1px solid ${THEME.cardBorder}`, color: THEME.secondary }}>
          Policy
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          Cookies <span style={{ color: THEME.accent }}>Policy</span>
        </h1>
        <p className="opacity-80 text-sm">Effective date: {EFFECTIVE_DATE}</p>
      </header>

      {/* Data Controller Information */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Data Controller Information</h2>
        <div className="opacity-90 text-sm space-y-1">
          <p><strong>Data controller:</strong> CHALET AQUARIUS LTD (Company No. 15587263)</p>
          <p><strong>Registered office:</strong> 20 Wenlock Road, London, England, N1 7GU</p>
          <p><strong>Site / Service:</strong> https://www.chaletcoaching.co.uk</p>
          <p><strong>Contact:</strong> info@chaletcoaching.co.uk • +44 7441 392840</p>
        </div>
      </Card>

      {/* Overview */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">1. Overview</h2>
        <p className="opacity-90 text-sm">
          This Cookies Policy explains how Chaletcoaching (operated by CHALET AQUARIUS LTD, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) uses cookies and similar technologies (including localStorage, sessionStorage, pixels and SDKs) on the Service. It complements our Privacy Policy. Through the banner and settings, you can accept, decline, or customise non-essential cookies as described below.
        </p>
      </Card>

      {/* What are cookies */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">2. What are cookies?</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Cookies are small files stored by your browser when you visit a site. They help the Service work (e.g., keeping you signed in), remember preferences, improve performance and—with your consent—enable analytics and marketing.</p>
          <p>We also use browser storage (localStorage/sessionStorage) for similar purposes (e.g., saving UI choices or a consent state). Where this storage is used for non-essential purposes, we will seek your consent in the same way as for cookies.</p>
        </div>
      </Card>

      {/* Categories we use */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">3. Categories we use</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>Necessary / Essential</strong> – Core platform functions such as authentication, security, CSRF protection, session management and load balancing. Consent not required.</p>
          <p><strong>Functional</strong> – Remember language, layout and UI preferences to enhance your experience.</p>
          <p><strong>Performance / Analytics</strong> – Measure usage, errors and load times to improve reliability. Depending on the tool, these may operate on legitimate interests (minimised/first-party only) or consent.</p>
          <p><strong>Marketing / Advertising</strong> – Campaign attribution, remarketing and interest-based content. Consent required.</p>
          <p><strong>Security / Anti-abuse</strong> – Detect suspicious patterns and protect users from fraud and bots (e.g., rate-limit tokens, device signals).</p>
          <p>We aim to use privacy-respecting, first-party measurement where feasible.</p>
        </div>
      </Card>

      {/* Typical cookies & storage */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">4. Typical cookies & storage (examples)</h2>
        <p className="mb-3 opacity-90 text-sm">Actual names, providers and lifetimes are shown in the on-site cookie panel.</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm opacity-90 border-collapse">
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <th className="text-left p-2 font-semibold">Name / Key</th>
                <th className="text-left p-2 font-semibold">Purpose</th>
                <th className="text-left p-2 font-semibold">Category</th>
                <th className="text-left p-2 font-semibold">Typical Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">session_id</td>
                <td className="p-2">Login session identifier</td>
                <td className="p-2">Necessary</td>
                <td className="p-2">Session</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">csrf_token</td>
                <td className="p-2">CSRF protection</td>
                <td className="p-2">Necessary</td>
                <td className="p-2">Session</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">consent_state / localStorage</td>
                <td className="p-2">Records your cookie choices</td>
                <td className="p-2">Functional</td>
                <td className="p-2">6–12 months</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">ui_prefs / localStorage</td>
                <td className="p-2">Language/layout/theme</td>
                <td className="p-2">Functional</td>
                <td className="p-2">~6 months</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">perf_metrics</td>
                <td className="p-2">Performance & error metrics</td>
                <td className="p-2">Analytics</td>
                <td className="p-2">1–3 months</td>
              </tr>
              <tr>
                <td className="p-2">campaign_src</td>
                <td className="p-2">Campaign attribution</td>
                <td className="p-2">Marketing</td>
                <td className="p-2">1–3 months</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="mt-3 opacity-90 text-sm">
          <strong>Note:</strong> Names and lifetimes may change as we improve the Service; the cookie panel always contains the current list.
        </p>
      </Card>

      {/* Lawful basis & consent */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">5. Lawful basis & consent</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p>Essential cookies are strictly necessary to provide the Service and are set without consent.</p>
            <p>Non-essential cookies (functional, analytics, marketing) are set only after you consent via the banner/settings, except limited analytics or security that we run under legitimate interests (minimised scope, no cross-site tracking).</p>
            <p>Our legal bases may include performance of a contract, consent, and legitimate interests (e.g., fraud prevention, service improvement, dispute defence). Where processing relies on consent, you may withdraw it at any time (see §8).</p>
            <p>This Policy is intended to comply with UK GDPR and the Privacy and Electronic Communications Regulations (PECR).</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">6. Recording and retention of consent</h2>
          <p className="opacity-90 text-sm">
            When you make a choice, we record the consent text/version presented, an ISO-8601 timestamp, and technical metadata (IP address and user-agent) as evidence. Consent records and related checkout evidence are retained for at least 24 months and up to 6 years for enterprise or disputed matters, in line with our Privacy Policy.
          </p>
        </Card>
      </div>

      {/* Third parties & international transfers */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">7. Third parties & international transfers</h2>
        <p className="opacity-90 text-sm">
          Some features use third-party providers (payments, analytics, hosting/CDN, support, marketing) that may set or read cookies. Some providers process data outside the UK/EEA. Where transfers occur, we use appropriate safeguards (UK adequacy decisions, Standard Contractual Clauses (SCCs) and supplemental measures) to ensure an adequate level of protection. The cookie panel lists current providers and their behaviour.
        </p>
      </Card>

      {/* Managing or withdrawing consent */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">8. Managing or withdrawing consent</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Use the cookie banner or cookie settings (link in the footer) to accept, reject, or customise non-essential categories at any time.</p>
          <p>You can also clear cookies/storage via your browser settings or use private/incognito mode.</p>
          <p><strong>Blocking certain cookies may degrade functionality</strong> (e.g., you may be logged out or preferences may be forgotten).</p>
        </div>
      </Card>

      {/* Additional sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">9. Do Not Track</h2>
          <p className="opacity-90 text-sm">
            Some browsers send a &quot;Do Not Track&quot; (DNT) signal. There is no common industry standard for DNT; however, where feasible we treat DNT as an opt-out of marketing cookies unless you later provide consent.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">10. Changes to this Policy</h2>
          <p className="opacity-90 text-sm">
            We may update this Policy (for example, when adding integrations). Material changes will be communicated via a prominent notice in the Service and/or email to registered users. The effective date above will be updated.
          </p>
        </Card>
      </div>

      {/* Contact */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">11. Contact</h2>
        <div className="opacity-90 text-sm space-y-1">
          <p><strong>Questions about cookies or this Policy:</strong> info@chaletcoaching.co.uk • +44 7441 392840</p>
          <p><strong>Postal enquiries:</strong> CHALET AQUARIUS LTD, 20 Wenlock Road, London, England, N1 7GU</p>
        </div>
      </Card>
    </main>
  );
}
