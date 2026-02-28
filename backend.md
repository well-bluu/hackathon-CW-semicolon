# SemiFlash Backend (Current Implementation)

This document describes the backend that is currently implemented in `SemiFlash/backend`.

## Stack

- Node.js + Express (ES modules)
- CORS + JSON middleware
- In-memory data stores (no active MongoDB persistence yet)
- Optional Mongoose models exist but are not wired into runtime controllers

## Project Structure

```text
SemiFlash/backend/
├── server.js
├── package.json
├── config/
│   └── db.js
├── middleware/
│   └── errorHandler.js
├── routes/
│   ├── flashcards.js
│   ├── sessions.js
│   └── performance.js
├── controllers/
│   ├── flashcardController.js
│   ├── sessionController.js
│   └── performanceController.js
└── models/
    ├── Flashcard.js
    ├── Session.js
    └── Performance.js
```

## Server Behavior

- Base URL (dev): `http://localhost:5000`
- Health endpoint: `GET /` returns `{ "message": "SemiFlash API running" }`
- Mounted API routes:
  - `/api/flashcards`
  - `/api/sessions`
  - `/api/performance`
- Error handling is centralized through `middleware/errorHandler.js`

## API Endpoints (Implemented)

### Flashcards

1. `GET /api/flashcards`
- Returns all flashcards from in-memory store.

2. `GET /api/flashcards/bundle`
- Returns all flashcards (same data as `GET /api/flashcards`), intended for bulk/offline caching use.

3. `GET /api/flashcards/:topic`
- Returns cards filtered by exact topic match.

4. `POST /api/flashcards`
- Creates a flashcard.
- Required: `question`, `answer`, `options` (minimum 2 options).
- Validation: `answer` must be one of `options`.
- Defaults:
  - `topic`: `"General"`
  - `subject`: `"General"`
  - `difficulty`: `"medium"`

Example request:

```json
{
  "question": "What is 5 x 6?",
  "options": ["25", "30", "35"],
  "answer": "30"
}
```

### Sessions

1. `POST /api/sessions/start`
- Creates a new session.
- Response: `{ "sessionId": "session_<timestamp>" }`

2. `POST /api/sessions/answer`
- Appends an answer record to an existing session.
- Body fields:
  - `sessionId` (required)
  - `flashcardId`
  - `topic` (defaults to `"General"`)
  - `responseTimeMs`
  - `isCorrect`
  - `focusScore` (defaults to `0`)

3. `POST /api/sessions/end`
- Sets `endTime` for the given session.

4. `GET /api/sessions/:sessionId`
- Returns one session object by `sessionId`.

### Performance

1. `GET /api/performance/:sessionId`
- Computes per-topic analytics from a session's answers:
  - `accuracy`
  - `avgResponseTimeMs`
  - `avgFocusScore`
  - `attemptCount`
  - `tag` (`weak`, `average`, `strong`)

Tagging logic:
- `weak`: accuracy < 50 OR average response time > 15000 ms
- `strong`: accuracy > 80 AND average response time < 5000 ms
- otherwise `average`

2. `GET /api/performance/:sessionId/summary`
- Returns:
  - `totalAnswered`
  - `correctAnswers`
  - `accuracy` (string, 2 decimals)
  - `avgResponseTimeMs` (string, rounded)

## Data Storage Notes

- Flashcards and sessions are currently stored in memory only.
- Restarting the backend clears all data.
- `models/*.js` and `config/db.js` are present for MongoDB but `connectDB()` is not called in `server.js` yet.

## Run Commands

From `SemiFlash/backend`:

```bash
npm install
npm run dev
```

or:

```bash
npm start
```

Default port is `5000` unless `PORT` is set in environment variables.
