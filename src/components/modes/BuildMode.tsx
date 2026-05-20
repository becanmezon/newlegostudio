import { useState } from 'react';
import { legoParts } from '../../data/parts';
import type { LegoPart } from '../../data/parts';
import { PART_COLOR_HEX } from '../../data/colors';
import { LegoCanvas } from '../canvas/LegoCanvas';
import type { PlacedBrick } from '../canvas/types';
import { getCategory } from '../canvas/types';
import type { PartCategory } from '../canvas/types';
import { PartIcon } from '../canvas/PartIcon';

interface Props {
  bricks: PlacedBrick[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddBrick: (part: LegoPart) => string;
  onMoveBrick: (id: string, pos: [number, number, number]) => void;
  onRotateBrick: (id: string) => void;
  onDeleteBrick: (id: string) => void;
}

type CategoryFilter = PartCategory | 'all';

const CATEGORY_TABS: { id: CategoryFilter; emoji: string; label: string }[] = [
  { id: 'all',     emoji: '🧱', label: 'すべて'   },
  { id: 'brick',   emoji: '🟥', label: 'ブロック' },
  { id: 'plate',   emoji: '⬛', label: 'プレート' },
  { id: 'roof',    emoji: '🏠', label: 'やね'     },
  { id: 'round',   emoji: '⭕', label: 'まるい'   },
  { id: 'frame',   emoji: '🪟', label: 'まど'     },
  { id: 'special', emoji: '⭐', label: 'とくしゅ' },
];

// ── Selection toolbar ────────────────────────────────────────────────────────
function SelectionToolbar({
  brick,
  onRotate,
  onDelete,
  onDeselect,
}: {
  brick: PlacedBrick;
  onRotate: () => void;
  onDelete: () => void;
  onDeselect: () => void;
}) {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-yellow-300 border-4 border-yellow-500 rounded-2xl px-4 py-2 shadow-xl">
      <span className="text-xs font-black text-yellow-900 mr-1 max-w-32 truncate">
        {brick.partName}
      </span>
      <button
        onClick={onRotate}
        className="flex flex-col items-center gap-0.5 bg-white hover:bg-yellow-100 rounded-xl px-3 py-1.5 transition-colors shadow"
      >
        <span className="text-xl">🔄</span>
        <span className="text-xs font-black text-gray-600">まわす</span>
      </button>
      <button
        onClick={onDelete}
        className="flex flex-col items-center gap-0.5 bg-white hover:bg-red-100 rounded-xl px-3 py-1.5 transition-colors shadow"
      >
        <span className="text-xl">🗑️</span>
        <span className="text-xs font-black text-gray-600">けす</span>
      </button>
      <button
        onClick={onDeselect}
        className="flex flex-col items-center gap-0.5 bg-white hover:bg-gray-100 rounded-xl px-3 py-1.5 transition-colors shadow"
      >
        <span className="text-xl">✅</span>
        <span className="text-xs font-black text-gray-600">かんりょう</span>
      </button>
    </div>
  );
}

// ── Parts sidebar ────────────────────────────────────────────────────────────
function PartsSidebar({
  search,
  onSearchChange,
  onAddPart,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onAddPart: (part: LegoPart) => void;
}) {
  const [category, setCategory] = useState<CategoryFilter>('all');

  const filtered = legoParts.filter((p) => {
    const matchSearch =
      !search ||
      p.partName.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.includes(search);
    const matchCat = category === 'all' || getCategory(p.partName) === category;
    return matchSearch && matchCat;
  });

  return (
    <aside className="w-52 flex flex-col bg-amber-50 border-r-4 border-amber-200 flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="bg-amber-400 px-3 py-2 flex-shrink-0">
        <p className="font-black text-amber-900 text-sm">🎲 パーツをえらぼう</p>
        <p className="text-amber-700 text-xs mt-0.5">クリックまたはドラッグ</p>
      </div>

      {/* Search */}
      <div className="p-2 pb-1 flex-shrink-0">
        <input
          type="text"
          placeholder="🔍 さがす…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border-2 border-amber-200 focus:outline-none focus:border-amber-400 bg-white"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto px-2 pb-1.5 flex-shrink-0 scrollbar-hide">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategory(tab.id)}
            className={[
              'flex-shrink-0 flex flex-col items-center px-2 py-1 rounded-lg transition-colors cursor-pointer select-none',
              category === tab.id
                ? 'bg-amber-400 text-amber-900'
                : 'bg-white text-gray-500 hover:bg-amber-100',
            ].join(' ')}
          >
            <span className="text-sm leading-none">{tab.emoji}</span>
            <span className="text-[9px] font-black leading-tight mt-0.5 whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Parts list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-1.5">
        {filtered.map((part) => {
          const hex = PART_COLOR_HEX[part.color] ?? '#999';
          const cat = getCategory(part.partName);
          return (
            <div
              key={part.id}
              draggable
              title={part.partName}
              onClick={() => onAddPart(part)}
              onDragStart={(e) => {
                e.dataTransfer.setData('partId', String(part.id));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl bg-white hover:bg-amber-100 cursor-pointer active:scale-95 transition-all shadow-sm border border-amber-100 select-none"
            >
              <div className="w-9 h-9 rounded-lg flex-shrink-0 border border-black/10 overflow-hidden bg-white/60">
                <PartIcon category={cat} color={hex} size={36} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-700 leading-tight truncate">{part.partName}</p>
                <p className="text-xs text-gray-400">×{part.quantity}</p>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6">みつからないよ…</p>
        )}
      </div>
    </aside>
  );
}

// ── Main BuildMode ────────────────────────────────────────────────────────────
export function BuildMode({
  bricks,
  selectedId,
  onSelect,
  onAddBrick,
  onMoveBrick,
  onRotateBrick,
  onDeleteBrick,
}: Props) {
  const [search, setSearch] = useState('');

  const selectedBrick = bricks.find((b) => b.id === selectedId) ?? null;

  const handleAddPart = (part: LegoPart) => {
    const id = onAddBrick(part);
    onSelect(id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const partId = parseInt(e.dataTransfer.getData('partId'));
    const part = legoParts.find((p) => p.id === partId);
    if (part) handleAddPart(part);
  };

  return (
    <div className="flex h-full">
      <PartsSidebar search={search} onSearchChange={setSearch} onAddPart={handleAddPart} />

      <div
        className="flex-1 relative overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={handleDrop}
      >
        {selectedBrick && (
          <SelectionToolbar
            brick={selectedBrick}
            onRotate={() => onRotateBrick(selectedBrick.id)}
            onDelete={() => { onDeleteBrick(selectedBrick.id); onSelect(null); }}
            onDeselect={() => onSelect(null)}
          />
        )}

        <LegoCanvas
          bricks={bricks}
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMoveBrick}
        />

        {bricks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl px-8 py-6 text-center shadow-xl border-4 border-white">
              <p className="text-5xl mb-3">👈</p>
              <p className="text-lg font-black text-gray-600 mb-1">パーツをえらんでね！</p>
              <p className="text-sm text-gray-400">
                ひだりのパーツをクリックするか<br />ここにドラッグしてね
              </p>
            </div>
          </div>
        )}

        {selectedBrick && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs font-bold px-4 py-2 rounded-full pointer-events-none">
            ドラッグでうごかせるよ ✨
          </div>
        )}

        {bricks.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/90 rounded-xl px-3 py-1.5 text-xs font-black text-gray-600 shadow border border-gray-200">
            🧱 {bricks.length} こ
          </div>
        )}
      </div>
    </div>
  );
}
