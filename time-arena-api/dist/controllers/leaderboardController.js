"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = void 0;
const User_1 = require("../models/User");
/**
 * Returns a leaderboard of users ranked by total XP.
 *
 * Limit behavior:
 * - If `req.query.limit` is not provided, a default of 50 is used.
 * - If `req.query.limit` is a valid number, that value is used but capped at a maximum of 100.
 * - If `req.query.limit` is invalid (e.g. non-numeric), the default of 50 is used.
 *
 * The response includes only the following user fields:
 * - id
 * - username
 * - totalXP
 * - currentStreak
 * Along with derived fields:
 * - rank (1-based index in the sorted list)
 * - level (calculated as Math.floor(totalXP / 100))
 */
const getLeaderboard = async (req, res) => {
    try {
        const DEFAULT_LIMIT = 50;
        const MAX_LIMIT = 100;
        let limit = DEFAULT_LIMIT;
        if (typeof req.query.limit === "string") {
            const parsed = parseInt(req.query.limit, 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                limit = Math.min(parsed, MAX_LIMIT);
            }
        }
        const users = await User_1.User.find({}, {
            _id: 1,
            username: 1,
            totalXP: 1,
            currentStreak: 1,
        })
            .sort({ totalXP: -1 })
            .limit(limit);
        const leaderboard = users.map((user, index) => {
            const totalXP = user.totalXP || 0;
            return {
                rank: index + 1,
                level: Math.floor(totalXP / 100),
                id: user._id,
                username: user.username,
                totalXP,
                currentStreak: user.currentStreak ?? 0,
            };
        });
        return res.status(200).json({
            total: leaderboard.length,
            limit,
            leaderboard,
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};
exports.getLeaderboard = getLeaderboard;
