import "./loadEnv.js"; // ✅ MUST be first import

import app from "./App.js";
import { connectDB } from "./config/db.js";

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
