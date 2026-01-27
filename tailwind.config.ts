import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./store/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Qontrek Design Constitution v1.1 Tokens
        // ORANGE = ACTION (execute, intent, initiate)
        // NAVY = AUTHORITY (certify, govern, structure)
        action: {
          primary: "#FF6A00",    // Orange - CTAs, Run, Execute, Submit
          hover: "#E65D00",      // Orange hover state
        },
        authority: {
          primary: "#0B1B3A",    // Navy - Certify, Promote, headers, badges
          light: "#1E3A5F",      // Navy lighter variant
        },
        // Trust tier badge colors (per Design Constitution)
        badge: {
          certified: "#0B1B3A",  // Navy - "Qontrek Ready"
          promoted: "#0B1B3A",   // Navy - "Promoted for scale"
          rejected: "#EF4444",   // Red - rejection only
          underReview: "#F59E0B", // Amber - pending states
          sandbox: "#6B7280",    // Gray - limited authority
          draft: "#9CA3AF",      // Gray - draft state
        },
        // Legacy aliases (for gradual migration)
        primary: {
          DEFAULT: "#FF6A00",   // Changed from purple to orange
          600: "#E65D00",
        },
        secondary: {
          DEFAULT: "#0B1B3A",   // Changed from green to navy
        },
        background: "#121929",  // Navy-tinted neutral per spec
        card: {
          DEFAULT: "#1F2937",
          hover: "#374151",
        },
        // Metric colors (green ONLY for charts/metrics, never badges)
        metric: {
          positive: "#10B981",  // Green - charts and trend indicators ONLY
          neutral: "#6B7280",
        },
        success: "#10B981",     // Keep for chart metrics only
        warning: "#F59E0B",     // Amber - warnings
        error: "#EF4444",       // Red - errors/rejection
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "0.75rem",
        button: "0.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
