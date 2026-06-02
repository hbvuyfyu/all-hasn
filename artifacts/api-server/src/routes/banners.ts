import { Router } from "express";
import { db, bannersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toBanner = (b: typeof bannersTable.$inferSelect) => ({
  id: b.id,
  imageUrl: b.imageUrl,
  images: (b.images as string[]) || [],
  frameHeight: b.frameHeight,
  title: b.title ?? null,
  linkUrl: b.linkUrl ?? null,
  isActive: b.isActive,
  sortOrder: b.sortOrder,
});

router.get("/", async (_req, res) => {
  const banners = await db.select().from(bannersTable)
    .where(eq(bannersTable.isActive, true))
    .orderBy(bannersTable.sortOrder);
  res.json(banners.map(toBanner));
});

router.get("/all", requireAdmin, async (_req, res) => {
  const banners = await db.select().from(bannersTable).orderBy(bannersTable.sortOrder);
  res.json(banners.map(toBanner));
});

router.post("/", requireAdmin, async (req, res) => {
  const { imageUrl, images, frameHeight, title, linkUrl, isActive, sortOrder } = req.body;
  const [banner] = await db.insert(bannersTable).values({
    imageUrl: imageUrl || "",
    images: images || [],
    frameHeight: frameHeight || 400,
    title: title ?? null,
    linkUrl: linkUrl ?? null,
    isActive: isActive ?? true,
    sortOrder: sortOrder ?? 0,
  }).returning();
  await auditLog("banner_create", req.session.userId!, `Created banner`);
  res.status(201).json(toBanner(banner));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { imageUrl, images, frameHeight, title, linkUrl, isActive, sortOrder } = req.body;
  const updates: Partial<typeof bannersTable.$inferInsert> = {};
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (images !== undefined) updates.images = images;
  if (frameHeight !== undefined) updates.frameHeight = frameHeight;
  if (title !== undefined) updates.title = title;
  if (linkUrl !== undefined) updates.linkUrl = linkUrl;
  if (isActive !== undefined) updates.isActive = isActive;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;
  const [banner] = await db.update(bannersTable).set(updates).where(eq(bannersTable.id, id)).returning();
  if (!banner) { res.status(404).json({ error: "Not found" }); return; }
  await auditLog("banner_update", req.session.userId!, `Updated banner ${id}`);
  res.json(toBanner(banner));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(bannersTable).where(eq(bannersTable.id, id));
  await auditLog("banner_delete", req.session.userId!, `Deleted banner ${id}`);
  res.status(204).send();
});

export default router;
