import { Activity, Eye, MapPin, Settings, Star } from "lucide-react";

type QuestionsAboutSidebarProps = {
  mapPointCount: number;
};

export function QuestionsAboutSidebar({
  mapPointCount,
}: QuestionsAboutSidebarProps) {
  return (
    <aside
      className="w-full shrink-0 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-sm text-[var(--gh-fg)] lg:sticky lg:top-20 lg:w-[min(100%,300px)] lg:self-start"
      aria-label="Sorular hakkında"
    >
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-[var(--gh-fg)]">
            Hakkında
          </h2>
          <button
            type="button"
            className="rounded p-1 text-[var(--gh-fg-muted)] transition-colors hover:bg-[var(--gh-canvas)] hover:text-[var(--gh-fg)]"
            aria-label="Hakkında ayarları"
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <p className="mt-3 text-[13px] italic leading-snug text-[var(--gh-fg-muted)]">
          Açıklama, bağlantı veya etiket eklenmedi.
        </p>
        <ul className="mt-4 flex flex-col gap-2.5">
          <li>
            <span className="flex items-center gap-2 text-[var(--gh-fg-muted)]">
              <Activity
                className="h-4 w-4 shrink-0 opacity-90"
                strokeWidth={1.75}
                aria-hidden
              />
              Etkinlik
            </span>
          </li>
          <li>
            <span className="flex items-center gap-2 text-[var(--gh-fg-muted)]">
              <Star
                className="h-4 w-4 shrink-0 opacity-90"
                strokeWidth={1.75}
                aria-hidden
              />
              0 yıldız
            </span>
          </li>
          <li>
            <span className="flex items-center gap-2 text-[var(--gh-fg-muted)]">
              <Eye
                className="h-4 w-4 shrink-0 opacity-90"
                strokeWidth={1.75}
                aria-hidden
              />
              0 izleyen
            </span>
          </li>
          <li>
            <span className="flex items-center gap-2 text-[var(--gh-fg-muted)]">
              <MapPin
                className="h-4 w-4 shrink-0 opacity-90"
                strokeWidth={1.75}
                aria-hidden
              />
              {mapPointCount} harita noktası
            </span>
          </li>
        </ul>
      </div>

      <div className="border-t border-[var(--gh-border)] px-4 py-4">
        <h2 className="text-base font-semibold text-[var(--gh-fg)]">
          Sürümler
        </h2>
        <p className="mt-2 text-[13px] text-[var(--gh-fg-muted)]">
          Yayınlanmış sürüm yok.
        </p>
        <button
          type="button"
          className="mt-2 text-left text-[13px] font-medium text-[var(--gh-accent)] underline decoration-[var(--gh-accent)] underline-offset-2 hover:opacity-90"
        >
          Yeni sürüm oluştur
        </button>
      </div>

      <div className="border-t border-[var(--gh-border)] px-4 py-4">
        <h2 className="text-base font-semibold text-[var(--gh-fg)]">
          Paketler
        </h2>
        <p className="mt-2 text-[13px] text-[var(--gh-fg-muted)]">
          Yayınlanmış paket yok.
        </p>
      </div>
    </aside>
  );
}
