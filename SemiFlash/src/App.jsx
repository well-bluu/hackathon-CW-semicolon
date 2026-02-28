import { useState, useEffect } from "react";
import Header from "./Header";
import CardDeck from "./CardDeck";
import InputScreen from "./InputScreen";
import PdfUploadScreen from "./PdfUploadScreen";
import StartScreen from "./StartScreen";
import MyDecks from "./MyDecks";
import DeckNaming from "./DeckNaming";
import AIDemo from "./AIDemo";
import ResultsScreen from "./ResultsScreen";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [view, setView] = useState("start");
  const [currentDeckId, setCurrentDeckId] = useState("");
  const [currentDeckName, setCurrentDeckName] = useState("");
  const [pendingCards, setPendingCards] = useState(null);
  const [pendingSuggestedName, setPendingSuggestedName] = useState("");
  const [quizResults, setQuizResults] = useState(null);

  // On startup, sync file-based decks from src/data/ into localStorage
  useEffect(() => {
    async function syncFileDecks() {
      try {
        const resp = await fetch("/api/list-decks", { cache: "no-store" });
        if (!resp.ok) return;
        const fileDecks = await resp.json();
        if (!Array.isArray(fileDecks) || fileDecks.length === 0) return;

        let localDecks = [];
        try {
          const raw = localStorage.getItem("allDecks");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) localDecks = parsed;
          }
        } catch {
          /* empty */
        }

        const localIds = new Set(localDecks.map((d) => d.id));
        let added = 0;
        for (const fd of fileDecks) {
          if (!localIds.has(fd.id)) {
            localDecks.push({
              id: fd.id,
              name: fd.name,
              cards: fd.cards,
              createdAt: fd.createdAt,
              source: "file",
            });
            added++;
          }
        }
        if (added > 0) {
          localStorage.setItem("allDecks", JSON.stringify(localDecks));
        }
      } catch (e) {
        console.warn("Could not sync file decks on startup:", e);
      }
    }
    syncFileDecks();
  }, []);

  const handleSelectMethod = (method) => {
    setQuizResults(null);
    setView(method);
  };

  const loadAiGeneratedFile = async () => {
    try {
      // fetch the generated file as text and extract the exported `cards` value
      const url = `${location.origin}/src/data/ai_generated_cards.js`;
      const resp = await fetch(url, { cache: "no-store" });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const text = await resp.text();
      // accept either `export const cards = [...]` or `export const sampleCards = [...]`
      const m = text.match(
        /export\s+const\s+(cards|sampleCards)\s*=\s*([\s\S]*?);?\s*$/,
      );
      if (!m) {
        alert(
          "File found but could not extract `cards` or `sampleCards` export from ai_generated_cards.js",
        );
        return;
      }
      let fileCards = null;
      // m[2] contains the RHS expression
      const rhs = m[2];
      try {
        fileCards = JSON.parse(rhs);
      } catch (e) {
        // try evaluating as JS expression as a fallback
        try {
          // eslint-disable-next-line no-new-func
          fileCards = new Function(`return (${rhs})`)();
        } catch (ee) {
          console.warn("Failed to parse cards export", ee);
        }
      }
      if (!fileCards || !Array.isArray(fileCards) || fileCards.length === 0) {
        alert("No cards found in src/data/ai_generated_cards.js");
        return;
      }
      handleStart(fileCards, "aiGenerated");
    } catch (e) {
      console.warn("Failed to load ai_generated_cards.js", e);
      alert(
        "Could not load src/data/ai_generated_cards.js. Make sure the file exists and is exported as `export const cards = [...]`.",
      );
    }
  };

  const handleStart = (parsedCards, suggestedName) => {
    // Set pending cards and show naming dialog
    setQuizResults(null);
    setPendingCards(parsedCards);
    setPendingSuggestedName(suggestedName || "");
  };

  const handleDeckNameConfirm = (deckName) => {
    if (!pendingCards) return;

    const deckId = Date.now().toString();

    // Save to allDecks in localStorage
    try {
      const allDecks = localStorage.getItem("allDecks");
      const decks = allDecks ? JSON.parse(allDecks) : [];
      const newDeck = {
        id: deckId,
        name: deckName,
        cards: pendingCards,
        createdAt: new Date().toISOString(),
        stats: {
          sessions: 0,
          totalAnswered: 0,
          correctAnswers: 0,
          mistakes: 0,
          totalTimeSeconds: 0,
          lastPracticedAt: null,
        },
      };
      decks.push(newDeck);
      localStorage.setItem("allDecks", JSON.stringify(decks));
    } catch (e) {
      console.warn("could not save deck", e);
    }

    // Write the cards file to src/data/ via the dev server API
    const safeName =
      deckName
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .toLowerCase() || "ai_generated_cards";
    fetch("/api/write-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cards: pendingCards, fileName: safeName }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) console.log("Cards file saved to", data.path);
        else console.warn("Failed to save cards file:", data.error);
      })
      .catch((err) => console.warn("Could not write cards file:", err));

    setCards(pendingCards);
    setCurrentDeckId(deckId);
    setCurrentDeckName(deckName);
    setPendingCards(null);
    setPendingSuggestedName("");
    setQuizResults(null);
    setView("quiz");
  };

  const handleDeckNameCancel = () => {
    setPendingCards(null);
    setPendingSuggestedName("");
  };

  const handleSelectDeck = (deck) => {
    setCurrentDeckId(deck.id);
    setCurrentDeckName(deck.name);
    setCards(deck.cards);
    setQuizResults(null);
    setView("quiz");
  };

  const handleMakeDeck = () => {
    setQuizResults(null);
    setView("start");
  };

  const handleMyDecks = () => {
    setView("my-decks");
  };

  const handleRestart = () => {
    setQuizResults(null);
    setView("start");
  };

  const handleQuizComplete = (results) => {
    if (currentDeckId) {
      try {
        const allDecks = localStorage.getItem("allDecks");
        const decks = allDecks ? JSON.parse(allDecks) : [];
        const updatedDecks = decks.map((deck) => {
          if (deck.id !== currentDeckId) return deck;

          const attempts = Array.isArray(results.attempts)
            ? results.attempts
            : [];
          const totalAnswered = attempts.length;
          const correctAnswers = attempts.filter((a) => a.isCorrect).length;
          const mistakes = totalAnswered - correctAnswers;
          const totalTimeSeconds = attempts.reduce(
            (sum, attempt) => sum + (attempt.timeSeconds || 0),
            0,
          );

          const existingStats = deck.stats || {
            sessions: 0,
            totalAnswered: 0,
            correctAnswers: 0,
            mistakes: 0,
            totalTimeSeconds: 0,
            lastPracticedAt: null,
          };

          return {
            ...deck,
            stats: {
              sessions: (existingStats.sessions || 0) + 1,
              totalAnswered: (existingStats.totalAnswered || 0) + totalAnswered,
              correctAnswers:
                (existingStats.correctAnswers || 0) + correctAnswers,
              mistakes: (existingStats.mistakes || 0) + mistakes,
              totalTimeSeconds:
                (existingStats.totalTimeSeconds || 0) + totalTimeSeconds,
              lastPracticedAt: new Date().toISOString(),
            },
          };
        });
        localStorage.setItem("allDecks", JSON.stringify(updatedDecks));
      } catch (e) {
        console.warn("failed to persist deck stats", e);
      }
    }

    setQuizResults(results);
    setView("results");
  };

  return (
    <div className="app-container">
      <Header
        currentView={view}
        onMakeDeck={handleMakeDeck}
        onMyDecks={handleMyDecks}
        onRestart={handleRestart}
      />
      <main className="app-main">
        {view === "start" && (
          <StartScreen
            onSelectMethod={handleSelectMethod}
            onAIClick={() => setView("ai")}
            onLoadAiFile={loadAiGeneratedFile}
          />
        )}
        {view === "text" && <InputScreen onStart={handleStart} />}
        {view === "pdf" && <PdfUploadScreen onStart={handleStart} />}
        {view === "my-decks" && <MyDecks onSelectDeck={handleSelectDeck} />}
        {view === "ai" && (
          <AIDemo onGenerate={handleStart} onBack={() => setView("start")} />
        )}
        {view === "quiz" && (
          <CardDeck
            initialCards={cards}
            deckName={currentDeckName}
            onComplete={handleQuizComplete}
          />
        )}
        {view === "results" && (
          <ResultsScreen
            results={quizResults}
            deckName={currentDeckName}
            onRetake={() => {
              setQuizResults(null);
              setView("quiz");
            }}
            onBackToDecks={handleMyDecks}
          />
        )}
      </main>

      {pendingCards && (
        <DeckNaming
          cardCount={pendingCards.length}
          onConfirm={handleDeckNameConfirm}
          onCancel={handleDeckNameCancel}
          defaultName={pendingSuggestedName}
        />
      )}
    </div>
  );
}

export default App;
