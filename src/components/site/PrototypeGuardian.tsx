/**
 * PrototypeGuardian
 * -----------------
 * Invisible placeholder slot for the future <NexusGuardian model="..." /> GLB.
 *
 * The 3D scene drives this component via the `state` prop. Each state
 * maps to an animation clip the real character will play. The prototype
 * renders nothing (or an optional debug puck) so the surrounding
 * cinematic timing, camera, dissolve particles and sit-anchor logic
 * are already production-correct.
 *
 * Swap later with zero changes elsewhere:
 *
 *   <PrototypeGuardian state={state} sitAnchor={anchor} />
 *   ↓
 *   <NexusGuardian model="/models/nexus-guardian.glb"
 *                  state={state} sitAnchor={anchor} />
 */
import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export type GuardianState =
  | "hidden"
  | "falling"
  | "landing"
  | "waving"
  | "dissolving"
  | "sitting";

export type GuardianProps = {
  state: GuardianState;
  /** World-space anchor where the character should sit during the living state. */
  sitAnchor?: THREE.Vector3 | [number, number, number];
  /** When true, render a faint debug puck so the slot is visible during dev. */
  debug?: boolean;
};

export function PrototypeGuardian({ state, sitAnchor, debug = false }: GuardianProps) {
  const group = useRef<THREE.Group>(null!);

  useFrame((_, dt) => {
    if (!group.current) return;
    const target = new THREE.Vector3();
    if (Array.isArray(sitAnchor)) target.set(sitAnchor[0], sitAnchor[1], sitAnchor[2]);
    else if (sitAnchor) target.copy(sitAnchor);

    if (state === "sitting") {
      group.current.position.lerp(target, 0.08);
      // breathing
      const s = 1 + Math.sin(performance.now() / 900) * 0.012;
      group.current.scale.setScalar(s);
    } else if (state === "falling") {
      group.current.position.y -= dt * 6;
    }
  });

  if (!debug || state === "hidden" || state === "dissolving") return null;

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}
