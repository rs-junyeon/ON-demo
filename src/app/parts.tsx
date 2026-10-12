import { won } from '../domain/format';
import { distanceLabel, distanceM } from '../domain/geo';
import { CATEGORY, type HaloShowpiece, type LatLng, type Listing } from '../domain/types';
import s from './app.module.css';

export const thumbClass = (cat: Listing['cat']) => (cat ? s[`t${cat}`] : '');
export const heroClass = (cat: Listing['cat']) => (cat ? s[`h${cat}`] : '');
export const icon = (cat: Listing['cat']) => (cat ? CATEGORY[cat].icon : '🎟️');
export const distOf = (origin: LatLng, l: Listing) => (l.lat == null || l.lng == null ? Infinity : distanceM(origin, { lat: l.lat, lng: l.lng }));
export const priceText = (l: Listing) => (l.saleMode === 'FREE' ? '무료' : won(l.price));

export function PriceLine({ l, h, big }: { l: Listing; h: HaloShowpiece; big?: boolean }) {
  if (l.saleMode === 'FREE') {
    return <div className={s.priceLine}><span className={`${s.price} ${s.free} ${big ? s.big : ''}`}>무료</span>{h.consumerPrice > 0 && <span className={s.strike}>{won(h.consumerPrice)}</span>}</div>;
  }
  const off = h.consumerPrice > l.price ? Math.round((1 - l.price / h.consumerPrice) * 100) : 0;
  return (
    <div className={s.priceLine}>
      {off > 0 && <span className={s.off}>{off}%</span>}
      <span className={`${s.price} ${big ? s.big : ''}`}>{won(l.price)}</span>
      {off > 0 && <span className={s.strike}>{won(h.consumerPrice)}</span>}
    </div>
  );
}

export function Sheet({ l, h, origin, onOpen }: { l: Listing; h: HaloShowpiece; origin: LatLng; onOpen(code: string): void }) {
  return (
    <button type="button" className={s.sheet} onClick={() => onOpen(l.code)}>
      <div className={`${s.thumb} ${thumbClass(l.cat)}`} aria-hidden="true">{icon(l.cat)}</div>
      <div>
        <div className={s.store}>{l.storeName} <span className={s.dist}>{distanceLabel(distOf(origin, l))}</span></div>
        <div className={s.name}>{h.name}</div>
        <PriceLine l={l} h={h} />
      </div>
    </button>
  );
}

export function TopNav({ title, onBack }: { title: string; onBack(): void }) {
  return <div className={s.topNav}><button type="button" aria-label="뒤로" onClick={onBack}>‹</button><h2>{title}</h2></div>;
}
