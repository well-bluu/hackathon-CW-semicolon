import "./AIDemo.css";
import { useState } from "react";
import { queryOllama } from "./aiService";
import promptTemplate from "./prompt/prompt.md?raw";

function AIDemo({ onGenerate, onBack }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setProgress("");
    if (!input.trim()) {
      setError(
        "Please paste some text or a PDF-extracted transcript to generate cards.",
      );
      return;
    }

    setLoading(true);
    try {
      const finalPrompt = `${promptTemplate}\n\nUser Question:\n${input}`;

      const res = await queryOllama(finalPrompt, {
        endpoint: "/ollama/v1/completions",
        timeoutMs: 120000,
        maxTimeMs: 120000,
        temperature: 0.2,
        onProgress: (txt) => setProgress(txt),
      });

      // Extract the raw text from the model response.
      // When streaming is enabled, queryOllama returns the accumulated string
      // which may be the full JSON envelope (not just the text content).
      let rawText = "";
      const extractFromObj = (obj) => {
        if (obj?.choices && Array.isArray(obj.choices)) {
          return obj.choices.map((c) => c.text ?? "").join("");
        }
        return null;
      };

      if (typeof res === "string") {
        // The string could be the raw JSON response — try to parse and extract
        try {
          const parsed = JSON.parse(res);
          const extracted = extractFromObj(parsed);
          rawText = extracted ?? res;
        } catch {
          // Not JSON — use as-is (already numbered text)
          rawText = res;
        }
      } else if (typeof res === "object" && res !== null) {
        const extracted = extractFromObj(res);
        rawText = extracted ?? JSON.stringify(res);
      }

      // ---- Parse the numbered-text format into cards ----
      // Expected format:
      //   1. Question text?
      //   a) Option A
      //   b) Option B
      //   c) Option C
      //   answer: b
      const parseTextToCards = (text) => {
        if (!text || typeof text !== "string") return null;

        // Split into question blocks — each starts with a number followed by a dot
        const blocks = text.split(/(?=^\s*\d+\.\s)/m).filter((b) => b.trim());
        if (blocks.length === 0) return null;

        const cards = [];

        for (const block of blocks) {
          const trimmed = block.trim();

          // Extract question: first line after the number
          const questionMatch = trimmed.match(/^\s*\d+\.\s*(.+)/);
          if (!questionMatch) continue;
          const question = questionMatch[1].trim();

          // Extract options: lines starting with a), b), c) (may have leading whitespace)
          const optionMatches = [...trimmed.matchAll(/^\s*([a-z])\)\s*(.+)/gm)];
          const options = optionMatches.map((m) => ({
            letter: m[1],
            text: m[2].trim(),
          }));

          // Extract answer letter: line starting with "answer:" (may have leading whitespace)
          const answerMatch = trimmed.match(/^\s*answer:\s*([a-z])/im);
          if (!answerMatch || options.length === 0) continue;

          const answerLetter = answerMatch[1].toLowerCase();
          const answerOption = options.find((o) => o.letter === answerLetter);
          const answer = answerOption ? answerOption.text : options[0].text;

          cards.push({
            id: cards.length + 1,
            question,
            answer,
            options: options.map((o) => o.text),
          });
        }

        return cards.length > 0 ? cards : null;
      };

      const cards = parseTextToCards(rawText);

      if (!cards || cards.length === 0) {
        throw new Error(
          "AI did not return recognizable flashcards. Expected numbered question format.",
        );
      }

      // Suggest a deck name based on the input text
      const makeConstName = (text) => {
        if (!text || !text.trim()) return "cards";
        const words = text
          .replace(/[^a-zA-Z0-9\s]/g, " ")
          .trim()
          .split(/\s+/)
          .slice(0, 3);
        let name = words
          .map((w, i) =>
            i === 0
              ? w.toLowerCase()
              : w[0].toUpperCase() + w.slice(1).toLowerCase(),
          )
          .join("");
        name = name || "cards";
        if (!/^[a-zA-Z]/.test(name)) name = `cards${name}`;
        return name;
      };

      const suggestedName = makeConstName(input || "cards");

      if (onGenerate) onGenerate(cards, suggestedName);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate cards");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-demo">
      <div className="ai-container">
        <div className="ai-header">
          <div className="ai-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
              <path
                d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z"
                fill="currentColor"
                opacity=".85"
              />
              <path
                d="M19 15l1.04 3.13L23.18 19l-3.14.87L19 23l-1.04-3.13L14.82 19l3.14-.87L19 15z"
                fill="currentColor"
                opacity=".5"
              />
            </svg>
          </div>
          <div>
            <h2>AI Assistant</h2>
            <p className="ai-sub">
              Paste your study material and let AI generate flashcards for you.
            </p>
          </div>
        </div>

        <div className="ai-input-section">
          <label className="ai-input-label" htmlFor="ai-input">
            Your content
          </label>
          <textarea
            id="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your notes, textbook content, or any study material here..."
            rows={8}
            className="ai-textarea"
          />
          <div className="ai-input-hint">
            {input.length > 0
              ? `${input.trim().split(/\s+/).length} words`
              : "Tip: The more context you give, the better the flashcards."}
          </div>
        </div>

        <div className="ai-actions">
          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="ai-gen-btn">
            {loading ? (
              <>
                <span className="ai-spinner" />
                Generating...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                  <path
                    d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z"
                    fill="currentColor"
                  />
                </svg>
                Generate Cards
              </>
            )}
          </button>
          <button onClick={onBack} className="ai-back-btn">
            Back
          </button>
        </div>

        {loading && progress && (
          <div className="ai-progress">
            <div className="ai-progress-label">AI is thinking...</div>
            <pre className="ai-progress-text">{progress}</pre>
          </div>
        )}

        {error && (
          <div className="ai-error">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIDemo;
