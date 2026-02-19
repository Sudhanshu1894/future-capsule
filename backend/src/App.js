import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import capsuleRoutes from "./routes/capsule.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 THIS IS THE CORRECT PATH
app.use(express.static(path.resolve(__dirname, "../../frontend")));

app.use("/api/auth", authRoutes);
app.use("/api/capsules", capsuleRoutes);
app.use("/api/users", userRoutes);

export default app;
