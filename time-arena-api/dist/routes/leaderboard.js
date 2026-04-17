"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderboardController_1 = require("../controllers/leaderboardController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// Apply authentication middleware to all leaderboard routes
router.use(auth_1.default);
// Get leaderboard (supports optional ?limit=Number query parameter)
router.get("/", leaderboardController_1.getLeaderboard);
exports.default = router;
