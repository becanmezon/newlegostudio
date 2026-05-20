import { useState, useCallback, useRef } from 'react';
import { BuildMode } from './components/modes/BuildMode';
import { AIHelpMode } from './components/modes/AIHelpMode';
import { TogetherMode } from './components/modes/TogetherMode';
import { brickFromPart, findSnapY, snapCenter } from './components/canvas/types';
import type { PlacedBrick } from './components/canvas/types';
import type { LegoPart } from './data/parts';
import { playBrickSnap, playSuccess } from './utils/sounds';

type Mode = 'build' | 'ai' | 'together';

export default function App() {
  const [mode, setMode] = useState<Mode>('build');
  const [bricks, setBricks] = useState<PlacedBrick[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Track brick count in a ref to avoid stale closures inside callbacks
  const brickCountRef = useRef(0);
  brickCountRef.current = bricks.length;

  // ── Brick mutation callbacks (passed to BuildMode) ───────────────────────
  const addBrick = useCallback((part: LegoPart): string => {
    const brick = brickFromPart(part, brickCountRef.current);
    setBricks((prev) => {
      const snapY = findSnapY(brick, prev);
      const snapped: PlacedBrick = { ...brick, position: [brick.position[0], snapY, brick.position[2]] };
      return [...prev, snapped];
    });
    playBrickSnap();
    return brick.id;
  }, []);

  const moveBrick = useCallback((id: string, pos: [number, number, number]) => {
    setBricks((prev) => {
      const brick = prev.find((b) => b.id === id);
      if (!brick) return prev;
      // Effective dimensions depend on rotation (w and d swap at rotY 1 & 3)
      const rotated = brick.rotY % 2 === 1;
      const ew = rotated ? brick.d : brick.w;
      const ed = rotated ? brick.w : brick.d;
      const snapX = snapCenter(pos[0], ew);
      const snapZ = snapCenter(pos[2], ed);
      const others = prev.filter((b) => b.id !== id);
      const snapY = findSnapY({ ...brick, position: [snapX, 0, snapZ] }, others);
      return prev.map((b) => (b.id === id ? { ...b, position: [snapX, snapY, snapZ] } : b));
    });
  }, []);

  const rotateBrick = useCallback((id: string) => {
    setBricks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newRotY = (b.rotY + 1) % 4;
        // After 90° rotation w and d swap, so re-snap XZ to the new subgrid
        const rotated = newRotY % 2 === 1;
        const ew = rotated ? b.d : b.w;
        const ed = rotated ? b.w : b.d;
        const snapX = snapCenter(b.position[0], ew);
        const snapZ = snapCenter(b.position[2], ed);
        const others = prev.filter((ob) => ob.id !== id);
        const snapY = findSnapY({ ...b, rotY: newRotY, position: [snapX, 0, snapZ] }, others);
        return { ...b, rotY: newRotY, position: [snapX, snapY, snapZ] };
      }),
    );
  }, []);

  const deleteBrick = useCallback((id: string) => {
    setBricks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // ── AI Import: カチカチカチッとブリックを流し込む ────────────────────────
  const importBricks = useCallback((newBricks: PlacedBrick[]) => {
    setBricks([]);
    setSelectedId(null);
    setMode('build');
    // Stagger brick placement (LEGO snap sound per brick)
    newBricks.forEach((brick, i) => {
      setTimeout(() => {
        setBricks((prev) => [...prev, brick]);
        playBrickSnap();
        if (i === newBricks.length - 1) {
          setTimeout(playSuccess, 150);
        }
      }, i * 170 + 300); // 300ms head-start for mode switch animation
    });
  }, []);

  // ── Tab component ────────────────────────────────────────────────────────
  const Tab = ({
    id,
    emoji,
    label,
    activeClass,
    inactiveClass,
    activeTextClass,
  }: {
    id: Mode;
    emoji: string;
    label: string;
    activeClass: string;
    inactiveClass: string;
    activeTextClass: string;
  }) => (
    <button
      onClick={() => setMode(id)}
      className={[
        'flex flex-col items-center justify-center flex-1 py-3 px-2 rounded-t-2xl font-black transition-all duration-200 cursor-pointer select-none',
        mode === id ? activeClass : inactiveClass,
      ].join(' ')}
    >
      <span className="text-4xl mb-1">{emoji}</span>
      <span
        className={`text-sm leading-tight text-center ${mode === id ? activeTextClass : 'text-white'}`}
        dangerouslySetInnerHTML={{ __html: label }}
      />
    </button>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="bg-yellow-400 px-5 py-3 flex items-center gap-3 shadow-md flex-shrink-0 z-20">
        <span className="text-4xl drop-shadow-sm">🧱</span>
        <h1 className="text-xl font-black text-yellow-900 tracking-wide select-none">
          キッズ・レゴスタジオ
        </h1>
        {bricks.length > 0 && (
          <span className="ml-auto text-xs font-black bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
            🧱 {bricks.length}こ
          </span>
        )}
      </header>

      {/* Mode Tabs */}
      <nav className="flex px-3 pt-3 gap-2 flex-shrink-0 z-10 bg-gray-200">
        <Tab
          id="build"
          emoji="🔨"
          label="つくるモード"
          activeClass="bg-white shadow-lg -translate-y-1 border-t-4 border-red-500"
          inactiveClass="bg-red-400 hover:bg-red-500"
          activeTextClass="text-red-600"
        />
        <Tab
          id="ai"
          emoji="🤖"
          label="AIおたすけモード"
          activeClass="bg-white shadow-lg -translate-y-1 border-t-4 border-violet-500"
          inactiveClass="bg-violet-400 hover:bg-violet-500"
          activeTextClass="text-violet-600"
        />
        <Tab
          id="together"
          emoji="📖"
          label="いっしょに<br/>つくるモード"
          activeClass="bg-white shadow-lg -translate-y-1 border-t-4 border-green-600"
          inactiveClass="bg-green-500 hover:bg-green-600"
          activeTextClass="text-green-700"
        />
      </nav>

      {/* Mode Content */}
      <div className="flex-1 overflow-hidden bg-white shadow-inner">
        {mode === 'build' && (
          <BuildMode
            bricks={bricks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddBrick={addBrick}
            onMoveBrick={moveBrick}
            onRotateBrick={rotateBrick}
            onDeleteBrick={deleteBrick}
          />
        )}
        {mode === 'ai' && <AIHelpMode onImportBricks={importBricks} />}
        {mode === 'together' && <TogetherMode />}
      </div>
    </div>
  );
}
