import { useState, useRef, useEffect, useCallback } from 'react';
import { callMockAI } from '../ai/mockAI';
import type { AiCallMode, AiResult, SuggestionItem } from '../ai/mockAI';
import type { PlacedBrick } from '../canvas/types';

// ─── Types ──────────────────────────────────────────────────────────────────

type Phase = 'menu' | 'upload' | 'loading' | 'result';

interface Props {
  onImportBricks: (bricks: PlacedBrick[]) => void;
}

// ─── Loading messages (cycle through during AI "thinking") ──────────────────

const LOADING_MSGS = [
  { icon: '🔬', text: 'がぞうをぶんせきちゅう…' },
  { icon: '🤖', text: 'AIがかんがえています…' },
  { icon: '✨', text: 'まほうをかけています…' },
  { icon: '🧠', text: 'パーツをさがしています…' },
  { icon: '🎨', text: 'せっけいちゅう…' },
  { icon: '🔧', text: 'くみたててみています…' },
];

// ─── Sub-screens ─────────────────────────────────────────────────────────────

// 1. Mode Menu
function ModeMenu({ onSelect }: { onSelect: (m: AiCallMode) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
      {/* Lab header */}
      <div className="text-center">
        <div className="text-6xl mb-3">🔬</div>
        <h2 className="text-2xl font-black text-violet-800 mb-1">
          AIカメラ・けんきゅうじょ
        </h2>
        <p className="text-sm text-violet-400">どっちをためしてみる？</p>
      </div>

      {/* Mode cards */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
        {/* ① Copy mode */}
        <button
          onClick={() => onSelect('copy')}
          className="flex-1 group bg-white hover:bg-violet-50 border-4 border-violet-200 hover:border-violet-500 rounded-3xl p-7 flex flex-col items-center gap-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <span className="text-6xl group-hover:scale-110 transition-transform">📸</span>
          <div className="text-center">
            <div className="text-xs font-black text-violet-400 mb-1">① まねしてつくる</div>
            <p className="text-lg font-black text-violet-800 leading-tight mb-2">
              しゃしんのモノを<br />レゴでつくろう！
            </p>
            <p className="text-xs text-gray-400 leading-snug">
              みたものを<br />AIがせっけいしてくれるよ
            </p>
          </div>
          <div className="mt-auto bg-violet-500 text-white font-black text-sm px-5 py-2 rounded-full">
            これをえらぶ！
          </div>
        </button>

        {/* ② Suggest mode */}
        <button
          onClick={() => onSelect('suggest')}
          className="flex-1 group bg-white hover:bg-pink-50 border-4 border-pink-200 hover:border-pink-500 rounded-3xl p-7 flex flex-col items-center gap-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
        >
          <span className="text-6xl group-hover:scale-110 transition-transform">🎲</span>
          <div className="text-center">
            <div className="text-xs font-black text-pink-400 mb-1">② あるものからつくる</div>
            <p className="text-lg font-black text-pink-800 leading-tight mb-2">
              もってるパーツで<br />なにができるかな？
            </p>
            <p className="text-xs text-gray-400 leading-snug">
              ちらばったパーツを<br />AIがていあんするよ
            </p>
          </div>
          <div className="mt-auto bg-pink-500 text-white font-black text-sm px-5 py-2 rounded-full">
            これをえらぶ！
          </div>
        </button>
      </div>
    </div>
  );
}

// 2. Image Uploader
function ImageUploader({
  subMode,
  onUploaded,
  onBack,
}: {
  subMode: AiCallMode;
  onUploaded: (file: File) => void;
  onBack: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSelectedFile(file);
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const label = subMode === 'copy' ? 'まねしたいものの' : 'もってるパーツの';
  const accent = subMode === 'copy' ? 'violet' : 'pink';

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-auto">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm font-black text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
        >
          ← もどる
        </button>
        <span className="text-sm font-black text-gray-400">
          {subMode === 'copy' ? '① まねしてつくる' : '② あるものからつくる'}
        </span>
      </div>

      {/* Instruction */}
      <div className="text-center">
        <p className="text-lg font-black text-gray-700">
          {label}しゃしんをおくってね 📸
        </p>
        <p className="text-xs text-gray-400">JPGかPNGのがぞうをつかってね</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => !preview && fileInputRef.current?.click()}
        className={[
          'relative rounded-3xl border-4 border-dashed transition-all duration-200 flex flex-col items-center justify-center min-h-48 cursor-pointer overflow-hidden',
          isDragOver
            ? 'border-violet-500 bg-violet-50 scale-[1.02]'
            : preview
              ? 'border-green-400 bg-green-50'
              : `border-${accent}-200 bg-${accent}-50 hover:border-${accent}-400`,
        ].join(' ')}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview" className="max-h-64 max-w-full rounded-2xl object-contain" />
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-black px-3 py-1 rounded-full shadow">
              ✅ よみこんだよ！
            </div>
          </>
        ) : (
          <>
            <span className="text-7xl mb-3">🖼️</span>
            <p className="font-black text-gray-500 text-base mb-1">ここにドラッグしてね！</p>
            <p className="text-xs text-gray-400">または ↓ のボタンをおして</p>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {/* Action buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-white border-3 border-gray-300 hover:border-gray-400 rounded-2xl px-5 py-3 font-black text-gray-600 text-sm transition-colors shadow"
        >
          📂 がぞうをえらぶ
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-2 bg-white border-3 border-gray-300 hover:border-gray-400 rounded-2xl px-5 py-3 font-black text-gray-600 text-sm transition-colors shadow"
        >
          📷 カメラでとる
        </button>
      </div>

      {/* Confirm CTA */}
      {selectedFile && (
        <button
          onClick={() => onUploaded(selectedFile)}
          className="mt-2 bg-violet-500 hover:bg-violet-600 text-white font-black text-lg py-4 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
        >
          <span>🚀</span>
          <span>AIにおくる！</span>
        </button>
      )}
    </div>
  );
}

// 3. Loading
function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % LOADING_MSGS.length), 700);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 400);
    return () => clearInterval(t);
  }, []);

  const { icon, text } = LOADING_MSGS[msgIdx];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-gradient-to-b from-violet-50 to-white p-8">
      {/* Spinning robot */}
      <div className="relative">
        <div className="text-8xl animate-bounce">🤖</div>
        <div className="absolute -top-2 -right-2 text-3xl animate-spin">⚙️</div>
      </div>

      {/* Message */}
      <div className="text-center">
        <div className="text-4xl mb-3 transition-all duration-300">{icon}</div>
        <p className="text-xl font-black text-violet-700 mb-2">
          {text}{'・'.repeat(dots)}
        </p>
        <p className="text-sm text-gray-400">ちょっとまってね ✨</p>
      </div>

      {/* Progress bubbles */}
      <div className="flex gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-4 h-4 rounded-full bg-violet-300 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// 4a. Blueprint result
function BlueprintResult({
  name,
  bricks,
  onImport,
  onRetry,
  onMenu,
}: {
  name: string;
  bricks: PlacedBrick[];
  onImport: () => void;
  onRetry: () => void;
  onMenu: () => void;
}) {
  // Group by color for the mini preview
  const colorGroups = bricks.reduce<Record<string, { hex: string; count: number }>>((acc, b) => {
    if (!acc[b.colorName]) acc[b.colorName] = { hex: b.colorHex, count: 0 };
    acc[b.colorName].count++;
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6 overflow-auto">
      {/* Success header */}
      <div className="text-center">
        <div className="text-6xl mb-3 animate-bounce">🎉</div>
        <h2 className="text-2xl font-black text-violet-800 mb-1">できたよ！</h2>
        <p className="text-sm text-gray-400">AIがせっけいしてくれたよ</p>
      </div>

      {/* Blueprint card */}
      <div className="w-full max-w-md bg-white border-4 border-violet-200 rounded-3xl p-6 shadow-xl">
        <div className="text-center mb-4">
          <p className="text-2xl font-black text-violet-700">{name}</p>
          <p className="text-sm text-gray-500">🧱 {bricks.length}このパーツでできるよ！</p>
        </div>

        {/* Color palette preview */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {Object.entries(colorGroups).map(([color, { hex, count }]) => (
            <div key={color} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-3 py-1 border border-gray-100">
              <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: hex }} />
              <span className="text-xs font-bold text-gray-600">{color}</span>
              <span className="text-xs text-gray-400">×{count}</span>
            </div>
          ))}
        </div>

        {/* Brick list preview */}
        <div className="max-h-32 overflow-y-auto space-y-1">
          {bricks.map((b) => (
            <div key={b.id} className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: b.colorHex }} />
              <span className="truncate">{b.partName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Import CTA */}
      <button
        onClick={onImport}
        className="w-full max-w-md bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-black text-xl py-5 rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
      >
        <span>🔨</span>
        <span>つくるモードでつくる！</span>
      </button>

      {/* Secondary actions */}
      <div className="flex gap-4 text-sm">
        <button
          onClick={onRetry}
          className="font-black text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ↩️ もう一度
        </button>
        <button
          onClick={onMenu}
          className="font-black text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          🏠 メニューへ
        </button>
      </div>
    </div>
  );
}

// 4b. Suggestion result
function SuggestionResult({
  items,
  onRetry,
  onMenu,
}: {
  items: SuggestionItem[];
  onRetry: () => void;
  onMenu: () => void;
}) {
  const stars = (n: 1 | 2 | 3) => '★'.repeat(n) + '☆'.repeat(3 - n);
  const diffLabel = (n: 1 | 2 | 3) => (['かんたん', 'ふつう', 'むずかしい'] as const)[n - 1];
  const diffColor = (n: 1 | 2 | 3) => (['text-green-600', 'text-yellow-600', 'text-red-600'] as const)[n - 1];

  return (
    <div className="flex-1 flex flex-col p-6 gap-5 overflow-auto">
      <div className="text-center">
        <div className="text-5xl mb-2">💡</div>
        <h2 className="text-xl font-black text-pink-800">AIからのていあん</h2>
        <p className="text-xs text-gray-400">このパーツでこんなものがつくれるよ！</p>
      </div>

      {/* Suggestion cards */}
      <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white border-4 border-pink-100 hover:border-pink-300 rounded-3xl p-5 flex gap-4 items-start transition-all hover:shadow-lg"
          >
            <span className="text-5xl flex-shrink-0">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-pink-800 text-base mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.description}</p>
              <div className={`flex items-center gap-1.5 text-xs font-black ${diffColor(item.difficulty)}`}>
                <span>{stars(item.difficulty)}</span>
                <span>{diffLabel(item.difficulty)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center text-sm mt-2">
        <button
          onClick={onRetry}
          className="font-black text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ↩️ もう一度
        </button>
        <button
          onClick={onMenu}
          className="font-black text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          🏠 メニューへ
        </button>
      </div>
    </div>
  );
}

// ─── Main AIHelpMode ──────────────────────────────────────────────────────────

export function AIHelpMode({ onImportBricks }: Props) {
  const [subMode, setSubMode] = useState<AiCallMode>('copy');
  const [phase, setPhase] = useState<Phase>('menu');
  const [result, setResult] = useState<AiResult | null>(null);

  const handleSelectMode = (m: AiCallMode) => {
    setSubMode(m);
    setPhase('upload');
  };

  const handleUploaded = async (_file: File) => {
    setPhase('loading');
    try {
      const res = await callMockAI(subMode);
      setResult(res);
      setPhase('result');
    } catch {
      setPhase('upload');
    }
  };

  const handleImport = () => {
    if (result?.type === 'blueprint') {
      onImportBricks(result.bricks);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setPhase('upload');
  };

  const handleMenu = () => {
    setResult(null);
    setPhase('menu');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-violet-50 to-white overflow-hidden">
      {/* Decorative lab header bar */}
      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 px-6 py-2 flex items-center gap-3 flex-shrink-0">
        <span className="text-2xl">🔬</span>
        <p className="text-white font-black text-sm tracking-wide">AIカメラ・けんきゅうじょ</p>
        <div className="ml-auto flex gap-2">
          {['🟣', '🟡', '🔴'].map((c) => (
            <span key={c} className="text-xs opacity-70">{c}</span>
          ))}
        </div>
      </div>

      {/* Phase content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {phase === 'menu' && <ModeMenu onSelect={handleSelectMode} />}

        {phase === 'upload' && (
          <ImageUploader
            subMode={subMode}
            onUploaded={handleUploaded}
            onBack={() => setPhase('menu')}
          />
        )}

        {phase === 'loading' && <LoadingScreen />}

        {phase === 'result' && result?.type === 'blueprint' && (
          <BlueprintResult
            name={result.name}
            bricks={result.bricks}
            onImport={handleImport}
            onRetry={handleRetry}
            onMenu={handleMenu}
          />
        )}

        {phase === 'result' && result?.type === 'suggestions' && (
          <SuggestionResult
            items={result.items}
            onRetry={handleRetry}
            onMenu={handleMenu}
          />
        )}
      </div>
    </div>
  );
}
