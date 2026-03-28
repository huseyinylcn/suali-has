import { z } from 'zod';
import { apiClient } from './apiClient';

const successSchema = z.object({ success: z.boolean() });

export const subjectSchema = z.object({
  subject_id: z.number(),
  subject_name: z.string()
});

export type Subject = z.infer<typeof subjectSchema>;

export const examTypeSchema = z.object({
  exam_type_id: z.number(),
  exam_type_name: z.string()
});

export type ExamType = z.infer<typeof examTypeSchema>;

export const subTopicSchema = z.object({
  sub_topic_id: z.number(),
  subject_id: z.number(),
  sub_topic_name: z.string()
});

export const microSubTopicSchema = z.object({
  sub_topic_id: z.number(),
  micro_sub_topic_id: z.number(),
  micro_sub_topic_name: z.string()
});

export const skillTypeSchema = z.object({
  skill_type_id: z.number(),
  skill_type_name: z.string()
});

export type SkillType = z.infer<typeof skillTypeSchema>;

const subjectsGetResponseSchema = z.object({
  result: z.array(subjectSchema),
  success: z.literal(true)
});

const examTypesGetResponseSchema = z.object({
  result: z.array(examTypeSchema),
  success: z.literal(true)
});

const subTopicsGetResponseSchema = z.object({
  result: z.array(subTopicSchema),
  success: z.literal(true)
});

const microSubTopicsGetResponseSchema = z.object({
  result: z.array(microSubTopicSchema),
  success: z.literal(true)
});

const skillTypesGetResponseSchema = z.object({
  result: z.array(skillTypeSchema),
  success: z.literal(true)
});

const uploadResponseSchema = z.object({
  success: z.boolean(),
  url: z.string().url().optional()
});

export type QuestionOptionInput = {
  option_text: string;
  is_correct: 0 | 1;
};

export type QuestionAddInput = {
  is_active: 'true' | 'false';
  question_text: string;
  difficulty_level: number;
  skill_types: number[];
  objective_codes: string;
  question_options: QuestionOptionInput[];
  subject_id: number;
  exam_types: number[];
  sub_topics: number[];
  micro_sub_topics: number[];
  vektor_txt: string;
};

export async function subjectsGet() {
  const { data } = await apiClient.get('/manufacturer/v1/subjects/get');
  return subjectsGetResponseSchema.parse(data).result;
}

export async function examTypesGet() {
  const { data } = await apiClient.get('/manufacturer/v1/exam/types/get');
  return examTypesGetResponseSchema.parse(data).result;
}

/** Backend `subject_id` için JSON dizi string bekliyor (örn. `[1,2]`) */
export async function subTopicsGet(subjectIds: number[]) {
  const params =
    subjectIds.length === 0 ? {} : { subject_id: JSON.stringify(subjectIds) };
  const { data } = await apiClient.get('/manufacturer/v1/question/sub/topics/get', {
    params
  });
  return subTopicsGetResponseSchema.parse(data).result;
}

/** Backend `sub_topic_id` için JSON dizi string bekliyor */
export async function microSubTopicsGet(subTopicIds: number[]) {
  const params =
    subTopicIds.length === 0 ? {} : { sub_topic_id: JSON.stringify(subTopicIds) };
  const { data } = await apiClient.get('/manufacturer/v1/micro/sub/topics', {
    params
  });
  return microSubTopicsGetResponseSchema.parse(data).result;
}

export async function skillTypesGet() {
  const { data } = await apiClient.get('/manufacturer/v1/skill/types/get');
  return skillTypesGetResponseSchema.parse(data).result;
}

export async function uploadOptionImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post(
    '/manufacturer/v1/question/option/image/add',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  const parsed = uploadResponseSchema.parse(data);
  if (!parsed.success || !parsed.url) throw new Error('Option image upload failed.');
  return parsed.url;
}

export async function uploadQuestionImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post('/manufacturer/v1/question/image/add', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  const parsed = uploadResponseSchema.parse(data);
  if (!parsed.success || !parsed.url) throw new Error('Question image upload failed.');
  return parsed.url;
}

export type VektorChatMessage = { role: 'user' | 'assistant'; content: string };

export type GenerateVektorInput = {
  questionData: {
    ders: string;
    konu: string;
    micro_alt_konular: string;
    soru_metni: string;
    secenekler: string;
  } | null;
  history: VektorChatMessage[];
  userInstruction: string;
};

export async function generateVektorText(payload: GenerateVektorInput): Promise<string> {
  const { data } = await apiClient.post('/manufacturer/v1/generate-vektor-text', payload);
  return data.result.vectorText as string;
}

const mathpixResponseSchema = z.object({
  result: z.object({ latex: z.string() }),
  success: z.literal(true)
});

/** base64 data URL (data:image/...;base64,...) gönderir, LaTeX string döner */
export async function mathpixTranslate(imageDataUrl: string): Promise<string> {
  const { data } = await apiClient.post('/manufacturer/v1/mathpix-translate', {
    image: imageDataUrl
  });
  return mathpixResponseSchema.parse(data).result.latex;
}

export async function questionAdd(payload: QuestionAddInput) {
  const { data } = await apiClient.post('/manufacturer/v1/question/add', payload);
  return successSchema.partial().passthrough().parse(data);
}
