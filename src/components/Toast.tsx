import { useEffect, useState } from 'react';
import { useUi } from '../store/ui';
import styles from './Toast.module.css';

export function Toast() {
  const toast = useUi(s => s.toast);
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast.id);
    const t = window.setTimeout(() => setShown(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  return <div className={`${styles.toast} ${toast && shown === toast.id ? styles.show : ''}`} role="status" aria-live="polite">{toast?.text}</div>;
}
