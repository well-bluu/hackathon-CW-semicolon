import express from "express";
import {
  getAllFlashcards,
  getFlashcardsByTopic,
  createFlashcard,
  getBundledFlashcards,
} from "../controllers/flashcardController.js";

const router = express.Router();

router.get("/", getAllFlashcards);
router.get("/bundle", getBundledFlashcards);
router.get("/:topic", getFlashcardsByTopic);
router.post("/", createFlashcard);

export default router;
