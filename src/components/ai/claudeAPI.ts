/**
 * claudeAPI.ts
 *
 * Calls the Anthropic Claude API with the LEGO placement engine system prompt.
 * Parses the returned JSON (Antigravity format) into PlacedBrick[] for the 3D canvas.
 *
 * Output format (Antigravity):
 *   { "parts": [ { "id", "type", "color", "position": {x,y,z}, "rotation": {x,y,z} } ] }
 *
 * Coordinate units: x/z = studs, y = plate units (1 plate = 3.2mm, 1 brick = 3 plates)
 */

import { legoParts } from '../../data/parts';
import { PART_COLOR_HEX } from '../../data/colors';
import { makeId, snapCenter, findSnapY } from '../canvas/types';
import type { PlacedBrick } from '../canvas/types';

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `あなたは3DレゴブロックAI配置エンジンです。
ユーザーの指示に従い、パーツの配置データを以下のJSONフォーマットのみで出力してください。
説明・補足・マークダウンのコードブロックは一切出力しないでください。

【出力フォーマット】
{
  "parts": [
    {
      "id": "p1",
      "type": "Part_2x4",
      "color": "Bright Red",
      "position": { "x": 0, "y": 0, "z": 0 },
      "rotation": { "x": 0, "y": 0, "z": 0 }
    }
  ]
}

【座標系】
- x / z 軸 : スタッド単位（ポッチ1個 = 1単位）、整数で指定
- y 軸     : プレート単位（プレート1枚 = 1単位、ブリック = 3単位）
- position は各パーツの底面中心座標
- 地面は y = 0

【typeの書き方】
- "Part_WxD"  : 通常ブリック（高さ3プレート）、例: "Part_2x4"
- "Plate_WxD" : フラットプレート（高さ1プレート）、例: "Plate_1x4"
- "Roof_WxD"  : 屋根スロープ（高さ3プレート）、例: "Roof_2x2"

【rotation.yの値（度数）】
0 = そのまま / 90 = 90°回転 / 180 = 180° / 270 = 270°
rotation.x と rotation.z は常に 0 にしてください。

【使用できる色名（必ずこの中から選ぶ）】
Black, Dark Stone Grey, Medium Stone Grey, White, Bright Red, Bright Orange,
Bright Yellow, Bright Yellowish Green, Dark Green, Bright Blue, Medium Azur,
Bright Purple, Reddish Brown, Sand Yellow, Sand Blue, Dark Orange

【配置ルール】
1. パーツ同士が重ならないようにする
2. 積み重ねる場合は下のパーツの y + h を上のパーツの y にする
3. JSONのみ出力（{ "parts": [...] } の形式を厳守）`;

// ── Antigravity format (new) ──────────────────────────────────────────────────

interface AntigravityPart {
  id: string;
  type: string;    // "Part_2x4" | "Plate_1x4" | "Roof_2x2"
  color: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
}

// ── Legacy array format (fallback) ───────────────────────────────────────────

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

// ── Antigravity format converter (new) ───────────────────────────────────────

function antigravityToBrick(
  ap: AntigravityPart,
  existing: PlacedBrick[],
): PlacedBrick | null {
  // Parse "Part_2x4" / "Plate_1x4" / "Roof_2x2" → dims + kind
  const typeUpper = ap.type.toUpperCase();
  const isPlateType = typeUpper.startsWith('PLATE_');
  const isRoofType = typeUpper.startsWith('ROOF_');

  const dimMatch = ap.type.match(/(\d+)[xX](\d+)/);
  if (!dimMatch) return null;
  const w = Math.min(parseInt(dimMatch[1]), 8);
  const d = Math.min(parseInt(dimMatch[2]), 8);
  const h = isPlateType ? 1 : 3;

  // Build a search key for resolvePart
  let searchType: string;
  if (isPlateType)     searchType = `PLATE ${w}X${d}`;
  else if (isRoofType) searchType = `ROOF TILE ${w}X${d}`;
  else                 searchType = `BRICK ${w}X${d}`;

  const { part, colorKey } = resolvePart(searchType, ap.color);

  const rotY = (Math.round((ap.rotation?.y ?? 0) / 90) % 4 + 4) % 4;
  const rotated = rotY % 2 === 1;
  const ew = rotated ? d : w;
  const ed = rotated ? w : d;

  const sx = snapCenter(ap.position.x, ew);
  const sz = snapCenter(ap.position.z, ed);
  const id = makeId();
  const sy = ap.position.y !== 0
    ? ap.position.y
    : findSnapY({ id, position: [sx, 0, sz], w, d, rotY }, existing);

  return {
    id,
    partId: part?.id ?? 0,
    partName: part?.partName ?? searchType,
    colorName: colorKey,
    colorHex: PART_COLOR_HEX[colorKey] ?? '#aaaaaa',
    w, d, h,
    position: [sx, sy, sz],
    rotY,
    shapeType: part?.shapeType,
  };
}

// ── Legacy array format converter (fallback) ──────────────────────────────────

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
  const text = data.content.find((c) => c.type === 'text')?.text ?? '';

  // Strip markdown code fences if present
  const stripped = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();

  const bricks: PlacedBrick[] = [];

  // ── Try Antigravity format: { "parts": [...] } ──────────────────────────────
  const objMatch = stripped.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]) as { parts?: AntigravityPart[] };
      if (Array.isArray(parsed.parts)) {
        for (const item of parsed.parts) {
          const brick = antigravityToBrick(item, bricks);
          if (brick) bricks.push(brick);
        }
      }
    } catch {
      // fall through to legacy format
    }
  }

  // ── Fallback: legacy array format [ { type, color, x, y, z, rotY } ] ────────
  if (bricks.length === 0) {
    const arrMatch = stripped.match(/\[[\s\S]*\]/);
    if (!arrMatch) throw new Error('AIの返答にJSONが含まれていませんでした');
    const raw: RawBrick[] = JSON.parse(arrMatch[0]);
    for (const item of raw) {
      const brick = rawToBrick(item, bricks);
      if (brick) bricks.push(brick);
    }
  }

  if (bricks.length === 0) throw new Error('パーツを配置できませんでした。別の指示を試してください。');
  return bricks;
}
