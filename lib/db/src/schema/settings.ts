import { pgTable, serial, text, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("HASN"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  instagramUrl: text("instagram_url"),
  whatsappUrl: text("whatsapp_url"),
  facebookUrl: text("facebook_url"),
  telegramUrl: text("telegram_url"),
  globalProfitMargin: numeric("global_profit_margin", { precision: 5, scale: 2 }),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  currency: text("currency").notNull().default("USD"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentMethodsTable = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  details: text("details"),
  instructions: text("instructions"),
  accountNumber: text("account_number"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  action: text("action").notNull(),
  userId: integer("user_id"),
  details: text("details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, updatedAt: true });
export const insertPaymentMethodSchema = createInsertSchema(paymentMethodsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
export type PaymentMethod = typeof paymentMethodsTable.$inferSelect;
export type AuditLog = typeof auditLogsTable.$inferSelect;
