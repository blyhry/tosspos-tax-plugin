import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "절세 진단 | iShopCare",
  description: "소상공인 맞춤 절세 진단 — 놓치고 있는 세금 돌려받으세요",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
