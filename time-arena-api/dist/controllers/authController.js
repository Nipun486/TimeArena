"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d");
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
function generateToken(user) {
    const payload = {
        id: user._id.toString(),
    };
    const options = {
        expiresIn: JWT_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
}
async function register(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required",
            });
        }
        if (typeof username !== "string" || username.trim().length < 3) {
            return res
                .status(400)
                .json({ message: "Username must be at least 3 characters long" });
        }
        if (username.trim().length > 20) {
            return res
                .status(400)
                .json({ message: "Username must be at most 20 characters long" });
        }
        if (typeof password !== "string" || password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long" });
        }
        if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User_1.User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already in use" });
        }
        const user = await User_1.User.create({
            username: username.trim(),
            email: normalizedEmail,
            password,
        });
        const token = generateToken(user);
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                totalXP: user.totalXP,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                lastActiveDate: user.lastActiveDate,
            },
            token,
        });
    }
    catch (error) {
        console.log("Registration Error :", error);
        // In production you might want to log `error` with a logger.
        return res
            .status(500)
            .json({ message: "An unexpected error occurred during registration" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        const token = generateToken(user);
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                totalXP: user.totalXP,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                lastActiveDate: user.lastActiveDate,
            },
            token,
        });
    }
    catch (error) {
        // In production you might want to log `error` with a logger.
        return res
            .status(500)
            .json({ message: "An unexpected error occurred during login" });
    }
}
