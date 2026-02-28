import express from "express";
import {
  getPerformance,
  getSummary,
} from "../controllers/performanceController.js";

const router = express.Router();

router.get("/:sessionId", getPerformance);
router.get("/:sessionId/summary", getSummary);

export default router;
