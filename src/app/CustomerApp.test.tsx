import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDemo } from '../store/demo';
import { useUi } from '../store/ui';
import { CustomerApp } from './CustomerApp';

const loc = vi.hoisted(() => ({ result: { kind: 'denied' } as { kind: string; origin?: { lat: number; lng: number } } }));
vi.mock('../map/KakaoGate', () => ({ KakaoGate: () => null, KakaoLoader: () => null, useKakaoReady: () => 'missing' }));
vi.mock('../map/CustomerMap', () => ({ CustomerMap: () => null }));
vi.mock('../map/useMyLocation', () => ({ useMyLocation: () => ({ locate: async () => loc.result, busy: false }) }));

beforeEach(() => {
  localStorage.clear();
  useDemo.getState().reset();
  useUi.getState().resetUi();
  useUi.getState().setApp({ mode: 'list' });
});

describe('CustomerApp', () => {
  it('무료 쿠폰을 받아 내 쿠폰에서 열고 매장 사용 처리까지 한다', async () => {
    const user = userEvent.setup();
    render(<CustomerApp />);
    await user.click(screen.getByRole('button', { name: /아메리카노 1잔/ }));
    await user.click(screen.getByRole('button', { name: '무료로 받기' }));
    expect(screen.getByText('쿠폰을 받았어요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '내 쿠폰 보기' }));
    expect(screen.getByText(/^\d{4} \d{4} \d{4} \d{4}$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '매장 사용 처리' }));
    expect(screen.getByText('사용 완료')).toBeInTheDocument();
    expect(useDemo.getState().coupons[0].status).toBe('USED');
  });

  it('Halo 월 한도를 넘으면 구매 버튼이 막힌다', () => {
    useDemo.setState({ limit: { total: 500000, used: 499000 } });
    useUi.getState().setApp({ screen: 'detail', detail: 'SP_BRUNCH' });
    render(<CustomerApp />);
    expect(screen.getByRole('button', { name: '이번 달 판매 수량이 모두 나갔어요' })).toBeDisabled();
  });

  it('지도 범위 안에 혜택이 없으면 안내하고 전체 보기로 돌아간다', async () => {
    const user = userEvent.setup();
    useUi.getState().setBounds({ sw: { lat: 0, lng: 0 }, ne: { lat: 1, lng: 1 } });
    render(<CustomerApp />);
    expect(screen.getByText('이 지역에는 혜택이 없어요')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '전체 보기' }));
    expect(screen.getByRole('button', { name: /아메리카노 1잔/ })).toBeInTheDocument();
  });

  it('위치를 못 가져오면 성수동 기준으로 보여 준다고 알린다', async () => {
    const user = userEvent.setup();
    loc.result = { kind: 'denied' };
    render(<CustomerApp />);
    await user.click(screen.getByRole('button', { name: '내 위치' }));
    expect(useUi.getState().toast?.text).toBe('위치를 가져오지 못해 성수동 기준으로 보여 드려요');
  });

  it('위치를 가져오면 내 위치 기준으로 바꾼다', async () => {
    const user = userEvent.setup();
    loc.result = { kind: 'ok', origin: { lat: 37.545, lng: 127.054 } };
    render(<CustomerApp />);
    await user.click(screen.getByRole('button', { name: '내 위치' }));
    expect(useUi.getState().origin).toEqual({ lat: 37.545, lng: 127.054 });
    expect(useUi.getState().toast?.text).toBe('내 위치 기준으로 보여 드려요');
  });

  it('유료 상품은 결제 동의 후 결제하면 발급된다', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CustomerApp />);
    await user.click(screen.getByRole('button', { name: /PT 1회 체험권/ }));
    await user.click(screen.getByRole('button', { name: '39,000원 구매하기' }));
    expect(screen.getByRole('button', { name: '39,000원 결제하기' })).toBeDisabled();
    await user.click(screen.getByLabelText(/결제에 동의해요/));
    await user.click(screen.getByRole('button', { name: '39,000원 결제하기' }));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('쿠폰을 받았어요')).toBeInTheDocument();
    expect(useDemo.getState().log.some(e => e.api === 'ON 결제')).toBe(true);
    vi.useRealTimers();
  });

  it('성수동에서 멀면 멀어서 성수동 기준이라고 알린다', async () => {
    const user = userEvent.setup();
    loc.result = { kind: 'far' };
    render(<CustomerApp />);
    await user.click(screen.getByRole('button', { name: '내 위치' }));
    expect(useUi.getState().toast?.text).toBe('지금 위치가 성수동에서 멀어서 성수동 기준으로 보여 드려요');
  });
});
