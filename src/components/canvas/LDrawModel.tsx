/**
 * LDrawModel.tsx
 *
 * Two independent effects:
 *   1. partNumber changes → re-fetch from CDN (shows spinner, then model)
 *   2. color changes      → traverse & mutate materials in-place (no re-fetch)
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Group } from 'three';
import { getSharedLoader, LDRAW_SCALE, LDRAW_Y_OFFSET, buildPartUrl } from '../../utils/ldrawLoader';

export type LDrawStatus = 'idle' | 'loading' | 'done' | 'error';

interface Props {
  partNumber: string;
  position?: [number, number, number];
  yOffset?: number;
  /** Hex color applied to all face meshes; edge/line materials keep their LDraw color. */
  color?: string;
  onStatus?: (s: LDrawStatus, detail?: string) => void;
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

export function LDrawModel({
  partNumber,
  position = [0, 0, 0],
  yOffset,
  color,
  onStatus,
}: Props) {
  const [model, setModel] = useState<Group | null>(null);
  const groupRef = useRef<Group | null>(null);

  // ── Effect 1: load from CDN when partNumber changes ───────────────────────
  useEffect(() => {
    let cancelled = false;
    setModel(null);
    onStatus?.('loading');

    getSharedLoader().then((loader) => {
      if (cancelled) return;
      loader.load(
        buildPartUrl(partNumber),
        (group) => {
          if (cancelled) return;
          groupRef.current = group;
          setModel(group);
          onStatus?.('done');
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

  // ── Effect 2: re-apply color whenever model or color prop changes ─────────
  useEffect(() => {
    if (model && color) applyColorToGroup(model, color);
  }, [model, color]);

  if (!model) return null;

  return (
    <primitive
      object={model}
      scale={LDRAW_SCALE}
      rotation={[Math.PI, 0, 0]}
      position={[position[0], position[1] + (yOffset ?? LDRAW_Y_OFFSET), position[2]]}
    />
  );
}
