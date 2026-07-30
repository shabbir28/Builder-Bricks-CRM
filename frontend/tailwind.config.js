/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Core surface tokens (Stripe-like precision) ──
        surface: {
          bg: "#08090a", // deepest background
          base: "#0d0e10", // main content bg
          raised: "#111316", // card / panel
          overlay: "#16181c", // modal / floating
          border: "#1e2025", // default border
          divide: "#14151a", // divider lines
        },
        // ── Text scale ──
        ink: {
          primary: "#f0f2f5",
          secondary: "#8b8fa8",
          tertiary: "#545769",
          disabled: "#353849",
        },
        // ── Brand accent (Linear violet-blue) ──
        accent: {
          DEFAULT: "#5c6bc0",
          hover: "#6979d0",
          muted: "rgba(92,107,192,0.12)",
          border: "rgba(92,107,192,0.25)",
          glow: "rgba(92,107,192,0.15)",
        },
        // ── Semantic colors ──
        success: {
          DEFAULT: "#10b981",
          muted: "rgba(16,185,129,0.10)",
          border: "rgba(16,185,129,0.20)",
        },
        warning: {
          DEFAULT: "#f59e0b",
          muted: "rgba(245,158,11,0.10)",
          border: "rgba(245,158,11,0.20)",
        },
        danger: {
          DEFAULT: "#ef4444",
          muted: "rgba(239,68,68,0.10)",
          border: "rgba(239,68,68,0.20)",
        },
        purple: {
          DEFAULT: "#8b5cf6",
          muted: "rgba(139,92,246,0.10)",
          border: "rgba(139,92,246,0.20)",
        },
        cyan: {
          DEFAULT: "#06b6d4",
          muted: "rgba(6,182,212,0.10)",
          border: "rgba(6,182,212,0.20)",
        },
        // ── Chart palette ──
        chart: {
          1: "#5c6bc0",
          2: "#06b6d4",
          3: "#10b981",
          4: "#f59e0b",
          5: "#ef4444",
          6: "#8b5cf6",
        },
        // ── Legacy aliases (keep existing pages working) ──
        builders: {
          blue: "#5c6bc0",
          indigo: "#6366f1",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#ef4444",
          slate: "#1e293b",
          bg: "#08090a",
          sidebar: "#0d0e10",
          card: "#111316",
          surface: "#16181c",
          border: "#1e2025",
          text: {
            primary: "#f0f2f5",
            secondary: "#8b8fa8",
            muted: "#545769",
          },
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "22px" }],
        md: ["15px", { lineHeight: "24px" }],
        lg: ["16px", { lineHeight: "26px" }],
        xl: ["18px", { lineHeight: "28px" }],
        "2xl": ["22px", { lineHeight: "30px" }],
        "3xl": ["26px", { lineHeight: "34px" }],
        "4xl": ["32px", { lineHeight: "40px" }],
        "5xl": ["40px", { lineHeight: "48px" }],
      },
      spacing: {
        4.5: "18px",
        13: "52px",
        15: "60px",
        18: "72px",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        panel: "0 4px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)",
        float: "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
        accent: "0 0 0 3px rgba(92,107,192,0.2)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      animation: {
        in: "fadeSlideIn 0.25s ease-out",
        "in-slow": "fadeSlideIn 0.4s ease-out",
        "in-up": "slideUp 0.3s ease-out",
        "spin-slow": "spin 2s linear infinite",
        shimmer: "shimmer 1.8s infinite",
      },
      keyframes: {
        fadeSlideIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
