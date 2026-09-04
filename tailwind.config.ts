import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#FDF5F6",
          100: "#FAE9EB",
          200: "#F3CBD0",
          300: "#E79DA6",
          400: "#D96474",
          500: "#C4132E",
          600: "#AD0F28",
          700: "#8F0C21",
          800: "#6E0919",
          900: "#4B0611",
          950: "#2A0308",
        },
        paper:    "#FAFAF9",
        ivory:    "#F1F2F1",
        charcoal: "#111315",
        night:    "#0B0D0F",
        smoke:    "#6B7075",
        gold:     "#C4132E",
        bronze:   "#9E1B32",
        pearl:    "#E7E9E8",
        ice:      "#DCE4E8",
        dark:     "#111315",
        muted:    "#8C9296",
        line:     "#E4E6E5",
      },
      fontFamily: {
        serif: ["Prata", "Georgia", "serif"],
        sans:  ["Manrope", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["clamp(2.75rem, 6vw, 6rem)", { lineHeight: "1.02", letterSpacing: "0.01em" }],
        heading: ["clamp(1.9rem, 3.4vw, 3rem)", { lineHeight: "1.12" }],
      },
      letterSpacing: {
        widest: "0.24em",
        extra:  "0.14em",
        label:  "0.09em",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        floatIn: "floatIn 0.8s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
