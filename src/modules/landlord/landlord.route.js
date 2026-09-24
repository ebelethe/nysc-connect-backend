
import express from "express";
import { verifyIdentity, personalInfo} from "./landlord.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { upload } from "../../config/uploads/upload.js";

const router = express.Router();

router.post(
    "/personal-info",
    protect,
    requireRole("landlord"),
    upload.single("profilePhoto"),
    personalInfo
);

router.post(
  "/verify-identity",
  protect,
  requireRole("landlord"),
  upload.fields([
    { name: "idDocument", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  verifyIdentity
);

export default router;
