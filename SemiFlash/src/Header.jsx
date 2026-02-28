import "./Header.css";

function Header({ currentView, onMakeDeck, onMyDecks, onRestart }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M9.75 18.5h4.5M10.2 20.25h3.6M12 3.75a6.25 6.25 0 0 0-3.88 11.15c.82.67 1.38 1.62 1.55 2.66h4.66c.17-1.04.73-2 1.55-2.66A6.25 6.25 0 0 0 12 3.75Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m12 8.2-2 2.85h1.9l-1.1 2.6 3.1-3.6h-1.95l1.05-1.85Z"
                fill="currentColor"
              />
            </svg>
          </span>
          SemiFlash
        </h1>
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

        {(currentView === "quiz" || currentView === "results") && (
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
