import { useEffect, useRef, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import './RichTextEditorCompact.css';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ImageIcon, Loader2 } from 'lucide-react';
import { mathpixTranslate } from '../../lib/manufacturerApi';
import { cn } from '../utils/cn';

function useColorMode(): 'dark' | 'light' {
  const [mode, setMode] = useState<'dark' | 'light'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMode(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return mode;
}

export type RichTextEditorVariant = 'default' | 'compact';

interface RichTextEditorProps {
  value: string;
  onChange: (md: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  minHeight?: number;
  /** Şık alanları için: daha kısa editör, daha az yardım metni */
  variant?: RichTextEditorVariant;
  /**
   * Üst kapsayıcı flex ile yüksekliği verildiğinde: editör kalan alanı doldurur (% yükseklik).
   * Soru metni + kenar çubuğu hizası için kullanılır.
   */
  fillHeight?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Soruyu buraya yaz… (Markdown + LaTeX: $x^2$ veya $$\\frac{a}{b}$$)',
  disabled = false,
  error,
  minHeight: minHeightProp,
  variant = 'default',
  fillHeight = false,
}: RichTextEditorProps) {
  const compact = variant === 'compact';
  /** Şıklar: iki panel + boşluk için biraz daha yüksek; soru metni fillHeight’ta asgari */
  const minHeight = minHeightProp ?? (compact ? 280 : fillHeight ? 280 : 220);
  /** Şıklar: düzenleme + önizleme alt alta; textarea en az yarım yükseklik */
  const editorMinHeight = compact ? Math.max(60, Math.floor(minHeight / 2)) : undefined;
  const colorMode = useColorMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | undefined>();

  async function handleImageFile(file: File) {
    setConvertError(undefined);
    setConverting(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      const raw = await mathpixTranslate(dataUrl);
      const converted = raw
        .replace(/\\\[\s*/g, '\n$$\n')
        .replace(/\s*\\\]/g, '\n$$\n')
        .replace(/\\\(/g, '$')
        .replace(/\\\)/g, '$')
        .trim();
      onChange((value ?? '') + '\n' + converted + '\n');
    } catch (err) {
      setConvertError(err instanceof Error ? err.message : 'Çeviri başarısız oldu.');
    } finally {
      setConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const editorHeight = fillHeight && !compact ? '100%' : minHeight;
  const showDragbar = !compact && !fillHeight;

  return (
    <div
      className={cn(
        compact && 'rich-text-editor-compact',
        fillHeight && !compact ? 'flex min-h-0 flex-1 flex-col gap-1.5' : 'space-y-1.5'
      )}
    >
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || converting}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex items-center gap-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] font-medium text-[var(--gh-fg-muted)] transition-colors hover:bg-[var(--gh-border)] hover:text-[var(--gh-fg)] disabled:cursor-not-allowed disabled:opacity-50',
            compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          )}
        >
          {converting ? (
            <Loader2 className={cn(compact ? 'h-3 w-3' : 'h-3.5 w-3.5', 'animate-spin')} />
          ) : (
            <ImageIcon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          )}
          {converting ? 'Çevriliyor…' : 'Görselden LaTeX'}
        </button>
        {!compact && (
          <span className="text-[11px] text-[var(--gh-fg-muted)]">
            Formül içeren görsel yükle → LaTeX editöre eklenir
          </span>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageFile(f);
          }}
        />
      </div>

      {convertError && (
        <div className="shrink-0 rounded-md border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400">
          {convertError}
        </div>
      )}

      <div
        data-color-mode={colorMode}
        className={cn(
          'min-h-0 overflow-hidden rounded-md',
          fillHeight && !compact && 'flex min-h-[220px] flex-1 flex-col [&_.w-md-editor]:h-full [&_.w-md-editor]:min-h-0',
          error ? 'ring-1 ring-rose-500' : !compact && 'border border-[var(--gh-border)]',
          compact && '[&_.w-md-editor]:text-sm'
        )}
      >
        <MDEditor
          value={value}
          onChange={(v) => onChange(v ?? '')}
          height={editorHeight}
          minHeight={editorMinHeight ?? 100}
          preview="live"
          visibleDragbar={showDragbar}
          /** Metin ve önizleme kaydırmaları birbirine bağlanmasın */
          enableScroll={false}
          /** Şık alanı: başlık/kalın/görsel vb. araç çubuğunu kaldır — yer kazan */
          hideToolbar={compact}
          textareaProps={{ placeholder, disabled }}
          previewOptions={{
            remarkPlugins: [remarkMath],
            rehypePlugins: [rehypeKatex],
          }}
        />
      </div>

      {error && <div className="shrink-0 text-xs text-rose-600">{error}</div>}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}
