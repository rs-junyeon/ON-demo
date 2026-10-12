import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const loader = vi.hoisted(() => ({ result: [true, undefined] as [boolean, ErrorEvent | undefined] }));
vi.mock('react-kakao-maps-sdk', () => ({ useKakaoLoader: () => loader.result }));

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

async function renderGate() {
  const { KakaoLoader, KakaoGate } = await import('./KakaoGate');
  render(<><KakaoLoader /><KakaoGate><p>지도 본문</p></KakaoGate></>);
}

describe('KakaoGate', () => {
  it('키가 없으면 키 안내를 보여 주고 지도를 그리지 않는다', async () => {
    vi.stubEnv('VITE_KAKAO_JS_KEY', '');
    await renderGate();
    expect(screen.getByText('카카오 JavaScript 키를 .env의 VITE_KAKAO_JS_KEY에 넣어 주세요')).toBeInTheDocument();
    expect(screen.queryByText('지도 본문')).not.toBeInTheDocument();
  });
  it('SDK 로딩에 실패하면 키와 도메인 확인 안내를 보여 준다', async () => {
    vi.stubEnv('VITE_KAKAO_JS_KEY', 'test-key');
    loader.result = [false, new ErrorEvent('error')];
    await renderGate();
    expect(screen.getByText('지도를 불러오지 못했어요. 키와 등록 도메인(http://localhost:5173)을 확인해 주세요')).toBeInTheDocument();
    expect(screen.getByText('카카오 디벨로퍼스에서 카카오맵 사용 설정이 켜져 있는지도 확인해 주세요.')).toBeInTheDocument();
  });
  it('로딩이 끝나면 지도를 그린다', async () => {
    vi.stubEnv('VITE_KAKAO_JS_KEY', 'test-key');
    loader.result = [false, undefined];
    await renderGate();
    expect(await screen.findByText('지도 본문')).toBeInTheDocument();
  });
});
