import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guards";
import { getGoalPlan, saveGoalPlan } from "@/lib/goal-plan-store";
import type { GoalAction, GoalMetric } from "@/lib/goal-plan-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ plan: null, authenticated: false }, { status: 401 });
  }

  const plan = await getGoalPlan(user.id);
  return NextResponse.json({ plan, authenticated: true });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后同步目标计划。" }, { status: 401 });
  }

  const body = await request.json() as {
    goalText?: unknown;
    frameworkId?: unknown;
    metrics?: unknown;
    actions?: unknown;
    notes?: unknown;
  };

  if (typeof body.goalText !== "string" || typeof body.frameworkId !== "string") {
    return NextResponse.json({ error: "目标计划格式不完整。" }, { status: 400 });
  }

  const metrics = Array.isArray(body.metrics) ? body.metrics as GoalMetric[] : [];
  const actions = Array.isArray(body.actions) ? body.actions as GoalAction[] : [];
  const notes = Array.isArray(body.notes) ? body.notes.filter((item): item is string => typeof item === "string") : [];

  const plan = await saveGoalPlan({
    userId: user.id,
    goalText: body.goalText,
    frameworkId: body.frameworkId,
    metrics,
    actions,
    notes,
  });

  return NextResponse.json({ plan });
}
