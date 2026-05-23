/**
 * LDrawModel.tsx
 *
 * Three independent effects:
 *   1. partNumber → re-fetch from CDN; compute bbox → dynamic yOffset & actualH
 *   2. color      → traverse & mutate mesh materials in-place (no re-fetch)
 *
 * Dynamic yOffset derivation (raw LDraw space → Three.js):
 *   LDraw origin is at the TOPOF the part, Y+ = down.
 *   After rotation.x = π (flip Y) and scale = 1/20:
 *     body bottom sits at  y = −rawBbox.max.y * LDRAW_SCALE
 *   Adding yOff = rawBbox.max.y * LDRAW_SCALE places the bottom exactly at y = 0.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Group } from 'three';
import { getSharedLoader, LDRAW_SCALE, LDRAW_Y_OFFSET, buildPartUrl } from '../../utils/ldrawLoader';
import { PLATE_H } from './types';

export type LDrawStatus = 'idle' | 'loading' | 'done' | 'error';

interface Props {
  partNumber: string;
  position?: [number, number, number];
  color?: string;
  /** Called once after a successful load with the part's actual height in plate units. */
  onLoad?: (heightInPlates: number) => void;
  onStatus?: (s: LDrawStatus, detail?: string) => void;
}

interface LoadedPart {
  group: Group;
  /** Y translation needed to place the body bottom at y = 0 in parent space. */
  yOff: number;
}

function applyColorToGroup(group: Group, hex: string) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat) => {
      const m = mat as THREE.MeshStandardMaterial;
      if (m.color instanceof THREE.Color) m.color.set(hex);
    });
  });
}

export function LDrawModel({ partNumber, position = [0, 0, 0], color, onLoad, onStatus }: Props) {
  const [loaded, setLoaded] = useState<LoadedPart | null>(null);
  const groupRef = useRef<Group | null>(null);

  // ── Effect 1: fetch from CDN, compute bbox → yOff & actualH ─────────────────
  useEffect(() => {
    let cancelled = false;
    setLoaded(null);
    onStatus?.('loading');

    getSharedLoader().then((loader) => {
      if (cancelled) return;

      loader.load(
        buildPartUrl(partNumber),
        (group) => {
          if (cancelled) return;

          // Compute bbox in raw LDraw space (Y+ = down, no scale/rotation yet).
          const rawBbox = new THREE.Box3().setFromObject(group);

          // rawBbox.max.y = body depth in LDraw units (bottom of part, Y+ down).
          // After rotation.x = π + scale = 1/20, that point lands at:
          //   y_three = −rawBbox.max.y * LDRAW_SCALE
          // → add yOff to bring it to y = 0.
          const yOff = rawBbox.max.y > 0
            ? rawBbox.max.y * LDRAW_SCALE
            : LDRAW_Y_OFFSET; // fallback for empty/unexpected bbox

          // Height in plate units (body only — stud protrusion above y=0 excluded).
          const actualH = Math.max(1, Math.round(yOff / PLATE_H));

          groupRef.current = group;
          setLoaded({ group, yOff });
          onStatus?.('done');
          onLoad?.(actualH);
        },
        undefined,
        (err) => {
          if (cancelled) return;
          console.error('[LDrawModel] load error:', partNumber, err);
          onStatus?.('error', err instanceof Error ? err.message : String(err));
        },
      );
    });

    return () => {
      cancelled = true;
      if (groupRef.current?.parent) {
        groupRef.current.parent.remove(groupRef.current);
        groupRef.current = null;
      }
    };
  }, [partNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: re-apply color whenever model or color prop changes ─────────────
  useEffect(() => {
    if (loaded?.group && color) applyColorToGroup(loaded.group, color);
  }, [loaded, color]);

  if (!loaded) return null;

  return (
    <primitive
      object={loaded.group}
      scale={LDRAW_SCALE}
      rotation={[Math.PI, 0, 0]}
      position={[position[0], position[1] + loaded.yOff, position[2]]}
    />
  );
}
