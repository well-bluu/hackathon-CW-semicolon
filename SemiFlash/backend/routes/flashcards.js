import express from "express";
import {
  getAllFlashcards,
  getFlashcardsByTopic,
  createFlashcard,
  getBundledFlashcards,
} from "../controllers/flashcardController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getAllFlashcards);
router.get("/bundle", protect, getBundledFlashcards);
router.get("/:topic", protect, getFlashcardsByTopic);
router.post("/", protect, createFlashcard);

export default router;
