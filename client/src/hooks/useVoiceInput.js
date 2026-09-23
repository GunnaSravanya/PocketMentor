/**
 * useVoiceInput
 * Speech-to-Text hook using Web SpeechRecognition API (webkitSpeechRecognition).
 * Transcribes English speech in real time into the prompt input field.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { useMentorStore, MENTOR_STATES } from "../store/mentorStore";

export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);
  const { setMentorState, currentState } = useMentorStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (useMentorStore.getState().currentState === MENTOR_STATES.LISTENING) {
      useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE, "Active and ready.");
    }
  }, []);

  const startListening = useCallback(
    ({ onTranscriptChange, onFinalTranscript } = {}) => {
      if (typeof window === "undefined") return;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice recognition is not supported in this browser. Please use Google Chrome or Edge.");
        return;
      }

      // Stop any existing recognition instance
      stopListening();

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setMentorState(MENTOR_STATES.LISTENING, "Listening to your voice...");
        };

        recognition.onresult = (event) => {
          let currentInterim = "";
          let finalResult = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              finalResult += item[0].transcript + " ";
            } else {
              currentInterim += item[0].transcript;
            }
          }

          const combined = (finalResult + currentInterim).trim();
          setTranscript(combined);
          onTranscriptChange?.(combined);

          if (finalResult.trim() && !currentInterim.trim()) {
            onFinalTranscript?.(finalResult.trim());
          }
        };

        recognition.onerror = (event) => {
          console.warn("[useVoiceInput] SpeechRecognition error:", event.error);
          if (event.error === "not-allowed") {
            alert("Microphone access was denied. Please allow microphone permissions in your browser.");
          }
          stopListening();
        };

        recognition.onend = () => {
          setIsListening(false);
          if (useMentorStore.getState().currentState === MENTOR_STATES.LISTENING) {
            useMentorStore.getState().setMentorState(MENTOR_STATES.IDLE, "Active and ready.");
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("[useVoiceInput] Failed to start:", err);
        setIsListening(false);
      }
    },
    [setMentorState, stopListening]
  );

  const toggleListening = useCallback(
    (callbacks) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(callbacks);
      }
    },
    [isListening, startListening, stopListening]
  );

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}

export default useVoiceInput;
