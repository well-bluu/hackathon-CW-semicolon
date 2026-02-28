import { useState } from "react";
import FlipCard from "./Flipcard";
import "./CardDeck.css";

function CardDeck({ initialCards, deckName, onComplete }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleNext = (result) => {
    if (isCompleted) return;

    const currentCard = initialCards[currentCardIndex];
    if (!currentCard) return;

    const attempt = {
      questionNumber: currentCardIndex + 1,
      question: currentCard.question,
      selectedAnswer: result.selectedOption,
      correctAnswer: currentCard.answer,
      isCorrect: Boolean(result.isCorrect),
      timeSeconds: result.timeSeconds || 0,
      topic: currentCard.topic || currentCard.subject || "General",
    };

    const updatedAttempts = [...attempts, attempt];
    const nextAnsweredCount = updatedAttempts.length;
    setAttempts(updatedAttempts);

    if (nextAnsweredCount >= initialCards.length) {
      setIsCompleted(true);
      if (onComplete) {
        onComplete({
          totalQuestions: initialCards.length,
          correctAnswers: updatedAttempts.filter((a) => a.isCorrect).length,
          incorrectAnswers: updatedAttempts.filter((a) => !a.isCorrect),
          attempts: updatedAttempts,
        });
      }
      return;
    }

    setCurrentCardIndex((prev) => prev + 1);
  };

  if (!initialCards || initialCards.length === 0) {
    return (
      <div className="deck-container">
        <h2>No cards available</h2>
      </div>
    );
  }

  const currentCard = initialCards[currentCardIndex];
  const isLastCard = currentCardIndex === initialCards.length - 1;

  return (
    <div className="deck-container">
      {deckName && <div className="deck-title">{deckName}</div>}

      <div className="progress-section">
        <div className="progress-label">
          {Math.min(attempts.length, initialCards.length)} /{" "}
          {initialCards.length} completed
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min((attempts.length / initialCards.length) * 100, 100)}%`,
            }}></div>
        </div>
      </div>

      <FlipCard
        key={currentCard.id}
        card={currentCard}
        onNext={handleNext}
        isLastCard={isLastCard}
      />
    </div>
  );
}

export default CardDeck;
