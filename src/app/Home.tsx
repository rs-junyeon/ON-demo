import { useEffect, useState } from 'react';
import { SEONGSU, inBounds } from '../domain/geo';
import { CATEGORIES, type Bounds } from '../domain/types';
import { CustomerMap } from '../map/CustomerMap';
import { KakaoGate } from '../map/KakaoGate';
import { useMyLocation } from '../map/useMyLocation';
import { selectPublished, useDemo } from '../store/demo';
import { useUi } from '../store/ui';
import s from './app.module.css';
import { Sheet, distOf, priceText } from './parts';

export function Home() {
  const halo = useDemo(d => d.halo);
  const listings = useDemo(d => d.listings);
  const app = useUi(x => x.app);
  const origin = useUi(x => x.origin);
  const bounds = useUi(x => x.bounds);
  const justPublished = useUi(x => x.justPublished);
  const ui = useUi.getState();
  const { locate, busy } = useMyLocation();
  const [pending, setPending] = useState<Bounds | null>(null);

  useEffect(() => {
    if (!justPublished) return;
    const t = window.setTimeout(() => useUi.getState().setJustPublished(null), 1600);
    return () => clearTimeout(t);
  }, [justPublished]);

  const haloOf = (code: string) => halo.find(h => h.code === code)!;
  const q = app.q.trim();
  const items = selectPublished({ halo, listings })
    .filter(l => app.cat === 'ALL' || l.cat === app.cat)
    .filter(l => !q || [l.storeName, haloOf(l.code).name, haloOf(l.code).brandName].join(' ').includes(q))
    .filter(l => !bounds || (l.lat != null && l.lng != null && inBounds({ lat: l.lat, lng: l.lng }, bounds)))
    .sort((a, b) => distOf(origin, a) - distOf(origin, b));
  const labels = Object.fromEntries(items.map(l => [l.code, `${l.storeName}, ${haloOf(l.code).name}, ${priceText(l)}`]));
  const selected = items.find(l => l.code === app.selected) ?? null;
  const open = (code: string) => {
    ui.setApp({ screen: 'detail', detail: code });
    if (code === 'SP_NAIL') useDemo.getState().setFlag('viewedNail');
  };
  const clearBounds = () => { ui.setBounds(null); setPending(null); };
  const findMe = async () => {
    const r = await locate();
    if (r.kind === 'ok') { ui.setOrigin(r.origin); ui.showToast('내 위치 기준으로 보여 드려요'); }
    else {
      ui.setOrigin(SEONGSU);
      ui.showToast(r.kind === 'far' ? '지금 위치가 성수동에서 멀어서 성수동 기준으로 보여 드려요' : '위치를 가져오지 못해 성수동 기준으로 보여 드려요');
    }
  };
  const isMine = origin.lat !== SEONGSU.lat || origin.lng !== SEONGSU.lng;

  return (
    <>
      <div className={s.head}>
        <div className={s.locRow}>
          <div className={s.loc}><b>{isMine ? '내 위치' : '성수동'}</b> 주변 혜택</div>
          <button type="button" className={s.locBtn} onClick={findMe} disabled={busy}>{busy ? '찾는 중' : '내 위치'}</button>
        </div>
        <input className={s.search} type="search" value={app.q} placeholder="매장, 상품 검색" aria-label="매장, 상품 검색" autoComplete="off"
          onChange={e => ui.setApp({ q: e.target.value, selected: null })} />
      </div>
      <div className={s.cats}>
        <button type="button" className="chip" aria-pressed={app.cat === 'ALL'} onClick={() => ui.setApp({ cat: 'ALL', selected: null })}>전체</button>
        {CATEGORIES.map(c => <button key={c.id} type="button" className="chip" aria-pressed={app.cat === c.id} onClick={() => ui.setApp({ cat: c.id, selected: null })}>{c.icon} {c.label}</button>)}
      </div>
      <div className={s.modeBar}>
        <span className={s.count}>혜택 {items.length}개</span>
        <div className="seg" role="group" aria-label="보기">
          <button type="button" aria-pressed={app.mode === 'map'} onClick={() => ui.setApp({ mode: 'map' })}>지도</button>
          <button type="button" aria-pressed={app.mode === 'list'} onClick={() => ui.setApp({ mode: 'list' })}>목록</button>
        </div>
      </div>
      {bounds && items.length > 0 && (
        <div className={s.boundsBar}><span>지도에 보이는 범위의 혜택만 보고 있어요</span><button type="button" className={s.linkBtn} onClick={clearBounds}>전체 보기</button></div>
      )}
      {app.mode === 'map' && (
        <div className={s.mapBox}>
          <KakaoGate>
            <CustomerMap listings={items} labels={labels} selectedCode={app.selected} justPublished={justPublished} origin={origin}
              onSelect={code => ui.setApp({ selected: app.selected === code ? null : code })} onBoundsChange={setPending} />
          </KakaoGate>
          {pending && <button type="button" className={s.research} onClick={() => { ui.setBounds(pending); setPending(null); ui.setApp({ selected: null }); }}>이 지역에서 다시 찾기</button>}
        </div>
      )}
      {items.length === 0 ? (
        bounds
          ? <div className="empty"><b>이 지역에는 혜택이 없어요</b><button type="button" className={s.linkBtn} onClick={clearBounds}>전체 보기</button></div>
          : <div className="empty"><b>조건에 맞는 혜택이 없어요</b>카테고리를 전체로 바꾸거나 검색어를 지워 보세요.</div>
      ) : app.mode === 'map' ? (
        selected ? <Sheet l={selected} h={haloOf(selected.code)} origin={origin} onOpen={open} /> : <p className={s.tip}>핀을 누르면 혜택이 보여요</p>
      ) : (
        <div className={s.list}>{items.map(l => <Sheet key={l.code} l={l} h={haloOf(l.code)} origin={origin} onOpen={open} />)}</div>
      )}
    </>
  );
}
