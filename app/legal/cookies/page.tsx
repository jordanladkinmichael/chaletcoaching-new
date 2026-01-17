// app/legal/cookies/page.tsx
import React from "react";
import { Metadata } from "next";
import { THEME } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Cookies Policy — Chaletcoaching",
  description: "Cookies policy and tracking technologies information for Chaletcoaching",
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

      {/* Introduction */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">1. Introduction</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>This Cookies Policy explains how CHALET AQUARIUS LTD (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) uses cookies and similar tracking technologies on our website chaletcoaching.co.uk (the &quot;Site&quot;) and our fitness coaching dashboard.</p>
          <p>This policy should be read alongside our Privacy Policy.</p>
          <p><strong>Data Controller Details:</strong></p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Company:</strong> CHALET AQUARIUS LTD</li>
            <li><strong>Company Number:</strong> 15587263</li>
            <li><strong>Address:</strong> 20 Wenlock Road, London, England, N1 7GU</li>
            <li><strong>Email:</strong> info@chaletcoaching.co.uk</li>
          </ul>
        </div>
      </Card>

      {/* What Are Cookies? */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">2. What Are Cookies?</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, to secure user accounts, and to provide information to the owners of the site.</p>
          <p>We also use similar technologies such as:</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Local Storage (HTML5):</strong> Allows us to store data (like your current Token Balance cache or selected currency) locally on your browser so you don&apos;t lose them if you refresh the page.</li>
            <li><strong>Pixels/Tags:</strong> Small graphic files that allow us to monitor the use of our website and the effectiveness of our courses.</li>
          </ul>
        </div>
      </Card>

      {/* How We Use Cookies */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">3. How We Use Cookies</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>We use cookies to facilitate your access to the fitness dashboard, manage the Token payment system, process transactions in multiple currencies (GBP, EUR, USD), and ensure the security of your Account.</p>
          <p>We categorize cookies as follows:</p>
          
          <p><strong>3.1. Strictly Necessary Cookies (Essential)</strong></p>
          <p>These are vital for the Site to function. Without them, we cannot provide the services you request, such as logging into your secure Dashboard, maintaining your session while you navigate between courses, or processing a secure payment via Visa/Mastercard.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Consent:</strong> We do not require your consent for these cookies as the site cannot function without them.</li>
          </ul>

          <p><strong>3.2. Functional Cookies</strong></p>
          <p>These allow the Site to remember choices you make to provide a more personalized experience.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Examples:</strong> Remembering your preferred currency (e.g., switching prices from GBP to USD), your language setting, or keeping your &quot;AI Course&quot; inputs saved while you purchase Tokens.</li>
          </ul>

          <p><strong>3.3. Analytics & Performance Cookies</strong></p>
          <p>These help us understand how users interact with our Site (e.g., which workout plans are most popular, how long users stay on the dashboard). We use this data to fix errors and improve the speed of our platform.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Legal Basis:</strong> We request your consent before setting these cookies, unless the data is strictly anonymized.</li>
          </ul>

          <p><strong>3.4. Marketing & Targeting Cookies</strong></p>
          <p>These cookies record your visit to our Site, the pages you have visited, and the links you have followed. We may use this information to make our Site and the offers displayed on it more relevant to your fitness interests.</p>
        </div>
      </Card>

      {/* Examples of Cookies We Use */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">4. Examples of Cookies We Use</h2>
        <p className="mb-3 opacity-90 text-sm">Below is a non-exhaustive list of the types of storage keys we typically use:</p>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm opacity-90 border-collapse">
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <th className="text-left p-2 font-semibold">Cookie Name (Example)</th>
                <th className="text-left p-2 font-semibold">Category</th>
                <th className="text-left p-2 font-semibold">Purpose</th>
                <th className="text-left p-2 font-semibold">Lifetime</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">chalet_session</td>
                <td className="p-2">Essential</td>
                <td className="p-2">Identifies your active session so you stay logged in to the Dashboard.</td>
                <td className="p-2">Session</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">XSRF-TOKEN</td>
                <td className="p-2">Essential</td>
                <td className="p-2">Prevents Cross-Site Request Forgery attacks (security).</td>
                <td className="p-2">Session</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">currency_pref</td>
                <td className="p-2">Functional</td>
                <td className="p-2">Remembers if you selected GBP, EUR, or USD prices.</td>
                <td className="p-2">30 Days</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">token_cart_cache</td>
                <td className="p-2">Functional</td>
                <td className="p-2">Stores your selected Token Package in the cart.</td>
                <td className="p-2">Local Storage</td>
              </tr>
              <tr style={{ borderBottom: `1px solid ${THEME.cardBorder}` }}>
                <td className="p-2">_ga, _gid</td>
                <td className="p-2">Analytics</td>
                <td className="p-2">Google Analytics cookies to measure site traffic.</td>
                <td className="p-2">2 Years / 24 Hours</td>
              </tr>
              <tr>
                <td className="p-2">cookie_consent</td>
                <td className="p-2">Essential</td>
                <td className="p-2">Stores your preference regarding this Cookie Policy (Accepted/Rejected).</td>
                <td className="p-2">12 Months</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Third-Party Cookies */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">5. Third-Party Cookies</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>Please note that third parties may also use cookies, over which we have no control. These third parties include:</p>
          <ol className="list-decimal pl-5 space-y-2 ml-4">
            <li><strong>Payment Processors:</strong> When you pay for Tokens via Visa or MasterCard, the payment gateway (e.g., Stripe, WorldPay) may set cookies to detect fraud, prevent money laundering, and secure the transaction.</li>
            <li><strong>Analytics Providers:</strong> We use services like Google Analytics to track aggregate user behavior.</li>
            <li><strong>Social Media Plugins:</strong> If you use buttons to share your progress on social media, those platforms may set their own cookies.</li>
          </ol>
        </div>
      </Card>

      {/* Managing Your Preferences */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">6. Managing Your Preferences</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>You have the right to choose whether or not to accept non-essential cookies.</p>
          <ul className="list-disc pl-5 space-y-1 ml-4">
            <li><strong>Cookie Banner:</strong> When you first visit our Site, a banner will appear asking for your consent. You can choose to &quot;Accept All&quot; or &quot;Manage Settings&quot;.</li>
            <li><strong>Browser Settings:</strong> You can block cookies by activating the setting on your browser that allows you to refuse the setting of all or some cookies.
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li><strong>Warning:</strong> If you use your browser settings to block all cookies (including essential cookies), you may not be able to access your Dashboard, purchase Tokens, or download your PDF courses.</li>
              </ul>
            </li>
          </ul>
          <p>To learn more about managing cookies, visit www.allaboutcookies.org.</p>
        </div>
      </Card>

      {/* International Transfers */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">7. International Transfers</h2>
        <p className="opacity-90 text-sm">
          Some of our third-party partners (e.g., analytics providers) may process data outside the UK or EEA. In such cases, we ensure appropriate safeguards are in place in compliance with the UK GDPR and PECR.
        </p>
      </Card>

      {/* Changes to This Policy */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">8. Changes to This Policy</h2>
        <p className="opacity-90 text-sm">
          We may update this Cookies Policy from time to time. Any changes will be posted on this page with an updated &quot;Effective Date&quot;.
        </p>
      </Card>

      {/* Contact Us */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">9. Contact Us</h2>
        <div className="space-y-3 opacity-90 text-sm">
          <p>If you have any questions about how we use cookies, please contact us:</p>
          <div className="space-y-1">
            <p><strong>CHALET AQUARIUS LTD</strong></p>
            <p><strong>Email:</strong> info@chaletcoaching.co.uk</p>
            <p><strong>Address:</strong> 20 Wenlock Road, London, England, N1 7GU</p>
          </div>
        </div>
      </Card>
    </main>
  );
}
