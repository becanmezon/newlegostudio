import { useEffect, useState } from 'react';
import type { LegoPart } from '../../data/parts';
import { PART_COLOR_HEX, LIGHT_COLORS } from '../../data/colors';
import { LegoCanvas } from '../canvas/LegoCanvas';
import type { PlacedBrick } from '../canvas/types';
import { PartIcon } from '../canvas/PartIcon';

interface Props {
  bricks: PlacedBrick[];
  selectedIds: string[];
  onSelect: (id: string, additive: boolean) => void;
  onSelectMany: (ids: string[]) => void;
  onDeselect: () => void;
  onAddBrick: (part: LegoPart) => string;
  onMoveBrick: (id: string, pos: [number, number, number]) => void;
  onMoveBricks: (moves: { id: string; pos: [number, number, number] }[]) => void;
  onChangeColor: (ids: string[], colorName: string) => void;
  onUpdateBrickHeight?: (id: string, h: number) => void;
}

// ── Catalog types ─────────────────────────────────────────────────────────────
interface CatalogItem {
  id: string;
  name: string;
  category: string;
}

function dimsFromCatalogItem(item: CatalogItem): { w: number; d: number; h: number } {
  const isPlate = /プレート|薄型|plate/i.test(item.name);
  const h = isPlate ? 1 : 3;
  const m = item.name.match(/(\d+)[xX×](\d+)/);
  if (m) {
    const a = parseInt(m[1]);
    const b = parseInt(m[2]);
    return { w: Math.max(a, b), d: Math.min(a, b), h };
  }
  return { w: 1, d: 1, h };
}

// idx makes each LegoPart.id unique even when item.id has non-numeric characters
function catalogItemToLegoPart(item: CatalogItem, idx: number, colorName: string): LegoPart {
  return {
    id: idx,
    partNumber: item.id,
    quantity: 99,
    color: colorName,
    partName: item.name,
    dims: dimsFromCatalogItem(item),
    ldrawPartNumber: item.id,
  };
}

const COLOR_NAMES = Object.keys(PART_COLOR_HEX);
const DEFAULT_COLOR = 'Bright Red';

// ── ColorPalette ──────────────────────────────────────────────────────────────
function ColorPalette({
  selectedColor,
  dotSize = 'sm',
  onSelect,
}: {
  selectedColor: string;
  dotSize?: 'sm' | 'md';
  onSelect: (name: string) => void;
}) {
  const cls = dotSize === 'md' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex flex-wrap gap-1">
      {COLOR_NAMES.map((name) => {
        const hex = PART_COLOR_HEX[name];
        const active = name === selectedColor;
        const light = LIGHT_COLORS.has(name);
        return (
          <button
            key={name}
            title={name}
            onClick={() => onSelect(name)}
            className={[
              cls,
              'rounded-full border-2 transition-all active:scale-90 flex-shrink-0',
              active
                ? 'scale-110 border-white ring-2 ring-blue-500 ring-offset-1'
                : light
                ? 'border-gray-300 hover:scale-110'
                : 'border-white/50 hover:scale-110 hover:border-white',
            ].join(' ')}
            style={{ background: hex }}
          />
        );
      })}
    </div>
  );
}

// ── Keyboard hint ─────────────────────────────────────────────────────────────
function KeyHint() {
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="flex items-center gap-3 bg-black/55 backdrop-blur-sm text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg select-none whitespace-nowrap">
        <span><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">↑↓←→</kbd> まわす</span>
        <span className="text-white/40">|</span>
        <span><kbd className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">Del</kbd> けす</span>
        <span className="text-white/40">|</span>
        <span>ドラッグ: うごかす</span>
      </div>
    </div>
  );
}

// ── Parts sidebar ─────────────────────────────────────────────────────────────
function PartsSidebar({
  search,
  ldrawParts,
  selectedColor,
  onSearchChange,
  onAddPart,
  onSelectColor,
}: {
  search: string;
  ldrawParts: LegoPart[];
  selectedColor: string;
  onSearchChange: (v: string) => void;
  onAddPart: (part: LegoPart) => void;
  onSelectColor: (name: string) => void;
}) {
  const filtered = ldrawParts.filter(
    (p) =>
      !search ||
      p.partName.toLowerCase().includes(search.toLowerCase()) ||
      p.partNumber.includes(search),
  );

  return (
    <aside className="w-52 flex flex-col bg-amber-50 border-r-4 border-amber-200 flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="bg-amber-400 px-3 py-2 flex-shrink-0">
        <p className="font-black text-amber-900 text-sm">🎲 パーツをえらぼう</p>
        <p className="text-amber-700 text-xs mt-0.5">クリックまたはドラッグ</p>
      </div>

      {/* Color palette */}
      <div className="px-2 pt-2 pb-1 flex-shrink-0 border-b border-amber-200">
        <p className="text-[10px] font-black text-amber-700 mb-1.5">🎨 いろをえらぼう</p>
        <ColorPalette selectedColor={selectedColor} dotSize="sm" onSelect={onSelectColor} />
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

      {/* Parts list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-1.5 pt-1">
        {filtered.map((part) => {
          const hex = PART_COLOR_HEX[selectedColor] ?? '#c91a09';
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
                <PartIcon category={(part.dims?.h ?? 3) === 1 ? 'plate' : 'brick'} color={hex} size={36} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-700 leading-tight truncate">{part.partName}</p>
                <p className="text-[10px] text-blue-500 font-bold">#{part.partNumber}</p>
              </div>
            </div>
          );
        })}
        {ldrawParts.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6">読み込み中…</p>
        )}
        {ldrawParts.length > 0 && filtered.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-6">みつからないよ…</p>
        )}
      </div>
    </aside>
  );
}

// ── Main BuildMode ─────────────────────────────────────────────────────────────
export function BuildMode({
  bricks,
  selectedIds,
  onSelect,
  onSelectMany,
  onDeselect,
  onAddBrick,
  onMoveBrick,
  onMoveBricks,
  onChangeColor,
  onUpdateBrickHeight,
}: Props) {
  const [search, setSearch] = useState('');
  const [ldrawParts, setLdrawParts] = useState<LegoPart[]>([]);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    fetch('/data/parts-catalog.json')
      .then((r) => r.json())
      .then((items: CatalogItem[]) =>
        setLdrawParts(items.map((item, idx) => catalogItemToLegoPart(item, idx, DEFAULT_COLOR)))
      )
      .catch((err) => console.error('[BuildMode] catalog fetch failed:', err));
  }, []);

  const hasSelection = selectedIds.length > 0;

  // Called from sidebar palette or floating palette
  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    if (selectedIds.length > 0) {
      onChangeColor(selectedIds, colorName);
    }
  };

  // Apply the currently-selected color when adding a part
  const handleAddPart = (part: LegoPart) => {
    const coloredPart: LegoPart = { ...part, color: selectedColor };
    const id = onAddBrick(coloredPart);
    onSelect(id, false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const partId = parseInt(e.dataTransfer.getData('partId'));
    const part = ldrawParts.find((p) => p.id === partId);
    if (part) handleAddPart(part);
  };

  return (
    <div className="flex h-full">
      <PartsSidebar
        search={search}
        ldrawParts={ldrawParts}
        selectedColor={selectedColor}
        onSearchChange={setSearch}
        onAddPart={handleAddPart}
        onSelectColor={handleColorSelect}
      />

      <div
        className="flex-1 relative overflow-hidden"
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDrop={handleDrop}
      >
        {hasSelection && <KeyHint />}

        <LegoCanvas
          bricks={bricks}
          selectedIds={selectedIds}
          onSelect={onSelect}
          onSelectMany={onSelectMany}
          onDeselect={onDeselect}
          onMove={onMoveBrick}
          onMoveBricks={onMoveBricks}
          onUpdateBrickHeight={onUpdateBrickHeight}
        />

        {/* ── Floating color palette (shown when bricks are selected) ── */}
        {hasSelection && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-amber-200 px-3 py-2 max-w-xs">
              <p className="text-[10px] font-black text-amber-700 mb-1.5 text-center">
                🎨 いろをかえる
              </p>
              <ColorPalette
                selectedColor={selectedColor}
                dotSize="md"
                onSelect={handleColorSelect}
              />
            </div>
          </div>
        )}

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

        {bricks.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/90 rounded-xl px-3 py-1.5 text-xs font-black text-gray-600 shadow border border-gray-200">
            🧱 {bricks.length} こ
          </div>
        )}
      </div>
    </div>
  );
}
