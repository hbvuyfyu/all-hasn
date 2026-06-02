import { Router } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq, and, ilike, count, SQL } from "drizzle-orm";
import { ListServicesQueryParams, CreateServiceBody, UpdateServiceBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toService = (s: typeof servicesTable.$inferSelect) => ({
  id: s.id,
  name: s.name,
  description: s.description ?? null,
  imageUrl: s.imageUrl ?? null,
  price: Number(s.price),
  originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
  isVisible: s.isVisible,
  isFeatured: s.isFeatured,
  categoryId: s.categoryId ?? null,
  providerId: s.providerId ?? null,
  providerServiceId: s.providerServiceId ?? null,
  profitMargin: s.profitMargin ? Number(s.profitMargin) : null,
});

router.get("/featured", async (_req, res) => {
  const services = await db.select().from(servicesTable)
    .where(and(eq(servicesTable.isFeatured, true), eq(servicesTable.isVisible, true)))
    .limit(12);
  res.json(services.map(toService));
});

router.get("/", async (req, res) => {
  const parsed = ListServicesQueryParams.safeParse(req.query);
  const page = parsed.success && parsed.data.page ? Number(parsed.data.page) : 1;
  const limit = parsed.success && parsed.data.limit ? Number(parsed.data.limit) : 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (parsed.success) {
    if (parsed.data.categoryId) conditions.push(eq(servicesTable.categoryId, Number(parsed.data.categoryId)));
    if (parsed.data.featured !== undefined) conditions.push(eq(servicesTable.isFeatured, parsed.data.featured === true || parsed.data.featured === "true" as never));
    if (parsed.data.search) conditions.push(ilike(servicesTable.name, `%${parsed.data.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [services, [{ count: total }]] = await Promise.all([
    (whereClause ? db.select().from(servicesTable).where(whereClause) : db.select().from(servicesTable)).limit(limit).offset(offset),
    (whereClause ? db.select({ count: count() }).from(servicesTable).where(whereClause) : db.select({ count: count() }).from(servicesTable)),
  ]);

  res.json({ services: services.map(toService), total: Number(total), page, limit });
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [service] = await db.insert(servicesTable).values({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    price: String(parsed.data.price),
    categoryId: parsed.data.categoryId ?? null,
    isFeatured: parsed.data.isFeatured ?? false,
    isVisible: parsed.data.isVisible ?? true,
    profitMargin: parsed.data.profitMargin !== undefined ? String(parsed.data.profitMargin) : null,
  }).returning();

  await auditLog("service_create", req.session.userId!, `Created service: ${service.name}`);
  res.status(201).json(toService(service));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, id)).limit(1);
  if (!service) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toService(service));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Partial<typeof servicesTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.price !== undefined) updates.price = String(parsed.data.price);
  if (parsed.data.categoryId !== undefined) updates.categoryId = parsed.data.categoryId;
  if (parsed.data.isFeatured !== undefined) updates.isFeatured = parsed.data.isFeatured;
  if (parsed.data.isVisible !== undefined) updates.isVisible = parsed.data.isVisible;
  if (parsed.data.profitMargin !== undefined) updates.profitMargin = String(parsed.data.profitMargin);

  const [service] = await db.update(servicesTable).set(updates).where(eq(servicesTable.id, id)).returning();
  if (!service) { res.status(404).json({ error: "Not found" }); return; }

  await auditLog("service_update", req.session.userId!, `Updated service ${id}`);
  res.json(toService(service));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(servicesTable).where(eq(servicesTable.id, id));
  await auditLog("service_delete", req.session.userId!, `Deleted service ${id}`);
  res.status(204).send();
});

export default router;
