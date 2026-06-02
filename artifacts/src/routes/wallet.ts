import { Router } from "express";
import { db, usersTable, transactionsTable, rechargeRequestsTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { RequestRechargeBody, ListTransactionsQueryParams, ListRechargeRequestsQueryParams, ApproveRechargeBody } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toTransaction = (t: typeof transactionsTable.$inferSelect) => ({
  id: t.id,
  type: t.type,
  amount: Number(t.amount),
  status: t.status,
  description: t.description ?? null,
  createdAt: t.createdAt.toISOString(),
});

const toRechargeRequest = (r: typeof rechargeRequestsTable.$inferSelect, userName?: string, userPhone?: string) => ({
  id: r.id,
  userId: r.userId,
  userName: userName ?? "",
  userPhone: userPhone ?? "",
  amount: Number(r.amount),
  approvedAmount: r.approvedAmount ? Number(r.approvedAmount) : null,
  status: r.status,
  transactionRef: r.transactionRef ?? null,
  proofImageUrl: r.proofImageUrl ?? null,
  notes: r.notes ?? null,
  paymentMethodId: r.paymentMethodId,
  createdAt: r.createdAt.toISOString(),
});

router.get("/", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ balance: Number(user.walletBalance), userId: user.id, currency: "USD" });
});

router.get("/transactions", requireAuth, async (req, res) => {
  const parsed = ListTransactionsQueryParams.safeParse(req.query);
  const page = parsed.success && parsed.data.page ? Number(parsed.data.page) : 1;
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 20;
  const offset = (page - 1) * limit;

  const [transactions, [{ count: total }]] = await Promise.all([
    db.select().from(transactionsTable)
      .where(eq(transactionsTable.userId, req.session.userId!))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(limit).offset(offset),
    db.select({ count: count() }).from(transactionsTable)
      .where(eq(transactionsTable.userId, req.session.userId!)),
  ]);

  res.json({ transactions: transactions.map(toTransaction), total: Number(total), page, limit });
});

router.post("/recharge", requireAuth, async (req, res) => {
  const parsed = RequestRechargeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [request] = await db.insert(rechargeRequestsTable).values({
    userId: req.session.userId!,
    amount: String(parsed.data.amount),
    paymentMethodId: parsed.data.paymentMethodId,
    transactionRef: parsed.data.transactionRef ?? null,
    proofImageUrl: parsed.data.proofImageUrl ?? null,
    notes: parsed.data.notes ?? null,
  }).returning();

  await auditLog("recharge_request", req.session.userId!, `Requested recharge of $${parsed.data.amount}`);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
  res.status(201).json(toRechargeRequest(request, user?.name, user?.phone));
});

router.get("/recharge-requests", requireAdmin, async (req, res) => {
  const parsed = ListRechargeRequestsQueryParams.safeParse(req.query);
  const page = parsed.success && parsed.data.page ? Number(parsed.data.page) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const status = parsed.success ? parsed.data.status : undefined;

  let query = db.select().from(rechargeRequestsTable);
  let countQuery = db.select({ count: count() }).from(rechargeRequestsTable);

  if (status) {
    const cond = eq(rechargeRequestsTable.status, status as "pending" | "approved" | "rejected");
    query = query.where(cond) as typeof query;
    countQuery = countQuery.where(cond) as typeof countQuery;
  }

  const [requests, [{ count: total }], users] = await Promise.all([
    query.orderBy(desc(rechargeRequestsTable.createdAt)).limit(limit).offset(offset),
    countQuery,
    db.select({ id: usersTable.id, name: usersTable.name, phone: usersTable.phone }).from(usersTable),
  ]);

  const userMap = new Map(users.map(u => [u.id, u]));
  const result = requests.map(r => {
    const u = userMap.get(r.userId);
    return toRechargeRequest(r, u?.name, u?.phone);
  });

  res.json({ requests: result, total: Number(total), page, limit });
});

router.patch("/recharge-requests/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = ApproveRechargeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [request] = await db.select().from(rechargeRequestsTable).where(eq(rechargeRequestsTable.id, id)).limit(1);
  if (!request) { res.status(404).json({ error: "Not found" }); return; }
  if (request.status !== "pending") { res.status(400).json({ error: "Request already processed" }); return; }

  const approvedAmount = parsed.data.approvedAmount;

  await Promise.all([
    db.update(rechargeRequestsTable).set({
      status: "approved",
      approvedAmount: String(approvedAmount),
      reviewedBy: req.session.userId,
    }).where(eq(rechargeRequestsTable.id, id)),
    db.insert(transactionsTable).values({
      userId: request.userId,
      type: "recharge",
      amount: String(approvedAmount),
      status: "completed",
      description: `Wallet recharge approved`,
      relatedId: id,
    }),
  ]);

  // Add balance to user
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, request.userId)).limit(1);
  const newBalance = (Number(user?.walletBalance) || 0) + approvedAmount;
  await db.update(usersTable).set({ walletBalance: String(newBalance.toFixed(2)) }).where(eq(usersTable.id, request.userId));

  await auditLog("recharge_approve", req.session.userId!, `Approved recharge ${id} for $${approvedAmount} to user ${request.userId}`);

  const [updated] = await db.select().from(rechargeRequestsTable).where(eq(rechargeRequestsTable.id, id)).limit(1);
  const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, request.userId)).limit(1);
  res.json(toRechargeRequest(updated, updatedUser?.name, updatedUser?.phone));
});

router.patch("/recharge-requests/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [request] = await db.select().from(rechargeRequestsTable).where(eq(rechargeRequestsTable.id, id)).limit(1);
  if (!request) { res.status(404).json({ error: "Not found" }); return; }
  if (request.status !== "pending") { res.status(400).json({ error: "Request already processed" }); return; }

  const [updated] = await db.update(rechargeRequestsTable).set({
    status: "rejected",
    reviewedBy: req.session.userId,
  }).where(eq(rechargeRequestsTable.id, id)).returning();

  await auditLog("recharge_reject", req.session.userId!, `Rejected recharge ${id}`);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, request.userId)).limit(1);
  res.json(toRechargeRequest(updated, user?.name, user?.phone));
});

export default router;
