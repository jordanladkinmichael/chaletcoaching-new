import { authMessages } from "./auth";
import { commonMessages } from "./common";
import { faqPageMessages } from "./faq";
import { footerMessages } from "./footer";
import { headerMessages } from "./header";
import { metadataMessages } from "./metadata";
import { supportMessages } from "./support";

export const messages = {
  en: {
    common: commonMessages.en,
    header: headerMessages.en,
    footer: footerMessages.en,
    auth: authMessages.en,
    faq: faqPageMessages.en,
    support: supportMessages.en,
    metadata: metadataMessages.en,
  },
  tr: {
    common: commonMessages.tr,
    header: headerMessages.tr,
    footer: footerMessages.tr,
    auth: authMessages.tr,
    faq: faqPageMessages.tr,
    support: supportMessages.tr,
    metadata: metadataMessages.tr,
  },
} as const;

export type MessageTree = {
  [key: string]: string | MessageTree;
};

export type Messages = {
  [K in keyof (typeof messages)["en"]]: MessageTree;
};
