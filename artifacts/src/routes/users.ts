import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or, count } from "drizzle-orm";
import { ListUsersQueryParams, UpdateUserBody, BlockUserBody } from "@workspace/api-zod";
import { requireAdmin, requireSuperAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toUser = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  phone: u.phone,
  name: u.name,
  role: u.role,
  isBlocked: u.isBlocked,
  walletBalance: Number(u.walletBalance),
  createdAt: u.createdAt.toISOString(),
});

router.get("/", requireAdmin, async (req, res) => {
  const parsed = ListUsersQueryParams.safeParse(req.query);
  const page = parsed.success && parsed.data.page ? Number(parsed.data.page) : 1;
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 20;
  const search = parsed.success ? parsed.data.search : undefined;
  const offset = (page - 1) * limit;

  let query = db.select().from(usersTable);
  let countQuery = db.select({ count: count() }).from(usersTable);

  if (search) {
    const condition = or(ilike(usersTable.phone, `%${search}%`), ilike(usersTable.name, `%${search}%`));
    query = query.where(condition) as typeof query;
    countQuery = countQuery.where(condition) as typeof countQuery;
  }

  const [users, [{ count: total }]] = await Promise.all([
    query.limit(limit).offset(offset),
    countQuery,
  ]);

  res.json({ users: users.map(toUser), total: Number(total), page, limit });
});

router.get("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(toUser(user));
});

router.patch("/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.role !== undefined) updates.role = parsed.data.role as "user" | "admin" | "super_admin";

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await auditLog("user_update", req.session.userId!, `Updated user ${id}: ${JSON.stringify(parsed.data)}`);
  res.json(toUser(user));
});

router.patch("/:id/block", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = BlockUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [user] = await db.update(usersTable).set({ isBlocked: parsed.data.isBlocked }).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  await auditLog(parsed.data.isBlocked ? "user_block" : "user_unblock", req.session.userId!, `User ${id}`);
  res.json(toUser(user));
});

router.patch("/:id/wallet", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { amount, note } = req.body;
  if (typeof amount !== "number") { res.status(400).json({ error: "amount must be a number" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "User not found" }); return; }

  const currentBalance = Number(existing.walletBalance);
  const newBalance = Math.max(0, currentBalance + amount);

  const [user] = await db.update(usersTable)
    .set({ walletBalance: String(newBalance.toFixed(2)) })
    .where(eq(usersTable.id, id))
    .returning();

  await auditLog("wallet_adjust", req.session.userId!, `Adjusted wallet for user ${id}: ${amount > 0 ? "+" : ""}${amount} (${note || "no note"}). New balance: ${newBalance.toFixed(2)}`);
  res.json(toUser(user));
});

export default router;
