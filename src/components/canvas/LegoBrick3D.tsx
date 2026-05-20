import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlacedBrick } from './types';
import { PLATE_H } from './types';

const STUD_R = 0.28;
const STUD_H = 0.18;   // taller for better LEGO look
const STUD_SEG = 16;   // smoother cylinder
const GAP = 0.06;
const DRAG_THRESHOLD_SQ = 49; // 7px

// ── Slope geometry builder ────────────────────────────────────────────────────
// A slope brick is a triangular prism (wedge):
//   back edge is at full height h, front edge is at y=0.
// For inverted slopes the high end is at the front.
function buildSlopeGeo(bW: number, bD: number, h: number, inverted: boolean): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const hw = bW / 2;
  const hd = bD / 2;
  // f = front z (low end), b = back z (high end)
  const f = inverted ? -hd : hd;
  const bk = inverted ? hd : -hd;

  // All triangles, CCW from outside (verified by cross-product).
  // Positions array: 8 triangles × 3 vertices × 3 coords = 72 floats
  const pos = new Float32Array([
    // ── Bottom face (normal −Y) ──
    -hw, 0,  f,  -hw, 0, bk,   hw, 0, bk,
    -hw, 0,  f,   hw, 0, bk,   hw, 0,  f,
    // ── Back vertical wall (normal towards bk) ──
    -hw, 0, bk,  -hw, h, bk,   hw, h, bk,
    -hw, 0, bk,   hw, h, bk,   hw, 0, bk,
    // ── Slope face (normal ±Y ∓Z) ──
    -hw, 0,  f,   hw, 0,  f,   hw, h, bk,
    -hw, 0,  f,   hw, h, bk,  -hw, h, bk,
    // ── Left triangle (normal −X) ──
    -hw, 0,  f,  -hw, h, bk,  -hw, 0, bk,
    // ── Right triangle (normal +X) ──
     hw, 0,  f,   hw, 0, bk,   hw, h, bk,
  ]);

  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}

/** True when the part name indicates a 45° slope (regular or inverted). */
function isSlopePart(partName: string): boolean {
  return (
    (/SLOPE/i.test(partName) || (/ROOF\s*TILE/i.test(partName) && /45/i.test(partName))) &&
    !/CORN\./i.test(partName)  // skip complex corner pieces
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  brick: PlacedBrick;
  selected: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onDragStart?: (brick: PlacedBrick) => void;
  isDragging?: boolean;
}

export function LegoBrick3D({ brick, selected, onSelect, onDragStart, isDragging = false }: Props) {
  const { w, d, h, position, colorHex, rotY, partName, shapeType } = brick;
  const glowRef = useRef<THREE.Mesh>(null!);
  const pointerDownXY = useRef<[number, number] | null>(null);
  const didDrag = useRef(false);

  const isSlope    = isSlopePart(partName);
  const isInverted = isSlope && /INV/i.test(partName);

  // Render-time scale: convert plate-unit h and Y position to Three.js units
  const renderH    = h * PLATE_H;
  const renderPosY = position[1] * PLATE_H;

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = selected ? 0.25 + 0.15 * Math.sin(clock.getElapsedTime() * 4) : 0;
    }
  });

  const brickW = w - GAP;
  const brickD = d - GAP;

  // Slope geometry (null for normal bricks)
  const slopeGeo = useMemo(
    () => (isSlope ? buildSlopeGeo(brickW, brickD, renderH, isInverted) : null),
    [isSlope, isInverted, brickW, brickD, renderH],
  );

  // Studs — omitted for slopes, gears, and custom (motor) parts
  const studs = useMemo(() => {
    if (isSlope || shapeType === 'gear' || shapeType === 'custom' || shapeType === 'cylinder') return [];
    const list: [number, number][] = [];
    for (let xi = 0; xi < w; xi++) {
      for (let zi = 0; zi < d; zi++) {
        list.push([xi - (w - 1) / 2, zi - (d - 1) / 2]);
      }
    }
    return list;
  }, [w, d, isSlope]);

  // ── Pointer handlers ────────────────────────────────────────────────────────

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    didDrag.current = false;
    pointerDownXY.current = [e.nativeEvent.clientX, e.nativeEvent.clientY];
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!pointerDownXY.current || didDrag.current) return;
    const dx = e.nativeEvent.clientX - pointerDownXY.current[0];
    const dy = e.nativeEvent.clientY - pointerDownXY.current[1];
    if (dx * dx + dy * dy > DRAG_THRESHOLD_SQ) {
      didDrag.current = true;
      pointerDownXY.current = null;
      onDragStart?.(brick);
    }
  };

  const handlePointerUp = () => {
    pointerDownXY.current = null;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (didDrag.current) { didDrag.current = false; return; }
    onSelect(brick.id, e.nativeEvent.shiftKey);
  };

  if (isDragging) return null;

  return (
    <group
      position={[position[0], renderPosY, position[2]]}
      rotation={[0, rotY * (Math.PI / 2), 0]}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* ── Body ────────────────────────────────────────────────────────── */}
      {shapeType === 'gear' ? (
        // Technic gear — thin cylinder disc, metallic finish
        <mesh castShadow receiveShadow position={[0, renderH / 2, 0]}>
          <cylinderGeometry args={[Math.min(brickW, brickD) / 2, Math.min(brickW, brickD) / 2, renderH, 24]} />
          <meshStandardMaterial color={colorHex} roughness={0.2} metalness={0.55} />
        </mesh>
      ) : shapeType === 'cylinder' ? (
        // Generic cylinder part
        <mesh castShadow receiveShadow position={[0, renderH / 2, 0]}>
          <cylinderGeometry args={[Math.min(brickW, brickD) / 2, Math.min(brickW, brickD) / 2, renderH, 16]} />
          <meshStandardMaterial color={colorHex} roughness={0.45} metalness={0.05} />
        </mesh>
      ) : isSlope && slopeGeo ? (
        <mesh castShadow receiveShadow geometry={slopeGeo}>
          <meshStandardMaterial
            color={colorHex}
            roughness={0.45}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : (
        // Default box — covers 'box', 'custom' (motor fallback), and undefined
        <mesh castShadow receiveShadow position={[0, renderH / 2, 0]}>
          <boxGeometry args={[brickW, renderH, brickD]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={shapeType === 'custom' ? 0.3 : 0.45}
            metalness={shapeType === 'custom' ? 0.35 : 0.05}
          />
        </mesh>
      )}

      {/* ── Studs (regular bricks only) ─────────────────────────────────── */}
      {studs.map(([sx, sz]) => (
        <mesh key={`${sx}-${sz}`} castShadow position={[sx, renderH + STUD_H / 2, sz]}>
          <cylinderGeometry args={[STUD_R, STUD_R, STUD_H, STUD_SEG]} />
          <meshStandardMaterial color={colorHex} roughness={0.28} metalness={0.06} />
        </mesh>
      ))}

      {/* ── Selection glow (always box-shaped for simplicity) ───────────── */}
      <mesh ref={glowRef} position={[0, renderH / 2, 0]}>
        <boxGeometry args={[brickW + 0.12, renderH + 0.12, brickD + 0.12]} />
        <meshBasicMaterial
          color="#facc15"
          transparent
          opacity={0}
          depthTest={false}
          side={THREE.BackSide}
        />
      </mesh>

      {selected && (
        <mesh position={[0, renderH / 2, 0]}>
          <boxGeometry args={[brickW + 0.05, renderH + 0.05, brickD + 0.05]} />
          <meshBasicMaterial color="#facc15" wireframe />
        </mesh>
      )}
    </group>
  );
}
