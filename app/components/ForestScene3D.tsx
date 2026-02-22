'use client';

import { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Sticky } from '@/lib/types';

// ── Palettes ────────────────────────────────────────────────────────────────
const PALETTES: Record<string, { dark: string; mid: string; light: string; trunk: string; label: string }> = {
  generative:     { dark: '#DB2777', mid: '#F9A8D4', light: '#FCE7F3', trunk: '#92400E', label: 'Generative' },
  predictive:     { dark: '#047857', mid: '#6EE7B7', light: '#D1FAE5', trunk: '#5C3317', label: 'Predictive' },
  automation:     { dark: '#1D4ED8', mid: '#93C5FD', light: '#DBEAFE', trunk: '#374151', label: 'Automation' },
  conversational: { dark: '#B45309', mid: '#FCD34D', light: '#FEF9C3', trunk: '#92400E', label: 'Conversational' },
  unsure:         { dark: '#6D28D9', mid: '#C4B5FD', light: '#EDE9FE', trunk: '#5B21B6', label: 'Mixed / Unsure' },
};

type Pal = typeof PALETTES[string];

function stableHash(id: string, seed: number): number {
  let h = seed * 2654435761;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 2654435761);
  return (h >>> 0) / 4294967295;
}

// ── Tree shapes ─────────────────────────────────────────────────────────────

// Predictive — tall elegant pine, stacked cones + gold star
function PineTree({ s, pal }: { s: number; pal: Pal }) {
  return (
    <group scale={s}>
      <mesh position={[0, 0.09, 0]} scale={[1.9, 0.13, 1.9]}>
        <sphereGeometry args={[0.24, 8, 5]} /><meshLambertMaterial color="#5C3317" />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <cylinderGeometry args={[0.1, 0.22, 1.55, 8]} /><meshLambertMaterial color="#5C3317" />
      </mesh>
      <mesh position={[0.04, 2.1, 0]}><coneGeometry args={[1.1, 1.7, 8]} /><meshLambertMaterial color={pal.dark} /></mesh>
      <mesh position={[-0.03, 3.15, 0]}><coneGeometry args={[0.85, 1.45, 8]} /><meshLambertMaterial color={pal.mid} /></mesh>
      <mesh position={[0.05, 4.1, 0]}><coneGeometry args={[0.62, 1.22, 8]} /><meshLambertMaterial color={pal.dark} /></mesh>
      <mesh position={[0, 4.95, 0]}><coneGeometry args={[0.4, 1.05, 8]} /><meshLambertMaterial color={pal.mid} /></mesh>
      <mesh position={[0, 5.68, 0]}><coneGeometry args={[0.22, 0.8, 8]} /><meshLambertMaterial color={pal.light} /></mesh>
      <mesh position={[0, 6.16, 0]}><octahedronGeometry args={[0.14]} /><meshPhongMaterial color="#FFD966" shininess={130} /></mesh>
    </group>
  );
}

// Generative — cherry blossom: branching trunk + layered blossom cloud
function RoundTree({ s, pal }: { s: number; pal: Pal }) {
  const blossoms: [number, number, number, number, number][] = [
    [0,    3.35,  0,    1.08, 0],
    [-0.88,3.15,  0.22, 0.8,  1],
    [0.9,  3.22, -0.18, 0.76, 2],
    [0,    4.05,  0,    0.74, 0],
    [-0.5, 3.62, -0.75, 0.66, 1],
    [0.58, 3.68,  0.72, 0.64, 2],
    [-0.22,4.42,  0.18, 0.54, 0],
    [0.3,  3.18, -0.9,  0.6,  1],
    [0,    3.35,  0.95, 0.62, 2],
  ];
  return (
    <group scale={s}>
      <mesh position={[0, 0.09, 0]} scale={[1.8, 0.12, 1.8]}>
        <sphereGeometry args={[0.24, 8, 5]} /><meshLambertMaterial color="#7C4A1E" />
      </mesh>
      <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.12, 0.23, 2.2, 8]} /><meshLambertMaterial color="#7C4A1E" /></mesh>
      {/* Two visible branches */}
      <mesh position={[-0.55, 2.48, 0.1]} rotation={[0.05, 0, 0.52]}>
        <cylinderGeometry args={[0.07, 0.11, 1.25, 6]} /><meshLambertMaterial color="#7C4A1E" />
      </mesh>
      <mesh position={[0.6, 2.42, -0.1]} rotation={[-0.05, 0, -0.48]}>
        <cylinderGeometry args={[0.07, 0.11, 1.25, 6]} /><meshLambertMaterial color="#7C4A1E" />
      </mesh>
      {blossoms.map(([x, y, z, r, ci], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[r, 10, 10]} />
          <meshLambertMaterial color={ci === 0 ? pal.dark : ci === 1 ? pal.mid : pal.light} />
        </mesh>
      ))}
      <mesh position={[0, 4.76, 0]}><sphereGeometry args={[0.26, 8, 8]} /><meshLambertMaterial color="#FFFFFF" /></mesh>
    </group>
  );
}

// Automation — stacked crystal spires with orbiting shards
function CrystalTree({ s, pal }: { s: number; pal: Pal }) {
  return (
    <group scale={s}>
      <mesh position={[0, 0.78, 0]}><cylinderGeometry args={[0.06, 0.12, 1.55, 6]} /><meshPhongMaterial color="#374151" shininess={80} /></mesh>
      <mesh position={[0, 2.18, 0]} rotation={[0, 0.3, 0]}><octahedronGeometry args={[1.08]} /><meshPhongMaterial color={pal.dark} transparent opacity={0.84} shininess={130} /></mesh>
      <mesh position={[0, 3.38, 0]} rotation={[0, 0.85, 0]}><octahedronGeometry args={[0.78]} /><meshPhongMaterial color={pal.mid} transparent opacity={0.79} shininess={130} /></mesh>
      <mesh position={[0, 4.28, 0]} rotation={[0, 1.4, 0]}><octahedronGeometry args={[0.52]} /><meshPhongMaterial color={pal.dark} transparent opacity={0.74} shininess={150} /></mesh>
      <mesh position={[0, 5.02, 0]} rotation={[0, 1.9, 0]}><octahedronGeometry args={[0.32]} /><meshPhongMaterial color={pal.light} transparent opacity={0.9} shininess={170} /></mesh>
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.cos(rad) * 1.0, 2.18, Math.sin(rad) * 1.0]} rotation={[Math.PI / 5, rad, 0]}>
            <octahedronGeometry args={[0.22]} />
            <meshPhongMaterial color={i % 2 === 0 ? pal.mid : pal.light} transparent opacity={0.72} shininess={110} />
          </mesh>
        );
      })}
    </group>
  );
}

// Conversational — wide oak: thick trunk, 3 branches, dense canopy
function OakTree({ s, pal }: { s: number; pal: Pal }) {
  return (
    <group scale={s}>
      <mesh position={[0, 0.09, 0]} scale={[2.4, 0.12, 2.4]}>
        <sphereGeometry args={[0.32, 8, 5]} /><meshLambertMaterial color="#6B3A1F" />
      </mesh>
      <mesh position={[0, 0.98, 0]}><cylinderGeometry args={[0.2, 0.36, 1.95, 8]} /><meshLambertMaterial color="#6B3A1F" /></mesh>
      <mesh position={[-0.85, 1.88, 0]} rotation={[0, 0, 0.62]}>
        <cylinderGeometry args={[0.07, 0.12, 1.05, 6]} /><meshLambertMaterial color="#6B3A1F" />
      </mesh>
      <mesh position={[0.85, 1.88, 0]} rotation={[0, 0, -0.62]}>
        <cylinderGeometry args={[0.07, 0.12, 1.05, 6]} /><meshLambertMaterial color="#6B3A1F" />
      </mesh>
      <mesh position={[0, 1.88, -0.76]} rotation={[0.62, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 1.05, 6]} /><meshLambertMaterial color="#6B3A1F" />
      </mesh>
      <mesh position={[-1.52, 2.68, 0]}><sphereGeometry args={[0.82, 12, 12]} /><meshLambertMaterial color={pal.dark} /></mesh>
      <mesh position={[1.52, 2.68, 0]}><sphereGeometry args={[0.82, 12, 12]} /><meshLambertMaterial color={pal.dark} /></mesh>
      <mesh position={[0, 2.68, -1.42]}><sphereGeometry args={[0.76, 12, 12]} /><meshLambertMaterial color={pal.mid} /></mesh>
      <mesh position={[0, 2.98, 0]} scale={[2.12, 1.06, 1.88]}>
        <sphereGeometry args={[1.0, 14, 14]} /><meshLambertMaterial color={pal.mid} />
      </mesh>
      <mesh position={[0.22, 3.95, 0.15]}><sphereGeometry args={[0.56, 10, 10]} /><meshLambertMaterial color={pal.light} /></mesh>
      <mesh position={[-0.18, 4.45, -0.1]}><sphereGeometry args={[0.3, 8, 8]} /><meshLambertMaterial color={pal.light} /></mesh>
    </group>
  );
}

// Mixed / Unsure — giant tulip flower: green stem, leaf blades, 6 petals, golden center
function WildTree({ s, pal, id }: { s: number; pal: Pal; id: string }) {
  const r = (seed: number) => stableHash(id, seed);
  const lean = r(7) * 0.09 - 0.045;
  return (
    <group scale={s}>
      {/* Green stem */}
      <mesh position={[lean * 8, 1.65, 0]} rotation={[0, 0, lean]}>
        <cylinderGeometry args={[0.07, 0.11, 3.3, 6]} /><meshLambertMaterial color="#3D7A1E" />
      </mesh>
      {/* Leaf 1 — flat elongated blade curving left */}
      <mesh position={[-0.52, 0.9, 0]} rotation={[0.12, 0, 0.55]} scale={[0.2, 0.8, 0.34]}>
        <sphereGeometry args={[1, 8, 6]} /><meshLambertMaterial color="#4A9020" />
      </mesh>
      {/* Leaf 2 — flat blade curving right */}
      <mesh position={[0.5, 1.22, 0.2]} rotation={[-0.06, 0.28, -0.5]} scale={[0.18, 0.72, 0.3]}>
        <sphereGeometry args={[1, 8, 6]} /><meshLambertMaterial color="#5CAB2A" />
      </mesh>
      {/* 6 petals — elongated spheres, fanned outward, all pink */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const tilt = 0.3 + r(i + 20) * 0.2;
        return (
          <mesh
            key={i}
            position={[Math.cos(rad) * 0.38, 3.3, Math.sin(rad) * 0.38]}
            rotation={[tilt, rad + Math.PI / 12, 0]}
            scale={[0.26, 0.78, 0.32]}
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshLambertMaterial color="#F472B6" />
          </mesh>
        );
      })}
      {/* Flower center */}
      <mesh position={[0, 3.52, 0]}>
        <sphereGeometry args={[0.24, 10, 10]} /><meshLambertMaterial color="#FDF2F8" />
      </mesh>
      {/* Gold stamen dot */}
      <mesh position={[0, 3.72, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} /><meshLambertMaterial color="#FFD700" />
      </mesh>
    </group>
  );
}

// ── Tooltip ──────────────────────────────────────────────────────────────────
function TooltipCard({ sticky, pal }: { sticky: Sticky; pal: Pal }) {
  return (
    <div style={{
      background: 'white', padding: '9px 13px 10px', borderRadius: '11px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)', fontSize: '12px',
      whiteSpace: 'nowrap', pointerEvents: 'none', borderTop: `4px solid ${pal.dark}`, minWidth: '160px',
    }}>
      <div style={{ fontWeight: 700, color: '#1a1a1a', marginBottom: '3px', fontSize: '12.5px' }}>
        {sticky.authorName}{sticky.profession ? `, ${sticky.profession}` : ''}
      </div>
      <div style={{ color: '#555', marginBottom: '4px', lineHeight: 1.35 }}>
        {sticky.useCase.length > 36 ? sticky.useCase.slice(0, 36) + '…' : sticky.useCase}
      </div>
      <div style={{ color: pal.dark, fontWeight: 600, fontSize: '11px' }}>
        {pal.label} · {sticky.comments.length} comment{sticky.comments.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ── Tree wrapper (hover + click) ─────────────────────────────────────────────
function Tree({ sticky, position, growthScale, onSelect }: {
  sticky: Sticky; position: [number, number, number]; growthScale: number; onSelect: (s: Sticky) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const pal = PALETTES[sticky.aiType] ?? PALETTES['unsure'];
  const s = growthScale * (hovered ? 1.08 : 1);

  return (
    <group
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(sticky); }}
    >
      {sticky.aiType === 'predictive'     && <PineTree    s={s} pal={pal} />}
      {sticky.aiType === 'generative'     && <RoundTree   s={s} pal={pal} />}
      {sticky.aiType === 'automation'     && <CrystalTree s={s} pal={pal} />}
      {sticky.aiType === 'conversational' && <OakTree     s={s} pal={pal} />}
      {(sticky.aiType === 'unsure' || !(sticky.aiType in PALETTES)) && <WildTree s={s} pal={pal} id={sticky.id} />}

      {hovered && (
        <Html position={[0, growthScale * 5.2 + 0.8, 0]} center distanceFactor={12} zIndexRange={[100, 0]}>
          <TooltipCard sticky={sticky} pal={pal} />
        </Html>
      )}
    </group>
  );
}

// ── Enchanting Landscape ──────────────────────────────────────────────────────
// One solid color per instanced mesh — avoids vertexColors/instanceColor timing bugs in R3F.
// Setup runs inside useFrame (guaranteed to fire before the first render, ref always valid).

function GrassBatch({ seed, color, count, scaleMin, scaleMax }: {
  seed: number; color: string; count: number; scaleMin: number; scaleMax: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const d = useRef(new THREE.Object3D());
  const blades = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      x:     (stableHash(`${seed}x${i}`, seed)     - 0.5) * 80,
      z:     (stableHash(`${seed}z${i}`, seed + 1) - 0.5) * 60,
      ry:     stableHash(`${seed}r${i}`, seed + 2)  * Math.PI * 2,
      lean:  (stableHash(`${seed}l${i}`, seed + 3) - 0.5) * 0.44,
      h:      scaleMin + stableHash(`${seed}h${i}`, seed + 4) * (scaleMax - scaleMin),
      phase:  stableHash(`${seed}p${i}`, seed + 5)  * Math.PI * 2,
    })), []
  );

  // Animation runs every frame — first frame also acts as setup
  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    const obj = d.current;
    for (let i = 0; i < blades.length; i++) {
      const b = blades[i];
      const sway = Math.sin(t + b.phase) * 0.065;
      obj.position.set(b.x, b.h * 0.5, b.z);
      obj.rotation.set(b.lean + sway, b.ry, sway * 0.45);
      obj.scale.set(1, b.h, 1);
      obj.updateMatrix();
      mesh.setMatrixAt(i, obj.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <coneGeometry args={[0.058, 1, 3]} />
      <meshLambertMaterial color={color} />
    </instancedMesh>
  );
}


function Landscape() {
  return (
    <>
      {/* Single seamless ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[220, 160]} />
        <meshLambertMaterial color="#4A9C38" />
      </mesh>

      {/* 4 shades of animated grass — spread across full ground plane */}
      <GrassBatch seed={10} color="#2A7A18" count={300} scaleMin={0.12} scaleMax={0.26} />
      <GrassBatch seed={20} color="#4A9C38" count={320} scaleMin={0.16} scaleMax={0.38} />
      <GrassBatch seed={30} color="#5BAA42" count={300} scaleMin={0.14} scaleMax={0.32} />
      <GrassBatch seed={40} color="#7CC862" count={280} scaleMin={0.10} scaleMax={0.22} />

      {/* Distant rolling hills */}
      <mesh position={[-24, -5.5, -25]}><sphereGeometry args={[15, 20, 20]} /><meshLambertMaterial color="#4A9C38" /></mesh>
      <mesh position={[5, -7, -30]}><sphereGeometry args={[20, 20, 20]} /><meshLambertMaterial color="#3D8B2E" /></mesh>
      <mesh position={[28, -6, -24]}><sphereGeometry args={[14, 20, 20]} /><meshLambertMaterial color="#4A9C38" /></mesh>
      <mesh position={[-8, -8, -34]}><sphereGeometry args={[18, 20, 20]} /><meshLambertMaterial color="#5BAA42" /></mesh>
    </>
  );
}

// ── Layout helpers ────────────────────────────────────────────────────────────
function computePositions(stickies: Sticky[]): [number, number, number][] {
  const n = stickies.length;
  if (n === 0) return [];
  const spread = Math.min(n * 3.0, 40);
  return stickies.map((s, i) => {
    const baseX = n === 1 ? 0 : ((i / (n - 1)) - 0.5) * spread;
    return [baseX + (stableHash(s.id, 3) - 0.5) * 2.8, 0, (stableHash(s.id, 5) - 0.5) * 5.0];
  });
}

// ── Exported scene ────────────────────────────────────────────────────────────
export interface ForestScene3DProps {
  stickies: Sticky[];
  sliderIdx: number;
  onSelect: (s: Sticky) => void;
}

export default function ForestScene3D({ stickies, sliderIdx, onSelect }: ForestScene3DProps) {
  const positions = useMemo(() => computePositions(stickies), [stickies]);

  function growthScale(idx: number): number {
    if (sliderIdx <= 1) return 0.6;
    return 0.28 + Math.min((sliderIdx - idx) / Math.max(sliderIdx - 1, 1), 1) * 0.72;
  }

  return (
    <Canvas camera={{ position: [0, 11, 26], fov: 52 }} style={{ width: '100%', height: '100%', display: 'block' }}>
      {/* Soft lavender sky — dreamy, not harsh blue */}
      <color attach="background" args={['#EDE0FF']} />
      {/* Fog matches sky so distant hills dissolve magically */}
      <fog attach="fog" args={['#EDE0FF', 34, 72]} />

      {/* Very high ambient — fills shadows softly, everything glows */}
      <ambientLight intensity={2.4} color="#FFF8F4" />
      {/* Warm golden sun from upper right — golden hour warmth */}
      <directionalLight position={[14, 24, 10]} intensity={1.3} color="#FFD98A" />
      {/* Soft pink/lavender fill from left — magical accent */}
      <directionalLight position={[-10, 12, -4]} intensity={0.9} color="#E8C4FF" />
      {/* Subtle purple backlight for depth */}
      <directionalLight position={[0, 5, -22]} intensity={0.45} color="#BBA8FF" />
      {/* Hemisphere: warm golden sky → lush green ground */}
      <hemisphereLight args={['#FFE8C8', '#8ED870', 1.2]} />

      <Landscape />

      {stickies.map((sticky, i) => (
        <Tree key={sticky.id} sticky={sticky} position={positions[i] ?? [0, 0, 0]} growthScale={growthScale(i)} onSelect={onSelect} />
      ))}

      <OrbitControls minPolarAngle={Math.PI / 10} maxPolarAngle={Math.PI / 2.3} minDistance={8} maxDistance={55} enablePan={false} dampingFactor={0.08} enableDamping />
    </Canvas>
  );
}
