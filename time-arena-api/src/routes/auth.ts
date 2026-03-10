import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Register a new user
router.post("/register", authController.register);

// Log in an existing user
router.post("/login", authController.login);

export default router;
