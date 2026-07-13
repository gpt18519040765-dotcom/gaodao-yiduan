import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-guards";
import { createConsultationRequest, listUserConsultationRequests } from "@/lib/consultation-store";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const requests = await listUserConsultationRequests(user.id);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后再提交咨询需求。" }, { status: 401 });
  }

  const body = await request.json() as Record<string, unknown>;
  const source = asText(body.source) || "unknown";
  const phone = asText(body.phone);
  const preferredTime = asText(body.preferredTime);
  const issue = asText(body.issue);

  if (!phone || !preferredTime || !issue) {
    return NextResponse.json({ error: "请填写电话、期望咨询时间和事情说明。" }, { status: 400 });
  }

  const consultation = await createConsultationRequest({
    userId: user.id,
    source,
    phone,
    preferredTime,
    issue,
  });

  return NextResponse.json({ consultation }, { status: 201 });
}
