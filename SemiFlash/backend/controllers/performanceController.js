// In-memory sessions reference (shared)
let sessionStore = {};

export const setSessionStore = (store) => {
  sessionStore = store;
};

// GET performance by sessionId
export const getPerformance = (req, res) => {
  const { sessionId } = req.params;
  const session = sessionStore[sessionId];

  if (!session) return res.status(404).json({ error: "Session not found" });

  const topicMap = {};

  session.answers.forEach(
    ({ topic, responseTimeMs, isCorrect, focusScore }) => {
      if (!topicMap[topic]) {
        topicMap[topic] = { total: 0, correct: 0, totalTime: 0, totalFocus: 0 };
      }
      topicMap[topic].total++;
      if (isCorrect) topicMap[topic].correct++;
      topicMap[topic].totalTime += responseTimeMs;
      topicMap[topic].totalFocus += focusScore;
    },
  );

  const topicBreakdown = Object.entries(topicMap).map(([topic, data]) => {
    const accuracy = (data.correct / data.total) * 100;
    const avgResponseTimeMs = data.totalTime / data.total;
    const avgFocusScore = data.totalFocus / data.total;
    let tag = "average";
    if (accuracy < 50 || avgResponseTimeMs > 15000) tag = "weak";
    if (accuracy > 80 && avgResponseTimeMs < 5000) tag = "strong";

    return {
      topic,
      accuracy,
      avgResponseTimeMs,
      avgFocusScore,
      attemptCount: data.total,
      tag,
    };
  });

  res.json({ sessionId, topicBreakdown });
};

// GET summary
export const getSummary = (req, res) => {
  const { sessionId } = req.params;
  const session = sessionStore[sessionId];

  if (!session) return res.status(404).json({ error: "Session not found" });

  const total = session.answers.length;
  const correct = session.answers.filter((a) => a.isCorrect).length;
  const avgTime =
    session.answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / total;

  res.json({
    sessionId,
    totalAnswered: total,
    correctAnswers: correct,
    accuracy: ((correct / total) * 100).toFixed(2),
    avgResponseTimeMs: avgTime.toFixed(0),
  });
};
