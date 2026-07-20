/**
 * Admin Seeder Script
 * Usage: node scripts/createAdmin.js
 *
 * Reads credentials from environment variables or falls back to defaults.
 * Set these in your .env or pass inline:
 *   ADMIN_NAME="Super Admin" ADMIN_EMAIL="admin@skillsphere.com" ADMIN_PASSWORD="Admin@123" node scripts/createAdmin.js
 */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server root
dotenv.config({ path: join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI;
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@skillsphere.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

if (!MONGO_URI) {
  console.error("❌  MONGO_URI not found in .env");
  process.exit(1);
}

// Inline minimal schema to avoid import chain issues
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["client", "freelancer", "admin"], default: "client" },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    googleId: { type: String, default: null },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  MongoDB connected");

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      if (existing.role === "admin") {
        console.log(`ℹ️   Admin already exists: ${existing.email}`);
      } else {
        // Promote existing user to admin
        existing.role = "admin";
        await existing.save();
        console.log(`✅  Promoted existing user to admin: ${existing.email}`);
      }
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });
      console.log(`✅  Admin created successfully!`);
      console.log(`    Name    : ${admin.name}`);
      console.log(`    Email   : ${admin.email}`);
      console.log(`    Password: ${ADMIN_PASSWORD}  ← change this immediately!`);
    }
  } catch (err) {
    console.error("❌  Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
