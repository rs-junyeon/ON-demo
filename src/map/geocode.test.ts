import { afterEach, describe, expect, it } from 'vitest';
import { reverseGeocode, searchAddress } from './geocode';

const OK = 'OK', ZERO = 'ZERO_RESULT';
type Cb = (result: unknown[], status: string) => void;

function installKakao(opts: { addresses?: unknown[]; places?: unknown[]; coord?: unknown[] }) {
  (globalThis as { kakao?: unknown }).kakao = {
    maps: {
      services: {
        Status: { OK, ZERO_RESULT: ZERO, ERROR: 'ERROR' },
        Geocoder: class {
          addressSearch(_q: string, cb: Cb) { const r = opts.addresses ?? []; cb(r, r.length ? OK : ZERO); }
          coord2Address(_x: number, _y: number, cb: Cb) { const r = opts.coord ?? []; cb(r, r.length ? OK : ZERO); }
        },
        Places: class {
          keywordSearch(_q: string, cb: Cb) { const r = opts.places ?? []; cb(r, r.length ? OK : ZERO); }
        },
      },
    },
  };
}
afterEach(() => { delete (globalThis as { kakao?: unknown }).kakao; });

const addr = (n: number) => ({ address_name: `서울 성동구 성수동2가 ${n}`, road_address: { address_name: `서울 성동구 성수이로 ${n}` }, x: '127.05', y: '37.54' });
const place = (n: number) => ({ place_name: `장소 ${n}`, road_address_name: `서울 성동구 연무장길 ${n}`, address_name: `성수동 ${n}`, x: '127.06', y: '37.55' });

describe('searchAddress', () => {
  it('주소 검색 결과를 위경도로 바꿔 돌려준다', async () => {
    installKakao({ addresses: [addr(20), addr(22)] });
    const r = await searchAddress('성수이로 20');
    expect(r).toHaveLength(2);
    expect(r[0]).toEqual({ label: '서울 성동구 성수이로 20', address: '서울 성동구 성수이로 20', lat: 37.54, lng: 127.05 });
  });
  it('주소가 0건이면 키워드 검색으로 최대 5개', async () => {
    installKakao({ places: Array.from({ length: 7 }, (_, i) => place(i)) });
    const r = await searchAddress('손끝네일');
    expect(r).toHaveLength(5);
    expect(r[0]).toEqual({ label: '장소 0', address: '서울 성동구 연무장길 0', lat: 37.55, lng: 127.06 });
  });
  it('둘 다 0건이면 빈 배열', async () => {
    installKakao({});
    expect(await searchAddress('없는 곳')).toEqual([]);
  });
});

describe('reverseGeocode', () => {
  it('도로명 주소를 우선한다', async () => {
    installKakao({ coord: [{ road_address: { address_name: '서울 성동구 성수이로 20' }, address: { address_name: '성수동2가 1' } }] });
    expect(await reverseGeocode({ lat: 37.54, lng: 127.05 })).toBe('서울 성동구 성수이로 20');
  });
  it('도로명이 없으면 지번, 결과가 없으면 null', async () => {
    installKakao({ coord: [{ road_address: null, address: { address_name: '성수동2가 1' } }] });
    expect(await reverseGeocode({ lat: 37.54, lng: 127.05 })).toBe('성수동2가 1');
    installKakao({});
    expect(await reverseGeocode({ lat: 37.54, lng: 127.05 })).toBeNull();
  });
});
