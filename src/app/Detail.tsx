import { typeLabel, validityText } from '../domain/coupon';
import { won } from '../domain/format';
import { distanceLabel } from '../domain/geo';
import { CATEGORY } from '../domain/types';
import { isOverLimit, useDemo } from '../store/demo';
import { useFlow } from '../store/flow';
import { useUi } from '../store/ui';
import s from './app.module.css';
import { PriceLine, TopNav, distOf, heroClass, icon } from './parts';

export function Detail({ code }: { code: string }) {
  const demo = useDemo();
  const origin = useUi(x => x.origin);
  const ui = useUi.getState();
  const l = demo.listings[code];
  const h = demo.halo.find(x => x.code === code)!;
  const live = l.status === 'PUBLISHED' && h.isOnSale;
  const over = isOverLimit(demo, code);
  const free = l.saleMode === 'FREE';
  const label = !live ? '지금은 판매하지 않는 상품이에요' : over ? '이번 달 판매 수량이 모두 나갔어요' : free ? '무료로 받기' : `${won(l.price)} 구매하기`;

  const claim = () => {
    const c = useDemo.getState().issue(code);
    useFlow.getState().play([['customer', 'on', 'halo', 'plus'], ['plus', 'halo', 'on', 'customer']]);
    ui.setApp({ screen: 'done', lastIssued: c.id });
    ui.showToast('쿠폰을 받았어요');
  };

  return (
    <>
      <div className={s.body}>
        <TopNav title="혜택 상세" onBack={() => ui.setApp({ screen: 'home' })} />
        <div className={`${s.hero} ${heroClass(l.cat)}`} aria-hidden="true">{icon(l.cat)}</div>
        <div className={s.detail}>
          <div className={s.store}>{l.storeName} <span className={s.dist}>{distanceLabel(distOf(origin, l))}</span></div>
          <h3>{h.name}</h3>
          {l.intro && <p className={s.intro}>{l.intro}</p>}
          <PriceLine l={l} h={h} big />
          <div className={s.tags}>
            <span className="tag">{typeLabel(h.type)}</span>
            <span className={`tag ${free ? 'tag-free' : 'tag-paid'}`}>{free ? '무료 증정' : '판매 상품'}</span>
            {l.cat && <span className="tag">{CATEGORY[l.cat].label}</span>}
          </div>
          <dl className={s.info}>
            <div className={s.row}><dt>유효기간</dt><dd>{validityText(h)}</dd></div>
            <div className={s.row}><dt>사용 장소</dt><dd>{h.useablePlace}</dd></div>
            <div className={s.row}><dt>주소</dt><dd>{l.address || '주소 미입력'}</dd></div>
            <div className={s.row}><dt>사용 제한</dt><dd>{h.restriction}</dd></div>
            <div className={s.row}><dt>유의사항</dt><dd>{h.precaution}</dd></div>
          </dl>
        </div>
      </div>
      <div className={s.ctaBar}>
        <button type="button" className={`${s.cta} ${free ? s.ctaFree : ''}`} disabled={!live || over}
          onClick={() => (free ? claim() : ui.setApp({ screen: 'checkout' }))}>{label}</button>
        <div className={s.ctaSub}>{free ? '받으면 내 쿠폰에 바로 저장돼요' : '결제하면 내 쿠폰에 바로 저장돼요'}</div>
      </div>
    </>
  );
}
