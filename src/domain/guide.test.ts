import { describe, expect, it } from 'vitest';
import { seed } from '../data/seed';
import { guideSteps } from './guide';

describe('guideSteps', () => {
  it('처음에는 모두 미완료', () => {
    const steps = guideSteps(seed(new Date()));
    expect(steps).toHaveLength(6);
    expect(steps.every(s => !s.done)).toBe(true);
  });
  it('네일 게시와 상세 보기 후 앞 두 단계 완료', () => {
    const s = seed(new Date());
    s.listings.SP_NAIL.status = 'PUBLISHED';
    s.flags.viewedNail = true;
    expect(guideSteps(s).map(x => x.done)).toEqual([true, true, false, false, false, false]);
  });
});
