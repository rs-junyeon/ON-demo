import { useEffect, useRef } from 'react';
import { CHECKS, type CheckId } from '../data/checks';
import { hms } from '../domain/format';
import { guideSteps } from '../domain/guide';
import { useDemo } from '../store/demo';
import { useUi, type Pop } from '../store/ui';
import styles from './Popovers.module.css';

const LABEL: Record<Pop, string> = { guide: '시연 가이드', checks: '확인 필요', log: '연동 로그' };

export function Popovers() {
  const pop = useUi(s => s.pop);
  const focus = useUi(s => s.popFocus);
  const setPop = useUi(s => s.setPop);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pop) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null); };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Element;
      if (ref.current?.contains(t) || t.closest?.('[data-pop-trigger]')) return;
      setPop(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown); };
  }, [pop, setPop]);

  useEffect(() => {
    if (focus) ref.current?.querySelector('[aria-current="true"]')?.scrollIntoView?.({ block: 'nearest' });
  }, [focus]);

  if (!pop) return null;
  return (
    <div ref={ref} className={styles.pop} role="dialog" aria-label={LABEL[pop]}>
      <button type="button" className={styles.close} onClick={() => setPop(null)} aria-label="닫기">×</button>
      {pop === 'guide' && <Guide />}
      {pop === 'checks' && <Checks focus={focus} />}
      {pop === 'log' && <Log />}
    </div>
  );
}

function Guide() {
  const steps = guideSteps(useDemo());
  const next = steps.findIndex(s => !s.done);
  return (
    <>
      <h3>시연 가이드</h3>
      <p className={styles.lead}>이 순서대로 누르면 ON의 흐름을 5분 안에 보여 줄 수 있어요. 끝낸 단계는 자동으로 체크돼요.</p>
      <ol className={styles.steps}>
        {steps.map((s, i) => <li key={s.text} className={s.done ? styles.done : i === next ? styles.next : ''}><span>{s.text}</span></li>)}
      </ol>
    </>
  );
}

function Checks({ focus }: { focus: CheckId | null }) {
  return (
    <>
      <h3>확인 필요</h3>
      <p className={styles.lead}>Swagger와 기존 자료로는 답할 수 없어서 담당자에게 물어볼 질문이에요. 화면의 노란 배지와 번호가 같아요.</p>
      <ul className={styles.checks}>
        {(Object.keys(CHECKS).map(Number) as CheckId[]).map(id => (
          <li key={id} aria-current={focus === id ? 'true' : undefined} className={focus === id ? styles.hl : ''}>
            <div className={styles.q}><i>{id}</i>{CHECKS[id].title}</div>
            <p>{CHECKS[id].body}</p>
            <div className={styles.who}>문의 대상: {CHECKS[id].who}</div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Log() {
  const log = useDemo(s => s.log);
  return (
    <>
      <h3>연동 로그</h3>
      <p className={styles.lead}>실제로 연동한다면 호출됐을 API예요. 데모는 샘플 데이터로만 동작해요.</p>
      <ul className={styles.logs}>
        {log.map((e, i) => (
          <li key={`${e.t}-${i}`}><span className={styles.t}>{hms(e.t)}</span><div>{e.text}<br /><span className={`api ${e.kind === 'halo' ? '' : e.kind}`}>{e.api}</span></div></li>
        ))}
      </ul>
    </>
  );
}
