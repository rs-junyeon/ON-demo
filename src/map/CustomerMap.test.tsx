import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEONGSU } from '../domain/geo';

const fakeMap = vi.hoisted(() => ({
  relayout: vi.fn(), setCenter: vi.fn(), panTo: vi.fn(),
  getBounds: () => ({ getSouthWest: () => ({ getLat: () => 37.54, getLng: () => 127.05 }), getNorthEast: () => ({ getLat: () => 37.55, getLng: () => 127.06 }) }),
}));
const handlers = vi.hoisted(() => ({} as Record<string, ((m: unknown) => void) | undefined>));
vi.mock('react-kakao-maps-sdk', async () => {
  const { useEffect } = await import('react');
  return {
    Map: ({ onCreate, children, ...rest }: { onCreate(m: unknown): void; children: ReactNode } & Record<string, unknown>) => {
      useEffect(() => { onCreate(fakeMap); }, [onCreate]);
      Object.assign(handlers, rest);
      return <div data-testid="map">{children}</div>;
    },
    CustomOverlayMap: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('CustomerMap', () => {
  it('숨겨졌다가 크기가 바뀌면 지도를 다시 배치하고 중심을 맞춘다', async () => {
    let fire: () => void = () => {};
    vi.stubGlobal('ResizeObserver', class { constructor(cb: () => void) { fire = cb; } observe() {} disconnect() {} });
    vi.stubGlobal('kakao', { maps: { LatLng: class { constructor(public lat: number, public lng: number) {} } } });
    const { CustomerMap } = await import('./CustomerMap');
    render(<CustomerMap listings={[]} labels={{}} selectedCode={null} justPublished={null} origin={SEONGSU} onSelect={() => {}} onBoundsChange={() => {}} />);
    fire();
    expect(fakeMap.relayout).toHaveBeenCalled();
    expect(fakeMap.setCenter).toHaveBeenCalled();
  });

  it('드래그를 시작한 뒤의 idle에서만 지도 범위를 알린다 (idle이 dragend보다 먼저 와도)', async () => {
    vi.stubGlobal('kakao', { maps: { LatLng: class { constructor(public lat: number, public lng: number) {} } } });
    const { CustomerMap } = await import('./CustomerMap');
    const onBoundsChange = vi.fn();
    render(<CustomerMap listings={[]} labels={{}} selectedCode={null} justPublished={null} origin={SEONGSU} onSelect={() => {}} onBoundsChange={onBoundsChange} />);
    (handlers.onIdle as (m: unknown) => void)(fakeMap);
    expect(onBoundsChange).not.toHaveBeenCalled();
    (handlers.onDragStart as (m: unknown) => void)(fakeMap);
    (handlers.onIdle as (m: unknown) => void)(fakeMap);
    expect(onBoundsChange).toHaveBeenCalledWith({ sw: { lat: 37.54, lng: 127.05 }, ne: { lat: 37.55, lng: 127.06 } });
  });
});
