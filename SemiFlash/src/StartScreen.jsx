import { useState } from "react";
import "./StartScreen.css";

function StartScreen({ onSelectMethod, onAIClick, onLoadAiFile }) {
  return (
    <div className="start-screen">
      <div className="start-container">
        <h2>Upload Your Content</h2>
        <p className="subtitle">Choose how you'd like to create flashcards</p>

        <div className="options-grid">
          <button
            className="option-card"
            onClick={() => onSelectMethod("text")}>
            <div className="option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M8 6.75h8M8 10.75h8M8 14.75h5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <rect
                  x="4.75"
                  y="3.75"
                  width="14.5"
                  height="16.5"
                  rx="2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <h3>Manual Input</h3>
            <p>Type or paste your questions and answers directly</p>
          </button>

          <button className="option-card" onClick={() => onSelectMethod("pdf")}>
            <div className="option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 3.75v4.5a1.5 1.5 0 0 0 1.5 1.5H20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M8 14.5h8M8 17.5h5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M14 3.75H8A3.25 3.25 0 0 0 4.75 7v10A3.25 3.25 0 0 0 8 20.25h8A3.25 3.25 0 0 0 19.25 17V9L14 3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Upload PDF</h3>
            <p>Upload a PDF file to extract questions automatically</p>
          </button>
        </div>

        <button className="ai-button" onClick={() => onAIClick && onAIClick()}>
          <span className="ai-button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path
                d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z"
                fill="currentColor"
                opacity=".85"
              />
              <path
                d="M19 15l1.04 3.13L23.18 19l-3.14.87L19 23l-1.04-3.13L14.82 19l3.14-.87L19 15z"
                fill="currentColor"
                opacity=".55"
              />
            </svg>
          </span>
          <span className="ai-button-label">Let AI do your work</span>
          <span className="ai-button-badge">NEW</span>
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
