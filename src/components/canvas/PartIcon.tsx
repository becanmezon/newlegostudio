import type { ReactElement } from 'react';
import type { PartCategory } from './types';

const STROKE = 'rgba(0,0,0,0.22)';

function BrickSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <rect x="3" y="9" width="30" height="19" rx="3" fill={color} stroke={STROKE} strokeWidth="1.5"/>
      {[[11,16],[25,16],[11,24],[25,24]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill={color} stroke={STROKE} strokeWidth="1.2"/>
      ))}
      <rect x="3" y="9" width="30" height="6" rx="3" fill="rgba(255,255,255,0.18)"/>
    </svg>
  );
}

function PlateSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <rect x="2" y="17" width="32" height="9" rx="3" fill={color} stroke={STROKE} strokeWidth="1.5"/>
      {[7, 14, 22, 29].map(cx => (
        <circle key={cx} cx={cx} cy={17} r="3.5" fill={color} stroke={STROKE} strokeWidth="1.2"/>
      ))}
      <rect x="2" y="17" width="32" height="4" rx="3" fill="rgba(255,255,255,0.18)"/>
    </svg>
  );
}

function RoofSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <polygon
        points="18,4 33,32 3,32"
        fill={color}
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="18" y1="4" x2="18" y2="32" stroke="rgba(0,0,0,0.12)" strokeWidth="1" strokeDasharray="2,2"/>
      <polygon points="18,4 33,32 3,32" fill="rgba(255,255,255,0.12)"/>
    </svg>
  );
}

function RoundSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <circle cx="18" cy="18" r="14" fill={color} stroke={STROKE} strokeWidth="1.5"/>
      <circle cx="18" cy="18" r="7" fill="rgba(255,255,255,0.15)" stroke={STROKE} strokeWidth="1"/>
      <circle cx="18" cy="18" r="3" fill={color} stroke={STROKE} strokeWidth="0.8"/>
    </svg>
  );
}

function FrameSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <rect x="3" y="5" width="30" height="26" rx="3" fill={color} stroke={STROKE} strokeWidth="1.5"/>
      <rect x="9" y="10" width="18" height="16" rx="2" fill="rgba(147,210,255,0.65)" stroke={STROKE} strokeWidth="1"/>
      <line x1="18" y1="10" x2="18" y2="26" stroke={STROKE} strokeWidth="0.8"/>
    </svg>
  );
}

function SpecialSvg({ color }: { color: string }) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a1 = (i * 60 - 90) * (Math.PI / 180);
    const a2 = ((i * 60 + 30) - 90) * (Math.PI / 180);
    pts.push(`${18 + 14 * Math.cos(a1)},${18 + 14 * Math.sin(a1)}`);
    pts.push(`${18 + 6 * Math.cos(a2)},${18 + 6 * Math.sin(a2)}`);
  }
  return (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
      <polygon
        points={pts.join(' ')}
        fill={color}
        stroke={STROKE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SVG_MAP: Record<PartCategory, (props: { color: string }) => ReactElement> = {
  brick: BrickSvg,
  plate: PlateSvg,
  roof: RoofSvg,
  round: RoundSvg,
  frame: FrameSvg,
  special: SpecialSvg,
};

export function PartIcon({ category, color, size = 36 }: {
  category: PartCategory;
  color: string;
  size?: number;
}) {
  const Svg = SVG_MAP[category];
  return (
    <div style={{ width: size, height: size }} className="flex-shrink-0">
      <Svg color={color} />
    </div>
  );
}
