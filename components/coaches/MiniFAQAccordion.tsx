"use client";

import React from "react";
import { Accordion } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { coachProfileFAQ } from "@/lib/faq-data";
import { cn } from "@/lib/utils";

interface MiniFAQAccordionProps {
  className?: string;
}

export function MiniFAQAccordion({ className }: MiniFAQAccordionProps) {
  const items = coachProfileFAQ.map((faq) => ({
    id: faq.id,
    title: faq.question,
    content: <p className="text-text-muted">{faq.answer}</p>,
  }));

  return (
    <Card className={cn("p-6", className)}>
      <h2 className="text-xl font-semibold mb-4">FAQ</h2>
      <Accordion items={items} allowMultiple />
    </Card>
  );
}

