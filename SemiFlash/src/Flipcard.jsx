import { useState, useEffect } from "react";
import "./FlipCard.css";

function FlipCard({ card, onNext, isLastCard = false }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [time, setTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect - stops when answer is submitted
  useEffect(() => {
    if (answered) return; // Stop timer when answered

    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [answered]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOptionClick = (option) => {
    if (answered) return; // Prevent clicking after answer is selected

    setSelectedOption(option);
    setAnswered(true);

    // Check if answer is correct
    const correct = option === card.answer;
    setIsCorrect(correct);
  };

  const handleNextQuestion = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (onNext) {
      onNext({
        selectedOption,
        isCorrect,
        timeSeconds: time,
      });
    }
  };

  return (
    <div className="flashcard-container">
      <div className="timer">⏱️ {formatTime(time)}</div>

      <div
        className={`question-box ${answered && isCorrect ? "correct" : ""} ${answered && !isCorrect ? "incorrect" : ""}`}>
        <h2>{card.question}</h2>
      </div>

      <div className="options-container">
        {card.options &&
          card.options.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${selectedOption === option && answered && isCorrect ? "correct" : ""} ${selectedOption === option && answered && !isCorrect ? "incorrect" : ""}`}
              onClick={() => handleOptionClick(option)}
              disabled={answered}>
              {option}
            </button>
          ))}
      </div>

      {answered && (
        <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
          {isCorrect ? (
            <>
              <p>✓ Correct!</p>
              <p className="time-taken">Time: {formatTime(time)}</p>
              <button
                className="next-btn"
                onClick={handleNextQuestion}
                disabled={isSubmitting}>
                {isLastCard ? "Finish Quiz" : "Next Question"}
              </button>
            </>
          ) : (
            <>
              <p>✗ Wrong! The answer is: {card.answer}</p>
              <p className="time-taken">Time: {formatTime(time)}</p>
              <button
                className="next-btn"
                onClick={handleNextQuestion}
                disabled={isSubmitting}>
                {isLastCard ? "Finish Quiz" : "Next Question"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FlipCard;
