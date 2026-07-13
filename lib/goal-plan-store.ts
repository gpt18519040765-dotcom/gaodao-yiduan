import { querySql, runSql, sql } from "@/lib/sqlite";

export type GoalMetric = {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
};

export type GoalAction = {
  id: string;
  horizon: string;
  text: string;
  done: boolean;
};

export type GoalPlan = {
  userId: string;
  goalText: string;
  frameworkId: string;
  metrics: GoalMetric[];
  actions: GoalAction[];
  notes: string[];
  updatedAt: string;
};

type GoalPlanRow = {
  user_id: string;
  goal_text: string;
  framework_id: string;
  metrics_json: string;
  actions_json: string;
  notes_json: string;
  updated_at: string;
};

function rowToGoalPlan(row: GoalPlanRow): GoalPlan {
  return {
    userId: row.user_id,
    goalText: row.goal_text,
    frameworkId: row.framework_id,
    metrics: JSON.parse(row.metrics_json) as GoalMetric[],
    actions: JSON.parse(row.actions_json) as GoalAction[],
    notes: JSON.parse(row.notes_json) as string[],
    updatedAt: row.updated_at,
  };
}

export async function getGoalPlan(userId: string) {
  const rows = await querySql<GoalPlanRow>(`
SELECT * FROM goal_plans WHERE user_id = ${sql([userId])} LIMIT 1;
`);
  return rows[0] ? rowToGoalPlan(rows[0]) : undefined;
}

export async function saveGoalPlan(input: Omit<GoalPlan, "updatedAt">) {
  const updatedAt = new Date().toISOString();

  await runSql(`
INSERT INTO goal_plans (
  user_id, goal_text, framework_id, metrics_json, actions_json, notes_json, updated_at
) VALUES (${sql([
    input.userId,
    input.goalText,
    input.frameworkId,
    JSON.stringify(input.metrics),
    JSON.stringify(input.actions),
    JSON.stringify(input.notes),
    updatedAt,
  ])})
ON CONFLICT(user_id) DO UPDATE SET
  goal_text = excluded.goal_text,
  framework_id = excluded.framework_id,
  metrics_json = excluded.metrics_json,
  actions_json = excluded.actions_json,
  notes_json = excluded.notes_json,
  updated_at = excluded.updated_at;
`);

  return { ...input, updatedAt };
}
