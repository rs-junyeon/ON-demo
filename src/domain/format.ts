const pad = (n: number) => String(n).padStart(2, '0');
const d = (v: Date | string) => new Date(v);

export const won = (n: number) => `${Number(n || 0).toLocaleString('ko-KR')}원`;
export const ymd = (v: Date | string) => { const x = d(v); return `${x.getFullYear()}.${pad(x.getMonth() + 1)}.${pad(x.getDate())}`; };
export const hm = (v: Date | string) => { const x = d(v); return `${pad(x.getHours())}:${pad(x.getMinutes())}`; };
export const hms = (v: Date | string) => { const x = d(v); return `${hm(x)}:${pad(x.getSeconds())}`; };
export const ymdCompact = (v: Date | string) => ymd(v).replaceAll('.', '');
export const maskPin = (pin: string) => `${pin.slice(0, 4)}-****-****-${pin.slice(-4)}`;
export const groupPin = (pin: string) => (pin.match(/.{1,4}/g) ?? []).join(' ');
