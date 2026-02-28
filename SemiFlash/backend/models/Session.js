import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    answers: [
      {
        flashcardId: { type: mongoose.Schema.Types.ObjectId, ref: "Flashcard" },
        topic: { type: String },
        responseTimeMs: { type: Number },
        isCorrect: { type: Boolean },
        focusScore: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Session", sessionSchema);
