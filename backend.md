Backend Development for SemiFlash
Given the file structure, this is a Vite + React frontend-only project. For your backend assignment, here's what you should build:

What You Need to Build
Tech Stack Recommendation
Node.js + Express.js (REST API)
MongoDB (Database) or Firebase (easier for students)

Your Backend Responsibilities

1. Project Setup
   backend/
   ├── server.js
   ├── package.json
   ├── .env
   ├── config/
   │ └── db.js
   ├── models/
   │ ├── User.js
   │ ├── Flashcard.js
   │ ├── Session.js
   │ └── Performance.js
   ├── routes/
   │ ├── auth.js
   │ ├── flashcards.js
   │ ├── sessions.js
   │ └── performance.js
   └── controllers/
   ├── authController.js
   ├── flashcardController.js
   ├── sessionController.js
   └── performanceController.js

2. API Endpoints to Build
   Authentication
   POST /api/auth/register → Create student account
   POST /api/auth/login → Login + return JWT token
   GET /api/auth/me → Get current user profile
   Flashcards
   GET /api/flashcards → Get all flashcards (by subject/topic)
   GET /api/flashcards/:topic → Get flashcards by topic
   POST /api/flashcards → Add new flashcard (admin)
   Sessions (Quiz/Study Sessions)
   POST /api/sessions/start → Start a new flashcard session
   POST /api/sessions/answer → Submit an answer + response time
   POST /api/sessions/end → End session, save results
   GET /api/sessions/:userId → Get session history
   Performance & Analytics
   GET /api/performance/:userId → Get weak/strong areas
   GET /api/performance/:userId/summary → Dashboard summary stats
   POST /api/performance/log → Log eye-tracking focus data

3. Key Data Models
   Session Model — most important for your app's core feature:
   js{
   userId: ObjectId,
   startTime: Date,
   endTime: Date,
   answers: [
   {
   flashcardId: ObjectId,
   topic: String,
   responseTimeMs: Number, // ← core mechanic
   isCorrect: Boolean,
   focusScore: Number // from eye-tracking (0-1)
   }
   ]
   }
   Performance Model:
   js{
   userId: ObjectId,
   topicBreakdown: [
   {
   topic: String,
   avgResponseTimeMs: Number,
   accuracy: Number, // percentage
   avgFocusScore: Number,
   attemptCount: Number,
   tag: String // "weak" | "average" | "strong"
   }
   ],
   lastUpdated: Date
   }

4. Performance Analysis Logic
   This is your most important backend function — tagging weak vs strong areas:
   jsfunction analyzePerformance(topicStats) {
   // Tag based on response time + accuracy
   if (accuracy < 50% || avgResponseTime > 15s) → "weak"
   if (accuracy > 80% && avgResponseTime < 5s) → "strong"
   else → "average"
   }

5. SDG 4 / Low-Bandwidth Considerations
   Since the problem involves rural/low-connectivity students:

Keep API responses lightweight (minimal JSON)
Add offline support hint: expose a GET /api/flashcards/bundle endpoint that returns all flashcards in one call so the frontend can cache them
Avoid large payloads — no base64 images in responses

Quick Start Commands
bashmkdir backend && cd backend
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken cors
npm install --save-dev nodemon

Coordinate With Your Team
RoleNeeds From YouFrontendAPI base URL, endpoint docs, response formatUI/DesignNo direct dependencyYour jobReturn clean JSON, handle errors properly, document your routes
Your most critical deliverable is the session + performance analytics endpoints — that's the core logic that powers the weak/strong area detection and the dashboard.
