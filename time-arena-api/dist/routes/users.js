"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// Protect all user routes
router.use(auth_1.default);
// Get analytics data for the authenticated user
router.get('/me/analytics', userController_1.default.getAnalytics);
// Get profile information for the authenticated user
router.get('/me', userController_1.default.getMe);
exports.default = router;
