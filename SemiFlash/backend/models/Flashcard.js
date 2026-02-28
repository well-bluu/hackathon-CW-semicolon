import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    subject: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Flashcard", flashcardSchema);
