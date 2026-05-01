import LegalPage from "@/components/legal/legal-page";
import { getServerLocale } from "@/lib/i18n/server";
import { getLegalCopy } from "@/lib/legal-copy";

const page = "privacy";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const copy = getLegalCopy(locale, page);
  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  };
}

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  return <LegalPage locale={locale} page={page} />;
}
