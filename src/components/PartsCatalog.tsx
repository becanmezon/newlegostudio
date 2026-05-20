import { useMemo, useState } from 'react';
import { legoParts } from '../data/parts';
import { PartCard } from './PartCard';

const ALL_COLORS = ['すべて', ...Array.from(new Set(legoParts.map((p) => p.color))).sort()];

export function PartsCatalog() {
  const [search, setSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState('すべて');

  const filtered = useMemo(() => {
    return legoParts.filter((p) => {
      const matchColor = selectedColor === 'すべて' || p.color === selectedColor;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.partName.toLowerCase().includes(q) ||
        p.partNumber.includes(q) ||
        p.color.toLowerCase().includes(q);
      return matchColor && matchSearch;
    });
  }, [search, selectedColor]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Header */}
      <header className="bg-yellow-400 shadow-md py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-1">
          <h1 className="text-3xl md:text-4xl font-black text-yellow-900 tracking-tight">
            🧱 キッズ・レゴスタジオ
          </h1>
          <p className="text-yellow-800 text-sm font-medium">パーツ確認カタログ</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="パーツ名・番号で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border-2 border-yellow-300 focus:border-yellow-500 focus:outline-none text-sm shadow-sm"
          />
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-yellow-300 focus:border-yellow-500 focus:outline-none text-sm shadow-sm bg-white"
          >
            {ALL_COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} / {legoParts.length} パーツ表示中
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>パーツが見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
