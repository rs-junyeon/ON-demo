import { create } from 'zustand';
import type { CheckId } from '../data/checks';
import { SEONGSU } from '../domain/geo';
import type { Bounds, CategoryId, LatLng } from '../domain/types';

export type View = 'split' | 'admin' | 'app';
export type AdminPage = 'halo' | 'edit' | 'published' | 'stats';
export type AppScreen = 'home' | 'detail' | 'checkout' | 'done' | 'wallet' | 'coupon';
export type Pop = 'guide' | 'checks' | 'log';

type AppState = {
  screen: AppScreen; mode: 'map' | 'list'; cat: CategoryId | 'ALL'; q: string;
  selected: string | null; detail: string | null; couponId: string | null;
  walletTab: 'ACTIVE' | 'PAST'; lastIssued: string | null;
};
type AdminState = { page: AdminPage; filter: 'ALL' | 'DRAFT' | 'PUBLISHED' | 'HIDDEN'; editing: string | null };

type Ui = {
  view: View; admin: AdminState; app: AppState;
  pop: Pop | null; popFocus: CheckId | null; toast: { text: string; id: number } | null;
  origin: LatLng; bounds: Bounds | null; justPublished: string | null;
  setView(v: View): void;
  setAdmin(p: Partial<AdminState>): void;
  setApp(p: Partial<AppState>): void;
  setPop(p: Pop | null): void;
  openCheck(id: CheckId): void;
  showToast(text: string): void;
  setOrigin(o: LatLng): void;
  setBounds(b: Bounds | null): void;
  setJustPublished(code: string | null): void;
  resetUi(): void;
};

const initialAdmin: AdminState = { page: 'halo', filter: 'ALL', editing: null };
const initialApp: AppState = { screen: 'home', mode: 'map', cat: 'ALL', q: '', selected: null, detail: null, couponId: null, walletTab: 'ACTIVE', lastIssued: null };

export const useUi = create<Ui>()(set => ({
  view: 'split', admin: initialAdmin, app: initialApp,
  pop: null, popFocus: null, toast: null, origin: SEONGSU, bounds: null, justPublished: null,
  setView: view => set({ view }),
  setAdmin: p => set(s => ({ admin: { ...s.admin, ...p } })),
  setApp: p => set(s => ({ app: { ...s.app, ...p } })),
  setPop: pop => set({ pop, popFocus: null }),
  openCheck: id => set({ pop: 'checks', popFocus: id }),
  showToast: text => set(s => ({ toast: { text, id: (s.toast?.id ?? 0) + 1 } })),
  setOrigin: origin => set({ origin }),
  setBounds: bounds => set({ bounds }),
  setJustPublished: justPublished => set({ justPublished }),
  resetUi: () => set(s => ({ admin: initialAdmin, app: initialApp, pop: null, popFocus: null, origin: SEONGSU, bounds: null, justPublished: null, view: s.view })),
}));
