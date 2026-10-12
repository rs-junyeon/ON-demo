import { useMemo, useState } from 'react';
import { CheckBadge } from '../components/CheckBadge';
import { EXAMPLE_FILL } from '../data/seed';
import { typeLabel, validityText } from '../domain/coupon';
import { won } from '../domain/format';
import { SEONGSU, distanceLabel, distanceM } from '../domain/geo';
import { canPublish, missingForPublish } from '../domain/listing';
import { CATEGORIES, type CategoryId, type LatLng, type Listing } from '../domain/types';
import { KakaoGate, useKakaoReady } from '../map/KakaoGate';
import { reverseGeocode, searchAddress, type GeoResult } from '../map/geocode';
import { PickerMap } from '../map/PickerMap';
import { selectPublished, useDemo } from '../store/demo';
import { useFlow } from '../store/flow';
import { useUi } from '../store/ui';
import s from './admin.module.css';
import { OnStatus } from './status';

export function ListingEditor({ code }: { code: string }) {
  const h = useDemo(d => d.halo.find(x => x.code === code))!;
  const stored = useDemo(d => d.listings[code]);
  const halos = useDemo(d => d.halo);
  const listings = useDemo(d => d.listings);
  const others = useMemo(() => selectPublished({ halo: halos, listings }).filter(l => l.code !== code), [halos, listings, code]);
  const { saveListing, publish } = useDemo.getState();
  const ui = useUi.getState();
  const mapStatus = useKakaoReady();

  const [d, setD] = useState<Listing>(() => stored ?? { code, storeName: '', cat: '', address: '', lat: null, lng: null, intro: '', saleMode: 'PAID', price: h.consumerPrice, status: 'DRAFT' });
  const set = (p: Partial<Listing>) => setD(x => ({ ...x, ...p }));
  const [results, setResults] = useState<GeoResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const cur = stored?.status ?? 'DRAFT';
  const missing = missingForPublish(h, d);
  const gap = d.saleMode === 'PAID' ? Number(d.price || 0) - h.adjustPrice : -h.adjustPrice;
  const hint = !h.isOnSale ? 'Halo에서 판매 중지된 상품이에요'
    : missing.length ? `게시하려면 ${missing.join(', ')} 항목을 채워 주세요`
    : cur === 'PUBLISHED' ? '게시 중인 상품이에요. 저장하면 고객 앱에 바로 반영돼요' : '게시할 준비가 됐어요';

  const runSearch = async () => {
    if (mapStatus !== 'ready' || !d.address.trim()) return;
    setSearching(true);
    try { setResults(await searchAddress(d.address.trim())); } finally { setSearching(false); }
  };
  const pick = (r: GeoResult) => { set({ address: r.address, lat: r.lat, lng: r.lng }); setResults(null); };
  const pickOnMap = async (p: LatLng) => {
    set(p);
    const address = await reverseGeocode(p);
    if (address) set({ address });
  };
  const fillExample = () => set(EXAMPLE_FILL[code] ?? { storeName: d.storeName || h.brandName, cat: d.cat || 'CAFE', lat: d.lat ?? SEONGSU.lat + 0.001, lng: d.lng ?? SEONGSU.lng });

  const onSave = () => { saveListing({ ...d, status: cur }); ui.showToast(cur === 'PUBLISHED' ? '저장했어요. 고객 앱에 바로 반영돼요' : '임시 저장했어요'); };
  const onPublish = () => {
    if (!publish(d).ok) return;
    useFlow.getState().play([['halo', 'on', 'customer']]);
    ui.setBounds(null);
    ui.setJustPublished(code);
    ui.setApp({ screen: 'home', mode: 'map', cat: 'ALL', q: '', selected: code });
    ui.setAdmin({ page: 'halo', editing: null });
    ui.showToast('게시했어요. 고객 앱 지도에 핀이 생겼어요');
  };

  return (
    <>
      <button type="button" className={s.back} onClick={() => ui.setAdmin({ page: 'halo', editing: null })}>‹ Halo 상품 목록</button>
      <div className={s.head}>
        <div><h1>상품 보강</h1><p>{h.name} <OnStatus halo={h} listing={stored} /></p></div>
        <button type="button" className="btn" onClick={fillExample}>예시 값 채우기</button>
      </div>
      {!h.isOnSale && <div className={s.bannerOff}>Halo에서 판매 중지된 상품이라 게시할 수 없어요. 정보는 미리 저장해 둘 수 있어요.</div>}
      <div className={s.editor}>
        <section className={`${s.panel} ${s.panelHalo}`}>
          <div className={s.panelHead}><h3>Halo 원본</h3><span className={`${s.src} ${s.srcHalo}`}>읽기 전용</span></div>
          <dl className={s.spec}>
            <dt>상품명</dt><dd>{h.name}</dd>
            <dt>상품 코드</dt><dd className="mono">{h.code}</dd>
            <dt>브랜드</dt><dd>{h.brandName} <span className="muted">({h.brandCode})</span></dd>
            <dt>권종</dt><dd>{typeLabel(h.type)}</dd>
            <dt>소비자가</dt><dd className="num">{won(h.consumerPrice)}</dd>
            <dt>제공가</dt><dd className="num">{won(h.adjustPrice)}</dd>
            <dt>유효기간</dt><dd>{validityText(h)}</dd>
            <dt>사용 장소</dt><dd>{h.useablePlace}</dd>
            <dt>사용 제한</dt><dd>{h.restriction}</dd>
            <dt>유의사항</dt><dd>{h.precaution}</dd>
          </dl>
          <div className={s.missing}>Halo 응답에 없어서 ON이 채워야 하는 정보
            <ul><li>매장 주소와 지도 위치 <CheckBadge id={5} /></li><li>카테고리, 매장 소개</li><li>무료로 줄지 팔지 <CheckBadge id={3} /></li></ul>
          </div>
        </section>

        <section className={`${s.panel} ${s.panelOn}`}>
          <div className={s.panelHead}><h3>ON이 채우는 정보</h3><span className={`${s.src} ${s.srcOn}`}>고객 앱에 노출</span></div>
          <div className={s.row2}>
            <div className={s.field}>
              <label className={s.label} htmlFor="f-store">매장명 <span className={s.req}>*</span></label>
              <input id="f-store" className={s.input} value={d.storeName} placeholder="예: 손끝네일 성수점" autoComplete="off" onChange={e => set({ storeName: e.target.value })} />
            </div>
            <div className={s.field}>
              <label className={s.label} htmlFor="f-cat">카테고리 <span className={s.req}>*</span></label>
              <select id="f-cat" className={s.input} value={d.cat} onChange={e => set({ cat: e.target.value as CategoryId | '' })}>
                <option value="">선택</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="f-addr">주소</label>
            <div className={s.inline}>
              <input id="f-addr" className={s.input} value={d.address} placeholder="예: 서울 성동구 성수이로 20" autoComplete="off"
                onChange={e => { set({ address: e.target.value }); setResults(null); }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); void runSearch(); } }} />
              <button type="button" className="btn" aria-label="주소 검색" disabled={mapStatus !== 'ready' || searching || !d.address.trim()} onClick={runSearch}>{searching ? '찾는 중' : '검색'}</button>
            </div>
            {results && results.length > 0 && (
              <ul className={s.results} aria-label="주소 검색 결과">
                {results.map(r => <li key={`${r.lat},${r.lng},${r.label}`}><button type="button" onClick={() => pick(r)}>{r.label}{r.label !== r.address && <small>{r.address}</small>}</button></li>)}
              </ul>
            )}
            {results && results.length === 0 && <p className={s.noResult}>검색 결과가 없어요. 도로명이나 건물 이름으로 다시 찾아보세요</p>}
          </div>
          <div className={s.field}>
            <div className={s.label}>지도 위치 <span className={s.req}>*</span> <CheckBadge id={5} /></div>
            <KakaoGate compact><PickerMap value={d} others={others} onPick={pickOnMap} /></KakaoGate>
            <div className={s.hint}>
              {d.lat == null || d.lng == null ? '주소를 검색하거나 지도를 눌러 매장 위치를 정해 주세요.'
                : <>기준점(성수역)에서 약 <b>{distanceLabel(distanceM(SEONGSU, { lat: d.lat, lng: d.lng }))}</b>. 지도를 누르면 위치와 주소가 바뀌어요.</>}
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="f-intro">한 줄 소개</label>
            <textarea id="f-intro" className={`${s.input} ${s.textarea}`} value={d.intro} placeholder="고객이 매장을 고를 때 보는 문장이에요" onChange={e => set({ intro: e.target.value })} />
          </div>
          <div className={s.field}>
            <div className={s.label}>판매 방식 <CheckBadge id={3} /></div>
            <div className={s.radios}>
              <label className={s.radio}><input type="radio" name="saleMode" checked={d.saleMode === 'FREE'} onChange={() => set({ saleMode: 'FREE' })} />무료로 받기</label>
              <label className={s.radio}><input type="radio" name="saleMode" checked={d.saleMode === 'PAID'} onChange={() => set({ saleMode: 'PAID', price: Number(d.price) > 0 ? d.price : h.consumerPrice })} />유료 판매</label>
            </div>
          </div>
          <div className={s.field}>
            <label className={s.label} htmlFor="f-price">ON 판매가 {d.saleMode === 'PAID' && <span className={s.req}>*</span>} <CheckBadge id={4} /></label>
            <input id="f-price" className={`${s.input} num`} type="number" min={0} step={100} disabled={d.saleMode === 'FREE'}
              placeholder={d.saleMode === 'FREE' ? '무료 상품은 판매가가 없어요' : undefined}
              value={d.saleMode === 'PAID' ? d.price : ''} onChange={e => set({ price: Number(e.target.value) })} />
            <div className={s.hint}>소비자가 <b>{won(h.consumerPrice)}</b>, 제공가 <b>{won(h.adjustPrice)}</b>. 판매가와 제공가 차이 <b className="num">{gap >= 0 ? '+' : ''}{won(gap)}</b></div>
          </div>
          <div className={s.actions}>
            <span>{hint}</span>
            <span>
              <button type="button" className="btn" disabled={cur === 'PUBLISHED' && !canPublish(h, d)} onClick={onSave}>{cur === 'PUBLISHED' ? '저장' : '임시 저장'}</button>
              {cur !== 'PUBLISHED' && <button type="button" className="btn btn-primary" disabled={!canPublish(h, d)} onClick={onPublish}>게시하기</button>}
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
