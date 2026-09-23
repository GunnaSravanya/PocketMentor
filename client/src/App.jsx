import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UploadNotesPage } from "./pages/UploadNotesPage";
import { NoteDetailsPage } from "./pages/NoteDetailsPage";
import { SummaryPage } from "./pages/SummaryPage";
import { FlashcardsPage } from "./pages/FlashcardsPage";
import { QuizPage } from "./pages/QuizPage";
import { QuizResultPage } from "./pages/QuizResultPage";
import { ReviseTopicPage } from "./pages/ReviseTopicPage";
import { QuizHistoryPage } from "./pages/QuizHistoryPage";
import { Chat } from "./pages/Chat";
import { AdminPage } from "./pages/AdminPage";
import { AppLayout } from "./layouts/AppLayout";
import { AuthLayout } from "./layouts/AuthLayout";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected App Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="upload" element={<UploadNotesPage />} />
          <Route path="notes/:noteId" element={<NoteDetailsPage />} />
          <Route path="notes/:noteId/summary" element={<SummaryPage />} />
          <Route path="notes/:noteId/flashcards" element={<FlashcardsPage />} />
          <Route path="chat" element={<Chat />} />
          <Route path="history" element={<QuizHistoryPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        {/* Quiz Flow Routes (Also within AppLayout) */}
        <Route path="/app/quiz" element={<AppLayout />}>
          <Route path=":quizId" element={<QuizPage />} />
          <Route path="attempt/:attemptId" element={<QuizResultPage />} />
          <Route path="attempt/:attemptId/revise/:topic" element={<ReviseTopicPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
