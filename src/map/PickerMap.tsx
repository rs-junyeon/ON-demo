import { Map } from 'react-kakao-maps-sdk';
import { SEONGSU } from '../domain/geo';
import type { LatLng, Listing } from '../domain/types';
import { Pin } from './Pin';
import styles from './CustomerMap.module.css';

type Props = { value: Listing; others: Listing[]; onPick(p: LatLng): void };

/** 관리자: 지도를 눌러 매장 위치 지정 */
export function PickerMap({ value, others, onPick }: Props) {
  const center = value.lat != null && value.lng != null ? { lat: value.lat, lng: value.lng } : SEONGSU;
  return (
    <Map
      center={center}
      level={3}
      className={styles.picker}
      onClick={(_m, e) => onPick({ lat: e.latLng.getLat(), lng: e.latLng.getLng() })}
    >
      {others.map(l => <Pin key={l.code} listing={l} faded />)}
      <Pin listing={value} draft />
    </Map>
  );
}
