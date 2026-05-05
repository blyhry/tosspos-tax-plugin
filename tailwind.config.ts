import type { Config } from "tailwindcss";

// Tailwind은 globals.css의 CSS 변수를 통해 색상을 쓰므로 최소화
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"Apple SD Gothic Neo"', "Pretendard", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
