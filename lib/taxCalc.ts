// ── 업종별 간편장부 매출 기준 ──────────────────────────────────────────────
export const THRESHOLDS: Record<string, { limit: number; label: string }> = {
  도소매업:   { limit: 300_000_000, label: "도소매업 (가군)" },
  음식숙박업: { limit: 150_000_000, label: "음식·숙박업 (나군)" },
  서비스업:   { limit:  75_000_000, label: "서비스·기타 (다군)" },
  기타:       { limit:  75_000_000, label: "기타 업종 (다군)" },
};

export function checkEligibility(bizType: string, prevRevenue: number) {
  const t = THRESHOLDS[bizType] ?? THRESHOLDS["기타"];
  return {
    eligible: prevRevenue < t.limit,
    prevRevenue,
    threshold: t.limit,
    label: t.label,
  };
}

// ── 신용카드발행세액공제 ──────────────────────────────────────────────────
// 개인 일반과세자: 카드매출(VAT 포함) × 1.3%, 연 한도 500만원
export function calcCardCredit(quarterlyCardSales: number) {
  const credit = Math.floor(quarterlyCardSales * 0.013);
  const annualCap = 5_000_000;
  const quarterCap = Math.floor(annualCap / 4);
  const capped = Math.min(credit, quarterCap);
  const annualEstimate = Math.min(credit * 4, annualCap);
  return { credit, capped, quarterCap, annualEstimate };
}

// ── 의제매입세액공제 (음식점업 개인) ─────────────────────────────────────
// 세금계산서·계산서 수취 식재료 매입 × 6/106
// 과세표준 55% 한도
export function calcPurchaseCredit(quarterlyPurchase: number, quarterlyRevenue: number) {
  const raw = Math.floor((quarterlyPurchase * 6) / 106);
  const limit = Math.floor(quarterlyRevenue * 0.55 * 6 / 106);
  const credit = Math.min(raw, limit);
  return { raw, credit, limit };
}

// ── 포맷 ──────────────────────────────────────────────────────────────
export const fmt = (n: number) => n.toLocaleString("ko-KR");
export const fmtW = (n: number) => fmt(n) + "원";
export const fmtM = (n: number) => fmt(Math.floor(n / 10_000)) + "만원";
export const fmtWan = (n: number) => {
  const wan = Math.floor(n / 10_000);
  return fmt(wan) + "만원";
};

// ── 기존 Mock 데이터 기반 함수 (장부 페이지용 보존) ──────────────────────
import { prevYearRevenue, monthlySales, quarterlyPurchases, TAX_DEADLINE, TODAY } from "./mockData";

export function checkEligibilityMock() {
  const THRESHOLD_NAGUN = 150_000_000;
  return {
    eligible: prevYearRevenue < THRESHOLD_NAGUN,
    prevRevenue: prevYearRevenue,
    threshold: THRESHOLD_NAGUN,
    margin: THRESHOLD_NAGUN - prevYearRevenue,
  };
}

export function calcCardCreditMock() {
  const byMonth = monthlySales.map((m) => ({
    month: m.month,
    cardSales: m.card,
    credit: Math.floor(m.card * 0.013),
  }));
  const totalCredit = byMonth.reduce((s, m) => s + m.credit, 0);
  const annualCap = 5_000_000;
  const capped = Math.min(totalCredit, annualCap / 4);
  return { byMonth, totalCredit, capped };
}

export function calcPurchaseCreditMock() {
  const byItem = quarterlyPurchases.map((p) => ({
    ...p,
    credit: Math.floor((p.amount * 6) / 106),
  }));
  const totalPurchase = byItem.reduce((s, p) => s + p.amount, 0);
  const totalCredit = byItem.reduce((s, p) => s + p.credit, 0);
  return { byItem, totalPurchase, totalCredit };
}

export function calcDDay() {
  return Math.ceil((TAX_DEADLINE.getTime() - TODAY.getTime()) / 86_400_000);
}
