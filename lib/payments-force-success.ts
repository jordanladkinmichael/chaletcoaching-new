export function isForceSuccessEnabled(): boolean {
  const flag = (process.env.PAYMENTS_FORCE_SUCCESS || "").trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(flag);
}

