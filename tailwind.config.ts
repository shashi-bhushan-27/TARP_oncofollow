import type { Config } from "tailwindcss";

// OncoFollow design tokens — see DESIGN.md for rationale and usage.
// Warm neutrals, one pine accent for actions, status colours reserved for routing states.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Semantic text colours flip with the theme and meet WCAG AA on every surface
        muted: "var(--text-muted)",
        subtle: "var(--text-subtle)",
        canvas: "var(--background)",
        plane: "var(--plane)",
        line: "var(--card-border)",
        // Pine — the only accent; used for primary actions, links, focus and selection
        primary: {
          50: "#eef6f3",
          100: "#d6ebe4",
          200: "#aed6ca",
          300: "#80c2b2",
          400: "#4f9f8d",
          500: "#2f8270",
          600: "#1f6a5b",
          700: "#18574a",
          800: "#15463c",
          900: "#123a32",
          950: "#0a231e",
        },
        // Ink blue — secondary information (care-team context, documents)
        accent: {
          50: "#f0f4f9",
          100: "#dde6f1",
          200: "#bccde3",
          300: "#8fabcf",
          400: "#6286b6",
          500: "#466a9b",
          600: "#365482",
          700: "#2d456a",
          800: "#263a57",
          900: "#223249",
          950: "#151f2e",
        },
        // Routing status colours (routine uses pine)
        caution: {
          50: "#fcf6e8",
          100: "#f8e9c4",
          200: "#f0d28a",
          300: "#e5b653",
          400: "#d59b2a",
          500: "#b97f14",
          600: "#98650d",
          700: "#7a520a",
          800: "#5e3f0b",
          900: "#4b330c",
          950: "#2a1c05",
        },
        urgent: {
          50: "#fcf1ec",
          100: "#f9e0d5",
          200: "#f1bea7",
          300: "#e49572",
          400: "#d06f45",
          500: "#b8562c",
          600: "#9e4523",
          700: "#8f3a1c",
          800: "#6b2d18",
          900: "#562616",
          950: "#2f120a",
        },
        emergency: {
          50: "#fcefee",
          100: "#f9dcd9",
          200: "#f2b8b2",
          300: "#e78c83",
          400: "#d6625a",
          500: "#c4443b",
          600: "#b42d24",
          700: "#962620",
          800: "#76201c",
          900: "#5f1d1a",
          950: "#340b09",
        },
        // Warm neutrals
        surface: {
          50: "#f6f5f1",
          100: "#eeece6",
          200: "#e1ded6",
          300: "#c9c5bc",
          400: "#8b867d",
          500: "#6b665e",
          600: "#4f4c46",
          700: "#3b3935",
          800: "#2a2825",
          900: "#1d1c19",
          950: "#141311",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],        // 11/16 — meta only
        xs: ["0.75rem", { lineHeight: "1.125rem" }],          // 12/18
        sm: ["0.875rem", { lineHeight: "1.375rem" }],         // 14/22
        base: ["1rem", { lineHeight: "1.625rem" }],           // 16/26
        lg: ["1.125rem", { lineHeight: "1.75rem" }],          // 18/28
        xl: ["1.375rem", { lineHeight: "1.875rem" }],         // 22/30
        "2xl": ["1.75rem", { lineHeight: "2.25rem" }],        // 28/36
        "3xl": ["2.125rem", { lineHeight: "2.625rem" }],      // 34/42
        "4xl": ["2.625rem", { lineHeight: "3.125rem" }],      // 42/50
        "5xl": ["3.25rem", { lineHeight: "3.75rem" }],        // 52/60
        "6xl": ["3.75rem", { lineHeight: "4.25rem" }],        // 60/68
      },
      // Disciplined radius scale: 4 (tags) · 8 (controls) · 12 (surfaces)
      borderRadius: {
        sm: "4px",
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
        "2xl": "12px",
        "3xl": "12px",
      },
      // Depth comes from tonal planes; shadows are reserved for floating layers
      boxShadow: {
        soft: "none",
        card: "none",
        elevated: "0 1px 2px rgba(29, 28, 25, 0.06)",
        modal: "0 16px 40px -12px rgba(29, 28, 25, 0.28)",
      },
      animation: {
        "fade-in": "fadeIn 160ms ease-out",
        "slide-up": "slideUp 180ms ease-out",
        "slide-down": "slideDown 180ms ease-out",
        "scale-in": "fadeIn 160ms ease-out",
        // Looping attention animations are intentionally disabled
        "pulse-soft": "none",
        "emergency-pulse": "none",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};
export default config;
