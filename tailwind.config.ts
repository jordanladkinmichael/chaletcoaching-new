import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        // Semantic tokens using CSS variables
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        "text-subtle": "var(--text-subtle)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        "on-primary": "var(--on-primary)",
        ai: "var(--ai)",
        "ai-soft": "var(--ai-soft)",
        danger: "var(--danger)",
        success: "var(--success)",
        warning: "var(--warning)",
        verified: "var(--verified)",
        focus: "var(--focus)",
        // Legacy support (will be deprecated gradually)
        background: "var(--bg)",
        foreground: "var(--text)",
        secondary: "var(--text-subtle)",
        "accent-purple": "var(--ai)",
        error: "var(--danger)",
        muted: "var(--text-muted)",
        accent: "var(--primary)",
        card: "var(--surface)",
        cardBorder: "var(--border)",
        "surface-highlight": "var(--surface-hover)",
      },
      backgroundImage: {
        glass: "var(--glass)",
      },
      borderColor: {
        glass: "var(--glass-border)",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      transitionDuration: {
        "fast": "140ms",
        "normal": "180ms",
        "slow": "220ms",
      },
    }
  },
  plugins: []
} satisfies Config;
