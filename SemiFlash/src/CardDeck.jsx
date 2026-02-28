import { useState } from "react";
import FlipCard from "./Flipcard";
import "./CardDeck.css";

function CardDeck({ initialCards, deckName }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  const handleNext = () => {
    // Increment answered count
    setAnsweredCount((prev) => prev + 1);
    // Move to next card
    setCurrentCardIndex((prev) => prev + 1);
  };

  const currentCard = initialCards[currentCardIndex % initialCards.length];

  return (
    <div className="deck-container">
      {deckName && <div className="deck-title">{deckName}</div>}

      <div className="progress-section">
        <div className="progress-label">
          {answeredCount} / {initialCards.length} completed
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(answeredCount / initialCards.length) * 100}%`,
            }}></div>
        </div>
      </div>

      <FlipCard key={currentCard.id} card={currentCard} onNext={handleNext} />
    </div>
  );
}

export default CardDeck;
