import express from "express";
import {
  getPerformance,
  getSummary,
  logFocusData,
} from "../controllers/performanceController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/:userId", protect, getPerformance);
router.get("/:userId/summary", protect, getSummary);
router.post("/log", protect, logFocusData);

export default router;
