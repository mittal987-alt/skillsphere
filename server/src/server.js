import dotenv from "dotenv";
dotenv.config();
console.log("KEY ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY SECRET:", process.env.RAZORPAY_KEY_SECRET ? "Loaded" : "Missing");

import app from "./src/app.js";
import connectDB from "../src/config/db.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});