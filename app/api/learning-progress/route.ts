import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guards";
import { getLearningProgress, saveLearningProgress } from "@/lib/learning-progress-store";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ progress: { completedLessonIds: [], updatedAt: null }, authenticated: false });
  }

  const progress = await getLearningProgress(user.id);
  return NextResponse.json({ progress, authenticated: true });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后同步学习进度。" }, { status: 401 });
  }

  const payload = await request.json() as { completedLessonIds?: unknown };
  if (!Array.isArray(payload.completedLessonIds)) {
    return NextResponse.json({ error: "学习进度格式不正确。" }, { status: 400 });
  }

  const completedLessonIds = payload.completedLessonIds.filter((item): item is string => typeof item === "string");
  const progress = await saveLearningProgress(user.id, completedLessonIds);
  return NextResponse.json({ progress });
}
