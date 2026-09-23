import React, { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMentorStore, MENTOR_STATES } from "../../store/mentorStore";
import CyberMentorModel from "./CyberMentorModel";
import FallbackMentor from "./FallbackMentor";
import MentorCanvasWrapper from "./MentorCanvasWrapper";

/**
 * CameraController
 * Smoothly interpolates the camera position and focus target:
 * - Speaking / Explaining / Encouraging: Cinematic close-up on face and upper-body gestures (bust shot)
 * - Thinking: Focused semi close-up with slight tilt
 * - Idle / Waiting: Full-body framing showing standing posture on glowing platform
 */
function CameraController({ mode = "hero" }) {
  const { camera } = useThree();
  const currentState = useMentorStore((s) => s.currentState);
  const isSpeaking = useMentorStore((s) => s.isSpeaking);

  const currentLookAt = useRef(new THREE.Vector3(0, 0.4, 0));

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    const speed = 0.05 * 60 * clampedDelta; // ~60fps responsive lerp

    let targetPos = [0, 0.45, 2.5];
    let targetLook = [0, 0.35, 0];

    // Cinematic Smart Zoom
    if (isSpeaking || currentState === MENTOR_STATES.EXPLAINING || currentState === MENTOR_STATES.ENCOURAGING) {
      // Zoom in on upper torso and face to show expressions, head nods, and hand gestures
      targetPos = [0, 0.35, 1.42];
      targetLook = [0, 0.42, 0];
    } else if (currentState === MENTOR_STATES.THINKING || currentState === MENTOR_STATES.ANALYZING) {
      // Medium focus during contemplation
      targetPos = [0.08, 0.4, 1.75];
      targetLook = [0, 0.4, 0];
    } else if (currentState === MENTOR_STATES.CELEBRATING || currentState === MENTOR_STATES.SUCCESS) {
      // Medium wide to capture celebratory gestures
      targetPos = [0, 0.4, 1.85];
      targetLook = [0, 0.38, 0];
    } else {
      // IDLE / WAITING: Full body standing framing
      targetPos = mode === "space" ? [0, 0.45, 2.35] : [0, 0.45, 2.55];
      targetLook = [0, 0.32, 0];
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetPos[0], speed);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetPos[1], speed);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetPos[2], speed);

    currentLookAt.current.x = THREE.MathUtils.lerp(currentLookAt.current.x, targetLook[0], speed);
    currentLookAt.current.y = THREE.MathUtils.lerp(currentLookAt.current.y, targetLook[1], speed);
    currentLookAt.current.z = THREE.MathUtils.lerp(currentLookAt.current.z, targetLook[2], speed);

    camera.lookAt(currentLookAt.current);
  });

  return null;
}

export function MentorCanvas({ currentState = "IDLE", statusMessage = "", mode = "hero" }) {
  const [webGlAvailable, setWebGlAvailable] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // prefers-reduced-motion accessibility
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const h = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  // WebGL context loss/restore (handles GPU crashes on mobile)
  const handleCreated = ({ gl }) => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setWebGlAvailable(false); }, false);
    canvas.addEventListener("webglcontextrestored", () => setWebGlAvailable(true), false);
  };

  if (!webGlAvailable) {
    return (
      <FallbackMentor
        currentState={currentState}
        statusMessage={statusMessage}
        size={mode === "hero" ? "hero" : "lg"}
      />
    );
  }

  return (
    <MentorCanvasWrapper>
      <Canvas
        camera={{ position: [0, 0.45, 2.5], fov: 55 }}
        onCreated={handleCreated}
        gl={{
          antialias: true,
          alpha: true,              // transparent so CSS backdrop shows through
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <CameraController mode={mode} />

        {/* ── Cinematic Lighting Rig ─────────────────────────────────────── */}
        {/* Soft ambient fill */}
        <ambientLight intensity={0.4} />

        {/* Key: neutral white top-front — defines form */}
        <directionalLight position={[0.5, 4, 3]} intensity={1.4} />

        {/* Cyan left rim — matches dot-grid backdrop */}
        <pointLight position={[-2.5, 1.5, 0.5]} intensity={1.6} color="#06b6d4" />

        {/* Violet right backlight — separation from background */}
        <pointLight position={[2.5, 1.5, -1.0]} intensity={1.2} color="#7c3aed" />

        {/* Ground bounce — cyan upwelling from platform */}
        <pointLight position={[0, -0.8, 0.6]} intensity={0.9} color="#00e5ff" />

        {/* Top hero spot — dramatic face highlight */}
        <pointLight position={[0, 3.5, 1.5]} intensity={1.1} color="#ffffff" />

        <Suspense fallback={null}>
          <CyberMentorModel prefersReducedMotion={prefersReducedMotion} />
        </Suspense>
      </Canvas>

      {/* Neural state telemetry badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[10px] font-mono tracking-wider text-slate-300 pointer-events-none flex items-center gap-1.5 shadow-lg z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="uppercase">Neural Core • {currentState}</span>
      </div>
    </MentorCanvasWrapper>
  );
}

export default MentorCanvas;
