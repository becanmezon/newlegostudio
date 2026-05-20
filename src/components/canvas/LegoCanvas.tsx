import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { LegoBrick3D } from './LegoBrick3D';
import { findSnapY, snapCenter, PLATE_H } from './types';
import type { PlacedBrick } from './types';

const PLATE_SIZE = 32;
const GAP = 0.06;

// Baseplate stud constants
const BP_STUD_R   = 0.24;
const BP_STUD_H   = 0.10;
const BP_STUD_SEG = 12;

// Drag distance (px²) before a baseplate press becomes a marquee drag
const MARQUEE_THRESHOLD_SQ = 25; // 5 px

interface Props {
  bricks: PlacedBrick[];
  selectedIds: string[];
  onSelect: (id: string, additive: boolean) => void;
  onSelectMany: (ids: string[]) => void;
  onDeselect: () => void;
  onMove: (id: string, pos: [number, number, number]) => void;
  onMoveBricks: (moves: { id: string; pos: [number, number, number] }[]) => void;
}

interface CompanionDrag {
  id: string;
  brick: PlacedBrick;
  dx: number;
  dz: number;
}

interface DragState {
  id: string;
  brick: PlacedBrick;
  companions: CompanionDrag[];
}

// ── Compute screen-space AABB intersection for marquee selection ──────────────
// Projects all 8 world-space corners of each brick onto the screen and checks
// whether the resulting screen rectangle overlaps the marquee rectangle.
// This gives "partial touch" semantics instead of centre-point containment.
function computeMarqueeSelection(
  start: { x: number; y: number },
  end: { x: number; y: number },
  bricks: PlacedBrick[],
  camera: THREE.Camera,
  canvasRect: DOMRect,
): string[] {
  const mMinX = Math.min(start.x, end.x);
  const mMaxX = Math.max(start.x, end.x);
  const mMinY = Math.min(start.y, end.y);
  const mMaxY = Math.max(start.y, end.y);

  // Reject degenerate rectangles (accidental tiny drag)
  if (mMaxX - mMinX < 3 && mMaxY - mMinY < 3) return [];

  const v = new THREE.Vector3();

  return bricks
    .filter(brick => {
      const rotated = brick.rotY % 2 === 1;
      const halfW = (rotated ? brick.d : brick.w) / 2;
      const halfD = (rotated ? brick.w : brick.d) / 2;
      const baseY = brick.position[1] * PLATE_H;
      const topY  = baseY + brick.h * PLATE_H;
      const bx = brick.position[0];
      const bz = brick.position[2];

      // 8 world-space corners
      const corners: [number, number, number][] = [
        [bx - halfW, baseY, bz - halfD],
        [bx + halfW, baseY, bz - halfD],
        [bx - halfW, baseY, bz + halfD],
        [bx + halfW, baseY, bz + halfD],
        [bx - halfW, topY,  bz - halfD],
        [bx + halfW, topY,  bz - halfD],
        [bx - halfW, topY,  bz + halfD],
        [bx + halfW, topY,  bz + halfD],
      ];

      // Screen-space AABB of all 8 projected corners
      let sMinX = Infinity, sMaxX = -Infinity;
      let sMinY = Infinity, sMaxY = -Infinity;
      for (const [cx, cy, cz] of corners) {
        v.set(cx, cy, cz).project(camera);
        const sx = ((v.x + 1) / 2) * canvasRect.width  + canvasRect.left;
        const sy = (-(v.y - 1) / 2) * canvasRect.height + canvasRect.top;
        if (sx < sMinX) sMinX = sx;
        if (sx > sMaxX) sMaxX = sx;
        if (sy < sMinY) sMinY = sy;
        if (sy > sMaxY) sMaxY = sy;
      }

      // Intersects marquee rect?
      return sMaxX >= mMinX && sMinX <= mMaxX && sMaxY >= mMinY && sMinY <= mMaxY;
    })
    .map(b => b.id);
}

// ── DragController: DOM-level pointer events for brick dragging ───────────────
function DragController({
  enabled,
  onDragMove,
  onDragEnd,
}: {
  enabled: boolean;
  onDragMove: (pos: [number, number, number]) => void;
  onDragEnd: () => void;
}) {
  const { gl, camera } = useThree();
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onDragMoveRef = useRef(onDragMove);
  onDragMoveRef.current = onDragMove;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  useEffect(() => {
    const canvas = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const hit = new THREE.Vector3();

    const handleMove = (e: PointerEvent) => {
      if (!enabledRef.current) return;
      const rect = canvas.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) onDragMoveRef.current([hit.x, 0, hit.z]);
    };
    const handleUp = () => {
      if (enabledRef.current) onDragEndRef.current();
    };

    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleUp);
    return () => {
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleUp);
    };
  }, [gl, camera]);

  return null;
}

// ── MarqueeController: manages the full marquee lifecycle via DOM events ──────
// Receives a REF to the candidate start position (set synchronously on Baseplate
// pointerdown). Using a ref (not state) ensures the value is visible to the very
// first pointermove event without waiting for a React re-render cycle.
function MarqueeController({
  marqueeCandidateRef,
  bricks,
  onMarqueeStart,
  onMarqueeMove,
  onMarqueeEnd,
}: {
  marqueeCandidateRef: React.MutableRefObject<{ x: number; y: number } | null>;
  bricks: PlacedBrick[];
  onMarqueeStart: (x: number, y: number) => void;
  onMarqueeMove:  (x: number, y: number) => void;
  onMarqueeEnd:   (ids: string[]) => void;
}) {
  const { gl, camera } = useThree();
  const bricksRef = useRef(bricks);
  bricksRef.current = bricks;
  const isDraggingRef = useRef(false);

  // Stable callback refs — updated every render, never stale inside the effect
  const onStartRef = useRef(onMarqueeStart); onStartRef.current = onMarqueeStart;
  const onMoveRef  = useRef(onMarqueeMove);  onMoveRef.current  = onMarqueeMove;
  const onEndRef   = useRef(onMarqueeEnd);   onEndRef.current   = onMarqueeEnd;

  useEffect(() => {
    const canvas = gl.domElement;

    const handleMove = (e: PointerEvent) => {
      // Read directly from the ref — always up-to-date, no React re-render needed
      const candidate = marqueeCandidateRef.current;
      if (!candidate) return;

      if (!isDraggingRef.current) {
        const dx = e.clientX - candidate.x;
        const dy = e.clientY - candidate.y;
        if (dx * dx + dy * dy > MARQUEE_THRESHOLD_SQ) {
          isDraggingRef.current = true;
          onStartRef.current(candidate.x, candidate.y);
        }
      }
      if (isDraggingRef.current) {
        onMoveRef.current(e.clientX, e.clientY);
      }
    };

    const handleUp = (e: PointerEvent) => {
      if (e.button !== 0) return; // ignore right/middle button up
      const candidate = marqueeCandidateRef.current;
      if (!candidate) return;

      if (isDraggingRef.current) {
        const ids = computeMarqueeSelection(
          candidate,
          { x: e.clientX, y: e.clientY },
          bricksRef.current,
          camera,
          canvas.getBoundingClientRect(),
        );
        onEndRef.current(ids);
      }
      // Always clear on pointer-up — the baseplate onClick handles the deselect case
      isDraggingRef.current = false;
      marqueeCandidateRef.current = null;
    };

    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleUp);
    return () => {
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleUp);
    };
  }, [gl, camera, marqueeCandidateRef]);

  return null;
}

// ── GhostBrick: transparent preview while dragging ───────────────────────────
function GhostBrick({ brick, position }: { brick: PlacedBrick; position: [number, number, number] }) {
  const { w, d, h, colorHex, rotY } = brick;
  const brickW = w - GAP;
  const brickD = d - GAP;
  const renderH    = h * PLATE_H;
  const renderPosY = position[1] * PLATE_H;
  return (
    <group position={[position[0], renderPosY, position[2]]} rotation={[0, rotY * (Math.PI / 2), 0]}>
      <mesh position={[0, renderH / 2, 0]}>
        <boxGeometry args={[brickW, renderH, brickD]} />
        <meshStandardMaterial color={colorHex} transparent opacity={0.42} />
      </mesh>
      <mesh position={[0, renderH / 2, 0]}>
        <boxGeometry args={[brickW + 0.1, renderH + 0.1, brickD + 0.1]} />
        <meshBasicMaterial color="#facc15" wireframe />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[brickW, brickD]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

// ── BaseplateStuds: pure visual InstancedMesh — events handled by hit plane ──
function BaseplateStuds() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const count = PLATE_SIZE * PLATE_SIZE;

  const geo = useMemo(
    () => new THREE.CylinderGeometry(BP_STUD_R, BP_STUD_R, BP_STUD_H, BP_STUD_SEG),
    [],
  );
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.55, metalness: 0.05 }),
    [],
  );
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const studY = -0.06 + BP_STUD_H / 2;
    let idx = 0;
    for (let xi = 0; xi < PLATE_SIZE; xi++) {
      for (let zi = 0; zi < PLATE_SIZE; zi++) {
        dummy.position.set(
          xi - (PLATE_SIZE - 1) / 2,
          studY,
          zi - (PLATE_SIZE - 1) / 2,
        );
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(idx++, dummy.matrix);
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} receiveShadow />;
}

// ── Baseplate ─────────────────────────────────────────────────────────────────
// The transparent hit plane above the studs is the single interaction surface.
// Left drag (no pan-mode modifier) → potential marquee start.
// Click without drag → deselect.
// marqueeHappenedRef: prevents the post-drag onClick from clearing selection.
function Baseplate({
  onDeselect,
  isDragging,
  isPanModeRef,
  marqueeHappenedRef,
  onPotentialMarqueeStart,
}: {
  onDeselect: () => void;
  isDragging: boolean;
  isPanModeRef: React.MutableRefObject<boolean>;
  marqueeHappenedRef: React.MutableRefObject<boolean>;
  onPotentialMarqueeStart: (x: number, y: number) => void;
}) {
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (e.nativeEvent.button !== 0) return;          // only left button
    if (e.nativeEvent.shiftKey || isPanModeRef.current) return; // pan mode active
    e.stopPropagation();
    marqueeHappenedRef.current = false;
    onPotentialMarqueeStart(e.nativeEvent.clientX, e.nativeEvent.clientY);
  }, [isPanModeRef, marqueeHappenedRef, onPotentialMarqueeStart]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isDragging) return;
    // Suppress deselect when a marquee just finished (the drag also fires onClick)
    if (marqueeHappenedRef.current) {
      marqueeHappenedRef.current = false;
      return;
    }
    onDeselect();
  }, [onDeselect, isDragging, marqueeHappenedRef]);

  return (
    <>
      {/* Visual green plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[PLATE_SIZE, PLATE_SIZE]} />
        <meshStandardMaterial color="#22c55e" roughness={0.85} />
      </mesh>

      <BaseplateStuds />

      <Grid
        position={[0, -0.05, 0]}
        args={[PLATE_SIZE, PLATE_SIZE]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#16a34a"
        sectionSize={4}
        sectionThickness={0.8}
        sectionColor="#15803d"
        fadeDistance={36}
        infiniteGrid={false}
      />

      {/* Transparent interaction plane above studs — sole event receiver */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, BP_STUD_H - 0.06 + 0.02, 0]}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[PLATE_SIZE, PLATE_SIZE]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  );
}

// ── LegoCanvas (main) ─────────────────────────────────────────────────────────
export function LegoCanvas({ bricks, selectedIds, onSelect, onSelectMany, onDeselect, onMove, onMoveBricks }: Props) {
  const orbitRef      = useRef<OrbitControlsImpl>(null!);
  const containerRef  = useRef<HTMLDivElement>(null);
  const isPanModeRef  = useRef(false);           // true while Space/Shift is held
  const marqueeHappenedRef = useRef(false);      // suppresses post-drag onClick on baseplate

  // ── Brick drag state ────────────────────────────────────────────────────────
  const [dragState, setDragState] = useState<DragState | null>(null);
  const ghostPosRef   = useRef<[number, number, number]>([0, 0, 0]);
  const companionGhostsRef = useRef<{ id: string; pos: [number, number, number] }[]>([]);
  const [ghostPosDisplay, setGhostPosDisplay] = useState<[number, number, number]>([0, 0, 0]);
  const [companionGhostsDisplay, setCompanionGhostsDisplay] = useState<{ id: string; pos: [number, number, number] }[]>([]);

  // ── Marquee state ───────────────────────────────────────────────────────────
  // marqueeCandidateRef: written synchronously in Baseplate.onPointerDown so the
  // very first pointermove in MarqueeController already sees the start position —
  // no React re-render required. Using a ref here removes the async state delay
  // that caused "two-click to start" bug.
  const marqueeCandidateRef = useRef<{ x: number; y: number } | null>(null);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd,   setMarqueeEnd]   = useState<{ x: number; y: number } | null>(null);

  // Always-fresh refs
  const bricksRef      = useRef(bricks);     bricksRef.current      = bricks;
  const selectedIdsRef = useRef(selectedIds); selectedIdsRef.current = selectedIds;
  const dragStateRef   = useRef(dragState);   dragStateRef.current   = dragState;

  // ── Space / Shift → left-button pan mode ───────────────────────────────────
  useEffect(() => {
    const setLeft = (val: THREE.MOUSE | null) => {
      if (orbitRef.current)
        (orbitRef.current.mouseButtons as Record<string, unknown>).LEFT = val;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') e.preventDefault();
      const isPan = e.code === 'Space' || (e.key === 'Shift' && !e.ctrlKey && !e.metaKey);
      if (isPan) { isPanModeRef.current = true;  setLeft(THREE.MOUSE.PAN); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Shift') { isPanModeRef.current = false; setLeft(null); }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, []);

  // ── Brick drag callbacks ────────────────────────────────────────────────────
  const handleBrickDragStart = useCallback((brick: PlacedBrick) => {
    const curSelected = selectedIdsRef.current;
    const isSelected  = curSelected.includes(brick.id);

    const companions: CompanionDrag[] = isSelected
      ? bricksRef.current
          .filter(b => b.id !== brick.id && curSelected.includes(b.id))
          .map(b => ({ id: b.id, brick: b, dx: b.position[0] - brick.position[0], dz: b.position[2] - brick.position[2] }))
      : [];

    ghostPosRef.current = brick.position;
    companionGhostsRef.current = companions.map(c => ({ id: c.id, pos: c.brick.position }));
    setGhostPosDisplay(brick.position);
    setCompanionGhostsDisplay(companionGhostsRef.current);
    setDragState({ id: brick.id, brick, companions });

    if (!isSelected) onSelect(brick.id, false);
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, [onSelect]);

  const handleDragMove = useCallback((rawPos: [number, number, number]) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    const { brick, companions } = ds;
    const rotated = brick.rotY % 2 === 1;
    const ew = rotated ? brick.d : brick.w;
    const ed = rotated ? brick.w : brick.d;
    const snapX = snapCenter(rawPos[0], ew);
    const snapZ = snapCenter(rawPos[2], ed);
    const movingIds = [ds.id, ...companions.map(c => c.id)];
    const others = bricksRef.current.filter(b => !movingIds.includes(b.id));
    const snapY = findSnapY({ ...brick, position: [snapX, 0, snapZ] }, others);
    const newPos: [number, number, number] = [snapX, snapY, snapZ];
    ghostPosRef.current = newPos;
    setGhostPosDisplay(newPos);

    if (companions.length > 0) {
      const newComp = companions.map(c => {
        const cx = snapCenter(snapX + c.dx, c.brick.rotY % 2 === 1 ? c.brick.d : c.brick.w);
        const cz = snapCenter(snapZ + c.dz, c.brick.rotY % 2 === 1 ? c.brick.w : c.brick.d);
        const cy = findSnapY({ ...c.brick, position: [cx, 0, cz] }, others.filter(b => b.id !== c.id));
        return { id: c.id, pos: [cx, cy, cz] as [number, number, number] };
      });
      companionGhostsRef.current = newComp;
      setCompanionGhostsDisplay(newComp);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    const ds = dragStateRef.current;
    if (ds) {
      const gp = ghostPosRef.current;
      if (ds.companions.length === 0) {
        onMove(ds.id, gp);
      } else {
        onMoveBricks([
          { id: ds.id, pos: gp },
          ...companionGhostsRef.current.map(cg => ({ id: cg.id, pos: cg.pos })),
        ]);
      }
    }
    setDragState(null);
    setCompanionGhostsDisplay([]);
    if (orbitRef.current) orbitRef.current.enabled = true;
  }, [onMove, onMoveBricks]);

  // ── Marquee callbacks ───────────────────────────────────────────────────────
  // Called by Baseplate on pointer-down — writes synchronously to a ref so the
  // first pointermove in MarqueeController can read it without waiting for React.
  const handlePotentialMarqueeStart = useCallback((x: number, y: number) => {
    marqueeCandidateRef.current = { x, y };
  }, []);

  // Called by MarqueeController when drag threshold is exceeded
  const handleMarqueeStart = useCallback((x: number, y: number) => {
    setMarqueeStart({ x, y });
    setMarqueeEnd({ x, y });
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, []);

  const handleMarqueeMove = useCallback((x: number, y: number) => {
    setMarqueeEnd({ x, y });
  }, []);

  // Called by MarqueeController on pointer-up after a drag
  const handleMarqueeEnd = useCallback((ids: string[]) => {
    onSelectMany(ids);
    setMarqueeStart(null);
    setMarqueeEnd(null);
    marqueeHappenedRef.current = true; // suppress the follow-up onClick on baseplate
    if (orbitRef.current) orbitRef.current.enabled = true;
  }, [onSelectMany]);

  // ── Overlay rect ────────────────────────────────────────────────────────────
  const overlayStyle = (marqueeStart && marqueeEnd && containerRef.current)
    ? (() => {
        const r = containerRef.current!.getBoundingClientRect();
        return {
          left:   Math.min(marqueeStart.x, marqueeEnd.x) - r.left,
          top:    Math.min(marqueeStart.y, marqueeEnd.y) - r.top,
          width:  Math.abs(marqueeEnd.x - marqueeStart.x),
          height: Math.abs(marqueeEnd.y - marqueeStart.y),
        };
      })()
    : null;

  const draggingIds = dragState
    ? [dragState.id, ...dragState.companions.map(c => c.id)]
    : [];

  return (
    <div ref={containerRef} className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
      {/* Marquee selection rectangle overlay (only visible after threshold) */}
      {overlayStyle && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 10,
            left: overlayStyle.left,
            top:  overlayStyle.top,
            width:  overlayStyle.width,
            height: overlayStyle.height,
            border: '2px solid #3b82f6',
            background: 'rgba(59,130,246,0.12)',
            borderRadius: 2,
          }}
        />
      )}

      <Canvas
        shadows
        camera={{ position: [14, 14, 14], fov: 42 }}
        onPointerMissed={(e) => {
          if (e.button !== 0) return; // right/middle-click = orbit/pan, not deselect
          if (!dragState && !marqueeStart && !marqueeCandidateRef.current) onDeselect();
        }}
        style={{ background: 'linear-gradient(to bottom, #bfdbfe, #dbeafe)' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[18, 24, 12]}
          intensity={1.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-12, 8, -6]} intensity={0.28} />
        <hemisphereLight args={['#bfdbfe', '#bbf7d0', 0.35]} />

        <Baseplate
          onDeselect={onDeselect}
          isDragging={dragState !== null}
          isPanModeRef={isPanModeRef}
          marqueeHappenedRef={marqueeHappenedRef}
          onPotentialMarqueeStart={handlePotentialMarqueeStart}
        />

        {bricks.map((brick) => (
          <LegoBrick3D
            key={brick.id}
            brick={brick}
            selected={selectedIds.includes(brick.id)}
            onSelect={onSelect}
            onDragStart={handleBrickDragStart}
            isDragging={draggingIds.includes(brick.id)}
          />
        ))}

        {dragState && <GhostBrick brick={dragState.brick} position={ghostPosDisplay} />}
        {dragState && companionGhostsDisplay.map(cg => {
          const c = dragState.companions.find(x => x.id === cg.id);
          return c ? <GhostBrick key={cg.id} brick={c.brick} position={cg.pos} /> : null;
        })}

        <DragController
          enabled={dragState !== null}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />

        <MarqueeController
          marqueeCandidateRef={marqueeCandidateRef}
          bricks={bricks}
          onMarqueeStart={handleMarqueeStart}
          onMarqueeMove={handleMarqueeMove}
          onMarqueeEnd={handleMarqueeEnd}
        />

        <OrbitControls
          ref={orbitRef}
          makeDefault
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2.1}
          enablePan
          mouseButtons={{
            LEFT:   null as unknown as THREE.MOUSE, // reserved for marquee / brick pick
            MIDDLE: THREE.MOUSE.PAN,                // wheel-press = pan
            RIGHT:  THREE.MOUSE.ROTATE,             // right-drag  = orbit
          }}
          panSpeed={0.6}
          zoomSpeed={0.8}
          target={[0, 1, 0]}
        />
      </Canvas>
    </div>
  );
}
