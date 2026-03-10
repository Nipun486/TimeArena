import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import {
  completeTask,
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  startTask,
  toggleSubtask,
} from "./controllers/taskController";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);

// Protected task routes
app.post("/tasks", authMiddleware, createTask);
app.get("/tasks", authMiddleware, getAllTasks);
app.get("/tasks/:id", authMiddleware, getTaskById);
app.post("/tasks/:id/start", authMiddleware, startTask);
app.post("/tasks/:id/subtasks/:sid/toggle", authMiddleware, toggleSubtask);
app.post("/tasks/:id/complete", authMiddleware, completeTask);
app.delete("/tasks/:id", authMiddleware, deleteTask);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, service: "time-arena-api" });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ error: message });
});

const port = Number(process.env.PORT ?? 7000);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void startServer();

