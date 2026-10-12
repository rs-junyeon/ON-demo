import { ymdCompact } from '../domain/format';
import type { CategoryId, Coupon, DemoState, HaloShowpiece, Listing } from '../domain/types';

export const DOCCODE = 'ON-SEONGSU';

const HALO: HaloShowpiece[] = [
  { code: 'SP_NAIL', name: '네일 기본 케어 체험권', brandName: '손끝네일', brandCode: 'SONKKEUT', type: 'EXCHANGE', consumerPrice: 30000, adjustPrice: 18000, durationType: 'PERIOD', duration: 30, isIssuedDateIncluded: true, useablePlace: '손끝네일 매장', restriction: '1인 1회, 예약 후 방문', precaution: '사용 후 환불 및 재발급 불가', isOnSale: true },
  { code: 'SP_COFFEE', name: '아메리카노 1잔', brandName: '골목로스터리', brandCode: 'GOLMOK', type: 'EXCHANGE', consumerPrice: 4500, adjustPrice: 2000, durationType: 'PERIOD', duration: 14, isIssuedDateIncluded: true, useablePlace: '골목로스터리 전 매장', restriction: '사이즈 변경 불가', precaution: '타 쿠폰과 중복 사용 불가', isOnSale: true },
  { code: 'SP_BRUNCH', name: '브런치 세트 2인', brandName: '볕드는 식탁', brandCode: 'BYEOT', type: 'EXCHANGE', consumerPrice: 32000, adjustPrice: 20000, durationType: 'PERIOD', duration: 60, isIssuedDateIncluded: true, useablePlace: '볕드는 식탁 성수점', restriction: '주말은 오후 2시 이후 사용 가능', precaution: '음료 변경 시 추가 요금', isOnSale: true },
  { code: 'SP_PT', name: 'PT 1회 체험권', brandName: '오늘근력', brandCode: 'ONEUL', type: 'EXCHANGE', consumerPrice: 50000, adjustPrice: 25000, durationType: 'PERIOD', duration: 30, isIssuedDateIncluded: true, useablePlace: '오늘근력 성수', restriction: '첫 방문 고객만', precaution: '운동복 지참', isOnSale: true },
  { code: 'SP_CLAY', name: '원데이 도자기 클래스', brandName: '흙과손', brandCode: 'HEUK', type: 'EXCHANGE', consumerPrice: 45000, adjustPrice: 28000, durationType: 'FIXED', expireDate: '2026-12-31', isIssuedDateIncluded: true, useablePlace: '흙과손 공방', restriction: '사전 예약 필수', precaution: '완성품은 2주 뒤 수령', isOnSale: true },
  { code: 'SP_DESSERT', name: '디저트 1만원 금액권', brandName: '버터앤슈가', brandCode: 'BUTTER', type: 'BALANCE', consumerPrice: 10000, adjustPrice: 6000, durationType: 'PERIOD', duration: 90, isIssuedDateIncluded: true, useablePlace: '버터앤슈가 매장', restriction: '잔액 안에서 여러 번 사용', precaution: '잔액 현금 환불 불가', isOnSale: true },
  { code: 'SP_HAND', name: '핸드 보습 케어 무료 체험', brandName: '라온뷰티', brandCode: 'RAON', type: 'EXCHANGE', consumerPrice: 15000, adjustPrice: 0, durationType: 'PERIOD', duration: 14, isIssuedDateIncluded: true, useablePlace: '라온뷰티 성수', restriction: '1인 1회', precaution: '피부 질환이 있으면 상담 후 진행', isOnSale: true },
  { code: 'SP_KIMCHI', name: '김치찌개 정식', brandName: '성수밥집', brandCode: 'SSBAB', type: 'EXCHANGE', consumerPrice: 9000, adjustPrice: 5000, durationType: 'PERIOD', duration: 30, isIssuedDateIncluded: true, useablePlace: '성수밥집', restriction: '점심 시간만', precaution: '포장 불가', isOnSale: false },
];

/** 시연용 예시 값 (관리자 [예시 값 채우기]) */
export const EXAMPLE_FILL: Record<string, Partial<Listing>> = {
  SP_NAIL: { storeName: '손끝네일 성수점', cat: 'BEAUTY', address: '서울 성동구 성수이로 20', lat: 37.537, lng: 127.0542, intro: '손 관리 전문 숍, 기본 케어 40분', saleMode: 'PAID', price: 24000 },
  SP_KIMCHI: { storeName: '성수밥집', cat: 'FOOD', address: '서울 성동구 성수일로 30', lat: 37.5412, lng: 127.0548, intro: '매일 끓이는 집밥 정식', saleMode: 'PAID', price: 8000 },
};

const daysFrom = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export function seed(now: Date): DemoState {
  const at = now.toISOString();
  const L = (code: string, storeName: string, cat: CategoryId, address: string, lat: number, lng: number, intro: string, saleMode: Listing['saleMode'], price: number): Listing =>
    ({ code, storeName, cat, address, lat, lng, intro, saleMode, price, status: 'PUBLISHED', publishedAt: at });
  const coupons: Coupon[] = [
    { id: 'c-seed-1', code: 'SP_COFFEE', pin: '4821093756120384', seq: `${ymdCompact(daysFrom(now, -3))}4821093756`, tid: `ON-${ymdCompact(daysFrom(now, -3))}-0001`, status: 'USED', issuedAt: daysFrom(now, -3).toISOString(), expiredAt: daysFrom(now, 10).toISOString(), usedAt: daysFrom(now, -1).toISOString(), paid: 0, saleMode: 'FREE', seed: true },
    { id: 'c-seed-2', code: 'SP_DESSERT', pin: '7730158842093611', seq: `${ymdCompact(daysFrom(now, -95))}7730158842`, tid: `ON-${ymdCompact(daysFrom(now, -95))}-0002`, status: 'AVAILABLE', issuedAt: daysFrom(now, -95).toISOString(), expiredAt: daysFrom(now, -6).toISOString(), paid: 9000, saleMode: 'PAID', balance: 10000, seed: true },
  ];
  return {
    halo: HALO.map(h => ({ ...h })),
    listings: {
      SP_COFFEE: L('SP_COFFEE', '골목로스터리 성수점', 'CAFE', '서울 성동구 성수이로 12', 37.547, 127.056, '직접 볶은 원두로 내리는 동네 카페', 'FREE', 0),
      SP_BRUNCH: L('SP_BRUNCH', '볕드는 식탁', 'FOOD', '서울 성동구 아차산로 40', 37.5452, 127.0605, '창가 자리가 넓은 브런치 식당', 'PAID', 25600),
      SP_PT: L('SP_PT', '오늘근력 성수', 'FIT', '서울 성동구 뚝섬로 21', 37.542, 127.052, '1:1 체형 분석 후 맞춤 PT', 'PAID', 39000),
      SP_CLAY: L('SP_CLAY', '흙과손 공방', 'CLASS', '서울 성동구 성수일로 8', 37.5405, 127.057, '초보자도 2시간이면 컵 하나 완성', 'PAID', 38000),
      SP_DESSERT: L('SP_DESSERT', '버터앤슈가', 'CAFE', '서울 성동구 서울숲길 5', 37.5468, 127.0518, '매일 아침 굽는 휘낭시에와 케이크', 'PAID', 9000),
      SP_HAND: L('SP_HAND', '라온뷰티 성수', 'BEAUTY', '서울 성동구 연무장길 30', 37.5432, 127.0585, '손 관리와 피부 관리 전문 숍', 'FREE', 0),
      SP_NAIL: { code: 'SP_NAIL', storeName: '', cat: '', address: '', lat: null, lng: null, intro: '', saleMode: 'PAID', price: 30000, status: 'DRAFT' },
    },
    coupons,
    limit: { total: 500000, used: 182000 },
    log: [{ t: at, text: `Halo에서 캠페인 상품 ${HALO.length}건 받음`, api: `GET /v1/campaigns/${DOCCODE}/showpieces`, kind: 'halo' }],
    flags: { viewedNail: false, statsSeen: false },
    counter: 2,
  };
}
