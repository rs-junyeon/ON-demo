# 쿠핀 ON 데모 (Vite + React) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 HTML ON 데모를 Vite + React + TS로 옮기고, 카카오맵(고객 지도, 관리자 주소 검색, 내 위치, 이 지역 검색)을 더한다.

**Architecture:** 화면은 `admin/`·`app/` 컴포넌트, 상태는 zustand(`store/`), 계산은 순수 함수(`domain/`), 카카오 SDK는 `map/` 안에만 둔다. 화면은 store 액션만 호출하고, 지도와는 `{ lat, lng }`만 주고받는다.

**Tech Stack:** Vite ~8.2, React 19.2, TypeScript ~5.9, react-kakao-maps-sdk 1.2, zustand 5 (persist), CSS Modules, Vitest 4.1 + @testing-library/react + jsdom, pnpm 10.30.3

**Spec:** `docs/spec.md`. 기존 동작·문구의 원본은 `../index.html` (CHECKS 문구, 시연 가이드 문구, seed 상품 값, 화면 문구를 그대로 옮긴다).

## Global Constraints

- 저장 키 `coupin-on-demo-react-v1`. 기존 HTML 데모 키(`coupin-on-demo-v1`)와 섞지 않는다
- 카카오 키는 `import.meta.env.VITE_KAKAO_JS_KEY`로만 읽는다. 값을 로그·화면·커밋에 남기지 않는다. `.env`는 커밋하지 않는다
- 카카오 SDK(`kakao.maps.*`, react-kakao-maps-sdk)는 `src/map/` 밖에서 import 하지 않는다
- 인라인 `style` 속성 금지. 색·간격은 `styles/tokens.css` 변수, 컴포넌트 스타일은 `*.module.css`. 단 지도 오버레이 위치는 SDK가 잡는다
- 노출 문구에 줄표(—) 부연을 쓰지 않는다. 기존 데모 문구를 그대로 쓴다
- 기준점 `SEONGSU = { lat: 37.5446, lng: 127.0557 }`, 고객 지도 시작 레벨 4, 내 위치 허용 반경 5km, 위치 timeout 8000ms
- 주소 검색 후보 최대 5개
- 카테고리: BEAUTY 네일·뷰티 💅, CAFE 카페 ☕, FOOD 식당 🍳, FIT 운동 🏋️, CLASS 클래스 🏺
- Halo 월 한도 total 500000, 초기 used 182000. 발급 시 `adjustPrice`만큼 증가
- tid 형식 `ON-YYYYMMDD-NNNN` (counter 4자리, seed counter 2부터)
- 커밋: Conventional Commits, 태스크마다 1커밋

## Review Focus

1. 키는 있는데 카카오 콘솔에 `localhost:5173`이 등록되지 않음 → SDK 로딩 실패 문구가 나오고 앱의 나머지는 동작해야 한다 (Task 4 `KakaoGate` 오류 분기 테스트)
2. 위치 권한 거부 또는 8초 timeout → "위치를 가져오지 못해 성수동 기준으로 보여 드려요" 후 기준점 유지 (Task 4 `useMyLocation` 테스트)
3. 주소 검색이 주소·키워드 모두 0건 → "검색 결과가 없어요. 도로명이나 건물 이름으로 다시 찾아보세요" (Task 4 `searchAddress` 테스트 + Task 5 에디터 테스트)
4. localStorage에 깨진 JSON이 있거나 접근이 막힘 → 예외 없이 seed 상태로 시작 (Task 3 store 테스트)
5. Halo 월 한도를 넘는 구매 → `issue`가 막고 상세 버튼이 "이번 달 판매 수량이 모두 나갔어요"로 비활성 (Task 3 store 테스트 + Task 6 상세 테스트)

---

### Task 1: 프로젝트 골격

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.env.example`, `src/main.tsx`, `src/App.tsx`, `src/App.module.css`, `src/styles/tokens.css`, `src/styles/global.css`, `src/vite-env.d.ts`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `pnpm dev | build | typecheck | test` 스크립트. `ImportMetaEnv.VITE_KAKAO_JS_KEY?: string`. 전역 CSS 변수(기존 `:root` 토큰 전부)

- [ ] **Step 1:** 의존성 설치. dependencies: `react@^19.2 react-dom@^19.2 zustand@^5 react-kakao-maps-sdk@^1.2`. devDependencies: `vite@~8.2 @vitejs/plugin-react@^6 typescript@~5.9 kakao.maps.d.ts@^0.1.40 @types/react @types/react-dom vitest@~4.1 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom`
- [ ] **Step 2:** 실패하는 테스트 `App.test.tsx` — `render(<App />)` 후 `getByText('기획 데모')`가 보이고, 보기 전환 버튼 `나란히` `관리자` `고객 앱`이 있다
- [ ] **Step 3:** `pnpm test` → FAIL 확인
- [ ] **Step 4:** `App`에 상단 바 골격(브랜드, 보기 전환 3버튼, 처음 상태로)과 빈 무대 작성. `tokens.css`에 기존 `index.html`의 `:root` 변수를 그대로 옮김. vitest 환경 jsdom, setup에서 jest-dom 등록. `tsconfig`에 `"types": ["kakao.maps.d.ts", "vite/client"]`
- [ ] **Step 5:** `pnpm test && pnpm typecheck && pnpm build` → 모두 통과
- [ ] **Step 6:** Commit `chore: Vite + React + TS 프로젝트 골격`

### Task 2: 도메인 순수 함수

**Files:**
- Create: `src/domain/types.ts`, `src/domain/format.ts`, `src/domain/coupon.ts`, `src/domain/geo.ts`, `src/domain/listing.ts`
- Test: `src/domain/coupon.test.ts`, `src/domain/geo.test.ts`, `src/domain/listing.test.ts`

**Interfaces:**
- Produces:
  - `types.ts`: spec 4장의 `HaloShowpiece`, `Listing`, `Coupon`, `DemoState`, `LogEntry = { t: string; text: string; api: string; kind: 'halo' | 'internal' | 'unknown' }`, `CategoryId`, `LatLng = { lat: number; lng: number }`, `Bounds = { sw: LatLng; ne: LatLng }`, `CATEGORIES`
  - `format.ts`: `won(n: number): string` ("30,000원"), `ymd(d): string` ("2026.11.10"), `hm(d): string`, `hms(d): string`, `ymdCompact(d): string`, `maskPin(pin): string` ("1851-****-****-8387"), `groupPin(pin): string` ("1851 6525 9240 8387")
  - `coupon.ts`: `expiryFor(h: HaloShowpiece, from: Date): Date`, `couponState(c: Coupon, now: Date): 'AVAILABLE' | 'USED' | 'EXPIRED'`, `dday(c: Coupon, now: Date): { text: string; muted: boolean }`, `validityText(h): string`, `typeLabel(t): '교환권' | '금액권'`
  - `geo.ts`: `SEONGSU: LatLng`, `distanceM(a: LatLng, b: LatLng): number` (하버사인, 지구 반지름 6371000m), `distanceLabel(m: number): string` ("350m" / "1.2km", 10m 단위 반올림), `inBounds(p: LatLng, b: Bounds): boolean`, `withinKm(a, b, km): boolean`
  - `listing.ts`: `missingForPublish(h: HaloShowpiece, l: Listing): string[]` (순서: '매장명', '카테고리', '지도 위치', 'ON 판매가'), `canPublish(h, l): boolean` (`isOnSale && missing.length === 0`)

- [ ] **Step 1:** 실패하는 테스트
  - `expiryFor`: PERIOD 30일 포함, 발급 2026-10-12 10:00 → 2026-11-10 23:59:59 / 미포함 → 2026-11-11 23:59:59 / FIXED `2026-12-31` → 2026-12-31 23:59:59
  - `couponState`: status USED → 'USED' (만료 지났어도), 만료 지남 → 'EXPIRED', 그 외 'AVAILABLE'
  - `dday`: 만료 29일 남음 → `{ text: 'D-29', muted: false }`, 당일 → '오늘까지', USED → `{ text: '사용 완료', muted: true }`, EXPIRED → '기간 만료'
  - `distanceM`: 성수역(37.5446,127.0557) ↔ 뚝섬역(37.5472,127.0474) 약 790m (±30m)
  - `distanceLabel(347)` → "350m", `distanceLabel(1234)` → "1.2km"
  - `inBounds`: 안/밖/경계값
  - `withinKm(SEONGSU, 강남역 37.4979,127.0276, 5)` → false
  - `missingForPublish`: 빈 draft → 4개 전부, FREE면 'ON 판매가' 없음, 다 채우면 []
  - `canPublish`: `isOnSale: false`면 다 채워도 false
- [ ] **Step 2:** `pnpm test src/domain` → FAIL
- [ ] **Step 3:** 구현. 기존 `index.html`의 `expiryFor`, `dday`, `validityText`, `priceHtml`의 판정 로직을 옮긴다
- [ ] **Step 4:** `pnpm test src/domain` → PASS
- [ ] **Step 5:** Commit `feat: 쿠폰·거리·게시 조건 도메인 함수`

### Task 3: 데이터와 store

**Files:**
- Create: `src/data/seed.ts`, `src/data/checks.ts`, `src/store/demo.ts`, `src/store/ui.ts`, `src/store/flow.ts`, `src/domain/guide.ts`
- Test: `src/store/demo.test.ts`, `src/domain/guide.test.ts`

**Interfaces:**
- Consumes: Task 2 전부
- Produces:
  - `seed(now: Date): DemoState`: 기존 `index.html` seed와 같은 상품 8개·게시 6개·SP_NAIL DRAFT·쿠폰 2개(사용 완료 커피, 만료 디저트)·log 1건. 좌표는 성수동 실제 위경도(SEONGSU 반경 1km 안)로 바꾼다. `DOCCODE = 'ON-SEONGSU'`
  - `CHECKS: Record<1..8, { title: string; body: string; who: string }>` (기존 문구 그대로)
  - `useDemo` (persist, key `coupin-on-demo-react-v1`, version 1, storage는 try/catch로 감싼 localStorage) 상태 `DemoState` + 액션:
    - `saveListing(l: Listing): void`
    - `publish(l: Listing): { ok: true } | { ok: false; missing: string[] }` — 성공 시 status PUBLISHED, publishedAt, log `'{상품명}' 게시, 고객 앱 지도에 노출` / `ON 내부` / internal
    - `toggleHidden(code: string): void`
    - `issue(code: string, now?: Date): Coupon` — 게시 중 + isOnSale + 한도 안일 때만, 아니면 `Error`. log 2건(`POST /v2/orders`, `201 pin, seq, expiredAt`), `limit.used += adjustPrice`, counter +1
    - `recordPayment(code: string): void` — log `결제 승인 {금액} (데모)` / `ON 결제`
    - `markUsed(id: string): void` — status USED, usedAt, BALANCE면 balance 0, log 2건(`PLUS Audit 내부` internal, `확인 필요 1` unknown)
    - `setFlag(f: 'viewedNail' | 'statsSeen'): void`
    - `reset(): void`
  - `selectPublished(s: DemoState): Listing[]` (PUBLISHED이고 Halo isOnSale), `isOverLimit(s, code): boolean`
  - `useUi` (저장 안 함): `view`, `admin: { page: 'halo' | 'edit' | 'published' | 'stats'; filter; editing: string | null }`, `app: { screen; mode: 'map' | 'list'; cat; q; selected; detail; couponId; walletTab; lastIssued }`, `pop: 'guide' | 'checks' | 'log' | null`, `popFocus: number | null`, `toast: string | null`, `origin: LatLng` (기본 SEONGSU), `bounds: Bounds | null`, `justPublished: string | null` + setter들과 `showToast(msg)`, `openCheck(id)`
  - `useFlow`: `{ run: { paths: FlowNode[][]; dashedLast: boolean; id: number } | null; play(paths, dashedLast?) }`, `FlowNode = 'plus' | 'halo' | 'on' | 'customer' | 'store'`. 액션 호출부(화면)가 기존 데모와 같은 경로로 `play`를 부른다
  - `guideSteps(s: DemoState): { text: string; done: boolean }[]` (기존 6단계 문구·조건 그대로)

- [ ] **Step 1:** 실패하는 테스트 (`beforeEach`에서 localStorage 비우고 `reset()`)
  - `publish`에 빈 draft → `{ ok: false, missing: ['매장명','카테고리','지도 위치','ON 판매가'] }`, 상태 불변
  - `publish` 정상 → SP_NAIL PUBLISHED, `selectPublished` 7개, log[0].text에 '게시'
  - `issue('SP_NAIL')` (게시 후) → coupons 3개, `limit.used === 200000`, tid `ON-YYYYMMDD-0003`, log[0].api `'201 pin, seq, expiredAt'`, log[1].api `'POST /v2/orders'`
  - `issue('SP_KIMCHI')` → throw (Halo 판매 중지)
  - `limit.used = 499000`일 때 `isOverLimit(s,'SP_BRUNCH')` true, `issue` throw
  - `markUsed` → USED, usedAt 있음, log[0].kind 'unknown'
  - `toggleHidden('SP_PT')` → HIDDEN, 다시 → PUBLISHED
  - 깨진 JSON(`localStorage.setItem(key, '{bad')`) 후 store 재초기화 → seed와 같은 상품 8개, 예외 없음
  - `guideSteps(seed)` 전부 false, publish+viewedNail 후 앞 2개 true
- [ ] **Step 2:** `pnpm test src/store src/domain/guide` → FAIL
- [ ] **Step 3:** 구현. zustand `persist` + `createJSONStorage(() => safeLocalStorage)`; `safeLocalStorage`는 getItem/setItem/removeItem을 try/catch로 감싸고 실패 시 null/무시. 재초기화 테스트를 위해 `createDemoStore()` 팩토리를 export 하고 `useDemo = createDemoStore()`
- [ ] **Step 4:** `pnpm test` → PASS
- [ ] **Step 5:** Commit `feat: seed 데이터와 zustand store`

### Task 4: 지도 계층 (`src/map/`)

**Files:**
- Create: `src/map/KakaoGate.tsx`, `src/map/KakaoGate.module.css`, `src/map/geocode.ts`, `src/map/useMyLocation.ts`, `src/map/CustomerMap.tsx`, `src/map/CustomerMap.module.css`, `src/map/PickerMap.tsx`, `src/map/Pin.tsx`
- Test: `src/map/KakaoGate.test.tsx`, `src/map/geocode.test.ts`, `src/map/useMyLocation.test.ts`

**Interfaces:**
- Consumes: `LatLng`, `Bounds`, `Listing`, `HaloShowpiece`, `CATEGORIES`, `distanceM`, `withinKm`, `SEONGSU`
- Produces:
  - `<KakaoGate>{children}</KakaoGate>`: 키 없음 / 로딩 중 / 오류 / 로드됨. 앱 전체를 감싸지 않고 지도 자리만 감싼다. `useKakaoReady(): 'missing' | 'loading' | 'error' | 'ready'` 도 export (주소 검색 버튼 비활성에 사용)
  - `searchAddress(q: string): Promise<GeoResult[]>`, `GeoResult = { label: string; address: string; lat: number; lng: number }`. `addressSearch` 결과가 0건이면 `Places.keywordSearch`. 최대 5개. 실패 상태도 `[]`
  - `reverseGeocode(p: LatLng): Promise<string | null>` (도로명 우선, 없으면 지번)
  - `useMyLocation(): { locate(): Promise<{ kind: 'ok'; origin: LatLng } | { kind: 'far' | 'denied' }>; busy: boolean }` (timeout 8000, 5km 밖이면 'far')
  - `<CustomerMap listings selectedCode justPublished origin onSelect(code) onBoundsChange(b: Bounds)>`: 레벨 4, origin 중심. 핀 = `<Pin>`(CustomOverlayMap, yAnchor 1). 사용자가 지도를 움직였을 때만 `onBoundsChange` 호출 (첫 idle은 무시)
  - `<PickerMap value: LatLng | null; others: Listing[]; onPick(p: LatLng)>`: 클릭 좌표 전달, 현재 값 핀, 다른 게시 매장은 흐리게
- [ ] **Step 1:** 실패하는 테스트
  - `KakaoGate`: env 키 비움 → "카카오 JavaScript 키를 .env의 VITE_KAKAO_JS_KEY에 넣어 주세요" 표시, children 미렌더 / `useKakaoLoader`를 mock해 error 반환 → "지도를 불러오지 못했어요. 키와 등록 도메인(http://localhost:5173)을 확인해 주세요"
  - `searchAddress`: `window.kakao`에 가짜 Geocoder·Places 주입. 주소 2건 → 2건 반환, x/y를 lng/lat로 변환 / 주소 0건 + 키워드 7건 → 5건 / 둘 다 0건 → []
  - `useMyLocation`: 가짜 `navigator.geolocation` 성공(성수 근처) → ok, 성공(부산) → far, error 콜백 → denied
- [ ] **Step 2:** `pnpm test src/map` → FAIL
- [ ] **Step 3:** 구현. `useKakaoLoader({ appkey, libraries: ['services'] })`. 키가 없으면 loader를 부르지 않도록 `KakaoGate`를 키 유무로 두 컴포넌트로 나눈다(조건부 hook 금지)
- [ ] **Step 4:** `pnpm test src/map && pnpm typecheck` → PASS
- [ ] **Step 5:** Commit `feat: 카카오맵 계층 (지도, 주소 검색, 내 위치)`

### Task 5: 상단 바와 관리자 화면

**Files:**
- Create: `src/components/FlowStrip.tsx`, `Ticker.tsx`, `CheckBadge.tsx`, `Popovers.tsx`, `Toast.tsx`, 각 `.module.css`; `src/admin/AdminShell.tsx`, `HaloList.tsx`, `ListingEditor.tsx`, `PublishedList.tsx`, `Stats.tsx`, `admin.module.css`
- Modify: `src/App.tsx` (상단 바 연결, 무대에 AdminShell)
- Test: `src/admin/ListingEditor.test.tsx`, `src/components/Popovers.test.tsx`

**Interfaces:**
- Consumes: Task 3 store 전부, Task 4 `PickerMap`, `searchAddress`, `reverseGeocode`, `useKakaoReady`
- Produces: `<CheckBadge id={1..8} />` (클릭 → `openCheck(id)`), `<AdminShell />`
- 동작은 기존 `index.html`의 `adminHalo / adminEdit / adminPublished / adminStats`와 같다. 에디터는 draft를 로컬 state로 들고, [예시 값 채우기]는 SP_NAIL에 `손끝네일 성수점 / BEAUTY / 서울 성동구 성수이로 20 / 성수동 실제 좌표 / 손 관리 전문 숍, 기본 케어 40분 / PAID / 24000`
- 주소 검색: 주소 칸 옆 [검색] (지도 ready일 때만 활성) → 후보 목록(버튼) → 선택 시 address·lat·lng 채움. 0건 문구는 Global/Review Focus 3번 문구. 지도 클릭 → lat·lng + `reverseGeocode` 결과로 address 채움
- 게시 성공 시: `useFlow.play([['halo','on','customer']])`, `useUi`에서 app을 home/map/전체로, `justPublished`, `selected` 설정, 토스트 "게시했어요. 고객 앱 지도에 핀이 생겼어요"
- [ ] **Step 1:** 실패하는 테스트
  - 에디터(SP_NAIL): 처음엔 [게시하기] 비활성, 안내 "게시하려면 매장명, 카테고리, 지도 위치 항목을 채워 주세요". [예시 값 채우기] 후 활성, 클릭 → store SP_NAIL PUBLISHED
  - 한글 매장명 `user.type`으로 입력 후 input 값이 그대로 (controlled input 유지)
  - `searchAddress` mock 0건 → "검색 결과가 없어요. 도로명이나 건물 이름으로 다시 찾아보세요"
  - `searchAddress` mock 2건 → 후보 클릭 시 주소 칸 값이 후보 address
  - `CheckBadge id=5` 클릭 → 확인 필요 팝오버 열림, 5번 항목 강조
- [ ] **Step 2:** `pnpm test src/admin src/components` → FAIL
- [ ] **Step 3:** 구현. 흐름 띠는 `useFlow.run`이 바뀔 때 기존 `animateFlow` 타이밍(노드당 260ms, 경로 사이 500ms, 끝나고 1400ms 뒤 소등, reduced-motion이면 즉시)으로 클래스를 켠다
- [ ] **Step 4:** `pnpm test && pnpm typecheck` → PASS
- [ ] **Step 5:** Commit `feat: 상단 흐름 띠와 ON 관리자 화면`

### Task 6: 고객 웹앱

**Files:**
- Create: `src/components/PhoneFrame.tsx`; `src/app/CustomerApp.tsx`, `Home.tsx`, `Detail.tsx`, `Checkout.tsx`, `Done.tsx`, `Wallet.tsx`, `CouponView.tsx`, `Barcode.tsx`, `app.module.css`
- Modify: `src/App.tsx` (무대 오른쪽에 PhoneFrame + CustomerApp, 보기 전환)
- Test: `src/app/CustomerApp.test.tsx`

**Interfaces:**
- Consumes: Task 3 store, Task 4 `KakaoGate`, `CustomerMap`, `useMyLocation`, Task 5 `CheckBadge`
- 동작은 기존 `appHome / appDetail / appCheckout / appDone / appWallet / appCoupon`과 같고 다음이 더해진다:
  - Home: [내 위치] 버튼 → `locate()`; ok면 `origin` 갱신 + 토스트 "내 위치 기준으로 보여 드려요", far/denied면 토스트 "위치를 가져오지 못해 성수동 기준으로 보여 드려요". 거리 표시는 `distanceLabel(distanceM(origin, listing))`, 정렬도 같은 거리
  - `onBoundsChange` → [이 지역에서 다시 찾기] 노출 → 누르면 `bounds` 저장, 지도·목록 모두 `inBounds` 필터. 필터 중 [전체 보기]. 0건이면 "이 지역에는 혜택이 없어요" + [전체 보기]
  - 결제: [결제하기] → 900ms 처리 화면 → `recordPayment` → `issue` → Done. 흐름 띠 `[['customer','on','halo','plus'],['plus','halo','on','customer']]`
  - 매장 사용 처리: `markUsed` + 흐름 띠 `[['customer','store'],['plus','halo','on']]`, dashedLast
- [ ] **Step 1:** 실패하는 테스트 (지도는 `KakaoGate`를 mock해 null 렌더, 목록 모드로 진행)
  - 목록에서 "아메리카노 1잔" → 상세 → [무료로 받기] → "쿠폰을 받았어요" → [내 쿠폰 보기] → PIN 4자리 묶음 표시 → [매장 사용 처리] → "사용 완료"
  - 상세에서 한도 초과 상태면 버튼 텍스트 "이번 달 판매 수량이 모두 나갔어요"이고 비활성
  - `bounds`를 매장이 없는 범위로 설정 → "이 지역에는 혜택이 없어요", [전체 보기] 클릭 → 목록 복귀
  - `useMyLocation` mock denied → 토스트 문구 확인
- [ ] **Step 2:** `pnpm test src/app` → FAIL
- [ ] **Step 3:** 구현
- [ ] **Step 4:** `pnpm test && pnpm typecheck && pnpm build` → PASS
- [ ] **Step 5:** Commit `feat: 고객 웹앱 (지도 탐색, 결제, 내 쿠폰)`

### Task 7: 실제 브라우저 확인과 마무리

**Files:**
- Create: `README.md` (실행 방법, 키 발급·도메인 등록, 시연 순서 6단계, 확인 필요 요약)
- Modify: 확인 중 발견한 버그 수정 파일

- [ ] **Step 1:** `.env`에 키가 있는지 값 출력 없이 확인 (`grep -c '^VITE_KAKAO_JS_KEY=.\+' .env`). 없으면 키 없음 안내 화면까지만 확인하고 사용자에게 알린다
- [ ] **Step 2:** `pnpm dev` 후 Playwright(1440×960)로 시연 6단계 진행, 콘솔 오류 0 (favicon 제외)
- [ ] **Step 3:** 관리자 주소 검색 "성수이로 20" → 후보 선택 → 핀 표시, 지도 클릭 → 주소 채움
- [ ] **Step 4:** 고객 지도 드래그 → [이 지역에서 다시 찾기] → 범위 필터 동작, [내 위치] 권한 거부 경로 토스트
- [ ] **Step 5:** 390×844에서 `scrollWidth === clientWidth`
- [ ] **Step 6:** Playwright 산출물 정리, 서버 종료
- [ ] **Step 7:** Commit `docs: README와 브라우저 확인 반영`
