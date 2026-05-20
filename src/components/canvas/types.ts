import { PART_COLOR_HEX } from '../../data/colors';
import type { LegoPart } from '../../data/parts';

export type PartCategory = 'brick' | 'plate' | 'roof' | 'round' | 'frame' | 'special';

export function getCategory(partName: string): PartCategory {
  const n = partName.toUpperCase();
  if (n.includes('ROOF') || n.includes('SLOPE') || (n.includes('45') && !n.includes('ROUND'))) return 'roof';
  if (n.includes('ROUND') || n.includes('CYLINDER') || n.includes('CONE') || n.includes('DOME') || n.includes('SPHERE')) return 'round';
  if (n.includes('WINDOW') || n.includes('DOOR') || n.includes('FRAME') || n.includes('ARCH')) return 'frame';
  if (n.includes('PLATE') || n.includes('TILE') || n.includes('FLAT')) return 'plate';
  if (n.includes('BRICK')) return 'brick';
  return 'special';
}

export interface PlacedBrick {
  id: string;
  partId: number;
  partName: string;
  colorName: string;
  colorHex: string;
  w: number;   // studs wide (X)
  d: number;   // studs deep (Z)
  h: number;   // height (Y)
  position: [number, number, number];
  rotY: number; // 0-3  (steps of 90°)
}

export function parseDimensions(name: string): { w: number; d: number; h: number } {
  const m = name.match(/(\d+)\s*[Xx]\s*(\d+)/);
  if (m) {
    const a = Math.min(parseInt(m[1]), 8);
    const b = Math.min(parseInt(m[2]), 8);
    // ROOF TILE contains "TILE" but must not be treated as plate-height
    const isRoofOrSlope = /SLOPE|ROOF\s*TILE/i.test(name);
    const isFlat = !isRoofOrSlope && /PLATE|TILE|FLAT/i.test(name);
    return { w: a, d: b, h: isFlat ? 0.4 : 1.2 };
  }
  return { w: 1, d: 1, h: 1.2 };
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function brickFromPart(part: LegoPart, placedCount: number): PlacedBrick {
  const { w, d, h } = parseDimensions(part.partName);
  const col = placedCount % 6;
  const row = Math.floor(placedCount / 6);
  // Snap initial position to the correct stud subgrid for this brick's dimensions
  const ix = snapCenter(col * 3 - 8, w);
  const iz = snapCenter(row * 3 - 5, d);
  return {
    id: makeId(),
    partId: part.id,
    partName: part.partName,
    colorName: part.color,
    colorHex: PART_COLOR_HEX[part.color] ?? '#aaaaaa',
    w, d, h,
    position: [ix, 0, iz],
    rotY: 0,
  };
}

// ── Grid & Snap ──────────────────────────────────────────────────────────────

/**
 * Snaps a center coordinate to the correct LEGO stud subgrid.
 *   odd  stud count → integer center   (e.g. w=3 at 0  → studs at -1, 0, 1)
 *   even stud count → half-int center  (e.g. w=2 at 0.5 → studs at 0, 1)
 */
export function snapCenter(value: number, size: number): number {
  const offset = size % 2 === 0 ? 0.5 : 0;
  return Math.round(value - offset) + offset;
}

/** Effective XZ footprint of a brick after applying its rotation. */
function effDims(brick: Pick<PlacedBrick, 'w' | 'd' | 'rotY'>): { ew: number; ed: number } {
  const swapped = brick.rotY % 2 === 1;
  return { ew: swapped ? brick.d : brick.w, ed: swapped ? brick.w : brick.d };
}

/**
 * Returns the Y coordinate (bottom face) where `candidate` should snap when placed
 * at its current XZ position, given the other bricks already on the board.
 * • Returns 0 (baseplate) when nothing is underneath.
 * • Returns top-of-highest-overlapping-brick when something is underneath.
 */
export function findSnapY(
  candidate: Pick<PlacedBrick, 'id' | 'position' | 'w' | 'd' | 'rotY'>,
  others: PlacedBrick[],
): number {
  const { ew, ed } = effDims(candidate);
  const [cx, , cz] = candidate.position;

  let topY = 0; // default: rest on baseplate

  for (const b of others) {
    if (b.id === candidate.id) continue;
    const { ew: bew, ed: bed } = effDims(b);
    const [bx, by, bz] = b.position;

    // AABB overlap in XZ (epsilon avoids treating touching faces as overlap)
    const xOvlp = Math.abs(cx - bx) < (ew + bew) / 2 - 0.01;
    const zOvlp = Math.abs(cz - bz) < (ed + bed) / 2 - 0.01;

    if (xOvlp && zOvlp) {
      topY = Math.max(topY, by + b.h);
    }
  }

  return topY;
}
