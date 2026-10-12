import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMapStatus } from '../map/status';
import { useDemo } from '../store/demo';
import { useUi } from '../store/ui';
import { ListingEditor } from './ListingEditor';

const geo = vi.hoisted(() => ({ results: [] as { label: string; address: string; lat: number; lng: number }[] }));
vi.mock('../map/geocode', () => ({
  searchAddress: vi.fn(async () => geo.results),
  reverseGeocode: vi.fn(async () => '서울 성동구 성수이로 99'),
}));
vi.mock('../map/PickerMap', () => ({ PickerMap: () => <div>지도 자리</div> }));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useDemo.getState().reset();
  useUi.getState().resetUi();
  useMapStatus.setState({ status: 'ready' });
  geo.results = [];
});

const publishBtn = () => screen.getByRole('button', { name: '게시하기' });

describe('ListingEditor', () => {
  it('필수값이 비어 있으면 게시할 수 없고 빠진 항목을 알려 준다', () => {
    render(<ListingEditor code="SP_NAIL" />);
    expect(publishBtn()).toBeDisabled();
    expect(screen.getByText('게시하려면 매장명, 카테고리, 지도 위치 항목을 채워 주세요')).toBeInTheDocument();
  });

  it('예시 값을 채우면 게시할 수 있고 게시하면 store에 반영된다', async () => {
    const user = userEvent.setup();
    render(<ListingEditor code="SP_NAIL" />);
    await user.click(screen.getByRole('button', { name: '예시 값 채우기' }));
    expect(publishBtn()).toBeEnabled();
    await user.click(publishBtn());
    expect(useDemo.getState().listings.SP_NAIL.status).toBe('PUBLISHED');
    expect(useUi.getState().justPublished).toBe('SP_NAIL');
  });

  it('한글 매장명을 입력한 그대로 유지한다', async () => {
    const user = userEvent.setup();
    render(<ListingEditor code="SP_NAIL" />);
    await user.type(screen.getByLabelText(/매장명/), '손끝네일 성수점');
    expect(screen.getByLabelText(/매장명/)).toHaveValue('손끝네일 성수점');
  });

  it('주소 검색 결과가 없으면 다시 찾아보라고 안내한다', async () => {
    const user = userEvent.setup();
    render(<ListingEditor code="SP_NAIL" />);
    await user.type(screen.getByLabelText('주소'), '없는 주소');
    await user.click(screen.getByRole('button', { name: '주소 검색' }));
    expect(await screen.findByText('검색 결과가 없어요. 도로명이나 건물 이름으로 다시 찾아보세요')).toBeInTheDocument();
  });

  it('주소 검색 후보를 고르면 주소와 위치가 채워진다', async () => {
    geo.results = [
      { label: '서울 성동구 성수이로 20', address: '서울 성동구 성수이로 20', lat: 37.5458, lng: 127.053 },
      { label: '서울 성동구 성수이로 22', address: '서울 성동구 성수이로 22', lat: 37.546, lng: 127.0532 },
    ];
    const user = userEvent.setup();
    render(<ListingEditor code="SP_NAIL" />);
    await user.type(screen.getByLabelText('주소'), '성수이로 20');
    await user.click(screen.getByRole('button', { name: '주소 검색' }));
    const list = await screen.findByRole('list', { name: '주소 검색 결과' });
    await user.click(within(list).getByRole('button', { name: /성수이로 22/ }));
    expect(screen.getByLabelText('주소')).toHaveValue('서울 성동구 성수이로 22');
    expect(screen.queryByText('게시하려면 매장명, 카테고리, 지도 위치 항목을 채워 주세요')).not.toBeInTheDocument();
    expect(screen.getByText('게시하려면 매장명, 카테고리 항목을 채워 주세요')).toBeInTheDocument();
  });

  it('지도가 준비되지 않았으면 Enter로도 주소 검색을 하지 않는다', async () => {
    const { searchAddress } = await import('../map/geocode');
    useMapStatus.setState({ status: 'error' });
    const user = userEvent.setup();
    render(<ListingEditor code="SP_NAIL" />);
    await user.type(screen.getByLabelText('주소'), '성수이로 20{Enter}');
    expect(searchAddress).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '주소 검색' })).toHaveTextContent('검색');
  });

  it('게시 중 상품은 필수값을 지우면 저장할 수 없다', async () => {
    const user = userEvent.setup();
    render(<ListingEditor code="SP_COFFEE" />);
    await user.clear(screen.getByLabelText(/매장명/));
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });
});
