/**
 * ldrawLoader.ts
 *
 * LDraw coordinate system → Three.js / app coordinate system:
 *   1 LDU = 0.4 mm  |  1 stud = 20 LDU = 8 mm = 1 Three.js unit
 *   LDraw +Y is DOWN  →  rotate π around X to flip
 *   Brick height = 24 LDU = 1.2 Three.js units (3 plates × 0.4)
 *
 * After scale(1/20) + rotateX(π):
 *   LDraw origin (top of part) → Three.js y = 0
 *   Brick bottom (y = 24 LDU)  → Three.js y = −1.2
 * Add LDRAW_Y_OFFSET (+1.2) so the bottom sits on the baseplate (y = 0).
 */

import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/examples/jsm/materials/LDrawConditionalLineMaterial.js';
import type { Group } from 'three';

/** Local base path for the main part file (e.g. 3001.dat served from public/). */
export const LDRAW_BASE_PATH = '/ldraw/';

/** Scale factor: 20 LDU = 1 stud = 1 Three.js unit. */
export const LDRAW_SCALE = 1 / 20;

/** Y-offset so the brick bottom aligns with y = 0 (the baseplate). */
export const LDRAW_Y_OFFSET = 24 * LDRAW_SCALE; // 1.2

/**
 * Returns a configured LDrawLoader.
 * 3001.dat is fully self-contained (no subpart refs), so partsLibraryPath
 * only matters for future parts that reference external subparts.
 */
export function createLDrawLoader(): LDrawLoader {
  const loader = new LDrawLoader();
  loader.setPartsLibraryPath(LDRAW_BASE_PATH);
  loader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
  loader.smoothNormals = true;

  console.log('[ldrawLoader] createLDrawLoader:',
    'partsLibraryPath =', loader.partsLibraryPath,
    '| smoothNormals =', loader.smoothNormals);

  return loader;
}

/**
 * Promise-based helper (for non-R3F usage).
 * Returns a raw THREE.Group with NO transforms applied.
 * Use LDRAW_SCALE + LDRAW_Y_OFFSET when placing in the scene.
 *
 * @param partNumber  e.g. "3001" → loads /ldraw/parts/3001.dat
 */
export async function loadLDrawPart(partNumber: string): Promise<Group> {
  const url = `${LDRAW_BASE_PATH}parts/${partNumber}.dat`;

  // Sanity-check: verify the file is reachable before handing to LDrawLoader
  console.log('[ldrawLoader] loadLDrawPart: fetching', url);
  const check = await fetch(url, { method: 'HEAD' });
  if (!check.ok) {
    throw new Error(
      `[ldrawLoader] ${url} returned HTTP ${check.status}. ` +
      `Make sure the file is in public/ldraw/parts/${partNumber}.dat`,
    );
  }
  console.log('[ldrawLoader] HEAD check OK:', check.status);

  const loader = createLDrawLoader();
  return new Promise<Group>((resolve, reject) => {
    loader.load(url, resolve, undefined, (err) => {
      reject(err instanceof Error ? err : new Error(String(err)));
    });
  });
}
