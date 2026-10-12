import { couponState } from '../domain/coupon';
import { useDemo } from '../store/demo';
import { useUi, type AppScreen } from '../store/ui';
import s from './app.module.css';
import { Checkout } from './Checkout';
import { CouponView } from './CouponView';
import { Detail } from './Detail';
import { Done } from './Done';
import { Home } from './Home';
import { Wallet } from './Wallet';

export function CustomerApp() {
  const app = useUi(x => x.app);
  const listings = useDemo(d => d.listings);
  const active = useDemo(d => d.coupons.filter(c => couponState(c, new Date()) === 'AVAILABLE').length);
  const setApp = useUi.getState().setApp;
  const nav = (screen: AppScreen, ico: string, label: string, dot?: number) => (
    <button type="button" aria-current={app.screen === screen ? 'page' : undefined} onClick={() => setApp({ screen })}>
      <span className={s.ico} aria-hidden="true">{ico}</span>{label}{dot ? <span className={s.dot}>{dot}</span> : null}
    </button>
  );
  // 숨겨진 상품의 상세에 머물러 있으면 홈으로
  const detailGone = (app.screen === 'detail' || app.screen === 'checkout') && (!app.detail || !listings[app.detail]);
  const screen = detailGone ? 'home' : app.screen;
  return (
    <div className={s.app}>
      {screen === 'home' && <div className={s.body}><Home /></div>}
      {screen === 'detail' && app.detail && <Detail code={app.detail} />}
      {screen === 'checkout' && app.detail && <Checkout code={app.detail} />}
      {screen === 'done' && app.lastIssued && <Done couponId={app.lastIssued} />}
      {screen === 'wallet' && <Wallet />}
      {screen === 'coupon' && app.couponId && <CouponView couponId={app.couponId} />}
      {(screen === 'home' || screen === 'wallet') && (
        <nav className={s.nav} aria-label="앱 메뉴">{nav('home', '🗺️', '둘러보기')}{nav('wallet', '🎟️', '내 쿠폰', active)}</nav>
      )}
    </div>
  );
}
