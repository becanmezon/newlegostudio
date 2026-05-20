import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { LegoBrick3D } from './LegoBrick3D';
import { findSnapY, snapCenter } from './types';
import type { PlacedBrick } from './types';

const PLATE_SIZE = 32;
const GAP = 0.06;

interface Props {
  bricks: PlacedBrick[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, pos: [number, number, number]) => void;
}

interface DragState {
  id: string;
  brick: PlacedBrick;
}

// Handles DOM-level pointer events for smooth drag (fires even between meshes)
function DragController({
  isDragging,
  onDragMove,
  onDragEnd,
}: {
  isDragging: boolean;
  onDragMove: (pos: [number, number, number]) => void;
  onDragEnd: () => void;
}) {
  const { gl, camera } = useThree();
  const isDraggingRef = useRef(isDragging);
  isDraggingRef.current = isDragging;
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
      if (!isDraggingRef.current) return;
      const rect = canvas.getBoundingClientRect();
      ndc.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        // Pass raw position — handleDragMove applies snapCenter per brick dimensions
        onDragMoveRef.current([hit.x, 0, hit.z]);
      }
    };

    const handleUp = () => {
      if (isDraggingRef.current) onDragEndRef.current();
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

// Semi-transparent preview shown at snap position while dragging
function GhostBrick({ brick, position }: { brick: PlacedBrick; position: [number, number, number] }) {
  const { w, d, h, colorHex, rotY } = brick;
  const brickW = w - GAP;
  const brickD = d - GAP;
  return (
    <group position={position} rotation={[0, rotY * (Math.PI / 2), 0]}>
      {/* Transparent body */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[brickW, h, brickD]} />
        <meshStandardMaterial color={colorHex} transparent opacity={0.42} />
      </mesh>
      {/* Yellow snap wireframe */}
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[brickW + 0.1, h + 0.1, brickD + 0.1]} />
        <meshBasicMaterial color="#facc15" wireframe />
      </mesh>
      {/* Ground footprint shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[brickW, brickD]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

function Baseplate({
  selectedId,
  onMove,
  onDeselect,
  isDragging,
}: {
  selectedId: string | null;
  onMove: (id: string, pos: [number, number, number]) => void;
  onDeselect: () => void;
  isDragging: boolean;
}) {
  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (isDragging) return;
      if (selectedId) {
        // Pass raw point — moveBrick applies snapCenter based on the brick's dimensions
        onMove(selectedId, [e.point.x, 0, e.point.z]);
      } else {
        onDeselect();
      }
    },
    [selectedId, onMove, onDeselect, isDragging],
  );

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
        receiveShadow
        onClick={handleClick}
      >
        <planeGeometry args={[PLATE_SIZE, PLATE_SIZE]} />
        <meshStandardMaterial color="#22c55e" roughness={0.85} />
      </mesh>
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
    </>
  );
}

export function LegoCanvas({ bricks, selectedId, onSelect, onMove }: Props) {
  const orbitRef = useRef<OrbitControlsImpl>(null!);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [ghostPos, setGhostPos] = useState<[number, number, number]>([0, 0, 0]);

  const handleBrickDragStart = useCallback((brick: PlacedBrick) => {
    setDragState({ id: brick.id, brick });
    setGhostPos(brick.position);
    onSelect(brick.id);
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, [onSelect]);

  const handleDragMove = useCallback((rawPos: [number, number, number]) => {
    if (!dragState) return;
    const { brick } = dragState;
    // Effective dimensions after rotation (w/d swap at rotY 1 & 3)
    const rotated = brick.rotY % 2 === 1;
    const ew = rotated ? brick.d : brick.w;
    const ed = rotated ? brick.w : brick.d;
    const snapX = snapCenter(rawPos[0], ew);
    const snapZ = snapCenter(rawPos[2], ed);
    const others = bricks.filter((b) => b.id !== dragState.id);
    const snapY = findSnapY({ ...brick, position: [snapX, 0, snapZ] }, others);
    setGhostPos([snapX, snapY, snapZ]);
  }, [dragState, bricks]);

  const handleDragEnd = useCallback(() => {
    if (dragState) {
      onMove(dragState.id, ghostPos);
    }
    setDragState(null);
    if (orbitRef.current) orbitRef.current.enabled = true;
  }, [dragState, ghostPos, onMove]);

  return (
    <Canvas
      shadows
      camera={{ position: [14, 14, 14], fov: 42 }}
      onPointerMissed={() => { if (!dragState) onSelect(null); }}
      style={{ background: 'linear-gradient(to bottom, #bfdbfe, #dbeafe)' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[18, 24, 12]}
        intensity={0.85}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <hemisphereLight args={['#bfdbfe', '#bbf7d0', 0.3]} />

      <Baseplate
        selectedId={selectedId}
        onMove={onMove}
        onDeselect={() => onSelect(null)}
        isDragging={dragState !== null}
      />

      {bricks.map((brick) => (
        <LegoBrick3D
          key={brick.id}
          brick={brick}
          selected={brick.id === selectedId}
          onSelect={onSelect}
          onDragStart={handleBrickDragStart}
          isDragging={dragState?.id === brick.id}
        />
      ))}

      {dragState && <GhostBrick brick={dragState.brick} position={ghostPos} />}

      <DragController
        isDragging={dragState !== null}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      />

      <OrbitControls
        ref={orbitRef}
        makeDefault
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI / 2.1}
        enablePan
        panSpeed={0.6}
        zoomSpeed={0.8}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
