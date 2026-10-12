import { AdminShell } from './admin/AdminShell';
import { CustomerApp } from './app/CustomerApp';
import { FlowStrip } from './components/FlowStrip';
import { PhoneFrame } from './components/PhoneFrame';
import { Popovers } from './components/Popovers';
import { Ticker } from './components/Ticker';
import { Toast } from './components/Toast';
import { guideSteps } from './domain/guide';
import { KakaoLoader } from './map/KakaoGate';
import { useDemo } from './store/demo';
import { useFlow } from './store/flow';
import { useUi, type View } from './store/ui';
import styles from './App.module.css';
import wordmark from './assets/coupin-wordmark.svg';

const VIEWS: { id: View; label: string }[] = [
  { id: 'split', label: '나란히' },
  { id: 'admin', label: '관리자' },
  { id: 'app', label: '고객 앱' },
];

export default function App() {
  const view = useUi(s => s.view);
  const pop = useUi(s => s.pop);
  const { setView, setPop } = useUi.getState();
  const steps = guideSteps(useDemo());
  const done = steps.filter(s => s.done).length;

  const reset = () => {
    if (!window.confirm('데모를 처음 상태로 되돌릴까요? 게시한 상품과 받은 쿠폰이 모두 지워져요.')) return;
    useDemo.getState().reset();
    useUi.getState().resetUi();
    useUi.getState().showToast('처음 상태로 되돌렸어요');
    useFlow.getState().play([['plus', 'halo', 'on']]);
  };

  return (
    <>
      <KakaoLoader />
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <img className={styles.wordmark} src={wordmark} alt="coupin" />
          <span className={styles.brandOn}>ON</span>
          <span className={styles.brandSub}>기획 데모</span>
        </div>
        <FlowStrip />
        <div className={styles.actions}>
          <button type="button" className="btn" data-pop-trigger onClick={() => setPop(pop === 'guide' ? null : 'guide')}>
            시연 가이드 <span className="btn-count">{done}/{steps.length}</span>
          </button>
          <button type="button" className="btn" data-pop-trigger onClick={() => setPop(pop === 'checks' ? null : 'checks')}>
            확인 필요 <span className="btn-count">8</span>
          </button>
          <div className="seg" role="group" aria-label="보기 방식">
            {VIEWS.map(v => (
              <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={reset}>처음 상태로</button>
        </div>
      </header>
      <Ticker />
      <main className={styles.stage} data-view={view}>
        <div className={styles.admin}><AdminShell /></div>
        <div className={styles.phone}><PhoneFrame><CustomerApp /></PhoneFrame></div>
      </main>
      <Popovers />
      <Toast />
    </>
  );
}
