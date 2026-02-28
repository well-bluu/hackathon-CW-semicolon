import { useState } from "react";
import Header from "./Header";
import CardDeck from "./CardDeck";
import InputScreen from "./InputScreen";
import "./App.css";

function App() {
  // view can be "input" or "quiz"
  const [cards, setCards] = useState(() => {
    try {
      const saved = localStorage.getItem("flashcards");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("failed to load saved cards", e);
    }
    return [];
  });

  const [view, setView] = useState(() => (cards.length > 0 ? "quiz" : "input"));

  const handleStart = (parsedCards) => {
    setCards(parsedCards);
    setView("quiz");
    try {
      localStorage.setItem("flashcards", JSON.stringify(parsedCards));
    } catch (e) {
      console.warn("could not save cards", e);
    }
  };

  return (
    <div>
      <Header />

      {/* new flow: start screen or quiz */}
      {view === "input" && <InputScreen onStart={handleStart} />}
      {view === "quiz" && <CardDeck initialCards={cards} />}
    </div>
  );
}

export default App;
