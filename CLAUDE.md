# tosspos-tax-plugin — CLAUDE.md

## 프로젝트 개요

아이샵케어 가맹점 사장님을 위한 **소상공인 절세 진단 웹 서비스**.
토스포스 POS 플러그인으로 시작했다가, 아이샵케어 홈페이지에서 독립적으로 접근 가능한 웹 서비스로 전환.

**라이브 URL**: https://blyhry.github.io/tosspos-tax-plugin/
**GitHub**: https://github.com/blyhry/tosspos-tax-plugin

---

## 기술 스택

- **Framework**: Next.js 15.1.0 (App Router) + TypeScript
- **Styling**: Tailwind CSS + CSS 변수 (Seed Design System 토큰 직접 하드코딩)
- **Runtime**: Bun (`~/.bun/bin/bun`)
- **빌드**: `bun run build` → `./out` (정적 export)
- **배포**: GitHub Actions → GitHub Pages (push to `main` 시 자동)

## 개발 명령어

```bash
~/.bun/bin/bun dev        # 개발 서버
~/.bun/bin/bun run build  # 정적 빌드 (./out)
```

---

## 디렉토리 구조

```
app/
  page.tsx          # 랜딩 + 단계별 설문 wizard (메인)
  result/page.tsx   # 절세 진단 결과 페이지
  globals.css       # Seed 디자인 토큰 (CSS 변수)
  layout.tsx        # 최소 레이아웃 (헤더 없음)
lib/
  taxCalc.ts        # 세금 계산 함수 (순수 함수, 부수효과 없음)
```

---

## 핵심 계산 로직 (`lib/taxCalc.ts`)

| 항목 | 계산 | 한도 |
|------|------|------|
| 신용카드발행세액공제 | 카드매출 × 1.3% | 연 1,000만원 (분기 250만원) |
| 의제매입세액공제 | 식재료매입 × 6/106 | 음식숙박업만 해당 |

**간편장부 기준 (직전연도 매출)**
- 도소매업: 3억 미만
- 음식숙박업: 1.5억 미만
- 서비스업/기타: 7,500만 미만

---

## 페이지 흐름

1. **랜딩** — 후킹 카피 ("사장님, 지금 세금을 더 내고 계세요") + CTA
2. **설문 wizard** — 단계별 한 질문씩
   - `biz`: 업종 선택 (선택 즉시 다음으로)
   - `rev`: 직전연도 매출 (만원 단위 입력)
   - `card`: 이번 분기 카드매출
   - `purchase`: 식재료 매입 (음식숙박업만 표시)
3. **결과** — URL params로 데이터 전달 (`/result?type=&rev=&card=&purchase=`)

---

## 디자인 원칙

- Seed Design System 토큰 (`--blue: #3182F6` 등) — `globals.css` 참고
- 존댓말, 이모지 없음, AI 느낌 배제
- 최대 너비 480px (모바일 퍼스트)
- `@seed-design/stylesheet` 패키지 설치되어 있음 (토큰 원본 참조용)

---

## 배포 구성

- `next.config.ts`: `output: "export"`, `basePath: "/tosspos-tax-plugin"`
- `.github/workflows/deploy.yml`: main push → GitHub Pages 자동 배포
- `.gitignore`에 `out/` 포함 (빌드 아티팩트 커밋 금지)

---

## 비즈니스 컨텍스트 (`toss-plugin-context.md` 참고)

- **목적**: 가맹점 락인 + 아이샵케어 무료 상담 유도 CTA
- **타깃**: 소상공인 (음식점, 도소매, 서비스업)
- **CTA**: "아이샵케어 가맹점이 되시면 절세 컨설팅 무료" → 전화 상담 연결
- **전화번호**: CTA의 `tel:` 링크 — 실제 번호로 교체 필요 (현재 1588-0000 placeholder)
