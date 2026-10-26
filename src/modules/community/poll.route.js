
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { voteController, getResultsController } from "./poll.controller.js";

const router = express.Router();
router.use(protect, requireRole("corps_member"));

router.post("/:pollId/vote", voteController);
router.get("/:pollId/results", getResultsController);

export default router;