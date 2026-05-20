/**
 * claudeAPI.ts
 *
 * Calls the Anthropic Claude API with the 3D LEGO Geometric Configuration
 * Engine system prompt. Converts the response JSON (mm coordinates) into
 * PlacedBrick[] using the app's stud/plate-unit coordinate system.
 */

import { legoParts } from '../../data/parts';
import { PART_COLOR_HEX } from '../../data/colors';
import { makeId, snapCenter, findSnapY } from '../canvas/types';
import type { PlacedBrick } from '../canvas/types';

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `あなたは3Dレゴ（ブロック）モデリングにおける、高精度な幾何学配置エンジンです。
ユーザーの指示を解釈し、パーツ同士が完全に結合（スナップ）する正確な3D座標と回転角を算出して、指定されたJSONフォーマットのみを出力してください。

【座標系】
- X/Z軸: 1単位 = 1スタッド（ポッチ1個分）
- Y軸: 1単位 = 1プレート高さ（3.2mm）
  - ブロック（brick）の高さ = 3プレート単位
  - プレート（plate）の高さ = 1プレート単位

【使用できるパーツタイプ】
- "BRICK NxM" : N×Mスタッドのブロック（高さ3）
- "PLATE NxM" : N×Mスタッドのプレート（高さ1）
- "ROOF TILE NxM/45°" : 屋根スロープ

【配置ルール】
1. Y座標は底面の高さ（プレート単位）。地面は0。
2. X/Z座標はパーツ中心。スタッドグリッドに合わせること。
3. rotY: 0=そのまま、1=90°回転、2=180°、3=270°（整数のみ）
4. パーツ同士が重ならないこと。

【出力フォーマット】
思考プロセスや説明は一切出力せず、以下のJSON配列のみを返してください:
[
  {
    "type": "BRICK 2X4",
    "color": "Bright Red",
    "x": 0,
    "y": 0,
    "z": 0,
    "rotY": 0
  }
]

【使用できる色名（必ずこの中から選ぶ）】
Black, Dark Stone Grey, Medium Stone Grey, White, Bright Red, Bright Orange,
Bright Yellow, Bright Yellowish Green, Dark Green, Bright Blue, Medium Azur,
Bright Purple, Reddish Brown, Sand Yellow, Sand Blue, Dark Orange`;

// ── Type for Claude response items ────────────────────────────────────────────

interface RawBrick {
  type: string;
  color: string;
  x: number;
  y: number;
  z: number;
  rotY?: number;
}

// ── Color name normalizer ─────────────────────────────────────────────────────

const COLOR_ALIASES: Record<string, string> = {
  red: 'Bright Red',
  orange: 'Bright Orange',
  yellow: 'Bright Yellow',
  green: 'Bright Yellowish Green',
  blue: 'Bright Blue',
  white: 'White',
  black: 'Black',
  grey: 'Medium Stone Grey',
  gray: 'Medium Stone Grey',
  purple: 'Bright Purple',
  brown: 'Reddish Brown',
  azure: 'Medium Azur',
  cyan: 'Medium Azur',
};

function normalizeColor(raw: string): string {
  const lower = raw.toLowerCase().trim();
  for (const [alias, canonical] of Object.entries(COLOR_ALIASES)) {
    if (lower.includes(alias)) return canonical;
  }
  // Return as-is and hope it matches a key in PART_COLOR_HEX
  return raw;
}

// ── Part resolver ─────────────────────────────────────────────────────────────

function resolvePart(type: string, color: string) {
  const colorKey = normalizeColor(color);
  const typeUpper = type.toUpperCase().trim();

  // Try exact color + name match first
  let part = legoParts.find(
    (p) => p.color === colorKey && p.partName.toUpperCase().includes(typeUpper),
  );

  // Fallback: any color, same type
  if (!part) {
    part = legoParts.find((p) => p.partName.toUpperCase().includes(typeUpper));
  }

  // Fallback: parse NxM from type and find closest size
  if (!part) {
    const m = typeUpper.match(/(\d+)\s*[X×]\s*(\d+)/);
    if (m) {
      const [, a, b] = m;
      const isBrick = typeUpper.includes('BRICK');
      part = legoParts.find((p) => {
        const n = p.partName.toUpperCase();
        return (
          (isBrick ? n.includes('BRICK') : n.includes('PLATE')) &&
          n.includes(`${a}X${b}`)
        );
      });
    }
  }

  return { part, colorKey };
}

// ── Coordinate converter ──────────────────────────────────────────────────────
// The system prompt asks Claude to output stud/plate units directly,
// so no mm conversion is needed — x/z are studs, y is plate units.

function rawToBrick(
  raw: RawBrick,
  existing: PlacedBrick[],
): PlacedBrick | null {
  const { part, colorKey } = resolvePart(raw.type, raw.color);
  if (!part) return null;

  const w = part.dims?.w ?? extractDim(part.partName, 0);
  const d = part.dims?.d ?? extractDim(part.partName, 1);
  const h = part.dims?.h ?? (isPlate(part.partName) ? 1 : 3);
  const rotY = Math.round(raw.rotY ?? 0) % 4;
  const rotated = rotY % 2 === 1;
  const ew = rotated ? d : w;
  const ed = rotated ? w : d;

  const sx = snapCenter(raw.x, ew);
  const sz = snapCenter(raw.z, ed);
  const id = makeId();
  const sy = raw.y !== 0
    ? raw.y
    : findSnapY({ id, position: [sx, 0, sz], w, d, rotY }, existing);

  return {
    id,
    partId: part.id,
    partName: part.partName,
    colorName: colorKey,
    colorHex: PART_COLOR_HEX[colorKey] ?? '#aaaaaa',
    w, d, h,
    position: [sx, sy, sz],
    rotY,
    shapeType: part.shapeType,
  };
}

function isPlate(name: string) {
  return /PLATE|FLAT\s*TILE|TILE/i.test(name) && !/ROOF|SLOPE/i.test(name);
}

function extractDim(name: string, idx: 0 | 1): number {
  const m = name.match(/(\d+)\s*[Xx]\s*(\d+)/);
  if (!m) return 1;
  return Math.min(parseInt(m[idx + 1]), 8);
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ClaudeAPIOptions {
  apiKey: string;
  prompt: string;
}

export async function callClaudeAPI({ apiKey, prompt }: ClaudeAPIOptions): Promise<PlacedBrick[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json() as {
    content: { type: string; text: string }[];
  };
  const text = data.content.find((c) => c.type === 'text')?.text ?? '[]';

  // Extract JSON array from the response (Claude sometimes wraps in markdown)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AIの返答にJSONが含まれていませんでした');

  const raw: RawBrick[] = JSON.parse(jsonMatch[0]);
  const bricks: PlacedBrick[] = [];
  for (const item of raw) {
    const brick = rawToBrick(item, bricks);
    if (brick) bricks.push(brick);
  }

  if (bricks.length === 0) throw new Error('パーツを配置できませんでした。別の指示を試してください。');
  return bricks;
}
