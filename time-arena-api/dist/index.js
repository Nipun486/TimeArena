"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import core dependencies and application modules
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const users_1 = __importDefault(require("./routes/users"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
// Create the Express application instance
const app = (0, express_1.default)();
// Configure CORS to allow the client application to communicate with this API
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));
// Parse incoming JSON request bodies
app.use(express_1.default.json());
// Mount API routes
app.use("/api/auth", auth_1.default);
app.use("/api/tasks", tasks_1.default);
app.use("/api/users", users_1.default);
app.use("/api/leaderboard", leaderboard_1.default);
// Simple health check route to verify that the server is running
app.get("/api/health", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});
// Handle unmatched routes with a generic 404 response
app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
});
// Global error handler to catch and respond to server errors
app.use((err, _req, res) => {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: message });
});
// Determine the port to listen on, defaulting to 5000 if not specified
const PORT = Number(process.env.PORT) || 5000;
// Connect to the database and start the HTTP server
(async () => {
    try {
        await (0, db_1.connectDB)();
        app.listen(PORT, () => {
            // eslint-disable-next-line no-console
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to connect to the database", error);
        process.exit(1);
    }
})();
