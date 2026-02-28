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

  const attempts = Array.isArray(results.attempts) ? results.attempts : [];
  const totalQuestions = results.totalQuestions || attempts.length;
  const incorrectAnswers = attempts.filter((a) => !a.isCorrect);
  const correctAnswers = attempts.length - incorrectAnswers.length;
  const totalMistakes = incorrectAnswers.length;
  const accuracy = totalQuestions
    ? ((correctAnswers / totalQuestions) * 100).toFixed(1)
    : "0.0";
  const averageResponseSecondsRaw = attempts.length
    ? (
        attempts.reduce((sum, attempt) => sum + attempt.timeSeconds, 0) /
        attempts.length
      )
    : 0;
  const averageResponseSeconds = averageResponseSecondsRaw.toFixed(1);
  const slowThresholdSeconds = Math.max(10, averageResponseSecondsRaw * 1.25);

  const perQuestionPerformance = attempts.map((attempt) => {
    const isSlow = attempt.timeSeconds >= slowThresholdSeconds;
    return {
      ...attempt,
      isSlow,
      struggled: !attempt.isCorrect || isSlow,
    };
  });

  const struggledQuestionNumbers = perQuestionPerformance
    .filter((a) => a.struggled)
    .map((a) => a.questionNumber);

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
    .filter(([topic, stat]) => topic !== "General" && stat.incorrect > 0)
    .map(([topic, stat]) => ({
      topic,
      missRate: Math.round((stat.incorrect / stat.total) * 100),
      incorrect: stat.incorrect,
      total: stat.total,
    }))
    .sort((a, b) => b.missRate - a.missRate);

  const hardestQuestions = [...attempts]
    .sort((a, b) => b.timeSeconds - a.timeSeconds)
    .slice(0, 3);

  const slowQuestionCount = perQuestionPerformance.filter((a) => a.isSlow).length;

  const strengths = [];
  if (Number(accuracy) >= 85) strengths.push("High overall accuracy");
  if (averageResponseSecondsRaw > 0 && averageResponseSecondsRaw <= 8) {
    strengths.push("Fast average response time");
  }
  if (totalMistakes === 0) strengths.push("Perfect run with no mistakes");

  const weaknesses = [];
  if (totalMistakes > 0) {
    weaknesses.push(`${totalMistakes} incorrect answer(s) to review`);
  }
  if (slowQuestionCount > 0) {
    weaknesses.push(
      `${slowQuestionCount} question(s) answered slower than ${slowThresholdSeconds.toFixed(1)}s`,
    );
  }
  if (weakTopics.length > 0) {
    weaknesses.push(`Weakest topic: ${weakTopics[0].topic}`);
  }

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
            <span className="metric-label">Mistakes</span>
            <span className="metric-value">{totalMistakes}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg Response</span>
            <span className="metric-value">{averageResponseSeconds}s</span>
          </div>
        </div>

        <div className="results-section">
          <h3>Question Numbers You Struggled With</h3>
          {struggledQuestionNumbers.length === 0 ? (
            <p className="muted">
              Great work. No struggled questions detected.
            </p>
          ) : (
            <p className="inline-list">{struggledQuestionNumbers.join(", ")}</p>
          )}
        </div>

        <div className="results-section">
          <h3>Per-Question Performance</h3>
          {perQuestionPerformance.length === 0 ? (
            <p className="muted">No attempt data available.</p>
          ) : (
            <ul className="attempt-list">
              {perQuestionPerformance.map((item) => (
                <li key={`attempt-${item.questionNumber}`}>
                  <div className="attempt-top">
                    <span className="question-line">Question {item.questionNumber}</span>
                    <span
                      className={`status-pill ${item.isCorrect ? "ok" : "bad"}`}>
                      {item.isCorrect ? "Correct" : "Wrong"}
                    </span>
                  </div>
                  <div className="attempt-meta">
                    <span>Time: {item.timeSeconds}s</span>
                    {item.isSlow && <span className="slow-flag">Slow</span>}
                  </div>
                </li>
              ))}
            </ul>
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
            <p className="muted">
              No weak topics detected (or topic labels are not available).
            </p>
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

        <div className="results-section">
          <h3>Questions That Took The Longest</h3>
          {hardestQuestions.length === 0 ? (
            <p className="muted">No timing data available.</p>
          ) : (
            <ul className="topic-list">
              {hardestQuestions.map((item) => (
                <li key={`time-${item.questionNumber}`}>
                  <span>Question {item.questionNumber}</span>
                  <span>{item.timeSeconds}s</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="results-section">
          <h3>Strengths and Weaknesses</h3>
          <div className="summary-grid">
            <div>
              <p className="summary-title">Strengths</p>
              {strengths.length === 0 ? (
                <p className="muted">No strong patterns yet.</p>
              ) : (
                <ul className="summary-list">
                  {strengths.map((item) => (
                    <li key={`s-${item}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="summary-title">Weaknesses</p>
              {weaknesses.length === 0 ? (
                <p className="muted">No clear weakness detected.</p>
              ) : (
                <ul className="summary-list">
                  {weaknesses.map((item) => (
                    <li key={`w-${item}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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
