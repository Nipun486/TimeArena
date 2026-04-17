"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    totalXP: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    currentStreak: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    longestStreak: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    lastActiveDate: {
        type: Date,
        required: true,
        default: () => new Date(),
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
userSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    const saltRounds = 10;
    this.password = await bcryptjs_1.default.hash(this.password, saltRounds);
});
exports.User = mongoose_1.default.models.User ||
    mongoose_1.default.model("User", userSchema);
