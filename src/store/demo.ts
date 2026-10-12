import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { seed } from '../data/seed';
import { expiryFor } from '../domain/coupon';
import { maskPin, won, ymdCompact } from '../domain/format';
import { missingForPublish } from '../domain/listing';
import type { Coupon, DemoState, Listing, LogEntry } from '../domain/types';

export const STORAGE_KEY = 'coupin-on-demo-react-v1';

/** localStorage를 쓸 수 없는 환경에서도 예외 없이 메모리로만 동작 */
const safeLocalStorage: StateStorage = {
  getItem: name => { try { return localStorage.getItem(name); } catch { return null; } },
  setItem: (name, value) => { try { localStorage.setItem(name, value); } catch { /* 저장 불가 */ } },
  removeItem: name => { try { localStorage.removeItem(name); } catch { /* 저장 불가 */ } },
};

type Actions = {
  saveListing(l: Listing): void;
  publish(l: Listing): { ok: true } | { ok: false; missing: string[] };
  toggleHidden(code: string): void;
  issue(code: string, now?: Date): Coupon;
  recordPayment(code: string): void;
  markUsed(id: string): void;
  setFlag(f: keyof DemoState['flags']): void;
  reset(): void;
};
export type DemoStore = DemoState & Actions;

const digits = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

export const selectPublished = (s: Pick<DemoState, 'halo' | 'listings'>) =>
  Object.values(s.listings).filter(l => l.status === 'PUBLISHED' && s.halo.find(h => h.code === l.code)?.isOnSale);

export const isOverLimit = (s: DemoState, code: string) => {
  const h = s.halo.find(x => x.code === code);
  return !h || s.limit.used + h.adjustPrice > s.limit.total;
};

export function createDemoStore() {
  return create<DemoStore>()(
    persist(
      (set, get) => {
        const log = (...entries: Omit<LogEntry, 't'>[]) => {
          const t = new Date().toISOString();
          set(s => ({ log: [...entries.map(e => ({ t, ...e })).reverse(), ...s.log].slice(0, 60) }));
        };
        const haloName = (code: string) => get().halo.find(h => h.code === code)?.name ?? code;
        return {
          ...seed(new Date()),

          saveListing: l => set(s => ({ listings: { ...s.listings, [l.code]: { ...l } } })),

          publish: l => {
            const h = get().halo.find(x => x.code === l.code);
            if (!h) return { ok: false, missing: ['상품'] };
            const missing = missingForPublish(h, l);
            if (!h.isOnSale || missing.length) return { ok: false, missing };
            const next: Listing = { ...l, price: l.saleMode === 'PAID' ? Number(l.price) : 0, status: 'PUBLISHED', publishedAt: new Date().toISOString() };
            set(s => ({ listings: { ...s.listings, [l.code]: next } }));
            log({ text: `'${h.name}' 게시, 고객 앱 지도에 노출`, api: 'ON 내부', kind: 'internal' });
            return { ok: true };
          },

          toggleHidden: code => {
            const l = get().listings[code];
            if (!l || l.status === 'DRAFT') return;
            const status = l.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
            set(s => ({ listings: { ...s.listings, [code]: { ...l, status } } }));
            log({ text: `'${haloName(code)}' ${status === 'HIDDEN' ? '숨김' : '다시 게시'}`, api: 'ON 내부', kind: 'internal' });
          },

          issue: (code, now = new Date()) => {
            const s = get();
            const h = s.halo.find(x => x.code === code);
            const l = s.listings[code];
            if (!h || !l || l.status !== 'PUBLISHED' || !h.isOnSale) throw new Error(`발급할 수 없는 상품: ${code}`);
            if (isOverLimit(s, code)) throw new Error('Halo 월 발급 한도 초과');
            const counter = s.counter + 1;
            const tid = `ON-${ymdCompact(now)}-${String(counter).padStart(4, '0')}`;
            const c: Coupon = {
              id: `c-${now.getTime()}-${digits(4)}`, code, pin: digits(16), seq: `${ymdCompact(now)}${digits(10)}`, tid,
              status: 'AVAILABLE', issuedAt: now.toISOString(), expiredAt: expiryFor(h, now).toISOString(),
              paid: l.saleMode === 'PAID' ? l.price : 0, saleMode: l.saleMode,
              ...(h.type === 'BALANCE' ? { balance: h.consumerPrice } : {}),
            };
            set({ coupons: [c, ...s.coupons], counter, limit: { ...s.limit, used: s.limit.used + h.adjustPrice } });
            log(
              { text: `발급 요청 ${tid} (${h.name})`, api: 'POST /v2/orders', kind: 'halo' },
              { text: `PIN 받음 ${maskPin(c.pin)}, 내 쿠폰에 저장`, api: '201 pin, seq, expiredAt', kind: 'halo' },
            );
            return c;
          },

          recordPayment: code => {
            const l = get().listings[code];
            log({ text: `결제 승인 ${won(l?.price ?? 0)} (데모)`, api: 'ON 결제', kind: 'internal' });
          },

          markUsed: id => {
            const c = get().coupons.find(x => x.id === id);
            if (!c || c.status === 'USED') return;
            const h = get().halo.find(x => x.code === c.code);
            const used: Coupon = { ...c, status: 'USED', usedAt: new Date().toISOString(), ...(h?.type === 'BALANCE' ? { balance: 0 } : {}) };
            set(s => ({ coupons: s.coupons.map(x => (x.id === id ? used : x)) }));
            log(
              { text: `매장에서 사용 승인 (${haloName(c.code)})`, api: 'PLUS Audit 내부', kind: 'internal' },
              { text: '사용 결과를 ON에 전달하는 방법은 확인 필요 (데모는 바로 반영)', api: '확인 필요 1', kind: 'unknown' },
            );
          },

          setFlag: f => set(s => ({ flags: { ...s.flags, [f]: true } })),

          reset: () => set(seed(new Date())),
        };
      },
      {
        name: STORAGE_KEY,
        version: 1,
        storage: createJSONStorage(() => safeLocalStorage),
        partialize: ({ halo, listings, coupons, limit, log, flags, counter }) => ({ halo, listings, coupons, limit, log, flags, counter }),
      },
    ),
  );
}

export const useDemo = createDemoStore();
