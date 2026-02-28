import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import flashcardRoutes from "./routes/flashcards.js";
import sessionRoutes from "./routes/sessions.js";
import performanceRoutes from "./routes/performance.js";
import { sessionStore } from "./controllers/sessionController.js";
import { setSessionStore as setPerfStore } from "./controllers/performanceController.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

// Share session store with performance controller
setPerfStore(sessionStore);

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/flashcards", flashcardRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/performance", performanceRoutes);

app.get("/", (req, res) => res.json({ message: "SemiFlash API running" }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
