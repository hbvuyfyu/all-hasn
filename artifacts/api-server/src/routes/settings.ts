import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
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

router.get("/", async (_req, res) => {
  try {
    const [settings] = await db.select().from(siteSettingsTable).limit(1);
    if (!settings) {
      const [created] = await db.insert(siteSettingsTable).values({}).returning();
      res.json(toSettings(created));
      return;
    }
    res.json(toSettings(settings));
  } catch (err) {
    res.status(500).json({ error: "Failed to get settings" });
  }
});

router.patch("/", requireSuperAdmin, async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
