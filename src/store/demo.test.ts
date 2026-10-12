import { beforeEach, describe, expect, it } from 'vitest';
import { ymdCompact } from '../domain/format';
import type { Listing } from '../domain/types';
import { STORAGE_KEY, createDemoStore, isOverLimit, selectPublished } from './demo';

const nailDraft = (over: Partial<Listing> = {}): Listing => ({
  code: 'SP_NAIL', storeName: '손끝네일 성수점', cat: 'BEAUTY', address: '서울 성동구 성수이로 20',
  lat: 37.5458, lng: 127.053, intro: '', saleMode: 'PAID', price: 24000, status: 'DRAFT', ...over,
});

let store = createDemoStore();
beforeEach(() => {
  localStorage.clear();
  store = createDemoStore();
  store.getState().reset();
});

describe('publish', () => {
  it('필수값이 없으면 거부하고 상태를 바꾸지 않는다', () => {
    const empty = nailDraft({ storeName: '', cat: '', lat: null, lng: null, price: 0 });
    expect(store.getState().publish(empty)).toEqual({ ok: false, missing: ['매장명', '카테고리', '지도 위치', 'ON 판매가'] });
    expect(store.getState().listings.SP_NAIL.status).toBe('DRAFT');
  });
  it('채우면 게시되고 고객 노출 목록이 7개가 된다', () => {
    expect(store.getState().publish(nailDraft())).toEqual({ ok: true });
    const s = store.getState();
    expect(s.listings.SP_NAIL.status).toBe('PUBLISHED');
    expect(selectPublished(s)).toHaveLength(7);
    expect(s.log[0].text).toContain('게시');
  });
});

describe('issue', () => {
  it('발급하면 쿠폰, 한도, tid, 로그가 함께 바뀐다', () => {
    store.getState().publish(nailDraft());
    const c = store.getState().issue('SP_NAIL');
    const s = store.getState();
    expect(s.coupons).toHaveLength(3);
    expect(s.limit.used).toBe(200000);
    expect(c.tid).toBe(`ON-${ymdCompact(new Date())}-0003`);
    expect(s.log[0].api).toBe('201 pin, seq, expiredAt');
    expect(s.log[1].api).toBe('POST /v2/orders');
  });
  it('Halo 판매 중지 상품은 발급하지 않는다', () => {
    expect(() => store.getState().issue('SP_KIMCHI')).toThrow();
  });
  it('월 한도를 넘으면 막는다', () => {
    store.setState({ limit: { total: 500000, used: 499000 } });
    expect(isOverLimit(store.getState(), 'SP_BRUNCH')).toBe(true);
    expect(() => store.getState().issue('SP_BRUNCH')).toThrow();
  });
});

describe('markUsed', () => {
  it('사용 완료로 바꾸고 미확인 전달 경로를 로그에 남긴다', () => {
    const c = store.getState().issue('SP_COFFEE');
    store.getState().markUsed(c.id);
    const s = store.getState();
    const used = s.coupons.find(x => x.id === c.id)!;
    expect(used.status).toBe('USED');
    expect(used.usedAt).toBeTruthy();
    expect(s.log[0].kind).toBe('unknown');
  });
});

describe('toggleHidden', () => {
  it('숨김과 다시 게시를 오간다', () => {
    store.getState().toggleHidden('SP_PT');
    expect(store.getState().listings.SP_PT.status).toBe('HIDDEN');
    store.getState().toggleHidden('SP_PT');
    expect(store.getState().listings.SP_PT.status).toBe('PUBLISHED');
  });
});

describe('저장소', () => {
  it('깨진 JSON이 있어도 seed로 시작한다', () => {
    localStorage.setItem(STORAGE_KEY, '{bad');
    const fresh = createDemoStore();
    expect(fresh.getState().halo).toHaveLength(8);
    expect(fresh.getState().listings.SP_NAIL.status).toBe('DRAFT');
  });
  it('게시 상태가 저장되고 새 store가 이어받는다', () => {
    store.getState().publish(nailDraft());
    expect(createDemoStore().getState().listings.SP_NAIL.status).toBe('PUBLISHED');
  });
});
