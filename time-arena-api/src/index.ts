// Import core dependencies and application modules
import express, { type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import {connectDB} from "./config/db";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";
import userRoutes from "./routes/users";
import leaderboardRoutes from "./routes/leaderboard";


// Create the Express application instance
const app = express();

// Configure CORS to allow the client application to communicate with this API
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  }),
);

// Parse incoming JSON request bodies
app.use(express.json());

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

// Simple health check route to verify that the server is running
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running" });
});

// Handle unmatched routes with a generic 404 response
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler to catch and respond to server errors
app.use((err: unknown, _req: Request, res: Response) => {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  res.status(500).json({ error: message });
});

// Determine the port to listen on, defaulting to 5000 if not specified
const PORT = Number(process.env.PORT) || 5000;

// Connect to the database and start the HTTP server
(async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
})();

