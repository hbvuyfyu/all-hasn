import { Router } from "express";
import { db, ordersTable, servicesTable, usersTable, transactionsTable, providersTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { ListOrdersQueryParams, CreateOrderBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth.js";

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

router.get("/", requireAuth, async (req, res) => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  const page = parsed.success && parsed.data.page ? Number(parsed.data.page) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const isAdmin = req.session.role === "admin" || req.session.role === "super_admin";

  const statusFilter = parsed.success && parsed.data.status
    ? parsed.data.status as "pending" | "processing" | "completed" | "failed" | "cancelled"
    : undefined;

  let orders: (typeof ordersTable.$inferSelect)[];
  let total: number;

  if (isAdmin) {
    if (statusFilter) {
      [orders, [{ count: total }]] = await Promise.all([
        db.select().from(ordersTable).where(eq(ordersTable.status, statusFilter)).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
        db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, statusFilter)),
      ]);
    } else {
      [orders, [{ count: total }]] = await Promise.all([
        db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
        db.select({ count: count() }).from(ordersTable),
      ]);
    }
  } else {
    if (statusFilter) {
      [orders, [{ count: total }]] = await Promise.all([
        db.select().from(ordersTable).where(and(eq(ordersTable.userId, req.session.userId!), eq(ordersTable.status, statusFilter))).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
        db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.userId, req.session.userId!), eq(ordersTable.status, statusFilter))),
      ]);
    } else {
      [orders, [{ count: total }]] = await Promise.all([
        db.select().from(ordersTable).where(eq(ordersTable.userId, req.session.userId!)).orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
        db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.userId, req.session.userId!)),
      ]);
    }
  }

  res.json({ orders: orders.map(toOrder), total: Number(total), page, limit });
});

router.post("/", requireAuth, async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, parsed.data.serviceId)).limit(1);
  if (!service) { res.status(404).json({ error: "Service not found" }); return; }
  if (!service.isVisible) { res.status(400).json({ error: "Service is not available" }); return; }

  const totalAmount = Number(service.price) * parsed.data.quantity;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }

  if (Number(user.walletBalance) < totalAmount) {
    res.status(400).json({ error: "Insufficient wallet balance" });
    return;
  }

  const newBalance = Number(user.walletBalance) - totalAmount;

  const [order] = await db.insert(ordersTable).values({
    userId: req.session.userId!,
    serviceId: service.id,
    serviceName: service.name,
    serviceImage: service.imageUrl ?? null,
    amount: String(totalAmount.toFixed(2)),
    quantity: parsed.data.quantity,
    status: "pending",
    targetId: parsed.data.targetId,
  }).returning();

  await Promise.all([
    db.update(usersTable).set({ walletBalance: String(newBalance.toFixed(2)) }).where(eq(usersTable.id, req.session.userId!)),
    db.insert(transactionsTable).values({
      userId: req.session.userId!,
      type: "purchase",
      amount: String(totalAmount.toFixed(2)),
      status: "completed",
      description: `Order: ${service.name}`,
      relatedId: order.id,
    }),
  ]);

  // Auto-fulfillment: if service has a provider and providerServiceId, call provider API
  if (service.providerId && service.providerServiceId) {
    try {
      const [provider] = await db.select().from(providersTable).where(eq(providersTable.id, service.providerId)).limit(1);
      if (provider && provider.isActive && provider.apiUrl && provider.apiKey) {
        const body = new URLSearchParams({
          key: provider.apiKey,
          action: "add",
          service: service.providerServiceId,
          link: parsed.data.targetId || "",
          quantity: String(parsed.data.quantity),
        });
        const response = await fetch(provider.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
          signal: AbortSignal.timeout(15000),
        });
        const result = await response.json() as any;
        if (result.order) {
          await db.update(ordersTable)
            .set({ providerOrderId: String(result.order), status: "processing" })
            .where(eq(ordersTable.id, order.id));
          res.status(201).json({ ...toOrder(order), providerOrderId: String(result.order), status: "processing" });
          return;
        }
      }
    } catch {
      // Auto-fulfillment failed silently — order remains pending for manual processing
    }
  }

  res.status(201).json(toOrder(order));
});

router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!order) { res.status(404).json({ error: "Not found" }); return; }

  const isAdmin = req.session.role === "admin" || req.session.role === "super_admin";
  if (!isAdmin && order.userId !== req.session.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  res.json(toOrder(order));
});

export default router;
