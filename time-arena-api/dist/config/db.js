"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const mongoUri = process.env.MONGODB_URI;
console.log(mongoUri);
if (mongoUri == null || mongoUri.trim() === "") {
    throw new Error("MONGODB_URI is not defined in environment variables");
}
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(mongoUri);
        // eslint-disable-next-line no-console
        console.log("✅ Connected to MongoDB");
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error("❌ Failed to connect to MongoDB", error);
        throw error;
    }
    mongoose_1.default.connection.on("error", (err) => {
        // eslint-disable-next-line no-console
        console.error("MongoDB connection error:", err);
    });
    mongoose_1.default.connection.on("disconnected", () => {
        // eslint-disable-next-line no-console
        console.warn("MongoDB disconnected");
    });
};
exports.connectDB = connectDB;
