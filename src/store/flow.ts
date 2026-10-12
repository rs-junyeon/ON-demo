import { create } from 'zustand';

export type FlowNode = 'plus' | 'halo' | 'on' | 'customer' | 'store';
type Run = { paths: FlowNode[][]; dashedLast: boolean; id: number };

export const useFlow = create<{ run: Run | null; play(paths: FlowNode[][], dashedLast?: boolean): void }>()(set => ({
  run: null,
  play: (paths, dashedLast = false) => set(s => ({ run: { paths, dashedLast, id: (s.run?.id ?? 0) + 1 } })),
}));
