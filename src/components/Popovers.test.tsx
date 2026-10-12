import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUi } from '../store/ui';
import { CheckBadge } from './CheckBadge';
import { Popovers } from './Popovers';

beforeEach(() => useUi.getState().resetUi());

describe('확인 필요 배지', () => {
  it('배지를 누르면 확인 필요 목록이 열리고 그 번호가 강조된다', async () => {
    const user = userEvent.setup();
    render(<><CheckBadge id={5} /><Popovers /></>);
    await user.click(screen.getByRole('button', { name: /확인 필요 5/ }));
    expect(screen.getByRole('dialog', { name: '확인 필요' })).toBeInTheDocument();
    const item = screen.getByText('매장 위치와 카테고리 출처').closest('li')!;
    expect(item).toHaveAttribute('aria-current', 'true');
  });
  it('Esc로 닫힌다', async () => {
    const user = userEvent.setup();
    render(<><CheckBadge id={1} /><Popovers /></>);
    await user.click(screen.getByRole('button', { name: /확인 필요 1/ }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
