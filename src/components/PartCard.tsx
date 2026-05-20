import type { LegoPart } from '../data/parts';

const COLOR_MAP: Record<string, string> = {
  'Black': '#1a1a1a',
  'White': '#f5f5f5',
  'Bright Red': '#c91a09',
  'Bright Blue': '#0055bf',
  'Bright Yellow': '#f2cd37',
  'Bright Green': '#237841',
  'Bright Orange': '#fe8a18',
  'Bright Purple': '#81007b',
  'Bright Yellowish Green': '#a3c225',
  'Bright Reddish Violet': '#c870a0',
  'Dark Green': '#184632',
  'Dark Stone Grey': '#6d6e5c',
  'Dark Orange': '#a95500',
  'Dark Azur': '#078bc9',
  'New Dark Red': '#720e0f',
  'Earth Blue': '#1b2a4a',
  'Earth Green': '#264e36',
  'Medium Stone Grey': '#9b9a95',
  'Medium Azur': '#36aebf',
  'Medium Lavender': '#ac78ba',
  'Medium Lilac': '#2c1577',
  'Medium Nougat': '#aa7d55',
  'Reddish Brown': '#582a12',
  'Sand Yellow': '#d67923',
  'Brick Yellow': '#d9bb7b',
  'Cool Yellow': '#fbe696',
  'Light Purple': '#cda4de',
  'Warm Gold': '#aa8f37',
  'Spring Yellowish Green': '#e2f99a',
  'Flame Yellowish Orange': '#ff8000',
  'Transparent': '#c4e4f5',
  'Transparent Bright Orange': '#f08020',
  'Transparent Red': '#c00000',
  'Multicombination': '#888888',
};

interface Props {
  part: LegoPart;
}

export function PartCard({ part }: Props) {
  const swatchColor = COLOR_MAP[part.color] ?? '#cccccc';
  const isLight = ['White', 'Cool Yellow', 'Bright Yellow', 'Spring Yellowish Green'].includes(part.color);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <div
        className="h-20 flex items-center justify-center"
        style={{ backgroundColor: swatchColor }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="16" width="40" height="26" rx="3" fill={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)'} />
          <rect x="4" y="18" width="40" height="24" rx="3" fill={isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)'} />
          <circle cx="14" cy="12" r="5" fill={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)'} />
          <circle cx="34" cy="12" r="5" fill={isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)'} />
        </svg>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
          {part.partName}
        </p>
        <p className="text-xs text-gray-400 font-mono">#{part.partNumber}</p>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: swatchColor + '33',
              color: isLight ? '#555' : swatchColor,
              border: `1px solid ${swatchColor}66`,
            }}
          >
            {part.color}
          </span>
          <span className="text-xs text-gray-500">×{part.quantity}</span>
        </div>
      </div>
    </div>
  );
}
