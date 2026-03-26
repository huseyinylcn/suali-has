import { Sparkles } from 'lucide-react';
import type { FilteredQuestionRow } from '../../../lib/questionsApi';
import { Button } from '../../../ui/components/Button';
import { useColorMode } from '../../../ui/hooks/useColorMode';
import { FilteredQuestionCard } from '../components/FilteredQuestionCard';

export function QuestionsListTabPanel({
  rows,
  loading,
  onSimilarQuestions,
  similarLoadingQuestionId
}: {
  rows: FilteredQuestionRow[];
  loading: boolean;
  onSimilarQuestions: (questionId: string) => void;
  similarLoadingQuestionId: string | null;
}) {
  const colorMode = useColorMode();

  if (loading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center text-sm text-[var(--gh-fg-muted)]">
        Sorular yükleniyor…
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] px-4 py-10 text-center text-sm text-[var(--gh-fg-muted)]">
        Bu filtrelere uygun soru bulunamadı.
      </div>
    );
  }

  return (
    <ul className="flex max-h-[min(70vh,640px)] flex-col gap-3 overflow-y-auto pr-1 [-ms-overflow-style:auto] [scrollbar-gutter:stable]">
      {rows.map((row) => {
        const busy = similarLoadingQuestionId === row.question_id;
        return (
          <FilteredQuestionCard
            key={row.question_id}
            row={row}
            colorMode={colorMode}
            id={`question-list-${row.question_id}`}
            actions={
              <Button
                type="button"
                variant="secondary"
                className="h-8 gap-1.5 px-2.5 text-xs"
                disabled={busy}
                title="Benzer soruları haritada göster"
                onClick={() => onSimilarQuestions(row.question_id)}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {busy ? 'Yükleniyor…' : 'En Benzer Sorular'}
              </Button>
            }
          />
        );
      })}
    </ul>
  );
}
