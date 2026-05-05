"use client";

import TabNav from "@/components/BottomNav";
import { calcCardCreditMock as calcCardCredit, calcPurchaseCreditMock as calcPurchaseCredit, calcDDay, fmt, fmtW, fmtM } from "@/lib/taxCalc";

const cardCredit = calcCardCredit();
const purchaseCredit = calcPurchaseCredit();
const dDay = calcDDay();

export default function DeductionPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TabNav />

      {/* 상단 요약 배지 */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700">2026 Q1 공제 데이터</span>
          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-semibold">
            부가세 신고 D-{dDay}
          </span>
        </div>
        <div className="flex gap-3 mt-1 text-[11px]">
          <span className="text-gray-400">카드세액공제
            <span className="font-bold text-blue-600 ml-1">{fmtW(cardCredit.capped)}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">의제매입공제
            <span className="font-bold text-emerald-600 ml-1">{fmtW(purchaseCredit.totalCredit)}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400">합계
            <span className="font-bold text-gray-800 ml-1">{fmtW(cardCredit.capped + purchaseCredit.totalCredit)}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">

        {/* ── 1. 신용카드발행세액공제 ── */}
        <section className="px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[12px] font-bold text-gray-800">신용카드발행세액공제</p>
              <p className="text-[9px] text-gray-400 mt-0.5">카드·직불카드 매출액 × 1.3% (연 500만원 한도)</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400">이번 분기 공제액</p>
              <p className="text-[16px] font-bold text-blue-600">{fmtW(cardCredit.capped)}</p>
            </div>
          </div>

          {/* 월별 테이블 */}
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
            <div className="grid grid-cols-4 px-3 py-1.5 bg-gray-100 border-b border-gray-200">
              {["월", "카드매출(VAT포함)", "공제액(×1.3%)", "비고"].map(h => (
                <span key={h} className="text-[9px] font-bold text-gray-400">{h}</span>
              ))}
            </div>
            {cardCredit.byMonth.map((m) => (
              <div key={m.month} className="grid grid-cols-4 px-3 py-2 border-b border-gray-50 last:border-0">
                <span className="text-[11px] text-gray-600">{m.month}</span>
                <span className="text-[11px] text-gray-700">{fmtM(m.cardSales)}</span>
                <span className="text-[11px] font-semibold text-blue-600">{fmt(m.credit)}원</span>
                <span className="text-[9px] text-gray-400">POS 집계</span>
              </div>
            ))}
            <div className="grid grid-cols-4 px-3 py-2 bg-blue-50 border-t border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 col-span-2">분기 합계</span>
              <span className="text-[11px] font-bold text-blue-700">{fmt(cardCredit.totalCredit)}원</span>
              <span className="text-[9px] text-blue-500">→ 분기 한도 적용 {fmtW(cardCredit.capped)}</span>
            </div>
          </div>

          {/* 홈택스 입력 안내 */}
          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-blue-700 mb-1">📋 홈택스 신고 시 입력 위치</p>
            <p className="text-[9px] text-blue-600 leading-relaxed">
              부가가치세 신고 → 일반과세자 신고서 →<br/>
              <span className="font-semibold">「신용카드매출전표등 발행공제 등」</span> 란<br/>
              카드·현금영수증 발행금액 합계 입력 후 공제액 자동 계산
            </p>
          </div>
        </section>

        {/* ── 2. 의제매입세액공제 ── */}
        <section className="px-3 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[12px] font-bold text-gray-800">의제매입세액공제</p>
              <p className="text-[9px] text-gray-400 mt-0.5">음식점업 세금계산서 식재료 매입 × 6/106</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400">분기 공제 예상</p>
              <p className="text-[16px] font-bold text-emerald-600">{fmtW(purchaseCredit.totalCredit)}</p>
            </div>
          </div>

          {/* 매입 항목 테이블 */}
          <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
            <div className="grid grid-cols-[40px_1fr_70px_60px] px-3 py-1.5 bg-gray-100 border-b border-gray-200">
              {["월", "거래처", "매입액", "공제액"].map(h => (
                <span key={h} className="text-[9px] font-bold text-gray-400">{h}</span>
              ))}
            </div>
            {purchaseCredit.byItem.map((p, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr_70px_60px] px-3 py-2 border-b border-gray-50 last:border-0 items-center">
                <span className="text-[10px] text-gray-500">{p.month}</span>
                <div>
                  <p className="text-[11px] text-gray-700">{p.vendor}</p>
                  <span className="text-[8px] bg-gray-200 text-gray-500 px-1 py-0.5 rounded">{p.voucher}</span>
                </div>
                <span className="text-[11px] text-gray-700">{fmtM(p.amount)}</span>
                <span className="text-[11px] font-semibold text-emerald-600">{fmt(p.credit)}원</span>
              </div>
            ))}
            <div className="grid grid-cols-[40px_1fr_70px_60px] px-3 py-2 bg-emerald-50 border-t border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 col-span-2">합계</span>
              <span className="text-[11px] font-bold text-emerald-700">{fmtM(purchaseCredit.totalPurchase)}</span>
              <span className="text-[11px] font-bold text-emerald-700">{fmt(purchaseCredit.totalCredit)}원</span>
            </div>
          </div>

          {/* 공제 조건 안내 */}
          <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-emerald-700 mb-1">📋 공제 적용 조건</p>
            <ul className="text-[9px] text-emerald-700 space-y-0.5 leading-relaxed">
              <li>• 세금계산서·계산서·신용카드·현금영수증 수취분만 해당</li>
              <li>• 음식점업 면세 농·축·수산물 식재료에 한정</li>
              <li>• 과세표준의 <span className="font-semibold">55%</span> 한도 (개인 음식점)</li>
            </ul>
          </div>

          {/* 홈택스 입력 안내 */}
          <div className="mt-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-emerald-700 mb-1">📋 홈택스 신고 시 입력 위치</p>
            <p className="text-[9px] text-emerald-700 leading-relaxed">
              부가가치세 신고 → 일반과세자 신고서 →<br/>
              <span className="font-semibold">「의제매입세액공제 신고서」</span> 별지 작성<br/>
              거래처별 매입액·공제액 위 수치 그대로 입력
            </p>
          </div>
        </section>

        {/* ── 3. 데이터 출처 안내 ── */}
        <div className="bg-gray-50 border-t border-gray-200 px-3 py-2">
          <p className="text-[9px] text-gray-400 leading-relaxed">
            ※ 카드매출은 토스포스 POS 결제 데이터 자동 집계 · 의제매입은 세금계산서 수취분 기준<br/>
            ※ 실제 신고 전 세무대리인과 확인 권장
          </p>
        </div>

      </div>
    </div>
  );
}
