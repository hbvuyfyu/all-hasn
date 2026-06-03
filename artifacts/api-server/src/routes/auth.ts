import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth.js";
import { auditLog } from "../lib/audit.js";

const router = Router();

const toUser = (u: typeof usersTable.$inferSelect) => ({
  id: u.id,
  phone: u.phone,
  name: u.name,
  role: u.role,
  isBlocked: u.isBlocked,
  walletBalance: Number(u.walletBalance),
  createdAt: u.createdAt.toISOString(),
});

router.post("/register", async (req, res) => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
      return;
    }
    const { phone, password, name } = parsed.data;

    const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Phone number already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({ phone, name, passwordHash }).returning();

    req.session.userId = user.id;
    req.session.role = user.role;

    await auditLog("user_register", user.id, `User registered: ${phone}`);

    res.status(201).json({ user: toUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    const { phone, password } = parsed.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid phone or password" });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({ error: "Account is blocked" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid phone or password" });
      return;
    }

    req.session.userId = user.id;
    req.session.role = user.role;

    await auditLog("user_login", user.id, `User logged in: ${phone}`);

    res.json({ user: toUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()));
    res.clearCookie("connect.sid");
    await auditLog("user_logout", userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "User not found" });
      return;
    }
    res.json(toUser(user));
  } catch (err) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

export default router;
