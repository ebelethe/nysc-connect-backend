import express from "express";

import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { createCommunityController, 
    getPendingLandlordsController, 
    getPendingReports, 
    reviewLandlord } from "./admin.controller.js";

const router = express.Router();

router.post("/communities", protect, requireRole("admin"), createCommunityController);
router.get("/landlords/pending",protect, requireRole("admin"),  getPendingLandlordsController);
router.patch("/landlords/:landlordId/review", protect, requireRole("admin"), reviewLandlord);
router.get("reports", protect, requireRole("admin"), getPendingReports)

export default router;
