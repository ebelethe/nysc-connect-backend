
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { upload } from "../../config/cloudinary.js";
import {
  createPostController,
  getFeedController,
  getPostDetailController,
  deletePostController,
} from "./post.controller.js";

const router = express.Router();
router.use(protect, requireRole("corps_member"));

router.post("/community/:communityId", upload.array("images", 5), createPostController);
router.get("/community/:communityId", getFeedController);
router.get("/:postId", getPostDetailController);
router.delete("/:postId", deletePostController);

export default router;