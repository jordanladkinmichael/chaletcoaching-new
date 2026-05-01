import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import { generatePageMetadata } from "@/lib/metadata";
import { getServerLocale } from "@/lib/i18n/server";
import { messages } from "@/lib/i18n/messages";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export async function generateMetadata() {
  const locale = await getServerLocale();
  const metadataCopy = messages[locale].metadata;

  return generatePageMetadata({
    title: metadataCopy.defaultTitle,
    description: metadataCopy.defaultDescription,
    image: "/logo.webp",
    imageAlt: metadataCopy.defaultImageAlt,
  });
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className} bg-bg text-text`}
      >
        <Providers initialLocale={locale}>
          {children}
        </Providers>
        {/* Jivo Chat — loads in head before interactive, on every page */}
        <Script
          src="https://code.jivosite.com/widget/T28rAWbDAY"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
