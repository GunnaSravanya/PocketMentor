/**
 * CyberMentorModel.jsx — Professional Conversational AI Mentor
 *
 * Professional AI Avatar Architecture:
 *  • Zero dance animations — 100% focused on professional conversational tutoring.
 *  • Realistic Procedural Kinematics:
 *      IDLE:
 *        - Natural relaxed standing posture with arms naturally down at sides/waist.
 *        - Gentle organic chest breathing and subtle weight shifts.
 *        - Periodic "Check Watch" event (raises wrist, tilts head to glance at watch).
 *        - Periodic "Look Around" event (glances left/right waiting for student).
 *        - Head tracks user cursor smoothly.
 *      EXPLAINING / SPEAKING:
 *        - Smart conversational hand gestures (open-palm presentation, idea pointing).
 *        - Speech cadence rhythm in head & spine.
 *      THINKING:
 *        - Hand-to-chin contemplative pose, eyes/head tilted thoughtfully.
 *      CELEBRATING / ENCOURAGING:
 *        - Affirmative double nod, open-arms welcoming gesture.
 *      WARNING / FOCUSED:
 *        - Polite head shake ("No") and open-palm halt gesture.
 */
import React, { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMentorStore, MENTOR_STATES } from "../../store/mentorStore";

useGLTF.preload("/models/mentor_character.glb");

export function CyberMentorModel({ prefersReducedMotion = false }) {
  const group = useRef();
  const currentState = useMentorStore((s) => s.currentState);
  const isSpeaking = useMentorStore((s) => s.isSpeaking);

  // Load GLB — use scene directly (no cloning for skinned meshes)
  const { scene } = useGLTF("/models/mentor_character.glb");

  // Enhance materials for clean cyber/sci-fi mentor look
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
          if (mat.isMeshStandardMaterial || mat.isMeshPhysicalMaterial) {
            mat.roughness = Math.min(mat.roughness ?? 1, 0.4);
            mat.metalness = Math.max(mat.metalness ?? 0, 0.5);
            mat.needsUpdate = true;
          }
        });
      }
    });
  }, [scene]);

  // ── Bone Cache (mixamorig: humanoid skeleton) ──────────────────────────────
  const bones = useMemo(() => {
    const b = {};
    scene.traverse((child) => {
      if (!child.isBone) return;
      const n = child.name;
      if (/(Head|mixamorig.*Head)$/i.test(n) && !/HeadTop/i.test(n))     b.head          = child;
      else if (/(Neck|mixamorig.*Neck)$/i.test(n))                      b.neck          = child;
      else if (/(Spine1|mixamorig.*Spine1)$/i.test(n))                  b.spine1        = child;
      else if (/(Spine2|mixamorig.*Spine2)$/i.test(n))                  b.spine2        = child;
      else if (/(Spine|mixamorig.*Spine)$/i.test(n) && !b.spine1)       b.spine         = child;
      else if (/(Hips|mixamorig.*Hips)$/i.test(n))                      b.hips          = child;
      else if (/(RightArm|mixamorig.*RightArm)$/i.test(n))              b.rightArm      = child;
      else if (/(RightForeArm|mixamorig.*RightForeArm)$/i.test(n))      b.rightForeArm  = child;
      else if (/(RightHand|mixamorig.*RightHand)$/i.test(n))            b.rightHand     = child;
      else if (/(LeftArm|mixamorig.*LeftArm)$/i.test(n))                b.leftArm       = child;
      else if (/(LeftForeArm|mixamorig.*LeftForeArm)$/i.test(n))        b.leftForeArm   = child;
      else if (/(LeftHand|mixamorig.*LeftHand)$/i.test(n))              b.leftHand      = child;
      else if (/(RightShoulder|mixamorig.*RightShoulder)$/i.test(n))    b.rightShoulder = child;
      else if (/(LeftShoulder|mixamorig.*LeftShoulder)$/i.test(n))      b.leftShoulder  = child;
    });
    console.info("[Mentor] Bones resolved:", Object.keys(b));
    return b;
  }, [scene]);

  // ── Knowledge Particles ───────────────────────────────────────────────────
  const PARTICLE_COUNT = 48;
  const particleGeometry = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      const r = 0.8 + Math.random() * 0.6;
      positions[i * 3]     = Math.cos(angle) * r;
      positions[i * 3 + 1] = 0.8 + (Math.random() - 0.5) * 1.6;
      positions[i * 3 + 2] = Math.sin(angle) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  const particleColor = useMemo(() => {
    switch (currentState) {
      case MENTOR_STATES.EXPLAINING:   return "#8b5cf6";
      case MENTOR_STATES.SUCCESS:
      case MENTOR_STATES.CELEBRATING:  return "#10b981";
      case MENTOR_STATES.WARNING:      return "#ef4444";
      case MENTOR_STATES.REVISING:
      case MENTOR_STATES.FOCUSED:      return "#f59e0b";
      case MENTOR_STATES.THINKING:     return "#38bdf8";
      default:                          return "#06b6d4";
    }
  }, [currentState]);

  const particlesRef = useRef();

  // ── Frame Loop (Full Procedural Animation) ─────────────────────────────────
  useFrame((state, delta) => {
    if (prefersReducedMotion || document.hidden) return;
    const { pointer, clock } = state;
    const t = clock.elapsedTime;
    const clampedDelta = Math.min(delta, 0.05);
    const speed = Math.min(0.08 * 60 * clampedDelta, 1);
    const slowSpeed = Math.min(0.04 * 60 * clampedDelta, 1);

    const isCurrentlySpeaking = isSpeaking || currentState === MENTOR_STATES.EXPLAINING;

    // ── 1. Idle Timeline Events (Watch Check & Look Around) ─────────────────
    // 16-second loop:
    //   0s - 4.5s:   Check Watch / Wrist
    //   5.5s - 9.5s: Look Around for Student
    //   9.5s - 16s:  Attentive Natural Standing
    const idleCycle = t % 16;
    const isCheckingWatch = !isCurrentlySpeaking && currentState === MENTOR_STATES.IDLE && idleCycle < 4.2;
    const isLookingAround = !isCurrentlySpeaking && currentState === MENTOR_STATES.IDLE && idleCycle >= 5.5 && idleCycle < 9.5;

    // ── 2. Head Kinematics ─────────────────────────────────────────────────
    if (bones.head) {
      let targetHeadX = 0;
      let targetHeadY = 0;
      let targetHeadZ = 0;

      if (isCheckingWatch) {
        // Look down at left wrist/watch
        const watchProgress = Math.sin((idleCycle / 4.2) * Math.PI);
        targetHeadX = 0.38 * watchProgress;
        targetHeadY = -0.32 * watchProgress; // look toward left wrist
        targetHeadZ = 0.12 * watchProgress;
      } else if (isLookingAround) {
        // Look left then right looking for user
        const lookProgress = (idleCycle - 5.5) / 4.0;
        targetHeadY = Math.sin(lookProgress * Math.PI * 2) * 0.45;
        targetHeadX = 0.04;
        targetHeadZ = 0;
      } else if (isCurrentlySpeaking) {
        // Active conversational head movement with speech cadence
        targetHeadX = -pointer.y * 0.2 + Math.sin(t * 3.8) * 0.08 + Math.sin(t * 1.5) * 0.04;
        targetHeadY = pointer.x * 0.45 + Math.sin(t * 2.2) * 0.06;
        targetHeadZ = Math.sin(t * 1.8) * 0.03;
      } else if (currentState === MENTOR_STATES.THINKING || currentState === MENTOR_STATES.ANALYZING) {
        // Contemplative tilt (thinking)
        targetHeadX = -0.12 + Math.sin(t * 0.8) * 0.03;
        targetHeadY = 0.22 + Math.sin(t * 0.5) * 0.04;
        targetHeadZ = 0.12;
      } else if (currentState === MENTOR_STATES.CELEBRATING || currentState === MENTOR_STATES.SUCCESS) {
        // Affirmative double nod of encouragement
        targetHeadX = Math.sin(t * 4.5) * 0.16;
        targetHeadY = pointer.x * 0.3;
        targetHeadZ = 0;
      } else if (currentState === MENTOR_STATES.WARNING) {
        // Head shake "No"
        targetHeadX = 0.05;
        targetHeadY = Math.sin(t * 5.5) * 0.28;
        targetHeadZ = 0;
      } else {
        // Standard attentive idle tracking mouse
        targetHeadX = -pointer.y * 0.25 + Math.sin(t * 0.8) * 0.02;
        targetHeadY = pointer.x * 0.4 + Math.sin(t * 0.5) * 0.015;
        targetHeadZ = Math.sin(t * 0.4) * 0.01;
      }

      bones.head.rotation.x = THREE.MathUtils.lerp(bones.head.rotation.x, targetHeadX, speed);
      bones.head.rotation.y = THREE.MathUtils.lerp(bones.head.rotation.y, targetHeadY, speed);
      bones.head.rotation.z = THREE.MathUtils.lerp(bones.head.rotation.z, targetHeadZ, speed);
    }

    // ── 3. Spine & Breathing ───────────────────────────────────────────────
    const spine = bones.spine1 || bones.spine;
    if (spine) {
      let targetSpineX = 0;
      let targetSpineZ = 0;

      if (isCurrentlySpeaking) {
        // Speaking body language
        targetSpineX = 0.04 + Math.sin(t * 3.2) * 0.02;
        targetSpineZ = Math.sin(t * 2.1) * 0.025;
      } else if (currentState === MENTOR_STATES.THINKING) {
        // Slight lean forward
        targetSpineX = 0.06;
        targetSpineZ = 0.01;
      } else {
        // Natural chest breathing expansion
        targetSpineX = Math.sin(t * 1.2) * 0.018;
        targetSpineZ = Math.sin(t * 0.8) * 0.008;
      }

      spine.rotation.x = THREE.MathUtils.lerp(spine.rotation.x, targetSpineX, speed);
      spine.rotation.z = THREE.MathUtils.lerp(spine.rotation.z, targetSpineZ, speed);
    }

    // ── 4. Left Arm & Hand Kinematics (Natural clearance — no body clipping) ─
    if (bones.leftArm) {
      let armX = 0.16;
      let armY = -0.08;
      let armZ = -0.92; // Natural clearance away from hip
      let foreArmX = 0.18;
      let foreArmY = 0;
      let foreArmZ = -0.28; // slight elbow bend forward
      let handX = 0.12;
      let handZ = 0;

      if (isCheckingWatch) {
        // Raise left forearm in front of chest to check watch
        const watchProgress = Math.sin((idleCycle / 4.2) * Math.PI);
        armX = 0.62 * watchProgress;
        armY = -0.32 * watchProgress;
        armZ = -0.48 * watchProgress;
        foreArmX = 0.22 * watchProgress;
        foreArmZ = -1.25 * watchProgress; // bend elbow horizontally across chest
        handZ = 0.45 * watchProgress;     // angle wrist to face eyes
      } else if (isCurrentlySpeaking) {
        // Conversational balance gesturing
        armX = 0.32 + Math.sin(t * 1.8) * 0.08;
        armZ = -0.75 + Math.sin(t * 1.2) * 0.1;
        foreArmZ = -0.52 + Math.sin(t * 1.8) * 0.15;
      } else if (currentState === MENTOR_STATES.CELEBRATING || currentState === MENTOR_STATES.SUCCESS) {
        // Open welcoming gesture
        armX = 0.25;
        armZ = -0.55;
        foreArmZ = -0.5;
      } else {
        // Natural resting idle with subtle breathing drift
        armZ = -0.92 + Math.sin(t * 0.8) * 0.02;
        armX = 0.16 + Math.sin(t * 0.6) * 0.015;
        foreArmZ = -0.28;
      }

      bones.leftArm.rotation.x = THREE.MathUtils.lerp(bones.leftArm.rotation.x, armX, speed);
      bones.leftArm.rotation.y = THREE.MathUtils.lerp(bones.leftArm.rotation.y, armY, speed);
      bones.leftArm.rotation.z = THREE.MathUtils.lerp(bones.leftArm.rotation.z, armZ, speed);

      if (bones.leftForeArm) {
        bones.leftForeArm.rotation.x = THREE.MathUtils.lerp(bones.leftForeArm.rotation.x, foreArmX, speed);
        bones.leftForeArm.rotation.y = THREE.MathUtils.lerp(bones.leftForeArm.rotation.y, foreArmY, speed);
        bones.leftForeArm.rotation.z = THREE.MathUtils.lerp(bones.leftForeArm.rotation.z, foreArmZ, speed);
      }
      if (bones.leftHand) {
        bones.leftHand.rotation.x = THREE.MathUtils.lerp(bones.leftHand.rotation.x, handX, speed);
        bones.leftHand.rotation.z = THREE.MathUtils.lerp(bones.leftHand.rotation.z, handZ, speed);
      }
    }

    // ── 5. Right Arm & Hand Kinematics (Natural clearance — no body clipping) ─
    if (bones.rightArm) {
      let armX = 0.16;
      let armY = 0.08;
      let armZ = 0.92; // Natural clearance away from hip
      let foreArmX = 0.18;
      let foreArmY = 0;
      let foreArmZ = 0.28; // slight elbow bend forward
      let handX = 0.12;
      let handZ = 0;

      if (isCurrentlySpeaking) {
        // Smart conversational teaching gestures:
        // Alternates between presenting open-palm ideas & pointing/emphasizing
        const gestureCycle = (t * 0.8) % 6;
        if (gestureCycle < 3.2) {
          // Open palm presentation gesture
          armX = 0.45 + Math.sin(t * 2.2) * 0.1;
          armZ = 0.55 + Math.sin(t * 1.5) * 0.08;
          foreArmZ = 0.65 + Math.sin(t * 2.2) * 0.12;
          handX = 0.25;
        } else {
          // Explaining / pointing forward emphasis
          armX = 0.55 + Math.sin(t * 3.0) * 0.12;
          armZ = 0.38 + Math.sin(t * 2.0) * 0.05;
          foreArmZ = 0.75 + Math.sin(t * 3.0) * 0.1;
          handX = 0.35;
        }
      } else if (currentState === MENTOR_STATES.THINKING || currentState === MENTOR_STATES.ANALYZING) {
        // Hand to chin / jaw thinking pose
        armX = 0.65;
        armY = 0.25;
        armZ = 0.42;
        foreArmX = 0.3;
        foreArmZ = 1.25; // bring hand up to chin
        handX = 0.3;
        handZ = -0.2;
      } else if (currentState === MENTOR_STATES.WARNING) {
        // Open palm "stop / hold on" gesture
        armX = 0.55;
        armZ = 0.48;
        foreArmZ = 0.58;
        handX = -0.5; // palm facing front
      } else if (currentState === MENTOR_STATES.CELEBRATING || currentState === MENTOR_STATES.SUCCESS) {
        // Thumbs up / celebratory open arm
        armX = 0.35;
        armZ = 0.55;
        foreArmZ = 0.58;
        handX = 0.2;
      } else {
        // Natural resting idle with subtle sway
        armZ = 0.92 - Math.sin(t * 0.8) * 0.02;
        armX = 0.16 + Math.sin(t * 0.6) * 0.015;
        foreArmZ = 0.28;
      }

      bones.rightArm.rotation.x = THREE.MathUtils.lerp(bones.rightArm.rotation.x, armX, speed);
      bones.rightArm.rotation.y = THREE.MathUtils.lerp(bones.rightArm.rotation.y, armY, speed);
      bones.rightArm.rotation.z = THREE.MathUtils.lerp(bones.rightArm.rotation.z, armZ, speed);

      if (bones.rightForeArm) {
        bones.rightForeArm.rotation.x = THREE.MathUtils.lerp(bones.rightForeArm.rotation.x, foreArmX, speed);
        bones.rightForeArm.rotation.y = THREE.MathUtils.lerp(bones.rightForeArm.rotation.y, foreArmY, speed);
        bones.rightForeArm.rotation.z = THREE.MathUtils.lerp(bones.rightForeArm.rotation.z, foreArmZ, speed);
      }
      if (bones.rightHand) {
        bones.rightHand.rotation.x = THREE.MathUtils.lerp(bones.rightHand.rotation.x, handX, speed);
        bones.rightHand.rotation.z = THREE.MathUtils.lerp(bones.rightHand.rotation.z, handZ, speed);
      }
    }

    // ── 6. Group Ground Position & Subtle Idle Breathing Float ─────────────
    if (group.current) {
      const breathTarget = -1.0 + Math.sin(t * 1.2) * 0.012;
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, breathTarget, slowSpeed);
    }

    // ── 7. Orbiting Knowledge Particles ────────────────────────────────────
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.12;
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      particleGeometry.dispose();
    };
  }, [particleGeometry]);

  return (
    // Y=-1.0 places the character's feet directly on the glowing platform
    <group ref={group} position={[0, -1.0, 0]}>
      {/* Humanoid SkinnedMesh */}
      <primitive object={scene} />

      {/* Knowledge particles orbiting around character */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.028}
          color={particleColor}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Ground glow disc at actual feet level (Y=0.0) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 48]} />
        <meshBasicMaterial color={particleColor} transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default CyberMentorModel;
