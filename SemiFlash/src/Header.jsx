import "./Header.css";

function Header({ currentView, onMakeDeck, onMyDecks, onRestart }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>SemiFlash</h1>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${["start", "text", "pdf"].includes(currentView) ? "active" : ""}`}
          onClick={onMakeDeck}
        >
          <span className="nav-icon">01</span>
          <span className="nav-text">Make a deck</span>
        </button>

        <button
          className={`nav-item ${currentView === "my-decks" ? "active" : ""}`}
          onClick={onMyDecks}
        >
          <span className="nav-icon">02</span>
          <span className="nav-text">My Decks</span>
        </button>

        {currentView === "quiz" && (
          <button className="nav-item nav-separator active" onClick={onRestart}>
            <span className="nav-icon">03</span>
            <span className="nav-text">Restart</span>
          </button>
        )}
      </nav>
    </aside>
  );
}

export default Header;
