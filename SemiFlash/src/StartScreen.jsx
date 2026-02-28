import { useState } from "react";
import "./StartScreen.css";

function StartScreen({ onSelectMethod }) {
  return (
    <div className="start-screen">
      <div className="start-container">
        <h2>Upload Your Content</h2>
        <p className="subtitle">Choose how you'd like to create flashcards</p>

        <div className="options-grid">
          <button
            className="option-card"
            onClick={() => onSelectMethod("text")}>
            <div className="option-icon">📝</div>
            <h3>Manual Input</h3>
            <p>Type or paste your questions and answers directly</p>
          </button>

          <button className="option-card" onClick={() => onSelectMethod("pdf")}>
            <div className="option-icon">📄</div>
            <h3>Upload PDF</h3>
            <p>Upload a PDF file to extract questions automatically</p>
          </button>
        </div>

        <button className="ai-button">Let AI do your work</button>
      </div>
    </div>
  );
}

export default StartScreen;
