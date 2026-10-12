export type CategoryId = 'BEAUTY' | 'CAFE' | 'FOOD' | 'FIT' | 'CLASS';
export const CATEGORIES: { id: CategoryId; label: string; icon: string }[] = [
  { id: 'BEAUTY', label: '네일·뷰티', icon: '💅' },
  { id: 'CAFE', label: '카페', icon: '☕' },
  { id: 'FOOD', label: '식당', icon: '🍳' },
  { id: 'FIT', label: '운동', icon: '🏋️' },
  { id: 'CLASS', label: '클래스', icon: '🏺' },
];
export const CATEGORY = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<CategoryId, (typeof CATEGORIES)[number]>;

export type LatLng = { lat: number; lng: number };
export type Bounds = { sw: LatLng; ne: LatLng };

/** Halo GET /v1/campaigns/{doccode}/showpieces 필드명 */
export type HaloShowpiece = {
  code: string; name: string; brandName: string; brandCode: string;
  type: 'EXCHANGE' | 'BALANCE'; consumerPrice: number; adjustPrice: number;
  durationType: 'PERIOD' | 'FIXED'; duration?: number; expireDate?: string;
  isIssuedDateIncluded: boolean; useablePlace: string; restriction: string; precaution: string;
  isOnSale: boolean;
};

/** ON이 채우는 정보 */
export type Listing = {
  code: string; storeName: string; cat: CategoryId | ''; address: string;
  lat: number | null; lng: number | null; intro: string;
  saleMode: 'FREE' | 'PAID'; price: number; status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  publishedAt?: string;
};

export type Coupon = {
  id: string; code: string; pin: string; seq: string; tid: string;
  status: 'AVAILABLE' | 'USED'; issuedAt: string; expiredAt: string; usedAt?: string;
  paid: number; saleMode: 'FREE' | 'PAID'; balance?: number; seed?: boolean;
};

export type LogEntry = { t: string; text: string; api: string; kind: 'halo' | 'internal' | 'unknown' };

export type DemoState = {
  halo: HaloShowpiece[];
  listings: Record<string, Listing>;
  coupons: Coupon[];
  limit: { total: number; used: number };
  log: LogEntry[];
  flags: { viewedNail: boolean; statsSeen: boolean };
  counter: number;
};
