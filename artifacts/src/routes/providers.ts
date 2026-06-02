import { Router } from "express";
import { db, providersTable, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireSuperAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toProvider = (p: typeof providersTable.$inferSelect) => ({
  id: p.id,
  name: p.name,
  apiUrl: p.apiUrl,
  isActive: p.isActive,
  defaultProfitMargin: p.defaultProfitMargin ? Number(p.defaultProfitMargin) : null,
  defaultCategoryId: p.defaultCategoryId ?? null,
  lastSyncedAt: p.lastSyncedAt ? p.lastSyncedAt.toISOString() : null,
  createdAt: p.createdAt.toISOString(),
});

router.get("/", requireSuperAdmin, async (_req, res) => {
  const providers = await db.select().from(providersTable);
  res.json(providers.map(toProvider));
});

router.post("/", requireSuperAdmin, async (req, res) => {
  const { name, apiUrl, apiKey, defaultProfitMargin, defaultCategoryId, isActive } = req.body;
  if (!name) { res.status(400).json({ error: "Name is required" }); return; }

  const [provider] = await db.insert(providersTable).values({
    name,
    apiUrl: apiUrl || "",
    apiKey: apiKey || "",
    defaultProfitMargin: defaultProfitMargin !== undefined ? String(defaultProfitMargin) : null,
    defaultCategoryId: defaultCategoryId ?? null,
    isActive: isActive ?? true,
  }).returning();

  await auditLog("provider_create", req.session.userId!, `Created provider: ${provider.name}`);
  res.status(201).json(toProvider(provider));
});

router.get("/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [provider] = await db.select().from(providersTable).where(eq(providersTable.id, id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toProvider(provider));
});

router.patch("/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { name, apiUrl, apiKey, defaultProfitMargin, defaultCategoryId, isActive } = req.body;

  const updates: Partial<typeof providersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (apiUrl !== undefined) updates.apiUrl = apiUrl;
  if (apiKey !== undefined && apiKey !== "") updates.apiKey = apiKey;
  if (defaultProfitMargin !== undefined) updates.defaultProfitMargin = String(defaultProfitMargin);
  if (defaultCategoryId !== undefined) updates.defaultCategoryId = defaultCategoryId;
  if (isActive !== undefined) updates.isActive = isActive;

  const [provider] = await db.update(providersTable).set(updates).where(eq(providersTable.id, id)).returning();
  if (!provider) { res.status(404).json({ error: "Not found" }); return; }

  await auditLog("provider_update", req.session.userId!, `Updated provider ${id}`);
  res.json(toProvider(provider));
});

router.delete("/:id", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(providersTable).where(eq(providersTable.id, id));
  await auditLog("provider_delete", req.session.userId!, `Deleted provider ${id}`);
  res.status(204).send();
});

router.get("/:id/services", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const page = 1;
  const limit = 200;
  const services = await db.select().from(servicesTable).where(eq(servicesTable.providerId, id)).limit(limit);
  res.json({ services: services.map(s => ({
    id: s.id, name: s.name, description: s.description, imageUrl: s.imageUrl,
    price: Number(s.price), originalPrice: s.originalPrice ? Number(s.originalPrice) : null,
    isVisible: s.isVisible, isFeatured: s.isFeatured, categoryId: s.categoryId,
    providerId: s.providerId, providerServiceId: s.providerServiceId,
    profitMargin: s.profitMargin ? Number(s.profitMargin) : null,
  })), total: services.length, page, limit });
});

router.patch("/:id/services", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { serviceIds, isVisible } = req.body;
  if (!Array.isArray(serviceIds)) { res.status(400).json({ error: "serviceIds must be array" }); return; }

  let updated = 0;
  for (const sid of serviceIds) {
    await db.update(servicesTable).set({ isVisible }).where(eq(servicesTable.id, sid));
    updated++;
  }
  await auditLog("provider_services_visibility", req.session.userId!, `Updated ${updated} services visibility for provider ${id} → ${isVisible}`);
  res.json({ updated });
});

router.post("/:id/sync", requireSuperAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [provider] = await db.select().from(providersTable).where(eq(providersTable.id, id)).limit(1);
  if (!provider) { res.status(404).json({ error: "Not found" }); return; }

  let synced = 0;
  let total = 0;
  let message = "";

  if (provider.apiUrl && provider.apiKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`${provider.apiUrl}?key=${provider.apiKey}&action=services`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await response.json() as Array<{
        service: string; name: string; type: string;
        rate: string; min: string; max: string; category: string;
      }>;

      if (Array.isArray(data)) {
        total = data.length;
        for (const item of data) {
          const basePrice = parseFloat(item.rate || "0");
          const margin = provider.defaultProfitMargin ? parseFloat(String(provider.defaultProfitMargin)) : 20;
          const price = basePrice * (1 + margin / 100);

          await db.insert(servicesTable).values({
            name: item.name || `Service ${item.service}`,
            price: String(price.toFixed(2)),
            originalPrice: String(basePrice.toFixed(2)),
            providerId: provider.id,
            providerServiceId: String(item.service),
            profitMargin: String(margin),
            categoryId: provider.defaultCategoryId ?? null,
            isVisible: true,
          }).onConflictDoNothing();
          synced++;
        }
        message = `تمت المزامنة: ${synced} خدمة`;
      } else {
        message = "تعذر جلب الخدمات من الـ API";
      }
    } catch (_err) {
      message = "تعذر الاتصال بـ API المزود - تحقق من الرابط والمفتاح";
    }
  } else {
    message = "المزود لا يملك رابط API أو مفتاح - أضف الخدمات يدوياً";
  }

  await db.update(providersTable).set({ lastSyncedAt: new Date() }).where(eq(providersTable.id, id));
  await auditLog("provider_sync", req.session.userId!, `Synced ${synced} services from provider ${id}`);

  res.json({ synced, total, message });
});

export default router;
