// In-memory storage
let flashcards = [];
let idCounter = 1;

// GET all flashcards
export const getAllFlashcards = (req, res) => {
  res.json(flashcards);
};

// GET flashcards by topic
export const getFlashcardsByTopic = (req, res) => {
  const { topic } = req.params;
  const filtered = flashcards.filter((f) => f.topic === topic);
  res.json(filtered);
};

// GET all flashcards bundled (for offline caching)
export const getBundledFlashcards = (req, res) => {
  res.json(flashcards);
};

// POST create flashcard (user dynamic input)
export const createFlashcard = (req, res) => {
  const { question, answer, options, topic, subject, difficulty } = req.body;

  if (!question || !answer || !options || options.length < 2) {
    return res
      .status(400)
      .json({ error: "question, answer, and at least 2 options are required" });
  }

  if (!options.includes(answer)) {
    return res.status(400).json({ error: "answer must be one of the options" });
  }

  const newCard = {
    id: idCounter++,
    question,
    answer,
    options,
    topic: topic || "General",
    subject: subject || "General",
    difficulty: difficulty || "medium",
  };

  flashcards.push(newCard);
  res.status(201).json(newCard);
};
