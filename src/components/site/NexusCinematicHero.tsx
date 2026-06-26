import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles as SparklesIcon, ShieldCheck } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import { PrototypeGuardian, type GuardianState } from "./PrototypeGuardian";

/* ================================================================
   CINEMATIC HERO — full-width, centered, vertical sequence.
   Timeline (~5.6s):
     0.00–0.30  galaxy only
     0.30–2.00  guardian falls, lands, waves
     2.00       guardian disappears cleanly
     2.00–4.00  5 feature worlds materialize (staggered)
     3.40       labels reveal
     4.00       headline (blur→focus)
     4.60       description
     5.20       buttons
     5.60+      living state (everything keeps breathing)
   ================================================================ */

const INTRO_KEY = "nexus_hero_intro_seen_v2";

type Quality = "high" | "medium" | "low";
function useQuality(): Quality {
  const [q, setQ] = useState<Quality>("high");
  useEffect(() => {
    const w = window.innerWidth;
    if (w < 640) setQ("low");
    else if (w < 1100) setQ("medium");
    else setQ("high");
  }, []);
  return q;
}

export type HeroPhase =
  | "galaxy"
  | "guardian"
  | "worlds"
  | "labels"
  | "headline"
  | "description"
  | "buttons"
  | "living";

/* ----------------------------------------------------------------
   Background scene — stars + nebula + guardian + impact particles
   ---------------------------------------------------------------- */

function Nebula() {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
        fragmentShader: `
          varying vec2 vUv; uniform float uTime;
          float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
          float noise(vec2 p){
            vec2 i=floor(p), f=fract(p);
            float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
            vec2 u=f*f*(3.-2.*f);
            return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
          }
          void main(){
            vec2 uv=vUv-0.5;
            float r=length(uv);
            float n=noise(uv*2.6+uTime*0.03);
            n+=noise(uv*5.-uTime*0.02)*0.5;
            vec3 deep=vec3(0.02,0.05,0.14);
            vec3 cyan=vec3(0.08,0.42,0.68);
            vec3 indigo=vec3(0.15,0.08,0.42);
            vec3 col=mix(deep,indigo,n);
            col=mix(col,cyan,smoothstep(0.45,0.95,n));
            float a=smoothstep(0.6,0.0,r)*0.42*n;
            gl_FragColor=vec4(col,a);
          }`,
      }),
    [],
  );
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * 0.015;
    (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh ref={ref} position={[0, 0, -8]}>
      <planeGeometry args={[40, 26]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function ImpactParticles({ trigger }: { trigger: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const startedAt = useRef<number | null>(null);
  const { positions, velocities } = useMemo(() => {
    const N = 60;
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.6 + Math.random() * 0.8;
      vel[i * 3] = Math.cos(a) * s;
      vel[i * 3 + 1] = Math.random() * 0.6 + 0.15;
      vel[i * 3 + 2] = Math.sin(a) * s;
    }
    return { positions: pos, velocities: vel };
  }, []);
  useFrame(({ clock }, dt) => {
    if (!trigger || !ref.current) return;
    if (startedAt.current === null) {
      startedAt.current = clock.elapsedTime;
      const arr = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] = 0; arr[i + 1] = -1.4; arr[i + 2] = 0;
      }
    }
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3]     += velocities[i * 3]     * dt;
      arr[i * 3 + 1] += velocities[i * 3 + 1] * dt - dt * 0.4;
      arr[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const t = clock.elapsedTime - startedAt.current;
    (ref.current.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - t / 0.8);
  });
  if (!trigger) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <pointsMaterial color="#67e8f9" size={0.05} transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function BackgroundScene({
  guardianState,
  impact,
  quality,
}: {
  guardianState: GuardianState;
  impact: boolean;
  quality: Quality;
}) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 14, 32]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[6, 6, 6]} intensity={1} color="#a855f7" />
      <pointLight position={[-6, -3, 4]} intensity={0.8} color="#22d3ee" />

      <Nebula />
      <Stars
        radius={70}
        depth={50}
        count={quality === "low" ? 1500 : quality === "medium" ? 3500 : 6000}
        factor={4}
        fade
        speed={0.5}
      />
      <Sparkles
        count={quality === "low" ? 30 : 80}
        scale={[18, 10, 8]}
        size={1.4}
        speed={0.25}
        color="#67e8f9"
        opacity={0.6}
      />

      <PrototypeGuardian state={guardianState} sitAnchor={[0, -0.8, 0]} />
      <ImpactParticles trigger={impact} />

      {quality !== "low" && (
        <EffectComposer>
          <Bloom intensity={0.55} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

/* ----------------------------------------------------------------
   Mini world scenes (one per glass box)
   ---------------------------------------------------------------- */

function MarketplaceMini() {
  const grp = useRef<THREE.Group>(null!);
  const buildings = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        x: ((i % 4) - 1.5) * 0.36,
        z: (Math.floor(i / 4) - 1) * 0.36,
        h: 0.3 + Math.random() * 0.7,
        s: 0.7 + Math.random() * 1.5,
      })),
    [],
  );
  useFrame(({ clock }, dt) => {
    if (!grp.current) return;
    grp.current.rotation.y += dt * 0.18;
    grp.current.children.forEach((c, i) => {
      const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && "emissiveIntensity" in m) {
        m.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * buildings[i % buildings.length]?.s + i) * 0.4 + 0.4;
      }
    });
  });
  return (
    <group ref={grp} position={[0, -0.2, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.15, 1.25, 0.05, 48]} />
        <meshStandardMaterial color="#06122a" emissive="#1e88ff" emissiveIntensity={0.35} metalness={0.8} roughness={0.25} />
      </mesh>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 0.02, b.z]}>
          <boxGeometry args={[0.2, b.h, 0.2]} />
          <meshStandardMaterial color="#091a36" emissive="#22d3ee" emissiveIntensity={1} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      <pointLight color="#22d3ee" intensity={1.2} distance={3} position={[0, 0.5, 0]} />
    </group>
  );
}

function CommunitiesMini() {
  const grp = useRef<THREE.Group>(null!);
  const nodes = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < 22; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 22);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      out.push(
        new THREE.Vector3(
          0.75 * Math.cos(theta) * Math.sin(phi),
          0.75 * Math.sin(theta) * Math.sin(phi),
          0.75 * Math.cos(phi),
        ),
      );
    }
    return out;
  }, []);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 0.85) pts.push(nodes[i], nodes[j]);
      }
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: "#a855f7", transparent: true, opacity: 0.5 }));
  }, [nodes]);
  useFrame((_, dt) => {
    if (!grp.current) return;
    grp.current.rotation.y += dt * 0.35;
    grp.current.rotation.x += dt * 0.08;
  });
  return (
    <group ref={grp}>
      <mesh>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} transparent opacity={0.12} />
      </mesh>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#67e8f9" emissiveIntensity={2.6} />
        </mesh>
      ))}
      <primitive object={lines} />
      <pointLight color="#a855f7" intensity={1.4} distance={2.5} />
    </group>
  );
}

function SecurityMini() {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (r1.current) r1.current.rotation.x += dt * 0.7;
    if (r2.current) r2.current.rotation.y += dt * 0.55;
    if (r3.current) r3.current.rotation.z += dt * 0.45;
  });
  return (
    <group>
      <mesh ref={r1}>
        <torusGeometry args={[0.95, 0.028, 16, 100]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2.2} metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[0.75, 0.025, 16, 100]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2.2} metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[0.55, 0.022, 16, 100]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2.2} metalness={0.85} roughness={0.18} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#ffffff" emissive="#60a5fa" emissiveIntensity={3} />
      </mesh>
      <pointLight color="#60a5fa" intensity={2} distance={3} />
    </group>
  );
}

function AIMini() {
  const core = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.7;
      core.current.rotation.x += dt * 0.3;
    }
  });
  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={1.8} metalness={0.7} roughness={0.2} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive="#67e8f9" emissiveIntensity={2.2} />
      </mesh>
      <Sparkles count={40} scale={2.2} size={1.6} speed={0.7} color="#67e8f9" />
      <pointLight color="#67e8f9" intensity={1.5} distance={3} />
    </group>
  );
}

function BusinessMini() {
  const grp = useRef<THREE.Group>(null!);
  const bars = useMemo(() => [0.4, 0.65, 0.5, 0.85, 0.55, 0.72, 0.45], []);
  useFrame(({ clock }) => {
    if (!grp.current) return;
    grp.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.35;
    grp.current.children.forEach((c, i) => {
      if ((c as THREE.Mesh).isMesh && i < bars.length) {
        const h = bars[i] + Math.sin(clock.elapsedTime * 1.4 + i) * 0.1;
        c.scale.y = h / bars[i];
      }
    });
  });
  return (
    <group ref={grp} position={[0, -0.2, 0]}>
      {bars.map((h, i) => (
        <mesh key={i} position={[(i - 3) * 0.2, h / 2 - 0.05, 0]}>
          <boxGeometry args={[0.14, h, 0.14]} />
          <meshStandardMaterial color="#60a5fa" emissive="#fbbf24" emissiveIntensity={1.2} metalness={0.65} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.04, 32]} />
        <meshStandardMaterial color="#0a1228" emissive="#fbbf24" emissiveIntensity={0.4} metalness={0.85} roughness={0.2} />
      </mesh>
      <pointLight color="#fbbf24" intensity={1.2} distance={3} />
    </group>
  );
}

function MiniWorldCanvas({ kind }: { kind: World["id"] }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.6, 2.6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.4} />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        {kind === "marketplace" && <MarketplaceMini />}
        {kind === "communities" && <CommunitiesMini />}
        {kind === "security" && <SecurityMini />}
        {kind === "ai" && <AIMini />}
        {kind === "business" && <BusinessMini />}
      </Float>
      <EffectComposer>
        <Bloom intensity={0.7} luminanceThreshold={0.2} luminanceSmoothing={0.6} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

/* ----------------------------------------------------------------
   World definitions + glass card
   ---------------------------------------------------------------- */

type World = {
  id: "marketplace" | "communities" | "security" | "ai" | "business";
  label: string;
  accent: string;
};
const WORLDS: World[] = [
  { id: "marketplace", label: "Marketplace",    accent: "#22d3ee" },
  { id: "communities", label: "Communities",    accent: "#a855f7" },
  { id: "security",    label: "Nexus Security", accent: "#60a5fa" },
  { id: "ai",          label: "AI Tools",       accent: "#67e8f9" },
  { id: "business",    label: "Business",       accent: "#fbbf24" },
];

function WorldCard({
  world,
  index,
  appear,
  labelAppear,
}: {
  world: World;
  index: number;
  appear: boolean;
  labelAppear: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.85, filter: "blur(14px)" }}
      animate={
        appear
          ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          : { opacity: 0, y: 30, scale: 0.85, filter: "blur(14px)" }
      }
      transition={{
        duration: 0.9,
        delay: index * 0.18,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative w-full"
    >
      {/* glow ring */}
      <div
        className="absolute -inset-px rounded-3xl opacity-60 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(120% 80% at 50% 0%, ${world.accent}55, transparent 70%)` }}
      />
      <div
        className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden shadow-[0_20px_80px_-30px_rgba(0,0,0,0.8)]"
        style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 60px -25px ${world.accent}88` }}
      >
        {/* inner gradient sheen */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="relative aspect-square w-full">
          {appear && <MiniWorldCanvas kind={world.id} />}
        </div>
      </div>

      {/* label */}
      <motion.div
        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
        animate={
          labelAppear
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 10, filter: "blur(10px)" }
        }
        transition={{ duration: 0.7, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-center"
      >
        <span
          className="text-[13px] sm:text-sm font-medium tracking-[0.18em] uppercase text-white"
          style={{ textShadow: `0 0 18px ${world.accent}99` }}
        >
          {world.label}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------
   Public hero component
   ---------------------------------------------------------------- */

export function NexusCinematicHero() {
  const quality = useQuality();
  const { mode, setMode } = useAppMode();
  const [phase, setPhase] = useState<HeroPhase>("galaxy");
  const [impact, setImpact] = useState(false);

  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem(INTRO_KEY) === "true";
    if (seen) {
      setPhase("living");
      return;
    }
    const t: number[] = [];
    t.push(window.setTimeout(() => setPhase("guardian"), 300));
    t.push(window.setTimeout(() => setImpact(true), 1050));
    t.push(window.setTimeout(() => setImpact(false), 1450));
    t.push(window.setTimeout(() => setPhase("worlds"), 2000));
    t.push(window.setTimeout(() => setPhase("labels"), 3400));
    t.push(window.setTimeout(() => setPhase("headline"), 4000));
    t.push(window.setTimeout(() => setPhase("description"), 4600));
    t.push(window.setTimeout(() => setPhase("buttons"), 5200));
    t.push(
      window.setTimeout(() => {
        setPhase("living");
        sessionStorage.setItem(INTRO_KEY, "true");
      }, 5800),
    );
    return () => t.forEach(clearTimeout);
  }, []);

  const guardianState: GuardianState =
    phase === "galaxy" ? "hidden" :
    phase === "guardian" ? "waving" :
    "hidden";

  const worldsAppear = ["worlds", "labels", "headline", "description", "buttons", "living"].includes(phase);
  const labelsAppear = ["labels", "headline", "description", "buttons", "living"].includes(phase);
  const headlineAppear = ["headline", "description", "buttons", "living"].includes(phase);
  const descAppear = ["description", "buttons", "living"].includes(phase);
  const buttonsAppear = ["buttons", "living"].includes(phase);

  return (
    <section className="relative w-full overflow-hidden bg-black pt-24 sm:pt-28 pb-16 sm:pb-24 min-h-[100svh]">
      {/* full-bleed galaxy canvas */}
      <div className="pointer-events-none absolute inset-0">
        <Canvas
          dpr={[1, quality === "high" ? 1.6 : 1.3]}
          camera={{ position: [0, 0.4, 7], fov: 55 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <BackgroundScene guardianState={guardianState} impact={impact} quality={quality} />
        </Canvas>
        {/* vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.85)_100%)]" />
        {/* bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
      </div>

      {/* guardian greeting bubble */}
      <AnimatePresence>
        {phase === "guardian" && (
          <motion.div
            key="hi"
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute top-[36%] left-1/2 -translate-x-1/2 z-10"
          >
            <div className="rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-5 py-2 text-sm text-white shadow-[0_0_40px_-10px_rgba(103,232,249,0.6)]">
              Hi <span className="inline-block animate-[wave_1s_ease-in-out_infinite] origin-[70%_70%]">👋</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* foreground content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* 5 feature worlds */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {WORLDS.map((w, i) => (
            <WorldCard
              key={w.id}
              world={w}
              index={i}
              appear={worldsAppear}
              labelAppear={labelsAppear}
            />
          ))}
        </div>

        {/* headline */}
        <div className="mt-14 sm:mt-20 text-center max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(20px)" }}
            animate={
              headlineAppear
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 24, filter: "blur(20px)" }
            }
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-white leading-[1.02]"
          >
            <span className="block">The home of</span>
            <motion.span
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={
                headlineAppear
                  ? { opacity: 1, filter: "blur(0px)" }
                  : { opacity: 0, filter: "blur(20px)" }
              }
              transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="block bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent"
            >
              internet business.
            </motion.span>
          </motion.h1>

          {/* description */}
          <motion.p
            initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
            animate={
              descAppear
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 16, filter: "blur(10px)" }
            }
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-base sm:text-lg text-white/65 max-w-2xl mx-auto leading-relaxed"
          >
            Discover thousands of communities, courses, and digital products —
            or launch your own store in minutes. One platform, infinite possibilities.
          </motion.p>

          {/* buttons */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={
              buttonsAppear
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 18, scale: 0.96 }
            }
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-8 sm:mt-10 inline-flex flex-wrap items-center justify-center gap-3"
          >
            <button
              onClick={() => setMode("nexus")}
              className={`group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all overflow-hidden ${
                mode === "nexus"
                  ? "bg-white text-black shadow-[0_0_50px_-8px_rgba(255,255,255,0.55)]"
                  : "border border-white/15 bg-white/[0.04] text-white backdrop-blur-xl hover:bg-white/[0.08]"
              }`}
            >
              <SparklesIcon className="size-4" />
              Switch to Nexus
              <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition" style={{ boxShadow: "0 0 60px -10px rgba(34,211,238,0.6)" }} />
            </button>
            <button
              onClick={() => setMode("security")}
              className={`group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all overflow-hidden ${
                mode === "security"
                  ? "bg-gradient-to-r from-cyan-400 to-teal-500 text-black shadow-[0_0_50px_-8px_oklch(0.86_0.16_200_/0.7)]"
                  : "border border-cyan-300/20 bg-cyan-400/[0.05] text-white backdrop-blur-xl hover:bg-cyan-400/[0.1]"
              }`}
            >
              <ShieldCheck className="size-4" />
              Switch to Nexus Security
            </button>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(18deg); }
          75% { transform: rotate(-12deg); }
        }
      `}</style>
    </section>
  );
}
