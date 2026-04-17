"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = __importDefault(require("../controllers/taskController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// Protect all task routes
router.use(auth_1.default);
// Get all tasks for the authenticated user
router.get("/", taskController_1.default.getAllTasks);
// Create a new task for the authenticated user
router.post("/", taskController_1.default.createTask);
// Get a single task by its ID
router.get("/:id", taskController_1.default.getTaskById);
// Start a task by its ID
router.patch("/:id/start", taskController_1.default.startTask);
// Toggle completion state of a subtask within a task
router.patch("/:id/subtask/:sid", taskController_1.default.toggleSubtask);
// Mark a task as complete
router.post("/:id/complete", taskController_1.default.completeTask);
// Delete a task by its ID
router.delete("/:id", taskController_1.default.deleteTask);
exports.default = router;
