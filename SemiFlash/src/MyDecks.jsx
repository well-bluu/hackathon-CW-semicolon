import { useState, useEffect } from "react";
import "./MyDecks.css";

function MyDecks({ onSelectDeck }) {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load decks from both localStorage AND the data folder, then merge
  useEffect(() => {
    let cancelled = false;

    async function loadDecks() {
      // 1. Get localStorage decks
      let localDecks = [];
      try {
        const allDecks = localStorage.getItem("allDecks");
        if (allDecks) {
          const parsed = JSON.parse(allDecks);
          if (Array.isArray(parsed)) localDecks = parsed;
        }
      } catch (e) {
        console.warn("failed to load decks from localStorage", e);
      }

      // 2. Get file-based decks from src/data/
      let fileDecks = [];
      try {
        const resp = await fetch("/api/list-decks", { cache: "no-store" });
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data)) fileDecks = data;
        }
      } catch (e) {
        console.warn("failed to load decks from data folder", e);
      }

      if (cancelled) return;

      // 3. Merge: start with file decks as the source of truth,
      //    then add localStorage-only decks (ones not originating from a file)
      const fileIds = new Set(fileDecks.map((d) => d.id));
      const merged = [...fileDecks];
      for (const ld of localDecks) {
        // Keep localStorage decks that don't correspond to a file
        if (!fileIds.has(ld.id) && ld.source !== "file") {
          merged.push(ld);
        }
      }

      setDecks(merged);
      setLoading(false);
    }

    loadDecks();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeckClick = (deck) => {
    onSelectDeck(deck);
  };

  const handleDeleteDeck = (deck, e) => {
    e.stopPropagation();
    const updatedDecks = decks.filter((d) => d.id !== deck.id);
    setDecks(updatedDecks);
    // Only update localStorage for non-file decks
    const localOnly = updatedDecks.filter((d) => d.source !== "file");
    localStorage.setItem("allDecks", JSON.stringify(localOnly));
  };

  return (
    <div className="my-decks-screen">
      <div className="decks-container">
        <h2>My Decks</h2>

        {loading ? (
          <div className="empty-state">
            <p className="empty-text">Loading decks…</p>
          </div>
        ) : decks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5.5 6.25a2.5 2.5 0 0 1 2.5-2.5h8.5a2.5 2.5 0 0 1 2.5 2.5v11.5a1 1 0 0 1-1.45.9l-1.85-.95a1 1 0 0 0-.9 0l-1.85.95a1 1 0 0 1-.9 0l-1.85-.95a1 1 0 0 0-.9 0l-1.85.95a1 1 0 0 1-1.45-.9V6.25Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 8.75h7M9 12h7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </p>
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
                <div className="deck-main">
                  <div className="deck-header">
                    <h3>{deck.name}</h3>
                  </div>
                  <p className="deck-count">{deck.cards.length} cards</p>
                  <p className="deck-date">
                    Created {new Date(deck.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {(() => {
                  const stats = deck.stats || null;
                  const totalAnswered = stats?.totalAnswered || 0;
                  const correctAnswers = stats?.correctAnswers || 0;
                  const totalTimeSeconds = stats?.totalTimeSeconds || 0;
                  const accuracy = totalAnswered
                    ? Math.round((correctAnswers / totalAnswered) * 100)
                    : 0;
                  const avgTime = totalAnswered
                    ? (totalTimeSeconds / totalAnswered).toFixed(1)
                    : "0.0";

                  return (
                    <div className="deck-stats">
                      <p className="stats-title">Stats</p>
                      <p className="stats-item">Accuracy: {accuracy}%</p>
                      <p className="stats-item">Avg Time: {avgTime}s</p>
                    </div>
                  );
                })()}

                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteDeck(deck.id, e)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyDecks;
