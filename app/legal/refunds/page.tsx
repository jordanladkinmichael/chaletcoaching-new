import { THEME } from "@/lib/theme";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Returns Policy — Chaletcoaching",
  description: "Refund policy and token system information for Chaletcoaching",
};

const EFFECTIVE_DATE = "January 16, 2026";

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
          Refund and Return <span style={{ color: THEME.accent }}>Policy</span>
        </h1>
        <p className="opacity-80 text-sm">Effective Date: {EFFECTIVE_DATE}</p>
      </header>

      {/* Introduction */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>This Refund and Return Policy (&quot;Policy&quot;) governs the cancellation of orders, refund requests for Token packages, and disputes regarding digital content provided by CHALET AQUARIUS LTD (Company No: 15587263).</p>
          <p>By purchasing Tokens or exchanging them for Fitness Courses on chaletcoaching.co.uk, you agree to the terms outlined below. This Policy operates in conjunction with our Terms and Conditions.</p>
        </div>
      </Card>

      {/* Refund of Token Packages */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">2. Refund of Token Packages (Monetary Refunds)</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Tokens are the virtual currency used to access our services. The refund of real currency (Fiat) for Token packages is subject to strict conditions.</p>
          
          <p><strong>2.1. Unused Token Packages.</strong></p>
          <p>You have the right to request a full refund for a purchased Token Package within 14 days of the transaction date, provided that:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>None of the Tokens from that specific package have been used or exchanged for a Course.</li>
            <li>The transaction has settled and is not subject to a payment dispute.</li>
          </ul>

          <p><strong>2.2. Partially Used Packages.</strong></p>
          <p>Once you have used any portion of a Token Package (e.g., purchasing a Single Course using tokens from the &quot;Momentum Pack&quot;), the entire package is deemed &quot;activated&quot; and used.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>No partial refunds will be issued for the remaining balance of Tokens in a package.</li>
            <li>This policy ensures the integrity of our bulk-pricing model.</li>
          </ul>

          <p><strong>2.3. Processing Fee.</strong></p>
          <p>For eligible monetary refunds, we reserve the right to deduct a processing fee (typically 3-5%) to cover the merchant fees (Visa/Mastercard) and administrative costs incurred during the original transaction and the refund process.</p>
        </div>
      </Card>

      {/* Cancellation of Course Orders */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">3. Cancellation of Course Orders (Token Reversals)</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>This section governs the return of Tokens to your account balance, not the return of money to your bank account.</p>
          
          <p><strong>3.1. AI-Generated Courses (Instant).</strong></p>
          <p>Due to the nature of this service:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>AI Courses are generated and delivered instantly (or within minutes) upon purchase.</li>
            <li>Once you click &quot;Buy&quot; or &quot;Generate,&quot; the service is fully performed.</li>
            <li><strong>Refund Status: Strictly Non-Refundable.</strong> Tokens cannot be returned once the generation process has started.</li>
          </ul>

          <p><strong>3.2. Trainer-Created Courses (Delayed).</strong></p>
          <p>These courses require manual work by a human professional.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Pending Status:</strong> If you wish to cancel a Trainer Course before the Trainer has started working on it (status is &quot;Pending&quot;), you may contact support. If approved, Tokens will be returned to your Dashboard balance.</li>
            <li><strong>In-Progress / Delivered Status:</strong> Once the Trainer has begun compiling your plan or the file has been sent/uploaded, the service is deemed commenced. No cancellation or Token refund is possible.</li>
          </ul>
        </div>
      </Card>

      {/* Digital Content & Right of Withdrawal */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">4. Digital Content & Right of Withdrawal</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>4.1. Consumer Rights Act Waiver.</strong></p>
          <p>Under UK and EU consumer law, you typically have a 14-day &quot;cooling-off&quot; period. However, this does not apply to digital content once the download or streaming has begun.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>By purchasing a Course and initiating the download (or receiving it via email), you expressly acknowledge that you lose your right of withdrawal.</li>
          </ul>

          <p><strong>4.2. &quot;Result&quot; Disclaimer.</strong></p>
          <p>We provide educational fitness plans. We do not guarantee specific physical results (e.g., weight loss, muscle gain).</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>Dissatisfaction with the difficulty, style, or effectiveness of the workout plan is not valid grounds for a refund.</li>
          </ul>
        </div>
      </Card>

      {/* Technical Issues and Defective Content */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">5. Technical Issues and Defective Content</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>5.1. Corrupted Files.</strong></p>
          <p>If a purchased PDF file is corrupted, blank, or technically inaccessible:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>You must contact info@chaletcoaching.co.uk within 48 hours of purchase.</li>
            <li>We will attempt to provide a replacement file free of charge.</li>
            <li>If we cannot provide a working file, the Tokens used for that specific order will be refunded to your Account.</li>
          </ul>

          <p><strong>5.2. Non-Delivery.</strong></p>
          <p>If you spent Tokens but did not receive the Course in your Dashboard or Email:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>Please check your Spam/Junk folder first.</li>
            <li>Contact support immediately. If the system failed to deliver the product, we will manually send the file or refund the Tokens.</li>
          </ul>
        </div>
      </Card>

      {/* Method of Monetary Refund */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">6. Method of Monetary Refund</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>6.1. Original Payment Method.</strong></p>
          <p>Where a monetary refund is approved (under Section 2), it will be processed strictly to the original payment method used (Visa or MasterCard). We cannot issue refunds to third-party accounts or via cash.</p>

          <p><strong>6.2. Timeline.</strong></p>
          <p>Refunds typically take 5–10 business days to appear on your bank statement, depending on your card issuer&apos;s processing times.</p>

          <p><strong>6.3. Currency Exchange Risks.</strong></p>
          <p>We transact in GBP, EUR, and USD.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>If your bank account is in a different currency, your bank may apply exchange rates.</li>
            <li>We refund the exact amount charged in the transaction currency. We are not liable for any difference in the refund amount caused by exchange rate fluctuations between the purchase date and refund date.</li>
          </ul>
        </div>
      </Card>

      {/* Disputes and Chargebacks */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">7. Disputes and Chargebacks</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p><strong>7.1.</strong> If you initiate a payment dispute (Chargeback) with your bank without first contacting our support team to resolve the issue:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>Your Account and access to all purchased Courses will be suspended immediately.</li>
            <li>We will submit this Policy, your access logs, and download records to the bank as evidence that the digital service was delivered.</li>
            <li>We reserve the right to ban your IP address and device from future use of our Service.</li>
          </ul>
        </div>
      </Card>

      {/* Contact Information */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">8. Contact Information</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>To request a refund or report a technical issue, please include your User ID and Order Reference and contact us at:</p>
          <div className="space-y-1">
            <p><strong>CHALET AQUARIUS LTD</strong></p>
            <p><strong>Email:</strong> info@chaletcoaching.co.uk</p>
            <p><strong>Address:</strong> 20 Wenlock Road, London, England, N1 7GU</p>
            <p><strong>Phone:</strong> +44 7441 392840</p>
          </div>
        </div>
      </Card>
    </main>
  );
}
