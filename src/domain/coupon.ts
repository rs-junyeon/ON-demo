import type { Coupon, HaloShowpiece } from './types';

const endOfDay = (x: Date) => { const r = new Date(x); r.setHours(23, 59, 59, 0); return r; };

export function expiryFor(h: HaloShowpiece, from: Date): Date {
  if (h.durationType === 'FIXED') {
    const [y, m, day] = (h.expireDate ?? '').split('-').map(Number);
    return new Date(y, m - 1, day, 23, 59, 59);
  }
  const r = new Date(from);
  r.setDate(r.getDate() + (h.duration ?? 0) - (h.isIssuedDateIncluded ? 1 : 0));
  return endOfDay(r);
}

export function couponState(c: Coupon, now: Date): 'AVAILABLE' | 'USED' | 'EXPIRED' {
  if (c.status === 'USED') return 'USED';
  if (new Date(c.expiredAt) < now) return 'EXPIRED';
  return 'AVAILABLE';
}

export function dday(c: Coupon, now: Date): { text: string; muted: boolean } {
  const st = couponState(c, now);
  if (st === 'USED') return { text: '사용 완료', muted: true };
  if (st === 'EXPIRED') return { text: '기간 만료', muted: true };
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date(c.expiredAt)) - startOf(now)) / 86400000);
  return { text: days <= 0 ? '오늘까지' : `D-${days}`, muted: false };
}

export function validityText(h: HaloShowpiece): string {
  if (h.durationType === 'FIXED') return `${(h.expireDate ?? '').replaceAll('-', '.')}까지`;
  return `발급일${h.isIssuedDateIncluded ? '부터' : ' 다음 날부터'} ${h.duration}일`;
}

export const typeLabel = (t: HaloShowpiece['type']) => (t === 'BALANCE' ? '금액권' : '교환권');
