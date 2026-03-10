import express from "express";
import taskController from "../controllers/taskController";
import protect from "../middleware/auth";

const router = express.Router();

// Protect all task routes
router.use(protect);

// Get all tasks for the authenticated user
router.get("/", taskController.getAllTasks);

// Create a new task for the authenticated user
router.post("/", taskController.createTask);

// Get a single task by its ID
router.get("/:id", taskController.getTaskById);

// Start a task by its ID
router.patch("/:id/start", taskController.startTask);

// Toggle completion state of a subtask within a task
router.patch("/:id/subtask/:sid", taskController.toggleSubtask);

// Mark a task as complete
router.post("/:id/complete", taskController.completeTask);

// Delete a task by its ID
router.delete("/:id", taskController.deleteTask);

export default router;

