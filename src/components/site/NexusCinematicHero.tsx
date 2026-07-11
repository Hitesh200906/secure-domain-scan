import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "framer-motion";
import { ModeToggle } from "./ModeToggle";

/* ================================================================
   CINEMATIC HERO — pure-black premium space environment.
   Vertical sequence:
     0.0–0.4   space settles (stars twinkle, nebula drifts)
     0.4–2.6   5 feature 3D worlds materialize sequentially
     2.4       labels reveal
     2.9       headline (blur→focus)
     3.4       description
     3.9       buttons
     4.4+      living state — everything keeps breathing
   ================================================================ */

const INTRO_KEY = "nexus_hero_intro_seen_v3";

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
  | "space"
  | "worlds"
  | "labels"
  | "headline"
  | "description"
  | "buttons"
  | "living";

/* ----------------------------------------------------------------
   Background — pure-black space, subtle blue/cyan nebula, parallax
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
            float n=noise(uv*2.4+uTime*0.015);
            n+=noise(uv*4.8-uTime*0.01)*0.5;
            // extremely subtle blue/cyan clouds on pure black
            vec3 blue=vec3(0.05,0.18,0.36);
            vec3 cyan=vec3(0.06,0.28,0.42);
            vec3 col=mix(blue,cyan,smoothstep(0.5,0.95,n));
            float a=smoothstep(0.65,0.05,r)*0.10*n;
            gl_FragColor=vec4(col,a);
          }`,
      }),
    [],
  );
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * 0.008;
    (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh ref={ref} position={[0, 0, -10]}>
      <planeGeometry args={[50, 32]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** Additional star layers — tiny, varied brightness, twinkling forever. */
function StarLayer({
  count,
  radius,
  size,
  speed,
  opacity,
}: {
  count: number;
  radius: number;
  size: number;
  speed: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Points>(null!);
  const { positions, phases } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // spherical shell distribution
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = radius * (0.6 + Math.random() * 0.4);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      ph[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, phases: ph };
  }, [count, radius]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: size },
          uOpacity: { value: opacity },
          uSpeed: { value: speed },
        },
        vertexShader: `
          attribute float aPhase;
          uniform float uTime; uniform float uSize; uniform float uSpeed;
          varying float vTwinkle;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position,1.);
            gl_Position = projectionMatrix * mv;
            float t = sin(uTime*uSpeed + aPhase)*0.5+0.5;
            vTwinkle = 0.35 + t*0.65;
            gl_PointSize = uSize * (300.0 / -mv.z) * (0.6 + t*0.7);
          }`,
        fragmentShader: `
          varying float vTwinkle;
          uniform float uOpacity;
          void main(){
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if(d>0.5) discard;
            float a = smoothstep(0.5,0.0,d) * vTwinkle * uOpacity;
            gl_FragColor = vec4(1.0,1.0,1.0,a);
          }`,
      }),
    [size, opacity, speed],
  );

  useFrame(({ clock }) => {
    (mat.uniforms.uTime.value as number) = clock.elapsedTime;
  });

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return g;
  }, [positions, phases]);

  return <points ref={ref} geometry={geom} material={mat} />;
}

/** Subtle parallax rig — tiny mouse drift for depth perception. */
function ParallaxRig() {
  const { camera } = useFrame((state) => {
    const x = state.pointer.x * 0.15;
    const y = state.pointer.y * 0.08;
    state.camera.position.x += (x - state.camera.position.x) * 0.02;
    state.camera.position.y += (0.4 + y - state.camera.position.y) * 0.02;
    state.camera.lookAt(0, 0, 0);
  }) as unknown as { camera: THREE.Camera };
  void camera;
  return null;
}

function BackgroundScene({ quality }: { quality: Quality }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.15} />

      <Nebula />

      {/* Drei stars — deep base layer */}
      <Stars
        radius={90}
        depth={60}
        count={quality === "low" ? 2000 : quality === "medium" ? 4500 : 7000}
        factor={3}
        fade
        speed={0.4}
      />

      {/* Custom twinkling layers — varied sizes / brightness / depth */}
      <StarLayer count={quality === "low" ? 220 : 450} radius={22} size={1.6} speed={1.8} opacity={0.9} />
      <StarLayer count={quality === "low" ? 300 : 700} radius={40} size={1.1} speed={1.1} opacity={0.7} />
      <StarLayer count={quality === "low" ? 400 : 1000} radius={70} size={0.7} speed={0.6} opacity={0.55} />

      <ParallaxRig />

      {quality !== "low" && (
        <EffectComposer>
          <Bloom intensity={0.35} luminanceThreshold={0.55} luminanceSmoothing={0.7} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

/* ----------------------------------------------------------------
   Feature worlds — each is a unique floating 3D environment.
   NO glass boxes, NO cubes, NO rectangular containers.
   ---------------------------------------------------------------- */

/* --- Marketplace: floating cyberpunk commerce city --- */
function MarketplaceMini() {
  const grp = useRef<THREE.Group>(null!);
  const buildings = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        x: ((i % 4) - 1.5) * 0.32 + (Math.random() - 0.5) * 0.08,
        z: (Math.floor(i / 4) - 1.5) * 0.32 + (Math.random() - 0.5) * 0.08,
        h: 0.3 + Math.random() * 0.9,
        s: 0.6 + Math.random() * 1.6,
      })),
    [],
  );
  const drones = useRef<THREE.Group>(null!);
  useFrame(({ clock }, dt) => {
    if (grp.current) {
      grp.current.rotation.y += dt * 0.15;
      grp.current.children.forEach((c, i) => {
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && "emissiveIntensity" in m && i > 0) {
          const b = buildings[(i - 1) % buildings.length];
          m.emissiveIntensity = 0.7 + Math.sin(clock.elapsedTime * b.s + i) * 0.5 + 0.4;
        }
      });
    }
    if (drones.current) {
      drones.current.rotation.y -= dt * 0.5;
      drones.current.children.forEach((c, i) => {
        c.position.y = 0.9 + Math.sin(clock.elapsedTime * 1.4 + i) * 0.15;
      });
    }
  });
  return (
    <group position={[0, -0.25, 0]}>
      <group ref={grp}>
        {/* base pad */}
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[1.25, 1.35, 0.04, 64]} />
          <meshStandardMaterial color="#020814" emissive="#1e88ff" emissiveIntensity={0.4} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* skyscrapers */}
        {buildings.map((b, i) => (
          <mesh key={i} position={[b.x, b.h / 2 - 0.02, b.z]}>
            <boxGeometry args={[0.16, b.h, 0.16]} />
            <meshStandardMaterial color="#050f22" emissive="#22d3ee" emissiveIntensity={1.2} metalness={0.75} roughness={0.15} />
          </mesh>
        ))}
        {/* central holo-billboard */}
        <mesh position={[0, 1.05, 0]}>
          <torusGeometry args={[0.18, 0.02, 12, 32]} />
          <meshStandardMaterial color="#67e8f9" emissive="#67e8f9" emissiveIntensity={2.4} />
        </mesh>
      </group>
      {/* flying drones */}
      <group ref={drones}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.05, 0.9, Math.sin(a) * 1.05]}>
              <sphereGeometry args={[0.035, 10, 10]} />
              <meshStandardMaterial color="#ffffff" emissive="#67e8f9" emissiveIntensity={3} />
            </mesh>
          );
        })}
      </group>
      <pointLight color="#22d3ee" intensity={1.4} distance={3.5} position={[0, 0.8, 0]} />
      <pointLight color="#1e88ff" intensity={0.9} distance={3} position={[0.6, 0.2, 0.6]} />
    </group>
  );
}

/* --- Communities: glowing network sphere with energy connections --- */
function CommunitiesMini() {
  const grp = useRef<THREE.Group>(null!);
  const rings = useRef<THREE.Group>(null!);
  const nodes = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < 28; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 28);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      out.push(
        new THREE.Vector3(
          0.8 * Math.cos(theta) * Math.sin(phi),
          0.8 * Math.sin(theta) * Math.sin(phi),
          0.8 * Math.cos(phi),
        ),
      );
    }
    return out;
  }, []);
  const lineObj = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 0.9) pts.push(nodes[i], nodes[j]);
      }
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.LineSegments(
      g,
      new THREE.LineBasicMaterial({ color: "#8b5cf6", transparent: true, opacity: 0.55 }),
    );
  }, [nodes]);
  useFrame(({ clock }, dt) => {
    if (grp.current) {
      grp.current.rotation.y += dt * 0.28;
      grp.current.rotation.x += dt * 0.06;
    }
    if (rings.current) {
      rings.current.children.forEach((c, i) => {
        c.rotation.z = clock.elapsedTime * (0.3 + i * 0.15) * (i % 2 ? -1 : 1);
      });
    }
  });
  return (
    <group>
      <group ref={grp}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.6} transparent opacity={0.1} />
        </mesh>
        {nodes.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#a78bfa" emissiveIntensity={2.8} />
          </mesh>
        ))}
        <primitive object={lineObj} />
      </group>
      {/* communication rings */}
      <group ref={rings}>
        {[0.95, 1.1, 1.28].map((r, i) => (
          <mesh key={i} rotation={[Math.PI / 2 + i * 0.3, 0, 0]}>
            <torusGeometry args={[r, 0.006, 8, 96]} />
            <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      <Sparkles count={40} scale={2.6} size={1.4} speed={0.4} color="#a78bfa" opacity={0.7} />
      <pointLight color="#8b5cf6" intensity={1.5} distance={3} />
      <pointLight color="#60a5fa" intensity={1} distance={3} position={[0.8, 0.3, 0.5]} />
    </group>
  );
}

/* --- Nexus Security: futuristic shield + rotating protection rings --- */
function SecurityMini() {
  const r1 = useRef<THREE.Mesh>(null!);
  const r2 = useRef<THREE.Mesh>(null!);
  const r3 = useRef<THREE.Mesh>(null!);
  const shield = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }, dt) => {
    if (r1.current) r1.current.rotation.x += dt * 0.6;
    if (r2.current) r2.current.rotation.y += dt * 0.5;
    if (r3.current) r3.current.rotation.z += dt * 0.45;
    if (shield.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.4) * 0.04;
      shield.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      {/* holographic shield */}
      <mesh ref={shield}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#60a5fa"
          emissiveIntensity={0.7}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* rotating protection rings */}
      <mesh ref={r1}>
        <torusGeometry args={[0.95, 0.024, 16, 100]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2.5} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh ref={r2}>
        <torusGeometry args={[0.78, 0.022, 16, 100]} />
        <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={2.2} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh ref={r3}>
        <torusGeometry args={[0.62, 0.02, 16, 100]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2.5} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* metallic core */}
      <mesh>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#60a5fa" emissiveIntensity={2.5} metalness={1} roughness={0.1} />
      </mesh>
      <pointLight color="#60a5fa" intensity={2} distance={3.5} />
    </group>
  );
}

/* --- AI Tools: neural intelligence core --- */
function AIMini() {
  const core = useRef<THREE.Mesh>(null!);
  const inner = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }, dt) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.5;
      core.current.rotation.x += dt * 0.25;
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.9;
      const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.05;
      inner.current.scale.setScalar(s);
    }
  });
  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.78, 2]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#67e8f9"
          emissiveIntensity={1.6}
          metalness={0.7}
          roughness={0.2}
          wireframe
        />
      </mesh>
      <mesh ref={inner}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#67e8f9" emissiveIntensity={2.4} />
      </mesh>
      <Sparkles count={60} scale={2.4} size={1.8} speed={0.9} color="#67e8f9" />
      <pointLight color="#67e8f9" intensity={1.7} distance={3.2} />
      <pointLight color="#22d3ee" intensity={1} distance={3} position={[0.6, 0.4, 0.4]} />
    </group>
  );
}

/* --- Business: analytics world (bars + rings + panels) --- */
function BusinessMini() {
  const grp = useRef<THREE.Group>(null!);
  const panels = useRef<THREE.Group>(null!);
  const bars = useMemo(() => [0.4, 0.65, 0.5, 0.85, 0.55, 0.72, 0.45, 0.6], []);
  useFrame(({ clock }, dt) => {
    if (grp.current) {
      grp.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.35;
      grp.current.children.forEach((c, i) => {
        if ((c as THREE.Mesh).isMesh && i < bars.length) {
          const h = bars[i] + Math.sin(clock.elapsedTime * 1.5 + i) * 0.12;
          c.scale.y = Math.max(0.2, h / bars[i]);
        }
      });
    }
    if (panels.current) panels.current.rotation.y += dt * 0.25;
  });
  return (
    <group position={[0, -0.25, 0]}>
      <group ref={grp}>
        {bars.map((h, i) => (
          <mesh key={i} position={[(i - 3.5) * 0.18, h / 2 - 0.05, 0]}>
            <boxGeometry args={[0.12, h, 0.12]} />
            <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={1.4} metalness={0.7} roughness={0.2} />
          </mesh>
        ))}
      </group>
      {/* base disc */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.03, 48]} />
        <meshStandardMaterial color="#020814" emissive="#60a5fa" emissiveIntensity={0.4} metalness={0.9} roughness={0.2} />
      </mesh>
      {/* floating analytics rings with subtle gold */}
      <group ref={panels}>
        <mesh position={[0.9, 0.55, 0]} rotation={[0, 0, Math.PI / 8]}>
          <torusGeometry args={[0.22, 0.012, 12, 48]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.85, 0.8, 0.1]} rotation={[Math.PI / 6, 0, 0]}>
          <torusGeometry args={[0.18, 0.01, 12, 48]} />
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={2.2} />
        </mesh>
      </group>
      <pointLight color="#60a5fa" intensity={1.4} distance={3.2} />
      <pointLight color="#fbbf24" intensity={0.6} distance={3} position={[0.5, 0.8, 0.4]} />
    </group>
  );
}

/* ----------------------------------------------------------------
   Mini canvas — NO container. Transparent. Just the world floating.
   ---------------------------------------------------------------- */

function MiniWorldCanvas({ kind }: { kind: World["id"] }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.55, 2.7], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4}>
        {kind === "marketplace" && <MarketplaceMini />}
        {kind === "communities" && <CommunitiesMini />}
        {kind === "security" && <SecurityMini />}
        {kind === "ai" && <AIMini />}
        {kind === "business" && <BusinessMini />}
      </Float>
      <EffectComposer>
        <Bloom intensity={0.75} luminanceThreshold={0.2} luminanceSmoothing={0.65} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

/* ----------------------------------------------------------------
   World definitions
   ---------------------------------------------------------------- */

type World = {
  id: "marketplace" | "communities" | "security" | "ai" | "business";
  label: string;
  accent: string;
};
const WORLDS: World[] = [
  { id: "marketplace", label: "Marketplace",    accent: "#22d3ee" },
  { id: "communities", label: "Communities",    accent: "#a78bfa" },
  { id: "security",    label: "Nexus Security", accent: "#60a5fa" },
  { id: "ai",          label: "AI Tools",       accent: "#67e8f9" },
  { id: "business",    label: "Business",       accent: "#93c5fd" },
];

function WorldSlot({
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
    <div className="relative w-full">
      {/* soft accent glow behind the world — no box border */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={appear ? { opacity: 0.6, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 1.2, delay: index * 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 blur-2xl"
        style={{
          background: `radial-gradient(60% 60% at 50% 50%, ${world.accent}33, transparent 70%)`,
        }}
      />

      {/* the 3D world — energy-burst entrance */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.7, filter: "blur(16px)" }}
        animate={
          appear
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 18, scale: 0.7, filter: "blur(16px)" }
        }
        transition={{
          duration: 1.1,
          delay: index * 0.22,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative aspect-square w-full"
      >
        {appear && <MiniWorldCanvas kind={world.id} />}
      </motion.div>

      {/* label */}
      <motion.div
        initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
        animate={
          labelAppear
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 8, filter: "blur(10px)" }
        }
        transition={{ duration: 0.7, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 text-center"
      >
        <span
          className="text-[12px] sm:text-sm font-medium tracking-[0.2em] uppercase text-white"
          style={{ textShadow: `0 0 14px ${world.accent}99, 0 0 30px ${world.accent}55` }}
        >
          {world.label}
        </span>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------
   Public hero component
   ---------------------------------------------------------------- */

export function NexusCinematicHero() {
  const quality = useQuality();
  const [phase, setPhase] = useState<HeroPhase>("space");

  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem(INTRO_KEY) === "true";
    if (seen) {
      setPhase("living");
      return;
    }
    const t: number[] = [];
    t.push(window.setTimeout(() => setPhase("worlds"), 400));
    t.push(window.setTimeout(() => setPhase("labels"), 2400));
    t.push(window.setTimeout(() => setPhase("headline"), 2900));
    t.push(window.setTimeout(() => setPhase("description"), 3400));
    t.push(window.setTimeout(() => setPhase("buttons"), 3900));
    t.push(
      window.setTimeout(() => {
        setPhase("living");
        sessionStorage.setItem(INTRO_KEY, "true");
      }, 4500),
    );
    return () => t.forEach(clearTimeout);
  }, []);

  const worldsAppear = ["worlds", "labels", "headline", "description", "buttons", "living"].includes(phase);
  const labelsAppear = ["labels", "headline", "description", "buttons", "living"].includes(phase);
  const headlineAppear = ["headline", "description", "buttons", "living"].includes(phase);
  const descAppear = ["description", "buttons", "living"].includes(phase);
  const buttonsAppear = ["buttons", "living"].includes(phase);

  return (
    <section className="relative w-full overflow-hidden bg-black pt-24 sm:pt-28 pb-16 sm:pb-24 min-h-[100svh]">
      {/* full-bleed space canvas */}
      <div className="pointer-events-none absolute inset-0">
        <Canvas
          dpr={[1, quality === "high" ? 1.6 : 1.3]}
          camera={{ position: [0, 0.4, 7], fov: 55 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        >
          <BackgroundScene quality={quality} />
        </Canvas>
        {/* soft vignette to keep focus centered */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.9)_100%)]" />
        {/* bottom fade into page */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black" />
      </div>

      {/* foreground content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* 5 feature worlds — no boxes, just floating 3D environments */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {WORLDS.map((w, i) => (
            <WorldSlot
              key={w.id}
              world={w}
              index={i}
              appear={worldsAppear}
              labelAppear={labelsAppear}
            />
          ))}
        </div>

        {/* headline */}
        <div className="mt-12 sm:mt-20 text-center max-w-4xl mx-auto">
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
            className="mt-6 text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Discover thousands of communities, courses, and digital products —
            or launch your own store in minutes. One platform, infinite possibilities.
          </motion.p>

          {/* buttons — reuse the ModeToggle used across both sites */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={
              buttonsAppear
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 18, scale: 0.96 }
            }
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="mt-8 sm:mt-10 flex justify-center"
          >
            <ModeToggle />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
