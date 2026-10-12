import { CheckBadge } from '../components/CheckBadge';
import { couponState } from '../domain/coupon';
import { groupPin, hm, won, ymd } from '../domain/format';
import { useDemo } from '../store/demo';
import { useFlow } from '../store/flow';
import { useUi } from '../store/ui';
import s from './app.module.css';
import { Barcode } from './Barcode';
import { TopNav } from './parts';

export function CouponView({ couponId }: { couponId: string }) {
  const c = useDemo(d => d.coupons.find(x => x.id === couponId));
  const demo = useDemo.getState();
  const ui = useUi.getState();
  if (!c) return null;
  const h = demo.halo.find(x => x.code === c.code)!;
  const l = demo.listings[c.code];
  const st = couponState(c, new Date());
  const use = () => {
    useDemo.getState().markUsed(c.id);
    useFlow.getState().play([['customer', 'store'], ['plus', 'halo', 'on']], true);
    ui.showToast('사용 완료로 바뀌었어요');
  };
  return (
    <div className={s.body}>
      <TopNav title="쿠폰" onBack={() => ui.setApp({ screen: 'wallet' })} />
      <div className={s.ticket}>
        <div className={s.ticketTop}><div className={s.store}>{l?.storeName || h.brandName}</div><h3>{h.name}</h3></div>
        <div className={s.cut} />
        <div className={s.code}>
          <Barcode pin={c.pin} />
          <div className={s.pinNum}>{groupPin(c.pin)}</div>
          <div className={s.codeNote}>데모용 바코드예요</div>
          {st !== 'AVAILABLE' && <div className={s.stamp}><span>{st === 'USED' ? '사용 완료' : '기간 만료'}</span></div>}
        </div>
        <dl className={`${s.info} ${s.ticketInfo}`}>
          <div className={s.row}><dt>유효기간</dt><dd className="num">{ymd(c.expiredAt)}까지</dd></div>
          {h.type === 'BALANCE' && <div className={s.row}><dt>잔액</dt><dd className="num">{won(c.balance ?? 0)}</dd></div>}
          <div className={s.row}><dt>사용 장소</dt><dd>{h.useablePlace}</dd></div>
          <div className={s.row}><dt>발급 번호</dt><dd className="mono">{c.seq}</dd></div>
          {c.usedAt && <div className={s.row}><dt>사용 일시</dt><dd className="num">{ymd(c.usedAt)} {hm(c.usedAt)}</dd></div>}
        </dl>
      </div>
      {st === 'AVAILABLE' && (
        <>
          <p className={s.useGuide}>매장 직원에게 바코드를 보여 주면 매장에서 사용 처리를 해요.</p>
          <div className={s.sim}>
            <div className={s.simHead}><span>시연용: 매장 직원이 승인했다고 가정</span><CheckBadge id={1} /></div>
            <p>실제로는 매장이 PLUS Audit에서 승인해요. ON이 그 결과를 받을 방법은 아직 확인이 필요해요.</p>
            <button type="button" className="btn" onClick={use}>매장 사용 처리</button>
          </div>
        </>
      )}
    </div>
  );
}
