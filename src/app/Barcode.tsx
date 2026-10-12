import s from './app.module.css';

/** 데모용 가짜 바코드. PIN 숫자로 막대 폭을 정한다 */
export function Barcode({ pin }: { pin: string }) {
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  `11${pin}11`.split('').map(Number).forEach((d, i) => {
    const w1 = 1 + (d % 3), gap = 1 + ((d + i) % 2), w2 = 1 + ((d >> 1) % 2);
    bars.push({ x, w: w1 }); x += w1 + gap;
    bars.push({ x, w: w2 }); x += w2 + 2;
  });
  return (
    <svg className={s.barcode} viewBox={`0 0 ${x} 60`} preserveAspectRatio="none" role="img" aria-label="데모용 바코드">
      {bars.map(b => <rect key={b.x} className={s.bar} x={b.x} width={b.w} height={60} />)}
    </svg>
  );
}
