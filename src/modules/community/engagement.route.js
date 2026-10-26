
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  toggleLikeController,
  addCommentController,
  getCommentsController,
  toggleSaveController,
  getSavedPostsController,
} from "./engagement.controller.js";

const router = express.Router();
router.use(protect, requireRole("corps_member"));

router.get("/saved-posts", getSavedPostsController);
router.post("/:postId/like", toggleLikeController);
router.post("/:postId/comments", addCommentController);
router.get("/:postId/comments", getCommentsController);
router.post("/:postId/save", toggleSaveController);

export default router;