import { Metadata } from "next";
import LegalLayoutClient from "./layout-client";
import { getServerLocale } from "@/lib/i18n/server";
import { messages } from "@/lib/i18n/messages";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const metadataCopy = messages[locale].metadata;

  return {
    title: metadataCopy.legalTitle,
    description: metadataCopy.legalDescription,
  };
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <LegalLayoutClient>{children}</LegalLayoutClient>;
}
