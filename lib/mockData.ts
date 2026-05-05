// 가맹점 기본 정보
export const mockStore = {
  name: "황금치킨 강남점",
  owner: "박민준",
  bizNum: "123-45-67890",
  businessType: "음식점업",
  taxType: "일반과세자" as const,
  openDate: "2024-03-01",
};

// 직전연도(2025) 수입 — 간편장부 대상자 판정
export const prevYearRevenue = 132_000_000; // 1억 3,200만원 (나군 1.5억 미만 → 간편장부 ✓)

// ── 국세청 간편장부 계정과목 분류 ─────────────────────────────────────
// 수입: 매출
// 비용: 매입, 임차료, 인건비, 복리후생비, 소모품비, 공과금, 수수료, 광고선전비, 차량유지비, 기타
// 고정자산: 비품, 기계장치, 차량운반구

export type AccountType = "수입" | "비용" | "자산";
export type VoucherType = "세금계산서" | "신용카드" | "현금영수증" | "간이영수증" | "기타";

export interface LedgerRow {
  id: string;
  date: string;
  account: string;      // 계정과목
  accountType: AccountType;
  content: string;      // 거래내용
  vendor: string;       // 거래처
  supplyAmt: number;    // 공급가액
  vatAmt: number;       // 세액
  note: VoucherType | ""; // 비고(증빙)
  fromPOS: boolean;     // POS 자동입력 여부
}

// ── 1월 자동 생성 장부 항목 ────────────────────────────────────────────
// 수입: 일별 카드/현금 매출 (POS 자동)
// 비용: 반복 지출 항목
export const ledgerRows: LedgerRow[] = [
  // ── 수입 ──
  { id:"i01", date:"2026-01-04", account:"매출", accountType:"수입", content:"카드 매출", vendor:"(토스포스)", supplyAmt:2_856_000, vatAmt:285_600, note:"신용카드", fromPOS:true },
  { id:"i02", date:"2026-01-04", account:"매출", accountType:"수입", content:"현금 매출", vendor:"-", supplyAmt:364_000, vatAmt:0, note:"기타", fromPOS:true },
  { id:"i03", date:"2026-01-11", account:"매출", accountType:"수입", content:"카드 매출", vendor:"(토스포스)", supplyAmt:2_730_000, vatAmt:273_000, note:"신용카드", fromPOS:true },
  { id:"i04", date:"2026-01-11", account:"매출", accountType:"수입", content:"현금 매출", vendor:"-", supplyAmt:371_000, vatAmt:0, note:"기타", fromPOS:true },
  { id:"i05", date:"2026-01-18", account:"매출", accountType:"수입", content:"카드 매출", vendor:"(토스포스)", supplyAmt:2_912_000, vatAmt:291_200, note:"신용카드", fromPOS:true },
  { id:"i06", date:"2026-01-18", account:"매출", accountType:"수입", content:"현금 매출", vendor:"-", supplyAmt:382_000, vatAmt:0, note:"기타", fromPOS:true },
  { id:"i07", date:"2026-01-25", account:"매출", accountType:"수입", content:"카드 매출", vendor:"(토스포스)", supplyAmt:3_246_000, vatAmt:324_600, note:"신용카드", fromPOS:true },
  { id:"i08", date:"2026-01-25", account:"매출", accountType:"수입", content:"현금 매출", vendor:"-", supplyAmt:339_000, vatAmt:0, note:"기타", fromPOS:true },
  // ── 비용 ──
  { id:"e01", date:"2026-01-10", account:"임차료", accountType:"비용", content:"1월 임대료", vendor:"(주)강남부동산", supplyAmt:2_000_000, vatAmt:200_000, note:"세금계산서", fromPOS:false },
  { id:"e02", date:"2026-01-13", account:"매입(재료비)", accountType:"비용", content:"닭·양념류 구매", vendor:"농협하나로마트", supplyAmt:1_650_000, vatAmt:0, note:"세금계산서", fromPOS:false },
  { id:"e03", date:"2026-01-20", account:"매입(재료비)", accountType:"비용", content:"식용유·포장재", vendor:"영남식자재", supplyAmt:580_000, vatAmt:58_000, note:"세금계산서", fromPOS:false },
  { id:"e04", date:"2026-01-25", account:"인건비", accountType:"비용", content:"아르바이트 급여", vendor:"김철수 외 1명", supplyAmt:3_200_000, vatAmt:0, note:"기타", fromPOS:false },
  { id:"e05", date:"2026-01-28", account:"공과금", accountType:"비용", content:"전기·가스요금", vendor:"한국전력 외", supplyAmt:380_000, vatAmt:0, note:"기타", fromPOS:false },
  { id:"e06", date:"2026-01-31", account:"수수료", accountType:"비용", content:"카드수수료 (1월)", vendor:"토스포스", supplyAmt:126_000, vatAmt:12_600, note:"세금계산서", fromPOS:true },
];

// ── 분기 집계 (공제 계산용) ─────────────────────────────────────────────
// 월별 카드/현금 매출 (POS 원본)
export const monthlySales = [
  { month:"1월", ym:"2026-01", total:11_200_000, card:9_744_000, cash:1_456_000 },
  { month:"2월", ym:"2026-02", total:10_500_000, card:9_135_000, cash:1_365_000 },
  { month:"3월", ym:"2026-03", total:8_800_000,  card:7_656_000, cash:1_144_000, partial:true },
];

// 분기 매입 (세금계산서 보유 항목만 — 의제매입공제 근거)
export const quarterlyPurchases = [
  { month:"1월", vendor:"농협하나로마트",  amount:1_650_000, vat:0,       voucher:"세금계산서" as VoucherType, eligible:true },
  { month:"1월", vendor:"영남식자재",      amount:580_000,  vat:58_000,  voucher:"세금계산서" as VoucherType, eligible:true },
  { month:"2월", vendor:"농협하나로마트",  amount:1_720_000, vat:0,       voucher:"세금계산서" as VoucherType, eligible:true },
  { month:"2월", vendor:"영남식자재",      amount:610_000,  vat:61_000,  voucher:"세금계산서" as VoucherType, eligible:true },
  { month:"3월", vendor:"농협하나로마트",  amount:1_480_000, vat:0,       voucher:"세금계산서" as VoucherType, eligible:true },
];

export const TAX_DEADLINE = new Date("2026-04-25");
export const TODAY = new Date("2026-03-13");
