// app/legal/privacy/page.tsx
import React from "react";
import { Metadata } from "next";
import { THEME } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Privacy Policy — Chaletcoaching",
  description: "Privacy policy and data handling practices for Chaletcoaching",
};

const EFFECTIVE_DATE = "January 17, 2026";

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

      {/* Introduction */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>CHALET AQUARIUS LTD (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy and the sensitive personal information you entrust to us. This Privacy Policy outlines how we collect, use, disclose, and safeguard your personal data when you use our website chaletcoaching.co.uk and our fitness coaching platform (the &quot;Service&quot;).</p>
          <p>We act as the Data Controller for the personal data you provide to us directly.</p>
          <div className="space-y-1">
            <p><strong>Company Name:</strong> CHALET AQUARIUS LTD</p>
            <p><strong>Company Number:</strong> 15587263</p>
            <p><strong>Registered Address:</strong> 20 Wenlock Road, London, England, N1 7GU</p>
            <p><strong>Email:</strong> info@chaletcoaching.co.uk</p>
          </div>
          <p>By using the Service, purchasing Tokens, or requesting a fitness plan, you acknowledge the terms of this Policy. This Service is strictly intended for users aged 18 and over.</p>
        </div>
      </Card>

      {/* Data We Collect */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">2. Data We Collect</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>We collect data necessary to generate personalized fitness plans, process Token payments, and deliver digital content.</p>
          
          <p><strong>2.1. Data You Provide</strong></p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Account Information:</strong> Your name, email address, phone number, and secure password.</li>
            <li><strong>Physical & Health Data (Special Category Data):</strong> To create effective AI or Trainer-led fitness plans, we collect sensitive data including, but not limited to:
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Age, gender, height, and weight.</li>
                <li>Fitness goals (e.g., weight loss, muscle gain).</li>
                <li>Current fitness level and lifestyle habits.</li>
                <li>Physical limitations or past injuries (to ensure safety).</li>
              </ul>
              <p className="mt-1"><strong>Legal Basis:</strong> By submitting this information, you provide Explicit Consent for us to process this data solely for the purpose of generating your workout plan.</p>
            </li>
            <li><strong>Transaction Data:</strong> Details of Token package purchases, payment history, and current Token balance. We do not store full credit card numbers.</li>
            <li><strong>Support Communications:</strong> Records of your correspondence with our support team or chat history with Trainers.</li>
          </ul>

          <p><strong>2.2. Data Collected Automatically</strong></p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting, operating system, and device type.</li>
            <li><strong>Usage Data:</strong> Information about how you navigate our dashboard, download courses, and utilize the Token system.</li>
            <li><strong>Cookies:</strong> Small data files stored on your device to maintain your login session and preferences.</li>
          </ul>
        </div>
      </Card>

      {/* How We Use Your Data */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">3. How We Use Your Data</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>We process your personal data under the UK GDPR and Data Protection Act 2018 based on the following legal grounds:</p>
          
          <p><strong>3.1. Performance of a Contract</strong></p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>To manage your User Account and Token Wallet.</li>
            <li>To deliver the purchased PDF courses to your email and dashboard.</li>
            <li>To process payments via our payment processors (Visa/Mastercard).</li>
          </ul>

          <p><strong>3.2. Explicit Consent (Article 9 UK GDPR)</strong></p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>To process your Health and Physical Data for the specific purpose of generating a workout routine. You may withdraw this consent at any time by deleting your account, but this will prevent us from providing further services.</li>
          </ul>

          <p><strong>3.3. Legal Obligation</strong></p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>To maintain financial records for tax and accounting purposes (HMRC compliance).</li>
            <li>To prevent fraud and money laundering.</li>
          </ul>

          <p><strong>3.4. Legitimate Interests</strong></p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>To improve our AI algorithms and website functionality.</li>
            <li>To send strictly operational emails (e.g., &quot;Course Ready for Download&quot;, &quot;Password Reset&quot;).</li>
          </ul>
        </div>
      </Card>

      {/* Sharing of Personal Data */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">4. Sharing of Personal Data</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>To provide our services, we may share your data with trusted third parties. We require all third parties to respect the security of your personal data and to treat it in accordance with the law.</p>
          <ol className="list-decimal pl-5 space-y-2 ml-4">
            <li><strong>Contracted Fitness Trainers:</strong> If you purchase a &quot;Trainer Course,&quot; we share your Physical & Health Data with the specific human trainer assigned to your order so they can compile your PDF plan.</li>
            <li><strong>AI Technology Providers:</strong> If you purchase an &quot;AI Course,&quot; your anonymized or pseudonymized metrics are processed by our AI algorithms to generate the content instantly.</li>
            <li><strong>Payment Processors:</strong> We use secure third-party payment gateways to process Visa/Mastercard transactions. They process your financial data independently.</li>
            <li><strong>Service Providers:</strong> Cloud hosting services (to store your PDF files securely), email delivery services (to send your plans), and IT support.</li>
            <li><strong>Professional Advisers:</strong> Accountants and lawyers for legal and financial compliance.</li>
          </ol>
          <p><strong>We do NOT sell your personal data to advertisers.</strong></p>
        </div>
      </Card>

      {/* International Data Transfers */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">5. International Data Transfers</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Our servers and third-party service providers (e.g., cloud hosting) may be located outside the UK or the European Economic Area (EEA).</p>
          <p>If we transfer your data out of the UK, we ensure a similar degree of protection is afforded to it by ensuring at least one of the following safeguards is implemented:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>The country is deemed to provide an adequate level of protection; or</li>
            <li>We use specific contracts approved by the UK Information Commissioner&apos;s Office (ICO) regarding personal data protection (Standard Contractual Clauses).</li>
          </ul>
        </div>
      </Card>

      {/* Data Retention */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">6. Data Retention</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>We retain your personal data only as long as necessary to fulfill the purposes we collected it for:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Account & Health Data:</strong> Retained while your account is active to allow you to download past courses. If you delete your account, this data is anonymized or erased within 30 days.</li>
            <li><strong>Financial Records:</strong> Kept for 6 years to comply with UK tax laws.</li>
            <li><strong>Token History:</strong> Retained for audit purposes as long as the account exists.</li>
          </ul>
        </div>
      </Card>

      {/* Your Legal Rights */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">7. Your Legal Rights</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Under the UK GDPR, you have the right to:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data (e.g., updating your weight or email).</li>
            <li><strong>Erasure (Right to be Forgotten):</strong> Request deletion of your data (subject to our legal tax obligations).</li>
            <li><strong>Restriction:</strong> Request restriction of processing.</li>
            <li><strong>Data Portability:</strong> Request transfer of your data to you or another provider.</li>
          </ul>
          <p>To exercise these rights, please contact us at info@chaletcoaching.co.uk.</p>
        </div>
      </Card>

      {/* Data Security */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">8. Data Security</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>We implement robust security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li>We use SSL/TLS encryption for all data in transit.</li>
            <li>Access to your Health Data is restricted to employees and trainers who have a direct business need to know.</li>
            <li>Files stored in the dashboard are protected by authentication protocols.</li>
          </ul>
        </div>
      </Card>

      {/* Third-Party Links */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">9. Third-Party Links</h2>
        <p className="opacity-90 text-sm">
          Our website may contain links to third-party websites. Clicking on those links may allow third parties to collect data about you. We do not control these third-party websites and are not responsible for their privacy statements.
        </p>
      </Card>

      {/* Updates to This Policy */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">10. Updates to This Policy</h2>
        <p className="opacity-90 text-sm">
          We may update this Privacy Policy from time to time. The new version will be posted on this page with an updated &quot;Effective Date&quot;. Continued use of the Service constitutes acceptance of the updated policy.
        </p>
      </Card>

      {/* Contact Us */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">11. Contact Us</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>If you have any questions about this Privacy Policy or how we handle your health data, please contact:</p>
          <div className="space-y-1">
            <p><strong>CHALET AQUARIUS LTD</strong></p>
            <p><strong>Address:</strong> 20 Wenlock Road, London, England, N1 7GU</p>
            <p><strong>Email:</strong> info@chaletcoaching.co.uk</p>
            <p><strong>Phone:</strong> +44 7441 392840</p>
          </div>
        </div>
      </Card>
    </main>
  );
}
