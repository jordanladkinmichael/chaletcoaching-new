import "./globals.css";
import { Inter, Space_Grotesk } from "next/font/google";
import Providers from "./providers";
import { generatePageMetadata } from "@/lib/metadata";

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

export const metadata = generatePageMetadata({
  title: undefined, // Will use default "Chaletcoaching"
  description: "AI-powered personalized fitness training plans. Get custom workout programs tailored to your goals, level, and preferences.",
  image: "/logo.webp",
  imageAlt: "Chaletcoaching - AI-powered fitness training",
});

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
