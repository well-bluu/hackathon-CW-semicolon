// simple card deck component that shows a list of cards
export default function CardDeck({ initialCards = [] }) {
  return (
    <div>
      {initialCards.length === 0 ? (
        <p>No cards available.</p>
      ) : (
        <ul>
          {initialCards.map((card, idx) => (
            <li key={idx}>{card.question || card}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
