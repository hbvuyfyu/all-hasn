import { Router } from "express";
import { db, auditLogsTable, usersTable, ordersTable, rechargeRequestsTable, servicesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { ListAuditLogsQueryParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth.js";

const router = Router();

const toOrder = (o: typeof ordersTable.$inferSelect) => ({
  id: o.id,
  userId: o.userId,
  serviceId: o.serviceId,
  serviceName: o.serviceName,
  serviceImage: o.serviceImage ?? null,
  amount: Number(o.amount),
  quantity: o.quantity,
  status: o.status,
  targetId: o.targetId ?? null,
  providerOrderId: o.providerOrderId ?? null,
  createdAt: o.createdAt.toISOString(),
});

router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [
      [{ count: totalUsers }],
      [{ count: totalOrders }],
      [{ count: pendingRecharges }],
      [{ count: totalServices }],
      recentOrders,
    ] = await Promise.all([
      db.select({ count: count() }).from(usersTable),
      db.select({ count: count() }).from(ordersTable),
      db.select({ count: count() }).from(rechargeRequestsTable).where(eq(rechargeRequestsTable.status, "pending")),
      db.select({ count: count() }).from(servicesTable),
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5),
    ]);

    res.json({
      totalUsers: Number(totalUsers),
      totalOrders: Number(totalOrders),
      totalRevenue: 0,
      pendingRecharges: Number(pendingRecharges),
      totalServices: Number(totalServices),
      recentOrders: recentOrders.map(toOrder),
      revenueThisMonth: 0,
      newUsersThisMonth: 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/audit-logs", requireAdmin, async (req, res) => {
  try {
    const parsed = ListAuditLogsQueryParams.safeParse(req.query);
    const page = parsed.success && parsed.data.page ? Number(parsed.data.page) : 1;
    const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 20;
    const offset = (page - 1) * limit;

    const [logs, [{ count: total }], users] = await Promise.all([
      db.select().from(auditLogsTable).orderBy(desc(auditLogsTable.createdAt)).limit(limit).offset(offset),
      db.select({ count: count() }).from(auditLogsTable),
      db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable),
    ]);

    const userMap = new Map(users.map(u => [u.id, u.name]));
    const result = logs.map(l => ({
      id: l.id,
      action: l.action,
      userId: l.userId ?? null,
      userName: l.userId ? (userMap.get(l.userId) ?? null) : null,
      details: l.details ?? null,
      createdAt: l.createdAt.toISOString(),
    }));

    res.json({ logs: result, total: Number(total), page, limit });
  } catch (err) {
    res.status(500).json({ error: "Failed to get audit logs" });
  }
});

export default router;
