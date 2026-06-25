import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion } from "framer-motion";

type Planet = {
  name: string;
  color: string;
  radius: number;
  size: number;
  speed: number;
  phase: number;
  tilt: number;
};

const PLANETS: Planet[] = [
  { name: "Marketplace", color: "#22d3ee", radius: 2.2, size: 0.22, speed: 0.35, phase: 0.0, tilt: 0.05 },
  { name: "Communities", color: "#a855f7", radius: 2.7, size: 0.26, speed: 0.28, phase: 0.9, tilt: -0.1 },
  { name: "Courses", color: "#f472b6", radius: 3.2, size: 0.2, speed: 0.22, phase: 1.8, tilt: 0.12 },
  { name: "Security", color: "#34d399", radius: 3.7, size: 0.24, speed: 0.18, phase: 2.6, tilt: -0.08 },
  { name: "Business", color: "#60a5fa", radius: 4.2, size: 0.28, speed: 0.15, phase: 3.5, tilt: 0.06 },
  { name: "AI Tools", color: "#f59e0b", radius: 4.7, size: 0.22, speed: 0.13, phase: 4.4, tilt: -0.14 },
  { name: "Analytics", color: "#06b6d4", radius: 5.2, size: 0.2, speed: 0.11, phase: 5.2, tilt: 0.1 },
  { name: "Payments", color: "#ec4899", radius: 5.7, size: 0.24, speed: 0.09, phase: 6.0, tilt: -0.05 },
];

function NexusCore() {
  const inner = useRef<THREE.Mesh>(null!);
  const outer = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (inner.current) inner.current.rotation.y += dt * 0.4;
    if (outer.current) outer.current.rotation.y -= dt * 0.15;
  });
  return (
    <group>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      <mesh ref={outer}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.35} />
      </mesh>
      <pointLight color="#22d3ee" intensity={4} distance={10} />
    </group>
  );
}

function OrbitRing({ radius, tilt }: { radius: number; tilt: number }) {
  const lineObj = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
    const pts = curve.getPoints(128).map((p) => new THREE.Vector3(p.x, 0, p.y));
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 });
    const ln = new THREE.LineLoop(geom, mat);
    ln.rotation.set(tilt, 0, tilt * 0.5);
    return ln;
  }, [radius, tilt]);
  return <primitive object={lineObj} />;
}


function OrbitingPlanet({
  planet,
  onHover,
}: {
  planet: Planet;
  onHover: (p: Planet | null) => void;
}) {
  const ref = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const t0 = useRef(planet.phase);

  useFrame((_, dt) => {
    t0.current += dt * planet.speed;
    const x = Math.cos(t0.current) * planet.radius;
    const z = Math.sin(t0.current) * planet.radius;
    if (ref.current) {
      ref.current.position.set(x, Math.sin(t0.current * 0.7) * planet.tilt * 2, z);
    }
    const target = hovered ? 1.55 : 1;
    if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
    }
    if (glowRef.current) {
      const g = hovered ? 2.4 : 1.7;
      glowRef.current.scale.lerp(new THREE.Vector3(g, g, g), 0.12);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = hovered ? 0.35 : 0.18;
    }
  });

  return (
    <group ref={ref}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[planet.size, 24, 24]} />
        <meshBasicMaterial color={planet.color} transparent opacity={0.18} />
      </mesh>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(planet);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={hovered ? 2.2 : 1.2}
          roughness={0.25}
          metalness={0.6}
        />
      </mesh>
      {hovered && (
        <Html center distanceFactor={8} position={[0, planet.size + 0.35, 0]} zIndexRange={[100, 0]}>
          <div className="pointer-events-none whitespace-nowrap rounded-full border border-white/15 bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white shadow-[0_0_30px_-5px_rgba(34,211,238,0.5)]">
            {planet.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function ConnectionLines() {
  const ref = useRef<THREE.LineSegments>(null!);
  const geom = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < PLANETS.length; i++) {
      const a = PLANETS[i];
      const b = PLANETS[(i + 1) % PLANETS.length];
      positions.push(
        Math.cos(a.phase) * a.radius, 0, Math.sin(a.phase) * a.radius,
        Math.cos(b.phase) * b.radius, 0, Math.sin(b.phase) * b.radius,
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < PLANETS.length; i++) {
      const a = PLANETS[i];
      const b = PLANETS[(i + 1) % PLANETS.length];
      const ta = a.phase + clock.elapsedTime * a.speed;
      const tb = b.phase + clock.elapsedTime * b.speed;
      pos.setXYZ(i * 2, Math.cos(ta) * a.radius, 0, Math.sin(ta) * a.radius);
      pos.setXYZ(i * 2 + 1, Math.cos(tb) * b.radius, 0, Math.sin(tb) * b.radius);
    }
    pos.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref}>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial color="#22d3ee" transparent opacity={0.25} />
    </lineSegments>

  );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!);
  const { mouse } = useThree();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -mouse.y * 0.25 + 0.35, 0.05);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, mouse.x * 0.4, 0.05);
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ onHover, lowPower }: { onHover: (p: Planet | null) => void; lowPower: boolean }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[6, 6, 6]} intensity={1.2} color="#a855f7" />
      <pointLight position={[-6, -3, 4]} intensity={0.9} color="#22d3ee" />
      <ParallaxRig>
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <NexusCore />
        </Float>
        {PLANETS.map((p) => (
          <OrbitRing key={`r-${p.name}`} radius={p.radius} tilt={p.tilt} />
        ))}
        {PLANETS.map((p) => (
          <OrbitingPlanet key={p.name} planet={p} onHover={onHover} />
        ))}
        <ConnectionLines />
        <Sparkles count={lowPower ? 40 : 110} scale={14} size={2} speed={0.3} color="#67e8f9" opacity={0.6} />
      </ParallaxRig>
      {!lowPower && (
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.25} luminanceSmoothing={0.6} mipmapBlur />
        </EffectComposer>
      )}
    </>
  );
}

export function NexusUniverse() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<Planet | null>(null);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setLowPower(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[480px] sm:min-h-[640px]">
      {/* Backdrop glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[80%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_60%)] blur-2xl" />
        <div className="absolute bottom-0 right-0 size-[60%] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18),transparent_60%)] blur-2xl" />
      </div>

      {mounted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Canvas
            dpr={[1, lowPower ? 1 : 1.5]}
            camera={{ position: [0, 2.5, 9], fov: 50 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <Scene onHover={setHovered} lowPower={lowPower} />
          </Canvas>
        </motion.div>
      )}

      {/* Floating legend chip */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-1.5">
        {PLANETS.map((p) => (
          <span
            key={p.name}
            className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur-md transition ${
              hovered?.name === p.name
                ? "border-white/40 bg-white/10 text-white"
                : "border-white/10 bg-black/30 text-white/60"
            }`}
            style={{
              boxShadow:
                hovered?.name === p.name ? `0 0 20px -2px ${p.color}80` : undefined,
            }}
          >
            <span
              className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
              style={{ background: p.color, boxShadow: `0 0 8px ${p.color}` }}
            />
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}
