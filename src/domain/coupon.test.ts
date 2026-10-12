import { describe, expect, it } from 'vitest';
import { couponState, dday, expiryFor, validityText } from './coupon';
import type { Coupon, HaloShowpiece } from './types';

const halo = (over: Partial<HaloShowpiece> = {}): HaloShowpiece => ({
  code: 'SP_NAIL', name: '네일 기본 케어 체험권', brandName: '손끝네일', brandCode: 'SONKKEUT',
  type: 'EXCHANGE', consumerPrice: 30000, adjustPrice: 18000, durationType: 'PERIOD', duration: 30,
  isIssuedDateIncluded: true, useablePlace: '손끝네일 매장', restriction: '1인 1회', precaution: '환불 불가',
  isOnSale: true, ...over,
});
const coupon = (over: Partial<Coupon> = {}): Coupon => ({
  id: 'c1', code: 'SP_NAIL', pin: '1851652592408387', seq: '1', tid: 'ON-20261012-0003', status: 'AVAILABLE',
  issuedAt: new Date(2026, 9, 12, 10).toISOString(), expiredAt: new Date(2026, 10, 10, 23, 59, 59).toISOString(),
  paid: 24000, saleMode: 'PAID', ...over,
});
const issued = new Date(2026, 9, 12, 10, 0, 0);

describe('expiryFor', () => {
  it('기간형, 발급일 포함이면 발급일 + 29일 23:59:59', () => {
    expect(expiryFor(halo(), issued)).toEqual(new Date(2026, 10, 10, 23, 59, 59));
  });
  it('기간형, 발급일 미포함이면 발급일 + 30일 23:59:59', () => {
    expect(expiryFor(halo({ isIssuedDateIncluded: false }), issued)).toEqual(new Date(2026, 10, 11, 23, 59, 59));
  });
  it('만료일형은 expireDate 23:59:59', () => {
    expect(expiryFor(halo({ durationType: 'FIXED', duration: undefined, expireDate: '2026-12-31' }), issued))
      .toEqual(new Date(2026, 11, 31, 23, 59, 59));
  });
});

describe('couponState', () => {
  const now = new Date(2026, 9, 12, 12);
  it('사용 처리된 쿠폰은 만료가 지나도 USED', () => {
    expect(couponState(coupon({ status: 'USED', expiredAt: new Date(2026, 0, 1).toISOString() }), now)).toBe('USED');
  });
  it('만료가 지나면 EXPIRED', () => {
    expect(couponState(coupon({ expiredAt: new Date(2026, 9, 11).toISOString() }), now)).toBe('EXPIRED');
  });
  it('그 외에는 AVAILABLE', () => {
    expect(couponState(coupon(), now)).toBe('AVAILABLE');
  });
});

describe('dday', () => {
  it('남은 날짜를 D-N으로', () => {
    expect(dday(coupon(), new Date(2026, 9, 12, 12))).toEqual({ text: 'D-29', muted: false });
  });
  it('만료 당일은 오늘까지', () => {
    expect(dday(coupon(), new Date(2026, 10, 10, 9))).toEqual({ text: '오늘까지', muted: false });
  });
  it('사용 완료와 기간 만료는 흐리게', () => {
    expect(dday(coupon({ status: 'USED' }), new Date(2026, 9, 12))).toEqual({ text: '사용 완료', muted: true });
    expect(dday(coupon(), new Date(2026, 10, 12))).toEqual({ text: '기간 만료', muted: true });
  });
});

describe('validityText', () => {
  it('기간형과 만료일형 문구', () => {
    expect(validityText(halo())).toBe('발급일부터 30일');
    expect(validityText(halo({ isIssuedDateIncluded: false }))).toBe('발급일 다음 날부터 30일');
    expect(validityText(halo({ durationType: 'FIXED', expireDate: '2026-12-31' }))).toBe('2026.12.31까지');
  });
});
