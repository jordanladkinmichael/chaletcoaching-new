import { THEME } from "@/lib/theme";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Returns Policy — Chaletcoaching",
  description: "Refund policy and token system information for Chaletcoaching",
};

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

export default function RefundsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8" style={{ color: THEME.text }}>
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1"
             style={{ background: "#19191f", border: `1px solid ${THEME.cardBorder}`, color: THEME.secondary }}>
          Policy
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          Refund & Returns <span style={{ color: THEME.accent }}>Policy</span>
        </h1>
        <p className="opacity-80 text-sm">Effective date: 12 August 2025</p>
      </header>

      {/* Company Information */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">Company Information</h2>
        <div className="opacity-90 text-sm space-y-1">
          <p><strong>Company:</strong> CHALET AQUARIUS LTD (Company No. 15587263)</p>
          <p><strong>Registered office:</strong> 20 Wenlock Road, London, England, N1 7GU</p>
          <p><strong>Support email:</strong> info@chaletcoaching.co.uk</p>
          <p><strong>Phone:</strong> +44 7441 392840</p>
          <p><strong>Service:</strong> https://www.chaletcoaching.co.uk</p>
        </div>
      </Card>

      {/* Summary */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">1. Summary (customer-facing)</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Refund requests are handled under this Policy and applicable UK consumer law.</p>
          <p><strong>Typical processing time after approval:</strong> 5–10 business days (your bank&apos;s timelines may vary).</p>
          <p>A refund will not exceed the original amount paid for the Tokens/transaction.</p>
          <p><strong>Spent Tokens</strong> (used for previews, full course generation, or PDF exports) are non-refundable, except where the supplied digital Service is defective, materially not as described, or not supplied as contracted.</p>
          <p>Tokens are account-bound, non-transferable and are not exchangeable for cash, except where required by law.</p>
          <p><strong>Promotional/bonus Tokens</strong> are non-refundable unless the promotion&apos;s terms expressly state otherwise.</p>
          <p><strong>Submit requests to:</strong> info@chaletcoaching.co.uk with your order reference and details.</p>
          <p>This Policy may be updated; material changes will be notified as in section 8.</p>
          <p>If you consented at checkout to immediate supply of digital content (e.g., downloadable Training Plan) and then accessed/downloaded it, you may lose your statutory right to cancel for that transaction (see 4.7).</p>
        </div>
      </Card>

      {/* Scope and legal note */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">2. Scope and legal note</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>This Policy covers refunds for Tokens (internal account units) and digital/online Services provided by CHALET AQUARIUS LTD via Chaletcoaching, including Training Plans (on-screen content, previews, exports), downloadable files (e.g., PDF/DOCX), and any bespoke materials.</p>
          <p>Nothing here limits mandatory consumer rights under UK law, including the Consumer Contracts Regulations 2013 and the Consumer Rights Act 2015.</p>
        </div>
      </Card>

      {/* Definitions */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">3. Definitions</h2>
        <div className="space-y-2 opacity-90 text-sm">
          <p><strong>Tokens</strong> — internal units used to access paid features (previews, full course generation, PDF export). The indicative conversion/baseline is shown on the Pricing/checkout pages.</p>
          <p><strong>Unused Tokens</strong> — Tokens credited to your Account that have not been redeemed/spent.</p>
          <p><strong>Spent Tokens</strong> — Tokens used to unlock or obtain a paid feature or digital content.</p>
          <p><strong>Promotional/Bonus Tokens</strong> — Tokens issued as part of a special offer, bonus or incentive.</p>
          <p><strong>Bespoke/Custom Plans</strong> — materials created specifically for you following a brief and manual effort (if offered).</p>
        </div>
      </Card>

      {/* Refund principles */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">4. Refund principles (binding rules)</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>4.1 Refund cap.</strong> Any refund will not exceed the amount you originally paid for the Tokens/Service (net of any non-refundable processor fees) in the currency of purchase.</p>
          <p><strong>4.2 No refund for Spent Tokens.</strong> Tokens that have been redeemed are non-refundable, except where:</p>
          <div className="ml-4 space-y-1">
            <p><strong>(a)</strong> the digital Service supplied is materially defective or materially not as described;</p>
            <p><strong>(b)</strong> we failed to supply the Service as contracted; or</p>
            <p><strong>(c)</strong> a refund is required by law.</p>
          </div>
          <p><strong>4.3 Unused Tokens.</strong> Unused Tokens are generally refundable at the original purchase price if you request a refund before Tokens are spent. We may deduct non-refundable payment processor fees; any deduction will be itemised in the confirmation.</p>
          <p><strong>4.4 Account-binding; non-transferable.</strong> Tokens are tied to the Account they were credited to and cannot be transferred or assigned.</p>
          <p><strong>4.5 No cash-out.</strong> Tokens cannot be exchanged for cash or other real currency, except where required by law.</p>
          <p><strong>4.6 Promotional/bonus Tokens.</strong> Promotional/bonus Tokens are non-refundable unless the specific offer states otherwise (e.g., guaranteed-refund trials).</p>
          <p><strong>4.7 Immediate supply & opened content.</strong> Where you consent to immediate supply of digital content and then access or download it (e.g., a Training Plan PDF), you acknowledge that your 14-day cooling-off right may not apply to that transaction. Refunds in such cases are available only under 4.2 or as legally required.</p>
          <p><strong>4.8 Bespoke/custom work.</strong> For custom materials, refunds are unavailable once substantial work has begun, unless otherwise stated in a written bespoke agreement. Where staged delivery is agreed, any refund (if applicable) may be pro-rated per the bespoke terms.</p>
          <p><strong>4.9 System/technical errors.</strong> If a technical issue on our side prevented delivery or corrupted a file, we will re-deliver, repair, replace, or refund as appropriate.</p>
        </div>
      </Card>

      {/* How to request a refund */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">5. How to request a refund (procedure)</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p>Email info@chaletcoaching.co.uk (or use the in-app support form, if available) and include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Order reference (mandatory);</li>
              <li>Account email used for the purchase;</li>
              <li>Whether the request concerns Unused Tokens or a Redeemed/Delivered Service;</li>
              <li>For redeemed items: a description of the issue and supporting evidence (screenshots, filenames, error messages, steps to reproduce, timestamps, etc.);</li>
              <li>Preferred refund method (normally we refund to the original payment method).</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">What happens next:</h2>
          <div className="space-y-3 opacity-90 text-sm">
            <p>• We acknowledge your request within 5 business days;</p>
            <p>• We may request additional information;</p>
            <p>• We decide and, if approved, process the refund within 5–10 business days of approval (card/bank posting times may vary).</p>
          </div>
        </Card>
      </div>

      {/* Investigation, evidence and decisions */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">6. Investigation, evidence and decisions</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>6.1 Evidence.</strong> For redeemed Services we may review order and Token logs, checkout confirmations (Token baseline/conversion shown at checkout, totals), access/delivery logs (download timestamps, export IDs), and any evidence you supply.</p>
          <p><strong>6.2 Method.</strong> Approved refunds are usually sent to the original payment method. If unavailable, we may offer a reasonable alternative (e.g., bank transfer) subject to verification.</p>
          <p><strong>6.3 Rejection.</strong> If a claim is rejected, we provide a clear explanation and information on escalation/your statutory options.</p>
        </div>
      </Card>

      {/* Chargebacks, fraud and abuse */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">7. Chargebacks, fraud and abuse</h2>
        <p className="opacity-90 text-sm">
          If you initiate a chargeback while a refund request is pending, we will treat the matter as a payment dispute and submit full evidence (order logs, checkout confirmations, IP/user-agent, timestamps, access events). We may refuse refunds and suspend or close Accounts where there is fraud, abuse, or repeated unwarranted chargebacks.
        </p>
      </Card>

      {/* Additional sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-3">8. Changes to this Policy</h2>
          <p className="opacity-90 text-sm">
            We may update this Policy from time to time. Material changes will be notified to registered users via email and/or a prominent in-Service notice. Changes apply prospectively and do not affect completed transactions.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-3">9. Record keeping and retention</h2>
          <p className="opacity-90 text-sm">
            We retain records necessary to assess refund decisions — including order IDs, Token purchase/redemption history, checkout acknowledgements (including any &quot;immediate supply&quot; consent text), timestamps, IP and user-agent — for at least 24 months, and up to 6 years for disputed or enterprise transactions, in line with our Privacy Policy and applicable data protection law.
          </p>
        </Card>
      </div>

      {/* Escalation and disputes */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">10. Escalation and disputes</h2>
        <p className="opacity-90 text-sm">
          If you disagree with a decision, escalate by emailing info@chaletcoaching.co.uk with your reasons and order reference. We will review within 10 business days. This Policy does not affect your statutory rights; where applicable, you may use alternative dispute resolution or court proceedings.
        </p>
      </Card>

      {/* Practical examples */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">11. Practical examples</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>Unused Tokens:</strong> You purchased 2,000 Tokens; you spent 300; the remaining 1,700 Tokens are refundable at the original purchase price (less any non-refundable processor fees).</p>
          <p><strong>Downloaded Training Plan:</strong> You consented to immediate supply and downloaded a PDF; a refund is available only if the file was defective, materially not as described, or not supplied as contracted.</p>
          <p><strong>Promotional Tokens:</strong> 100 bonus Tokens from a promotion are non-refundable.</p>
          <p><strong>Technical failure:</strong> Your export failed due to a verified platform error and could not be re-delivered — we will replace or refund.</p>
        </div>
      </Card>

      {/* Contact details */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">12. Contact details</h2>
        <div className="opacity-90 text-sm space-y-1">
          <p><strong>Email (support):</strong> info@chaletcoaching.co.uk</p>
          <p><strong>Phone:</strong> +44 7441 392840</p>
          <p><strong>Postal:</strong> CHALET AQUARIUS LTD, 20 Wenlock Road, London, England, N1 7GU</p>
        </div>
      </Card>
    </main>
  );
}
