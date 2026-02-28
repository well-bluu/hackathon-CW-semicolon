// helper for interacting with a local Ollama AI server

/**
 * Send a prompt to the local Ollama REST API and return the response.
 *
 * The Vite development server proxies `/ollama` to the real host (see vite.config.js),
 * so you can call the endpoint relatively without CORS headaches.
 *
 * @param {string} prompt - the text to send to the model
 * @param {object} [options] - optional settings such as model name, temperature, etc.
 */
export async function queryOllama(prompt, options = {}) {
  const body = {
    model: options.model || 'deepseek-r1:8b', // replace with your model name
    prompt,
    ...options,
  };

  // endpoint may vary (v1/completions, api/chat, etc.)
  const endpoint = options.endpoint || '/ollama/v1/completions';
  console.log('Sending request to', endpoint, body)

  // if timeoutMs is provided and greater than zero, use it; otherwise do not abort
  let controller;
  let timeoutId;
  const timeoutMs = options.timeoutMs;
  console.log('timeoutMs:', timeoutMs);
  if (timeoutMs !== undefined && timeoutMs > 0) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.warn(`queryOllama aborting after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);
  }

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller?.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama request failed  : ${res.status} ${text}`);
  }

  // stream progress if requested
  if (options.onProgress && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
      options.onProgress(accumulated);
    }
    return accumulated;
  }

  // default: parse as JSON
  return res.json();
}
