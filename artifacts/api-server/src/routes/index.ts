import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import categoriesRouter from "./categories.js";
import servicesRouter from "./services.js";
import providersRouter from "./providers.js";
import walletRouter from "./wallet.js";
import ordersRouter from "./orders.js";
import bannersRouter from "./banners.js";
import settingsRouter from "./settings.js";
import paymentMethodsRouter from "./payment-methods.js";
import uploadRouter from "./upload.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/categories", categoriesRouter);
router.use("/services", servicesRouter);
router.use("/providers", providersRouter);
router.use("/wallet", walletRouter);
router.use("/orders", ordersRouter);
router.use("/banners", bannersRouter);
router.use("/settings", settingsRouter);
router.use("/payment-methods", paymentMethodsRouter);
router.use("/upload", uploadRouter);
router.use("/admin", adminRouter);

export default router;
