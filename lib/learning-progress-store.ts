import { querySql, runSql, sql } from "@/lib/sqlite";

export type LearningProgress = {
  userId: string;
  completedLessonIds: string[];
  updatedAt: string;
};

type LearningProgressRow = {
  user_id: string;
  completed_lesson_ids: string;
  updated_at: string;
};

export async function getLearningProgress(userId: string): Promise<LearningProgress> {
  const rows = await querySql<LearningProgressRow>(`
SELECT user_id, completed_lesson_ids, updated_at
FROM learning_progress
WHERE user_id = ${sql([userId])};
`);

  const row = rows[0];
  if (!row) {
    return { userId, completedLessonIds: [], updatedAt: new Date().toISOString() };
  }

  return {
    userId: row.user_id,
    completedLessonIds: JSON.parse(row.completed_lesson_ids) as string[],
    updatedAt: row.updated_at,
  };
}

export async function saveLearningProgress(userId: string, completedLessonIds: string[]) {
  const uniqueIds = [...new Set(completedLessonIds)];
  const updatedAt = new Date().toISOString();

  await runSql(`
INSERT INTO learning_progress (user_id, completed_lesson_ids, updated_at)
VALUES (${sql([userId, JSON.stringify(uniqueIds), updatedAt])})
ON CONFLICT(user_id) DO UPDATE SET
  completed_lesson_ids = excluded.completed_lesson_ids,
  updated_at = excluded.updated_at;
`);

  return { userId, completedLessonIds: uniqueIds, updatedAt };
}
