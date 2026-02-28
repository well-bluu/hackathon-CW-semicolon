// helper for interacting with a local Ollama AI server

/**
 * Send a prompt to the local Ollama REST API and return the response.
 * The Vite development server proxies `/ollama` to the real host (see vite.config.js),
 * so you can call the endpoint relatively without CORS headaches.
 *
 * @param {string} prompt - the text to send to the model
 * @param {object} [options] - optional settings such as model name, temperature, etc.
 */
export async function queryOllama(prompt, options = {}) {
  const body = {
    model: options.model || "deepseek-r1:8b", // replace with your model name
    prompt,
    ...options,
  };

  // endpoint may vary (v1/completions, api/chat, etc.)
  const endpoint = options.endpoint || "/ollama/v1/completions";
  console.log("Sending request to", endpoint, body);

  // if timeoutMs is provided and greater than zero, use it; otherwise do not abort
  let controller;
  let timeoutId;
  const timeoutMs = options.timeoutMs;
  console.log("timeoutMs:", timeoutMs);
  if (timeoutMs !== undefined && timeoutMs > 0) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.warn(`queryOllama aborting after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);
  }

  let res;
  try {
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller?.signal,
      });
    } catch (err) {
      // clearer messaging for aborts/timeouts
      clearTimeout(timeoutId);
      if (err && err.name === "AbortError") {
        throw new Error(
          `Ollama request aborted (timeout after ${timeoutMs ?? "unknown"} ms or manually cancelled)`,
        );
      }
      throw err;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama request failed: ${res.status} ${text}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }

  // stream progress if requested
  if (options.onProgress && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";
    let emptyCount = 0; // guard when nothing new arrives
    let lastLength = 0;
    let iterations = 0;
    const maxIterations = 500; // safety cap to avoid infinite loops
    const startTime = Date.now();
    const maxTimeMs = options.maxTimeMs || timeoutMs || 30_000; // prefer explicit maxTimeMs, then timeoutMs
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // time‑based guard
      if (Date.now() - startTime > maxTimeMs) {
        console.warn("stream timed out after", maxTimeMs, "ms");
        break;
      }
      iterations++;
      if (iterations > maxIterations) {
        console.warn("stream exceeded max iterations, breaking");
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      console.debug("stream chunk", JSON.stringify(chunk));

      // try to extract just the model text from SSE JSON events
      let toAppend = chunk;
      const sseMatch = chunk.match(/data: (\{.*\})/);
      if (sseMatch) {
        try {
          const obj = JSON.parse(sseMatch[1]);
          const txt = obj.choices?.map((c) => c.text).join("") || "";
          if (txt.trim().length === 0) {
            // event carries no actual model output – count as empty progress
            emptyCount++;
            // still update lastLength so the progress check works
            lastLength = accumulated.length;
            if (emptyCount > 5) {
              console.warn("received many empty text events, breaking");
              try {
                reader.cancel();
              } catch (err) {
                console.debug("reader.cancel error", err);
              }
              break;
            }
            continue; // skip adding this chunk entirely
          }
          toAppend = txt;
        } catch (err) {
          console.debug("SSE parse/JSON error", err);
        }
      }

      accumulated += toAppend;
      options.onProgress(accumulated);

      const trimmed = toAppend.trim();
      const progress = accumulated.length;
      if (trimmed.length === 0 || progress === lastLength) {
        emptyCount++;
      } else {
        emptyCount = 0;
      }
      lastLength = progress;
      // no real progress for many chunks -> break
      if (emptyCount > 5) {
        console.warn("stream produced many empty/unchanged chunks, breaking");
        try {
          reader.cancel();
        } catch (err) {
          console.debug("reader.cancel error", err);
        }
        break;
      }
    }
    return accumulated;
  }

  // default: parse as JSON
  return res.json();
}
