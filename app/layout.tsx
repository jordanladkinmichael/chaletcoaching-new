import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "Chaletcoaching",
  description: "AI-powered fitness course generator",
  metadataBase: new URL("https://chaletcoaching.co.uk"),
  openGraph: {
    title: "Chaletcoaching",
    description: "AI-powered fitness course generator",
    images: [
      {
        url: "/logo.webp",
        alt: "Chalet Coaching",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chaletcoaching",
    description: "AI-powered fitness course generator",
    images: ["/logo.webp"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${inter.className} bg-bg text-text`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
