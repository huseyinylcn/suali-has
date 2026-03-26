import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Layers2,
  ListTree,
  Tags,
  X,
} from "lucide-react";
import { Button } from "../../ui/components/Button";
import { Card, CardBody } from "../../ui/components/Card";
import { Input } from "../../ui/components/Input";
import { cn } from "../../ui/utils/cn";
import { QUESTIONS_TABS, type QuestionsTabId } from "./questions.types";
import {
  examTypesGet,
  microSubTopicsGet,
  skillTypesGet,
  subjectsGet,
  subTopicsGet,
} from "../../lib/manufacturerApi";
import {
  extractFilteredQuestionRows,
  extractMapPointsFromResultData,
  questionsFilteredDataGet,
  similarQuestionsPost,
  type FilteredQuestionRow,
  type MapPoint3D,
} from "../../lib/questionsApi";
import { QuestionsAboutSidebar } from "./QuestionsAboutSidebar";
import { QuestionsListTabPanel } from "./tabs/QuestionsListTabPanel";
import { QuestionsMapDetailTabPanel } from "./tabs/QuestionsMapDetailTabPanel";
import { QuestionsMapTabPanel } from "./tabs/QuestionsMapTabPanel";

type FilterMultiSelectOption = { value: string; label: string };

function stringListToOptions(
  list: readonly string[],
): FilterMultiSelectOption[] {
  return list.map((s) => ({ value: s, label: s }));
}

function TabPanel({
  active,
  id,
  children,
}: {
  active: QuestionsTabId;
  id: QuestionsTabId;
  children: ReactNode;
}) {
  const isActive = active === id;
  return (
    <div
      role="tabpanel"
      id={`questions-tab-${id}`}
      aria-labelledby={`questions-tab-btn-${id}`}
      hidden={!isActive}
      aria-hidden={!isActive}
      className={cn(!isActive && "hidden")}
    >
      {children}
    </div>
  );
}

type FilterAppliedSnapshot = {
  exam_type_id: string[];
  subject_id: string[];
  sub_topic_id: string[];
  micro_sub_topic_id: string[];
  /** yyyy-MM-dd veya seçilmediyse null */
  beginning: string | null;
  /** yyyy-MM-dd veya seçilmediyse null */
  finish: string | null;
  skill_type_id: string[];
  amount: string;
};

const INITIAL_FILTER_SNAPSHOT: FilterAppliedSnapshot = {
  exam_type_id: [],
  subject_id: [],
  sub_topic_id: [],
  micro_sub_topic_id: [],
  beginning: null,
  finish: null,
  skill_type_id: [],
  amount: "100000",
};

function cloneFilterSnapshot(s: FilterAppliedSnapshot): FilterAppliedSnapshot {
  return {
    exam_type_id: [...s.exam_type_id],
    subject_id: [...s.subject_id],
    sub_topic_id: [...s.sub_topic_id],
    micro_sub_topic_id: [...s.micro_sub_topic_id],
    beginning: s.beginning,
    finish: s.finish,
    skill_type_id: [...s.skill_type_id],
    amount: s.amount,
  };
}

function strArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

function snapshotsEqual(a: FilterAppliedSnapshot, b: FilterAppliedSnapshot) {
  return (
    strArraysEqual(a.exam_type_id, b.exam_type_id) &&
    strArraysEqual(a.subject_id, b.subject_id) &&
    strArraysEqual(a.sub_topic_id, b.sub_topic_id) &&
    strArraysEqual(a.micro_sub_topic_id, b.micro_sub_topic_id) &&
    a.beginning === b.beginning &&
    a.finish === b.finish &&
    strArraysEqual(a.skill_type_id, b.skill_type_id) &&
    a.amount === b.amount
  );
}

function PendingApplyButton({
  show,
  onClick,
}: {
  show: boolean;
  onClick: () => void;
}) {
  if (!show) return null;
  return (
    <Button
      type="button"
      variant="primary"
      className="shrink-0 whitespace-nowrap"
      onClick={onClick}
    >
      Değişiklikleri uygula
    </Button>
  );
}

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium leading-tight text-[var(--gh-fg-muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}

/** GitHub tarzı buton + açılır çoklu seçim (checkbox) */
function GhFilterMultiSelect({
  menuKey,
  openMenuKey,
  setOpenMenuKey,
  "aria-label": ariaLabel,
  values,
  onChange,
  options,
  icon: Icon,
  stretch,
}: {
  menuKey: string;
  openMenuKey: string | null;
  setOpenMenuKey: (k: string | null) => void;
  "aria-label": string;
  values: string[];
  onChange: (v: string[]) => void;
  options: readonly FilterMultiSelectOption[];
  icon: LucideIcon;
  /** Modal vb. için tetikleyiciyi satır genişliğine yay */
  stretch?: boolean;
}) {
  const open = openMenuKey === menuKey;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenuKey(null);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, setOpenMenuKey]);

  const summary =
    values.length === 0
      ? "Hepsi"
      : values.length === 1
        ? (options.find((o) => o.value === values[0])?.label ?? values[0])
        : `${values.length} seçili`;

  function toggleOption(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((x) => x !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex shrink-0", stretch && "w-full")}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpenMenuKey(open ? null : menuKey)}
        className={cn(
          "relative inline-flex h-8 min-w-[8.5rem] max-w-[14rem] items-center rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] py-0 pl-9 pr-8 text-left shadow-sm",
          stretch && "w-full max-w-none",
          "text-sm font-semibold leading-none text-[var(--gh-fg)] transition-colors hover:bg-[var(--gh-canvas)]",
          open &&
            "border-[var(--gh-accent)] ring-2 ring-[var(--gh-accent)] ring-offset-2 ring-offset-[var(--gh-canvas)]",
        )}
      >
        <Icon
          className="pointer-events-none absolute left-2.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[var(--gh-fg-muted)]"
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate pl-0 pr-1">{summary}</span>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--gh-fg-muted)] opacity-90"
          strokeWidth={2.25}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          aria-multiselectable="true"
          className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-full max-h-56 overflow-y-auto rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] py-1 shadow-lg"
        >
          {options.map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <li key={opt.value} role="option" aria-selected={checked}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-subtle)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(opt.value)}
                    className="h-3.5 w-3.5 shrink-0 rounded border-[var(--gh-border)]"
                  />
                  <span className="select-none">{opt.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const ADV_MENU_SKILL_TYPE_ID = "adv-skill_type_id";

function AdvancedSettingsModal({
  open,
  onClose,
  beginning,
  set_beginning,
  finish,
  set_finish,
  skill_type_id,
  set_skill_type_id,
  skill_type_id_options,
  amount,
  set_amount,
  showApplyButton,
  onApplyFilters,
}: {
  open: boolean;
  onClose: () => void;
  beginning: string | null;
  set_beginning: (v: string | null) => void;
  finish: string | null;
  set_finish: (v: string | null) => void;
  skill_type_id: string[];
  set_skill_type_id: (v: string[]) => void;
  skill_type_id_options: FilterMultiSelectOption[];
  amount: string;
  set_amount: (v: string) => void;
  showApplyButton: boolean;
  onApplyFilters: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [openAdvMenu, setOpenAdvMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setOpenAdvMenu(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adv-settings-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 dark:bg-black/55"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="relative z-[1] w-full max-w-md overflow-visible rounded-lg border border-[var(--gh-border)] bg-[var(--gh-canvas)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--gh-border)] px-4 py-3">
          <h2
            id="adv-settings-title"
            className="text-base font-semibold text-[var(--gh-fg)]"
          >
            Gelişmiş ayarlar
          </h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--gh-fg-muted)] hover:bg-[var(--gh-canvas-subtle)] hover:text-[var(--gh-fg)]"
            aria-label="Kapat"
            onClick={onClose}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="space-y-4 overflow-visible p-4">
          <LabeledField label="Başlangıç">
            <Input
              type="date"
              value={beginning ?? ""}
              onChange={(e) =>
                set_beginning(e.target.value === "" ? null : e.target.value)
              }
            />
          </LabeledField>
          <LabeledField label="Bitiş">
            <Input
              type="date"
              value={finish ?? ""}
              onChange={(e) =>
                set_finish(e.target.value === "" ? null : e.target.value)
              }
            />
          </LabeledField>
          <LabeledField label="Beceri türü">
            <GhFilterMultiSelect
              menuKey={ADV_MENU_SKILL_TYPE_ID}
              openMenuKey={openAdvMenu}
              setOpenMenuKey={setOpenAdvMenu}
              aria-label="Beceri türü (çoklu seçim)"
              values={skill_type_id}
              onChange={set_skill_type_id}
              options={skill_type_id_options}
              icon={Tags}
              stretch
            />
          </LabeledField>
          <LabeledField label="Top gelen veri">
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => set_amount(e.target.value)}
            />
          </LabeledField>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--gh-border)] px-4 py-3">
          <PendingApplyButton show={showApplyButton} onClick={onApplyFilters} />
          <Button type="button" variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  );
}

export function QuestionsPage() {
  const [tab, setTab] = useState<QuestionsTabId>("list");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const [examTypes, setExamTypes] = useState<
    Awaited<ReturnType<typeof examTypesGet>>
  >([]);
  const [subjects, setSubjects] = useState<
    Awaited<ReturnType<typeof subjectsGet>>
  >([]);
  const [subTopics, setSubTopics] = useState<
    Awaited<ReturnType<typeof subTopicsGet>>
  >([]);
  const [microSubTopics, setMicroSubTopics] = useState<
    Awaited<ReturnType<typeof microSubTopicsGet>>
  >([]);
  const [skillTypes, setSkillTypes] = useState<
    Awaited<ReturnType<typeof skillTypesGet>>
  >([]);

  const [exam_type_id, set_exam_type_id] = useState<string[]>(() => [
    ...INITIAL_FILTER_SNAPSHOT.exam_type_id,
  ]);
  const [subject_id, set_subject_id] = useState<string[]>(() => [
    ...INITIAL_FILTER_SNAPSHOT.subject_id,
  ]);
  const [sub_topic_id, set_sub_topic_id] = useState<string[]>(() => [
    ...INITIAL_FILTER_SNAPSHOT.sub_topic_id,
  ]);
  const [micro_sub_topic_id, set_micro_sub_topic_id] = useState<string[]>(
    () => [...INITIAL_FILTER_SNAPSHOT.micro_sub_topic_id],
  );

  const [adv_beginning, set_adv_beginning] = useState<string | null>(
    INITIAL_FILTER_SNAPSHOT.beginning,
  );
  const [adv_finish, set_adv_finish] = useState<string | null>(
    INITIAL_FILTER_SNAPSHOT.finish,
  );
  const [adv_skill_type_id, set_adv_skill_type_id] = useState<string[]>(() => [
    ...INITIAL_FILTER_SNAPSHOT.skill_type_id,
  ]);
  const [adv_amount, set_adv_amount] = useState(INITIAL_FILTER_SNAPSHOT.amount);

  const [appliedFilters, setAppliedFilters] = useState<FilterAppliedSnapshot>(
    () => cloneFilterSnapshot(INITIAL_FILTER_SNAPSHOT),
  );
  const [mapPoints, setMapPoints] = useState<MapPoint3D[]>([]);
  const [mapSimilarRows, setMapSimilarRows] = useState<FilteredQuestionRow[]>(
    [],
  );
  const [filteredRows, setFilteredRows] = useState<FilteredQuestionRow[]>([]);
  const [filteredLoading, setFilteredLoading] = useState(true);
  const [selectedMapQuestionId, setSelectedMapQuestionId] = useState<
    string | null
  >(null);
  const [similarLoadingQuestionId, setSimilarLoadingQuestionId] = useState<
    string | null
  >(null);

  const ingestFilteredData = useCallback((data: unknown) => {
    setFilteredRows(extractFilteredQuestionRows(data));
    setMapPoints([]);
    setMapSimilarRows([]);
    setSelectedMapQuestionId(null);
  }, []);

  const runFilteredDataFetch = useCallback(
    (filters: FilterAppliedSnapshot) => {
      setFilteredLoading(true);
      void questionsFilteredDataGet(filters)
        .then((data) => {
          console.log("Filtrelenmiş soru verisi", data);
          ingestFilteredData(data);
        })
        .catch((err) => console.error("filtered-data isteği başarısız", err))
        .finally(() => setFilteredLoading(false));
    },
    [ingestFilteredData],
  );

  const currentFilters = useMemo(
    () =>
      cloneFilterSnapshot({
        exam_type_id,
        subject_id,
        sub_topic_id,
        micro_sub_topic_id,
        beginning: adv_beginning,
        finish: adv_finish,
        skill_type_id: adv_skill_type_id,
        amount: adv_amount,
      }),
    [
      exam_type_id,
      subject_id,
      sub_topic_id,
      micro_sub_topic_id,
      adv_beginning,
      adv_finish,
      adv_skill_type_id,
      adv_amount,
    ],
  );

  const hasPendingFilterChanges = useMemo(
    () => !snapshotsEqual(currentFilters, appliedFilters),
    [currentFilters, appliedFilters],
  );

  const applyFilterChanges = useCallback(() => {
    const applied = cloneFilterSnapshot(currentFilters);
    console.log("Uygulanan filtre seçenekleri", applied);
    setAppliedFilters(applied);
    runFilteredDataFetch(applied);
  }, [currentFilters, runFilteredDataFetch]);

  useEffect(() => {
    let cancelled = false;
    setFilteredLoading(true);
    questionsFilteredDataGet(cloneFilterSnapshot(INITIAL_FILTER_SNAPSHOT))
      .then((data) => {
        if (cancelled) return;
        console.log("Filtrelenmiş soru verisi (ilk yükleme)", data);
        ingestFilteredData(data);
      })
      .catch((err) => {
        if (!cancelled)
          console.error("filtered-data isteği başarısız (ilk yükleme)", err);
      })
      .finally(() => {
        if (!cancelled) setFilteredLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ingestFilteredData]);

  const mapPointSummaries = useMemo(() => {
    const rec: Record<string, string> = {};
    for (const row of mapSimilarRows) {
      const plain = row.question_text
        .replace(/\$/g, " ")
        .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const preview =
        plain.length > 72 ? `${plain.slice(0, 72)}…` : plain || "—";
      rec[row.question_id] = `${row.question_id}\n${row.subject_name}\n${preview}`;
    }
    return rec;
  }, [mapSimilarRows]);

  const loadSimilarQuestionsOnMap = useCallback((questionId: string) => {
    setSimilarLoadingQuestionId(questionId);
    void similarQuestionsPost([questionId])
      .then((data) => {
        const rows = extractFilteredQuestionRows(data);
        const points = extractMapPointsFromResultData(data);
        setMapSimilarRows(rows);
        setMapPoints(points);
        setSelectedMapQuestionId(null);
        setTab("map");
      })
      .catch((err) =>
        console.error("similar-question isteği başarısız", err),
      )
      .finally(() => setSimilarLoadingQuestionId(null));
  }, []);

  const handleMapQuestionSelect = useCallback((id: string | null) => {
    setSelectedMapQuestionId(id);
    if (id != null) setTab("mapDetail");
  }, []);

  const selectedMapDetailRow = useMemo(() => {
    if (selectedMapQuestionId == null) return null;
    return (
      mapSimilarRows.find((r) => r.question_id === selectedMapQuestionId) ??
      null
    );
  }, [mapSimilarRows, selectedMapQuestionId]);

  const exam_type_id_options = useMemo<FilterMultiSelectOption[]>(
    () =>
      examTypes.map((t) => ({
        value: String(t.exam_type_id),
        label: t.exam_type_name,
      })),
    [examTypes],
  );

  const subject_id_options = useMemo<FilterMultiSelectOption[]>(
    () =>
      subjects.map((s) => ({
        value: String(s.subject_id),
        label: s.subject_name,
      })),
    [subjects],
  );

  const sub_topic_id_options = useMemo<FilterMultiSelectOption[]>(
    () =>
      subTopics.map((st) => ({
        value: String(st.sub_topic_id),
        label: st.sub_topic_name,
      })),
    [subTopics],
  );

  const micro_sub_topic_id_options = useMemo<FilterMultiSelectOption[]>(
    () =>
      microSubTopics.map((m) => ({
        value: String(m.micro_sub_topic_id),
        label: m.micro_sub_topic_name,
      })),
    [microSubTopics],
  );

  const skill_type_id_options = useMemo<FilterMultiSelectOption[]>(
    () =>
      skillTypes.map((sk) => ({
        value: String(sk.skill_type_id),
        label: sk.skill_type_name,
      })),
    [skillTypes],
  );

  useEffect(() => {
    let cancelled = false;
    examTypesGet()
      .then((list) => {
        if (!cancelled) setExamTypes(list);
      })
      .catch(() => {
        if (!cancelled) setExamTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    subjectsGet()
      .then((list) => {
        if (!cancelled) setSubjects(list);
      })
      .catch(() => {
        if (!cancelled) setSubjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    subTopicsGet(null)
      .then((list) => {
        if (!cancelled) setSubTopics(list);
      })
      .catch(() => {
        if (!cancelled) setSubTopics([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    microSubTopicsGet(null)
      .then((list) => {
        if (!cancelled) setMicroSubTopics(list);
      })
      .catch(() => {
        if (!cancelled) setMicroSubTopics([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    skillTypesGet()
      .then((list) => {
        if (!cancelled) setSkillTypes(list);
      })
      .catch(() => {
        if (!cancelled) setSkillTypes([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function openAdvanced() {
    setOpenFilter(null);
    setAdvancedOpen(true);
  }

  return (
    <div className="flex w-full flex-col">
      <div className="-mt-2 w-full shrink-0 md:-mt-4">
        <div
          className="sticky top-14 z-30 w-full border-b border-[var(--gh-navbar-border)] bg-[var(--gh-navbar)] md:ml-[calc(50%-50vw)] md:w-screen md:max-w-[100vw]"
          role="presentation"
        >
          <nav
            className="flex min-h-0 items-center gap-0 overflow-x-auto px-3 [-ms-overflow-style:none] [scrollbar-width:none] md:px-[40px] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Sorular sekmeleri"
          >
            {QUESTIONS_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`questions-tab-btn-${id}`}
                aria-selected={tab === id}
                aria-controls={`questions-tab-${id}`}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 border-b-[3px] border-transparent px-2.5 py-2 text-sm font-medium transition-colors md:px-3",
                  tab === id
                    ? "border-[var(--gh-tab-underline)] text-[var(--gh-navbar-fg)]"
                    : "text-[var(--gh-navbar-fg-muted)] hover:text-[var(--gh-navbar-fg)]",
                )}
                onClick={() => setTab(id)}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-3 pb-8 pt-4 md:px-0 lg:max-w-7xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <div className="min-w-0 flex-1">
            <div
              className="flex flex-wrap items-end justify-between gap-x-2 gap-y-3 pb-3 md:gap-x-3"
              role="group"
              aria-label="Soru listesi filtreleri"
            >
              <LabeledField label="Sınav tipi">
                <GhFilterMultiSelect
                  menuKey="exam_type_id"
                  openMenuKey={openFilter}
                  setOpenMenuKey={setOpenFilter}
                  aria-label="Sınav tipi (çoklu seçim)"
                  values={exam_type_id}
                  onChange={set_exam_type_id}
                  options={exam_type_id_options}
                  icon={GraduationCap}
                />
              </LabeledField>

              <div className="flex flex-wrap items-end justify-end gap-2 md:gap-3">
                <LabeledField label="Ders">
                  <GhFilterMultiSelect
                    menuKey="subject_id"
                    openMenuKey={openFilter}
                    setOpenMenuKey={setOpenFilter}
                    aria-label="Ders (çoklu seçim)"
                    values={subject_id}
                    onChange={set_subject_id}
                    options={subject_id_options}
                    icon={BookOpen}
                  />
                </LabeledField>
                <LabeledField label="Konu">
                  <GhFilterMultiSelect
                    menuKey="sub_topic_id"
                    openMenuKey={openFilter}
                    setOpenMenuKey={setOpenFilter}
                    aria-label="Konu (çoklu seçim)"
                    values={sub_topic_id}
                    onChange={set_sub_topic_id}
                    options={sub_topic_id_options}
                    icon={ListTree}
                  />
                </LabeledField>
                <LabeledField label="Alt konu">
                  <GhFilterMultiSelect
                    menuKey="micro_sub_topic_id"
                    openMenuKey={openFilter}
                    setOpenMenuKey={setOpenFilter}
                    aria-label="Alt konu (çoklu seçim)"
                    values={micro_sub_topic_id}
                    onChange={set_micro_sub_topic_id}
                    options={micro_sub_topic_id_options}
                    icon={Layers2}
                  />
                </LabeledField>
                <div className="flex flex-col gap-1 self-end">
                  <span className="min-h-[15px] shrink-0" aria-hidden />
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="shrink-0 whitespace-nowrap"
                      onClick={openAdvanced}
                    >
                      Gelişmiş ayarlar
                    </Button>
                    <PendingApplyButton
                      show={hasPendingFilterChanges}
                      onClick={applyFilterChanges}
                    />
                  </div>
                </div>
              </div>
            </div>

            <AdvancedSettingsModal
              open={advancedOpen}
              onClose={() => setAdvancedOpen(false)}
              beginning={adv_beginning}
              set_beginning={set_adv_beginning}
              finish={adv_finish}
              set_finish={set_adv_finish}
              skill_type_id={adv_skill_type_id}
              set_skill_type_id={set_adv_skill_type_id}
              skill_type_id_options={skill_type_id_options}
              amount={adv_amount}
              set_amount={set_adv_amount}
              showApplyButton={hasPendingFilterChanges}
              onApplyFilters={applyFilterChanges}
            />

            <Card>
              <CardBody>
                <TabPanel active={tab} id="list">
                  <QuestionsListTabPanel
                    rows={filteredRows}
                    loading={filteredLoading}
                    onSimilarQuestions={loadSimilarQuestionsOnMap}
                    similarLoadingQuestionId={similarLoadingQuestionId}
                  />
                </TabPanel>
                <TabPanel active={tab} id="map">
                  <QuestionsMapTabPanel
                    points={mapPoints}
                    pointSummaries={mapPointSummaries}
                    selectedQuestionId={selectedMapQuestionId}
                    onSelectQuestionId={handleMapQuestionSelect}
                  />
                </TabPanel>
                <TabPanel active={tab} id="mapDetail">
                  <QuestionsMapDetailTabPanel row={selectedMapDetailRow} />
                </TabPanel>
              </CardBody>
            </Card>
          </div>
          <QuestionsAboutSidebar mapPointCount={mapPoints.length} />
        </div>
      </div>
    </div>
  );
}
