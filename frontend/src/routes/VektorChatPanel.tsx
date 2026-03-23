import { useEffect, useRef, useState } from 'react';
import { SendHorizonal, Sparkles, RefreshCw } from 'lucide-react';
import {
  generateVektorText,
  type VektorChatMessage,
} from '../lib/manufacturerApi';
import { cn } from '../ui/utils/cn';

export type QuestionSnapshot = {
  ders: string;
  konu: string;
  micro_alt_konular: string;
  soru_metni: string;
  /** Şık editörlerindeki içerik (A) … B) … birleşik) */
  secenekler: string;
};

type Props = {
  /** Form'daki zorunlu alanlar dolu mu? */
  isReady: boolean;
  /** Sorulun anlık verisi — ilk istekte gönderilir */
  snapshot: QuestionSnapshot;
  /** Üretilen vektörü dışarıya ilet */
  onVektorChange: (text: string) => void;
  /** Textarea'nın mevcut değeri */
  vektorValue: string;
  onVektorInput: React.ChangeEventHandler<HTMLTextAreaElement>;
  vektorError?: string;
  disabled?: boolean;
};

export function VektorChatPanel({
  isReady,
  snapshot,
  onVektorChange,
  vektorValue,
  onVektorInput,
  vektorError,
  disabled,
}: Props) {
  const [history, setHistory] = useState<VektorChatMessage[]>([]);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isFirst = history.length === 0;

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  async function send() {
    const inst = instruction.trim() || (isFirst ? 'Bu soru için vektör metnini oluştur.' : '');
    if (!inst) return;
    setLoading(true);
    setError(undefined);

    try {
      let vectorText: string;

      if (isFirst) {
        // İlk istek — questionData gönder, history boş
        vectorText = await generateVektorText({
          questionData: snapshot,
          history: [],
          userInstruction: inst,
        });

        // Geçmişe ekle: user mesajı API'nin beklediği formatta
        const userContent =
          `İşte soru verisi:\n${JSON.stringify(snapshot)}\n\nTalimat: ${inst}`;
        setHistory([
          { role: 'user', content: userContent },
          { role: 'assistant', content: vectorText },
        ]);
      } else {
        // Sonraki istekler — questionData null, geçmiş konuşma gönder
        vectorText = await generateVektorText({
          questionData: null,
          history,
          userInstruction: inst,
        });

        setHistory((prev) => [
          ...prev,
          { role: 'user', content: inst },
          { role: 'assistant', content: vectorText },
        ]);
      }

      onVektorChange(vectorText);
      setInstruction('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // Konuşmayı sıfırla
  function reset() {
    setHistory([]);
    setInstruction('');
    setError(undefined);
    onVektorChange('');
  }

  // Kullanıcıya gösterilen mesajlar (API'nin ham formatını değil, okunabilir olanı)
  const displayMessages = history.map((m, i) => {
    if (m.role === 'user') {
      // İlk user mesajı ham JSON içeriyor — sadece instruction kısmını göster
      if (i === 0) {
        const match = m.content.match(/Talimat: (.+)$/s);
        return { ...m, display: match ? match[1] : m.content };
      }
      return { ...m, display: m.content };
    }
    return { ...m, display: m.content };
  });

  return (
    <div className="mt-4 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)]">
      {/* Başlık */}
      <div className="flex items-center justify-between border-b border-[var(--gh-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Vektör Text</span>
          {!isReady && (
            <span className="rounded-full bg-[var(--gh-canvas-subtle)] px-2 py-0.5 text-[10px] text-[var(--gh-fg-muted)] ring-1 ring-[var(--gh-border)]">
              Diğer alanları doldur
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[var(--gh-fg-muted)] hover:bg-[var(--gh-canvas-subtle)] hover:text-[var(--gh-fg)]"
          >
            <RefreshCw className="h-3 w-3" />
            Sıfırla
          </button>
        )}
      </div>

      {/* Vektor textarea */}
      <div className="p-4 pb-2">
        <textarea
          className={cn(
            'gh-scroll min-h-24 w-full resize-y rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-2 text-sm text-[var(--gh-fg)] outline-none transition-opacity placeholder:text-[var(--gh-fg-muted)] focus:ring-2 focus:ring-[var(--gh-accent)]',
            !isReady && 'cursor-not-allowed opacity-40'
          )}
          placeholder={isReady ? 'Vektör metni…' : 'Önce diğer alanları doldur'}
          disabled={!isReady || disabled}
          value={vektorValue}
          onChange={onVektorInput}
        />
        {vektorError && (
          <div className="mt-1 text-xs text-rose-500">{vektorError}</div>
        )}
      </div>

      {/* AI Chat bölümü */}
      {isReady && (
        <div className="px-4 pb-4">
          <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]">
            {/* Chat başlığı */}
            <div className="flex items-center gap-1.5 border-b border-[var(--gh-border)] px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-[var(--gh-primary)]" />
              <span className="text-xs font-medium text-[var(--gh-fg-muted)]">
                {isFirst ? 'AI ile Otomatik Oluştur' : 'Konuşmaya Devam Et'}
              </span>
            </div>

            {/* Mesaj listesi */}
            {displayMessages.length > 0 && (
              <div className="gh-scroll max-h-64 overflow-y-auto space-y-3 p-3">
                {displayMessages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex',
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                        m.role === 'user'
                          ? 'bg-[var(--gh-primary)] text-white'
                          : 'bg-[var(--gh-canvas)] text-[var(--gh-fg)] ring-1 ring-[var(--gh-border)]'
                      )}
                    >
                      {m.display}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-[var(--gh-canvas)] px-3 py-2 text-xs ring-1 ring-[var(--gh-border)]">
                      <span className="animate-pulse text-[var(--gh-fg-muted)]">Oluşturuluyor…</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>
            )}

            {/* Hata */}
            {error && (
              <div className="mx-3 mb-2 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Input alanı */}
            <div className="flex items-end gap-2 border-t border-[var(--gh-border)] p-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || disabled}
                placeholder={
                  isFirst
                    ? 'İsteğini yaz veya boş bırak (Enter\'a bas)…'
                    : 'Güncelleme isteği yaz… (Enter)'
                }
                className="gh-scroll flex-1 resize-none rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-1.5 text-sm text-[var(--gh-fg)] outline-none placeholder:text-[var(--gh-fg-muted)] focus:ring-2 focus:ring-[var(--gh-accent)] disabled:opacity-50"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || disabled}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--gh-primary)] text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
