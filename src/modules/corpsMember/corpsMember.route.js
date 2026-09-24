import express from "express";
import { profileSetup, profile, profilePhoto} from "./corpsMember.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { upload } from "../../config/uploads/upload.js";
const router = express.Router();

router.post("/profile-setup", protect, requireRole("corps_member"), profileSetup);
router.get("/profile", protect, requireRole("corps_member"), profile);
router.post(
    "/profile-photo", 
    protect, 
    requireRole("corps_member"), 
    upload.single("profilePhoto"), 
    profilePhoto);

export default router;