import { useState } from "react";
import { queryOllama } from "../../services/aiService";
// load prompt.md so we can include instructions when generating files
import systemPrompt from "../../prompt/prompt.md?raw";

function Flashcard() {
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);

  const [notes, setNotes] = useState("");
  // fileName not needed since we no longer auto-download
  const [generatedContent, setGeneratedContent] = useState("");
  // fixed model, user-specified
  const MODEL = "deepseek-r1:8b";

  // we might want to strip the user question section from the system prompt
  const promptHeader = systemPrompt.split("---")[0] || systemPrompt;

  // query AI using notes and show output; manual conversion
  const handleQueryAI = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setGeneratedContent("");

    // allow the user to cancel request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // ask model to produce a JS export based on notes
      // prepend system instructions from prompt.md (updated to describe module generation)
      const instruction = `${promptHeader.trim()}

You are a JavaScript module generator. You MUST respond with valid JavaScript code only, nothing else. \
Create a module that exports a constant named "data" whose value is an object representing the content of the notes below. \
If you cannot convert the notes, return an empty object.
Notes:
${notes}`;
      console.log("sending instruction to model", instruction);

      // no timeout and use streaming so we see progress
      const result = await queryOllama(instruction, {
        signal: controller.signal,
        stream: true,
        model: MODEL,
        // abort the request if nothing happens for 30 seconds
        timeoutMs: 30_000,
        // also stop the streaming loop after 30 seconds of data
        maxTimeMs: 30_000,
        onProgress: (partial) => {
          setGeneratedContent(partial);
        },
      });
      let output = result;
      if (typeof result === "object" && result.choices) {
        output = result.choices.map((c) => c.text).join("");
      }

      // store output for preview
      setGeneratedContent(output || "// model produced no text");
      // no automatic download - user can copy the preview if desired
    } catch (err) {
      if (err.name === "AbortError") {
        setGeneratedContent("// request cancelled (probably manually aborted)");
      } else {
        console.error("file creation error", err);
        setGeneratedContent(`// error: ${err.message}`);
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginTop: "0.5rem" }}>
          User notes to convert to JS file:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
        </label>
        <div>
          <button onClick={handleQueryAI} disabled={loading}>
            {loading ? "Generating..." : "Run AI"}
          </button>
          {loading && abortController && (
            <button
              onClick={() => abortController.abort()}
              style={{ marginLeft: "0.5rem" }}>
              Cancel
            </button>
          )}
          <button
            onClick={async () => {
              console.log("testing model connectivity");
              try {
                const res = await queryOllama("hello", { model: MODEL });
                console.log("model test response", res);
                alert("check console for test response");
              } catch (e) {
                console.error("model test failed", e);
                alert("model test failed (see console)");
              }
            }}
            style={{ marginLeft: "0.5rem" }}>
            Test model
          </button>
        </div>
      </div>

      {generatedContent && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Preview of generated file</h3>
          <pre style={{ background: "#f5f5f5", padding: "0.5rem" }}>
            {generatedContent}
          </pre>
          {generatedContent.trim() === "// model produced no text" && (
            <p style={{ color: "red" }}>
              The model returned no output. Check the browser console to see the
              request/response, and make sure the Ollama server has the
              <code>{MODEL}</code> model installed and running. You can also use
              the "Test model" button above to verify connectivity.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Flashcard;
