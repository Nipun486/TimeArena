import express from "express";
import { getLeaderboard } from "../controllers/leaderboardController";
import protect from "../middleware/auth";

const router = express.Router();

// Apply authentication middleware to all leaderboard routes
router.use(protect);

// Get leaderboard (supports optional ?limit=Number query parameter)
router.get("/", getLeaderboard);

export default router;



