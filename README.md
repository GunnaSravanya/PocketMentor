# Pocket Mentor — AI-Powered Study & Revision Assistant

> Transform messy study notes into mastered concepts with AI.

Pocket Mentor is a full-stack revision platform designed specifically for students. It takes unorganized lecture notes or uploaded PDF slides and converts them into a 60-second audio summary, active flashcards, diagnostic AI quizzes, automated weak-area detection, and targeted revision modules.

---

## 🌟 Key Features

1. **Document Upload & Text Extraction**:
   - Upload PDF, TXT, or Markdown documents (stored via Cloudinary).
   - Or paste raw lecture notes directly without uploading files.
   - Robust text extraction with whitespace normalization.

2. **60-Second Audio Summary**:
   - High-yield conceptual synopsis generated with AI (Grok API).
   - Built-in Voice Narration using browser **SpeechSynthesis** (Play, Pause, Resume, Stop).

3. **Active Recall Flashcards**:
   - Interactive 3D flip / reveal cards covering definitions, formulas, and critical concepts.
   - Progress indicator, card shuffling, and regeneration.

4. **Diagnostic AI Multiple Choice Quiz (MCQ)**:
   - 5-10 targeted multiple-choice questions with exactly 4 options.
   - Every question is tagged with a specific **Topic** to power weak-area detection.
   - Accidental submission prevention review modal.

5. **Server-Side Grading & Pedagogical Explanations**:
   - Backend evaluates student answers and calculates true score.
   - Explains every incorrect answer: why the selected choice was wrong, and why the correct answer is right according to the study notes.

6. **Weak-Area Detection (<60% Accuracy)**:
   - Groups performance by topic: `accuracy = (correct / total) * 100`.
   - Flags topics with accuracy `< 60%` as weak areas.
   - Configurable via `WEAK_AREA_THRESHOLD`.

7. **Targeted Weak-Area Revision**:
   - Dedicated revision module for each weak topic: Quick Explanation → Important Takeaways → Topic Flashcards → Mini Practice with instant validation.

8. **Retry Same Quiz vs. Generate New Quiz**:
   - **Continue Same Quiz**: Retries the same questions with new attempt tracking to measure score progression.
   - **Generate New Quiz**: Calls Grok AI again to generate Quiz Generation N+1 without overwriting previous quizzes.

9. **Quiz History & Progression**:
   - Comprehensive history view with generation numbers, scores, percentages, and clickable attempt breakdowns.

---

## 🏗️ Architecture & Technology Stack

```text
Pocket-Mentor/
│
├── client/                     # Vite + React + Tailwind CSS + Zustand + Lucide
│   ├── src/
│   │   ├── components/         # Navbar, Modals, StatCards
│   │   ├── layouts/            # AppLayout (Protected), AuthLayout
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Upload, NoteDetails,
│   │   │                       # Summary, Flashcards, Quiz, QuizResult, ReviseTopic, History
│   │   ├── store/              # Zustand stores (authStore, noteStore, quizStore)
│   │   ├── services/           # Axios API client (commonApi, mentorApi)
│   │   ├── hooks/              # useSpeechSynthesis
│   │   ├── App.jsx             # React Router configuration
│   │   └── main.jsx
│   └── package.json
│
└── server/                     # Node.js + Express (ES Modules)
    ├── config/                 # db.js, cloudinary.js, constants.js
    ├── controllers/            # authController, noteController, mentorController
    ├── middleware/             # authMiddleware (JWT HTTP-only), uploadMiddleware
    ├── models/                 # UserModel, NoteModel, SummaryModel, FlashcardSetModel,
    │                           # QuizModel, QuizAttemptModel
    ├── routes/                 # /api/common (auth, notes), /api/mentor (AI features)
    ├── services/               # grokService.js, pdfService.js
    ├── utils/                  # apiResponse.js, jwt.js
    ├── app.js                  # Express App configuration
    ├── server.js               # Entry point
    ├── test_core.js            # Core unit test suite
    ├── test_e2e.js             # End-to-end integration test suite
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/pocket_mentor
JWT_SECRET=super_secret_pocket_mentor_jwt_key_987654321
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GROK_API_KEY=your_xai_grok_api_key
GROK_MODEL=grok-2-latest
WEAK_AREA_THRESHOLD=60
```
> Note: If `GROK_API_KEY` or `CLOUDINARY_*` are not set during local testing, Pocket Mentor includes graceful fallbacks so you can test all features seamlessly without blocking!

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### 1. Start the Backend Server
```bash
cd server
npm install
node server.js
```
The server will run on `http://localhost:5000`.

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173`.

### 3. Run Backend Automated Verification Tests
```bash
cd server
# Run unit tests (JWT, quiz structure validation, weak area calculation)
node test_core.js

# Run full end-to-end integration test (Auth -> Upload -> AI Summary -> Flashcards -> Quiz -> Scoring -> Weak Areas -> Gen 2)
node test_e2e.js
```
