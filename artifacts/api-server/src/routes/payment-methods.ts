import { Router } from "express";
import { db, paymentMethodsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePaymentMethodBody, UpdatePaymentMethodBody } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toPaymentMethod = (p: typeof paymentMethodsTable.$inferSelect) => ({
  id: p.id,
  name: p.name,
  details: p.details ?? null,
  instructions: p.instructions ?? null,
  accountNumber: p.accountNumber ?? null,
  isActive: p.isActive,
  sortOrder: p.sortOrder,
});

router.get("/", async (_req, res) => {
  const methods = await db.select().from(paymentMethodsTable)
    .where(eq(paymentMethodsTable.isActive, true))
    .orderBy(paymentMethodsTable.sortOrder);
  res.json(methods.map(toPaymentMethod));
});

router.post("/", requireAdmin, async (req, res) => {
  const parsed = CreatePaymentMethodBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [method] = await db.insert(paymentMethodsTable).values({
    name: parsed.data.name,
    details: parsed.data.details ?? null,
    instructions: parsed.data.instructions ?? null,
    accountNumber: parsed.data.accountNumber ?? null,
    isActive: parsed.data.isActive ?? true,
    sortOrder: parsed.data.sortOrder ?? 0,
  }).returning();

  await auditLog("payment_method_create", req.session.userId!, `Created payment method: ${method.name}`);
  res.status(201).json(toPaymentMethod(method));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const parsed = UpdatePaymentMethodBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const updates: Partial<typeof paymentMethodsTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.details !== undefined) updates.details = parsed.data.details;
  if (parsed.data.instructions !== undefined) updates.instructions = parsed.data.instructions;
  if (parsed.data.accountNumber !== undefined) updates.accountNumber = parsed.data.accountNumber;
  if (parsed.data.isActive !== undefined) updates.isActive = parsed.data.isActive;
  if (parsed.data.sortOrder !== undefined) updates.sortOrder = parsed.data.sortOrder;

  const [method] = await db.update(paymentMethodsTable).set(updates).where(eq(paymentMethodsTable.id, id)).returning();
  if (!method) { res.status(404).json({ error: "Not found" }); return; }

  await auditLog("payment_method_update", req.session.userId!, `Updated payment method ${id}`);
  res.json(toPaymentMethod(method));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(paymentMethodsTable).where(eq(paymentMethodsTable.id, id));
  await auditLog("payment_method_delete", req.session.userId!, `Deleted payment method ${id}`);
  res.status(204).send();
});

export default router;
