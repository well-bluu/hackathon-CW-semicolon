import express from "express";
import {
  startSession,
  submitAnswer,
  endSession,
  getUserSessions,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start", startSession);
router.post("/answer", submitAnswer);
router.post("/end", endSession);
router.get("/:sessionId", getUserSessions);

export default router;
