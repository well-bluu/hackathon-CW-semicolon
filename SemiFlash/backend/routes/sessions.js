import express from "express";
import {
  startSession,
  submitAnswer,
  endSession,
  getUserSessions,
} from "../controllers/sessionController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/start", protect, startSession);
router.post("/answer", protect, submitAnswer);
router.post("/end", protect, endSession);
router.get("/:userId", protect, getUserSessions);

export default router;
