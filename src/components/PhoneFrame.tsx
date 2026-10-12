import { useEffect, useState, type ReactNode } from 'react';
import { hm } from '../domain/format';
import styles from './PhoneFrame.module.css';

export function PhoneFrame({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = window.setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return (
    <section aria-label="고객 웹앱">
      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.status}><span>{hm(now).replace(/^0/, '')}</span><span className={styles.icons} aria-hidden="true">▂▄▆ ◔</span></div>
          {children}
        </div>
      </div>
      <p className={styles.caption}>고객 웹앱 (모바일)</p>
    </section>
  );
}
