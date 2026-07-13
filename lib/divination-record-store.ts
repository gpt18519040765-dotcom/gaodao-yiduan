import { randomUUID } from "node:crypto";
import type { DivinationAnalysis } from "@/lib/divination-analysis";
import type { DivinationResult } from "@/lib/divination";
import type { LearningRecommendation } from "@/lib/learning-recommendations";
import { querySql, runSql, sql } from "@/lib/sqlite";

export type GuidanceAction = {
  id: string;
  text: string;
  done: boolean;
};

export type DivinationGuidance = {
  recommendations: LearningRecommendation[];
  actions: GuidanceAction[];
};

export type DivinationReview = {
  actionTaken: string;
  outcome: string;
  reflection: string;
  updatedAt: string;
};

export type StoredDivinationRecord = {
  id: string;
  userId: string;
  question: string;
  topic: string;
  result: DivinationResult;
  modelPrompt: string;
  analysis?: DivinationAnalysis;
  guidance?: DivinationGuidance;
  review?: DivinationReview;
  savedAt: string;
};

type DivinationRecordRow = {
  id: string;
  user_id: string;
  question: string;
  topic: string;
  result_json: string;
  model_prompt: string;
  analysis_json: string | null;
  guidance_json: string | null;
  review_json: string | null;
  saved_at: string;
};

function rowToRecord(row: DivinationRecordRow): StoredDivinationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    question: row.question ?? "",
    topic: row.topic,
    result: JSON.parse(row.result_json) as DivinationResult,
    modelPrompt: row.model_prompt,
    analysis: row.analysis_json ? JSON.parse(row.analysis_json) as DivinationAnalysis : undefined,
    guidance: row.guidance_json ? JSON.parse(row.guidance_json) as DivinationGuidance : undefined,
    review: row.review_json ? JSON.parse(row.review_json) as DivinationReview : undefined,
    savedAt: row.saved_at,
  };
}

export async function createDivinationRecord(input: {
  userId: string;
  question?: string;
  topic: string;
  result: DivinationResult;
  modelPrompt: string;
  analysis?: DivinationAnalysis;
  guidance?: DivinationGuidance;
}) {
  const record: StoredDivinationRecord = {
    id: randomUUID(),
    userId: input.userId,
    question: input.question?.trim() ?? input.result.question ?? "",
    topic: input.topic,
    result: input.result,
    modelPrompt: input.modelPrompt,
    analysis: input.analysis,
    guidance: input.guidance,
    savedAt: new Date().toISOString(),
  };

  await runSql(`
INSERT INTO divination_records (
  id, user_id, question, topic, result_json, model_prompt, analysis_json, guidance_json, review_json, saved_at
) VALUES (${sql([
    record.id,
    record.userId,
    record.question,
    record.topic,
    JSON.stringify(record.result),
    record.modelPrompt,
    record.analysis ? JSON.stringify(record.analysis) : null,
    record.guidance ? JSON.stringify(record.guidance) : null,
    null,
    record.savedAt,
  ])});
`);

  return record;
}

export async function listUserDivinationRecords(userId: string) {
  const rows = await querySql<DivinationRecordRow>(`
SELECT * FROM divination_records WHERE user_id = ${sql([userId])} ORDER BY saved_at DESC;
`);
  return rows.map(rowToRecord);
}

export async function findUserDivinationRecord(userId: string, recordId: string) {
  const rows = await querySql<DivinationRecordRow>(`
SELECT * FROM divination_records WHERE user_id = ${sql([userId])} AND id = ${sql([recordId])} LIMIT 1;
`);
  return rows[0] ? rowToRecord(rows[0]) : undefined;
}

export async function findDivinationRecord(recordId: string) {
  const rows = await querySql<DivinationRecordRow>(`
SELECT * FROM divination_records WHERE id = ${sql([recordId])} LIMIT 1;
`);
  return rows[0] ? rowToRecord(rows[0]) : undefined;
}

export async function updateDivinationRecordAnalysis(recordId: string, analysis: DivinationAnalysis) {
  await runSql(`
UPDATE divination_records
SET analysis_json = ${sql([JSON.stringify(analysis)])}
WHERE id = ${sql([recordId])};
`);
  return findDivinationRecord(recordId);
}

export async function updateDivinationRecordGuidance(recordId: string, guidance: DivinationGuidance) {
  await runSql(`
UPDATE divination_records
SET guidance_json = ${sql([JSON.stringify(guidance)])}
WHERE id = ${sql([recordId])};
`);
  return findDivinationRecord(recordId);
}

export async function updateDivinationRecordReview(recordId: string, review: DivinationReview) {
  await runSql(`
UPDATE divination_records
SET review_json = ${sql([JSON.stringify(review)])}
WHERE id = ${sql([recordId])};
`);
  return findDivinationRecord(recordId);
}

export async function listAllDivinationRecords() {
  const rows = await querySql<DivinationRecordRow>("SELECT * FROM divination_records ORDER BY saved_at DESC;");
  return rows.map(rowToRecord);
}
