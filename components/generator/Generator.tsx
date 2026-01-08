"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings2,
  Sparkles,
  ShieldAlert,
  Lock,
  Info,
} from "lucide-react";
import {
  Container,
  Card,
  H1,
  Paragraph,
  Button,
  Accordion,
  SearchInput,
} from "@/components/ui";
import { AccentButton, GhostButton } from "@/components/ui/legacy-buttons";
import { Spinner } from "@/components/ui/misc";
import { useDebounce } from "@/lib/hooks";
import { THEME } from "@/lib/theme";
import {
  TOKENS_PER_UNIT,
  PREVIEW_COST,
  REGEN_DAY,
  REGEN_WEEK,
  calcFullCourseTokens,
  currencyForRegion,
  WORKOUT_TYPES,
  MUSCLE_GROUPS,
  type GeneratorOpts,
} from "@/lib/tokens";
import { cn } from "@/lib/utils";

type Region = "EU" | "UK" | "US";

export type GeneratorProps = {
  region: Region;
  requireAuth: boolean;
  openAuth: () => void;
  onGeneratePreview: (opts: GeneratorOpts) => Promise<void> | void;
  onPublishCourse: (opts: GeneratorOpts) => Promise<void> | void;
  balance: number;
  loading: "preview" | "publish" | null;
  // Optional status props (used by GeneratorPageContent)
  errorMsg?: string | null;
  errorType?: "insufficient_tokens" | "api_error" | null;
  successMsg?: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
};

export function Generator({
  region,
  requireAuth,
  openAuth,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onGeneratePreview: _onGeneratePreview,
  onPublishCourse,
  balance,
  loading,
  errorMsg,
  errorType,
  successMsg,
  onClearError,
  onClearSuccess,
}: GeneratorProps) {
  const [weeks, setWeeks] = useState<number>(4);
  const [sessions, setSessions] = useState<number>(4);
  const [injurySafe, _setInjurySafe] = useState<boolean>(true);
  const [specEq, _setSpecEq] = useState<boolean>(false);
  const [nutrition, _setNutrition] = useState<boolean>(false);
  const [pdf, _setPdf] = useState<"text" | "illustrated">("text");
  const [images, _setImages] = useState<number>(12);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [workoutTypes, setWorkoutTypes] = useState<string[]>([]);
  const [targetMuscles, setTargetMuscles] = useState<string[]>([]);

  // Search states
  const [workoutTypesSearch, setWorkoutTypesSearch] = useState<string>("");
  const [targetMusclesSearch, setTargetMusclesSearch] = useState<string>("");

  // Debounced search values
  const debouncedWorkoutSearch = useDebounce(workoutTypesSearch, 175);
  const debouncedMuscleSearch = useDebounce(targetMusclesSearch, 175);

  // Workout Types presets mapping
  const WORKOUT_PRESETS = {
    strength: [
      "Full-Body Strength",
      "Upper/Lower Split",
      "Push / Pull / Legs (PPL)",
      "Hypertrophy (Bodybuilding)",
      "Powerlifting Fundamentals (SQ/BN/DL)",
      "Barbell-only",
    ],
    home: [
      "Home Minimal Equipment",
      "Calisthenics (Bodyweight)",
      "Resistance Bands / Mini-bands",
      "TRX / Suspension",
      "Low-Impact / Joint-friendly",
      "Dumbbell-only",
    ],
    mobility: [
      "Mobility & Flexibility",
      "Core & Stability",
      "Low-Impact / Joint-friendly",
      "Rings Fundamentals",
    ],
  };

  // Filtered workout types based on search
  const filteredWorkoutTypes = React.useMemo(() => {
    if (!debouncedWorkoutSearch) return WORKOUT_TYPES;
    const searchLower = debouncedWorkoutSearch.toLowerCase();
    return WORKOUT_TYPES.filter((type) => type.toLowerCase().includes(searchLower));
  }, [debouncedWorkoutSearch]);

  // Filtered target muscles based on search
  const filteredMuscleGroups = React.useMemo(() => {
    if (!debouncedMuscleSearch) return MUSCLE_GROUPS;
    const searchLower = debouncedMuscleSearch.toLowerCase();
    return MUSCLE_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((muscle) => {
        const aliasesMatch =
          "aliases" in muscle && Array.isArray((muscle as { aliases?: readonly string[] }).aliases)
            ? ((muscle as { aliases?: readonly string[] }).aliases ?? []).some((alias) =>
                alias.toLowerCase().includes(searchLower)
              )
            : false;

        return (
          muscle.label.toLowerCase().includes(searchLower) ||
          muscle.id.toLowerCase().includes(searchLower) ||
          aliasesMatch
        );
      }),
    })).filter((group) => group.items.length > 0);
  }, [debouncedMuscleSearch]);

  // Preset toggle handlers
  const handlePresetToggle = (presetKey: keyof typeof WORKOUT_PRESETS) => {
    const presetTypes = WORKOUT_PRESETS[presetKey];
    const allSelected = presetTypes.every((type) => workoutTypes.includes(type));

    if (allSelected) {
      // Remove all preset types
      setWorkoutTypes(workoutTypes.filter((type) => !presetTypes.includes(type)));
    } else {
      // Add all preset types (union, no duplicates)
      setWorkoutTypes([...new Set([...workoutTypes, ...presetTypes])]);
    }
  };

  // Калькуляция стоимости через calcFullCourseTokens
  const courseCost = React.useMemo(() => {
    const opts: GeneratorOpts = {
      weeks,
      sessionsPerWeek: sessions,
      injurySafe,
      specialEquipment: specEq,
      nutritionTips: nutrition,
      pdf,
      images,
      videoPlan: false, // Video guide removed, always false for backward compatibility
      gender,
      workoutTypes,
      targetMuscles,
    };
    return calcFullCourseTokens(opts);
  }, [weeks, sessions, injurySafe, specEq, nutrition, pdf, images, gender, workoutTypes, targetMuscles]);

  const buildOpts = React.useCallback(
    (): GeneratorOpts => {
      const opts = {
        weeks,
        sessionsPerWeek: sessions,
        injurySafe,
        specialEquipment: specEq,
        nutritionTips: nutrition,
        pdf,
        images,
        videoPlan: false, // Video guide removed, always false for backward compatibility
        gender,
        workoutTypes,
        targetMuscles,
      };
      console.log("Building options:", opts);
      return opts;
    },
    [weeks, sessions, injurySafe, specEq, nutrition, pdf, images, gender, workoutTypes, targetMuscles]
  );

  const [errorsMap, setErrorsMap] = React.useState<{
    gender?: string;
    workoutTypes?: string;
    targetMuscles?: string;
  }>({});

  const handlePublish = async () => {
    const nextErrors: typeof errorsMap = {};
    if (!gender) nextErrors.gender = "Select gender";
    if (workoutTypes.length === 0) nextErrors.workoutTypes = "Select at least one workout type";
    if (targetMuscles.length === 0) nextErrors.targetMuscles = "Select at least one target muscle";

    setErrorsMap(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const opts = buildOpts();
      console.log("Sending publish options:", opts);
      await onPublishCourse(opts);
    } catch (error) {
      console.error("Course publication failed:", error);
    }
  };

  return (
    <Container>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <H1>Instant AI Training Plan Generator</H1>
          <Paragraph className="text-lg max-w-2xl mx-auto">
            Build a personalized plan in minutes. Preview first, then publish when ready.
          </Paragraph>
          <div>
            <Link
              href="/coaches"
              className="text-primary hover:text-primary-hover underline text-sm font-medium"
            >
              Prefer a coach? Browse coaches
            </Link>
          </div>
        </div>

        {/* Main Form and Cost Panel */}
        <div className="space-y-6">
          <Card>
            {(errorMsg || successMsg) && (
              <div className="mb-4 space-y-3">
                {errorMsg && (
                  <div
                    className="rounded-lg border px-3 py-2 text-sm flex items-start gap-2"
                    style={{ borderColor: THEME.danger, background: "#2a1618" }}
                  >
                    <ShieldAlert size={16} className="mt-0.5 text-danger" />
                    <div className="flex-1">
                      <div className="font-semibold">
                        Error{errorType ? ` (${errorType.replace("_", " ")})` : ""}
                      </div>
                      <div className="opacity-80">{errorMsg}</div>
                    </div>
                    {onClearError && (
                      <button
                        type="button"
                        className="text-xs underline opacity-80 hover:opacity-100"
                        onClick={onClearError}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                )}
                {successMsg && (
                  <div
                    className="rounded-lg border px-3 py-2 text-sm flex items-start gap-2"
                    style={{ borderColor: THEME.success, background: "#13271d" }}
                  >
                    <Sparkles size={16} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold">Success</div>
                      <div className="opacity-80">{successMsg}</div>
                    </div>
                    {onClearSuccess && (
                      <button
                        type="button"
                        className="text-xs underline opacity-80 hover:opacity-100"
                        onClick={onClearSuccess}
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Settings2 size={18} /> Generator
            </h3>

            {/* Progressive Disclosure: 3 Accordion sections */}
            <div className="mt-4">
              <Accordion
                items={[
                  {
                    id: "required",
                    title: "Required inputs",
                    content: (
                      <div className="space-y-6">
                        {/* Основные параметры */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium opacity-80">
                              Program Duration (1-12 weeks)
                            </label>
                            <input
                              type="range"
                              min={1}
                              max={12}
                              value={weeks}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= 1 && value <= 12) {
                                  setWeeks(value);
                                }
                              }}
                              className="w-full mt-2"
                            />
                            <div className="text-sm mt-1 opacity-70 flex justify-between">
                              <span>1 week</span>
                              <span>
                                <b>{weeks}</b> weeks
                              </span>
                              <span>12 weeks</span>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium opacity-80">
                              Training Frequency (2-6 sessions/week)
                            </label>
                            <input
                              type="range"
                              min={2}
                              max={6}
                              value={sessions}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= 2 && value <= 6) {
                                  setSessions(value);
                                }
                              }}
                              className="w-full mt-2"
                            />
                            <div className="text-sm mt-1 opacity-70 flex justify-between">
                              <span>2 sessions</span>
                              <span>
                                <b>{sessions}</b> sessions
                              </span>
                              <span>6 sessions</span>
                            </div>
                          </div>
                        </div>

                        {/* Выбор пола */}
                        <div>
                        <label
                          className={cn(
                            "text-sm font-medium",
                            errorsMap.gender ? "text-red-400" : "opacity-80"
                          )}
                        >
                          Gender
                        </label>
                          <div className="flex items-center gap-4 mt-2">
                            {(["male", "female"] as const).map((g) => (
                              <label key={g} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="gender"
                                  value={g}
                                  checked={gender === g}
                                  onChange={(e) => setGender(e.target.value as "male" | "female")}
                                  className="rounded"
                                />
                                <span className="text-sm capitalize">{g}</span>
                              </label>
                            ))}
                          </div>
                        {errorsMap.gender && (
                          <div className="text-xs text-red-400 mt-1">{errorsMap.gender}</div>
                        )}
                        </div>

                        {/* Выбор типов тренировок */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label
                              className={cn(
                                "text-sm font-medium",
                                errorsMap.workoutTypes ? "text-red-400" : "opacity-80"
                              )}
                            >
                              Workout Types
                            </label>
                            {workoutTypes.length > 0 && (
                              <div className="text-xs opacity-70">Selected ({workoutTypes.length})</div>
                            )}
                          </div>

                          {/* Search input */}
                          <div className="mb-3">
                            <SearchInput
                              placeholder="Search workout types..."
                              value={workoutTypesSearch}
                              onChange={(e) => setWorkoutTypesSearch(e.target.value)}
                            />
                          </div>

                          {/* Presets */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePresetToggle("strength")}
                              className="text-xs"
                            >
                              Strength
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePresetToggle("home")}
                              className="text-xs"
                            >
                              Home
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePresetToggle("mobility")}
                              className="text-xs"
                            >
                              Mobility
                            </Button>
                            {workoutTypes.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setWorkoutTypes([])}
                                className="text-xs"
                              >
                                Clear
                              </Button>
                            )}
                          </div>

                          {/* Workout types list */}
                          <div
                            className="max-h-48 overflow-y-auto border rounded-lg p-3"
                            style={{ borderColor: errorsMap.workoutTypes ? THEME.danger : THEME.cardBorder }}
                          >
                            {filteredWorkoutTypes.length === 0 ? (
                              <div className="text-sm text-text-muted text-center py-4">
                                No workout types found
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {filteredWorkoutTypes.map((type) => (
                                  <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                                    <input
                                      type="checkbox"
                                      checked={workoutTypes.includes(type)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setWorkoutTypes([...workoutTypes, type]);
                                        } else {
                                          setWorkoutTypes(workoutTypes.filter((t) => t !== type));
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <span className="opacity-85">{type}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Выбор целевых мышц */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium opacity-80">
                              Target Muscle Groups
                            </label>
                            {targetMuscles.length > 0 && (
                              <div className="text-xs opacity-70">Selected ({targetMuscles.length})</div>
                            )}
                          </div>

                          {/* Search input */}
                          <div className="mb-3">
                            <SearchInput
                              placeholder="Search muscle groups..."
                              value={targetMusclesSearch}
                              onChange={(e) => setTargetMusclesSearch(e.target.value)}
                            />
                          </div>

                          {/* Clear button */}
                          {targetMuscles.length > 0 && (
                            <div className="mb-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTargetMuscles([])}
                                className="text-xs"
                              >
                                Clear
                              </Button>
                            </div>
                          )}

                          {/* Muscle groups list */}
                          <div
                            className="max-h-64 overflow-y-auto border rounded-lg p-3"
                            style={{ borderColor: THEME.cardBorder }}
                          >
                            {filteredMuscleGroups.length === 0 ? (
                              <div className="text-sm text-text-muted text-center py-4">
                                No muscle groups found
                              </div>
                            ) : (
                              filteredMuscleGroups.map((group) => (
                                <div key={group.group} className="mb-4 last:mb-0">
                                  <div
                                    className="font-medium text-sm mb-2 opacity-90"
                                    style={{ color: THEME.accent }}
                                  >
                                    {group.group}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-2">
                                    {group.items.map((muscle) => (
                                      <label
                                        key={muscle.id}
                                        className="flex items-center gap-2 cursor-pointer text-sm"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={targetMuscles.includes(muscle.id)}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setTargetMuscles([...targetMuscles, muscle.id]);
                                            } else {
                                              setTargetMuscles(targetMuscles.filter((m) => m !== muscle.id));
                                            }
                                          }}
                                          className="rounded"
                                        />
                                        <span className="opacity-85">{muscle.label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
                defaultOpen={["required"]}
                allowMultiple={true}
              />
            </div>

            {/* Error message (if any) */}
            {/* Note: Error handling will be added when we implement error state management */}
          </Card>

          <Card>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles size={18} /> Cost Breakdown
            </h3>

            <div className="mt-4 space-y-4">
              {/* Your balance (only for authenticated) */}
              {!requireAuth && (
                <div className="pb-4 border-b" style={{ borderColor: THEME.cardBorder }}>
                  <div className="text-sm opacity-80 mb-1">Your balance</div>
                  <div className="text-2xl font-semibold">◎ {balance}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {currencyForRegion(region).symbol} {(balance / TOKENS_PER_UNIT).toFixed(2)}
                  </div>
                </div>
              )}

              {/* Preview cost (always visible) */}
              <div className="pb-4 border-b" style={{ borderColor: THEME.cardBorder }}>
                <div className="text-sm opacity-80 mb-1">Preview cost</div>
                <div className="text-lg font-semibold">50 tokens</div>
              </div>

              {/* Full plan cost */}
              <div className="pb-4 border-b" style={{ borderColor: THEME.cardBorder }}>
                <div className="text-sm opacity-80 mb-1">Full plan cost</div>
                <div className="text-2xl font-semibold">◎ {courseCost}</div>
                <div className="text-xs opacity-70 mt-1">
                  {currencyForRegion(region).symbol} {(courseCost / TOKENS_PER_UNIT).toFixed(2)}
                </div>
              </div>

              {/* What affects the price */}
              <div>
                <div className="text-sm font-medium opacity-80 mb-3">What affects the price</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">
                      Base cost ({weeks} weeks × {sessions} sessions)
                    </span>
                    <span className="font-mono">
                      ◎ {Math.round((400 + weeks * 120 + sessions * weeks * 8) * 1.3)}
                    </span>
                  </div>

                  {workoutTypes.length > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-80">
                        Workout types ({workoutTypes.length} selected)
                      </span>
                      <span className="font-mono">◎ {Math.round(workoutTypes.length * 15 * 1.3)}</span>
                    </div>
                  )}

                  {targetMuscles.length > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className={cn("opacity-80", errorsMap.targetMuscles && "text-red-400")}>
                            Target muscles ({targetMuscles.length} selected)
                          </span>
                      <span className="font-mono">◎ {Math.round(targetMuscles.length * 8 * 1.3)}</span>
                    </div>
                  )}

                  {injurySafe && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-80">Injury-safe modifications</span>
                      <span className="font-mono">◎ {Math.round(120 * 1.3)}</span>
                    </div>
                  )}

                  {specEq && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-80">Special equipment</span>
                      <span className="font-mono">◎ {Math.round(80 * 1.3)}</span>
                    </div>
                  )}

                  {nutrition && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-80">Nutrition tips</span>
                      <span className="font-mono">◎ {Math.round(100 * 1.3)}</span>
                    </div>
                  )}

                  {/* PDF export (always included) */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-80">
                      PDF export {pdf === "illustrated" ? `(${images} images)` : ""}
                    </span>
                    <span className="font-mono">
                      ◎ {pdf === "text" ? Math.round(60 * 1.3) : Math.round((60 + images * 10) * 1.3)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Missing required inputs checklist */}
              {(!gender || workoutTypes.length === 0 || targetMuscles.length === 0) && (
                <div className="pt-4 border-t" style={{ borderColor: THEME.cardBorder }}>
                  <div className="text-sm font-medium opacity-80 mb-2">Missing required inputs</div>
                  <div className="space-y-1 text-sm">
                    {!gender && <div className="opacity-70">• Gender</div>}
                    {workoutTypes.length === 0 && <div className="opacity-70">• Workout types</div>}
                    {targetMuscles.length === 0 && <div className="opacity-70">• Target muscles</div>}
                  </div>
                </div>
              )}

              {/* See pricing link */}
              <div className="pt-4">
                <Link
                  href="/pricing"
                  className="text-primary hover:text-primary-hover underline text-sm font-medium"
                >
                  See pricing
                </Link>
              </div>

              {/* Action buttons (moved from Generator) */}
              <div className="pt-4 border-t" style={{ borderColor: THEME.cardBorder }}>
                <div className="space-y-3">
                  {requireAuth ? (
                    // Для гостей: кнопка с просьбой авторизироваться
                    <AccentButton onClick={openAuth} className="w-full justify-center">
                      <Lock size={16} /> Sign in to generate
                    </AccentButton>
                  ) : (
                    // Для авторизованных: обычные кнопки генерации
                    <>
                      {/* Not enough tokens message */}
                      {(balance < PREVIEW_COST || balance < courseCost) && (
                        <div
                          className="p-3 rounded-lg border"
                          style={{ borderColor: THEME.cardBorder, background: "#19191f" }}
                        >
                          <div className="text-sm text-text-muted mb-2">Not enough tokens</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to pricing - will be handled by parent
                              if (typeof window !== "undefined") {
                                window.location.href = "/pricing";
                              }
                            }}
                            className="text-xs"
                          >
                            Top up tokens
                          </Button>
                        </div>
                      )}

                      <GhostButton
                        onClick={handlePublish}
                        disabled={
                          loading !== null ||
                          balance < courseCost ||
                          !gender ||
                          workoutTypes.length === 0 ||
                          targetMuscles.length === 0
                        }
                        className="w-full justify-center bg-primary text-on-primary hover:bg-primary hover:text-on-primary"
                        style={{ borderColor: "transparent" }}
                      >
                        {loading === "publish" ? (
                          <>
                            <Spinner size={16} className="text-current" />
                            <span>Publishing...</span>
                          </>
                        ) : !gender || workoutTypes.length === 0 || targetMuscles.length === 0 ? (
                          <>Fill required fields</>
                        ) : balance < courseCost ? (
                          <>
                            Insufficient tokens ({balance}/{courseCost})
                          </>
                        ) : (
                          <>Generate Plan ({courseCost} tokens)</>
                        )}
                      </GhostButton>
                    </>
                  )}
                </div>

                {!requireAuth && (
                  <div className="mt-4 text-xs opacity-70 flex items-center gap-2">
                    <Info size={14} />
                    Regenerate: day −{REGEN_DAY} • week −{REGEN_WEEK}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

