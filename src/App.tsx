import { useState, useCallback, useRef, useEffect } from 'react';
import { BuildMode } from './components/modes/BuildMode';
import { AIHelpMode } from './components/modes/AIHelpMode';
import { TogetherMode } from './components/modes/TogetherMode';
import { brickFromPart, findSnapY, snapCenter, makeId } from './components/canvas/types';
import type { PlacedBrick } from './components/canvas/types';
import type { LegoPart } from './data/parts';
import { PART_COLOR_HEX } from './data/colors';
import { playBrickSnap, playSuccess } from './utils/sounds';

type Mode = 'build' | 'ai' | 'together';

// ── Undo / Redo state shape ──────────────────────────────────────────────────
interface HistoryState {
  bricks: PlacedBrick[];
  past: PlacedBrick[][];
  future: PlacedBrick[][];
}
const EMPTY: HistoryState = { bricks: [], past: [], future: [] };

export default function App() {
  const [mode, setMode] = useState<Mode>('build');
  const [hs, setHs] = useState<HistoryState>(EMPTY);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<PlacedBrick[] | null>(null);

  const { bricks } = hs;
  const canUndo = hs.past.length > 0;
  const canRedo = hs.future.length > 0;

  // Always-fresh refs (stale-closure safe)
  const brickCountRef = useRef(0);
  brickCountRef.current = bricks.length;
  const bricksRef = useRef<PlacedBrick[]>([]);
  bricksRef.current = bricks;
  const selectedIdsRef = useRef<string[]>([]);
  selectedIdsRef.current = selectedIds;
  const clipboardRef = useRef<PlacedBrick[] | null>(null);
  clipboardRef.current = clipboard;
  const pasteOffsetRef = useRef(1);

  // ── History primitives ───────────────────────────────────────────────────────

  const commit = useCallback((fn: (b: PlacedBrick[]) => PlacedBrick[]) => {
    setHs(h => ({ bricks: fn(h.bricks), past: [...h.past, h.bricks], future: [] }));
  }, []);

  const undo = useCallback(() => {
    setHs(h => {
      if (h.past.length === 0) return h;
      return {
        bricks: h.past[h.past.length - 1],
        past: h.past.slice(0, -1),
        future: [h.bricks, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHs(h => {
      if (h.future.length === 0) return h;
      return {
        bricks: h.future[0],
        past: [...h.past, h.bricks],
        future: h.future.slice(1),
      };
    });
  }, []);

  // ── Selection ────────────────────────────────────────────────────────────────

  const selectBrick = useCallback((id: string, additive: boolean) => {
    setSelectedIds(prev =>
      additive
        ? prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        : [id],
    );
  }, []);

  const selectMany = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // ── Brick mutations ──────────────────────────────────────────────────────────

  const addBrick = useCallback((part: LegoPart): string => {
    const brick = brickFromPart(part, brickCountRef.current);
    commit(prev => {
      const snapY = findSnapY(brick, prev);
      return [...prev, { ...brick, position: [brick.position[0], snapY, brick.position[2]] }];
    });
    playBrickSnap();
    return brick.id;
  }, [commit]);

  const moveBrick = useCallback((id: string, pos: [number, number, number]) => {
    commit(prev => {
      const brick = prev.find(b => b.id === id);
      if (!brick) return prev;
      const rotated = brick.rotY % 2 === 1;
      const ew = rotated ? brick.d : brick.w;
      const ed = rotated ? brick.w : brick.d;
      const sx = snapCenter(pos[0], ew);
      const sz = snapCenter(pos[2], ed);
      const sy = findSnapY({ ...brick, position: [sx, 0, sz] }, prev.filter(b => b.id !== id));
      return prev.map(b => b.id === id ? { ...b, position: [sx, sy, sz] as [number, number, number] } : b);
    });
  }, [commit]);

  const moveBricks = useCallback((moves: { id: string; pos: [number, number, number] }[]) => {
    commit(prev => {
      const movingIds = moves.map(m => m.id);
      let next = prev;
      for (const { id, pos } of moves) {
        const brick = next.find(b => b.id === id);
        if (!brick) continue;
        const rotated = brick.rotY % 2 === 1;
        const ew = rotated ? brick.d : brick.w;
        const ed = rotated ? brick.w : brick.d;
        const sx = snapCenter(pos[0], ew);
        const sz = snapCenter(pos[2], ed);
        const others = next.filter(b => !movingIds.includes(b.id));
        const sy = findSnapY({ ...brick, position: [sx, 0, sz] }, others);
        next = next.map(b => b.id === id ? { ...b, position: [sx, sy, sz] as [number, number, number] } : b);
      }
      return next;
    });
  }, [commit]);

  // Batch-rotate all selected bricks in one history commit
  const rotateSelected = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (ids.length === 0) return;
    commit(prev => {
      let next = prev;
      for (const id of ids) {
        const b = next.find(x => x.id === id);
        if (!b) continue;
        const newRotY = (b.rotY + 1) % 4;
        const rotated = newRotY % 2 === 1;
        const ew = rotated ? b.d : b.w;
        const ed = rotated ? b.w : b.d;
        const sx = snapCenter(b.position[0], ew);
        const sz = snapCenter(b.position[2], ed);
        const sy = findSnapY(
          { ...b, rotY: newRotY, position: [sx, 0, sz] },
          next.filter(o => o.id !== id),
        );
        next = next.map(x =>
          x.id === id ? { ...x, rotY: newRotY, position: [sx, sy, sz] as [number, number, number] } : x,
        );
      }
      return next;
    });
  }, [commit]);

  const deleteSelected = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (ids.length === 0) return;
    commit(prev => prev.filter(b => !ids.includes(b.id)));
    setSelectedIds([]);
  }, [commit]);

  // ── Copy / Paste ─────────────────────────────────────────────────────────────

  const copyBricks = useCallback(() => {
    const ids = selectedIdsRef.current;
    if (ids.length === 0) return;
    const toCopy = bricksRef.current.filter(b => ids.includes(b.id));
    if (toCopy.length === 0) return;
    setClipboard(toCopy);
    pasteOffsetRef.current = 1;
  }, []);

  const pasteBricks = useCallback(() => {
    const cb = clipboardRef.current;
    if (!cb || cb.length === 0) return;

    const offset = pasteOffsetRef.current;
    pasteOffsetRef.current += 1;

    const newIds: string[] = [];
    const templates = cb.map(brick => {
      const newId = makeId();
      newIds.push(newId);
      return { ...brick, id: newId, position: [brick.position[0] + offset, brick.position[1], brick.position[2]] as [number, number, number] };
    });

    commit(prev => {
      const result = [...prev];
      for (const nb of templates) {
        const rotated = nb.rotY % 2 === 1;
        const ew = rotated ? nb.d : nb.w;
        const ed = rotated ? nb.w : nb.d;
        const sx = snapCenter(nb.position[0], ew);
        const sz = snapCenter(nb.position[2], ed);
        const sy = findSnapY({ ...nb, position: [sx, 0, sz] }, result);
        result.push({ ...nb, position: [sx, sy, sz] as [number, number, number] });
      }
      return result;
    });

    setSelectedIds(newIds);
    playBrickSnap();
  }, [commit]);

  const changeColor = useCallback((ids: string[], colorName: string) => {
    commit(prev => prev.map(b =>
      ids.includes(b.id)
        ? { ...b, colorName, colorHex: PART_COLOR_HEX[colorName] ?? b.colorHex }
        : b,
    ));
  }, [commit]);

  const updateBrickHeight = useCallback((id: string, h: number) => {
    setHs(prev => ({
      ...prev,
      bricks: prev.bricks.map(b => b.id === id && b.h !== h ? { ...b, h } : b),
    }));
  }, []);

  // ── AI import — staggered animation, history reset ────────────────────────
  const importBricks = useCallback((newBricks: PlacedBrick[]) => {
    setHs(EMPTY);
    setSelectedIds([]);
    setMode('build');
    newBricks.forEach((brick, i) => {
      setTimeout(() => {
        setHs(h => ({ ...h, bricks: [...h.bricks, brick] }));
        playBrickSnap();
        if (i === newBricks.length - 1) setTimeout(playSuccess, 150);
      }, i * 170 + 300);
    });
  }, []);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (meta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if (meta && e.key === 'c') { e.preventDefault(); copyBricks(); return; }
      if (meta && e.key === 'v') { e.preventDefault(); pasteBricks(); return; }

      // selectedIdsRef is always fresh — no stale closure
      if (selectedIdsRef.current.length === 0) return;

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        rotateSelected();
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }
      if (e.key === 'Escape') deselectAll();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, rotateSelected, deleteSelected, copyBricks, pasteBricks, deselectAll]);

  // ── Sub-components ────────────────────────────────────────────────────────
  const Tab = ({
    id, emoji, label, activeClass, inactiveClass, activeTextClass,
  }: {
    id: Mode; emoji: string; label: string;
    activeClass: string; inactiveClass: string; activeTextClass: string;
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

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="bg-yellow-400 px-5 py-3 flex items-center gap-3 shadow-md flex-shrink-0 z-20">
        <span className="text-4xl drop-shadow-sm">🧱</span>
        <h1 className="text-xl font-black text-yellow-900 tracking-wide select-none">
          キッズ・レゴスタジオ
        </h1>

        <div className="ml-auto flex items-center gap-2">

          {/* Undo button */}
          <div className="relative group">
            <button
              onClick={undo}
              disabled={!canUndo}
              aria-label="元に戻す"
              className={[
                'flex items-center justify-center w-9 h-9 rounded-xl border-2 transition-all',
                canUndo
                  ? 'bg-white/90 border-yellow-300 hover:bg-white hover:border-yellow-500 text-yellow-800 shadow cursor-pointer active:scale-95'
                  : 'bg-white/25 border-transparent text-yellow-700/35 cursor-not-allowed',
              ].join(' ')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M9 14 4 9l5-5"/>
                <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
              </svg>
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              戻る (⌘Z)
            </div>
          </div>

          {/* Redo button */}
          <div className="relative group">
            <button
              onClick={redo}
              disabled={!canRedo}
              aria-label="やり直す"
              className={[
                'flex items-center justify-center w-9 h-9 rounded-xl border-2 transition-all',
                canRedo
                  ? 'bg-white/90 border-yellow-300 hover:bg-white hover:border-yellow-500 text-yellow-800 shadow cursor-pointer active:scale-95'
                  : 'bg-white/25 border-transparent text-yellow-700/35 cursor-not-allowed',
              ].join(' ')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="m15 14 5-5-5-5"/>
                <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5 5.5 5.5 0 0 0 9.5 20H13"/>
              </svg>
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              進む (⌘Y)
            </div>
          </div>

          {bricks.length > 0 && (
            <span className="ml-1 text-xs font-black bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
              🧱 {bricks.length}こ
            </span>
          )}
        </div>
      </header>

      {/* ── Mode Tabs ──────────────────────────────────────────────────────── */}
      <nav className="flex px-3 pt-3 gap-2 flex-shrink-0 z-10 bg-gray-200">
        <Tab
          id="build" emoji="🔨" label="つくるモード"
          activeClass="bg-white shadow-lg -translate-y-1 border-t-4 border-red-500"
          inactiveClass="bg-red-400 hover:bg-red-500"
          activeTextClass="text-red-600"
        />
        <Tab
          id="ai" emoji="🤖" label="AIおたすけモード"
          activeClass="bg-white shadow-lg -translate-y-1 border-t-4 border-violet-500"
          inactiveClass="bg-violet-400 hover:bg-violet-500"
          activeTextClass="text-violet-600"
        />
        <Tab
          id="together" emoji="📖" label="いっしょに<br/>つくるモード"
          activeClass="bg-white shadow-lg -translate-y-1 border-t-4 border-green-600"
          inactiveClass="bg-green-500 hover:bg-green-600"
          activeTextClass="text-green-700"
        />
      </nav>

      {/* ── Mode Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-white shadow-inner">
        {mode === 'build' && (
          <BuildMode
            bricks={bricks}
            selectedIds={selectedIds}
            onSelect={selectBrick}
            onSelectMany={selectMany}
            onDeselect={deselectAll}
            onAddBrick={addBrick}
            onMoveBrick={moveBrick}
            onMoveBricks={moveBricks}
            onChangeColor={changeColor}
            onUpdateBrickHeight={updateBrickHeight}
          />
        )}
        {mode === 'ai' && <AIHelpMode onImportBricks={importBricks} />}
        {mode === 'together' && <TogetherMode />}
      </div>
    </div>
  );
}
