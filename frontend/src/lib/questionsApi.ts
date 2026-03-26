/**
 * Sorular sayfasına özel HTTP çağrıları.
 */
import { apiClient } from './apiClient';

/** `QuestionsPage` applied anlık görüntüsü ile aynı alanlar */
export type QuestionsFilteredDataFilters = {
  exam_type_id: string[];
  subject_id: string[];
  sub_topic_id: string[];
  micro_sub_topic_id: string[];
  beginning: string | null;
  finish: string | null;
  skill_type_id: string[];
  amount: string;
};

function idsToJsonArray(ids: string[]) {
  return JSON.stringify(ids.map((id) => Number(id)));
}

function toFilteredDataParams(f: QuestionsFilteredDataFilters): Record<string, string> {
  const params: Record<string, string> = {
    subject_id: idsToJsonArray(f.subject_id),
    sub_topic_id: idsToJsonArray(f.sub_topic_id),
    micro_sub_topic_id: idsToJsonArray(f.micro_sub_topic_id),
    amount: f.amount,
    exam_type_id: idsToJsonArray(f.exam_type_id),
    skill_type_id: idsToJsonArray(f.skill_type_id)
  };
  if (f.beginning != null) params.beginning = f.beginning;
  if (f.finish != null) params.finish = f.finish;
  return params;
}

/** GET `/manufacturer/v1/filtered-data` — Postman: `filter_Data.json` */
export async function questionsFilteredDataGet(filters: QuestionsFilteredDataFilters) {
  const { data } = await apiClient.get('/manufacturer/v1/filtered-data', {
    params: toFilteredDataParams(filters)
  });
  return data;
}

/** POST `/manufacturer/v1/similar-question` — gövde: `{ question_id: string[] }` */
export async function similarQuestionsPost(questionIds: string[]) {
  const { data } = await apiClient.post('/manufacturer/v1/similar-question', {
    question_id: questionIds
  });
  return data;
}

export const questionsApi = {
  filteredDataGet: questionsFilteredDataGet,
  similarQuestionsPost
};

/** Harita sekmesi: API `result[].coords` → [x,y,z] (ör. similar-question yanıtı) */
export type MapPoint3D = {
  id: string;
  x: number;
  y: number;
  z: number;
};

function filteredDataResultArray(data: unknown): unknown[] {
  if (data === null || typeof data !== 'object' || !('result' in data)) return [];
  const result = (data as { result: unknown }).result;
  return Array.isArray(result) ? result : [];
}

export function extractMapPointsFromResultData(data: unknown): MapPoint3D[] {
  const result = filteredDataResultArray(data);
  return result.flatMap((item: unknown, index: number) => {
    if (item === null || typeof item !== 'object') return [];
    const row = item as { coords?: unknown; question_id?: unknown };
    const coords = row.coords;
    if (!Array.isArray(coords) || coords.length < 3) return [];
    const id =
      typeof row.question_id === 'string'
        ? row.question_id
        : typeof row.question_id === 'number'
          ? String(row.question_id)
          : `q-${index}`;
    const x = Number(coords[0]);
    const y = Number(coords[1]);
    const z = Number(coords[2]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return [];
    return [{ id, x, y, z }];
  });
}

export type FilteredQuestionOption = {
  option_id: string;
  option_text: string;
  is_correct: boolean;
};

export type FilteredNamedId = { id: number; name: string };

export type FilteredQuestionRow = {
  question_id: string;
  subject_name: string;
  subject_id: number | null;
  question_text: string;
  created_at: string | null;
  is_active: boolean | null;
  difficulty_level: number | null;
  source_id: number | null;
  objective_codes: string;
  vektor_txt: string;
  question_options: FilteredQuestionOption[];
  sub_topics: FilteredNamedId[];
  micro_sub_topics: FilteredNamedId[];
  exam_types: FilteredNamedId[];
  skill_types: FilteredNamedId[];
  coords: [number, number, number] | null;
};

/** API bu alanları artık parse edilmiş dizi olarak döndürüyor */
function asObjectArray(raw: unknown): unknown[] {
  return Array.isArray(raw) ? raw : [];
}

function normalizeOptions(raw: unknown): FilteredQuestionOption[] {
  return asObjectArray(raw).flatMap((o) => {
    if (o === null || typeof o !== 'object') return [];
    const x = o as Record<string, unknown>;
    const option_id =
      typeof x.option_id === 'string'
        ? x.option_id
        : typeof x.option_id === 'number'
          ? String(x.option_id)
          : '';
    const option_text = typeof x.option_text === 'string' ? x.option_text : '';
    const is_correct = x.is_correct === true;
    if (!option_id && !option_text) return [];
    return [{ option_id: option_id || '—', option_text, is_correct }];
  });
}

function mapNamed(
  raw: unknown,
  idKey: string,
  nameKey: string
): FilteredNamedId[] {
  return asObjectArray(raw).flatMap((o) => {
    if (o === null || typeof o !== 'object') return [];
    const x = o as Record<string, unknown>;
    const id = typeof x[idKey] === 'number' ? x[idKey] : Number(x[idKey]);
    const name = typeof x[nameKey] === 'string' ? x[nameKey] : '';
    if (!Number.isFinite(id)) return [];
    return [{ id: id as number, name: name || String(id) }];
  });
}

function normalizeCoords(raw: unknown): [number, number, number] | null {
  if (!Array.isArray(raw) || raw.length < 3) return null;
  const x = Number(raw[0]);
  const y = Number(raw[1]);
  const z = Number(raw[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  return [x, y, z];
}

function normalizeFilteredRow(item: unknown, index: number): FilteredQuestionRow | null {
  if (item === null || typeof item !== 'object') return null;
  const row = item as Record<string, unknown>;
  const question_id =
    typeof row.question_id === 'string'
      ? row.question_id
      : typeof row.question_id === 'number'
        ? String(row.question_id)
        : `satır-${index}`;

  const subject_id =
    typeof row.subject_id === 'number'
      ? row.subject_id
      : Number.isFinite(Number(row.subject_id))
        ? Number(row.subject_id)
        : null;

  return {
    question_id,
    subject_name: typeof row.subject_name === 'string' ? row.subject_name : '—',
    subject_id,
    question_text: typeof row.question_text === 'string' ? row.question_text : '',
    created_at: typeof row.created_at === 'string' ? row.created_at : null,
    is_active: typeof row.is_active === 'boolean' ? row.is_active : null,
    difficulty_level:
      typeof row.difficulty_level === 'number'
        ? row.difficulty_level
        : Number.isFinite(Number(row.difficulty_level))
          ? Number(row.difficulty_level)
          : null,
    source_id:
      typeof row.source_id === 'number'
        ? row.source_id
        : Number.isFinite(Number(row.source_id))
          ? Number(row.source_id)
          : null,
    objective_codes: typeof row.objective_codes === 'string' ? row.objective_codes : '',
    vektor_txt: typeof row.vektor_txt === 'string' ? row.vektor_txt : '',
    question_options: normalizeOptions(row.question_options),
    sub_topics: mapNamed(row.sub_topics, 'sub_topic_id', 'sub_topic_name'),
    micro_sub_topics: mapNamed(row.micro_sub_topics, 'micro_sub_topic_id', 'micro_sub_topic_name'),
    exam_types: mapNamed(row.exam_types, 'exam_type_id', 'exam_type_name'),
    skill_types: mapNamed(row.skill_type, 'skill_type_id', 'skill_type_name'),
    coords: normalizeCoords(row.coords)
  };
}

/** Liste sekmesi: `result[]` satırlarını güvenli şekilde normalize eder */
export function extractFilteredQuestionRows(data: unknown): FilteredQuestionRow[] {
  return filteredDataResultArray(data)
    .map((item, i) => normalizeFilteredRow(item, i))
    .filter((r): r is FilteredQuestionRow => r !== null);
}
