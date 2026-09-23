import { Router } from "express";
import { getAdminStats, getAdminSystemStatus, getAdminUsers } from "../../controllers/adminController.js";
import { protect, adminOnly } from "../../middleware/authMiddleware.js";

const router = Router();

// Protect all admin endpoints with both authentication and ADMIN role check
router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/system", getAdminSystemStatus);
router.get("/users", getAdminUsers);

export default router;
