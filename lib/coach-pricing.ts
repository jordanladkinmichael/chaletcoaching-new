/**
 * Coach Session Pricing — flat rate for all coaches.
 * Every coach costs HOURLY_RATE tokens per hour.
 */

export const HOURLY_RATE = 10_000; // tokens per hour

export const SESSION_DURATIONS = [
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 3, label: "3 hours" },
] as const;

export type DurationHours = 1 | 2 | 3;

export function isValidDuration(h: number): h is DurationHours {
  return h === 1 || h === 2 || h === 3;
}

export function getSessionCost(durationHours: number): number {
  return durationHours * HOURLY_RATE;
}

/**
 * Generate available start-time slots for a given date and duration.
 * Slots run from 08:00 to 20:00 in 1-hour increments.
 * The last valid start = 20:00 − durationHours (session must finish by 20:00).
 */
export function generateAvailableSlots(
  _date: Date,
  durationHours: number
): string[] {
  const lastStartHour = 20 - durationHours;
  const slots: string[] = [];
  for (let hour = 8; hour <= lastStartHour; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/**
 * Check if a date is in the past (before today).
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Check if a date is today.
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
