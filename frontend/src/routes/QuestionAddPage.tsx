import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { type Resolver, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  examTypesGet,
  microSubTopicsGet,
  questionAdd,
  skillTypesGet,
  subjectsGet,
  subTopicsGet,
  uploadOptionImage,
  uploadQuestionImage,
  type QuestionAddInput
} from '../lib/manufacturerApi';
import { Alert } from '../ui/components/Alert';
import { Button } from '../ui/components/Button';
import { Card, CardBody, CardHeader } from '../ui/components/Card';
import { FilePicker } from '../ui/components/FilePicker';
import { Input } from '../ui/components/Input';
import { QuestionBookPreview } from '../ui/components/QuestionBookPreview';
import { RichTextEditor } from '../ui/components/RichTextEditor';
import { cn } from '../ui/utils/cn';
import { VektorChatPanel } from './VektorChatPanel';

/** Şık sayısı: en az 4, varsayılan 5, en fazla 12 */
const OPTION_COUNT_MIN = 4;
const OPTION_COUNT_DEFAULT = 5;
const OPTION_COUNT_MAX = 12;

function mkEmptyOptions(count: number) {
  return Array.from({ length: count }, (_, idx) => ({
    option_text: '',
    is_correct: idx === 0,
    option_image_url: ''
  }));
}

/* ── Zorluk slider bileşeni ─────────────────────────────── */
function difficultyColor(val: number): string {
  // 1→yeşil, 50→sarı, 100→kırmızı  (HSL 120→0)
  const hue = Math.round(120 - (val - 1) * 1.2121);
  return `hsl(${hue}, 80%, 45%)`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DifficultyField({ form }: { form: any }) {
  const raw = useWatch({ control: form.control, name: 'difficulty_level' });
  const val = Math.min(100, Math.max(1, Number(raw) || 1));
  const color = difficultyColor(val);
  const pct = ((val - 1) / 99) * 100;

  const trackStyle = {
    background: `linear-gradient(to right, #2da44e 0%, #d29922 50%, #f85149 100%)`,
  };

  const thumbStyle = { '--thumb-color': color } as React.CSSProperties;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--gh-fg-muted)]">Zorluk</span>
        <input
          type="number"
          min={1}
          max={100}
          className="w-16 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2 py-0.5 text-center text-sm font-semibold text-[var(--gh-fg)] outline-none focus:ring-2 focus:ring-[var(--gh-accent)]"
          {...form.register('difficulty_level')}
        />
      </div>

      <div className="relative">
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={val}
          onChange={(e) => form.setValue('difficulty_level', Number(e.target.value), { shouldValidate: true })}
          className="difficulty-slider"
          style={{ ...trackStyle, ...thumbStyle }}
        />
      </div>

      <div className="relative flex justify-between text-[10px] text-[var(--gh-fg-muted)]">
        <span>Kolay</span>
        {/* Değer balonu — slider'ın hizasında, altta */}
        <div
          className="pointer-events-none absolute -top-1 flex -translate-x-1/2 items-center justify-center"
          style={{ left: `${pct}%` }}
        >
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ background: color }}
          >
            {val}
          </span>
        </div>
        <span>Zor</span>
      </div>
    </div>
  );
}

/* ── Genel çoklu seçim picker ────────────────────────────── */
type ExamType = { exam_type_id: number; exam_type_name: string };

function MultiPicker({
  label,
  placeholder,
  options,
  loading,
  disabled,
  value,
  onChange,
  error,
  hint,
}: {
  label: string;
  placeholder: string;
  options: { id: number; name: string }[];
  loading?: boolean;
  disabled?: boolean;
  value: number[];
  onChange: (ids: number[]) => void;
  error?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setSearch(''); return; }
    setTimeout(() => searchRef.current?.focus(), 50);
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (id: number) => {
    const next = new Set(value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const selected = options.filter((o) => value.includes(o.id));
  const filtered = search.trim()
    ? options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div ref={containerRef} className="relative space-y-1">
      <div className="text-xs font-medium text-[var(--gh-fg-muted)]">{label}</div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-2.5 py-1.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="text-[var(--gh-fg-muted)]">Yükleniyor…</span>
        ) : selected.length === 0 ? (
          <span className="text-[var(--gh-fg-muted)]">{placeholder}</span>
        ) : (
          selected.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--gh-primary)] px-2 py-0.5 text-xs font-medium text-white"
            >
              {s.name}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); toggle(s.id); }}
                onKeyDown={(e) => e.key === 'Enter' && toggle(s.id)}
                className="cursor-pointer leading-none opacity-80 hover:opacity-100"
              >
                ×
              </span>
            </span>
          ))
        )}
        <span className="ml-auto shrink-0 text-[var(--gh-fg-muted)]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] shadow-lg">
          {/* Arama kutusu */}
          <div className="border-b border-[var(--gh-border)] p-2">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ara…"
              className="w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] px-2.5 py-1.5 text-sm text-[var(--gh-fg)] placeholder:text-[var(--gh-fg-muted)] outline-none focus:ring-2 focus:ring-[var(--gh-accent)]"
            />
          </div>

          {/* Seçenek listesi */}
          <div className="gh-scroll max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-[var(--gh-fg-muted)]">Sonuç bulunamadı.</div>
            ) : filtered.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--gh-canvas-subtle)]"
            >
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={value.includes(o.id)}
                onChange={() => toggle(o.id)}
              />
              <span className="text-[var(--gh-fg)]">{o.name}</span>
            </label>
          ))}
          </div>
        </div>
      )}

      {hint && !error && <div className="text-[11px] text-[var(--gh-fg-muted)]">{hint}</div>}
      {error && <div className="text-xs text-rose-500">{error}</div>}
    </div>
  );
}

function ExamTypesPicker({ options, loading, value, onChange, error }: {
  options: ExamType[]; loading: boolean; value: number[]; onChange: (ids: number[]) => void; error?: string;
}) {
  return (
    <MultiPicker
      label="Sınav Türleri"
      placeholder="Sınav türü seç…"
      options={options.map((o) => ({ id: o.exam_type_id, name: o.exam_type_name }))}
      loading={loading}
      value={value}
      onChange={onChange}
      error={error}
    />
  );
}

/* ──────────────────────────────────────────────────────── */

const optionSchema = z.object({
  option_text: z.string().min(1, 'Şık metni gerekli.'),
  is_correct: z.boolean(),
  option_image_url: z.string().default('')
});

const formSchema = z.object({
  is_active: z.boolean().default(true),
  question_text: z.string().min(5, 'Soru metni en az 5 karakter olmalı.'),
  difficulty_level: z.coerce.number().min(1).max(100).default(1),
  skill_types: z.array(z.number()).min(1, 'En az 1 beceri seç.'),
  objective_codes: z.string().default(''),
  subject_id: z.coerce.number().int().min(1, 'Ders seçmelisin.'),
  exam_types: z.array(z.number()).min(1, 'En az 1 sınav türü seç.'),
  sub_topics: z.array(z.number()).min(1, 'En az 1 alt konu seç.'),
  micro_sub_topics: z.array(z.number()).min(1, 'En az 1 micro alt konu seç.'),
  question_image_url: z.string().default(''),
  vektor_txt: z.string().min(1, 'Vektör text gerekli.'),
  question_options: z
    .array(optionSchema)
    .min(OPTION_COUNT_MIN, `En az ${OPTION_COUNT_MIN} seçenek olmalı.`)
    .max(OPTION_COUNT_MAX, `En fazla ${OPTION_COUNT_MAX} seçenek.`)
});

type FormValues = z.infer<typeof formSchema>;
type FormValuesWithFiles = FormValues & {
  question_image_file?: File;
  question_options: Array<FormValues['question_options'][number] & { option_image_file?: File }>;
};

function toApiPayload(values: FormValues): QuestionAddInput {
  return {
    is_active: values.is_active ? 'true' : 'false',
    question_text: values.question_text,
    difficulty_level: values.difficulty_level,
    skill_types: values.skill_types,
    objective_codes: values.objective_codes ?? '',
    question_options: values.question_options.map((o) => ({
      option_text: o.option_text,
      is_correct: o.is_correct ? 1 : 0
    })),
    subject_id: values.subject_id,
    exam_types: values.exam_types,
    sub_topics: values.sub_topics,
    micro_sub_topics: values.micro_sub_topics ?? [],
    vektor_txt: values.vektor_txt ?? ''
  };
}

const LS_KEY = 'sualihas-question-draft';

function loadDraft(): Partial<FormValues> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<FormValues>;
  } catch {
    return {};
  }
}

export function QuestionAddPage() {
  const [banner, setBanner] = useState<
    | { kind: 'info' | 'success' | 'danger'; title: string; description?: string }
    | undefined
  >(undefined);

  const [questionLocalPreviewUrl, setQuestionLocalPreviewUrl] = useState<string | undefined>();
  const [optionLocalPreviewUrls, setOptionLocalPreviewUrls] = useState<
    Record<number, string | undefined>
  >({});
  const [uploading, setUploading] = useState<{ question?: boolean; optionIndex?: number }>({});

  const emptyDefaults = {
    is_active: true,
    question_text: '',
    difficulty_level: 1,
    skill_types: [] as number[],
    objective_codes: '',
    subject_id: 0,
    exam_types: [] as number[],
    sub_topics: [] as number[],
    micro_sub_topics: [] as number[],
    question_image_url: '',
    vektor_txt: '',
    question_options: mkEmptyOptions(OPTION_COUNT_DEFAULT)
  };

  /** Form + önizleme URL'lerini tamamen sıfırla */
  function fullReset() {
    if (questionLocalPreviewUrl) URL.revokeObjectURL(questionLocalPreviewUrl);
    Object.values(optionLocalPreviewUrls).forEach((u) => { if (u) URL.revokeObjectURL(u); });
    setQuestionLocalPreviewUrl(undefined);
    setOptionLocalPreviewUrls({});
    form.reset(emptyDefaults);
    setBanner(undefined);
    localStorage.removeItem(LS_KEY);
  }

  const subjectsQ = useQuery({ queryKey: ['subjects'], queryFn: subjectsGet });
  const examTypesQ = useQuery({ queryKey: ['examTypes'], queryFn: examTypesGet });
  const skillTypesQ = useQuery({ queryKey: ['skillTypes'], queryFn: skillTypesGet });

  const draft = loadDraft();
  const form = useForm<FormValuesWithFiles>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValuesWithFiles>,
    defaultValues: {
      is_active: draft.is_active ?? true,
      question_text: draft.question_text ?? '',
      difficulty_level: draft.difficulty_level ?? 1,
      skill_types: draft.skill_types ?? [],
      objective_codes: draft.objective_codes ?? '',
      subject_id: draft.subject_id ?? 0,
      exam_types: draft.exam_types ?? [],
      sub_topics: draft.sub_topics ?? [],
      micro_sub_topics: draft.micro_sub_topics ?? [],
      question_image_url: draft.question_image_url ?? '',
      vektor_txt: draft.vektor_txt ?? '',
      question_options: (() => {
        const o = draft.question_options;
        if (o && o.length >= OPTION_COUNT_MIN) return o;
        return mkEmptyOptions(OPTION_COUNT_DEFAULT);
      })()
    },
    mode: 'onTouched'
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'question_options' });

  const subjectId = form.watch('subject_id');
  const selectedSubTopics = form.watch('sub_topics');

  const subTopicsQ = useQuery({
    queryKey: ['subTopics', subjectId],
    queryFn: () => subTopicsGet([subjectId as number]),
    enabled: Number.isFinite(subjectId) && subjectId > 0
  });

  const subTopicIdsForMicro = useMemo(
    () => (selectedSubTopics ?? []).filter((id) => Number.isFinite(id) && id > 0),
    [selectedSubTopics]
  );

  const microSubTopicQueryKey = useMemo(
    () => [...subTopicIdsForMicro].sort((a, b) => a - b).join(','),
    [subTopicIdsForMicro]
  );

  const microSubTopicsQ = useQuery({
    queryKey: ['microSubTopics', microSubTopicQueryKey],
    queryFn: () => microSubTopicsGet(subTopicIdsForMicro),
    enabled: subTopicIdsForMicro.length > 0
  });

  const prevSubjectIdRef = useRef<number | null>(null);
  useEffect(() => {
    const sid = Number(subjectId) || 0;
    if (prevSubjectIdRef.current === null) {
      prevSubjectIdRef.current = sid;
      return;
    }
    if (prevSubjectIdRef.current !== sid) {
      prevSubjectIdRef.current = sid;
      form.setValue('sub_topics', []);
      form.setValue('micro_sub_topics', []);
    }
  }, [subjectId, form]);

  useEffect(() => {
    if (microSubTopicQueryKey === '') {
      form.setValue('micro_sub_topics', []);
    }
  }, [microSubTopicQueryKey, form]);

  useEffect(() => {
    const list = subTopicsQ.data;
    const sid = Number(subjectId) || 0;
    if (!list || sid <= 0) return;
    const allowed = new Set(list.map((s) => s.sub_topic_id));
    const cur = form.getValues('sub_topics') ?? [];
    const next = cur.filter((id) => allowed.has(id));
    if (next.length !== cur.length) {
      form.setValue('sub_topics', next, { shouldValidate: true });
    }
  }, [subTopicsQ.data, subjectId, form]);

  useEffect(() => {
    const data = microSubTopicsQ.data;
    if (data === undefined) return;
    if (data.length === 0) {
      form.setValue('micro_sub_topics', [], { shouldValidate: true });
      return;
    }
    const allowed = new Set(data.map((m) => m.micro_sub_topic_id));
    const cur = form.getValues('micro_sub_topics') ?? [];
    const next = cur.filter((id) => allowed.has(id));
    if (next.length !== cur.length) {
      form.setValue('micro_sub_topics', next, { shouldValidate: true });
    }
  }, [microSubTopicsQ.data, form]);

  // localStorage'a otomatik kaydet (debounced — her 1 saniyede bir)
  useEffect(() => {
    const sub = form.watch((values) => {
      const timer = setTimeout(() => {
        try {
          // Görsel dosyaları kaydedilemez, onları atla
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { question_image_file, ...rest } = values as FormValuesWithFiles;
          localStorage.setItem(LS_KEY, JSON.stringify(rest));
        } catch {
          // ignore quota errors
        }
      }, 800);
      return () => clearTimeout(timer);
    });
    return () => sub.unsubscribe();
  }, [form]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadQuestionImageM = useMutation({
    mutationFn: uploadQuestionImage,
    onSuccess: (url) => {
      form.setValue('question_image_url', url, { shouldDirty: true, shouldValidate: true });
      setBanner({ kind: 'success', title: 'Soru görseli yüklendi.', description: url });
    },
    onError: (e) => {
      setBanner({
        kind: 'danger',
        title: 'Soru görseli yüklenemedi.',
        description: e instanceof Error ? e.message : 'Bilinmeyen hata'
      });
    }
  });

  const uploadOptionImageM = useMutation({
    mutationFn: ({ index, file }: { index: number; file: File }) => uploadOptionImage(file),
    onSuccess: (url, vars) => {
      form.setValue(`question_options.${vars.index}.option_image_url`, url, {
        shouldDirty: true,
        shouldValidate: true
      });
      setBanner({
        kind: 'success',
        title: `Seçenek ${vars.index + 1} görseli yüklendi.`,
        description: url
      });
    },
    onError: (e) => {
      setBanner({
        kind: 'danger',
        title: 'Seçenek görseli yüklenemedi.',
        description: e instanceof Error ? e.message : 'Bilinmeyen hata'
      });
    }
  });

  const addQuestionM = useMutation({
    mutationFn: (payload: QuestionAddInput) => questionAdd(payload),
    onSuccess: () => {
      setBanner({ kind: 'success', title: 'Soru başarıyla eklendi.' });
      fullReset();
    },
    onError: (e) => {
      setBanner({
        kind: 'danger',
        title: 'Soru eklenemedi.',
        description: e instanceof Error ? e.message : 'Bilinmeyen hata'
      });
    }
  });

  useEffect(() => {
    return () => {
      if (questionLocalPreviewUrl) URL.revokeObjectURL(questionLocalPreviewUrl);
      Object.values(optionLocalPreviewUrls).forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [questionLocalPreviewUrl, optionLocalPreviewUrls]);

  async function handleQuestionFileSelected(file?: File) {
    if (!file) return;
    setUploading((s) => ({ ...s, question: true }));
    if (questionLocalPreviewUrl) URL.revokeObjectURL(questionLocalPreviewUrl);
    setQuestionLocalPreviewUrl(URL.createObjectURL(file));
    try {
      await uploadQuestionImageM.mutateAsync(file);
    } finally {
      setUploading((s) => ({ ...s, question: false }));
    }
  }

  async function handleOptionFileSelected(index: number, file?: File) {
    if (!file) return;
    setUploading({ optionIndex: index });
    setOptionLocalPreviewUrls((prev) => {
      const existing = prev[index];
      if (existing) URL.revokeObjectURL(existing);
      return { ...prev, [index]: URL.createObjectURL(file) };
    });
    try {
      await uploadOptionImageM.mutateAsync({ index, file });
    } finally {
      setUploading((s) => ({ ...s, optionIndex: undefined }));
    }
  }

  async function onSubmit(values: FormValuesWithFiles) {
    setBanner({ kind: 'info', title: 'Gönderiliyor…' });

    const payload = toApiPayload(values);
    await addQuestionM.mutateAsync(payload);
  }

  const isBusy =
    subjectsQ.isLoading ||
    examTypesQ.isLoading ||
    skillTypesQ.isLoading ||
    subTopicsQ.isLoading ||
    microSubTopicsQ.isLoading ||
    uploadQuestionImageM.isPending ||
    uploadOptionImageM.isPending ||
    addQuestionM.isPending;

  const [activeTab, setActiveTab] = useState<'add' | 'preview'>('add');

  // Vektör paneli için hazırlık kontrolü
  const watchedValues = form.watch();
  const isVektorReady = useMemo(() => {
    const v = watchedValues;
    const hasQuestionContent = (v.question_text?.trim().length ?? 0) >= 5;
    const options = v.question_options ?? [];
    const allOptionsFilled =
      options.length >= OPTION_COUNT_MIN &&
      options.every((o) => (o.option_text?.trim().length ?? 0) > 0);
    return (
      hasQuestionContent &&
      allOptionsFilled &&
      (v.subject_id ?? 0) > 0 &&
      (v.exam_types?.length ?? 0) > 0 &&
      (v.sub_topics?.length ?? 0) > 0 &&
      (v.micro_sub_topics?.length ?? 0) > 0
    );
  }, [watchedValues]);

  // API'ye gönderilecek soru verisi
  const vektorSnapshot = useMemo(() => {
    const v = watchedValues;
    const subjectName =
      subjectsQ.data?.find((s) => s.subject_id === Number(v.subject_id))?.subject_name ?? '';
    const subTopicNames =
      (subTopicsQ.data ?? [])
        .filter((st) => (v.sub_topics ?? []).includes(st.sub_topic_id))
        .map((st) => st.sub_topic_name)
        .join(', ');
    const microAltKonuNames =
      (microSubTopicsQ.data ?? [])
        .filter((m) => (v.micro_sub_topics ?? []).includes(m.micro_sub_topic_id))
        .map((m) => m.micro_sub_topic_name)
        .join(', ');
    const secenekler = (v.question_options ?? [])
      .map((o, i) => `${String.fromCharCode(65 + i)}) ${o.option_text}`)
      .join(' ');
    return {
      ders: subjectName,
      konu: subTopicNames,
      micro_alt_konular: microAltKonuNames,
      soru_metni: v.question_text ?? '',
      secenekler,
    };
  }, [watchedValues, subjectsQ.data, subTopicsQ.data, microSubTopicsQ.data]);

  return (
    <div className="space-y-4 md:mx-auto md:max-w-7xl">
      {banner ? (
        <Alert
          variant={banner.kind === 'danger' ? 'danger' : banner.kind === 'success' ? 'success' : 'info'}
          title={banner.title}
          description={banner.description}
        />
      ) : null}

      <Card className="border-0">
        {/* ── Sekme + Buton Barı ── */}
        <div className="flex items-center justify-between border-b border-[var(--gh-border)]">
          {/* Sekmeler */}
          <div className="flex">
            {(['add', 'preview'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab
                    ? 'border-[var(--gh-primary)] text-[var(--gh-fg)]'
                    : 'border-transparent text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:border-[var(--gh-border)]'
                )}
              >
                {tab === 'add' ? 'Soru Ekle' : 'Ön İzleme'}
              </button>
            ))}
          </div>

          {/* Butonlar — yalnızca md+ */}
          <div className="hidden items-center gap-2 pr-4 md:flex">
            <Button
              type="button"
              variant="secondary"
              onClick={fullReset}
              disabled={isBusy}
            >
              Temizle
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)} disabled={isBusy}>
              Kaydet
            </Button>
          </div>
        </div>
        <CardBody>
          {activeTab === 'preview' ? (
            <QuestionBookPreview
              questionText={form.watch('question_text') ?? ''}
              options={(form.watch('question_options') ?? []).map((o, idx) => ({
                letter: String.fromCharCode(65 + idx),
                text: o.option_text ?? '',
                imageSrc: o.option_image_url || optionLocalPreviewUrls[idx] || undefined,
                isCorrect: !!o.is_correct,
              }))}
            />
          ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
              <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
              <div className="shrink-0 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-4">
                <div className="mb-2 text-sm font-semibold">Soru Görseli</div>
                <div className="flex items-end gap-3">
                  <label className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs font-medium text-[var(--gh-fg-muted)]">Görsel (opsiyonel)</div>
                    <FilePicker
                      accept="image/*"
                      disabled={isBusy}
                      label="Görsel seç"
                      valueLabel={form.watch('question_image_url') ? 'Yüklendi' : undefined}
                      helperText={uploading.question ? 'Yükleniyor…' : 'Seçilen dosya doğrudan yüklenir.'}
                      onFileSelected={(file) => handleQuestionFileSelected(file)}
                    />
                  </label>

                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]">
                    {(() => {
                      const remote = form.watch('question_image_url');
                      const src = remote || questionLocalPreviewUrl;
                      if (!src) return null;
                      return <img src={src} alt="Soru" className="h-full w-full object-cover" />;
                    })()}
                  </div>
                </div>
                <Input
                  className="mt-2 text-xs"
                  placeholder="Yüklenen URL (otomatik)"
                  {...form.register('question_image_url')}
                />
              </div>

              <div className="flex min-h-[min(320px,50vh)] flex-1 flex-col gap-1 lg:min-h-0">
                <div className="shrink-0 text-sm font-medium">Soru Metni</div>
                <RichTextEditor
                  fillHeight
                  value={form.watch('question_text') ?? ''}
                  onChange={(html) =>
                    form.setValue('question_text', html, { shouldValidate: true, shouldDirty: true })
                  }
                  disabled={isBusy}
                  error={form.formState.errors.question_text?.message}
                />
              </div>
              </section>

              <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80 xl:w-96">
              <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-4">
                <div className="mb-2 text-sm font-semibold">Temel Bilgiler</div>
                <div className="grid gap-3">
                  <label className="space-y-1">
                    <div className="text-xs font-medium text-[var(--gh-fg-muted)]">Durum</div>
                    <div className="flex items-center gap-2 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 py-2">
                      <input type="checkbox" className="h-4 w-4" {...form.register('is_active')} />
                      <div className="text-sm text-[var(--gh-fg)]">
                        {form.watch('is_active') ? 'Aktif' : 'Pasif'}
                      </div>
                    </div>
                  </label>

                  <DifficultyField form={form} />

                  <MultiPicker
                    label="Beceri Türleri"
                    placeholder="Beceri seç…"
                    options={(skillTypesQ.data ?? []).map((s) => ({ id: s.skill_type_id, name: s.skill_type_name }))}
                    loading={skillTypesQ.isLoading}
                    value={form.watch('skill_types')}
                    onChange={(ids) => form.setValue('skill_types', ids, { shouldValidate: true })}
                    error={form.formState.errors.skill_types?.message as string | undefined}
                  />

                  <label className="space-y-1">
                    <div className="text-xs font-medium text-[var(--gh-fg-muted)]">Objective Codes (opsiyonel)</div>
                    <Input placeholder="Örn: M.9.1.2" {...form.register('objective_codes')} />
                  </label>
                </div>
              </div>

              <div className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-4">
                <div className="mb-2 text-sm font-semibold">Kategorilendirme</div>

                <ExamTypesPicker
                  options={examTypesQ.data ?? []}
                  loading={examTypesQ.isLoading}
                  value={form.watch('exam_types')}
                  onChange={(ids) => form.setValue('exam_types', ids, { shouldValidate: true })}
                  error={form.formState.errors.exam_types?.message as string | undefined}
                />

                <label className="space-y-1">
                  <div className="text-xs font-medium text-[var(--gh-fg-muted)]">Ders</div>
                  <select
                    className={cn(
                      'h-9 w-full rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] px-3 text-sm text-[var(--gh-fg)] outline-none focus:ring-2 focus:ring-[var(--gh-accent)]'
                    )}
                    value={subjectId || 0}
                    onChange={(e) => form.setValue('subject_id', Number(e.target.value), { shouldValidate: true })}
                    aria-label="Ders"
                  >
                    <option value={0}>Ders seç…</option>
                    {(subjectsQ.data ?? []).map((s) => (
                      <option key={s.subject_id} value={s.subject_id}>
                        {s.subject_name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.subject_id ? (
                    <div className="text-xs text-rose-600">{form.formState.errors.subject_id.message}</div>
                  ) : null}
                </label>

                <MultiPicker
                  label="Konu"
                  placeholder={
                    subjectId <= 0 ? 'Önce ders seçin' : 'Konu seç…'
                  }
                  options={(subTopicsQ.data ?? []).map((st) => ({ id: st.sub_topic_id, name: st.sub_topic_name }))}
                  loading={subTopicsQ.isLoading}
                  disabled={subjectId <= 0}
                  value={form.watch('sub_topics')}
                  onChange={(ids) => form.setValue('sub_topics', ids, { shouldValidate: true })}
                  error={form.formState.errors.sub_topics?.message as string | undefined}
                  hint="Liste, seçtiğiniz derse göre sunucudan yüklenir."
                />

                <MultiPicker
                  label="Alt konu"
                  placeholder={
                    subTopicIdsForMicro.length === 0
                      ? 'Önce konu seçin'
                      : 'Alt konu seç…'
                  }
                  options={(microSubTopicsQ.data ?? []).map((mst) => ({
                    id: mst.micro_sub_topic_id,
                    name: mst.micro_sub_topic_name
                  }))}
                  loading={microSubTopicsQ.isLoading}
                  disabled={subTopicIdsForMicro.length === 0}
                  value={form.watch('micro_sub_topics')}
                  onChange={(ids) => form.setValue('micro_sub_topics', ids, { shouldValidate: true })}
                  error={form.formState.errors.micro_sub_topics?.message as string | undefined}
                  hint="Liste, seçtiğiniz konulara göre API’den yüklenir."
                />
              </div>

              </aside>
            </div>

            <section className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold">Seçenekler</div>
                <p className="text-[11px] text-[var(--gh-fg-muted)]">
                  Varsayılan {OPTION_COUNT_DEFAULT} şık. En az {OPTION_COUNT_MIN}, en çok {OPTION_COUNT_MAX}.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((f, idx) => {
                  const isCorrect = form.watch(`question_options.${idx}.is_correct`);
                  const optErr = form.formState.errors.question_options?.[idx];

                  return (
                    <div
                      key={f.id}
                      className="rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">Şık {idx + 1}</div>
                        <label className="flex items-center gap-2 text-xs font-medium text-[var(--gh-fg)]">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={isCorrect}
                            onChange={() => {
                              for (let i = 0; i < fields.length; i++) {
                                form.setValue(`question_options.${i}.is_correct`, i === idx, {
                                  shouldDirty: true
                                });
                              }
                            }}
                          />
                          Doğru
                        </label>
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-[var(--gh-fg-muted)]">Şık metni</div>
                          <RichTextEditor
                            variant="compact"
                            value={form.watch(`question_options.${idx}.option_text`) ?? ''}
                            onChange={(md) =>
                              form.setValue(`question_options.${idx}.option_text`, md, {
                                shouldValidate: true,
                                shouldDirty: true
                              })
                            }
                            disabled={isBusy}
                            error={optErr?.option_text?.message}
                            placeholder="Şık metni — $x^2$ veya görselden LaTeX"
                          />
                        </div>
                        {optErr?.option_image_url?.message ? (
                          <div className="text-xs text-rose-600">{optErr.option_image_url.message}</div>
                        ) : null}

                        <div className="flex items-end gap-3">
                          <label className="min-w-0 flex-1 space-y-1">
                            <div className="text-xs font-medium text-[var(--gh-fg-muted)]">
                              Görsel (opsiyonel)
                            </div>
                            <FilePicker
                              accept="image/*"
                              disabled={isBusy}
                              label="Görsel seç"
                              valueLabel={
                                form.watch(`question_options.${idx}.option_image_url`) ? 'Yüklendi' : undefined
                              }
                              helperText={
                                uploading.optionIndex === idx ? 'Yükleniyor…' : 'Seçilen dosya doğrudan yüklenir.'
                              }
                              onFileSelected={(file) => handleOptionFileSelected(idx, file)}
                            />
                          </label>

                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]">
                            {(() => {
                              const remote = form.watch(`question_options.${idx}.option_image_url`);
                              const local = optionLocalPreviewUrls[idx];
                              const src = remote || local;
                              if (!src) return null;
                              return (
                                <img
                                  src={src}
                                  alt={`Şık ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                              );
                            })()}
                          </div>
                        </div>

                        <Input
                          className="text-xs"
                          placeholder="Yüklenen URL (otomatik)"
                          {...form.register(`question_options.${idx}.option_image_url` as const)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isBusy || fields.length >= OPTION_COUNT_MAX}
                  onClick={() =>
                    append({
                      option_text: '',
                      is_correct: false,
                      option_image_url: ''
                    })
                  }
                >
                  + Şık ekle
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isBusy || fields.length <= OPTION_COUNT_MIN}
                  onClick={() => {
                    const lastIdx = fields.length - 1;
                    if (lastIdx < 0) return;
                    const localUrl = optionLocalPreviewUrls[lastIdx];
                    if (localUrl) URL.revokeObjectURL(localUrl);
                    setOptionLocalPreviewUrls((prev) => {
                      const next = { ...prev };
                      delete next[lastIdx];
                      return next;
                    });
                    remove(lastIdx);
                  }}
                >
                  Son şıkkı kaldır
                </Button>
              </div>
            </section>
          </div>
          )}

          {activeTab === 'add' ? (
          /* Vektör Text + AI Chat paneli */
          <VektorChatPanel
            isReady={isVektorReady}
            snapshot={vektorSnapshot}
            vektorValue={form.watch('vektor_txt')}
            onVektorInput={(e) =>
              form.setValue('vektor_txt', e.target.value, { shouldValidate: true })
            }
            onVektorChange={(text) =>
              form.setValue('vektor_txt', text, { shouldValidate: true })
            }
            vektorError={form.formState.errors.vektor_txt?.message}
            disabled={isBusy}
          />
          ) : null}

        </CardBody>
      </Card>

      {/* Mobil buton barı */}
      <div className="flex gap-2 border-t border-[var(--gh-border)] bg-[var(--gh-canvas)] p-3 md:hidden">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={fullReset}
          disabled={isBusy}
        >
          Temizle
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isBusy}
        >
          Kaydet
        </Button>
      </div>
    </div>
  );
}

