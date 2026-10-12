import { useEffect } from 'react';
import { CheckBadge } from '../components/CheckBadge';
import { couponState } from '../domain/coupon';
import { hm, won, ymd } from '../domain/format';
import { selectPublished, useDemo } from '../store/demo';
import s from './admin.module.css';

const STATE_LABEL = { AVAILABLE: '사용 가능', USED: '사용 완료', EXPIRED: '기간 만료' } as const;

export function Stats() {
  const demo = useDemo();
  useEffect(() => { useDemo.getState().setFlag('statsSeen'); }, []);
  const now = new Date();
  const cs = demo.coupons;
  const today = cs.filter(c => ymd(c.issuedAt) === ymd(now)).length;
  const sales = cs.reduce((a, c) => a + (c.paid || 0), 0);
  const used = cs.filter(c => c.status === 'USED').length;
  const ratio = Math.min(1, demo.limit.used / demo.limit.total);
  return (
    <>
      <div className={s.head}><div><h1>발급 현황</h1><p>ON에서 받거나 산 쿠폰이에요. 고객 앱에서 발급하면 여기에 바로 쌓여요.</p></div></div>
      <div className={s.kpis}>
        <div className={s.kpi}><div className={s.kpiK}>게시 중 상품</div><div className={s.kpiV}>{selectPublished(demo).length}</div></div>
        <div className={s.kpi}><div className={s.kpiK}>오늘 발급</div><div className={s.kpiV}>{today}</div></div>
        <div className={s.kpi}><div className={s.kpiK}>누적 판매 금액</div><div className={s.kpiV}>{won(sales)}</div></div>
        <div className={s.kpi}><div className={s.kpiK}>매장 사용 완료 <CheckBadge id={1} /></div><div className={s.kpiV}>{used}</div></div>
      </div>
      <div className={s.limit}>
        <div className={s.limitHead}>
          <span><b>Halo 월 발급 한도</b> <span className="muted">제공가 기준</span> <span className="api">GET /v1/clients/limit</span></span>
          <span className="num"><b>{won(demo.limit.used)}</b> / {won(demo.limit.total)} ({Math.round(ratio * 100)}%)</span>
        </div>
        <svg className={s.bar} viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
          <rect className={s.barTrack} width="100" height="10" rx="5" />
          <rect className={`${s.barFill} ${ratio > 0.85 ? s.over : ''}`} width={(ratio * 100).toFixed(2)} height="10" rx="5" />
        </svg>
        <div className={s.hint}>한도를 다 쓰면 고객 앱의 구매 버튼이 막혀요.</div>
      </div>
      <h2 className={s.sectionTitle}>최근 발급</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>발급 시각</th><th>상품</th><th>방식</th><th className={s.right}>결제 금액</th><th>거래번호 (tid)</th><th>상태</th></tr></thead>
          <tbody>
            {cs.map(c => (
              <tr key={c.id}>
                <td className="num">{ymd(c.issuedAt)} {hm(c.issuedAt)}</td>
                <td>{demo.halo.find(h => h.code === c.code)?.name}</td>
                <td><span className={`tag ${c.saleMode === 'FREE' ? 'tag-free' : 'tag-paid'}`}>{c.saleMode === 'FREE' ? '무료' : '유료'}</span></td>
                <td className={`${s.right} num`}>{won(c.paid)}</td>
                <td className="mono">{c.tid}</td>
                <td>{STATE_LABEL[couponState(c, now)]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
