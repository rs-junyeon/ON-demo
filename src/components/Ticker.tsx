import { hms } from '../domain/format';
import { useDemo } from '../store/demo';
import { useUi } from '../store/ui';
import styles from './Ticker.module.css';

export function Ticker() {
  const last = useDemo(s => s.log[0]);
  const setPop = useUi(s => s.setPop);
  const pop = useUi(s => s.pop);
  return (
    <button type="button" className={styles.ticker} data-pop-trigger aria-label="연동 로그 전체 보기" onClick={() => setPop(pop === 'log' ? null : 'log')}>
      <span className={styles.label}>연동 로그</span>
      {last && <>
        <span className={`num ${styles.time}`}>{hms(last.t)}</span>
        <span className={styles.text}>{last.text}</span>
        <span className={`api ${last.kind === 'halo' ? '' : last.kind}`}>{last.api}</span>
      </>}
    </button>
  );
}
