# 쿠핀 ON 데모 (Vite + React) 설계

- 작성: 2026-10-12
- 목적: 사수에게 ON 기획을 설명하는 클릭형 데모. 실서비스 코드가 아니다.
- 기획 원문: 노션 「회사 > ON 기획」 (https://app.notion.com/p/ON-3f78e59a2a2780508948ee6dd9ea35c4?source=copy_link)
- 이전 버전: `../index.html` (단일 HTML 데모). 기능·문구·시연 순서를 이어받는다.

## 1. 범위

### 이어받는 것 (기존 HTML 데모와 동일)

- 한 화면에 ON 관리자(왼쪽)와 고객 웹앱 폰 프레임(오른쪽). 보기 전환: 나란히 / 관리자 / 고객 앱
- 상단 흐름 띠 (PLUS · Halo · ON · 고객 · 매장): 동작마다 경로를 따라 켜짐. 미확인 경로는 노란 점선
- 연동 로그 한 줄 + 전체 로그 팝오버 (실제 연동이면 호출됐을 API 표시)
- 확인 필요 배지 8개 (노션 기획서 8번 섹션과 번호 동일) + 확인 필요 팝오버
- 시연 가이드 6단계, 상태로 자동 체크
- 관리자: Halo 상품 목록(필터) · 상품 보강(Halo 원본 / ON 입력) · 게시 상품(숨김/다시 게시) · 발급 현황(KPI, Halo 월 한도, 최근 발급)
- 고객: 둘러보기(지도/목록, 카테고리, 검색) · 상세 · 결제(데모) · 발급 완료 · 내 쿠폰(사용 가능 / 사용 완료·만료) · 쿠폰 상세(바코드, PIN, 매장 사용 처리 시뮬레이션)
- 처음 상태로 되돌리기, 브라우저 저장

### 새로 더하는 것

1. **카카오맵**: 그린 지도 대신 실제 카카오 지도. 성수동 실제 좌표 위에 샘플 매장(가상 이름) 7곳
2. **관리자 주소 검색**: 주소 입력 → 주소 검색(없으면 키워드 검색) 후보 최대 5개 → 선택하면 핀·좌표·주소 채움. 지도 클릭 → 핀 이동 + 역지오코딩으로 주소 채움
3. **고객 내 위치와 실제 거리**: [내 위치] → 브라우저 위치 권한. 허용 + 성수동 기준점에서 5km 이내면 실제 위치 기준, 아니면 "성수동 기준으로 보여 드려요" 안내 후 기준점 유지. 거리는 하버사인
4. **이 지역 검색**: 지도를 움직이면 [이 지역에서 다시 찾기] 버튼. 누르면 현재 지도 범위 안의 혜택만 지도·목록에 표시. 범위 필터가 켜진 동안 [전체 보기]로 해제

### 하지 않는 것

- 로그인, 실결제, Halo 실연동, 서버, URL 분리, 실제 폰과 상태 공유
- 찜, 리뷰, 선물하기, AI 추천

## 2. 기술 선택

| 항목 | 선택 | 이유 |
| --- | --- | --- |
| 빌드 | Vite ~8.2, React 19.2, TypeScript ~5.9 | 회사 저장소와 같은 축. TS 7은 막 나와서 피함 |
| 지도 | react-kakao-maps-sdk 1.2 + kakao.maps.d.ts | SDK 로딩(`useKakaoLoader`)과 오버레이를 컴포넌트로 다룸 |
| 상태 | zustand 5 + persist | 팀 FE 앱과 같은 라이브러리, 브라우저 저장 |
| 스타일 | CSS 변수 토큰 + CSS Modules | 기존 데모 토큰 이식. 인라인 스타일 금지 |
| 테스트 | Vitest 4.1 (+ jsdom) | 회사 저장소와 같은 버전대 |
| 패키지 | pnpm 10.30.3 | 로컬 환경과 같음 |

## 3. 구조

```
on-demo/
  .env.example          VITE_KAKAO_JS_KEY=
  docs/spec.md
  src/
    main.tsx, App.tsx    상단 바 + 보기 전환 + 무대
    styles/              tokens.css, global.css
    data/                seed.ts (Halo 상품 8개, Swagger 필드명) · checks.ts (확인 필요 8개)
    domain/              coupon.ts · geo.ts · format.ts   (순수 함수)
    store/               demo.ts (persist) · ui.ts (저장 안 함) · flow.ts (흐름 띠 이벤트)
    map/                 KakaoGate.tsx · CustomerMap.tsx · PickerMap.tsx · geocode.ts · useMyLocation.ts
    components/          FlowStrip · Ticker · CheckBadge · Popovers · Toast · PhoneFrame · Chip 등
    admin/               AdminShell · HaloList · ListingEditor · PublishedList · Stats
    app/                 CustomerApp · Home · Detail · Checkout · Done · Wallet · CouponView
```

규칙

- 카카오 SDK를 직접 만지는 코드는 `map/` 안에만 둔다. 다른 폴더는 `{ lat, lng }`만 주고받는다.
- 화면 컴포넌트는 store 액션만 호출한다. 도메인 계산은 `domain/` 순수 함수로 둔다.
- 노출 문구는 기존 데모 문구를 그대로 쓰고, 줄표(—) 부연을 쓰지 않는다.

## 4. 데이터

기존 데모 모양을 유지하고 좌표만 위경도로 바꾼다. 저장 키는 `coupin-on-demo-react-v1` (기존 HTML 데모와 분리).

```ts
type HaloShowpiece = {           // Halo GET /v1/campaigns/{doccode}/showpieces 필드명
  code: string; name: string; brandName: string; brandCode: string;
  type: 'EXCHANGE' | 'BALANCE'; consumerPrice: number; adjustPrice: number;
  durationType: 'PERIOD' | 'FIXED'; duration?: number; expireDate?: string; // YYYY-MM-DD
  isIssuedDateIncluded: boolean; useablePlace: string; restriction: string; precaution: string;
  isOnSale: boolean;
};
type Listing = {                 // ON이 채우는 정보
  code: string; storeName: string; cat: CategoryId | ''; address: string;
  lat: number | null; lng: number | null; intro: string;
  saleMode: 'FREE' | 'PAID'; price: number; status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  publishedAt?: string;          // ISO 8601
};
type Coupon = {
  id: string; code: string; pin: string; seq: string; tid: string;   // tid: ON-YYYYMMDD-NNNN
  status: 'AVAILABLE' | 'USED'; issuedAt: string; expiredAt: string; usedAt?: string; // ISO 8601
  paid: number; saleMode: 'FREE' | 'PAID'; balance?: number; seed?: boolean;
};
type DemoState = {
  halo: HaloShowpiece[]; listings: Record<string, Listing>; coupons: Coupon[];
  limit: { total: number; used: number };       // Halo GET /v1/clients/limit, 제공가 기준
  log: LogEntry[]; flags: { viewedNail: boolean; statsSeen: boolean }; counter: number;
};
```

- 쿠폰 상태 `EXPIRED`는 저장하지 않고 `expiredAt`으로 계산한다.
- 게시 조건: Halo `isOnSale`, 매장명, 카테고리, 좌표, 유료면 판매가 > 0
- 발급 시 `limit.used += adjustPrice`. 한도를 넘으면 구매 버튼 비활성
- 유효기간: PERIOD는 발급일 포함이면 발급일 + (N-1)일, 아니면 + N일. 그날 23:59:59까지. FIXED는 `expireDate` 23:59:59

## 5. 지도 동작

- 기준점: 성수역 부근 (37.5446, 127.0557). 고객 지도 시작 레벨 5 (실제 화면에서 4는 핀 절반이 화면 밖)
- `KakaoGate`: `useKakaoLoader({ appkey, libraries: ['services'] })`. 키 없음 / 로딩 실패 / 로딩 중 세 상태를 안내 카드로 보여 준다. 지도 외 기능은 계속 동작
- 고객 핀: `CustomOverlayMap`. 카테고리 색과 아이콘, 선택되면 가격표. 방금 게시한 핀은 떨어지는 애니메이션 1회
- 이 지역 검색: 지도 `onIdle` → 처음 표시 이후 이동하면 버튼 노출 → 누르면 `map.getBounds()`로 범위 저장 → 목록·지도 모두 범위 필터
- 내 위치: `navigator.geolocation.getCurrentPosition` (timeout 8초). 결과를 `ui.origin`에 두고 거리 계산 기준으로 쓴다
- 관리자 PickerMap: 클릭 → 좌표 저장 + `coord2Address` (도로명 우선). 주소 검색: `addressSearch` → 결과 0건이면 `Places.keywordSearch`

## 6. 오류와 빈 상태

| 상황 | 표시 |
| --- | --- |
| 키 없음 | 지도 자리에 "카카오 JavaScript 키를 .env의 VITE_KAKAO_JS_KEY에 넣어 주세요" + 도메인 등록 안내 |
| SDK 로딩 실패 | "지도를 불러오지 못했어요. 키와 등록 도메인(http://localhost:5173)을 확인해 주세요" |
| 주소 검색 0건 | "검색 결과가 없어요. 도로명이나 건물 이름으로 다시 찾아보세요" |
| 위치 권한 거부·시간 초과 | "위치를 가져오지 못해 성수동 기준으로 보여 드려요" |
| 범위 안 혜택 0개 | "이 지역에는 혜택이 없어요" + [전체 보기] |
| 브라우저 저장 불가 | 조용히 메모리로만 동작 (새로고침 시 처음 상태) |

## 7. 테스트

- 단위 (Vitest)
  - `domain/coupon`: PERIOD 포함/미포함, FIXED, D-day, 상태(사용 완료 / 만료 / 사용 가능)
  - `domain/geo`: 하버사인 거리(알려진 두 점), 범위 포함, 5km 판정
  - `store/demo`: 필수값 없으면 게시 거부, 게시 성공, 발급 시 한도·tid·로그, 매장 사용 처리, 숨김, 초기화
- 정적: `pnpm typecheck`, `pnpm build`
- 브라우저 (Playwright, 키 입력 후): 시연 6단계, 관리자 주소 검색·지도 클릭, 고객 이 지역 검색·내 위치(권한 거부 경로), 390px 폭 가로 넘침 없음

## 8. 실행

```sh
cd ~/Documents/company/on-planning/on-demo
cp .env.example .env   # VITE_KAKAO_JS_KEY 채우기
pnpm install
pnpm dev               # http://localhost:5173
```

카카오 디벨로퍼스: 내 애플리케이션 → 앱 키의 JavaScript 키, 플랫폼 → Web 사이트 도메인에 `http://localhost:5173` 등록.
