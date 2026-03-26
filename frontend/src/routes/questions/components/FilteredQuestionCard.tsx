import type { ReactNode } from 'react';
import type { FilteredQuestionRow } from '../../../lib/questionsApi';
import { QuestionLatexMarkdown } from '../../../ui/components/QuestionLatexMarkdown';
import type { ColorMode } from '../../../ui/hooks/useColorMode';
import { cn } from '../../../ui/utils/cn';

function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center rounded-full border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] px-2 py-0.5 text-[11px] font-medium text-[var(--gh-fg-muted)]',
        className
      )}
    >
      {children}
    </span>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(d);
}

function formatCoords(c: [number, number, number] | null) {
  if (!c) return null;
  return c.map((n) => n.toFixed(2)).join(', ');
}

export function FilteredQuestionCard({
  row,
  colorMode,
  id,
  isSelected,
  actions
}: {
  row: FilteredQuestionRow;
  colorMode: ColorMode;
  id?: string;
  isSelected?: boolean;
  actions?: ReactNode;
}) {
  const coordStr = formatCoords(row.coords);
  return (
    <li
      id={id}
      className={cn(
        'scroll-mt-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] p-3 md:p-4',
        isSelected && 'ring-2 ring-[var(--gh-accent)] ring-offset-2 ring-offset-[var(--gh-canvas)]'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] leading-tight text-[var(--gh-fg-muted)] break-all">
            {row.question_id}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--gh-fg)]">{row.subject_name}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {actions}
          {row.difficulty_level != null && <Chip>Zorluk {row.difficulty_level}</Chip>}
          {row.is_active != null && (
            <Chip className={row.is_active ? 'border-[var(--gh-success)]/40 text-[var(--gh-success)]' : ''}>
              {row.is_active ? 'Aktif' : 'Pasif'}
            </Chip>
          )}
        </div>
      </div>

      {row.question_text.trim() ? (
        <div className="mt-2 min-w-0 text-sm leading-relaxed [&_.katex-display]:my-2">
          <QuestionLatexMarkdown
            source={row.question_text}
            colorMode={colorMode}
            className="[&_.wmde-markdown]:text-sm [&_.wmde-markdown]:leading-relaxed"
          />
        </div>
      ) : (
        <p className="mt-2 text-sm italic text-[var(--gh-fg-muted)]">Soru metni yok</p>
      )}

      <dl className="mt-3 grid gap-x-4 gap-y-1 text-[12px] text-[var(--gh-fg-muted)] sm:grid-cols-2">
        <div className="flex gap-1">
          <dt className="shrink-0 font-medium text-[var(--gh-fg-muted)]">Oluşturulma</dt>
          <dd className="min-w-0">{formatDate(row.created_at)}</dd>
        </div>
        {row.source_id != null && (
          <div className="flex gap-1">
            <dt className="shrink-0 font-medium">Kaynak</dt>
            <dd>{row.source_id}</dd>
          </div>
        )}
        {coordStr && (
          <div className="flex gap-1 sm:col-span-2">
            <dt className="shrink-0 font-medium">Harita (x,y,z)</dt>
            <dd className="min-w-0 font-mono text-[11px] text-[var(--gh-fg)]">{coordStr}</dd>
          </div>
        )}
      </dl>

      {(row.exam_types.length > 0 ||
        row.skill_types.length > 0 ||
        row.sub_topics.length > 0 ||
        row.micro_sub_topics.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {row.exam_types.map((t) => (
            <Chip key={`e-${t.id}`}>{t.name}</Chip>
          ))}
          {row.skill_types.map((t) => (
            <Chip key={`s-${t.id}`}>{t.name}</Chip>
          ))}
          {row.sub_topics.map((t) => (
            <Chip key={`st-${t.id}`}>Konu: {t.name}</Chip>
          ))}
          {row.micro_sub_topics.map((t) => (
            <Chip key={`m-${t.id}`}>Alt: {t.name}</Chip>
          ))}
        </div>
      )}

      {row.question_options.length > 0 && (
        <ol className="mt-3 space-y-1 border-t border-[var(--gh-border)] pt-3">
          {row.question_options.map((opt, i) => (
            <li
              key={opt.option_id}
              className={cn(
                'flex gap-2 text-[13px] leading-snug',
                opt.is_correct && '[&_.wmde-markdown]:text-[var(--gh-success)] [&_.katex]:text-[var(--gh-success)]'
              )}
            >
              <span className="w-5 shrink-0 text-[var(--gh-fg-muted)]">{i + 1}.</span>
              <div className="min-w-0 flex-1">
                {opt.option_text.trim() ? (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <QuestionLatexMarkdown
                      source={opt.option_text}
                      colorMode={colorMode}
                      className="min-w-0 flex-1 [&_.wmde-markdown]:text-[13px] [&_.wmde-markdown]:leading-snug"
                    />
                    {opt.is_correct ? (
                      <span className="shrink-0 text-[11px] font-medium text-[var(--gh-success)]">(doğru)</span>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-[var(--gh-fg-muted)]">—</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {row.objective_codes ? (
        <p className="mt-2 text-[11px] text-[var(--gh-fg-muted)]">
          <span className="font-medium">Kazanım: </span>
          {row.objective_codes}
        </p>
      ) : null}

      {row.vektor_txt ? (
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--gh-fg-muted)]" title={row.vektor_txt}>
          <span className="font-medium text-[var(--gh-fg-muted)]">Vektör metni: </span>
          {row.vektor_txt}
        </p>
      ) : null}
    </li>
  );
}
