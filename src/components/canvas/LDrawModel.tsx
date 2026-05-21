/**
 * LDrawModel.tsx
 *
 * Loads and renders an LDraw .dat part file in the R3F scene.
 * Uses useEffect + useState (not useLoader) for explicit error handling.
 *
 * Coordinate transform (LDraw → Three.js / this app):
 *   scale      = 1/20   (20 LDU = 1 stud = 1 Three.js unit)
 *   rotation.x = π      (LDraw +Y-down → Three.js +Y-up)
 *   position.y += 1.2   (24 LDU × 1/20 = brick height, moves bottom to y=0)
 */

import { useEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import { createLDrawLoader, LDRAW_SCALE, LDRAW_Y_OFFSET } from '../../utils/ldrawLoader';

export type LDrawStatus = 'idle' | 'loading' | 'done' | 'error';

interface Props {
  /** Part number without extension, e.g. "3001". Loads /ldraw/parts/{n}.dat */
  partNumber: string;
  position?: [number, number, number];
  /** Called whenever the load status changes — use to update UI outside the canvas. */
  onStatus?: (s: LDrawStatus, detail?: string) => void;
}

export function LDrawModel({ partNumber, position = [0, 0, 0], onStatus }: Props) {
  const [model, setModel] = useState<Group | null>(null);
  const groupRef = useRef<Group | null>(null);

  useEffect(() => {
    let cancelled = false;
    setModel(null);
    onStatus?.('loading');

    const url = `/ldraw/parts/${partNumber}.dat`;
    console.log('[LDrawModel] ▶ loading:', url);

    const loader = createLDrawLoader();

    loader.load(
      url,
      (group) => {
        if (cancelled) { console.log('[LDrawModel] cancelled, discarding result'); return; }

        // Audit the loaded group
        let meshCount = 0, lineCount = 0;
        group.traverse((obj) => {
          if (obj.type === 'Mesh') meshCount++;
          if (obj.type === 'LineSegments' || obj.type === 'Line') lineCount++;
        });
        console.log('[LDrawModel] ✅ loaded:', partNumber);
        console.log('  group.children:', group.children.length);
        console.log('  meshes:', meshCount, '  lines:', lineCount);
        console.log('  bbox (before transform):',
          (() => { const b = new (group.constructor as typeof Group)(); return b; })());

        if (meshCount === 0 && lineCount === 0) {
          console.warn('[LDrawModel] ⚠ No geometry found — subpart may have failed to load.');
          console.warn('  Make sure public/ldraw/parts/s/3001s01.dat exists and is accessible.');
        }

        groupRef.current = group;
        setModel(group);
        onStatus?.('done');
      },
      (progress) => {
        if (progress.total > 0) {
          console.log(`[LDrawModel] ⏳ ${progress.loaded}/${progress.total} bytes`);
        }
      },
      (err) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[LDrawModel] ❌ load error:', msg);
        onStatus?.('error', msg);
      },
    );

    return () => {
      cancelled = true;
      // Remove from scene on unmount to avoid orphaned Three.js objects
      if (groupRef.current?.parent) {
        groupRef.current.parent.remove(groupRef.current);
      }
    };
  }, [partNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!model) return null;

  return (
    <primitive
      object={model}
      scale={LDRAW_SCALE}
      rotation={[Math.PI, 0, 0]}
      position={[position[0], position[1] + LDRAW_Y_OFFSET, position[2]]}
    />
  );
}
