// In-memory session storage
export let sessions = {};
export { sessions as sessionStore };

// POST start a new session
export const startSession = (req, res) => {
  const sessionId = `session_${Date.now()}`;
  sessions[sessionId] = {
    sessionId,
    startTime: new Date(),
    endTime: null,
    answers: [],
  };
  res.status(201).json({ sessionId });
};

// POST submit an answer
export const submitAnswer = (req, res) => {
  const {
    sessionId,
    flashcardId,
    topic,
    responseTimeMs,
    isCorrect,
    focusScore,
  } = req.body;

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }

  sessions[sessionId].answers.push({
    flashcardId,
    topic: topic || "General",
    responseTimeMs,
    isCorrect,
    focusScore: focusScore || 0,
  });

  res.json({ message: "Answer recorded" });
};

// POST end session
export const endSession = (req, res) => {
  const { sessionId } = req.body;

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }

  sessions[sessionId].endTime = new Date();
  res.json(sessions[sessionId]);
};

// GET session by ID
export const getUserSessions = (req, res) => {
  const { sessionId } = req.params;

  if (!sessions[sessionId]) {
    return res.status(404).json({ error: "Session not found" });
  }

  res.json(sessions[sessionId]);
};
