import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Plugin: expose a POST endpoint so the browser can write generated card files
function writeCardsPlugin() {
  return {
    name: "write-cards",
    configureServer(server) {
      server.middlewares.use("/api/write-cards", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const { cards, fileName } = JSON.parse(body);
            if (!cards || !Array.isArray(cards)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "cards must be an array" }));
              return;
            }
            const targetDir = path.resolve(process.cwd(), "src", "data");
            if (!fs.existsSync(targetDir))
              fs.mkdirSync(targetDir, { recursive: true });
            const safeName = (fileName || "ai_generated_cards").replace(
              /[^a-zA-Z0-9_-]/g,
              "_",
            );
            const outPath = path.join(targetDir, `${safeName}.js`);
            const content = `// Auto-generated flashcards\nexport const sampleCards = ${JSON.stringify(cards, null, 2)};\n`;
            fs.writeFileSync(outPath, content, "utf8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, path: outPath }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
// this configuration includes a development proxy for the local Ollama server
// so the frontend can call `/ollama/...` without CORS issues.
export default defineConfig({
  plugins: [react(), writeCardsPlugin()],
  server: {
    // proxy requests starting with /ollama to the local Ollama server
    proxy: {
      "/ollama": {
        target: "http://localhost:11434",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ""),
      },
    },
  },
});
