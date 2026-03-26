import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-markdown-preview/markdown.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { cn } from '../utils/cn';

const mdPlugins = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
};

/** $ yoksa ve `\komut` varsa tamamını blok matematik say (API düz LaTeX döndüğünde). */
function normalizeMathSource(raw: string): string {
  const s = raw.trim();
  if (!s) return s;
  if (/\$/.test(s)) return s;
  if (/\\\(|\\\[/.test(s)) return s;
  if (/\\[a-zA-Z]/.test(s)) return `$$${s}$$`;
  return s;
}

type QuestionLatexMarkdownProps = {
  source: string;
  colorMode: 'dark' | 'light';
  className?: string;
};

/**
 * Soru / şık metni: Markdown + $...$ / $$...$$ LaTeX (KaTeX).
 */
export function QuestionLatexMarkdown({ source, colorMode, className }: QuestionLatexMarkdownProps) {
  const s = normalizeMathSource(source);
  if (!s.trim()) return null;
  return (
    <div data-color-mode={colorMode} className={cn('text-[var(--gh-fg)]', className)}>
      <MarkdownPreview
        source={s.trim()}
        {...mdPlugins}
        className="wmde-markdown wmde-markdown-var !bg-transparent !p-0"
        wrapperElement={{ 'data-color-mode': colorMode }}
      />
    </div>
  );
}
