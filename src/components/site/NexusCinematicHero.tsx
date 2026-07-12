import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { ModeToggle } from "./ModeToggle";
import guardianAsset from "@/assets/gothic-vampire.glb.asset.json";

/* ================================================================
   HERO — black space, twinkling stars, GLB guardian cinematic intro.
   ================================================================ */

type Phase = "stars" | "falling" | "landing" | "walking" | "greeting" | "leaving" | "done";

/* -------------------- 2D star canvas -------------------- */
type Star = { x: number; y: number; r: number; base: number; amp: number; speed: number; phase: number };

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number | null>(null);
  const density = useMemo(() => 0.00022, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const seed = () => {
      const count = Math.floor(width * height * density);
      const arr: Star[] = new Array(count);
      for (let i = 0; i < count; i++) {
        const r = Math.random();
        const size = r < 0.85 ? Math.random() * 0.6 + 0.2 : Math.random() * 1.1 + 0.6;
        arr[i] = {
          x: Math.random() * width,
          y: Math.random() * height,
          r: size,
          base: Math.random() * 0.5 + 0.25,
          amp: Math.random() * 0.45 + 0.15,
          speed: Math.random() * 1.2 + 0.4,
          phase: Math.random() * Math.PI * 2,
        };
      }
      starsRef.current = arr;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = s.base + Math.sin(t * s.speed + s.phase) * s.amp;
        const alpha = Math.max(0.05, Math.min(1, twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

/* -------------------- Guardian GLB -------------------- */
useGLTF.preload(guardianAsset.url);

type GuardianProps = {
  phase: Phase;
  onLanded: () => void;
  onReachedCenter: () => void;
  onGreetingDone: () => void;
  onGone: () => void;
};

function Guardian({ phase, onLanded, onReachedCenter, onGreetingDone, onGone }: GuardianProps) {
  const { scene } = useGLTF(guardianAsset.url) as any;
  const group = useRef<THREE.Group>(null!);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Normalize model: fit to a target height and put feet on y=0
  const { normalizedScale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const targetHeight = 2.6;
    const s = targetHeight / (size.y || 1);
    return { normalizedScale: s, yOffset: -box.min.y * s };
  }, [cloned]);

  useEffect(() => {
    cloned.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }, [cloned]);

  const startPos = new THREE.Vector3(-3.2, 6.5, 0);
  const landPos = new THREE.Vector3(-3.2, 0, 0);
  const centerPos = new THREE.Vector3(0, 0, 0);

  const stateRef = useRef({
    t: 0,
    landedFired: false,
    centerFired: false,
    greetFired: false,
    goneFired: false,
    opacity: 1,
  });

  useFrame((_, dt) => {
    if (!group.current) return;
    const st = stateRef.current;
    st.t += dt;
    const g = group.current;

    if (phase === "falling") {
      // ease-in gravity fall
      const p = Math.min(1, st.t / 0.9);
      const eased = p * p;
      g.position.lerpVectors(startPos, landPos, eased);
      g.rotation.y = 0;
      if (p >= 1 && !st.landedFired) { st.landedFired = true; onLanded(); st.t = 0; }
    } else if (phase === "landing") {
      // small squash / recovery
      const p = Math.min(1, st.t / 0.5);
      const squash = 1 - Math.sin(p * Math.PI) * 0.06;
      g.scale.set(normalizedScale * (2 - squash) * 0.5 + normalizedScale * 0.5, normalizedScale * squash, normalizedScale * (2 - squash) * 0.5 + normalizedScale * 0.5);
      g.position.copy(landPos);
    } else if (phase === "walking") {
      const p = Math.min(1, st.t / 1.6);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      g.position.lerpVectors(landPos, centerPos, eased);
      // bob
      g.position.y = Math.abs(Math.sin(st.t * 8)) * 0.06;
      g.rotation.y = 0;
      if (p >= 1 && !st.centerFired) {
        st.centerFired = true;
        onReachedCenter();
        st.t = 0;
      }
    } else if (phase === "greeting") {
      g.position.copy(centerPos);
      // face user, subtle breath
      const breath = 1 + Math.sin(st.t * 2) * 0.01;
      g.scale.set(normalizedScale * breath, normalizedScale * breath, normalizedScale * breath);
      // tiny tilt (as if raising hand — model is static, so we tilt slightly toward the bubble)
      g.rotation.y = Math.sin(st.t * 1.5) * 0.05;
      if (st.t > 2.6 && !st.greetFired) { st.greetFired = true; onGreetingDone(); st.t = 0; }
    } else if (phase === "leaving") {
      const p = Math.min(1, st.t / 1.0);
      st.opacity = 1 - p;
      g.position.y = p * 0.6;
      cloned.traverse((o: any) => {
        if (o.isMesh && o.material) {
          o.material.transparent = true;
          o.material.opacity = st.opacity;
        }
      });
      if (p >= 1 && !st.goneFired) { st.goneFired = true; onGone(); }
    }
  });

  if (phase === "stars" || phase === "done") return null;

  return (
    <group
      ref={group}
      position={startPos.toArray()}
      scale={normalizedScale}
      rotation={[0, 0, 0]}
    >
      <primitive object={cloned} />
    </group>
  );
}

/* -------------------- Dust particles on landing -------------------- */
function DustBurst({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const t = useRef(0);
  const positions = useMemo(() => {
    const n = 80;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.4;
      arr[i * 3] = Math.cos(a) * r - 3.2;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);
  const velocities = useMemo(() => {
    const n = 80;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 1.2 + 0.4;
      arr[i * 3] = Math.cos(a) * s;
      arr[i * 3 + 1] = Math.random() * 0.8 + 0.3;
      arr[i * 3 + 2] = Math.sin(a) * s;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!active || !ref.current) return;
    t.current += dt;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      pos.array[i * 3] += velocities[i * 3] * dt * 0.5;
      pos.array[i * 3 + 1] += velocities[i * 3 + 1] * dt * 0.5 - 0.4 * dt;
      pos.array[i * 3 + 2] += velocities[i * 3 + 2] * dt * 0.5;
    }
    pos.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, 0.7 - t.current * 0.8);
  });

  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#cbd5e1" size={0.06} transparent opacity={0.7} depthWrite={false} />
    </points>
  );
}

/* -------------------- Camera shake -------------------- */
function CameraShake({ active }: { active: boolean }) {
  const { camera } = useThree();
  const t = useRef(0);
  const base = useRef(new THREE.Vector3());
  useEffect(() => { base.current.copy(camera.position); t.current = 0; }, [active, camera]);
  useFrame((_, dt) => {
    if (!active) return;
    t.current += dt;
    const decay = Math.max(0, 1 - t.current / 0.4);
    camera.position.x = base.current.x + (Math.random() - 0.5) * 0.05 * decay;
    camera.position.y = base.current.y + (Math.random() - 0.5) * 0.05 * decay;
  });
  return null;
}

/* -------------------- Hero -------------------- */
export function NexusCinematicHero() {
  const [phase, setPhase] = useState<Phase>("stars");
  const [bubble, setBubble] = useState(false);
  const [shake, setShake] = useState(false);
  const [dust, setDust] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("falling"), 300);
    return () => clearTimeout(t1);
  }, []);

  // Show bubble while greeting
  useEffect(() => {
    if (phase === "greeting") {
      const t = setTimeout(() => setBubble(true), 350);
      return () => clearTimeout(t);
    }
    if (phase === "leaving" || phase === "done") setBubble(false);
  }, [phase]);

  return (
    <section className="relative w-full overflow-hidden bg-black pt-24 sm:pt-28 pb-10 sm:pb-14 min-h-[100svh]">
      <StarField />

      {/* 3D layer */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 1.3, 6], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[3, 6, 4]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[-4, 2, 3]} intensity={0.4} color="#7dd3fc" />
          <pointLight position={[4, 2, -3]} intensity={0.3} color="#a78bfa" />

          <Suspense fallback={null}>
            <Environment preset="city" />
            <Guardian
              phase={phase}
              onLanded={() => {
                setDust(true);
                setShake(true);
                setPhase("landing");
                setTimeout(() => setShake(false), 400);
                setTimeout(() => setDust(false), 900);
                setTimeout(() => setPhase("walking"), 500);
              }}
              onReachedCenter={() => setPhase("greeting")}
              onGreetingDone={() => setPhase("leaving")}
              onGone={() => setPhase("done")}
            />
            <DustBurst active={dust} />
          </Suspense>

          <CameraShake active={shake} />

          {/* invisible ground for shadow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[30, 30]} />
            <shadowMaterial opacity={0.35} />
          </mesh>
        </Canvas>
      </div>

      {/* Speech bubble */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative w-full max-w-5xl h-full">
          <AnimatePresence>
            {bubble && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="absolute"
                style={{ top: "38%", left: "58%" }}
              >
                <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl px-5 py-3 text-sm sm:text-base text-white shadow-[0_0_40px_-8px_rgba(56,189,248,0.55)]">
                  <span className="absolute -inset-px rounded-2xl ring-1 ring-sky-400/30 pointer-events-none" />
                  Welcome to the Nexefy world of internet business.
                  {/* tail */}
                  <span className="absolute -left-2 top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 rounded-sm bg-white/10 border-l border-b border-white/15 backdrop-blur-xl" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content column & switch buttons */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-6 min-h-[calc(100svh-9rem)]">
        <div className="flex-1" />
        <div className="mt-auto flex justify-center pb-2 sm:pb-4">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
