import { describe, expect, it } from 'vitest';
import { canPublish, missingForPublish } from './listing';
import type { HaloShowpiece, Listing } from './types';

const h = { isOnSale: true } as HaloShowpiece;
const blank: Listing = { code: 'SP_NAIL', storeName: '', cat: '', address: '', lat: null, lng: null, intro: '', saleMode: 'PAID', price: 0, status: 'DRAFT' };
const full: Listing = { ...blank, storeName: '손끝네일 성수점', cat: 'BEAUTY', lat: 37.54, lng: 127.05, price: 24000 };

describe('missingForPublish', () => {
  it('빈 draft는 네 항목 모두 빠짐', () => {
    expect(missingForPublish(h, blank)).toEqual(['매장명', '카테고리', '지도 위치', 'ON 판매가']);
  });
  it('무료 상품은 판매가를 묻지 않음', () => {
    expect(missingForPublish(h, { ...blank, saleMode: 'FREE' })).toEqual(['매장명', '카테고리', '지도 위치']);
  });
  it('공백뿐인 매장명은 빠진 것으로 본다', () => {
    expect(missingForPublish(h, { ...full, storeName: '   ' })).toEqual(['매장명']);
  });
  it('다 채우면 빈 배열', () => {
    expect(missingForPublish(h, full)).toEqual([]);
  });
});

describe('canPublish', () => {
  it('Halo 판매 중지면 다 채워도 게시 불가', () => {
    expect(canPublish(h, full)).toBe(true);
    expect(canPublish({ ...h, isOnSale: false }, full)).toBe(false);
  });
});
