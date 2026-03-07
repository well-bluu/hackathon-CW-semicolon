import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// Plugin: expose API endpoints for reading/writing card files in src/data/
function writeCardsPlugin() {
  return {
    name: "write-cards",
    configureServer(server) {
      // GET /api/list-decks – scan src/data/*.js and return deck objects
      server.middlewares.use("/api/list-decks", (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        try {
          const targetDir = path.resolve(process.cwd(), "src", "data");
          if (!fs.existsSync(targetDir)) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify([]));
            return;
          }
          const files = fs
            .readdirSync(targetDir)
            .filter((f) => f.endsWith(".js"));
          const decks = [];
          for (const file of files) {
            try {
              const filePath = path.join(targetDir, file);
              const text = fs.readFileSync(filePath, "utf8");
              // Extract the exported array from patterns like:
              //   export const sampleCards = [...]
              //   export const cards = [...]
              const m = text.match(
                /export\s+const\s+(?:cards|sampleCards)\s*=\s*([\s\S]*?);?\s*$/,
              );
              if (!m) continue;
              let cards;
              try {
                cards = JSON.parse(m[1]);
              } catch {
                // fallback: evaluate as JS expression
                cards = new Function(`return (${m[1]})`)();
              }
              if (!Array.isArray(cards) || cards.length === 0) continue;
              // Derive a human-readable name from the filename
              const baseName = file.replace(/\.js$/, "");
              const prettyName = baseName
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              decks.push({
                id: `file_${baseName}`,
                name: prettyName,
                cards,
                source: "file",
                fileName: file,
                createdAt: fs.statSync(filePath).mtime.toISOString(),
              });
            } catch (e) {
              console.warn(`Skipping ${file}:`, e.message);
            }
          }
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(decks));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });

      // DELETE /api/delete-deck – remove a card file from src/data/
      server.middlewares.use("/api/delete-deck", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
          try {
            const { fileName } = JSON.parse(body);
            if (!fileName) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: "fileName is required" }));
              return;
            }
            // Sanitize to prevent path traversal
            const safeName = path.basename(fileName);
            const filePath = path.join(
              path.resolve(process.cwd(), "src", "data"),
              safeName,
            );
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true, deleted: safeName }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "File not found" }));
            }
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });

      // POST /api/write-cards – write card file to src/data/
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
