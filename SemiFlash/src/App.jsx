import Header from "./Header";
import CardDeck from "./CardDeck";
import { sampleCards } from "./cardsData";
import "./App.css";

function App() {
  return (
    <div>
      <Header />
      <CardDeck initialCards={sampleCards} />
    </div>
  );
}

export default App;
