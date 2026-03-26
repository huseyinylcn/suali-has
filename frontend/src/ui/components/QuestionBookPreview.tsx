import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-markdown-preview/markdown.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useColorMode } from '../hooks/useColorMode';
import { cn } from '../utils/cn';

export type QuestionBookOption = {
  letter: string;
  text: string;
  imageSrc?: string | null;
  isCorrect: boolean;
};

type QuestionBookPreviewProps = {
  questionText: string;
  options: QuestionBookOption[];
  className?: string;
};

const mdPlugins = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
};

/**
 * Soru kitabı / test kitabı tarzı: soru metni + A–E şıklar.
 */
export function QuestionBookPreview({
  questionText,
  options,
  className,
}: QuestionBookPreviewProps) {
  const colorMode = useColorMode();

  return (
    <div
      className={cn(
        'mx-auto max-w-3xl rounded-xl border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-6 shadow-sm',
        className
      )}
    >
      <p className="mb-6 text-center font-serif text-xs text-[var(--gh-fg-muted)]">
        Öğrencinin göreceği soru düzeni (önizleme)
      </p>

      <div
        data-color-mode={colorMode}
        className="font-serif text-[15px] leading-relaxed text-[var(--gh-fg)]"
      >
        {questionText.trim().length > 0 ? (
          <MarkdownPreview
            source={questionText}
            {...mdPlugins}
            className="wmde-markdown wmde-markdown-var !bg-transparent !p-0"
            wrapperElement={{ 'data-color-mode': colorMode }}
          />
        ) : (
          <p className="text-center text-sm italic text-[var(--gh-fg-muted)]">Soru metni henüz yok.</p>
        )}
      </div>

      <div className="mt-8 border-t border-[var(--gh-border)] pt-6">
        <p className="mb-4 font-serif text-xs font-semibold uppercase tracking-wide text-[var(--gh-fg-muted)]">
          Seçenekler
        </p>
        <ol className="space-y-3 font-serif">
          {options.map((opt) => {
            const hasText = opt.text.trim().length > 0;
            const hasImg = Boolean(opt.imageSrc);
            return (
              <li
                key={opt.letter}
                className={cn(
                  'flex gap-3 rounded-lg border px-3 py-2.5',
                  opt.isCorrect
                    ? 'border-emerald-500/40 bg-emerald-500/[0.08]'
                    : 'border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums',
                    opt.isCorrect
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-[var(--gh-border)] bg-[var(--gh-canvas)] text-[var(--gh-fg)]'
                  )}
                  aria-hidden
                >
                  {opt.letter}
                </span>
                <div className="min-w-0 flex-1 space-y-2 text-[15px] leading-snug" data-color-mode={colorMode}>
                  {hasImg ? (
                    <img
                      src={opt.imageSrc!}
                      alt={`Şık ${opt.letter}`}
                      className="max-h-40 w-auto max-w-full rounded object-contain"
                    />
                  ) : null}
                  {hasText ? (
                    <MarkdownPreview
                      source={opt.text}
                      {...mdPlugins}
                      className="wmde-markdown wmde-markdown-var !bg-transparent !p-0 text-[15px] leading-snug"
                      wrapperElement={{ 'data-color-mode': colorMode }}
                    />
                  ) : null}
                  {!hasImg && !hasText ? (
                    <span className="text-sm italic text-[var(--gh-fg-muted)]">Bu şık boş.</span>
                  ) : null}
                </div>
                {opt.isCorrect ? (
                  <span className="shrink-0 self-center rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-400">
                    Doğru
                  </span>
                ) : (
                  <span className="w-10 shrink-0" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
