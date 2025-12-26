import React from "react";
import { THEME } from "@/lib/theme";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useLazyLoad } from "@/lib/hooks";
import Image from "next/image";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  className = "",
  children,
  interactive = false,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl border p-5 md:p-6",
        interactive && "hover:shadow-lg hover:shadow-black/30 transition",
        className
      )}
      style={{ background: THEME.card, borderColor: THEME.cardBorder }}
    >
      {children}
    </div>
  );
}

export function AccentButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "bg-accent text-accent-foreground hover:bg-accent/90",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Spinner({
  size = 24,
  className,
  ...props
}: { size?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

export function Quote({
  children,
  className,
  ...props
}: React.QuoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote className={cn("italic", className)} {...props}>
      {children}
    </blockquote>
  );
}

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export function CourseSkeleton() {
  return (
    <div className="p-6">
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  );
}

export function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; width?: number; height?: number }) {
  const [ref, isLoaded] = useLazyLoad();

  return (
    <Image
      ref={ref}
      src={isLoaded ? src : "/placeholder.png"}
      alt={alt || ""}
      className={cn("lazy-load", isLoaded && "loaded", className)}
      width={width}
      height={height}
      {...props}
    />
  );
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} className="text-green-400" />;
      case "error":
        return <AlertCircle size={20} className="text-red-400" />;
      case "info":
        return <Info size={20} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const getBackground = () => {
    switch (toast.type) {
      case "success":
        return "rgba(34, 197, 94, 0.1)";
      case "error":
        return "rgba(239, 68, 68, 0.1)";
      case "info":
        return "rgba(59, 130, 246, 0.1)";
      default:
        return THEME.card;
    }
  };

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm"
      style={{
        background: getBackground(),
        borderColor: THEME.cardBorder,
      }}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{toast.title}</div>
        {toast.message && (
          <div className="text-sm opacity-80 mt-1">{toast.message}</div>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
