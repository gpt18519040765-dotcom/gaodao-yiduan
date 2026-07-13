import { randomUUID } from "node:crypto";
import { querySql, runSql, sql } from "@/lib/sqlite";

export type ConsultationRequest = {
  id: string;
  userId: string;
  source: string;
  phone: string;
  preferredTime: string;
  issue: string;
  createdAt: string;
};

type ConsultationRow = {
  id: string;
  user_id: string;
  source: string;
  phone: string;
  preferred_time: string;
  issue: string;
  created_at: string;
};

function rowToConsultation(row: ConsultationRow): ConsultationRequest {
  return {
    id: row.id,
    userId: row.user_id,
    source: row.source,
    phone: row.phone,
    preferredTime: row.preferred_time,
    issue: row.issue,
    createdAt: row.created_at,
  };
}

export async function createConsultationRequest(input: {
  userId: string;
  source: string;
  phone: string;
  preferredTime: string;
  issue: string;
}) {
  const request: ConsultationRequest = {
    id: randomUUID(),
    userId: input.userId,
    source: input.source,
    phone: input.phone,
    preferredTime: input.preferredTime,
    issue: input.issue,
    createdAt: new Date().toISOString(),
  };

  await runSql(`
INSERT INTO consultation_requests (
  id, user_id, source, phone, preferred_time, issue, created_at
) VALUES (${sql([
    request.id,
    request.userId,
    request.source,
    request.phone,
    request.preferredTime,
    request.issue,
    request.createdAt,
  ])});
`);

  return request;
}

export async function listUserConsultationRequests(userId: string) {
  const rows = await querySql<ConsultationRow>(`
SELECT * FROM consultation_requests WHERE user_id = ${sql([userId])} ORDER BY created_at DESC;
`);
  return rows.map(rowToConsultation);
}

export async function listAllConsultationRequests() {
  const rows = await querySql<ConsultationRow>("SELECT * FROM consultation_requests ORDER BY created_at DESC;");
  return rows.map(rowToConsultation);
}
