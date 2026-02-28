import { useState } from "react";
import FlipCard from "./Flipcard";
import "./CardDeck.css";

function CardDeck({ initialCards }) {
  // Initialize cards with level tracking
  const [cards, setCards] = useState(
    initialCards.map((card) => ({
      ...card,
      level: 1, // 1=New, 2=Learning, 3=Mastery
      answeredInLevel: 0, // Track how many times answered in current level
    })),
  );

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Get cards by level
  const getCardsByLevel = (level) =>
    cards.filter((card) => card.level === level);

  const level1Cards = getCardsByLevel(1);
  const level2Cards = getCardsByLevel(2);
  const level3Cards = getCardsByLevel(3);

  // Get current card from the appropriate level
  const getCurrentCard = () => {
    // Priority: Level 1 > Level 2 > Level 3
    if (level1Cards.length > 0) {
      return level1Cards[currentCardIndex % level1Cards.length];
    }
    if (level2Cards.length > 0) {
      return level2Cards[currentCardIndex % level2Cards.length];
    }
    return level3Cards[currentCardIndex % level3Cards.length];
  };

  const handleNext = (cardId, isCorrect) => {
    // Increment answered count
    setAnsweredCount((prev) => prev + 1);

    // Update card levels if correct
    if (isCorrect) {
      setCards((prevCards) =>
        prevCards.map((card) => {
          if (card.id === cardId) {
            const answeredCount = card.answeredInLevel + 1;

            // Logic to move cards between levels
            let newLevel = card.level;
            let newAnsweredCount = answeredCount;

            if (card.level === 1 && answeredCount >= 2) {
              // Cards move to level 2 after 2 correct answers
              newLevel = 2;
              newAnsweredCount = 0;
            } else if (card.level === 2 && answeredCount >= 2) {
              // Cards move to level 3 after 2 correct answers
              newLevel = 3;
              newAnsweredCount = 0;
            }
            // Level 3 cards stay there

            return {
              ...card,
              level: newLevel,
              answeredInLevel: newAnsweredCount,
            };
          }
          return card;
        }),
      );
    }

    setCurrentCardIndex((prev) => prev + 1);
  };

  const currentCard = getCurrentCard();

  if (!currentCard) {
    return (
      <div className="deck-container">
        <h2>🎉 All cards mastered!</h2>
        <button
          onClick={() => {
            localStorage.removeItem("flashcards");
            window.location.reload();
          }}
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="deck-container">
      <div className="progress-section">
        <div className="progress-label">
          {answeredCount} / {cards.length} completed
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(answeredCount / cards.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <FlipCard key={currentCard.id} card={currentCard} onNext={handleNext} />

      <div className="card-progress">Card {currentCardIndex + 1}</div>
    </div>
  );
}

export default CardDeck;
