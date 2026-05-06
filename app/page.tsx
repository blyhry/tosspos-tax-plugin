"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ── 업종 데이터 (이모지 없음) ── */
const BIZ_TYPES = [
  { key: "음식숙박업", label: "음식·숙박업", sub: "식당, 카페, 치킨집, 분식" },
  { key: "도소매업",   label: "도소매업",    sub: "편의점, 마트, 의류, 잡화" },
  { key: "서비스업",   label: "서비스업",    sub: "미용실, 세탁소, 학원" },
  { key: "기타",       label: "그 외 업종",  sub: "위에 해당 없는 경우" },
];

type View  = "landing" | "survey";
type Step  = "biz" | "rev" | "card" | "purchase";

interface State {
  bizType: string;
  rev:     string;
  card:    string;
  purchase:string;
}

const EMPTY: State = { bizType: "", rev: "", card: "", purchase: "" };

function getSteps(bizType: string): Step[] {
  const base: Step[] = ["biz", "rev", "card"];
  if (bizType === "음식숙박업") base.push("purchase");
  return base;
}

function fmtWon(manwon: string) {
  const n = Number(manwon);
  if (!manwon || isNaN(n) || n === 0) return "";
  return (n * 10_000).toLocaleString("ko-KR") + "원";
}

/* ── 공통 레이아웃 ── */
function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      background: "var(--bg)", maxWidth: 390, margin: "0 auto",
    }}>
      {children}
    </div>
  );
}

/* ── 상단 바 ── */
function TopBar({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--gray-100)", borderRadius: "50%", border: "none", cursor: "pointer",
        }}>
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
            <path d="M8 1L1 8L8 15" stroke="#212124" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span style={{ fontSize: 13, color: "var(--text-low)" }}>{step} / {total}</span>
      </div>
      <div style={{ height: 3, background: "var(--gray-200)", borderRadius: 2 }}>
        <div style={{ height: 3, width: `${pct}%`, background: "var(--blue)", borderRadius: 2, transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}

/* ── 하단 버튼 ── */
function BottomBtn({ label, disabled, onClick }: { label: string; disabled: boolean; onClick: () => void }) {
  return (
    <div style={{ padding: "12px 20px 36px", marginTop: "auto" }}>
      <button className="seed-btn" disabled={disabled} onClick={onClick}>{label}</button>
    </div>
  );
}

/* ══════════════════════
   랜딩 화면
══════════════════════ */
const CheckIcon = () => (
  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

function Landing({ onStart }: { onStart: () => void }) {
  const points = [
    ["부가세 신고 때 카드 매출의 1.3% 환급", "신용카드 발행세액공제"],
    ["식재료 세금계산서가 있다면 추가 환급 가능", "의제매입세액공제 (음식점)"],
    ["30초 진단, 무료, 개인정보 불필요", "지금 바로 확인 가능"],
  ];
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#ffffff", maxWidth: 390, margin: "0 auto" }}>

      {/* Hero */}
      <div style={{ padding: "52px 24px 28px" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", letterSpacing: ".2px", marginBottom: 14 }}>
          소상공인 절세 진단
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", lineHeight: "135%", letterSpacing: "-0.5px" }}>
          사장님,<br />
          지금 세금을<br />
          <span style={{ color: "var(--blue)" }}>더 내고 계세요</span>
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-low)", marginTop: 14, lineHeight: "165%" }}>
          <b style={{ color: "var(--text)" }}>아이샵케어가 도와드릴게요.</b><br />
          카드 매출에서 돌려받는 세금,<br />
          내 업종에 맞춰 30초 만에 진단해드려요.
        </p>
      </div>

      {/* 포인트 카드 */}
      <div style={{ margin: "0 20px 28px", background: "var(--bg)", borderRadius: 16, padding: 20 }}>
        {points.map(([main, sub], i) => (
          <div key={main} style={{ display: "flex", alignItems: "flex-start", gap: 12, ...(i < points.length - 1 ? { marginBottom: 16 } : {}) }}>
            <CheckIcon />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: "135%" }}>{main}</p>
              <p style={{ fontSize: 13, color: "var(--text-low)", marginTop: 3, lineHeight: "150%" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "0 20px 40px", marginTop: "auto" }}>
        <button className="seed-btn" onClick={onStart} style={{ borderRadius: 14, height: 56, fontSize: 17 }}>
          얼마나 돌려받을 수 있는지 확인하기
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--gray-500)", marginTop: 12 }}>
          무료 · 30초 · 개인정보 없이 가능해요
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════
   설문 스텝들
══════════════════════ */

function StepBiz({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  function pick(key: string) {
    onChange(key);
    setTimeout(onNext, 150);
  }
  return (
    <>
      <div style={{ padding: "28px 20px 0" }}>
        <p style={{ fontSize: 13, color: "var(--text-low)", marginBottom: 10 }}>1단계</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: "135%", marginBottom: 8 }}>
          어떤 업종이세요?
        </h2>
        <p style={{ fontSize: 15, color: "var(--text-low)", lineHeight: "150%" }}>
          가장 가까운 업종을 선택해 주세요
        </p>
      </div>

      <div style={{ padding: "24px 20px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {BIZ_TYPES.map(({ key, label, sub }) => (
          <button
            key={key}
            className={`seed-chip${value === key ? " selected" : ""}`}
            onClick={() => pick(key)}
            style={{ minHeight: 86 }}
          >
            <p style={{
              fontSize: 15, fontWeight: 700, lineHeight: "135%",
              color: value === key ? "var(--blue)" : "var(--text)", marginBottom: 4,
            }}>
              {label}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-low)", lineHeight: "140%" }}>{sub}</p>
          </button>
        ))}
      </div>
    </>
  );
}

function StepRevenue({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);

  return (
    <div style={{ padding: "28px 20px 0" }}>
      <p style={{ fontSize: 13, color: "var(--text-low)", marginBottom: 10 }}>2단계</p>
      <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: "135%", marginBottom: 8 }}>
        작년 한 해 매출이<br />얼마나 되세요?
      </h2>
      <p style={{ fontSize: 15, color: "var(--text-low)", lineHeight: "150%", marginBottom: 28 }}>
        2025년 카드·현금 모두 합친 금액이요<br />
        부가세 포함해서 넣으셔도 돼요
      </p>

      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          className="seed-input"
          placeholder="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ paddingRight: 56 }}
        />
        <span style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          fontSize: 16, fontWeight: 700, color: "var(--text-low)", pointerEvents: "none",
        }}>
          만원
        </span>
      </div>

      {value && Number(value) > 0 && (
        <div style={{ marginTop: 10, padding: "13px 16px", background: "var(--blue-low)", borderRadius: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--blue)" }}>{fmtWon(value)}</span>
        </div>
      )}

      <div style={{
        marginTop: 20, padding: "14px 16px",
        background: "var(--gray-50)", borderRadius: 10,
        borderLeft: "3px solid var(--gray-300)",
      }}>
        <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: "155%" }}>
          잘 모르시겠으면 하루 평균 매출 × 365일로<br />
          대략 계산해서 넣으셔도 충분해요<br />
          <span style={{ color: "var(--gray-500)" }}>예) 하루 36만원이면 → 13200</span>
        </p>
      </div>
    </div>
  );
}

function StepCard({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);

  const preview = Number(value) > 0 ? Math.floor(Number(value) * 10_000 * 0.013) : 0;

  return (
    <div style={{ padding: "28px 20px 0" }}>
      <p style={{ fontSize: 13, color: "var(--text-low)", marginBottom: 10 }}>3단계</p>
      <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: "135%", marginBottom: 8 }}>
        이번 분기 카드 매출은<br />어떻게 되세요?
      </h2>
      <p style={{ fontSize: 15, color: "var(--text-low)", lineHeight: "150%", marginBottom: 28 }}>
        신고할 3개월치 카드 + 현금영수증 합계예요<br />
        대략 맞으면 충분해요
      </p>

      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          className="seed-input"
          placeholder="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ paddingRight: 56 }}
        />
        <span style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          fontSize: 16, fontWeight: 700, color: "var(--text-low)", pointerEvents: "none",
        }}>
          만원
        </span>
      </div>

      {preview > 0 && (
        <div style={{
          marginTop: 10, padding: "14px 16px", background: "var(--blue-low)", borderRadius: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 14, color: "var(--blue)" }}>이것만으로 돌려받는 세금</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--blue)" }}>
            약 {preview.toLocaleString()}원
          </span>
        </div>
      )}

      <div style={{
        marginTop: 20, padding: "14px 16px",
        background: "var(--gray-50)", borderRadius: 10,
        borderLeft: "3px solid var(--gray-300)",
      }}>
        <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: "155%" }}>
          한 달 카드 매출 × 3을 넣으시면 돼요<br />
          <span style={{ color: "var(--gray-500)" }}>예) 한 달에 900만원이면 → 2700</span>
        </p>
      </div>
    </div>
  );
}

function StepPurchase({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 100); }, []);

  const preview = Number(value) > 0 ? Math.floor((Number(value) * 10_000 * 6) / 106) : 0;

  return (
    <div style={{ padding: "28px 20px 0" }}>
      <p style={{ fontSize: 13, color: "var(--text-low)", marginBottom: 10 }}>4단계</p>
      <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: "135%", marginBottom: 8 }}>
        식재료 살 때 세금계산서<br />받으신 게 있으세요?
      </h2>
      <p style={{ fontSize: 15, color: "var(--text-low)", lineHeight: "150%", marginBottom: 28 }}>
        농협·식자재마트 등에서 세금계산서 받으신<br />
        이번 분기 식재료 매입 금액이에요<br />
        없으시면 0으로 넣으시면 돼요
      </p>

      <div style={{ position: "relative" }}>
        <input
          ref={ref}
          type="number"
          inputMode="numeric"
          className="seed-input"
          placeholder="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ paddingRight: 56 }}
        />
        <span style={{
          position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
          fontSize: 16, fontWeight: 700, color: "var(--text-low)", pointerEvents: "none",
        }}>
          만원
        </span>
      </div>

      {preview > 0 && (
        <div style={{
          marginTop: 10, padding: "14px 16px", background: "var(--green-low)", borderRadius: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 14, color: "var(--green)" }}>추가로 돌려받는 세금</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>
            약 {preview.toLocaleString()}원
          </span>
        </div>
      )}

      <div style={{
        marginTop: 20, padding: "14px 16px",
        background: "var(--gray-50)", borderRadius: 10,
        borderLeft: "3px solid var(--gray-300)",
      }}>
        <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: "155%" }}>
          세금계산서·계산서가 있는 식재료만 해당돼요<br />
          일반 마트 영수증이나 간이영수증은 해당 안 됩니다
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════
   메인
══════════════════════ */
export default function HomePage() {
  const router = useRouter();
  const [view, setView]     = useState<View>("landing");
  const [stepIdx, setStepIdx] = useState(0);
  const [state, setState]   = useState<State>(EMPTY);

  const steps       = getSteps(state.bizType);
  const currentStep = steps[stepIdx] as Step;

  function canNext() {
    if (currentStep === "biz")      return !!state.bizType;
    if (currentStep === "rev")      return !!state.rev && Number(state.rev) > 0;
    if (currentStep === "card")     return !!state.card && Number(state.card) > 0;
    if (currentStep === "purchase") return true;
    return false;
  }

  function goNext() {
    if (stepIdx < steps.length - 1) {
      setStepIdx(i => i + 1);
    } else {
      const p = new URLSearchParams({
        type: state.bizType,
        rev:  state.rev,
        card: state.card,
        ...(state.bizType === "음식숙박업" ? { purchase: state.purchase || "0" } : {}),
      });
      router.push(`/result?${p}`);
    }
  }

  function goBack() {
    if (stepIdx === 0) setView("landing");
    else setStepIdx(i => i - 1);
  }

  function set(key: keyof State) {
    return (v: string) => setState(s => ({ ...s, [key]: v }));
  }

  if (view === "landing") {
    return <Landing onStart={() => { setState(EMPTY); setStepIdx(0); setView("survey"); }} />;
  }

  const total    = steps.length;
  const showBtn  = currentStep !== "biz";
  const isLast   = stepIdx === steps.length - 1;

  return (
    <Screen>
      <TopBar step={stepIdx + 1} total={total} onBack={goBack} />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {currentStep === "biz"      && <StepBiz      value={state.bizType}  onChange={set("bizType")}  onNext={goNext} />}
        {currentStep === "rev"      && <StepRevenue  value={state.rev}      onChange={set("rev")} />}
        {currentStep === "card"     && <StepCard     value={state.card}     onChange={set("card")} />}
        {currentStep === "purchase" && <StepPurchase value={state.purchase} onChange={set("purchase")} />}
      </div>

      {showBtn && (
        <BottomBtn
          label={isLast ? "결과 확인하기" : "다음"}
          disabled={!canNext()}
          onClick={goNext}
        />
      )}
    </Screen>
  );
}
