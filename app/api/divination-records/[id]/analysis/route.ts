import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guards";
import { findDivinationRecord, updateDivinationRecordAnalysis } from "@/lib/divination-record-store";
import { generateDivinationAnalysis } from "@/lib/divination-analysis";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "无权分析这条记录。" }, { status: 403 });
  }

  const analysis = await generateDivinationAnalysis({
    topic: record.topic,
    result: record.result,
    modelPrompt: record.modelPrompt,
  });
  const updatedRecord = await updateDivinationRecordAnalysis(record.id, analysis);

  return NextResponse.json({ record: updatedRecord, analysis });
}
