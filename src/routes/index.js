import express from "express";

import authRoutes from "../modules/auth/auth.route.js";
import landlordRoutes from "../modules/landlord/landlord.route.js";
import corpsMemberRoutes from "../modules/corpsMember/corpsMember.route.js";
import adminRoutes from "../modules/admin/admin.route.js";

import communityRoutes from "../modules/community/community.route.js";
import postRoutes from "../modules/community/post.route.js";
import engagementRoutes from "../modules/community/engagement.route.js";
import pollRoutes from "../modules/community/poll.route.js";
import memberInteractionRoutes from "../modules/community/memberInteraction.route.js";


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/landlord", landlordRoutes);
router.use("/corps-member", corpsMemberRoutes);
router.use("/admin", adminRoutes);

router.use("/community", communityRoutes);
router.use("/post", postRoutes);
router.use("/engagement", engagementRoutes);
router.use("/poll", pollRoutes);
router.use("/member", memberInteractionRoutes);

export default router;