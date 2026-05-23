/**
 * ldrawLoader.ts
 *
 * LDraw coordinate system → Three.js / app coordinate system:
 *   1 LDU = 0.4 mm  |  1 stud = 20 LDU = 8 mm = 1 Three.js unit
 *   LDraw +Y is DOWN  →  rotate π around X to flip
 *   Brick height = 24 LDU = 1.2 Three.js units (3 plates × 0.4)
 *
 * Parts are fetched from the gkjohnson/ldraw-parts-library CDN at runtime.
 * The shared loader is initialised once (materials preloaded), then reused for
 * all subsequent part loads so color definitions are resolved correctly.
 */

import { LDrawLoader } from 'three/examples/jsm/loaders/LDrawLoader.js';
import { LDrawConditionalLineMaterial } from 'three/examples/jsm/materials/LDrawConditionalLineMaterial.js';

/** CDN base — must end with a slash. */
export const CDN_BASE =
  'https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/complete/ldraw/';

/** LDraw color definitions (official LEGO palette). */
const CDN_COLORS =
  'https://raw.githubusercontent.com/gkjohnson/ldraw-parts-library/master/colors/ldcfgalt.ldr';

/** Scale factor: 20 LDU = 1 stud = 1 Three.js unit. */
export const LDRAW_SCALE = 1 / 20;

/** Y-offset so the brick bottom aligns with y = 0 (the baseplate).
 *  Equals 24 LDU × 1/20 = 1.2 for a standard brick. */
export const LDRAW_Y_OFFSET = 24 * LDRAW_SCALE;

/** Full CDN URL for a given part ID, e.g. "3001" → "…/parts/3001.dat". */
export function buildPartUrl(partId: string): string {
  return `${CDN_BASE}parts/${partId}.dat`;
}

// ── Singleton loader ──────────────────────────────────────────────────────────
// A single LDrawLoader instance is shared across all LDrawModel components.
// preloadMaterials() is called once so every subsequent load resolves color codes
// against the official LEGO palette without an extra network round-trip.

let _loaderReady: Promise<LDrawLoader> | null = null;

export function getSharedLoader(): Promise<LDrawLoader> {
  if (!_loaderReady) {
    const loader = new LDrawLoader();
    loader.setPartsLibraryPath(CDN_BASE);
    loader.setConditionalLineMaterial(LDrawConditionalLineMaterial);
    loader.smoothNormals = true;

    // preloadMaterials exists in three r137+ but is not yet in the .d.ts
    _loaderReady = (loader as unknown as { preloadMaterials(url: string): Promise<void> })
      .preloadMaterials(CDN_COLORS)
      .then(() => loader)
      .catch((err: unknown) => {
        // Material preload failure is non-fatal — parts still render with defaults.
        console.warn('[ldrawLoader] preloadMaterials failed (parts will use default colors):', err);
        _loaderReady = null; // allow a fresh attempt next time
        return loader;
      });
  }
  return _loaderReady;
}
