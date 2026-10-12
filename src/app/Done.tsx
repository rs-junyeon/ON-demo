import { won, ymd } from '../domain/format';
import { useDemo } from '../store/demo';
import { useUi } from '../store/ui';
import s from './app.module.css';

export function Done({ couponId }: { couponId: string }) {
  const c = useDemo(d => d.coupons.find(x => x.id === couponId));
  const demo = useDemo.getState();
  const ui = useUi.getState();
  if (!c) return null;
  const h = demo.halo.find(x => x.code === c.code)!;
  return (
    <div className={s.body}>
      <div className={s.doneScreen}>
        <div className={s.doneMark} aria-hidden="true">✓</div>
        <h3>쿠폰을 받았어요</h3>
        <p>매장에서 내 쿠폰의 바코드를 보여 주세요.</p>
        <div className={s.box}>
          <div className={s.store}>{demo.listings[c.code]?.storeName}</div><div className={s.name}>{h.name}</div>
          <div className={s.sum}><span className="muted">유효기간</span><span className="num">{ymd(c.expiredAt)}까지</span></div>
          {c.paid > 0 && <div className={s.sum}><span className="muted">결제 금액</span><span className="num">{won(c.paid)}</span></div>}
        </div>
        <button type="button" className={s.cta} onClick={() => ui.setApp({ screen: 'coupon', couponId: c.id })}>내 쿠폰 보기</button>
        <button type="button" className={s.ctaAlt} onClick={() => ui.setApp({ screen: 'home' })}>계속 둘러보기</button>
      </div>
    </div>
  );
}
