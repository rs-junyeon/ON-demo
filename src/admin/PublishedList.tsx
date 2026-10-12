import { won } from '../domain/format';
import { CATEGORY } from '../domain/types';
import { useDemo } from '../store/demo';
import { useFlow } from '../store/flow';
import { useUi } from '../store/ui';
import s from './admin.module.css';

export function PublishedList() {
  const listings = useDemo(d => d.listings);
  const halo = useDemo(d => d.halo);
  const coupons = useDemo(d => d.coupons);
  const ui = useUi.getState();
  const list = Object.values(listings).filter(l => l.status === 'PUBLISHED' || l.status === 'HIDDEN');
  const toggle = (code: string) => {
    const hiding = listings[code].status === 'PUBLISHED';
    useDemo.getState().toggleHidden(code);
    useFlow.getState().play([['on', 'customer']]);
    const app = useUi.getState().app;
    if (hiding && app.selected === code) ui.setApp({ selected: null });
    if (hiding && (app.screen === 'detail' || app.screen === 'checkout') && app.detail === code) ui.setApp({ screen: 'home' });
    ui.showToast(hiding ? '숨겼어요. 고객 앱에서 빠졌어요' : '다시 게시했어요');
  };
  return (
    <>
      <div className={s.head}><div><h1>게시 상품</h1><p>고객 앱에 보이는 상품이에요. 숨기면 지도와 목록에서 바로 빠져요.</p></div></div>
      <div className={s.pubList}>
        {list.map(l => {
          const h = halo.find(x => x.code === l.code)!;
          const n = coupons.filter(c => c.code === l.code).length;
          return (
            <div key={l.code} className={s.pubRow}>
              <div className={s.pubIcon}>{l.cat ? CATEGORY[l.cat].icon : ''}</div>
              <div><div className={s.title}>{h.name}</div><div className={s.pubMeta}>{l.storeName}, {l.cat ? CATEGORY[l.cat].label : ''}, {l.saleMode === 'FREE' ? '무료' : won(l.price)}, 발급 {n}건</div></div>
              <span className={`status s-${l.status}`}>{l.status === 'PUBLISHED' ? '게시 중' : '숨김'}</span>
              <span>
                <button type="button" className="btn" onClick={() => ui.setAdmin({ page: 'edit', editing: l.code })}>수정</button>{' '}
                <button type="button" className="btn" onClick={() => toggle(l.code)}>{l.status === 'PUBLISHED' ? '숨기기' : '다시 게시'}</button>
              </span>
            </div>
          );
        })}
        {!list.length && <div className="empty"><b>게시한 상품이 없어요</b>Halo 상품에서 보강하기를 눌러 첫 상품을 게시해 보세요.</div>}
      </div>
    </>
  );
}
