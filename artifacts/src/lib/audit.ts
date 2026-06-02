import { db, auditLogsTable } from "@workspace/db";

export async function auditLog(action: string, userId: number | null, details?: string) {
  try {
    await db.insert(auditLogsTable).values({ action, userId, details: details ?? null });
  } catch {
    // Non-critical — don't let audit failures break the request
  }
}
