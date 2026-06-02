import { Router } from "express";
import { db, siteSettingsTable, paymentMethodsTable, auditLogsTable, usersTable, ordersTable, rechargeRequestsTable, servicesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { UpdateSettingsBody, ListAuditLogsQueryParams } from "@workspace/api-zod";
import { requireSuperAdmin, requireAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toSettings = (s: typeof siteSettingsTable.$inferSelect) => ({
  siteName: s.siteName,
  logoUrl: s.logoUrl ?? null,
  faviconUrl: s.faviconUrl ?? null,
  instagramUrl: s.instagramUrl ?? null,
  whatsappUrl: s.whatsappUrl ?? null,
  facebookUrl: s.facebookUrl ?? null,
  telegramUrl: s.telegramUrl ?? null,
  globalProfitMargin: s.globalProfitMargin ? Number(s.globalProfitMargin) : null,
  maintenanceMode: s.maintenanceMode,
  currency: s.currency,
});

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

// Site settings
router.get("/", async (_req, res) => {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  if (!settings) {
    const [created] = await db.insert(siteSettingsTable).values({}).returning();
    res.json(toSettings(created));
    return;
  }
  res.json(toSettings(settings));
});

router.patch("/", requireSuperAdmin, async (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [existing] = await db.select().from(siteSettingsTable).limit(1);

  const updates: Partial<typeof siteSettingsTable.$inferInsert> = { updatedAt: new Date() };
  if (parsed.data.siteName !== undefined) updates.siteName = parsed.data.siteName;
  if (parsed.data.logoUrl !== undefined) updates.logoUrl = parsed.data.logoUrl;
  if (parsed.data.faviconUrl !== undefined) updates.faviconUrl = parsed.data.faviconUrl;
  if (parsed.data.instagramUrl !== undefined) updates.instagramUrl = parsed.data.instagramUrl;
  if (parsed.data.whatsappUrl !== undefined) updates.whatsappUrl = parsed.data.whatsappUrl;
  if (parsed.data.facebookUrl !== undefined) updates.facebookUrl = parsed.data.facebookUrl;
  if (parsed.data.telegramUrl !== undefined) updates.telegramUrl = parsed.data.telegramUrl;
  if (parsed.data.globalProfitMargin !== undefined) updates.globalProfitMargin = String(parsed.data.globalProfitMargin);
  if (parsed.data.maintenanceMode !== undefined) updates.maintenanceMode = parsed.data.maintenanceMode;
  if (parsed.data.currency !== undefined) updates.currency = parsed.data.currency;

  let result;
  if (existing) {
    [result] = await db.update(siteSettingsTable).set(updates).where(eq(siteSettingsTable.id, existing.id)).returning();
  } else {
    [result] = await db.insert(siteSettingsTable).values(updates).returning();
  }

  await auditLog("settings_update", req.session.userId!, "Updated site settings");
  res.json(toSettings(result));
});

// Admin stats
router.get("/admin/stats", requireAdmin, async (_req, res) => {
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
});

// Audit logs
router.get("/admin/audit-logs", requireAdmin, async (req, res) => {
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
});

export default router;
