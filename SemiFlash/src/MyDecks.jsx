import { useState } from "react";
import "./MyDecks.css";

function MyDecks({ onSelectDeck }) {
  const [decks, setDecks] = useState(() => {
    try {
      const allDecks = localStorage.getItem("allDecks");
      if (allDecks) {
        const parsed = JSON.parse(allDecks);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("failed to load decks", e);
    }
    return [];
  });

  const handleDeckClick = (deck) => {
    onSelectDeck(deck);
  };

  const handleDeleteDeck = (id, e) => {
    e.stopPropagation();
    const updatedDecks = decks.filter((deck) => deck.id !== id);
    setDecks(updatedDecks);
    localStorage.setItem("allDecks", JSON.stringify(updatedDecks));
  };

  return (
    <div className="my-decks-screen">
      <div className="decks-container">
        <h2>My Decks</h2>

        {decks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📚</p>
            <p className="empty-text">No decks yet</p>
            <p className="empty-hint">Create a new deck to get started</p>
          </div>
        ) : (
          <div className="decks-grid">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="deck-card"
                onClick={() => handleDeckClick(deck)}>
                <div className="deck-header">
                  <h3>{deck.name}</h3>
                  <button
                    className="delete-btn"
                    onClick={(e) => handleDeleteDeck(deck.id, e)}>
                    ✕
                  </button>
                </div>
                <p className="deck-count">{deck.cards.length} cards</p>
                <p className="deck-date">
                  {new Date(deck.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDecks;
