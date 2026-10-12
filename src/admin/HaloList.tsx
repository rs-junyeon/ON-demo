import { DOCCODE } from '../data/seed';
import { typeLabel } from '../domain/coupon';
import { won } from '../domain/format';
import { useDemo } from '../store/demo';
import { useUi } from '../store/ui';
import s from './admin.module.css';
import { OnStatus } from './status';

const FILTERS = [['ALL', '전체'], ['DRAFT', '미게시'], ['PUBLISHED', '게시 중'], ['HIDDEN', '숨김']] as const;

export function HaloList() {
  const halo = useDemo(d => d.halo);
  const listings = useDemo(d => d.listings);
  const filter = useUi(x => x.admin.filter);
  const setAdmin = useUi(x => x.setAdmin);
  const rows = halo.filter(h => filter === 'ALL' || (listings[h.code]?.status ?? 'DRAFT') === filter);
  return (
    <>
      <div className={s.head}><div><h1>Halo 상품</h1><p>Halo가 ON에 배정한 캠페인 상품이에요. 위치와 카테고리를 채워야 고객에게 보여요.</p></div></div>
      <div className={s.source}><span className={`${s.src} ${s.srcHalo}`}>Halo에서 받음</span> 캠페인 <b>{DOCCODE}</b>의 상품 {halo.length}개 (샘플) <span className="api">{'GET /v1/campaigns/{doccode}/showpieces'}</span></div>
      <div className={s.filters}>
        {FILTERS.map(([id, label]) => <button key={id} type="button" className="chip" aria-pressed={filter === id} onClick={() => setAdmin({ filter: id })}>{label}</button>)}
      </div>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>상품</th><th>브랜드</th><th>권종</th><th className={s.right}>소비자가</th><th className={s.right}>제공가</th><th>ON 상태</th><th /></tr></thead>
          <tbody>
            {rows.map(h => {
              const st = listings[h.code]?.status ?? 'DRAFT';
              return (
                <tr key={h.code}>
                  <td><div className={s.title}>{h.name}</div><div className="mono">{h.code}</div></td>
                  <td>{h.brandName}</td>
                  <td><span className="tag">{typeLabel(h.type)}</span></td>
                  <td className={`${s.right} num`}>{won(h.consumerPrice)}</td>
                  <td className={`${s.right} num`}>{won(h.adjustPrice)}</td>
                  <td><OnStatus halo={h} listing={listings[h.code]} /></td>
                  <td className={s.right}>
                    <button type="button" className={`btn ${st === 'DRAFT' && h.isOnSale ? 'btn-primary' : ''}`} onClick={() => setAdmin({ page: 'edit', editing: h.code })}>
                      {st === 'DRAFT' ? '보강하기' : '수정'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={7}><div className="empty"><b>이 상태의 상품이 없어요</b>다른 필터를 눌러 보세요.</div></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
