import express from "express";

import authRoutes from "../modules/auth/auth.route.js";
import landlordRoutes from "../modules/landlord/landlord.route.js";
import corpsMemberRoutes from "../modules/corpsMember/corpsMember.route.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/landlord", landlordRoutes);
router.use("/corps-member", corpsMemberRoutes);

export default router;