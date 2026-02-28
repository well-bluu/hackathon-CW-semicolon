import { useState } from "react";
import FlipCard from "./Flipcard";
import "./CardDeck.css";

function CardDeck({ initialCards, deckName, onRestart }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const isFinished = answeredCount >= initialCards.length;

  const handleNext = () => {
    setAnsweredCount((prev) => prev + 1);
    setCurrentCardIndex((prev) => prev + 1);
  };

  const handleRetry = () => {
    setCurrentCardIndex(0);
    setAnsweredCount(0);
  };

  const currentCard = !isFinished ? initialCards[currentCardIndex] : null;

  return (
    <div className="deck-container">
      {deckName && <div className="deck-title">{deckName}</div>}

      <div className="progress-section">
        <div className="progress-label">
          {Math.min(answeredCount, initialCards.length)} / {initialCards.length}{" "}
          completed
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min((answeredCount / initialCards.length) * 100, 100)}%`,
            }}></div>
        </div>
      </div>

      {isFinished ? (
        <div className="completion-screen">
          <h2>Deck Complete!</h2>
          <p>You answered all {initialCards.length} cards.</p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 16,
            }}>
            <button className="next-btn" onClick={handleRetry}>
              Try Again
            </button>
            {onRestart && (
              <button className="next-btn" onClick={onRestart}>
                Back to Home
              </button>
            )}
          </div>
        </div>
      ) : (
        <FlipCard key={currentCard.id} card={currentCard} onNext={handleNext} />
      )}
    </div>
  );
}

export default CardDeck;
