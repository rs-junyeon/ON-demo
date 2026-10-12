import { useEffect, useState } from 'react';
import { useFlow, type FlowNode } from '../store/flow';
import styles from './FlowStrip.module.css';

const NODES: { id: FlowNode; title: string; sub: string }[] = [
  { id: 'plus', title: 'PLUS', sub: '점주, 발급사' },
  { id: 'halo', title: 'Halo', sub: '중계사' },
  { id: 'on', title: 'ON', sub: '쿠폰몰' },
  { id: 'customer', title: '고객', sub: '일반 사용자' },
  { id: 'store', title: '매장', sub: 'PLUS Audit' },
];
type Mark = 'lit' | 'dashed';
const STEP = 260, GAP = 500, HOLD = 1400;
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const linkKey = (a: FlowNode, b: FlowNode) => {
  const i = NODES.findIndex(n => n.id === a), j = NODES.findIndex(n => n.id === b);
  return Math.abs(i - j) === 1 ? `${NODES[Math.min(i, j)].id}-${NODES[Math.max(i, j)].id}` : null;
};

export function FlowStrip() {
  const run = useFlow(s => s.run);
  const [marks, setMarks] = useState<Record<string, Mark>>({});

  useEffect(() => {
    if (!run) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const step = reduced() ? 0 : STEP;
    let delay = 0;
    setMarks({});
    run.paths.forEach((path, pi) => {
      const mark: Mark = run.dashedLast && pi === run.paths.length - 1 ? 'dashed' : 'lit';
      if (pi > 0) at(delay, () => setMarks({}));
      path.forEach((node, i) => at(delay + i * step, () => setMarks(m => {
        const k = i > 0 ? linkKey(path[i - 1], node) : null;
        return { ...m, [node]: mark, ...(k ? { [k]: mark } : {}) };
      })));
      delay += path.length * step + (reduced() ? 0 : GAP);
    });
    at(delay + HOLD, () => setMarks({}));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  return (
    <div className={styles.wrap} aria-label="쿠폰 생태계 흐름">
      <ol className={styles.flow}>
        {NODES.map((n, i) => (
          <li key={n.id} className={styles.item}>
            {i > 0 && <span aria-hidden="true" className={`${styles.link} ${marks[`${NODES[i - 1].id}-${n.id}`] ? styles[marks[`${NODES[i - 1].id}-${n.id}`]] : ''}`} />}
            <span className={`${styles.node} ${styles[n.id]} ${marks[n.id] ? styles[marks[n.id]] : ''}`} data-node={n.id}>
              <b>{n.title}</b><span>{n.sub}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
