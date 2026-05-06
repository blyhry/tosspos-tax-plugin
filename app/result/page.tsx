"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { checkEligibility, calcCardCredit, calcPurchaseCredit, fmtW, fmtWan } from "@/lib/taxCalc";

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--gray-00)", borderRadius: 16, padding: "20px", ...style }}>
      {children}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 14, color: "var(--text-low)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: bold ? 700 : 500, color: bold ? "var(--blue)" : "var(--text)" }}>
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "var(--divider)", margin: "12px 0" }} />;
}

function ResultContent() {
  const params = useSearchParams();

  const bizType   = params.get("type")     ?? "기타";
  const prevRev   = Number(params.get("rev")      ?? "0") * 10_000;
  const cardSales = Number(params.get("card")     ?? "0") * 10_000;
  const purchase  = Number(params.get("purchase") ?? "0") * 10_000;
  const isFood    = bizType === "음식숙박업";

  const elig        = checkEligibility(bizType, prevRev);
  const cardResult  = calcCardCredit(cardSales);
  const purchResult = isFood ? calcPurchaseCredit(purchase, cardSales) : null;

  const totalThis = cardResult.capped + (purchResult?.credit ?? 0);
  const totalYear = cardResult.annualEstimate + (purchResult ? purchResult.credit * 4 : 0);

  const BIZ_LABELS: Record<string, string> = {
    음식숙박업: "음식·숙박업", 도소매업: "도소매업", 서비스업: "서비스업", 기타: "기타",
  };

  return (
    <div style={{
      minHeight: "100dvh", background: "var(--bg)", maxWidth: 390, margin: "0 auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', Pretendard, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      {/* 뒤로가기 */}
      <div style={{ padding: "16px 20px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/" style={{
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--gray-100)", borderRadius: "50%", textDecoration: "none",
        }}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
            <path d="M8 1L1 8L8 15" stroke="#212124" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <span style={{ fontSize: 13, color: "var(--text-low)" }}>다시 입력</span>
      </div>

      <div style={{ padding: "20px 20px 48px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* 핵심 결과 */}
        <div style={{ background: "var(--blue)", borderRadius: 20, padding: "24px 20px" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
            {BIZ_LABELS[bizType]} · 직전연도 {fmtWan(prevRev)}
          </p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", marginBottom: 16 }}>이번 분기 절세 진단 결과</p>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "16px 20px" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>돌려받을 수 있는 세금</p>
            <p style={{ fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>{fmtW(totalThis)}</p>
          </div>
          {totalYear > 0 && (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 14 }}>
              1년으로 계산하면 최대 <b style={{ color: "#fff" }}>{fmtW(totalYear)}</b>
            </p>
          )}
        </div>

        {/* 간편장부 여부 */}
        <Card style={{ borderLeft: `4px solid ${elig.eligible ? "var(--green)" : "var(--yellow)"}` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{elig.eligible ? "✅" : "⚠️"}</span>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                {elig.eligible ? "간편장부 대상이세요" : "복식부기 의무자세요"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-low)", lineHeight: "150%", marginBottom: 6 }}>
                작년 매출 {fmtWan(prevRev)} — {elig.label} 기준 {fmtWan(elig.threshold)} {elig.eligible ? "미만" : "초과"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: "150%" }}>
                {elig.eligible
                  ? "세무사 없이 직접 신고하실 수 있어요. 경비를 잘 챙기시면 소득세도 줄어들어요."
                  : "복식부기는 세무사와 함께하시면 훨씬 편하고 안전해요. 혼자 신고하시다 실수가 생기면 가산세가 붙을 수 있어서요."}
              </p>
            </div>
          </div>
        </Card>

        {/* 신용카드 발행세액공제 */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>카드 단말기 세금 환급</p>
              <p style={{ fontSize: 13, color: "var(--text-low)" }}>카드로 팔면 1.3%를 돌려줘요</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--blue)", flexShrink: 0, marginLeft: 12 }}>
              {fmtW(cardResult.capped)}
            </p>
          </div>
          <div style={{ background: "var(--gray-50)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="이번 분기 카드매출" value={fmtWan(cardSales)} />
            <Row label="환급 비율" value="× 1.3%" />
            <Divider />
            <Row label="환급액" value={fmtW(cardResult.capped)} bold />
          </div>
          <div style={{ marginTop: 12, background: "var(--blue-low)", borderRadius: 10, padding: "12px 14px" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--blue)", marginBottom: 4 }}>홈택스 어디에 입력하나요?</p>
            <p style={{ fontSize: 12, color: "var(--blue)", lineHeight: "150%" }}>
              부가가치세 신고 → 일반과세자 신고서<br />
              → <b>「신용카드매출전표 발행공제」</b> 칸
            </p>
          </div>
        </Card>

        {/* 의제매입세액공제 */}
        {isFood && purchResult && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>재료비 세금 환급</p>
                <p style={{ fontSize: 13, color: "var(--text-low)" }}>식재료 살 때 낸 세금을 돌려줘요</p>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color: "var(--green)", flexShrink: 0, marginLeft: 12 }}>
                {fmtW(purchResult.credit)}
              </p>
            </div>
            <div style={{ background: "var(--gray-50)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <Row label="세금계산서 식재료 매입" value={fmtWan(purchase)} />
              <Row label="환급 비율" value="× 6/106" />
              <Divider />
              <Row label="환급액" value={fmtW(purchResult.credit)} bold />
            </div>
            <div style={{ marginTop: 12, background: "var(--green-low)", borderRadius: 10, padding: "12px 14px" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--green)", marginBottom: 6 }}>이걸 받으려면?</p>
              {["농협·식자재마트에서 세금계산서 꼭 받으세요", "닭·채소·생선 같은 식재료에만 해당돼요", "일반 마트 영수증(간이)은 해당 안 돼요"].map(t => (
                <p key={t} style={{ fontSize: 12, color: "var(--green)", lineHeight: "160%", display: "flex", gap: 6 }}>
                  <span style={{ flexShrink: 0 }}>·</span> {t}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* 추가 절세 */}
        <Card>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>이것도 챙겨보세요</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { t: "경차·화물차·9인승 이상 차량", d: "업무용 차가 있으시면 부가세도 돌려받을 수 있어요" },
              { t: "임차료·관리비 세금계산서",    d: "매달 임대인한테 세금계산서 꼭 받아두세요" },
              { t: "직원이 늘었나요?",             d: "작년보다 직원을 늘리시면 세금을 더 줄일 수 있어요" },
              ...(isFood ? [{ t: "세금계산서 거래처 늘리기", d: "세금계산서 받는 곳이 많을수록 환급이 커져요" }] : []),
            ].map(({ t, d }) => (
              <div key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: "var(--gray-50)", borderRadius: 10 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--blue)", marginTop: 8, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{t}</p>
                  <p style={{ fontSize: 13, color: "var(--text-low)" }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div style={{ background: "var(--blue)", borderRadius: 20, padding: "24px 20px" }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: "135%", marginBottom: 6 }}>
            이 돈,<br />실제로 받고 싶으세요?
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: "150%", marginBottom: 20 }}>
            아이샵케어 가맹점이 되시면<br />절세 컨설팅을 무료로 도와드려요
          </p>
          <a href="tel:1588-0000" style={{
            display: "block", textAlign: "center", background: "#fff", color: "var(--blue)",
            fontWeight: 700, fontSize: 17, height: 56, lineHeight: "56px",
            borderRadius: 12, textDecoration: "none",
          }}>
            무료 상담 신청하기
          </a>
          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>
            평일 09:00 ~ 18:00
          </p>
        </div>

        <Link href="/" style={{ display: "block", textAlign: "center", fontSize: 14, color: "var(--text-low)", padding: "8px 0", textDecoration: "underline" }}>
          다른 수치로 다시 진단하기
        </Link>

        <p style={{ fontSize: 11, color: "var(--gray-500)", lineHeight: "160%", textAlign: "center" }}>
          ※ 입력하신 정보 기준 예시 계산이며, 실제 신고 전 세무사 확인 권장<br />
          © 2026 iShopCare
        </p>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <p style={{ color: "var(--text-low)", fontSize: 14 }}>계산 중...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
