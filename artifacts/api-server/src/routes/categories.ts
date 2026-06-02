import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCategoryBody, UpdateCategoryBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toCategory = (c: typeof categoriesTable.$inferSelect) => ({
  id: c.id,
  name: c.name,
  imageUrl: c.imageUrl ?? null,
  sortOrder: c.sortOrder,
  isVisible: c.isVisible,
  parentId: c.parentId ?? null,
});

router.get("/", async (_req, res) => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  res.json(cats.map(toCategory));
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [cat] = await db.insert(categoriesTable).values({
    name: parsed.data.name,
    imageUrl: parsed.data.imageUrl ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
    isVisible: parsed.data.isVisible ?? true,
    parentId: parsed.data.parentId ?? null,
  }).returning();

  await auditLog("category_create", req.session.userId!, `Created: ${cat.name}`);
  res.status(201).json(toCategory(cat));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toCategory(cat));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Partial<typeof categoriesTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.imageUrl !== undefined) updates.imageUrl = parsed.data.imageUrl;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;
  if (parsed.data.isVisible !== undefined) updates.isVisible = parsed.data.isVisible;

  const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Not found" }); return; }

  await auditLog("category_update", req.session.userId!, `Updated category ${id}`);
  res.json(toCategory(cat));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  await auditLog("category_delete", req.session.userId!, `Deleted category ${id}`);
  res.status(204).send();
});

export default router;
