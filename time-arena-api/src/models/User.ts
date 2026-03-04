import mongoose, { type InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

export type UserDocument = InferSchemaType<typeof userSchema> &
  mongoose.Document;

export const User =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);

