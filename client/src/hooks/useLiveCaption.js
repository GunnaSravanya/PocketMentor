/**
 * useLiveCaption
 * Synchronized live caption & teleprompter hook using Web SpeechSynthesis.
 * Progressively reveals spoken text and streams current sentence chunks in real time.
 */
import { useCallback, useRef } from "react";
import { useMentorStore, MENTOR_STATES } from "../store/mentorStore";

export function useLiveCaption() {
  const { setLiveCaption, setSpokenText, setIsSpeaking, setMentorState } = useMentorStore();
  const fallbackTimerRef = useRef(null);
  const utteranceRef = useRef(null);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (fallbackTimerRef.current) {
      clearInterval(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    setIsSpeaking(false);
    setLiveCaption("");
  }, [setIsSpeaking, setLiveCaption]);

  const speak = useCallback(
    (text) => {
      if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
        console.warn("[useLiveCaption] Web Speech API unavailable.");
        setSpokenText(text);
        return;
      }

      // Cancel any in-flight speech
      stopSpeaking();
      setSpokenText("");

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      // Pick best natural English voice
      const voices = window.speechSynthesis.getVoices();
      const bestVoice =
        voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Samantha"))) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (bestVoice) utterance.voice = bestVoice;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      let boundaryFired = false;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setMentorState(MENTOR_STATES.EXPLAINING, "Explaining...");

        // Progressive word/character streaming fallback
        const words = text.split(/\s+/);
        let wordIdx = 0;
        const chunkSize = 12;

        fallbackTimerRef.current = setInterval(() => {
          if (boundaryFired) {
            clearInterval(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
            return;
          }
          if (wordIdx < words.length) {
            const currentSlice = words.slice(0, wordIdx + 1).join(" ");
            setSpokenText(currentSlice);

            const start = Math.max(0, wordIdx - 3);
            const end = Math.min(words.length, wordIdx + chunkSize);
            setLiveCaption(words.slice(start, end).join(" "));
            wordIdx++;
          } else {
            setSpokenText(text);
            clearInterval(fallbackTimerRef.current);
            fallbackTimerRef.current = null;
          }
        }, 320);
      };

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          boundaryFired = true;
          const charIndex = event.charIndex || 0;

          // Progressive reveal of full response up to current word
          const nextSpace = text.indexOf(" ", charIndex);
          const currentEnd = nextSpace !== -1 ? nextSpace : text.length;
          setSpokenText(text.slice(0, currentEnd));

          // Active sentence window for live caption banner
          const preText = text.slice(0, charIndex);
          const lastSentenceEnd = Math.max(
            preText.lastIndexOf(". "),
            preText.lastIndexOf("! "),
            preText.lastIndexOf("? ")
          );
          const chunkStart = lastSentenceEnd !== -1 ? lastSentenceEnd + 2 : Math.max(0, charIndex - 40);

          const postText = text.slice(charIndex);
          const nextSentenceEnd = postText.search(/[.!?](\s|$)/);
          const chunkEnd = nextSentenceEnd !== -1 ? charIndex + nextSentenceEnd + 1 : Math.min(text.length, charIndex + 120);

          const sentenceChunk = text.slice(chunkStart, chunkEnd).trim();
          if (sentenceChunk) {
            setLiveCaption(sentenceChunk);
          }
        }
      };

      utterance.onend = () => {
        if (fallbackTimerRef.current) {
          clearInterval(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        setIsSpeaking(false);
        setSpokenText(text); // Ensure 100% full text is displayed at finish
        setLiveCaption("");
        setTimeout(() => {
          if (useMentorStore.getState().currentState === MENTOR_STATES.EXPLAINING) {
            setMentorState(MENTOR_STATES.IDLE, "Active and ready.");
          }
        }, 800);
      };

      utterance.onerror = (e) => {
        if (e.error !== "interrupted") {
          console.warn("[useLiveCaption] Speech error:", e.error);
        }
        if (fallbackTimerRef.current) {
          clearInterval(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        setIsSpeaking(false);
        setSpokenText(text);
        setLiveCaption("");
      };

      window.speechSynthesis.speak(utterance);
    },
    [setIsSpeaking, setLiveCaption, setSpokenText, setMentorState, stopSpeaking]
  );

  return { speak, stopSpeaking };
}

export default useLiveCaption;
