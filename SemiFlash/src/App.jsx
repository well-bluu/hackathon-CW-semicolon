import { useState } from "react";
import Header from "./Header";
import CardDeck from "./CardDeck";
import InputScreen from "./InputScreen";
import PdfUploadScreen from "./PdfUploadScreen";
import StartScreen from "./StartScreen";
import MyDecks from "./MyDecks";
import DeckNaming from "./DeckNaming";
import AIDemo from "./AIDemo";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [view, setView] = useState("start");
  const [currentDeckName, setCurrentDeckName] = useState("");
  const [pendingCards, setPendingCards] = useState(null);
  const [pendingSuggestedName, setPendingSuggestedName] = useState("");
  const [quizResults, setQuizResults] = useState(null);

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
        /export\s+const\s+(cards|sampleCards)\s*=\s*([\s\S]*?);?\s*$/m,
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
    setCurrentDeckName(deckName);
    setPendingCards(null);
    setPendingSuggestedName("");
    setView("quiz");
  };

  const handleDeckNameCancel = () => {
    setPendingCards(null);
  };

  const handleSelectDeck = (deck) => {
    setCurrentDeckName(deck.name);
    setCards(deck.cards);
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
        {view === "pdf" && <PdfUploadScreen />}
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
        {view === "results" && quizResults && (
          <div className="results-screen">
            <h2>Quiz Complete!</h2>
            <p>
              You got <strong>{quizResults.correctAnswers}</strong> out of{" "}
              <strong>{quizResults.totalQuestions}</strong> correct
            </p>
            {quizResults.incorrectAnswers.length > 0 && (
              <div className="incorrect-list">
                <h3>Review Incorrect Answers:</h3>
                {quizResults.incorrectAnswers.map((a, i) => (
                  <div key={i} className="incorrect-item">
                    <p>
                      <strong>Q{a.questionNumber}:</strong> {a.question}
                    </p>
                    <p>
                      Your answer:{" "}
                      <span style={{ color: "#c62828" }}>
                        {a.selectedAnswer}
                      </span>
                    </p>
                    <p>
                      Correct answer:{" "}
                      <span style={{ color: "#2e7d32" }}>
                        {a.correctAnswer}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 12,
                justifyContent: "center",
              }}>
              <button
                className="next-btn"
                onClick={() => {
                  setQuizResults(null);
                  setView("quiz");
                }}>
                Try Again
              </button>
              <button className="next-btn" onClick={handleRestart}>
                Back to Home
              </button>
            </div>
          </div>
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
