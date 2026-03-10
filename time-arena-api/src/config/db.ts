import mongoose from "mongoose";
import "dotenv/config"

const mongoUri = process.env.MONGODB_URI as string;
console.log(mongoUri);


if (mongoUri == null || mongoUri.trim() === "") {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Failed to connect to MongoDB", error);
    throw error;
  }

  mongoose.connection.on("error", (err: Error) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    // eslint-disable-next-line no-console
    console.warn("MongoDB disconnected");
  });
};


