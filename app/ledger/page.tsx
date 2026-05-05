"use client";

import { useState } from "react";
import TabNav from "@/components/BottomNav";
import { ledgerRows, LedgerRow, AccountType, VoucherType } from "@/lib/mockData";
import { checkEligibilityMock as checkEligibility, fmt, fmtW } from "@/lib/taxCalc";

// ── NTS 공식 계정과목 ────────────────────────────────────────────────────────
const ACCOUNTS: Record<AccountType, string[]> = {
  수입: ["매출액", "기타수입금액"],
  비용: ["재료비·상품매입", "인건비·급료", "임차료", "광고선전비", "제세공과금", "지급이자", "감가상각비", "기타비용"],
  자산: ["사업용 자산 취득", "사업용 자산 처분"],
};

const TYPE_META: Record<AccountType, { emoji: string; txtColor: string; amtColor: string; badge: string }> = {
  수입: { emoji: "💰", txtColor: "text-blue-700", amtColor: "text-blue-600", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  비용: { emoji: "💸", txtColor: "text-rose-700", amtColor: "text-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-200" },
  자산: { emoji: "🏢", txtColor: "text-violet-700", amtColor: "text-violet-600", badge: "bg-violet-50 text-violet-700 border-violet-200" },
};

const VOUCHERS: VoucherType[] = ["세금계산서", "신용카드", "현금영수증", "간이영수증", "기타"];

// ── 채팅 입력 단계 ────────────────────────────────────────────────────────────
type Step = "date" | "type" | "account" | "content" | "vendor" | "amount" | "voucher";
const STEPS: Step[] = ["date", "type", "account", "content", "vendor", "amount", "voucher"];
const QUESTIONS: Record<Step, string> = {
  date:    "언제 거래하셨나요?",
  type:    "수입이었나요, 지출이었나요?",
  account: "어떤 항목인가요?",
  content: "어떤 내용으로 거래하셨나요?",
  vendor:  "거래처는 어디인가요?",
  amount:  "금액은 얼마인가요?",
  voucher: "증빙 서류는 무엇인가요?",
};

interface Draft {
  date: string;
  type: AccountType | "";
  account: string;
  content: string;
  vendor: string;
  supplyAmt: string;
  vatAmt: string;
  voucher: VoucherType | "";
}

const EMPTY: Draft = { date: "2026-01-01", type: "", account: "", content: "", vendor: "", supplyAmt: "", vatAmt: "", voucher: "" };

const eligibility = checkEligibility();

export default function LedgerPage() {
  const [rows, setRows] = useState<LedgerRow[]>(ledgerRows);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [step, setStep] = useState<Step>("date");
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const totalIncome  = rows.filter(r => r.accountType === "수입").reduce((s, r) => s + r.supplyAmt + r.vatAmt, 0);
  const totalExpense = rows.filter(r => r.accountType === "비용").reduce((s, r) => s + r.supplyAmt + r.vatAmt, 0);

  const stepIdx = STEPS.indexOf(step);

  function openChat() { setDraft(EMPTY); setStep("date"); setShowChat(true); }
  function closeChat() { setShowChat(false); }

  function canNext() {
    if (step === "date")    return !!draft.date;
    if (step === "type")    return !!draft.type;
    if (step === "account") return !!draft.account;
    if (step === "content") return draft.content.trim().length > 0;
    if (step === "vendor")  return true;
    if (step === "amount")  return !!draft.supplyAmt;
    if (step === "voucher") return !!draft.voucher;
    return false;
  }

  function goNext() {
    if (!canNext()) return;
    if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1]);
    else save();
  }

  function goPrev() {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1]);
    else closeChat();
  }

  function save() {
    const r: LedgerRow = {
      id: Date.now().toString(),
      date: draft.date,
      account: draft.account,
      accountType: draft.type as AccountType,
      content: draft.content,
      vendor: draft.vendor,
      supplyAmt: Number(draft.supplyAmt) || 0,
      vatAmt: Number(draft.vatAmt) || 0,
      note: (draft.voucher || "기타") as VoucherType,
      fromPOS: false,
    };
    setRows(prev => [...prev, r]);
    closeChat();
  }

  function deleteRow(id: string) { setRows(prev => prev.filter(r => r.id !== id)); setDetailId(null); }

  // 이전 답변 요약 텍스트
  function draftVal(s: Step): string {
    if (s === "date")    return draft.date;
    if (s === "type")    return draft.type;
    if (s === "account") return draft.account;
    if (s === "content") return draft.content;
    if (s === "vendor")  return draft.vendor || "생략";
    if (s === "amount")  return fmtW(Number(draft.supplyAmt)) + (draft.vatAmt ? ` + 부가세 ${fmtW(Number(draft.vatAmt))}` : "");
    if (s === "voucher") return draft.voucher;
    return "";
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <TabNav />

      {/* 상단 요약 */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 shrink-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold text-gray-800">2026년 1월 간편장부</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${eligibility.eligible ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
            {eligibility.eligible ? `✓ 간편장부 대상 (직전연도 ${fmt(eligibility.prevRevenue / 10000)}만원)` : "✕ 복식부기 의무"}
          </span>
        </div>
        <div className="flex gap-3 text-[11px]">
          <span className="text-gray-400">수입 <b className="text-blue-600">{fmtW(totalIncome)}</b></span>
          <span className="text-gray-200">|</span>
          <span className="text-gray-400">비용 <b className="text-rose-500">{fmtW(totalExpense)}</b></span>
          <span className="text-gray-200">|</span>
          <span className="text-gray-400">수지 <b className="text-gray-800">{fmtW(totalIncome - totalExpense)}</b></span>
        </div>
      </div>

      {/* 컬럼 헤더 */}
      <div className="bg-gray-50 border-b border-gray-200 px-3 py-1 shrink-0 grid grid-cols-[48px_72px_1fr_72px] gap-1">
        {["일자","계정과목","거래내용 · 거래처","금액"].map(h => (
          <span key={h} className="text-[8.5px] font-bold text-gray-400">{h}</span>
        ))}
      </div>

      {/* 장부 rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50 pb-16">
        {sorted.map(row => {
          const meta = TYPE_META[row.accountType as AccountType] ?? TYPE_META["비용"];
          const isOpen = detailId === row.id;
          return (
            <div key={row.id}>
              <div
                className={`px-3 py-2 grid grid-cols-[48px_72px_1fr_72px] gap-1 items-start cursor-pointer ${isOpen ? "bg-gray-50" : ""}`}
                onClick={() => setDetailId(isOpen ? null : row.id)}
              >
                <span className="text-[10px] text-gray-400 pt-0.5">{row.date.slice(5)}</span>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[8.5px] px-1 py-0.5 rounded border font-medium leading-tight ${meta.badge}`}>
                    {row.account}
                  </span>
                  {row.fromPOS && <span className="text-[7.5px] text-gray-300 pl-0.5">POS</span>}
                </div>
                <div>
                  <p className="text-[11px] text-gray-700 leading-snug">{row.content}</p>
                  {row.vendor && row.vendor !== "-" && <p className="text-[9px] text-gray-400">{row.vendor}</p>}
                </div>
                <div className="text-right">
                  <p className={`text-[11px] font-semibold ${meta.amtColor}`}>{fmt(row.supplyAmt)}</p>
                  {row.vatAmt > 0 && <p className={`text-[9px] opacity-60 ${meta.amtColor}`}>+{fmt(row.vatAmt)}</p>}
                  <p className="text-[8px] text-gray-300 mt-0.5">{row.note}</p>
                </div>
              </div>
              {isOpen && (
                <div className="bg-gray-50 border-t border-gray-100 px-3 py-2 flex items-center gap-2">
                  <div className="flex-1 text-[9px] text-gray-500 space-y-0.5">
                    <p>일자: {row.date} · {row.accountType} &gt; {row.account}</p>
                    <p>공급가액 {fmtW(row.supplyAmt)} · 부가세 {fmtW(row.vatAmt)} · 합계 {fmtW(row.supplyAmt + row.vatAmt)}</p>
                    <p>증빙: {row.note}</p>
                  </div>
                  <button onClick={() => deleteRow(row.id)}
                    className="text-[10px] text-red-400 border border-red-200 px-2 py-1 rounded">삭제</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 하단 주석 */}
      <div className="bg-white border-t border-gray-100 px-3 py-1 shrink-0">
        <p className="text-[8.5px] text-gray-400">※ 국세청 간편장부 양식 기준 · 종합소득세 신고 시 첨부</p>
      </div>

      {/* FAB */}
      {!showChat && (
        <button onClick={openChat}
          className="absolute bottom-10 right-4 w-11 h-11 bg-[#0064FF] text-white rounded-full shadow-lg text-2xl flex items-center justify-center z-20">
          +
        </button>
      )}

      {/* ── 채팅형 입력 패널 ── */}
      {showChat && (
        <div className="absolute inset-0 z-30 flex flex-col bg-black/30"
          onClick={e => { if (e.target === e.currentTarget) closeChat(); }}>
          <div className="mt-auto bg-white rounded-t-2xl shadow-xl">

            {/* 핸들 + 진행 바 */}
            <div className="px-4 pt-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
              <div className="flex gap-1">
                {STEPS.map((s, i) => (
                  <div key={s} className={`flex-1 h-1 rounded-full ${i <= stepIdx ? "bg-[#0064FF]" : "bg-gray-100"}`} />
                ))}
              </div>
            </div>

            {/* 이전 답변 (탭하면 해당 스텝으로 이동) */}
            {stepIdx > 0 && (
              <div className="px-4 pt-2 space-y-1 border-b border-gray-50 pb-2">
                {STEPS.slice(0, stepIdx).map(s => (
                  <button key={s} onClick={() => setStep(s)}
                    className="flex items-center gap-2 w-full text-left">
                    <span className="text-[9px] text-gray-400 w-14 shrink-0">{QUESTIONS[s].slice(0, 7)}</span>
                    <span className="text-[11px] text-gray-700 font-medium truncate flex-1">{draftVal(s)}</span>
                    <span className="text-[9px] text-blue-400 shrink-0">수정</span>
                  </button>
                ))}
              </div>
            )}

            {/* 현재 질문 + 입력 */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-[14px] font-bold text-gray-800 mb-3">{QUESTIONS[step]}</p>

              {step === "date" && (
                <input type="date" className="input-sm"
                  value={draft.date}
                  onChange={e => setDraft(p => ({ ...p, date: e.target.value }))} />
              )}

              {step === "type" && (
                <div className="flex gap-2">
                  {(["수입","비용","자산"] as AccountType[]).map(t => (
                    <button key={t}
                      onClick={() => setDraft(p => ({ ...p, type: t, account: "" }))}
                      className={`flex-1 py-4 rounded-xl text-[12px] font-bold border-2 transition-all ${
                        draft.type === t ? "border-[#0064FF] bg-blue-50" : "border-gray-100 text-gray-400"
                      }`}>
                      <span className="text-xl block mb-1">{TYPE_META[t].emoji}</span>
                      {t}
                    </button>
                  ))}
                </div>
              )}

              {step === "account" && draft.type && (
                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNTS[draft.type as AccountType].map(a => (
                    <button key={a}
                      onClick={() => setDraft(p => ({ ...p, account: a }))}
                      className={`py-2.5 px-3 rounded-lg text-[11px] font-medium border text-left ${
                        draft.account === a ? "border-[#0064FF] bg-blue-50 text-blue-700" : "border-gray-100 text-gray-600 bg-gray-50"
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              )}

              {step === "content" && (
                <input type="text" className="input-sm"
                  placeholder={draft.account ? `예: ${draft.account} 관련 내용` : "거래 내용 입력"}
                  value={draft.content}
                  onChange={e => setDraft(p => ({ ...p, content: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && canNext() && goNext()} />
              )}

              {step === "vendor" && (
                <div className="space-y-2">
                  <input type="text" className="input-sm"
                    placeholder="예: 농협하나로마트"
                    value={draft.vendor}
                    onChange={e => setDraft(p => ({ ...p, vendor: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && goNext()} />
                  <button onClick={() => { setDraft(p => ({ ...p, vendor: "" })); goNext(); }}
                    className="text-[11px] text-gray-400 underline w-full text-center">
                    거래처 없음 · 건너뛰기
                  </button>
                </div>
              )}

              {step === "amount" && (
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">공급가액 (부가세 제외 금액)</label>
                    <input type="number" className="input-sm" placeholder="0"
                      value={draft.supplyAmt}
                      onChange={e => setDraft(p => ({ ...p, supplyAmt: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">부가세 <span className="text-gray-400">(면세·영세율이면 0)</span></label>
                    <input type="number" className="input-sm" placeholder="0"
                      value={draft.vatAmt}
                      onChange={e => setDraft(p => ({ ...p, vatAmt: e.target.value }))} />
                  </div>
                  {draft.supplyAmt && (
                    <p className="text-[11px] text-right text-gray-500">
                      합계 <b className="text-gray-800">{fmtW(Number(draft.supplyAmt) + Number(draft.vatAmt || 0))}</b>
                    </p>
                  )}
                </div>
              )}

              {step === "voucher" && (
                <div className="grid grid-cols-3 gap-2">
                  {VOUCHERS.map(v => (
                    <button key={v}
                      onClick={() => setDraft(p => ({ ...p, voucher: v }))}
                      className={`py-2.5 rounded-lg text-[11px] font-medium border ${
                        draft.voucher === v ? "border-[#0064FF] bg-blue-50 text-blue-700" : "border-gray-100 text-gray-600 bg-gray-50"
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 이전 / 다음 버튼 */}
            <div className="flex gap-2 px-4 pt-2 pb-8">
              <button onClick={goPrev}
                className="w-11 h-11 rounded-xl bg-gray-100 text-gray-500 text-lg shrink-0">
                ←
              </button>
              <button onClick={goNext} disabled={!canNext()}
                className={`flex-1 h-11 rounded-xl text-[13px] font-bold ${canNext() ? "bg-[#0064FF] text-white" : "bg-gray-100 text-gray-300"}`}>
                {step === "voucher" ? "저장하기" : "다음 →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
