"use client";

import React, { useState, useMemo, useCallback } from "react";
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { THEME } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  HOURLY_RATE,
  getSessionCost,
  SESSION_DURATIONS,
  generateAvailableSlots,
  isDateInPast,
  isToday,
} from "@/lib/coach-pricing";
import { cn } from "@/lib/utils";

interface BookSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachId: string;
  coachSlug: string;
  coachName: string;
  balance: number;
  onBook: (booking: {
    coachId: string;
    coachSlug: string;
    coachName: string;
    date: string; // ISO string
    durationHours: number;
    notes: string;
  }) => Promise<void>;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BookSessionModal({
  isOpen,
  onClose,
  coachId,
  coachSlug,
  coachName,
  balance,
  onBook,
}: BookSessionModalProps) {
  const [step, setStep] = useState<"date" | "time" | "confirm">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(1); // hours
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar state
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  const cost = getSessionCost(selectedDuration);
  const hasEnough = balance >= cost;

  // Calendar grid generation
  const calendarDays = useMemo(() => {
    const { month, year } = viewMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [viewMonth]);

  // Generate slots that respect selected duration
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateAvailableSlots(selectedDate, selectedDuration);
  }, [selectedDate, selectedDuration]);

  // Filter out past time slots for today
  const filteredSlots = useMemo(() => {
    if (!selectedDate || !isToday(selectedDate)) return availableSlots;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return availableSlots.filter((slot) => {
      const [h] = slot.split(":").map(Number);
      return h * 60 > currentMinutes + 60; // At least 1hr from now
    });
  }, [availableSlots, selectedDate]);

  const handleDateSelect = useCallback((date: Date) => {
    if (isDateInPast(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
    setStep("time");
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  }, []);

  // When duration changes, clear selected time (slots may differ)
  const handleDurationChange = useCallback((hours: number) => {
    setSelectedDuration(hours);
    setSelectedTime(null);
    if (step === "confirm") setStep("time");
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError(null);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(hours, minutes, 0, 0);

      await onBook({
        coachId,
        coachSlug,
        coachName,
        date: bookingDate.toISOString(),
        durationHours: selectedDuration,
        notes,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedDate, selectedTime, selectedDuration, notes, coachId, coachSlug, coachName, onBook, onClose]);

  const resetAndClose = useCallback(() => {
    setStep("date");
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedDuration(1);
    setNotes("");
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetAndClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border bg-surface shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ borderColor: THEME.border }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-surface p-5 rounded-t-2xl" style={{ borderColor: THEME.border }}>
          <div>
            <h2 className="text-xl font-bold">Book a Training Session</h2>
            <p className="text-sm text-text-muted mt-0.5">
              with {coachName} &middot; {HOURLY_RATE.toLocaleString()} tokens/hour
            </p>
          </div>
          <button onClick={resetAndClose} className="p-2 rounded-lg hover:bg-surface-hover transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Step indicators */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {[
              { key: "date", label: "Date" },
              { key: "time", label: "Time" },
              { key: "confirm", label: "Confirm" },
            ].map(({ key, label }, i) => (
              <React.Fragment key={key}>
                {i > 0 && <div className="h-px flex-1 bg-border" />}
                <button
                  onClick={() => {
                    if (key === "date") setStep("date");
                    if (key === "time" && selectedDate) setStep("time");
                    if (key === "confirm" && selectedDate && selectedTime) setStep("confirm");
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full transition-colors",
                    step === key
                      ? "bg-primary text-on-primary"
                      : "text-text-muted hover:text-text"
                  )}
                >
                  {label}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Duration selector (always visible) */}
          <div>
            <label className="text-sm font-medium mb-2 block">Session Duration</label>
            <div className="flex gap-2">
              {SESSION_DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDurationChange(d.value)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-sm font-medium border transition-colors",
                    selectedDuration === d.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="mt-1.5 text-xs text-text-muted">
              Cost: <span className="font-semibold" style={{ color: THEME.primary }}>{getSessionCost(selectedDuration).toLocaleString()} tokens</span>
            </div>
          </div>

          {/* ── STEP: DATE ── */}
          {step === "date" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() =>
                    setViewMonth((prev) => {
                      const m = prev.month - 1;
                      return m < 0 ? { month: 11, year: prev.year - 1 } : { month: m, year: prev.year };
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-semibold">
                  {MONTHS[viewMonth.month]} {viewMonth.year}
                </span>
                <button
                  onClick={() =>
                    setViewMonth((prev) => {
                      const m = prev.month + 1;
                      return m > 11 ? { month: 0, year: prev.year + 1 } : { month: m, year: prev.year };
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-text-muted py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const past = isDateInPast(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const today = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      disabled={past}
                      onClick={() => handleDateSelect(day)}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-medium transition-colors flex items-center justify-center",
                        past && "opacity-30 cursor-not-allowed",
                        !past && !selected && "hover:bg-surface-hover",
                        selected && "bg-primary text-on-primary",
                        today && !selected && "ring-1 ring-primary"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP: TIME ── */}
          {step === "time" && selectedDate && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-text-muted" />
                <span className="text-sm font-medium">
                  {selectedDate.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {filteredSlots.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <Clock size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No available slots for this date and duration.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setStep("date")}>
                    Pick another date
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto">
                  {filteredSlots.map((slot) => {
                    const [h] = slot.split(":").map(Number);
                    const endHour = h + selectedDuration;
                    const endLabel = `${endHour.toString().padStart(2, "0")}:00`;

                    return (
                      <button
                        key={slot}
                        onClick={() => handleTimeSelect(slot)}
                        className={cn(
                          "py-2 rounded-lg text-sm font-medium border transition-colors",
                          selectedTime === slot
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40"
                        )}
                        title={`${slot} – ${endLabel}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredSlots.length > 0 && selectedDuration > 1 && (
                <p className="text-xs text-text-muted mt-2">
                  Selecting a start time books a {selectedDuration}-hour block ending at {selectedDuration} hours later.
                </p>
              )}
            </div>
          )}

          {/* ── STEP: CONFIRM ── */}
          {step === "confirm" && selectedDate && selectedTime && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-xl border p-4 space-y-2 text-sm" style={{ borderColor: THEME.border }}>
                <div className="flex justify-between">
                  <span className="text-text-muted">Coach</span>
                  <span className="font-medium">{coachName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Date</span>
                  <span className="font-medium">
                    {selectedDate.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Time</span>
                  <span className="font-medium">
                    {selectedTime} – {(() => {
                      const [h] = selectedTime.split(":").map(Number);
                      return `${(h + selectedDuration).toString().padStart(2, "0")}:00`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Duration</span>
                  <span className="font-medium">{selectedDuration} hour{selectedDuration > 1 ? "s" : ""}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold" style={{ borderColor: THEME.border }}>
                  <span>Cost</span>
                  <span style={{ color: THEME.primary }}>{cost.toLocaleString()} tokens</span>
                </div>
              </div>

              {/* Balance check */}
              {!hasEnough && (
                <div className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
                  Insufficient balance. You have {balance.toLocaleString()} tokens but need {cost.toLocaleString()}.
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything the coach should know..."
                  rows={2}
                  className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40"
                  style={{ borderColor: THEME.border }}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-danger/40 bg-danger/5 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={submitting || !hasEnough}
                isLoading={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Booking..." : `Confirm Booking — ${cost.toLocaleString()} tokens`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
