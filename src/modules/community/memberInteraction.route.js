
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  sendMessageController,
  getConversationController,
  blockMemberController,
  unblockMemberController,
  reportController,
} from "./memberInteraction.controller.js";

const router = express.Router();
router.use(protect, requireRole("corps_member"));

router.post("/report", reportController);
router.post("/messages/:receiverId", sendMessageController);
router.get("/messages/:otherUserId", getConversationController);
router.post("/:memberId/block", blockMemberController);
router.delete("/:memberId/block", unblockMemberController);

export default router;