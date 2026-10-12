import type { DemoState } from './types';

export function guideSteps(s: DemoState): { text: string; done: boolean }[] {
  const nail = s.coupons.filter(c => c.code === 'SP_NAIL');
  return [
    { text: '관리자에서 "네일 기본 케어 체험권"을 보강하고 게시하기', done: s.listings.SP_NAIL?.status === 'PUBLISHED' },
    { text: '고객 앱 지도에 생긴 네일 핀을 눌러 상세 보기', done: s.flags.viewedNail },
    { text: '네일 체험권 구매하기 (데모 결제)', done: nail.length > 0 },
    { text: '내 쿠폰에서 바코드를 보여 주고 매장 사용 처리하기', done: nail.some(c => c.status === 'USED') },
    { text: '무료 상품 하나 받기 (커피 또는 핸드 케어)', done: s.coupons.some(c => !c.seed && c.saleMode === 'FREE') },
    { text: '관리자 발급 현황에서 방금 발급한 내역과 Halo 한도 확인하기', done: s.flags.statsSeen && s.coupons.some(c => !c.seed) },
  ];
}
