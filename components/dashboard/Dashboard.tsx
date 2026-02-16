"use client";

import React from "react";
import Image from "next/image";
import {
  Dumbbell,
  Eye,
  FileDown,
  Lock,
  LogIn,
  RefreshCw,
  Timer,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { THEME } from "@/lib/theme";
import { TOKENS_PER_UNIT, formatNumber, generateCourseTitle, type GeneratorOpts } from "@/lib/tokens";

const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = String(v ?? "");
    if (new RegExp('[",\\n]').test(s)) return `"${s.replace(new RegExp('"', 'g'), '""')}"`;
    return s;
  };
  const csv =
    headers.join(",") +
    "\n" +
    rows.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Card({
  className = "",
  children,
  interactive = false,
}: {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        interactive && "hover:border-opacity-60 transition-colors cursor-pointer",
        className
      )}
      style={{ borderColor: THEME.cardBorder }}
    >
      {children}
    </div>
  );
}

function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={cn("animate-spin", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="31.416"
          strokeDashoffset="15.708"
          className="opacity-75"
        />
      </svg>
    </div>
  );
}

function AccentButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-[0_0_0_1px_rgba(0,0,0,0.6)]",
        className
      )}
      style={{ background: THEME.accent, color: "#0E0E10" }}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border",
        className
      )}
      style={{
        background: "transparent",
        color: THEME.text,
        borderColor: THEME.cardBorder,
      }}
    >
      {children}
    </button>
  );
}
export function Dashboard({ requireAuth, openAuth, balance, currentPreview, onDismissPreview, onPublishCourse, loadBalance, balanceLoading }: { 
  requireAuth: boolean; 
  openAuth: () => void;
  balance: number;
  currentPreview?: {
    title: string;
    description: string;
    images?: string[];
    originalOpts: GeneratorOpts;
  } | null;
  onDismissPreview?: () => void;
  onPublishCourse: (opts: GeneratorOpts) => Promise<void>;
  loadBalance: () => Promise<void>;
  balanceLoading: boolean;
}) {
  // Типы должны быть определены вне компонента или в начале
  type CourseItem = {
    id: string;
    title: string;
    tokensSpent: number;
    pdfUrl: string | null;
    createdAt: string;
    options: string;
  };

  type CoachRequestItem = {
    id: string;
    coachId: string;
    coachSlug: string;
    goal: string;
    level: string;
    trainingType: string;
    equipment: string;
    daysPerWeek: number;
    status: "pending" | "processing" | "done" | "failed";
    tokensCharged: number;
    courseId: string | null;
    error: string | null;
    pdfUrl: string | null;
    availableAt: string | null;
    createdAt: string;
    updatedAt: string;
  };

  type TxItem = {
    id: string;
    type: "topup" | "spend";
    amount: number;
    createdAt: string;
    meta?: {
      reason?: string;
      source?: string;
      currency?: string;
      money?: number;
      [key: string]: unknown;
    };
  };

  // Все хуки должны быть в начале компонента
  const [loading, setLoading] = React.useState(true);
  const [courses, setCourses] = React.useState<CourseItem[]>([]);
  const [coachRequests, setCoachRequests] = React.useState<CoachRequestItem[]>([]);
  const [transactions, setTransactions] = React.useState<TxItem[]>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [generatingPDF, setGeneratingPDF] = React.useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = React.useState<Record<string, 'idle' | 'generating' | 'ready' | 'error'>>({});
  const [selectedCourse, setSelectedCourse] = React.useState<CourseItem | null>(null);
  const [showCourseModal, setShowCourseModal] = React.useState(false);
  const [regeneratingDay, setRegeneratingDay] = React.useState(false);
  const [selectedWeek, setSelectedWeek] = React.useState(1);
  const [selectedDay, setSelectedDay] = React.useState(1);
  const [publishingCourse, setPublishingCourse] = React.useState(false);
  const ITEMS_PER_PAGE = 20;

  // Функция для polling статуса PDF
  const pollPdfStatus = React.useCallback((courseId: string) => {
    const maxAttempts = 90; // 90 попыток = 3 минуты (каждые 2 секунды)
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch(`/api/courses/generate-pdf?courseId=${courseId}`);
        
        if (!response.ok) {
          console.error(`Failed to check PDF status: ${response.status}`);
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setPdfStatus(prev => ({ ...prev, [courseId]: 'error' }));
            setGeneratingPDF(prev => prev === courseId ? null : prev);
          }
          return;
        }
        
        const data = await response.json();
        
        if (data.status === 'completed' && data.pdfUrl) {
          clearInterval(interval);
          setPdfStatus(prev => ({ ...prev, [courseId]: 'ready' }));
          setGeneratingPDF(prev => prev === courseId ? null : prev);
          // Обновляем курс с новым pdfUrl
          setCourses(prev => prev.map(c => 
            c.id === courseId ? { ...c, pdfUrl: data.pdfUrl } : c
          ));
          // Обновляем также coachRequests, если курс связан с запросом
          setCoachRequests(prev => prev.map(req => 
            req.courseId === courseId ? { ...req, pdfUrl: data.pdfUrl } : req
          ));
          console.log(`PDF ready for course ${courseId}:`, data.pdfUrl);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPdfStatus(prev => ({ ...prev, [courseId]: 'error' }));
          setGeneratingPDF(prev => prev === courseId ? null : prev);
          console.warn(`PDF generation timeout for course ${courseId}`);
        }
      } catch (error) {
        console.error(`Error polling PDF status for course ${courseId}:`, error);
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPdfStatus(prev => ({ ...prev, [courseId]: 'error' }));
          setGeneratingPDF(prev => prev === courseId ? null : prev);
        }
      }
    }, 2000); // Проверяем каждые 2 секунды

    // Интервал сам очистится при достижении maxAttempts или успехе
  }, []);

  // Функция для проверки статуса PDF (без запуска генерации)
  const checkPdfStatus = React.useCallback(async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/generate-pdf?courseId=${courseId}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      if (data.status === 'completed' && data.pdfUrl) {
        // PDF уже готов
        setPdfStatus(prev => ({ ...prev, [courseId]: 'ready' }));
        setCourses(prev => prev.map(c => 
          c.id === courseId ? { ...c, pdfUrl: data.pdfUrl } : c
        ));
        // Обновляем также coachRequests, если курс связан с запросом
        setCoachRequests(prev => prev.map(req => 
          req.courseId === courseId ? { ...req, pdfUrl: data.pdfUrl } : req
        ));
        return true;
      } else if (data.status === 'processing') {
        // PDF генерируется - запускаем polling
        setPdfStatus(prev => ({ ...prev, [courseId]: 'generating' }));
        pollPdfStatus(courseId);
        return false;
      }
      return null;
    } catch (error) {
      console.error(`Error checking PDF status for course ${courseId}:`, error);
      return null;
    }
  }, [pollPdfStatus]);

  // Подписка на событие публикации курса
  const onCoursePublished = React.useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ courseId: string }>;
    const courseId = customEvent.detail?.courseId;
    console.log("Detected course:published event – refreshing courses", { courseId });
    
    fetch("/api/courses/list").then(r => r.json()).then(j => {
      const coursesData = Array.isArray(j.items) ? j.items : [];
      setCourses(coursesData);
      
      // Если есть courseId из события, проверяем статус PDF для нового курса
      if (courseId) {
        // Небольшая задержка, чтобы дать время Inngest запустить генерацию
        setTimeout(() => {
          checkPdfStatus(courseId);
        }, 1000);
      }
    }).catch(err => console.error("Failed to refresh courses after publish:", err));
  }, [checkPdfStatus]);

  // Все хуки должны быть здесь, до условного возврата
  // Загрузка начальных данных
  React.useEffect(() => {
    let cancelled = false;

    async function fetchCoursesAndTx() {
      try {
        setLoading(true);
        const [cRes, tRes, crRes] = await Promise.all([
          fetch("/api/courses/list"),
          fetch(`/api/tokens/history?limit=${ITEMS_PER_PAGE}`),
          fetch("/api/coach-requests/list"),
        ]);
        if (cancelled) return;
        const cJson = await cRes.json().catch(() => ({ items: [] }));
        const tJson = await tRes.json().catch(() => ({ items: [] }));
        const crJson = await crRes.json().catch(() => ({ items: [] }));
        const coursesData = Array.isArray(cJson.items) ? cJson.items : [];
        const transactionsData = Array.isArray(tJson.items) ? tJson.items : [];
        const coachRequestsData = Array.isArray(crJson.items) ? crJson.items : [];
        console.log("Loaded courses:", coursesData);
        console.log("Loaded transactions:", transactionsData);
        console.log("Loaded coach requests:", coachRequestsData);
        setCourses(coursesData);
        setTransactions(transactionsData);
        setCoachRequests(coachRequestsData);
        setHasMore(transactionsData?.length === ITEMS_PER_PAGE);
        
        // Проверяем статус PDF для всех курсов без pdfUrl
        if (!cancelled) {
          coursesData.forEach((course: CourseItem) => {
            if (!course.pdfUrl) {
              // Небольшая задержка между проверками, чтобы не перегрузить сервер
              setTimeout(() => {
                if (!cancelled) {
                  checkPdfStatus(course.id);
                }
              }, coursesData.indexOf(course) * 200);
            }
          });
          
          // Проверяем статус PDF для курсов коуча без pdfUrl
          coachRequestsData.forEach((req: CoachRequestItem) => {
            if (req.status === "done" && req.courseId && !req.pdfUrl) {
              // Небольшая задержка между проверками
              setTimeout(() => {
                if (!cancelled) {
                  checkPdfStatus(req.courseId!);
                }
              }, (coursesData.length * 200) + (coachRequestsData.indexOf(req) * 200));
            }
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCoursesAndTx();

    if (typeof window !== 'undefined') {
      window.addEventListener('course:published', onCoursePublished as EventListener);
    }

    return () => {
      cancelled = true;
      if (typeof window !== 'undefined') {
        window.removeEventListener('course:published', onCoursePublished as EventListener);
      }
    };
  }, [onCoursePublished]);

  // Загрузка дополнительных транзакций
  const loadMoreTransactions = React.useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const offset = (nextPage - 1) * ITEMS_PER_PAGE;
      
      const res = await fetch(`/api/tokens/history?limit=${ITEMS_PER_PAGE}&offset=${offset}`);
      const data = await res.json().catch(() => ({ items: [] }));
      
      if (Array.isArray(data.items)) {
        setTransactions(prev => [...prev, ...data.items]);
        setHasMore(data.items.length === ITEMS_PER_PAGE);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more transactions:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore]);

  // Функция регенерации дня
  const regenerateDay = React.useCallback(async (courseId: string, weekNumber: number, dayNumber: number) => {
    if (regeneratingDay) return;
    
    try {
      setRegeneratingDay(true);
      
      const response = await fetch("/api/courses/regenerate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, weekNumber, dayNumber }),
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Successfully regenerated Week ${weekNumber}, Day ${dayNumber}! Cost: ${formatNumber(data.tokensSpent)} tokens`);
        
        // Обновляем локальное состояние курса
        setCourses(prev => prev.map(course => 
          course.id === courseId 
            ? { ...course, tokensSpent: data.newTotalSpent }
            : course
        ));
        
        // Обновляем выбранный курс
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(prev => prev ? { ...prev, tokensSpent: data.newTotalSpent } : null);
        }
        
        // Обновляем транзакции
        setTransactions(prev => [{
          id: `regenerate-${Date.now()}`,
          type: "spend" as const,
          amount: data.tokensSpent,
          createdAt: new Date().toISOString(),
          meta: {
            reason: `Regenerated Week ${weekNumber}, Day ${dayNumber}`,
            courseId: courseId,
            operation: "regenerate_day"
          }
        }, ...prev]);
        
      } else {
        const error = await response.json();
        if (error.error === "Insufficient tokens") {
          alert(`Insufficient tokens! Required: ${formatNumber(error.required)}, Balance: ${formatNumber(error.balance)}`);
        } else {
          alert(`Failed to regenerate day: ${error.error}`);
        }
      }
    } catch (error) {
      console.error("Day regeneration failed:", error);
      alert("Failed to regenerate day. Please try again.");
    } finally {
      setRegeneratingDay(false);
    }
  }, [regeneratingDay, selectedCourse]);

  // Условный возврат после всех хуков
  if (requireAuth) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <Lock size={18} style={{ color: THEME.accent }} />
          <div>
            <div className="text-sm font-semibold">Sign in required</div>
            <p className="text-sm opacity-85">Log in to view your courses, history and PDFs.</p>
            <div className="mt-3 flex gap-2">
              <AccentButton onClick={openAuth}><UserPlus size={16}/> Create account</AccentButton>
              <GhostButton onClick={openAuth}><LogIn size={16}/> Sign in</GhostButton>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  function exportTransactionsCSV() {
    const rows = transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount_tokens: t.amount,
      created_at: t.createdAt,
      reason: t.meta?.reason || "",
      source: t.meta?.source || "",
    }));
    downloadCSV("tokens-history.csv", rows);
  }

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    const color = amount >= 0 ? "text-green-400" : "text-red-400";
    return (
      <span className={`font-mono ${color}`}>
        {sign}{formatNumber(amount)} ◎
      </span>
    );
  };

  const getTransactionIcon = (type: "topup" | "spend") => {
    return type === "topup" ? (
      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
        <span className="text-green-400 text-sm">+</span>
      </div>
    ) : (
      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
        <span className="text-red-400 text-sm">−</span>
      </div>
    );
  };

  const getTransactionDescription = (tx: TxItem) => {
    if (tx.type === "topup") {
      const source = tx.meta?.source || "Unknown";
      const currency = tx.meta?.currency || "";
      const money = tx.meta?.money;
      if (money && currency) {
        return `Top-up via ${source} (${currency} ${money})`;
      }
      return `Top-up via ${source}`;
    } else {
      const reason = tx.meta?.reason || "Unknown";
      return reason.charAt(0).toUpperCase() + reason.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Баланс и общая статистика */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Wallet size={18} /> Token Balance
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => void loadBalance()}
                disabled={balanceLoading}
                className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                style={{ backgroundColor: THEME.accent + '20' }}
                title="Refresh balance"
              >
                <RefreshCw size={16} className={balanceLoading ? "animate-spin" : ""} />
              </button>

            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold" style={{ color: THEME.accent }}>
              {formatNumber(balance)} ◎
            </div>
            <div className="text-sm opacity-70 mt-1">
              ≈ {(balance / TOKENS_PER_UNIT).toFixed(2)} EUR
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Dumbbell size={18} /> Courses Created
          </h3>
          <div className="mt-4">
            <div className="text-3xl font-bold" style={{ color: THEME.accent }}>
              {courses.length}
            </div>
            <div className="text-sm opacity-70 mt-1">
              Total courses in your account
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Timer size={18} /> Total Spent
          </h3>
          <div className="mt-4">
            <div className="text-3xl font-bold" style={{ color: THEME.accent }}>
              {formatNumber(transactions.filter(t => t.type === "spend").reduce((sum, t) => sum + Math.abs(t.amount), 0))} ◎
            </div>
            <div className="text-sm opacity-70 mt-1">
              Tokens spent on courses
            </div>
          </div>
        </Card>
      </div>



      {/* Preview (если есть) */}
      {currentPreview && (
        <Card className="border-2 border-yellow-400/30 bg-yellow-50/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Eye size={18} style={{ color: THEME.accent }} /> Latest Preview
            </h3>
            <div className="text-xs px-2 py-1 bg-yellow-400/20 rounded-full text-yellow-700">
              Preview
            </div>
          </div>
          
          <div className="mt-4">
            <div className="font-semibold text-lg">{currentPreview.title}</div>
            <p className="text-sm opacity-70 mt-1">{currentPreview.description}</p>
            
            {currentPreview.images && currentPreview.images.length > 0 && (
              <div className="mt-3">
                <div className="text-sm font-medium mb-2">Generated Images:</div>
                <div className="grid grid-cols-2 gap-2">
                  {currentPreview.images.map((imageUrl: string, index: number) => (
                    <Image 
                      key={index}
                      src={imageUrl} 
                      alt={`Fitness image ${index + 1}`}
                      width={320}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg"
                      unoptimized
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 flex gap-2">
              <GhostButton 
                onClick={async () => {
                  console.log("Publish Full Course button clicked in Latest Preview");
                  console.log("currentPreview:", currentPreview);
                  console.log("currentPreview.originalOpts:", currentPreview?.originalOpts);
                  
                  if (currentPreview.originalOpts) {
                    console.log("Starting course publication with opts:", currentPreview.originalOpts);
                    setPublishingCourse(true);
                    try {
                      console.log("Calling onPublishCourse...");
                      await onPublishCourse(currentPreview.originalOpts);
                      console.log("onPublishCourse completed successfully");
                    } catch (error) {
                      console.error("Failed to publish course:", error);
                      alert(`Failed to publish course: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    } finally {
                      setPublishingCourse(false);
                    }
                  } else {
                    console.error("No original options found in preview");
                    console.log("currentPreview structure:", JSON.stringify(currentPreview, null, 2));
                    alert("Cannot publish course: missing options data");
                  }
                }}
                disabled={publishingCourse}
                className="text-sm"
              >
                {publishingCourse ? (
                  <>
                    <Spinner size={16} />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Dumbbell size={16} /> Publish Full Course
                  </>
                )}
              </GhostButton>
              <GhostButton 
                onClick={onDismissPreview}
                className="text-sm"
              >
                <X size={16} /> Dismiss
              </GhostButton>
            </div>
          </div>
        </Card>
      )}

      {/* Запросы к коучам */}
      {coachRequests.length > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <UserPlus size={18} /> Coach Requests
            </h3>
          </div>
          
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {coachRequests.map((req) => {
              const statusColors = {
                pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
                processing: "bg-blue-100 text-blue-800 border-blue-300",
                done: "bg-green-100 text-green-800 border-green-300",
                failed: "bg-red-100 text-red-800 border-red-300",
              };
              
              return (
                <Card key={req.id} className="border-dashed">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs opacity-70">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border ${statusColors[req.status]}`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-semibold">
                    Goal: {req.goal}
                  </div>
                  <div className="mt-1 text-sm opacity-80">
                    {req.level} • {req.trainingType} • {req.daysPerWeek} days/week
                  </div>
                  <div className="mt-1 text-sm opacity-70">
                    Spent: {formatNumber(req.tokensCharged)} tokens
                  </div>
                  {req.status === "done" && req.courseId && (!req.availableAt || new Date(req.availableAt) <= new Date()) && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <AccentButton onClick={() => {
                        const course = courses.find(c => c.id === req.courseId);
                        if (course) {
                          setSelectedCourse(course);
                          setShowCourseModal(true);
                        }
                      }}>
                        <Eye size={16} /> Open Course
                      </AccentButton>
                      {req.courseId && (
                        <GhostButton
                          onClick={async () => {
                            const courseId = req.courseId!;
                            const currentStatus = pdfStatus[courseId] || 'idle';
                            
                            // Если PDF готов - скачиваем/открываем
                            if (req.pdfUrl) {
                              console.log("Opening PDF for coach request course:", req.pdfUrl);
                              if (req.pdfUrl.startsWith('data:application/pdf')) {
                                // Старый формат: base64 PDF - скачиваем
                                try {
                                  const base64Data = req.pdfUrl.split(',')[1];
                                  const pdfBlob = new Blob([Uint8Array.from(atob(base64Data), char => char.charCodeAt(0))], {
                                    type: 'application/pdf'
                                  });
                                  const downloadUrl = URL.createObjectURL(pdfBlob);
                                  const link = document.createElement('a');
                                  link.href = downloadUrl;
                                  link.download = `coach-course-${courseId}.pdf`;
                                  link.style.display = 'none';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  URL.revokeObjectURL(downloadUrl);
                                } catch (error) {
                                  console.error('Error downloading base64 PDF:', error);
                                  window.open(req.pdfUrl, '_blank');
                                }
                              } else {
                                // Vercel Blob URL - открываем в новой вкладке
                                window.open(req.pdfUrl, '_blank');
                              }
                              return;
                            }
                            
                            // Если уже генерируется - не делаем ничего
                            if (currentStatus === 'generating') {
                              return;
                            }
                            
                            // Запускаем генерацию PDF
                            console.log("Starting PDF generation for coach request course:", courseId);
                            setPdfStatus(prev => ({ ...prev, [courseId]: 'generating' }));
                            setGeneratingPDF(courseId);
                            
                            try {
                              const response = await fetch("/api/courses/generate-pdf", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ courseId }),
                              });
                              
                              if (!response.ok) {
                                const error = await response.json().catch(() => ({ error: "Unknown error" }));
                                throw new Error(error.error || "Failed to start PDF generation");
                              }
                              
                              const data = await response.json();
                              console.log("PDF generation started for coach request:", data);
                              
                              if (data.status === 'completed' && data.pdfUrl) {
                                setPdfStatus(prev => ({ ...prev, [courseId]: 'ready' }));
                                setGeneratingPDF(null);
                                // Обновляем запрос с новым pdfUrl
                                setCoachRequests(prev => prev.map(r => 
                                  r.id === req.id ? { ...r, pdfUrl: data.pdfUrl } : r
                                ));
                                // Открываем PDF
                                window.open(data.pdfUrl, '_blank');
                              } else if (data.status === 'processing') {
                                // Запускаем polling для проверки статуса
                                pollPdfStatus(courseId);
                              }
                            } catch (error) {
                              console.error("PDF generation failed for coach request:", error);
                              setPdfStatus(prev => ({ ...prev, [courseId]: 'error' }));
                              setGeneratingPDF(null);
                              alert(`Failed to start PDF generation: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            }
                          }}
                          disabled={pdfStatus[req.courseId] === 'generating' || generatingPDF === req.courseId}
                          className={cn(
                            "min-w-[140px] transition-all duration-200",
                            (pdfStatus[req.courseId] === 'generating' || generatingPDF === req.courseId) && "opacity-80 cursor-not-allowed",
                            pdfStatus[req.courseId] === 'error' && "border-red-500 text-red-500"
                          )}
                        >
                          {pdfStatus[req.courseId] === 'generating' || generatingPDF === req.courseId ? (
                            <>
                              <Spinner size={16} className="text-current" />
                              <span>Generating...</span>
                            </>
                          ) : req.pdfUrl ? (
                            <>
                              <FileDown size={16} />
                              <span>Download PDF</span>
                            </>
                          ) : (
                            <>
                              <FileDown size={16} />
                              <span>Generate PDF</span>
                            </>
                          )}
                        </GhostButton>
                      )}
                    </div>
                  )}
                  {req.status === "failed" && req.error && (
                    <div className="mt-2 text-xs text-red-600">
                      Error: {req.error}
                    </div>
                  )}
                  {(req.status === "pending" || req.status === "processing") && (
                    <div className="mt-2 text-xs opacity-70">
                      <Timer size={12} className="inline mr-1" />
                      Your coach has received your request. Your personalized course is being prepared.
                    </div>
                  )}
                  {/* Removed: premature "ready" message. Status now stays "processing" 
                      until the 4-hour window passes, then becomes "done". */}
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* Курсы пользователя */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Dumbbell size={18} /> Your Courses
          </h3>
          {courses.length > 0 && (
            <GhostButton onClick={() => {
              const rows = courses.map((c) => ({
                id: c.id,
                title: c.title,
                tokens_spent: c.tokensSpent,
                created_at: c.createdAt,
                has_pdf: !!c.pdfUrl,
              }));
              downloadCSV("courses.csv", rows);
            }} className="text-sm">
              <FileDown size={16} /> Export CSV
            </GhostButton>
          )}
        </div>
        
        {loading ? (
          <div className="mt-4 text-sm opacity-80">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <Dumbbell size={48} className="mx-auto opacity-40 mb-4" />
            <div className="text-lg font-medium">No courses yet</div>
            <p className="text-sm opacity-70 mt-2">
              Publish a full course from the Generator to see it here.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {courses.map((c) => (
              <Card key={c.id} className="border-dashed" interactive>
                <div className="text-xs opacity-70">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {c.title || (() => {
                    try {
                      const options = typeof c.options === 'string' ? JSON.parse(c.options) : c.options;
                      const generatedTitle = generateCourseTitle(options);
                      console.log('Generated title for course:', c.id, ':', generatedTitle, 'from options:', options);
                      return generatedTitle;
                    } catch (error) {
                      console.error('Failed to generate title for course:', c.id, error);
                      return 'Untitled Course';
                    }
                  })()}
                </div>
                <div className="mt-1 text-sm opacity-80">
                  Spent: {formatNumber(c.tokensSpent)} tokens
                </div>
                <div className="mt-3 flex gap-2">
                  <AccentButton onClick={() => {
                    setSelectedCourse(c);
                    setShowCourseModal(true);
                  }}>
                    Open
                  </AccentButton>
                  <GhostButton onClick={() => {
                    setSelectedCourse(c);
                    setShowCourseModal(true);
                  }}>
                    Regenerate day
                  </GhostButton>
                  <GhostButton
                    onClick={async () => {
                      const courseId = c.id;
                      const currentStatus = pdfStatus[courseId] || 'idle';
                      
                      // Если PDF готов - скачиваем/открываем
                      if (c.pdfUrl) {
                        console.log("Opening existing PDF:", c.pdfUrl);
                        // Vercel Blob URL или обычный URL - открываем в новой вкладке
                        if (c.pdfUrl.startsWith('data:application/pdf')) {
                          // Старый формат: base64 PDF - скачиваем
                          try {
                            const base64Data = c.pdfUrl.split(',')[1];
                            const pdfBlob = new Blob([Uint8Array.from(atob(base64Data), char => char.charCodeAt(0))], {
                              type: 'application/pdf'
                            });
                            const downloadUrl = URL.createObjectURL(pdfBlob);
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = `course-${courseId}.pdf`;
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(downloadUrl);
                          } catch (error) {
                            console.error('Error downloading base64 PDF:', error);
                            window.open(c.pdfUrl, '_blank');
                          }
                        } else {
                          // Vercel Blob URL - открываем в новой вкладке
                          window.open(c.pdfUrl, '_blank');
                        }
                        return;
                      }
                      
                      // Если уже генерируется - не делаем ничего
                      if (currentStatus === 'generating') {
                        return;
                      }
                      
                      // Запускаем генерацию PDF
                      console.log("Starting PDF generation for course:", courseId);
                      setPdfStatus(prev => ({ ...prev, [courseId]: 'generating' }));
                      setGeneratingPDF(courseId);
                      
                      try {
                        const response = await fetch("/api/courses/generate-pdf", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ courseId }),
                        });
                        
                        if (!response.ok) {
                          const error = await response.json().catch(() => ({ error: "Unknown error" }));
                          throw new Error(error.error || "Failed to start PDF generation");
                        }
                        
                        const data = await response.json();
                        console.log("PDF generation started:", data);
                        
                        // Если PDF уже был готов (маловероятно, но возможно)
                        if (data.status === 'completed' && data.pdfUrl) {
                          setPdfStatus(prev => ({ ...prev, [courseId]: 'ready' }));
                          setGeneratingPDF(null);
                          setCourses(prev => prev.map(course => 
                            course.id === courseId ? { ...course, pdfUrl: data.pdfUrl } : course
                          ));
                        } else if (data.status === 'processing') {
                          // Запускаем polling для проверки статуса
                          pollPdfStatus(courseId);
                        }
                      } catch (error) {
                        console.error("PDF generation failed:", error);
                        setPdfStatus(prev => ({ ...prev, [courseId]: 'error' }));
                        setGeneratingPDF(null);
                        // Показываем понятное сообщение пользователю
                        const errorMessage = error instanceof Error 
                          ? error.message 
                          : "Unknown error occurred";
                        
                        if (errorMessage.includes("Unauthorized")) {
                          alert("You need to be logged in to generate PDF. Please sign in.");
                        } else if (errorMessage.includes("not found")) {
                          alert("Course not found. Please refresh the page and try again.");
                        } else {
                          alert(
                            `Failed to start PDF generation: ${errorMessage}\n\n` +
                            "You can try again by clicking the 'Generate PDF' button."
                          );
                        }
                      }
                    }}
                    disabled={pdfStatus[c.id] === 'generating' || generatingPDF === c.id}
                    className={cn(
                      "min-w-[140px] transition-all duration-200",
                      (pdfStatus[c.id] === 'generating' || generatingPDF === c.id) && "opacity-80 cursor-not-allowed",
                      pdfStatus[c.id] === 'error' && "border-red-500 text-red-500"
                    )}
                  >
                    {pdfStatus[c.id] === 'generating' || generatingPDF === c.id ? (
                      <>
                        <Spinner size={16} className="text-current" />
                        <span>Generating...</span>
                      </>
                    ) : c.pdfUrl ? (
                      <>
                        <FileDown size={16} />
                        <span>Download PDF</span>
                      </>
                    ) : pdfStatus[c.id] === 'error' ? (
                      <>
                        <FileDown size={16} />
                        <span>Generate PDF</span>
                      </>
                    ) : (
                      <>
                        <FileDown size={16} />
                        <span>Generate PDF</span>
                      </>
                    )}
                  </GhostButton>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* История транзакций */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Timer size={18} /> Transaction History
          </h3>
          {transactions.length > 0 && (
            <GhostButton onClick={exportTransactionsCSV} className="text-sm">
              <FileDown size={16} /> Export CSV
            </GhostButton>
          )}
        </div>
        
        {loading ? (
          <div className="mt-4 text-sm opacity-80">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="mt-8 text-center py-8">
            <Timer size={48} className="mx-auto opacity-40 mb-4" />
            <div className="text-lg font-medium">No transactions yet</div>
            <p className="text-sm opacity-70 mt-2">
              Your token transactions will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: THEME.cardBorder }}
              >
                {getTransactionIcon(tx.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {getTransactionDescription(tx)}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  {formatAmount(tx.amount)}
                </div>
              </div>
            ))}
            
            {/* Кнопка "Загрузить еще" */}
            {hasMore && (
              <div className="pt-4 text-center">
                <GhostButton
                  onClick={loadMoreTransactions}
                  disabled={loadingMore}
                  className="w-full"
                >
                  {loadingMore ? (
                    <>Loading more transactions...</>
                  ) : (
                    <>Load More Transactions</>
                  )}
                </GhostButton>
              </div>
            )}
          </div>
        )}
      </Card>
      
      {/* Модальное окно просмотра курса */}
      {showCourseModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border" style={{ backgroundColor: THEME.card, color: THEME.text, borderColor: THEME.cardBorder }}>
            <div className="sticky top-0 border-b p-4 flex items-center justify-between" style={{ backgroundColor: THEME.card, color: THEME.text, borderColor: THEME.cardBorder }}>
              <h2 className="text-xl font-semibold" style={{ color: THEME.text }}>Course Details</h2>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-2xl"
                style={{ color: THEME.secondary }}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: THEME.text }}>
                   {selectedCourse.title || 'Untitled Course'}
                 </h3>
                <div className="flex items-center gap-4 text-sm" style={{ color: THEME.secondary }}>
                  <span>Created: {new Date(selectedCourse.createdAt).toLocaleDateString()}</span>
                  <span>Tokens spent: {formatNumber(selectedCourse.tokensSpent)}</span>
                  {selectedCourse.pdfUrl && <span style={{ color: '#22c55e' }}>✓ PDF available</span>}
                </div>
              </div>
               
               <div className="mb-6">
                 <h4 className="text-lg font-semibold mb-3" style={{ color: THEME.text }}>Course Options</h4>
                 <div className="p-4 rounded-lg border" style={{ backgroundColor: THEME.card, borderColor: THEME.cardBorder }}>
                    {(() => {
                      try {
                        const options = JSON.parse(selectedCourse.options);
                        return (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm" style={{ color: THEME.text }}>
                            <div><strong>Duration:</strong> {options.weeks || 'N/A'} weeks</div>
                            <div><strong>Sessions:</strong> {options.sessionsPerWeek || 'N/A'}/week</div>
                            <div><strong>Injury Safe:</strong> {options.injurySafe ? 'Yes' : 'No'}</div>
                            <div><strong>Equipment:</strong> {options.specialEquipment ? 'Required' : 'No'}</div>
                            <div><strong>Nutrition:</strong> {options.nutritionTips ? 'Included' : 'Not included'}</div>
                            <div><strong>Images:</strong> {options.imageCount || 'N/A'}</div>
                          </div>
                        );
                      } catch {
                        return <div style={{ color: '#ef4444' }}>Failed to parse course options</div>;
                      }
                    })()}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3" style={{ color: THEME.text }}>Actions</h4>
                  
                  {/* Выбор недели и дня для регенерации */}
                  <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: THEME.card, borderColor: THEME.cardBorder }}>
                    <h5 className="font-medium mb-3" style={{ color: THEME.accent }}>Regenerate Specific Day</h5>
                    <div className="flex gap-4 items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Week:</label>
                        <select 
                          value={selectedWeek} 
                          onChange={(e) => setSelectedWeek(Number(e.target.value))}
                          className="border rounded px-3 py-2 text-sm"
                          style={{ borderColor: THEME.cardBorder }}
                        >
                          {Array.from({ length: (() => {
                            try {
                              const options = JSON.parse(selectedCourse.options);
                              return options.weeks || 4;
                            } catch {
                              return 4;
                            }
                          })() }, (_, i) => i + 1).map(week => (
                            <option key={week} value={week}>Week {week}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Day:</label>
                        <select 
                          value={selectedDay} 
                          onChange={(e) => setSelectedDay(Number(e.target.value))}
                          className="border rounded px-3 py-2 text-sm"
                          style={{ borderColor: THEME.cardBorder }}
                        >
                          {Array.from({ length: (() => {
                            try {
                              const options = JSON.parse(selectedCourse.options);
                              return options.sessionsPerWeek || 4;
                            } catch {
                              return 4;
                            }
                          })() }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>Day {day}</option>
                          ))}
                        </select>
                      </div>
                      
                      <GhostButton
                        onClick={() => regenerateDay(selectedCourse.id, selectedWeek, selectedDay)}
                        disabled={regeneratingDay}
                        className="flex items-center gap-2"
                        style={{ backgroundColor: THEME.accent, color: 'black' }}
                      >
                        {regeneratingDay ? (
                          <>
                            <Spinner size={16} />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Regenerate Day
                          </>
                        )}
                      </GhostButton>
                    </div>
                     
                     <div className="mt-3 text-sm" style={{ color: THEME.accent }}>
                       <strong>Cost:</strong> {formatNumber(selectedCourse.tokensSpent)} tokens (same as full course)
                     </div>
                   </div>
                   
                   <div className="flex gap-3">
                      
                      {selectedCourse.pdfUrl ? (
                        <AccentButton
                          onClick={() => {
                            setShowCourseModal(false);
                            if (selectedCourse.pdfUrl?.startsWith('data:application/pdf')) {
                              // Скачиваем PDF
                              const base64Data = selectedCourse.pdfUrl.split(',')[1];
                              const pdfBlob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], {
                                type: 'application/pdf'
                              });
                              const downloadUrl = URL.createObjectURL(pdfBlob);
                              const link = document.createElement('a');
                              link.href = downloadUrl;
                              link.download = `course-${selectedCourse.id}.pdf`;
                              link.click();
                              URL.revokeObjectURL(downloadUrl);
                            } else if (selectedCourse.pdfUrl) {
                              window.open(selectedCourse.pdfUrl, '_blank');
                            }
                          }}
                          className="flex items-center gap-2"
                          style={{ backgroundColor: THEME.accent, color: 'black' }}
                        >
                          <FileDown size={16} />
                          Download PDF
                        </AccentButton>
                      ) : (
                        <GhostButton
                          onClick={() => {
                            setShowCourseModal(false);
                            // Генерируем PDF
                            alert(`Generate PDF for course ${selectedCourse.id} (use button below)`);
                          }}
                          className="flex items-center gap-2"
                          style={{ backgroundColor: THEME.card, borderColor: THEME.cardBorder, color: THEME.text }}
                        >
                          <FileDown size={16} />
                          Generate PDF
                        </GhostButton>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}
     </div>
   );
 }
