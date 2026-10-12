export type CheckId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const CHECKS: Record<CheckId, { title: string; body: string; who: string }> = {
  1: { title: '매장 사용 결과를 ON이 받을 수 있나', body: 'Halo 쿠폰 상세의 상태는 ISSUED, CANCELLED 두 가지뿐이에요. 매장에서 사용한 결과를 ON에 알려 주는 방법(Webhook 등)이 Swagger에 없어요. 데모의 [매장 사용 처리]는 이 연결이 있다고 가정한 시뮬레이션이에요.', who: 'Halo' },
  2: { title: '구매 취소와 환불', body: '쿠폰몰이 쓸 수 있는 발급 취소 API가 Halo에 없어요. 유료 구매를 취소할 때 쿠폰을 어떻게 무효로 할지 정해야 해요.', who: 'Halo' },
  3: { title: '무료와 판매 구분 값', body: 'PLUS 상품에는 saleType(FREE, PAID)이 있지만 Halo 응답에는 없어요. 데모에서는 ON 운영자가 직접 고르게 했어요.', who: 'Halo, PLUS' },
  4: { title: 'ON 판매가 정책', body: 'Halo는 소비자가와 제공가를 따로 줘요. 소비자가 그대로 팔지, 할인할 수 있는지, 제공가와의 차액이 ON 수익인지 정해야 해요.', who: '사업' },
  5: { title: '매장 위치와 카테고리 출처', body: 'PLUS 지점 데이터에는 이름, 코드, 비밀번호만 있어요. 지도에 쓸 주소와 위치를 ON이 직접 넣을지, PLUS 지점에 추가할지 정해야 해요.', who: 'PLUS, 사업' },
  6: { title: '다른 발급사 상품도 파는지', body: 'Halo에는 PLUS 말고도 여러 발급사가 연결돼 있어요. ON이 PLUS 상품만 팔지 정해야 해요.', who: '사업' },
  7: { title: 'Halo 인증 토큰 발급 방법', body: 'Halo Channel API는 Bearer JWT를 쓰는데, Swagger에 토큰을 받는 API가 없어요.', who: 'Halo' },
  8: { title: '고객 식별 방식', body: '데모는 로그인한 고객 한 명으로 가정했어요. 회원가입을 받을지, 휴대폰 번호만 받을지 정해야 해요.', who: '기획' },
};
