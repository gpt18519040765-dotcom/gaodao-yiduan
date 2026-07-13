import { NextResponse } from "next/server";
import { listAllDivinationRecords } from "@/lib/divination-record-store";
import { listAllConsultationRequests } from "@/lib/consultation-store";
import { requireAdmin } from "@/lib/auth-guards";
import { publicUser, readUserDatabase } from "@/lib/user-store";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "需要管理员权限。" }, { status: 403 });
  }

  const userDatabase = await readUserDatabase();
  const records = await listAllDivinationRecords();
  const consultations = await listAllConsultationRequests();
  const users = userDatabase.users.map(publicUser);

  return NextResponse.json({
    users,
    records,
    consultations,
    stats: {
      userCount: users.length,
      recordCount: records.length,
      consultationCount: consultations.length,
      latestRecordAt: records[0]?.savedAt ?? null,
    },
  });
}
