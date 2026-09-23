/**
 * Minimalist Mentor Events Adapter
 * Translates application actions into Living Mentor state transitions and context updates
 * Zero-overhead: purely updates Zustand state without heavy global event bus machinery
 */

import { useMentorStore, MENTOR_STATES } from "../store/mentorStore";

export const mentorEvents = {
  // Document Scanning & Notes
  noteUploaded: (title = "Document") => {
    useMentorStore.getState().updateContext({ activeSubject: title });
    useMentorStore.getState().setMentorState(MENTOR_STATES.SCANNING, `Scanning and reading "${title}"...`);
  },

  noteAnalyzing: () => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.ANALYZING, "Extracting high-yield concepts & definitions...");
  },

  kitReady: (conceptNodes = []) => {
    useMentorStore.getState().updateContext({ conceptNodes });
    useMentorStore.getState().setMentorState(MENTOR_STATES.SUCCESS, "Study Kit synthesized! Ready for active recall.");
    setTimeout(() => {
      if (useMentorStore.getState().currentState === MENTOR_STATES.SUCCESS) {
        useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE, "Active and monitoring your progress.");
      }
    }, 4000);
  },

  // 60-Second Audio Summary
  summaryVoiceStart: () => {
    useMentorStore.getState().updateContext({ speechActive: true });
    useMentorStore.getState().setMentorState(MENTOR_STATES.EXPLAINING, "Narrating 60-second audio summary...");
  },

  summaryVoiceStop: () => {
    useMentorStore.getState().updateContext({ speechActive: false });
    useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE, "Summary complete.");
  },

  // Flashcards Micro-Interactions
  flashcardFlip: () => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.THINKING, "Testing active recall...");
  },

  flashcardHard: (topic) => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.FOCUSED, `Marked "${topic || "concept"}" as difficult.`);
    setTimeout(() => {
      if (useMentorStore.getState().currentState === MENTOR_STATES.FOCUSED) {
        useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE);
      }
    }, 2500);
  },

  flashcardEasy: () => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.SUCCESS, "Mastered recall item!");
    setTimeout(() => {
      if (useMentorStore.getState().currentState === MENTOR_STATES.SUCCESS) {
        useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE);
      }
    }, 2000);
  },

  // Quiz Interaction & Topic-Level Mastery Reactions
  quizStarted: (quizTitle) => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.FOCUSED, `Assessing knowledge for ${quizTitle || "quiz"}...`);
  },

  quizAnswerCorrect: (topic) => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.SUCCESS, `Accurate answer on ${topic || "concept"}!`);
    setTimeout(() => {
      if (useMentorStore.getState().currentState === MENTOR_STATES.SUCCESS) {
        useMentorStore.getState().setMentorState(MENTOR_STATES.FOCUSED);
      }
    }, 1500);
  },

  quizAnswerWrong: (topic) => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.ENCOURAGING, `Keep going! Reviewing ${topic || "this topic"}.`);
    setTimeout(() => {
      if (useMentorStore.getState().currentState === MENTOR_STATES.ENCOURAGING) {
        useMentorStore.getState().setMentorState(MENTOR_STATES.FOCUSED);
      }
    }, 2000);
  },

  quizCompleted: (resultPayload) => {
    const { score, totalQuestions, percentage, weakAreas = [], topicMastery = [] } = resultPayload;

    useMentorStore.getState().updateContext({
      accuracy: percentage,
      weakTopics: weakAreas.map((w) => w.topic),
      topicMastery,
    });

    // Intelligent Topic-Level reaction rather than raw superficial percentage
    if (weakAreas.length > 0) {
      const topWeak = weakAreas[0].topic;
      useMentorStore.getState().setMentorState(
        MENTOR_STATES.REVISING,
        `Diagnosed weak spot in "${topWeak}". Smart Revision recommended!`
      );
    } else if (percentage >= 80) {
      useMentorStore.getState().setMentorState(
        MENTOR_STATES.CELEBRATING,
        `All topics mastered (${percentage}%)! Outstanding recall.`
      );
    } else {
      useMentorStore.getState().setMentorState(
        MENTOR_STATES.ENCOURAGING,
        `Solid effort (${percentage}%). Ready for reinforcement practice.`
      );
    }
  },

  // Smart Revision Loop
  revisionStarted: (topic) => {
    useMentorStore.getState().updateContext({ activeTopic: topic });
    useMentorStore.getState().setMentorState(MENTOR_STATES.REVISING, `Focusing targeted revision on "${topic}"...`);
  },

  /**
   * mentorSays — adds a chat message from the mentor side.
   * If the Mentor Space modal is open and voice is not muted, the modal
   * will detect the new message and speak it via the useLiveCaption hook.
   * @param {string} text — the message the mentor should say
   */
  mentorSays: (text) => {
    if (!text) return;
    useMentorStore.getState().addChatMessage("mentor", text);
    useMentorStore.getState().setMentorState(MENTOR_STATES.EXPLAINING, "Mentoring...");
  },

  resetToIdle: () => {
    useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE, "Active and ready.");
  },
};

export default mentorEvents;
