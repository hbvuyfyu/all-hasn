import { Router } from "express";
import multer from "multer";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { requireAuth } from "../middlewares/auth.js";

const uploadsDir = join(process.cwd(), "uploads");
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop() || "jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

const router = Router();

router.post("/", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;
