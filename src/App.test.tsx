import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('상단 바에 브랜드와 보기 전환 버튼을 보여 준다', () => {
    render(<App />);
    expect(screen.getByText('기획 데모')).toBeInTheDocument();
    for (const name of ['나란히', '관리자', '고객 앱']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });
});
