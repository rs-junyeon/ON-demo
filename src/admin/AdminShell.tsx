import { useDemo } from '../store/demo';
import { useUi, type AdminPage } from '../store/ui';
import s from './admin.module.css';
import { HaloList } from './HaloList';
import { ListingEditor } from './ListingEditor';
import { PublishedList } from './PublishedList';
import { Stats } from './Stats';

export function AdminShell() {
  const { page, editing } = useUi(x => x.admin);
  const setAdmin = useUi(x => x.setAdmin);
  const draftCount = useDemo(d => d.halo.filter(h => h.isOnSale && (d.listings[h.code]?.status ?? 'DRAFT') === 'DRAFT').length);
  const item = (p: AdminPage, label: string, badge?: number) => (
    <button type="button" className={s.navItem} aria-current={page === p || (p === 'halo' && page === 'edit') ? 'page' : undefined}
      onClick={() => setAdmin({ page: p, editing: null })}>
      {label}{badge ? <span className={s.badge}>{badge}</span> : null}
    </button>
  );
  return (
    <section className={s.shell} aria-label="ON 관리자">
      <nav className={s.nav} aria-label="관리자 메뉴">
        <h2>ON 관리자</h2>
        <p>운영자가 Halo 상품을 고객용으로 다듬어 게시해요</p>
        {item('halo', 'Halo 상품', draftCount)}
        {item('published', '게시 상품')}
        {item('stats', '발급 현황')}
      </nav>
      <div className={s.main}>
        {page === 'halo' && <HaloList />}
        {page === 'edit' && editing && <ListingEditor key={editing} code={editing} />}
        {page === 'published' && <PublishedList />}
        {page === 'stats' && <Stats />}
      </div>
    </section>
  );
}
