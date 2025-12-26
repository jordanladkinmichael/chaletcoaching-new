"use client";

import { THEME } from "@/lib/theme";
import * as React from "react";
import { currencyForRegion } from "@/lib/tokens";
import { useRegion } from "../region-context";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: THEME.card, borderColor: THEME.cardBorder }}
    >
      {children}
    </div>
  );
}

function BaselineConversion({ region }: { region: "EU" | "UK" | "US" }) {
  const { unitLabel } = currencyForRegion(region);
  
  return (
    <span>
      1.00 {unitLabel} = 100.00 tokens
    </span>
  );
}

export default function TermsPage() {
  // Используем контекст для синхронизации с хедером
  // Хук должен вызываться безусловно на верхнем уровне
  const { region: contextRegion } = useRegion();
  
  // Используем region из контекста, с fallback на дефолт
  const currentRegion: "EU" | "UK" | "US" = contextRegion || "EU";
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8" style={{ color: THEME.text }}>
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1"
             style={{ background: "#19191f", border: `1px solid ${THEME.cardBorder}`, color: THEME.secondary }}>
          Policy
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          Terms and <span style={{ color: THEME.accent }}>Conditions</span>
        </h1>
        <p className="opacity-80 text-sm">Effective date: 12 August 2025</p>
      </header>

      {/* Introduction */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>1.1.</strong> These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Chaletcoaching website, app and related services (the &quot;Service&quot;) operated by CHALET AQUARIUS LTD (Company No. 15587263; registered address: 20 Wenlock Road, London, England, N1 7GU) (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).</p>
          <p><strong>1.2.</strong> By accessing or using the Service, creating an account, purchasing or redeeming tokens, or generating/ downloading any content, you agree to be bound by these Terms. If you do not agree, you must not use the Service.</p>
          <p><strong>1.3.</strong> These Terms form a legally binding agreement between you (&quot;you&quot;, &quot;User&quot;, &quot;Customer&quot;) and CHALET AQUARIUS LTD.</p>
        </div>
      </Card>

      {/* Definitions */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">2. Definitions</h2>
        <div className="space-y-2 opacity-90 text-sm">
          <p><strong>• Account</strong> – your user account on the Service.</p>
          <p><strong>• Training Plan(s)</strong> – AI-assisted fitness content provided via the Service, including workouts, schedules, exercise routines, guidance, checklists and similar digital materials (e.g., previews, on-screen content, PDF/DOCX exports).</p>
          <p><strong>• Preview</strong> – a low-cost/low-token generation step that lets you view a plan outline before committing to a full course or export.</p>
          <p><strong>• Tokens</strong> – the Service&apos;s internal unit used to access paid features (e.g., previews, full course generation, PDF export). Tokens are not money, e-money, securities or investments.</p>
          <p><strong>• Services/Products</strong> – any goods or services offered via the Service, including Training Plans and add-ons (where available).</p>
        </div>
      </Card>

      {/* Eligibility & Account Registration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">3. Eligibility & Account Registration</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>3.1.</strong> You must be 18+ to create an Account and use paid features. If you use the Service for a company, you confirm you are authorised to bind that entity.</p>
            <p><strong>3.2.</strong> You must provide accurate and up-to-date information and keep your credentials secure. You are responsible for all activity under your Account.</p>
            <p><strong>3.3.</strong> Notify us immediately of any unauthorised use or security incident at info@chaletcoaching.co.uk (and consider changing your password).</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">4. Tokens & Pricing</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>4.1.</strong> <strong>Nature.</strong> Tokens provide access to features within the Service. They confer no ownership or monetary rights beyond what is expressly set out here.</p>
            <p><strong>4.2.</strong> <strong>Baseline conversion.</strong> Unless stated otherwise on the Pricing page, the baseline is <BaselineConversion region={currentRegion} />. We display token prices before you generate content.</p>
            <p><strong>4.3.</strong> <strong>Issuance & deduction.</strong> After successful payment, Tokens are credited to your Account. When you use paid features (preview, full course, export), Tokens are deducted immediately.</p>
            <p><strong>4.4.</strong> <strong>Variations.</strong> We may change token bundles, bonus offers, or the token price of features at any time with prospective effect. Changes do not affect Tokens already in your balance.</p>
            <p><strong>4.5.</strong> <strong>Promotions.</strong> Promotional or bonus Tokens are subject to specific terms shown at the time of the offer and may have expiry or usage limits.</p>
            <p><strong>4.6.</strong> <strong>Expiry.</strong> Unless we explicitly state an expiry on purchase, Tokens do not expire; we may introduce reasonable inactivity rules for security/anti-fraud with prior notice.</p>
          </div>
        </Card>
      </div>

      {/* Ordering, Payment & Delivery */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">5. Ordering, Payment & Delivery</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>5.1.</strong> We may accept or refuse any order or Token top-up at our discretion (e.g., suspected fraud, technical error, pricing mistake).</p>
          <p><strong>5.2.</strong> Accepted payment methods are displayed at checkout. You warrant you are authorised to use the selected method and that details provided are accurate.</p>
          <p><strong>5.3.</strong> Before paying, we show: (a) Tokens to buy or spend; (b) applicable baseline conversion (if relevant); (c) total fiat amount; and (d) taxes/fees where applicable.</p>
          <p><strong>5.4.</strong> Digital delivery occurs when on-screen access is granted or when a download/export link is provided. We aim for prompt delivery but do not guarantee uninterrupted availability.</p>
        </div>
      </Card>

      {/* Refunds, Cancellations & Consumer Rights */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">6. Refunds, Cancellations & Consumer Rights</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>6.1.</strong> <strong>Immediate digital supply.</strong> Many features (previews, generation, exports) start immediately after you confirm. By proceeding, you request immediate supply and acknowledge you lose any statutory cancellation right for that specific supply under UK consumer law.</p>
          <p><strong>6.2.</strong> <strong>Unused Tokens.</strong> We may refund unused Tokens at the original purchase price (less any non-refundable payment processor fees) if requested before Tokens are spent.</p>
          <p><strong>6.3.</strong> <strong>Faulty/Not-as-described.</strong> If content is not delivered, is materially not as described, or a technical issue prevents access, contact info@chaletcoaching.co.uk with your order details. Where appropriate, we will re-deliver, repair, replace or refund as required by law.</p>
          <p><strong>6.4.</strong> <strong>How to request.</strong> Email info@chaletcoaching.co.uk (from your Account email) with your name, Account email and receipt/transaction ID. We will acknowledge and respond within a reasonable time.</p>
          <p><strong>6.5.</strong> Nothing in this section affects your mandatory consumer rights.</p>
        </div>
      </Card>

      {/* Health & Safety */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">7. Health & Safety – No Medical Advice</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>7.1.</strong> The Service provides informational fitness content generated with AI and, where applicable, templated logic. It is not medical advice and does not replace consultation with a qualified healthcare professional.</p>
          <p><strong>7.2.</strong> You are responsible for confirming that exercises are suitable for your personal circumstances (including pregnancy, existing injuries, chronic conditions, medication, age, and ability). Stop immediately if you feel pain, dizziness, or discomfort.</p>
          <p><strong>7.3.</strong> By using the Service you confirm you are fit to exercise or have obtained medical clearance. We are not responsible for injury, harm or adverse outcomes arising from use or misuse of any content.</p>
        </div>
      </Card>

      {/* Acceptable Use */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">8. Acceptable Use</h2>
        <p className="mb-3 opacity-90 text-sm">You agree not to:</p>
        <div className="space-y-2 opacity-90 text-sm ml-4">
          <p><strong>(a)</strong> misuse the Service (e.g., overloading, spamming, automated scraping, reverse-engineering, bypassing paywalls or security);</p>
          <p><strong>(b)</strong> share, resell, sub-license or publicly post generated plans without our permission;</p>
          <p><strong>(c)</strong> input unlawful, infringing or harmful content;</p>
          <p><strong>(d)</strong> attempt to re-identify individuals from anonymised data;</p>
          <p><strong>(e)</strong> use the Service for any illegal purpose or in breach of applicable law.</p>
        </div>
      </Card>

      {/* Intellectual Property & Licence */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">9. Intellectual Property & Licence</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>9.1.</strong> The Service, underlying models, interfaces, prompts, datasets and all content are owned by or licensed to us (copyright, database rights, design rights, trade marks).</p>
            <p><strong>9.2.</strong> Upon lawful purchase or provision, we grant you a personal, non-exclusive, non-transferable, revocable licence to use generated Training Plans for your own personal fitness use only.</p>
            <p><strong>9.3.</strong> Unless we agree in writing, you must not: (i) copy, modify, distribute, sell, rent, publicly display or create derivative works from the plans; (ii) remove proprietary notices; (iii) use content to provide services to third parties.</p>
            <p><strong>9.4.</strong> For any optional bespoke, human-authored plans, different IP terms may be agreed in writing.</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">10. Warranties & Disclaimers</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>10.1.</strong> We warrant we have rights to grant the licences described.</p>
            <p><strong>10.2.</strong> Except as explicitly stated, the Service and content are provided &quot;as is&quot; and &quot;as available&quot; without implied warranties of fitness for a particular purpose, satisfactory quality, accuracy or completeness.</p>
            <p><strong>10.3.</strong> Results vary. We do not guarantee specific outcomes (e.g., weight loss, strength gains, performance metrics).</p>
          </div>
        </Card>
      </div>

      {/* Limitation of Liability */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">11. Limitation of Liability</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>11.1.</strong> Nothing limits liability for death or personal injury caused by our negligence, fraud, or any liability that cannot be excluded by law.</p>
          <p><strong>11.2.</strong> Subject to 11.1, our total aggregate liability to you for all claims arising in the 12 months preceding the claim is limited to the total amount you paid to us for the specific Services giving rise to that claim.</p>
          <p><strong>11.3.</strong> We are not liable for indirect or consequential loss, including loss of profit, business, data or goodwill, even if foreseeable.</p>
        </div>
      </Card>

      {/* Additional sections in grid layout */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">12. Indemnity</h2>
          <p className="opacity-90 text-sm">
            You agree to indemnify and hold harmless us and our officers, employees and agents from claims, damages, costs and expenses (including reasonable legal fees) arising from: (a) your breach of these Terms; (b) your misuse of the Service or content; or (c) your violation of law or third-party rights.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">13. Data Protection</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>13.1.</strong> We process personal data according to our Privacy Policy (UK GDPR & Data Protection Act 2018).</p>
            <p><strong>13.2.</strong> By using the Service you acknowledge our data practices set out in the Privacy Policy, including limited analytics/cookies as described in the Cookie Policy.</p>
          </div>
        </Card>
      </div>

      {/* More sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">14. Third-Party Links & Processors</h2>
          <p className="opacity-90 text-sm">
            The Service may link to third-party sites or tools (payments, hosting, analytics, email, file storage). We do not control third-party content or availability and are not responsible for their practices. Use of third-party services may be subject to their own terms and policies.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">15. Suspension & Termination</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>15.1.</strong> We may suspend, restrict or terminate access (with or without notice) if we reasonably suspect breach of these Terms, fraud/abuse, non-payment/chargeback, or for security/technical reasons.</p>
            <p><strong>15.2.</strong> On termination, licences end and you must delete any downloads where required by law or by these Terms. Termination does not affect accrued rights or obligations.</p>
          </div>
        </Card>
      </div>

      {/* Changes to Service & Terms */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">16. Changes to the Service & to These Terms</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>16.1.</strong> We may update features, token pricing, bundles and availability from time to time.</p>
          <p><strong>16.2.</strong> We may amend these Terms; material changes will be notified via the Service and/or email. The effective date will be stated. Continued use after that date constitutes acceptance.</p>
        </div>
      </Card>

      {/* Final sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">17. Notices</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>17.1.</strong> Contact us at info@chaletcoaching.co.uk or by post to CHALET AQUARIUS LTD, 20 Wenlock Road, London, England, N1 7GU. Phone: +44 7441 392840.</p>
            <p><strong>17.2.</strong> We may provide notices to you by email to your Account address or by posting within the Service.</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">18. Governing Law & Jurisdiction</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p><strong>18.1.</strong> These Terms are governed by the laws of England and Wales.</p>
            <p><strong>18.2.</strong> The courts of England and Wales have exclusive jurisdiction, subject to any mandatory consumer protections that may allow you to bring proceedings in your local jurisdiction.</p>
          </div>
        </Card>
      </div>

      {/* Miscellaneous */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">19. Miscellaneous</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>19.1.</strong> If any provision is held invalid or unenforceable, the remainder remains in force.</p>
          <p><strong>19.2.</strong> No delay or failure to exercise a right constitutes a waiver.</p>
          <p><strong>19.3.</strong> You may not assign or transfer your rights without our prior written consent; we may assign to an affiliate or in connection with a corporate transaction.</p>
          <p><strong>19.4.</strong> <strong>Force Majeure.</strong> We are not liable for delays or failures caused by events beyond our reasonable control (e.g., outages, strikes, acts of God, regulations).</p>
          <p><strong>19.5.</strong> Headings are for convenience only and do not affect interpretation. These Terms constitute the entire agreement regarding the Service and supersede prior understandings.</p>
        </div>
      </Card>

      {/* Company details */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Company details</h2>
        <div className="opacity-90 text-sm space-y-1">
          <p><strong>CHALET AQUARIUS LTD</strong> (Company No. 15587263)</p>
          <p>20 Wenlock Road, London, England, N1 7GU</p>
          <p>Email: info@chaletcoaching.co.uk • Phone: +44 7441 392840</p>
        </div>
      </Card>
    </main>
  );
}
