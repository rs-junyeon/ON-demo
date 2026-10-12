import { useEffect, useRef, useState } from 'react';
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk';
import type { Bounds, LatLng, Listing } from '../domain/types';
import styles from './CustomerMap.module.css';
import { Pin } from './Pin';

type Props = {
  listings: Listing[]; labels: Record<string, string>;
  selectedCode: string | null; justPublished: string | null; origin: LatLng;
  onSelect(code: string): void; onBoundsChange(b: Bounds): void;
};

const toBounds = (map: kakao.maps.Map): Bounds => {
  const b = map.getBounds(), sw = b.getSouthWest(), ne = b.getNorthEast();
  return { sw: { lat: sw.getLat(), lng: sw.getLng() }, ne: { lat: ne.getLat(), lng: ne.getLng() } };
};

export function CustomerMap({ listings, labels, selectedCode, justPublished, origin, onSelect, onBoundsChange }: Props) {
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const moved = useRef(false);
  const box = useRef<HTMLDivElement>(null);

  // 보기 전환으로 숨겨진(0×0) 상태에서 만들어진 지도는 다시 보일 때 스스로 다시 배치되지 않는다
  useEffect(() => {
    if (!map || !box.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      map.relayout();
      map.setCenter(new kakao.maps.LatLng(origin.lat, origin.lng));
    });
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [map, origin.lat, origin.lng]);

  // 선택한 매장으로 지도를 옮긴다 (사용자 이동이 아니므로 이 지역 검색 버튼은 띄우지 않는다)
  const target = listings.find(l => l.code === selectedCode);
  useEffect(() => {
    if (map && target?.lat != null && target.lng != null) map.panTo(new kakao.maps.LatLng(target.lat, target.lng));
  }, [map, target?.lat, target?.lng]);

  return (
    <div ref={box} className={styles.box}>
    <Map
      center={origin}
      level={5}
      className={styles.map}
      onCreate={setMap}
      // idle이 dragend보다 먼저 올 수 있어서 시작 시점에 표시한다
      onDragStart={() => { moved.current = true; }}
      onZoomStart={() => { moved.current = true; }}
      onIdle={m => { if (moved.current) onBoundsChange(toBounds(m)); }}
    >
      <CustomOverlayMap position={origin} zIndex={0}><span className={styles.me} aria-label="내 위치" /></CustomOverlayMap>
      {listings.map(l => (
        <Pin key={l.code} listing={l} label={labels[l.code]} selected={selectedCode === l.code} dropping={justPublished === l.code} onSelect={onSelect} />
      ))}
    </Map>
    </div>
  );
}
