"use client";

import * as React from "react";
import { Select } from "./select";
import { type Locale } from "@/lib/i18n/config";
import { useLocale, useTranslations } from "@/lib/i18n/client";

export function LanguageDropdown() {
  const { locale, setLocale } = useLocale();
  const tCommon = useTranslations("common");

  const options = React.useMemo(
    () => [
      { value: "en", label: tCommon("english") },
      { value: "tr", label: tCommon("turkish") },
    ],
    [tCommon]
  );

  return (
    <Select
      aria-label={tCommon("language")}
      options={options}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      className="w-auto min-w-[132px]"
    />
  );
}
