/**
 * Theme tokens - semantic design system
 * Uses CSS variables defined in app/globals.css
 * Legacy properties maintained for backward compatibility
 */
export const THEME = {
  // Surfaces (semantic)
  bg: "var(--bg)",
  background: "var(--bg)", // Legacy
  surface: "var(--surface)",
  surfaceHighlight: "var(--surface-hover)",
  "surface-hover": "var(--surface-hover)",
  
  // Text (semantic)
  text: "var(--text)",
  foreground: "var(--text)", // Legacy
  "text-muted": "var(--text-muted)",
  "text-subtle": "var(--text-subtle)",
  secondary: "var(--text-subtle)", // Legacy
  muted: "var(--text-muted)", // Legacy
  
  // Borders (semantic)
  border: "var(--border)",
  "border-strong": "var(--border-strong)",
  cardBorder: "var(--border)", // Legacy
  borderGlass: "var(--glass-border)", // Legacy
  
  // Brand (semantic)
  primary: "var(--primary)",
  "primary-hover": "var(--primary-hover)",
  "on-primary": "var(--on-primary)",
  accent: "var(--primary)", // Legacy
  primaryHover: "var(--primary-hover)", // Legacy
  
  // AI (semantic)
  ai: "var(--ai)",
  "ai-soft": "var(--ai-soft)",
  accentPurple: "var(--ai)", // Legacy
  
  // States (semantic)
  danger: "var(--danger)",
  error: "var(--danger)", // Legacy
  success: "var(--success)",
  warning: "var(--warning)",
  verified: "var(--verified)",
  
  // Focus
  focus: "var(--focus)",
  
  // Glass (navbar/hero only)
  glass: "var(--glass)",
  
  // Card (legacy)
  card: "var(--surface)", // Legacy
} as const;
