import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topicBreakdown: [
      {
        topic: { type: String },
        avgResponseTimeMs: { type: Number },
        accuracy: { type: Number },
        avgFocusScore: { type: Number },
        attemptCount: { type: Number },
        tag: {
          type: String,
          enum: ["weak", "average", "strong"],
          default: "average",
        },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Performance", performanceSchema);
