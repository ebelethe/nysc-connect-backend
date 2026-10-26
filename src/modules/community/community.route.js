
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import {
  getStates,
  getCommunitiesByStateController,
  searchCommunitiesController,
  joinCommunityController,
  leaveCommunityController,
  getMyCommunitiesController,
  getCommunityMembersController,
  getGuidelinesController,
} from "./community.controller.js";

const router = express.Router();
router.use(protect, requireRole("corps_member"));

router.get("/states", getStates);
router.get("/states/:state", getCommunitiesByStateController);
router.get("/search", searchCommunitiesController);
router.post("/:communityId/join", joinCommunityController);
router.post("/:communityId/leave", leaveCommunityController);
router.get("/my-communities", getMyCommunitiesController);
router.get("/:communityId/members", getCommunityMembersController);
router.get("/:communityId/guidelines", getGuidelinesController);

export default router;