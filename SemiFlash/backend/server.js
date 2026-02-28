import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import flashcardRoutes from "./routes/flashcards.js";
import sessionRoutes from "./routes/sessions.js";
import performanceRoutes from "./routes/performance.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/flashcards", flashcardRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/performance", performanceRoutes);

app.get("/", (req, res) => res.json({ message: "SemiFlash API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
