type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function maskCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "***";
  return `${digits.slice(0, 6)}******${digits.slice(-4)}`;
}

function redactValue(key: string, value: unknown): unknown {
  if (value == null) return value;

  const lowerKey = key.toLowerCase();
  if (
    lowerKey.includes("authorization") ||
    lowerKey.includes("token") ||
    lowerKey.includes("secret") ||
    lowerKey.includes("password")
  ) {
    return "***";
  }

  if (typeof value === "string") {
    if (lowerKey.includes("cardnumber") || lowerKey === "pan") {
      return maskCardNumber(value);
    }
    if (lowerKey.includes("cvv") || lowerKey.includes("cvv2")) {
      return "***";
    }
    if (lowerKey.includes("pareq")) {
      return `${value.slice(0, 24)}...`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(key, item));
  }

  const record = asRecord(value);
  if (!record) return value;

  return Object.fromEntries(
    Object.entries(record).map(([childKey, childValue]) => [childKey, redactValue(childKey, childValue)]),
  );
}

export function redactCardServData(value: unknown): unknown {
  return redactValue("root", value);
}

export function logCardServEvent(event: string, payload: unknown) {
  const formatted = JSON.stringify(redactCardServData(payload), null, 2);
  console.info(`[CardServ] ${event}\n${formatted}`);
}
