import { CHECKS, type CheckId } from '../data/checks';
import { useUi } from '../store/ui';

export function CheckBadge({ id }: { id: CheckId }) {
  const openCheck = useUi(s => s.openCheck);
  return (
    <button type="button" className="check" data-pop-trigger aria-label={`확인 필요 ${id}: ${CHECKS[id].title}`}
      onClick={e => { e.stopPropagation(); openCheck(id); }}>
      확인 필요 {id}
    </button>
  );
}
