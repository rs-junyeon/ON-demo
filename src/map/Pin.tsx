import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { won } from '../domain/format';
import { CATEGORY, type Listing } from '../domain/types';
import styles from './Pin.module.css';

const PATH = 'M12 32 C9 25 0 20 0 11 A12 12 0 1 1 24 11 C24 20 15 25 12 32Z';

type Props = { listing: Listing; label?: string; selected?: boolean; dropping?: boolean; faded?: boolean; draft?: boolean; onSelect?(code: string): void };

export function Pin({ listing: l, label, selected, dropping, faded, draft, onSelect }: Props) {
  if (l.lat == null || l.lng == null) return null;
  const price = l.saleMode === 'FREE' ? '무료' : won(l.price);
  const cls = [styles.pin, selected && styles.selected, dropping && styles.drop, faded && styles.faded, draft && styles.draft].filter(Boolean).join(' ');
  const body = (
    <>
      <svg className={styles.svg} viewBox="0 0 24 33" aria-hidden="true">
        <path className={`${styles.body} ${l.cat ? styles[`c${l.cat}`] : ''}`} d={PATH} />
      </svg>
      <span className={styles.icon} aria-hidden="true">{l.cat ? CATEGORY[l.cat].icon : '📍'}</span>
      {(selected || dropping) && !draft && <span className={styles.price}>{price}</span>}
    </>
  );
  return (
    <CustomOverlayMap position={{ lat: l.lat, lng: l.lng }} yAnchor={1} clickable zIndex={selected || draft ? 3 : 1}>
      {onSelect && !faded
        ? <button type="button" className={cls} aria-label={label} aria-pressed={selected} onClick={() => onSelect(l.code)}>{body}</button>
        : <span className={cls}>{body}</span>}
    </CustomOverlayMap>
  );
}
