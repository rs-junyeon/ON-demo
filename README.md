# 쿠핀 ON 데모 (Vite + React)

쿠핀 ON 기획을 설명하는 클릭형 데모. 왼쪽은 ON 관리자, 오른쪽은 고객 웹앱(폰 화면)이고 샘플 데이터로만 동작한다.

- 기획서: 노션 「회사 > ON 기획」 https://app.notion.com/p/ON-3f78e59a2a2780508948ee6dd9ea35c4?source=copy_link
- 설계: [docs/spec.md](docs/spec.md) · 구현 계획: [docs/plan.md](docs/plan.md)
- 이전 버전(단일 HTML): `../index.html`
- 디자인: 쿠핀 컬러 시스템 `~/Documents/company/all.html` (토큰은 `src/styles/tokens.css`). ON 시그니처 Lime→Mint, 흐름 띠 노드는 각 서비스 시그니처(PLUS Mint→Sky, HALO Coral→Apricot, 인증 Sky→Navy)

## 실행

```sh
cp .env.example .env   # VITE_KAKAO_JS_KEY 채우기
pnpm install
pnpm dev               # http://localhost:5173
```

카카오 키: [카카오 디벨로퍼스](https://developers.kakao.com) → 내 애플리케이션 → 앱 키의 **JavaScript 키**.
플랫폼 → Web 사이트 도메인에 `http://localhost:5173` 등록. 키가 없거나 도메인이 맞지 않으면 지도 자리에 안내가 나오고, 나머지 기능은 그대로 동작한다.

`pnpm test` 단위 테스트 · `pnpm typecheck` · `pnpm build`

## 시연 순서 (약 5분, 상단 [시연 가이드]에 자동 체크)

1. 관리자 Halo 상품에서 "네일 기본 케어 체험권" [보강하기] → 주소 검색 또는 지도 클릭으로 위치 지정 (또는 [예시 값 채우기]) → [게시하기]
2. 고객 앱 지도에 새 핀이 떨어진 것을 확인하고 눌러 상세 보기
3. [구매하기] → 결제 동의 → 데모 결제
4. 내 쿠폰에서 바코드·PIN 확인 → [매장 사용 처리] (확인 필요 1번을 설명하는 자리)
5. 무료 상품(커피, 핸드 케어) [무료로 받기]
6. 관리자 발급 현황에서 방금 발급한 내역과 Halo 월 한도 확인

그 밖에: 고객 지도를 움직이면 [이 지역에서 다시 찾기], [내 위치]로 실제 위치 기준 정렬(성수동 5km 밖이면 성수동 기준).

## 화면의 장치

- 상단 흐름 띠: 동작마다 PLUS · Halo · ON · 고객 · 매장 중 실제로 거칠 경로가 켜진다. 노란 점선은 아직 연동 방법이 확인되지 않은 경로
- 연동 로그: 실제 연동이라면 호출됐을 API (`POST /v2/orders` 등)
- 노란 "확인 필요 N" 배지: 노션 기획서 8번 섹션의 질문 번호와 같다
- [처음 상태로]: 게시·발급 상태를 seed로 되돌린다 (브라우저 저장 키 `coupin-on-demo-react-v1`)
