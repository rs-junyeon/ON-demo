import type { HaloShowpiece, Listing } from '../domain/types';

const LABEL: Record<Listing['status'], string> = { DRAFT: '미게시', PUBLISHED: '게시 중', HIDDEN: '숨김' };

export function OnStatus({ halo, listing }: { halo: HaloShowpiece; listing?: Listing }) {
  if (!halo.isOnSale) return <span className="status s-off">Halo 판매 중지</span>;
  const st = listing?.status ?? 'DRAFT';
  return <span className={`status s-${st}`}>{LABEL[st]}</span>;
}
