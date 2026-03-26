import type { FilteredQuestionRow } from '../../../lib/questionsApi';
import { useColorMode } from '../../../ui/hooks/useColorMode';
import { FilteredQuestionCard } from '../components/FilteredQuestionCard';

export function QuestionsMapDetailTabPanel({ row }: { row: FilteredQuestionRow | null }) {
  const colorMode = useColorMode();

  if (row == null) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] px-4 py-10 text-center text-sm text-[var(--gh-fg-muted)]">
        Soru haritasında bir noktaya tıklayarak detayı burada görebilirsiniz.
      </div>
    );
  }

  return (
    <ul className="list-none">
      <FilteredQuestionCard row={row} colorMode={colorMode} />
    </ul>
  );
}
