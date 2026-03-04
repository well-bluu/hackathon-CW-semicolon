# hackathon-CW-semicolon
# SemiFlash

Flashcard web app with a Vite + React frontend and a Node/Express backend using MongoDB.

## Summary

SemiFlash is a lightweight study and flashcard application built for quick creation, review, and AI-assisted ingestion of study material. The repository contains a Vite-based React frontend (`SemiFlash`) and an Express/MongoDB backend (`SemiFlash/backend`).

## Features

- Create, edit, and review flashcards and decks
- Track user performance and study sessions
- AI-assisted card ingestion script (`scripts/ingestAi.js`)
- Simple REST API for flashcards, sessions and performance

## Tech stack

- Frontend: React (Vite)
- Backend: Node.js, Express
- Database: MongoDB (via Mongoose)
- Tooling: Vite, ESLint, nodemon

## Local AI (Ollama)

This project uses a local Ollama model for AI-assisted card generation. The recommended model is `deepseek-r1:8b` running locally via Ollama. The `scripts/ingestAi.js` utility expects plain numbered-text output (see script comments) and converts it into `src/data/ai_generated_cards.js`.

Example workflow (generate and ingest in one step):

```bash
ollama run deepseek-r1:8b --prompt "Generate 10 multiple-choice flashcards about photosynthesis in numbered format" \
	| node scripts/ingestAi.js
```

Notes:
- Ensure Ollama is installed and the `deepseek-r1:8b` model is available locally.

## Prerequisites

- Node.js >= 16
- npm or yarn
- A running MongoDB instance (local or hosted)

## Quick start

1. Clone the repo and open the project folder:

```bash
git clone <repo-url>
cd hackathon-CW-semicolon/SemiFlash
```

2. Install dependencies for the frontend and backend:

```bash
npm install           # installs frontend deps in SemiFlash/
cd backend
npm install           # installs backend deps in SemiFlash/backend/
cd ..
```

3. Configure environment variables for the backend. Create a `.env` file in `SemiFlash/backend` and set at least:

```
MONGO_URI=<your-mongodb-connection-string>
```

4. Run the backend and frontend in development mode (in separate terminals):

Terminal 1 (backend):

```bash
cd SemiFlash/backend
npm run dev            # starts server with nodemon (script: "dev")
```

Terminal 2 (frontend):

```bash
cd SemiFlash
npm run dev            # starts Vite dev server (script: "dev")
```

The frontend will open on `http://localhost:5173` by default and the backend API will listen on the port defined in `SemiFlash/backend/server.js` (defaults to `process.env.PORT` or `3000`).

## Useful scripts

- Frontend (in `SemiFlash/`):
	- `npm run dev` — start Vite dev server
	- `npm run build` — build production frontend
	- `npm run preview` — preview built frontend
	- `npm run ingest-ai` — run AI ingestion script (`scripts/ingestAi.js`)
- Backend (in `SemiFlash/backend`):
	- `npm run dev` — start server with `nodemon` (development)
	- `npm start` — start server with `node server.js` (production)

## Environment variables

Check [SemiFlash/backend/config/db.js](SemiFlash/backend/config/db.js) — the backend expects at least:

- `MONGO_URI` — MongoDB connection string

Other environment variables may be referenced in `SemiFlash/backend/server.js` or other backend files (for example `PORT`, JWT secrets, etc.).

## Project structure (high level)

- `SemiFlash/` — frontend application (Vite + React)
	- `src/` — React components, styles, sample data, and prompt templates
	- `scripts/ingestAi.js` — AI ingestion utility
- `SemiFlash/backend/` — Express backend
	- `controllers/`, `models/`, `routes/`, `middleware/`, `config/`

## Contributing

Contributions are welcome. Please open issues or pull requests with a clear description of the change.

## Next steps & notes

- Add a `.env.example` in `SemiFlash/backend` listing required env vars (e.g. `MONGO_URI`, `PORT`, any auth secrets).
- Add README or quick-start sections inside `SemiFlash/` and `SemiFlash/backend/` if you want per-subproject docs.

## License

This project is provided as-is. Add a license file if you want to specify reuse terms.

## Screenshots

UI screenshots are included in `SemiFlash/img/`. Below are a few key views:

- **Main page**

	![Main Page](SemiFlash/img/main%20page.png)

- **Card decks**

	![Card Decks](SemiFlash/img/card%20decks.png)

- **Card sample / study view**

	![Card Sample](SemiFlash/img/card%20sample%20.png)

- **Deck statistics**

	![Deck Statistics 1](SemiFlash/img/deck%20statistics%20.png)
	![Deck Statistics 2](SemiFlash/img/deck%20statistics%202.png)

