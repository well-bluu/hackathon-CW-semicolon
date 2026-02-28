import { useState } from "react";
import "./DeckNaming.css";

function DeckNaming({ cardCount, onConfirm, onCancel }) {
  const [deckName, setDeckName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!deckName.trim()) {
      setError("Please enter a deck name");
      return;
    }

    if (deckName.trim().length > 50) {
      setError("Deck name must be 50 characters or less");
      return;
    }

    onConfirm(deckName.trim());
  };

  return (
    <div className="deck-naming-overlay">
      <div className="deck-naming-dialog">
        <h2>Name Your Deck</h2>
        <p className="deck-info">{cardCount} cards created</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter deck name..."
            value={deckName}
            onChange={(e) => {
              setDeckName(e.target.value);
              setError("");
            }}
            autoFocus
            className="deck-name-input"
          />

          {error && <p className="error-message">{error}</p>}

          <div className="dialog-buttons">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={!deckName.trim()}>
              Create Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DeckNaming;
