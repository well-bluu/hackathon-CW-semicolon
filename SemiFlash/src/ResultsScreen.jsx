import "./ResultsScreen.css";

function ResultsScreen({ results, deckName, onRetake, onBackToDecks }) {
  if (!results) {
    return (
      <section className="results-screen">
        <div className="results-card">
          <h2>No results yet</h2>
          <p>Finish a quiz first to view your performance summary.</p>
        </div>
      </section>
    );
  }

  const { totalQuestions, correctAnswers, incorrectAnswers, attempts } = results;
  const accuracy = totalQuestions
    ? ((correctAnswers / totalQuestions) * 100).toFixed(1)
    : "0.0";
  const averageResponseSeconds = attempts.length
    ? (
        attempts.reduce((sum, attempt) => sum + attempt.timeSeconds, 0) /
        attempts.length
      ).toFixed(1)
    : "0.0";

  const struggledQuestionNumbers = incorrectAnswers.map((a) => a.questionNumber);

  const topicStats = attempts.reduce((acc, attempt) => {
    const topic = attempt.topic || "General";
    if (!acc[topic]) {
      acc[topic] = { total: 0, incorrect: 0 };
    }

    acc[topic].total += 1;
    if (!attempt.isCorrect) acc[topic].incorrect += 1;
    return acc;
  }, {});

  const weakTopics = Object.entries(topicStats)
    .filter(([, stat]) => stat.incorrect > 0)
    .map(([topic, stat]) => ({
      topic,
      missRate: Math.round((stat.incorrect / stat.total) * 100),
      incorrect: stat.incorrect,
      total: stat.total,
    }))
    .sort((a, b) => b.missRate - a.missRate);

  return (
    <section className="results-screen">
      <div className="results-card">
        <p className="results-kicker">Study Report</p>
        <h2>{deckName ? `${deckName} Results` : "Quiz Results"}</h2>

        <div className="results-metrics">
          <div className="metric-item">
            <span className="metric-label">Final Score</span>
            <span className="metric-value">
              {correctAnswers} / {totalQuestions}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Accuracy</span>
            <span className="metric-value">{accuracy}%</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Incorrect</span>
            <span className="metric-value">{incorrectAnswers.length}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Response</span>
            <span className="metric-value">{averageResponseSeconds}s</span>
          </div>
        </div>

        <div className="results-section">
          <h3>Question Numbers You Struggled With</h3>
          {struggledQuestionNumbers.length === 0 ? (
            <p className="muted">Great work. You answered all questions correctly.</p>
          ) : (
            <p className="inline-list">{struggledQuestionNumbers.join(", ")}</p>
          )}
        </div>

        <div className="results-section">
          <h3>Incorrect Answers</h3>
          {incorrectAnswers.length === 0 ? (
            <p className="muted">No incorrect answers in this run.</p>
          ) : (
            <ul className="incorrect-list">
              {incorrectAnswers.map((item) => (
                <li key={item.questionNumber}>
                  <p className="question-line">
                    Q{item.questionNumber}. {item.question}
                  </p>
                  <p className="answer-line">Your answer: {item.selectedAnswer || "No answer"}</p>
                  <p className="answer-line">Correct answer: {item.correctAnswer}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="results-section">
          <h3>Weak Topics</h3>
          {weakTopics.length === 0 ? (
            <p className="muted">No weak topics detected from this attempt.</p>
          ) : (
            <ul className="topic-list">
              {weakTopics.map((topic) => (
                <li key={topic.topic}>
                  <span>{topic.topic}</span>
                  <span>
                    {topic.incorrect}/{topic.total} incorrect ({topic.missRate}% miss rate)
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="results-actions">
          <button className="btn-secondary" onClick={onBackToDecks}>
            Back to Decks
          </button>
          <button className="btn-primary" onClick={onRetake}>
            Retake Quiz
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResultsScreen;
