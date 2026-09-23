import React, { Suspense, lazy } from "react";
import { useMentorStore } from "../../store/mentorStore";
import FallbackMentor from "./FallbackMentor";
import MentorErrorBoundary from "./MentorErrorBoundary";

// Lazy-load MentorCanvas so Three.js chunks are strictly loaded on demand
const MentorCanvas = lazy(() => import("./MentorCanvas"));

// ─── WebGL availability check (evaluated once at module load) ─────────────────
// IMPORTANT: We check once and cache. Creating new canvas contexts every render
// can exhaust WebGL context limits and cause false-negatives, triggering the
// 2D fallback unintentionally during state changes (e.g., EXPLAINING).
let _webGLAvailable = null;
function isWebGLAvailable() {
  if (_webGLAvailable !== null) return _webGLAvailable;
  if (typeof window === "undefined") return (_webGLAvailable = false);
  try {
    const canvas = document.createElement("canvas");
    _webGLAvailable = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
    // Don't hold onto the test canvas
    canvas.remove?.();
  } catch {
    _webGLAvailable = false;
  }
  return _webGLAvailable;
}

export const LivingMentor = ({ mode = "hero", stateOverride = null, messageOverride = null }) => {
  const { isLivingMentorEnabled, currentState: storeState, statusMessage: storeMessage } = useMentorStore();

  const currentState = stateOverride || storeState;
  const statusMessage = messageOverride || storeMessage;

  // Feature Flag: If disabled, render lightweight 2D fallback or null
  if (!isLivingMentorEnabled) {
    return (
      <FallbackMentor
        currentState={currentState}
        statusMessage={statusMessage}
        size={mode === "hero" ? "hero" : "md"}
      />
    );
  }

  if (!isWebGLAvailable()) {
    return (
      <FallbackMentor
        currentState={currentState}
        statusMessage={statusMessage}
        size={mode === "hero" ? "hero" : "md"}
      />
    );
  }

  return (
    <MentorErrorBoundary
      currentState={currentState}
      statusMessage={statusMessage}
      size={mode === "hero" ? "hero" : "md"}
    >
      <Suspense
        fallback={
          <FallbackMentor
            currentState={currentState}
            statusMessage="Synchronizing Neural Model..."
            size={mode === "hero" ? "hero" : "md"}
          />
        }
      >
        <MentorCanvas
          currentState={currentState}
          statusMessage={statusMessage}
          mode={mode}
        />
      </Suspense>
    </MentorErrorBoundary>
  );
};

export default LivingMentor;
