import type { LatLng } from '../domain/types';

export type GeoResult = { label: string; address: string; lat: number; lng: number };
const MAX = 5;

/** 주소 검색, 0건이면 키워드(장소명) 검색. 실패도 빈 배열 */
export function searchAddress(q: string): Promise<GeoResult[]> {
  const svc = kakao.maps.services;
  return new Promise(resolve => {
    new svc.Geocoder().addressSearch(q, (result, status) => {
      if (status === svc.Status.OK && result.length) {
        resolve(result.slice(0, MAX).map(r => {
          const address = r.road_address?.address_name || r.address_name;
          return { label: address, address, lat: Number(r.y), lng: Number(r.x) };
        }));
        return;
      }
      new svc.Places().keywordSearch(q, (places, st) => {
        resolve(st === svc.Status.OK
          ? places.slice(0, MAX).map(p => ({ label: p.place_name, address: p.road_address_name || p.address_name, lat: Number(p.y), lng: Number(p.x) }))
          : []);
      });
    });
  });
}

/** 좌표 → 주소 (도로명 우선, 없으면 지번) */
export function reverseGeocode(p: LatLng): Promise<string | null> {
  const svc = kakao.maps.services;
  return new Promise(resolve => {
    new svc.Geocoder().coord2Address(p.lng, p.lat, (result, status) => {
      const r = status === svc.Status.OK ? result[0] : undefined;
      resolve(r ? r.road_address?.address_name ?? r.address?.address_name ?? null : null);
    });
  });
}
