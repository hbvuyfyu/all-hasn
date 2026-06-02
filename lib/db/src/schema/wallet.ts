import { pgTable, serial, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionTypeEnum = pgEnum("transaction_type", ["recharge", "purchase", "refund"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed", "rejected"]);
export const rechargeStatusEnum = pgEnum("recharge_status", ["pending", "approved", "rejected"]);

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  description: text("description"),
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rechargeRequestsTable = pgTable("recharge_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  approvedAmount: numeric("approved_amount", { precision: 12, scale: 2 }),
  status: rechargeStatusEnum("status").notNull().default("pending"),
  paymentMethodId: integer("payment_method_id").notNull(),
  transactionRef: text("transaction_ref"),
  proofImageUrl: text("proof_image_url"),
  notes: text("notes"),
  reviewedBy: integer("reviewed_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export const insertRechargeRequestSchema = createInsertSchema(rechargeRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertRechargeRequest = z.infer<typeof insertRechargeRequestSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
export type RechargeRequest = typeof rechargeRequestsTable.$inferSelect;
