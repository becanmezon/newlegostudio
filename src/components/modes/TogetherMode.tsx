const STUD_BG = {
  backgroundColor: '#4ade80',
  backgroundImage: [
    'radial-gradient(ellipse at 38% 28%, rgba(255,255,255,0.38) 28%, transparent 46%)',
    'radial-gradient(circle at 50% 50%, #16a34a 42%, transparent 42%)',
  ].join(', '),
  backgroundSize: '28px 28px',
} as const;

export function TogetherMode() {
  return (
    <div className="flex h-full">
      {/* ── PDF Viewer (Left) ── */}
      <div className="flex-1 flex flex-col bg-green-50 border-r-4 border-green-200 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <span className="text-xl">📖</span>
          <p className="text-white font-black text-lg">せつめいしょ</p>
        </div>

        {/* PDF placeholder body */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5">
          {/* Mock PDF page */}
          <div className="relative w-full max-w-xs">
            <div className="bg-white rounded-2xl shadow-xl border-4 border-green-100 p-6 flex flex-col gap-3">
              {/* Fake page content */}
              <div className="flex justify-between items-center mb-2">
                <div className="w-8 h-8 bg-green-200 rounded" />
                <div className="h-3 w-1/3 bg-gray-200 rounded-full" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2 bg-gray-200 rounded-full w-full" />
                    <div className="h-2 bg-gray-100 rounded-full w-3/4" />
                  </div>
                </div>
              ))}
              <div className="mt-2 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                <span className="text-3xl opacity-30">🧱</span>
              </div>
            </div>

            {/* Overlay "upload" CTA */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4">
              <span className="text-6xl">📄</span>
              <div className="text-center">
                <p className="text-lg font-black text-green-700 mb-1">せつめいしょをひらこう！</p>
                <p className="text-xs text-gray-400">PDFをアップロードしてね</p>
              </div>
              <button
                disabled
                className="bg-green-400 text-white font-black px-5 py-2.5 rounded-2xl text-sm shadow cursor-not-allowed opacity-70 flex items-center gap-2"
              >
                <span>📂</span>
                <span>ファイルをえらぶ</span>
              </button>
            </div>
          </div>

          {/* Coming soon badge */}
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-black px-3 py-1.5 rounded-full border-2 border-green-200">
            🚧 じゅんびちゅう…
          </span>
        </div>
      </div>

      {/* ── Canvas (Right) ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas header */}
        <div className="bg-green-700 px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <span className="text-xl">🔨</span>
          <p className="text-white font-black text-lg">くみたてエリア</p>
        </div>

        {/* LEGO Baseplate */}
        <div className="flex-1 relative overflow-hidden" style={STUD_BG}>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-white/85 backdrop-blur-sm rounded-3xl px-10 py-8 text-center shadow-2xl border-4 border-white">
              <p className="text-7xl mb-3">🧩</p>
              <p className="text-2xl font-black text-gray-600 mb-1">ここにつくろう！</p>
              <p className="text-sm text-gray-400 mb-4">
                せつめいしょをみながら<br />つくってみよう
              </p>
              <span className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-600 text-xs font-black px-3 py-1.5 rounded-full border-2 border-orange-200">
                🚧 じゅんびちゅう…
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
