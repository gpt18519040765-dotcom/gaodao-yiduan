import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guards";
import { findDivinationRecord, updateDivinationRecordGuidance, updateDivinationRecordReview } from "@/lib/divination-record-store";
import type { DivinationGuidance, DivinationReview } from "@/lib/divination-record-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { id } = await context.params;
  const record = await findDivinationRecord(id);
  if (!record) {
    return NextResponse.json({ error: "记录不存在。" }, { status: 404 });
  }

  if (record.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "无权查看这条记录。" }, { status: 403 });
  }

  return NextResponse.json({ record });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const { id } = await context.params;
  const record = await findDivinationRecord(id);
  if (!record) {
    return NextResponse.json({ error: "记录不存在。" }, { status: 404 });
  }

  if (record.userId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "无权修改这条记录。" }, { status: 403 });
  }

  const body = await request.json() as Record<string, unknown>;
  let updated = record;

  if (body.guidance) {
    updated = await updateDivinationRecordGuidance(id, body.guidance as DivinationGuidance) ?? updated;
  }

  if (body.review) {
    updated = await updateDivinationRecordReview(id, body.review as DivinationReview) ?? updated;
  }

  return NextResponse.json({ record: updated });
}
