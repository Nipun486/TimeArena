"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("./config/db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (_req, res) => {
    res.status(200).json({ ok: true, service: "time-arena-api" });
});
app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
});
app.use((err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: message });
});
const port = Number(process.env.PORT ?? 7000);
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
        app.listen(port, () => {
            // eslint-disable-next-line no-console
            console.log(`API listening on http://localhost:${port}`);
        });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to start server", error);
        process.exit(1);
    }
};
void startServer();
