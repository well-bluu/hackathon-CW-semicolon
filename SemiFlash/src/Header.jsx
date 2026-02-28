import "./Header.css";

function Header({ currentView, onMakeDeck, onMyDecks, onRestart }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Semiflash</h1>
      </div>

      <nav className="sidebar-nav">
        <button className="nav-item" onClick={onMakeDeck}>
          <span className="nav-icon">➕</span>
          <span className="nav-text">Make a deck</span>
        </button>

        <button className="nav-item" onClick={onMyDecks}>
          <span className="nav-icon">📚</span>
          <span className="nav-text">My Decks</span>
        </button>

        {currentView === "quiz" && (
          <button className="nav-item nav-separator" onClick={onRestart}>
            <span className="nav-icon">🎯</span>
            <span className="nav-text">Restart</span>
          </button>
        )}
      </nav>
    </aside>
  );
}

export default Header;
