import "dotenv/config";

import app from "./app.js";
import connectDB from "./src/config/db.js";

console.log(process.env.RAZORPAY_KEY_ID);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});