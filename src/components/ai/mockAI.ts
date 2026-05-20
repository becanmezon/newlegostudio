/**
 * mockAI.ts
 *
 * Production ready になったら callMockAI を実際の API 呼び出しに差し替える。
 * システムプロンプトは本番 Gemini / Claude などのマルチモーダル API に
 * そのまま渡せる形式で定義してある。
 */

import { legoParts } from '../../data/parts';
import type { LegoPart } from '../../data/parts';
import { PART_COLOR_HEX } from '../../data/colors';
import { makeId, parseDimensions } from '../canvas/types';
import type { PlacedBrick } from '../canvas/types';

// ─── System Prompts (本番 API 連携時にそのまま使用) ────────────────────────────

export const SYSTEM_PROMPT_COPY = `あなたはLEGO設計の専門AIです。
添付された画像に写っているものを分析し、提供されたパーツリスト(parts.json)のパーツを
できる限り使って再現するための配置データをJSON配列で出力してください。
各要素の形式: { "partNumber": string, "color": string, "x": number, "y": number, "z": number, "rotY": 0|1|2|3 }
座標系: LEGOスタッドグリッド（XZ平面が水平面、Y軸が高さ）。1単位=1スタッド、ブリック高さ=1.2単位。
出力はJSONのみ。説明文不要。`;

export const SYSTEM_PROMPT_SUGGEST = `あなたはLEGO設計の専門AIです。
添付された画像に写っているレゴパーツを識別し、
提供されたパーツリスト(parts.json)の範囲内で今すぐ作れる楽しい作品を3つ提案してください。
対象は9歳以下の子供なので、やさしい言葉で説明してください。
各提案の形式: { "emoji": string, "title": string, "description": string, "difficulty": 1|2|3 }
difficulty: 1=かんたん, 2=ふつう, 3=むずかしい。出力はJSONのみ。`;

// ─── Blueprint helpers ──────────────────────────────────────────────────────

interface Entry {
  nameContains: string;
  color: string;
  x: number;
  y: number;
  z: number;
  rotY?: number;
}

function findPart(color: string, nameContains: string): LegoPart | undefined {
  return legoParts.find(
    (p) => p.color === color && p.partName.toUpperCase().includes(nameContains.toUpperCase()),
  );
}

function entryToBrick(e: Entry): PlacedBrick | null {
  const part = findPart(e.color, e.nameContains);
  if (!part) return null;
  const { w, d, h } = parseDimensions(part.partName);
  return {
    id: makeId(),
    partId: part.id,
    partName: part.partName,
    colorName: part.color,
    colorHex: PART_COLOR_HEX[part.color] ?? '#aaaaaa',
    w, d, h,
    position: [e.x, e.y, e.z],
    rotY: e.rotY ?? 0,
  };
}

// ─── Mock Blueprints ────────────────────────────────────────────────────────

const TOWER_ENTRIES: Entry[] = [
  { nameContains: 'BRICK 2X4', color: 'Bright Red',             x: 0, y: 0.0, z: 0 },
  { nameContains: 'BRICK 2X4', color: 'Bright Orange',          x: 0, y: 1.2, z: 0, rotY: 1 },
  { nameContains: 'BRICK 2X4', color: 'Bright Yellow',          x: 0, y: 2.4, z: 0 },
  { nameContains: 'BRICK 2X4', color: 'Bright Yellowish Green', x: 0, y: 3.6, z: 0, rotY: 1 },
  { nameContains: 'BRICK 2X4', color: 'Bright Blue',            x: 0, y: 4.8, z: 0 },
  { nameContains: 'BRICK 2X2', color: 'Medium Azur',            x: 0, y: 6.0, z: 0 },
  { nameContains: 'BRICK 1X1', color: 'Bright Yellow',          x: 0, y: 7.2, z: 0 },
];

const VILLAGE_ENTRIES: Entry[] = [
  // Red house - walls
  { nameContains: 'BRICK 2X4', color: 'Bright Red', x: -5, y: 0.0, z: 0, rotY: 1 },
  { nameContains: 'BRICK 2X4', color: 'Bright Red', x: -5, y: 1.2, z: 0, rotY: 1 },
  { nameContains: 'BRICK 2X4', color: 'Bright Red', x: -5, y: 2.4, z: 0, rotY: 1 },
  // Red house - roof
  { nameContains: 'ROOF TILE 2X2/45°', color: 'Bright Yellow', x: -6, y: 3.6, z: 0 },
  { nameContains: 'ROOF TILE 2X2/45°', color: 'Bright Yellow', x: -4, y: 3.6, z: 0 },
  // Blue house - walls
  { nameContains: 'BRICK 2X4', color: 'Bright Blue', x: 3, y: 0.0, z: 0, rotY: 1 },
  { nameContains: 'BRICK 2X4', color: 'Bright Blue', x: 3, y: 1.2, z: 0, rotY: 1 },
  { nameContains: 'BRICK 2X4', color: 'Bright Blue', x: 3, y: 2.4, z: 0, rotY: 1 },
  // Blue house - roof
  { nameContains: 'ROOF TILE 2X2/45°', color: 'Dark Green', x: 2, y: 3.6, z: 0 },
  { nameContains: 'ROOF TILE 2X2/45°', color: 'Dark Green', x: 4, y: 3.6, z: 0 },
  // Path between houses
  { nameContains: 'FLAT TILE 2X4', color: 'Medium Stone Grey', x: -1, y: 0, z: 0, rotY: 1 },
];

const ROBOT_ENTRIES: Entry[] = [
  // Torso (3 layers)
  { nameContains: 'BRICK 2X4', color: 'Medium Stone Grey', x: 0, y: 0.0, z: 0 },
  { nameContains: 'BRICK 2X4', color: 'Medium Stone Grey', x: 0, y: 1.2, z: 0 },
  { nameContains: 'BRICK 2X4', color: 'Medium Stone Grey', x: 0, y: 2.4, z: 0 },
  // Head
  { nameContains: 'BRICK 1X4',  color: 'Medium Stone Grey', x: 0, y: 3.6, z: 0 },
  { nameContains: 'BRICK 1X4',  color: 'Medium Stone Grey', x: 0, y: 4.8, z: 0 },
  // Eyes
  { nameContains: 'ROUND PLATE 1X1', color: 'Bright Red',       x: -0.5, y: 6.0, z: -0.4 },
  { nameContains: 'ROUND PLATE 1X1', color: 'Dark Stone Grey',  x:  0.5, y: 6.0, z: -0.4 },
  // Arms
  { nameContains: 'BRICK 1X2', color: 'Medium Stone Grey', x: -3, y: 1.8, z: 0 },
  { nameContains: 'BRICK 1X2', color: 'Medium Stone Grey', x:  3, y: 1.8, z: 0 },
  // Legs
  { nameContains: 'BRICK 1X2', color: 'Dark Stone Grey', x: -0.5, y: 0, z: 2 },
  { nameContains: 'BRICK 1X2', color: 'Dark Stone Grey', x:  0.5, y: 0, z: 2 },
  // Antenna
  { nameContains: 'BRICK 1X1', color: 'Bright Yellow', x: 0, y: 6.0, z: 0 },
];

const BLUEPRINTS = [
  { name: '🌈 にじいろタワー', entries: TOWER_ENTRIES },
  { name: '🏘️ プチむらまち',   entries: VILLAGE_ENTRIES },
  { name: '🤖 かわいいロボット', entries: ROBOT_ENTRIES },
];

// ─── Mock Suggestion Sets ────────────────────────────────────────────────────

const SUGGESTION_SETS = [
  [
    {
      emoji: '🏠',
      title: 'おうちをつくろう！',
      description: 'あかいブロックでかべをつくって、きいろいやねをのせてみよう！まどをつけると もっとかわいいよ。',
      difficulty: 2 as const,
    },
    {
      emoji: '🚀',
      title: 'ロケットはどうかな？',
      description: 'しろいブロックをほそくつんで、さきっちょをとがらせよう！うちゅうへとびたつよ！',
      difficulty: 3 as const,
    },
    {
      emoji: '🌈',
      title: 'にじいろのとうをたてよう！',
      description: 'いろんないろのブロックをいっこずつかさねるだけ！かんたんなのにキレイだよ。',
      difficulty: 1 as const,
    },
  ],
  [
    {
      emoji: '🚗',
      title: 'くるまをつくろう！',
      description: 'きいろいブロックでからだをつくって、くろいまるいパーツをタイヤにしよう！はしれ！',
      difficulty: 2 as const,
    },
    {
      emoji: '🐶',
      title: 'かわいいいぬをつくろう！',
      description: 'こげちゃいろのブロックをくみあわせて、耳や しっぽもつけてみよう！',
      difficulty: 2 as const,
    },
    {
      emoji: '⭐',
      title: 'ほしをかざろう！',
      description: 'きいろいブロックをほしのかたちにならべよう。かんたんですごくきれいだよ！',
      difficulty: 1 as const,
    },
  ],
  [
    {
      emoji: '🏰',
      title: 'おしろをたてよう！',
      description: 'グレーのブロックでたかいとうをつくろう。はたをたてるともっとかっこいい！',
      difficulty: 3 as const,
    },
    {
      emoji: '🌸',
      title: 'はなだんをつくろう！',
      description: 'ピンクやきいろのブロックをならべて、きれいなはなばたけをつくろう！',
      difficulty: 1 as const,
    },
    {
      emoji: '🤖',
      title: 'ロボットをつくろう！',
      description: 'ぎんいろのブロックでからだと あたまをつくって、めをつけたら もう ロボットだよ！',
      difficulty: 2 as const,
    },
  ],
];

// ─── Public API ─────────────────────────────────────────────────────────────

export type AiCallMode = 'copy' | 'suggest';

export interface BlueprintResult {
  type: 'blueprint';
  name: string;
  bricks: PlacedBrick[];
}

export interface SuggestionItem {
  emoji: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
}

export interface SuggestResult {
  type: 'suggestions';
  items: SuggestionItem[];
}

export type AiResult = BlueprintResult | SuggestResult;

/** Simulates a multimodal AI call with realistic delay. */
export async function callMockAI(mode: AiCallMode): Promise<AiResult> {
  // Simulate API latency (2–4 seconds)
  await new Promise((r) => setTimeout(r, 2200 + Math.random() * 1800));

  if (mode === 'copy') {
    const pick = BLUEPRINTS[Math.floor(Math.random() * BLUEPRINTS.length)];
    const bricks = pick.entries.map(entryToBrick).filter((b): b is PlacedBrick => b !== null);
    return { type: 'blueprint', name: pick.name, bricks };
  } else {
    const pick = SUGGESTION_SETS[Math.floor(Math.random() * SUGGESTION_SETS.length)];
    return { type: 'suggestions', items: pick };
  }
}
