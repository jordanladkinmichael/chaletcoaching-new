import { THEME } from "@/lib/theme";
import type { LegalPageId } from "@/lib/legal-copy";
import { getLegalCopy } from "@/lib/legal-copy";
import type { Locale } from "@/lib/i18n/config";

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

export default function LegalPage({ locale, page }: { locale: Locale; page: LegalPageId }) {
  const copy = getLegalCopy(locale, page);

  return (
    <div className="space-y-8" style={{ color: THEME.text }}>
      <header className="space-y-2">
        <div
          className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1"
          style={{
            background: "#19191f",
            border: `1px solid ${THEME.cardBorder}`,
            color: THEME.secondary,
          }}
        >
          {copy.badge}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          {copy.title} <span style={{ color: THEME.accent }}>{copy.accent}</span>
        </h1>
        <p className="opacity-80 text-sm">
          {copy.dateLabel} {copy.effectiveDate}
        </p>
        {copy.disclaimer && (
          <p
            className="max-w-3xl rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: THEME.cardBorder, background: "#19191f" }}
          >
            {copy.disclaimer}
          </p>
        )}
      </header>

      {copy.sections.map((section) => (
        <Card key={section.title}>
          <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
          <div className="space-y-3 opacity-90 text-sm">
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul className="list-disc pl-5 space-y-1 ml-4">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
