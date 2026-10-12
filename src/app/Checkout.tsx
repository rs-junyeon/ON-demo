import { useEffect, useRef, useState } from 'react';
import { CheckBadge } from '../components/CheckBadge';
import { won } from '../domain/format';
import { useDemo } from '../store/demo';
import { useFlow } from '../store/flow';
import { useUi } from '../store/ui';
import s from './app.module.css';
import { TopNav } from './parts';

export function Checkout({ code }: { code: string }) {
  const l = useDemo(d => d.listings[code]);
  const h = useDemo(d => d.halo.find(x => x.code === code))!;
  const ui = useUi.getState();
  const [pay, setPay] = useState<'CARD' | 'EASY'>('CARD');
  const [agree, setAgree] = useState(false);
  const [processing, setProcessing] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = () => {
    setProcessing(true);
    timer.current = window.setTimeout(() => {
      const demo = useDemo.getState();
      demo.recordPayment(code);
      const c = demo.issue(code);
      useFlow.getState().play([['customer', 'on', 'halo', 'plus'], ['plus', 'halo', 'on', 'customer']]);
      ui.setApp({ screen: 'done', lastIssued: c.id });
      ui.showToast('결제하고 쿠폰을 받았어요');
    }, 900);
  };
  const opt = (id: 'CARD' | 'EASY', label: string) => (
    <label className={s.radio}><input type="radio" name="pay" checked={pay === id} onChange={() => setPay(id)} />{label}</label>
  );

  return (
    <>
      <div className={s.body}>
        <TopNav title="결제" onBack={() => ui.setApp({ screen: 'detail' })} />
        <div className={s.detail}>
          <div className={s.box}>
            <h4>주문 상품</h4>
            <div className={s.store}>{l.storeName}</div><div className={s.name}>{h.name}</div>
            <div className={s.sum}><span className="muted">상품 금액</span><span className="num">{won(h.consumerPrice)}</span></div>
            {h.consumerPrice > l.price && <div className={s.sum}><span className="muted">ON 할인</span><span className={`num ${s.off}`}>-{won(h.consumerPrice - l.price)}</span></div>}
            <div className={`${s.sum} ${s.total}`}><span>결제 금액</span><span className="num">{won(l.price)}</span></div>
          </div>
          <div className={s.box}><h4>결제 수단</h4><div className={s.payOpts}>{opt('CARD', '신용·체크카드')}{opt('EASY', '간편결제')}</div></div>
          <div className={s.note}>데모 결제라 실제로 청구되지 않아요.<br />구매를 취소하면 쿠폰을 어떻게 무효로 할지 아직 정하지 않았어요. <CheckBadge id={2} /></div>
          <label className={s.agree}><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />구매 조건과 유의사항을 확인했고, 결제에 동의해요.</label>
        </div>
      </div>
      <div className={s.ctaBar}>
        <button type="button" className={s.cta} disabled={!agree || processing} onClick={submit}>{won(l.price)} 결제하기</button>
      </div>
      {processing && <div className={s.processing} role="status"><div><div className={s.spinner} />결제 승인 중이에요</div></div>}
    </>
  );
}
