import { useState } from "react";
import Header from "./Header";
import CardDeck from "./CardDeck";
import InputScreen from "./InputScreen";
import PdfUploadScreen from "./PdfUploadScreen";
import StartScreen from "./StartScreen";
import MyDecks from "./MyDecks";
import DeckNaming from "./DeckNaming";
import "./App.css";

function App() {
  const [cards, setCards] = useState([]);
  const [view, setView] = useState("start");
  const [currentDeckName, setCurrentDeckName] = useState("");
  const [pendingCards, setPendingCards] = useState(null);

  const handleSelectMethod = (method) => {
    setView(method);
  };

  const handleStart = (parsedCards) => {
    // Set pending cards and show naming dialog
    setPendingCards(parsedCards);
  };

  const handleDeckNameConfirm = (deckName) => {
    if (!pendingCards) return;

    const deckId = Date.now().toString();

    // Save to allDecks
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

    setCards(pendingCards);
    setCurrentDeckName(deckName);
    setPendingCards(null);
    setView("quiz");
  };

  const handleDeckNameCancel = () => {
    setPendingCards(null);
  };

  const handleSelectDeck = (deck) => {
    setCurrentDeckName(deck.name);
    setCards(deck.cards);
    setView("quiz");
    setView("quiz");
  };

  const handleMakeDeck = () => {
    setView("start");
  };

  const handleMyDecks = () => {
    setView("my-decks");
  };

  const handleRestart = () => {
    setView("start");
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
          <StartScreen onSelectMethod={handleSelectMethod} />
        )}
        {view === "text" && <InputScreen onStart={handleStart} />}
        {view === "pdf" && <PdfUploadScreen />}
        {view === "my-decks" && <MyDecks onSelectDeck={handleSelectDeck} />}
        {view === "quiz" && (
          <CardDeck initialCards={cards} deckName={currentDeckName} />
        )}
      </main>

      {pendingCards && (
        <DeckNaming
          cardCount={pendingCards.length}
          onConfirm={handleDeckNameConfirm}
          onCancel={handleDeckNameCancel}
        />
      )}
    </div>
  );
}

export default App;
