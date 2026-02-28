import { useState } from 'react'
import Header from "./Header";
import CardDeck from "./CardDeck";
<<<<<<< Updated upstream
=======
import { sampleCards } from "./data/cardsData";
import Flashcard from "./flashcard";
>>>>>>> Stashed changes
import "./App.css";

function App() {
  const [showAI, setShowAI] = useState(false);
  
  return (
    <div>
      <nav style={{ marginBottom: '1rem' }}>
        <button onClick={() => setShowAI(false)}>Home</button>
        <button onClick={() => setShowAI(true)} style={{ marginLeft: '0.5rem' }}>
          AI Demo
        </button>
      </nav>

      {showAI ? (
        <Flashcard />
      ) : (
        <>
          <Header />
          <CardDeck initialCards={sampleCards} />
        </>
      )}
    </div>
  );
}

export default App;
