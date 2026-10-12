import type { HaloShowpiece, Listing } from './types';

export function missingForPublish(_h: HaloShowpiece, l: Listing): string[] {
  const missing: string[] = [];
  if (!l.storeName.trim()) missing.push('매장명');
  if (!l.cat) missing.push('카테고리');
  if (l.lat == null || l.lng == null) missing.push('지도 위치');
  if (l.saleMode === 'PAID' && !(Number(l.price) > 0)) missing.push('ON 판매가');
  return missing;
}

export const canPublish = (h: HaloShowpiece, l: Listing) => h.isOnSale && missingForPublish(h, l).length === 0;
