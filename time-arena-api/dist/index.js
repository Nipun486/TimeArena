import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
async function start() {
    await connectDB();
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`API listening on http://localhost:${port}`);
    });
}
start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", err);
    process.exit(1);
});
