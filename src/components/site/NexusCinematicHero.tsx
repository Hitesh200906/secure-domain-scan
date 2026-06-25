import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Stars, Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { PrototypeGuardian, type GuardianState } from "./PrototypeGuardian";

/* ============================================================
   Cinematic hero – galaxy + 5 reality-birth feature worlds
   ============================================================ */

const INTRO_KEY = "nexus_intro_seen";

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

/* ------------ Worlds ------------- */

type World = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
};

const WORLDS: World[] = [
  { id: "marketplace", label: "Marketplace",    position: [-4.6, 0.6, 0],  color: "#22d3ee" },
  { id: "communities", label: "Communities",    position: [-2.4, -0.4, 1], color: "#a855f7" },
  { id: "security",    label: "Nexus Security", position: [0,    0.9, 0],  color: "#60a5fa" },
  { id: "ai",          label: "AI Tools",       position: [2.4, -0.4, 1],  color: "#67e8f9" },
  { id: "business",    label: "Business",       position: [4.6,  0.6, 0],  color: "#fbbf24" },
];

function Nebula() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * 0.02;
    const m = ref.current.material as THREE.ShaderMaterial;
    m.uniforms.uTime.value = clock.elapsedTime;
  });
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
            float n=noise(uv*3.+uTime*0.04);
            n+=noise(uv*6.-uTime*0.03)*0.5;
            vec3 blue=vec3(0.05,0.25,0.55);
            vec3 cyan=vec3(0.10,0.55,0.75);
            vec3 purple=vec3(0.30,0.10,0.55);
            vec3 col=mix(blue,purple,n);
            col=mix(col,cyan,smoothstep(0.4,0.9,n));
            float a=smoothstep(0.55,0.0,r)*0.55*n;
            gl_FragColor=vec4(col,a);
          }`,
      }),
    [],
  );
  return (
    <mesh ref={ref} position={[0, 0, -8]}>
      <planeGeometry args={[34, 22]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* world: marketplace city */
function MarketplaceWorld({ color, born }: { color: string; born: number }) {
  const grp = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (grp.current) grp.current.rotation.y += dt * 0.15;
  });
  const buildings = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        x: ((i % 3) - 1) * 0.32,
        z: (Math.floor(i / 3) - 1) * 0.32,
        h: 0.25 + Math.random() * 0.45,
      })),
    [],
  );
  return (
    <group ref={grp} scale={born}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.85, 0.95, 0.06, 32]} />
        <meshStandardMaterial color="#0b1730" emissive={color} emissiveIntensity={0.35} metalness={0.7} roughness={0.3} />
      </mesh>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 0.02, b.z]}>
          <boxGeometry args={[0.18, b.h, 0.18]} />
          <meshStandardMaterial color="#0a1f3a" emissive={color} emissiveIntensity={0.9} metalness={0.6} roughness={0.25} />
        </mesh>
      ))}
      <pointLight color={color} intensity={1.4} distance={2.5} />
    </group>
  );
}

/* world: communities neural sphere */
function CommunitiesWorld({ color, born }: { color: string; born: number }) {
  const grp = useRef<THREE.Group>(null!);
  const nodes = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < 14; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 14);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      out.push(
        new THREE.Vector3(
          0.55 * Math.cos(theta) * Math.sin(phi),
          0.55 * Math.sin(theta) * Math.sin(phi),
          0.55 * Math.cos(phi),
        ),
      );
    }
    return out;
  }, []);
  const lines = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 0.7) {
          pts.push(nodes[i], nodes[j]);
        }
      }
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }));
  }, [nodes, color]);
  useFrame((_, dt) => {
    if (grp.current) {
      grp.current.rotation.y += dt * 0.25;
      grp.current.rotation.x += dt * 0.08;
    }
  });
  return (
    <group ref={grp} scale={born}>
      <mesh>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} transparent opacity={0.15} />
      </mesh>
      {nodes.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={2.4} />
        </mesh>
      ))}
      <primitive object={lines} />
      <pointLight color={color} intensity={1.2} distance={2} />
    </group>
  );
}

/* world: security shield */
function SecurityWorld({ color, born }: { color: string; born: number }) {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (r1.current) r1.current.rotation.x += dt * 0.6;
    if (r2.current) r2.current.rotation.y += dt * 0.5;
    if (r3.current) r3.current.rotation.z += dt * 0.4;
  });
  return (
    <group scale={born}>
      <mesh ref={r1}>
        <torusGeometry args={[0.7, 0.025, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[0.55, 0.022, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[0.4, 0.02, 16, 100]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3} />
      </mesh>
      <pointLight color={color} intensity={2} distance={2.5} />
    </group>
  );
}

/* world: AI core */
function AIWorld({ color, born }: { color: string; born: number }) {
  const core = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.7;
      core.current.rotation.x += dt * 0.3;
    }
  });
  return (
    <group scale={born}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} metalness={0.7} roughness={0.2} wireframe />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={2.2} />
      </mesh>
      <Sparkles count={28} scale={1.6} size={1.5} speed={0.6} color={color} />
      <pointLight color={color} intensity={1.4} distance={2.4} />
    </group>
  );
}

/* world: business analytics */
function BusinessWorld({ color, born }: { color: string; born: number }) {
  const grp = useRef<THREE.Group>(null!);
  const bars = useMemo(() => [0.35, 0.55, 0.42, 0.7, 0.48, 0.62], []);
  useFrame(({ clock }) => {
    if (!grp.current) return;
    grp.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.3;
    grp.current.children.forEach((c, i) => {
      if ((c as THREE.Mesh).isMesh && i < bars.length) {
        const h = bars[i] + Math.sin(clock.elapsedTime * 1.4 + i) * 0.08;
        c.scale.y = h / bars[i];
      }
    });
  });
  return (
    <group ref={grp} scale={born}>
      {bars.map((h, i) => (
        <mesh key={i} position={[(i - 2.5) * 0.16, h / 2 - 0.1, 0]}>
          <boxGeometry args={[0.1, h, 0.1]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.04, 32]} />
        <meshStandardMaterial color="#1a1206" emissive={color} emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
      </mesh>
      <pointLight color={color} intensity={1.2} distance={2.2} />
    </group>
  );
}

function WorldByName({ id, color, born }: { id: string; color: string; born: number }) {
  switch (id) {
    case "marketplace": return <MarketplaceWorld color={color} born={born} />;
    case "communities": return <CommunitiesWorld color={color} born={born} />;
    case "security":    return <SecurityWorld color={color} born={born} />;
    case "ai":          return <AIWorld color={color} born={born} />;
    case "business":    return <BusinessWorld color={color} born={born} />;
    default: return null;
  }
}

/* ------------ Reality-birth wrapper -------------- */

function FeatureWorld({
  world,
  visible,
  delay,
}: {
  world: World;
  visible: boolean;
  delay: number;
}) {
  const grp = useRef<THREE.Group>(null!);
  const startedAt = useRef<number | null>(null);
  const [born, setBorn] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  useFrame(({ clock }, dt) => {
    if (!visible) return;
    if (startedAt.current === null) startedAt.current = clock.elapsedTime + delay;
    const t = Math.max(0, clock.elapsedTime - startedAt.current);
    // 1.7s reality-birth: expand from 0 → 1 with overshoot
    const k = Math.min(1, t / 1.7);
    const eased = k < 1 ? 1 - Math.pow(1 - k, 4) : 1;
    setBorn(eased);
    if (k >= 0.55 && !showLabel) setShowLabel(true);
    if (grp.current) {
      grp.current.position.y = world.position[1] + Math.sin(clock.elapsedTime * 0.6 + delay) * 0.05;
      grp.current.rotation.y += dt * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group ref={grp} position={world.position}>
      {/* portal burst */}
      {born < 1 && (
        <mesh>
          <ringGeometry args={[0.8 * (1 - born), 0.85 * (1 - born) + 0.02, 48]} />
          <meshBasicMaterial color={world.color} transparent opacity={(1 - born) * 0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <WorldByName id={world.id} color={world.color} born={born} />
      </Float>
      {showLabel && (
        <Html center position={[0, -1.05, 0]} distanceFactor={9} zIndexRange={[20, 0]}>
          <motion.div
            initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none whitespace-nowrap rounded-full border border-white/15 bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white"
            style={{ boxShadow: `0 0 24px -4px ${world.color}99` }}
          >
            {world.label}
          </motion.div>
        </Html>
      )}
    </group>
  );
}

/* ------------ Dissolve particles ------------- */

function DissolveBurst({ active, origin }: { active: boolean; origin: [number, number, number] }) {
  const ref = useRef<THREE.Points>(null!);
  const startedAt = useRef<number | null>(null);
  const { positions, velocities } = useMemo(() => {
    const N = 220;
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const dir = new THREE.Vector3(
        (Math.random() - 0.5),
        Math.random() * 1.2 + 0.2,
        (Math.random() - 0.5),
      ).normalize();
      vel[i * 3] = dir.x * (0.6 + Math.random() * 0.6);
      vel[i * 3 + 1] = dir.y * (0.4 + Math.random() * 0.5);
      vel[i * 3 + 2] = dir.z * (0.6 + Math.random() * 0.6);
    }
    return { positions: pos, velocities: vel };
  }, []);
  useFrame(({ clock }, dt) => {
    if (!active) return;
    if (startedAt.current === null) {
      startedAt.current = clock.elapsedTime;
      const arr = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < arr.length; i += 3) {
        arr[i] = origin[0]; arr[i + 1] = origin[1]; arr[i + 2] = origin[2];
      }
    }
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3]     += velocities[i * 3]     * dt;
      arr[i * 3 + 1] += velocities[i * 3 + 1] * dt;
      arr[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    const t = clock.elapsedTime - startedAt.current;
    const m = ref.current.material as THREE.PointsMaterial;
    m.opacity = Math.max(0, 1 - t / 0.7);
  });
  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={positions.length / 3} />
      </bufferGeometry>
      <pointsMaterial color="#67e8f9" size={0.06} transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ------------ Camera + rig ------------- */

function CameraRig({ shake }: { shake: boolean }) {
  const { camera, mouse } = useThree();
  const shakeUntil = useRef(0);
  useEffect(() => {
    if (shake) shakeUntil.current = performance.now() + 350;
  }, [shake]);
  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 0.4, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.2 + mouse.y * 0.2, 0.04);
    if (performance.now() < shakeUntil.current) {
      camera.position.x += (Math.random() - 0.5) * 0.08;
      camera.position.y += (Math.random() - 0.5) * 0.08;
    }
    camera.lookAt(0, 0.3, 0);
  });
  return null;
}

/* ------------ Scene ------------- */

function Scene({
  worldsVisible,
  dissolveActive,
  shake,
  guardianState,
  sitAnchor,
  quality,
}: {
  worldsVisible: boolean;
  dissolveActive: boolean;
  shake: boolean;
  guardianState: GuardianState;
  sitAnchor: [number, number, number];
  quality: Quality;
}) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 12, 28]} />
      <ambientLight intensity={0.18} />
      <pointLight position={[6, 6, 6]} intensity={1.1} color="#a855f7" />
      <pointLight position={[-6, -3, 4]} intensity={0.9} color="#22d3ee" />

      <Nebula />
      <Stars
        radius={60}
        depth={40}
        count={quality === "low" ? 1500 : quality === "medium" ? 3500 : 6000}
        factor={4}
        fade
        speed={0.6}
      />
      <Sparkles
        count={quality === "low" ? 30 : 90}
        scale={[16, 8, 8]}
        size={1.6}
        speed={0.3}
        color="#67e8f9"
        opacity={0.7}
      />

      {WORLDS.map((w, i) => (
        <FeatureWorld key={w.id} world={w} visible={worldsVisible} delay={i * 0.18} />
      ))}

      <DissolveBurst active={dissolveActive} origin={[0, -0.5, 0]} />

      <PrototypeGuardian state={guardianState} sitAnchor={sitAnchor} />

      <CameraRig shake={shake} />

      {quality !== "low" && (
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.2} luminanceSmoothing={0.6} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

/* ------------ Public component ------------- */

export type Phase = "galaxy" | "guardian" | "dissolve" | "worlds" | "text" | "buttons" | "living";

export function NexusCinematicHero({
  onPhaseChange,
  sitAnchor = [3.6, 0.6, 0],
}: {
  onPhaseChange?: (p: Phase) => void;
  sitAnchor?: [number, number, number];
}) {
  const quality = useQuality();
  const [phase, setPhase] = useState<Phase>("galaxy");

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem(INTRO_KEY) === "true";
    if (seen) {
      setPhase("living");
      return;
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("guardian"), 300));   // 0.3s
    timers.push(window.setTimeout(() => setPhase("dissolve"), 2000));  // 2.0s
    timers.push(window.setTimeout(() => setPhase("worlds"), 2500));    // 2.5s
    timers.push(window.setTimeout(() => setPhase("text"), 4200));      // 4.2s
    timers.push(window.setTimeout(() => setPhase("buttons"), 5200));   // 5.2s
    timers.push(window.setTimeout(() => {
      setPhase("living");
      sessionStorage.setItem(INTRO_KEY, "true");
    }, 6000));                                                          // 6.0s
    return () => timers.forEach(clearTimeout);
  }, []);

  const guardianState: GuardianState =
    phase === "galaxy" ? "hidden" :
    phase === "guardian" ? "waving" :
    phase === "dissolve" ? "dissolving" :
    phase === "living" ? "sitting" : "hidden";

  const worldsVisible = phase === "worlds" || phase === "text" || phase === "buttons" || phase === "living";

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black">
      <Canvas
        dpr={[1, quality === "high" ? 1.75 : quality === "medium" ? 1.4 : 1]}
        camera={{ position: [0, 1.2, 7.5], fov: 50 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <Scene
          worldsVisible={worldsVisible}
          dissolveActive={phase === "dissolve"}
          shake={phase === "guardian"}
          guardianState={guardianState}
          sitAnchor={sitAnchor}
          quality={quality}
        />
      </Canvas>

      {/* corner vignette for cinematic feel */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.85)_100%)]" />

      {/* mini legend chips in living state */}
      <AnimatePresence>
        {phase === "living" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap justify-center gap-1.5"
          >
            {WORLDS.map((w) => (
              <span
                key={w.id}
                className="rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70"
              >
                <span
                  className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
                  style={{ background: w.color, boxShadow: `0 0 8px ${w.color}` }}
                />
                {w.label}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
