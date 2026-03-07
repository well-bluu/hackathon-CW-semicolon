import { useState, useEffect } from "react";
import "./InputScreen.css";

function InputScreen({ onStart }) {
  const [text, setText] = useState(() => {
    return localStorage.getItem("flashcard-text") || "";
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // keep text in localStorage as it changes
  useEffect(() => {
    localStorage.setItem("flashcard-text", text);
  }, [text]);

  const parseInput = (raw) => {
    if (!raw || !raw.trim()) {
      throw new Error(
        "No text provided – please paste your questions in the box.",
      );
    }

    // first, try splitting by blank lines (common when copying from docs)
    let sections = raw
      .split(/\n\s*\n/) // blank-line separated blocks
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // if we only got one section but it contains numbered questions, split on the numbering
    if (
      sections.length === 1 &&
      /^\s*\d+[.)]/m.test(sections[0]) &&
      /\n\s*\d+[.)]/.test(sections[0])
    ) {
      const lines = sections[0].split("\n");
      sections = [];
      let bucket = [];
      lines.forEach((line) => {
        if (/^\s*\d+[.)]/.test(line) && bucket.length) {
          sections.push(bucket.join("\n").trim());
          bucket = [];
        }
        bucket.push(line);
      });
      if (bucket.length) {
        sections.push(bucket.join("\n").trim());
      }
    }

    const cards = [];

    sections.forEach((sec, idx) => {
      const lines = sec
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      let question = "";
      const options = [];
      let answerLine = "";

      lines.forEach((l) => {
        // remove leading numbering (1.  or 1) or bullets
        const cleaned = l.replace(/^\s*\d+[.)]\s*/, "");

        if (/^answer[:\s]/i.test(cleaned)) {
          answerLine = cleaned.replace(/^answer[:\s]*/i, "").trim();
          // drop trailing punctuation like ')' or '.' if user wrote "Answer: b)"
          answerLine = answerLine.replace(/[).]$/, "").trim();
        } else if (/^[A-Za-z][).:]/.test(cleaned)) {
          const opt = cleaned.replace(/^[A-Za-z][).:]\s*/, "");
          options.push(opt.trim());
        } else {
          if (!question) {
            question = cleaned;
          } else {
            // support multi‑line questions
            question += " " + cleaned;
          }
        }
      });

      if (!question) {
        throw new Error(`Card ${idx + 1}: could not identify a question`);
      }
      if (options.length < 2) {
        throw new Error(`Card ${idx + 1}: expected at least two options`);
      }
      if (!answerLine) {
        throw new Error(`Card ${idx + 1}: missing answer`);
      }

      let answer = answerLine;
      // if answer is a single letter, convert to option text
      if (/^[A-Za-z]$/.test(answer)) {
        const pos = answer.toUpperCase().charCodeAt(0) - 65;
        if (pos < 0 || pos >= options.length) {
          throw new Error(
            `Card ${idx + 1}: answer letter "${answer}" is out of range`,
          );
        }
        answer = options[pos];
      }

      if (!options.includes(answer)) {
        throw new Error(
          `Card ${idx + 1}: answer "${answer}" does not match any option`,
        );
      }

      cards.push({ id: idx + 1, question, options, answer });
    });

    if (cards.length === 0) {
      throw new Error(
        "No questions found – make sure your text contains numbered or blank‑line separated questions with options and an answer.",
      );
    }

    return cards;
  };

  const handleStart = async () => {
    setError("");
    let parsed;
    try {
      parsed = parseInput(text);
    } catch (err) {
      return setError(err.message);
    }

    if (parsed.length === 0) {
      return setError(
        "Parsing produced no flashcards. Make sure your text contains questions, multiple‑choice options, and an answer for each.",
      );
    }

    setLoading(true);
    // send to backend; don't block the UI if it fails
    try {
      await Promise.all(
        parsed.map((card) =>
          fetch("http://localhost:5000/api/flashcards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: card.question,
              answer: card.answer,
              options: card.options,
            }),
          }).catch((e) => {
            console.warn("failed to save card", card, e);
          }),
        ),
      );
    } catch (e) {
      // not fatal
      console.warn(e);
    }
    setLoading(false);
    // stash cards so we can resume the quiz later
    try {
      localStorage.setItem("flashcards", JSON.stringify(parsed));
    } catch (e) {
      console.warn("failed to persist cards", e);
    }
    onStart(parsed);
  };

  return (
    <div className="input-container">
      <h2 className="input-title">Paste or type your questions</h2>
      <p className="input-instructions">
        You can paste raw text from reviews, notes or documents. Each question
        should be followed by multiple‑choice options and an answer (letter or
        text). Blank lines or numbered prefixes are allowed; the parser will
        figure it out.
      </p>
      <textarea
        className="input-textarea"
        placeholder={`1. What is the capital of France?\na) London\nb) Paris\nc) Berlin\nAnswer: b\n\n2. What is 5 x 6?\na) 25\nb) 30\nc) 35\nAnswer: b`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {error && <div className="input-error">⚠ {error}</div>}

      <button className="start-btn" onClick={handleStart} disabled={loading}>
        {loading ? "Processing..." : "Start"}
      </button>
    </div>
  );
}

export default InputScreen;
