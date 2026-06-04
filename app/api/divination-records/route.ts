import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import { createDivinationRecord, listUserDivinationRecords } from "@/lib/divination-record-store";
import { generateDivinationAnalysis } from "@/lib/divination-analysis";
import type { DivinationResult } from "@/lib/divination";
import type { DivinationGuidance } from "@/lib/divination-record-store";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const records = await listUserDivinationRecords(userId);
  return NextResponse.json({ records });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "请先登录后再保存记录。" }, { status: 401 });
  }

  const body = await request.json() as Record<string, unknown>;
  const topic = asText(body.topic);
  const question = asText(body.question);
  const modelPrompt = asText(body.modelPrompt);
  const result = body.result as DivinationResult | undefined;
  const guidance = body.guidance as DivinationGuidance | undefined;

  if (!topic || !result?.hexagramName || !result?.changedHexagramName) {
    return NextResponse.json({ error: "保存内容不完整。" }, { status: 400 });
  }

  const analysis = await generateDivinationAnalysis({
    topic,
    question,
    result,
    modelPrompt,
  });

  const record = await createDivinationRecord({
    userId,
    question,
    topic,
    result,
    modelPrompt,
    analysis,
    guidance,
  });

  return NextResponse.json({ record }, { status: 201 });
}
