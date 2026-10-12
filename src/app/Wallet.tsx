import { couponState, dday } from '../domain/coupon';
import { ymd } from '../domain/format';
import { useDemo } from '../store/demo';
import { useUi } from '../store/ui';
import s from './app.module.css';
import { icon, thumbClass } from './parts';

export function Wallet() {
  const coupons = useDemo(d => d.coupons);
  const halo = useDemo(d => d.halo);
  const listings = useDemo(d => d.listings);
  const tab = useUi(x => x.app.walletTab);
  const ui = useUi.getState();
  const now = new Date();
  const active = coupons.filter(c => couponState(c, now) === 'AVAILABLE');
  const past = coupons.filter(c => couponState(c, now) !== 'AVAILABLE');
  const list = tab === 'ACTIVE' ? active : past;
  return (
    <div className={s.body}>
      <div className={s.head}><div className={s.loc}><b>내 쿠폰</b></div></div>
      <div className={s.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'ACTIVE'} onClick={() => ui.setApp({ walletTab: 'ACTIVE' })}>사용 가능 {active.length}</button>
        <button type="button" role="tab" aria-selected={tab === 'PAST'} onClick={() => ui.setApp({ walletTab: 'PAST' })}>사용 완료·만료 {past.length}</button>
      </div>
      <div className={s.wallet}>
        {list.map(c => {
          const h = halo.find(x => x.code === c.code)!;
          const l = listings[c.code];
          const d = dday(c, now);
          return (
            <button key={c.id} type="button" className={`${s.wcard} ${d.muted ? s.dim : ''}`} onClick={() => ui.setApp({ screen: 'coupon', couponId: c.id })}>
              <div className={`${s.thumb} ${thumbClass(l?.cat ?? '')}`} aria-hidden="true">{icon(l?.cat ?? '')}</div>
              <div><div className={s.store}>{l?.storeName || h.brandName}</div><div className={s.name}>{h.name}</div><div className={s.dist}>{ymd(c.expiredAt)}까지</div></div>
              <span className={`${s.dday} ${d.muted ? s.ddayMuted : ''}`}>{d.text}</span>
            </button>
          );
        })}
        {!list.length && (tab === 'ACTIVE'
          ? <div className="empty"><b>아직 받은 쿠폰이 없어요</b>둘러보기에서 주변 혜택을 받아 보세요.</div>
          : <div className="empty"><b>사용하거나 만료된 쿠폰이 없어요</b></div>)}
      </div>
    </div>
  );
}
