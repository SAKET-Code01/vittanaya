import React from 'react';

/**
 * Japanese Hanko Stamp (Red seal '印' / '決')
 */
export function JapaneseHankoStamp({ className = 'w-4 h-4' }) {
  return (
    <span
      className={`inline-flex items-center justify-center bg-[#C83434] text-white font-serif font-bold text-[10px] rounded-sm px-1 py-0.5 shadow-xs select-none ${className}`}
      title="Official Seal"
      style={{ border: '1px solid #A82020', lineHeight: 1 }}
    >
      印
    </span>
  );
}

/**
 * VITTANAYA Circular Laurel / Bamboo Emblem with 'V'
 */
export function VittanayaEmblem({ size = 38, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      {/* Outer subtle circle */}
      <circle cx="22" cy="22" r="21" stroke="#1B3B2B" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="3 2" />
      <circle cx="22" cy="22" r="19" stroke="#1B3B2B" strokeWidth="1.2" />
      
      {/* Bamboo / Laurel Leaves Ring */}
      <g stroke="#1B3B2B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left wreath branch */}
        <path d="M 12 30 C 9 24, 9 18, 14 12" />
        <path d="M 10 26 C 7 24, 8 21, 11 23" fill="#1B3B2B" fillOpacity="0.8" />
        <path d="M 10 20 C 7 18, 9 15, 12 17" fill="#1B3B2B" fillOpacity="0.8" />
        <path d="M 12 14 C 10 12, 13 9, 15 12" fill="#1B3B2B" fillOpacity="0.8" />
        
        {/* Right wreath branch */}
        <path d="M 32 30 C 35 24, 35 18, 30 12" />
        <path d="M 34 26 C 37 24, 36 21, 33 23" fill="#1B3B2B" fillOpacity="0.8" />
        <path d="M 34 20 C 37 18, 35 15, 32 17" fill="#1B3B2B" fillOpacity="0.8" />
        <path d="M 32 14 C 34 12, 31 9, 29 12" fill="#1B3B2B" fillOpacity="0.8" />
      </g>

      {/* Serif Monogram 'V' */}
      <text
        x="22"
        y="27"
        textAnchor="middle"
        fontFamily="Cinzel, Georgia, serif"
        fontSize="17"
        fontWeight="700"
        fill="#102A1E"
      >
        V
      </text>
    </svg>
  );
}

/**
 * Concentric Radar Map for Market Snapshot (5-10 km radius)
 */
export function RadarMapGraphic({ className = 'w-44 h-44' }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Concentric rings */}
      <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Ring 10km */}
        <circle cx="100" cy="100" r="92" stroke="#607267" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
        {/* Ring 7.5km */}
        <circle cx="100" cy="100" r="72" stroke="#607267" strokeWidth="1" opacity="0.4" />
        {/* Ring 5km with soft tint */}
        <circle cx="100" cy="100" r="52" fill="#E8F1EC" stroke="#4A7C59" strokeWidth="1.2" opacity="0.85" />
        {/* Inner Core 2.5km */}
        <circle cx="100" cy="100" r="32" fill="#D2E3D8" stroke="#2F7757" strokeWidth="1.2" opacity="0.95" />

        {/* Crosshair grid lines */}
        <line x1="100" y1="8" x2="100" y2="192" stroke="#607267" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.35" />
        <line x1="8" y1="100" x2="192" y2="100" stroke="#607267" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.35" />

        {/* Outer Node Indicators (Shop/Store icons around perimeter) */}
        {/* North */}
        <rect x="94" y="2" width="12" height="12" rx="3" fill="#FAF7F2" stroke="#2F7757" strokeWidth="1.5" />
        <path d="M 97 7 L 103 7 M 97 10 L 103 10" stroke="#2F7757" strokeWidth="1.2" strokeLinecap="round" />
        
        {/* East */}
        <rect x="186" y="94" width="12" height="12" rx="3" fill="#FAF7F2" stroke="#2F7757" strokeWidth="1.5" />
        <path d="M 189 99 L 195 99 M 189 102 L 195 102" stroke="#2F7757" strokeWidth="1.2" strokeLinecap="round" />

        {/* South */}
        <rect x="94" y="186" width="12" height="12" rx="3" fill="#FAF7F2" stroke="#2F7757" strokeWidth="1.5" />
        <path d="M 97 191 L 103 191 M 97 194 L 103 194" stroke="#2F7757" strokeWidth="1.2" strokeLinecap="round" />

        {/* West */}
        <rect x="2" y="94" width="12" height="12" rx="3" fill="#FAF7F2" stroke="#2F7757" strokeWidth="1.5" />
        <path d="M 5 99 L 11 99 M 5 102 L 11 102" stroke="#2F7757" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Center Location Pin */}
      <div className="absolute flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-[#102A1E] flex items-center justify-center shadow-md text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Circular Gauge for Business Verdict (78%)
 */
export function CircularScoreGauge({ score = 78, size = 150, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc angle spans ~270 degrees
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (arcLength * score) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-135">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Active Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4EBA7D"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-extrabold text-white tracking-tight leading-none">
          {score}%
        </span>
      </div>
    </div>
  );
}

/**
 * Circular Donut Gauge for Demand Potential (High)
 */
export function DemandPotentialDonut({ size = 130 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        {/* Green segment (High) */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#2F7757"
          strokeWidth="10"
          strokeDasharray="140 240"
          strokeDashoffset="0"
          strokeLinecap="round"
        />
        {/* Amber segment */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#D4A343"
          strokeWidth="10"
          strokeDasharray="60 240"
          strokeDashoffset="-145"
          strokeLinecap="round"
        />
        {/* Red/Coral tiny segment */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#DC2626"
          strokeWidth="10"
          strokeDasharray="25 240"
          strokeDashoffset="-210"
          strokeLinecap="round"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
        <span className="text-[11px] font-semibold text-[#445249] leading-tight">
          Demand Potential
        </span>
        <span className="text-base font-extrabold text-[#1A211D] leading-tight mt-0.5">
          High
        </span>
      </div>
    </div>
  );
}

/**
 * Sumi-e Japanese Misty Mountain Landscape Artwork with Red Torii Gate
 */
export function JapaneseLandscapeBg({ className = '' }) {
  return (
    <svg
      viewBox="0 0 700 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full select-none pointer-events-none ${className}`}
      preserveAspectRatio="xMaxYMax slice"
    >
      <defs>
        <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0" />
          <stop offset="60%" stopColor="#FAF7F2" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4A343" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D4A343" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Morning Sun Disk */}
      <circle cx="610" cy="90" r="32" fill="url(#sunGrad)" />

      {/* Distant Mountain Ridge 1 (Faint ink wash) */}
      <path
        d="M 50 180 Q 150 120, 240 140 T 430 110 Q 520 80, 600 130 T 720 120 L 720 240 L 50 240 Z"
        fill="#A6B5AC"
        fillOpacity="0.25"
      />

      {/* Mid Mountain Ridge 2 (Medium ink) */}
      <path
        d="M 120 200 Q 230 135, 340 165 T 520 125 Q 600 140, 680 160 L 720 240 L 120 240 Z"
        fill="#819388"
        fillOpacity="0.32"
      />

      {/* Foreground Mountain Ridge with Pines (Dark ink) */}
      <path
        d="M 280 220 Q 380 160, 480 185 T 640 150 Q 680 165, 720 175 L 720 240 L 280 240 Z"
        fill="#445249"
        fillOpacity="0.4"
      />

      {/* Pine Tree Clusters */}
      <g fill="#2D3832" fillOpacity="0.55">
        {/* Pine 1 */}
        <polygon points="360,185 352,198 368,198" />
        <polygon points="360,178 354,188 366,188" />
        <polygon points="360,172 356,180 364,180" />
        {/* Pine 2 */}
        <polygon points="375,190 368,202 382,202" />
        <polygon points="375,183 370,192 380,192" />
        {/* Pine 3 */}
        <polygon points="490,188 483,200 497,200" />
        <polygon points="490,182 485,190 495,190" />
        {/* Pine 4 */}
        <polygon points="505,194 498,206 512,206" />
      </g>

      {/* Japanese Traditional Torii Gate (Lacquer Red/Black) */}
      <g transform="translate(540, 148) scale(0.65)">
        {/* Top curved main lintel (Kasagi) */}
        <path d="M 0 8 Q 35 0, 70 8 L 68 14 Q 35 8, 2 14 Z" fill="#B91C1C" />
        <path d="M 4 5 Q 35 -1, 66 5 L 64 8 Q 35 3, 6 8 Z" fill="#1A211D" />
        {/* Second lintel (Nuki) */}
        <rect x="6" y="20" width="58" height="5" rx="1" fill="#B91C1C" />
        {/* Left Pillar (Hashira) */}
        <rect x="16" y="14" width="7" height="60" rx="1" fill="#B91C1C" />
        <rect x="14" y="68" width="11" height="6" rx="1" fill="#1A211D" />
        {/* Right Pillar (Hashira) */}
        <rect x="47" y="14" width="7" height="60" rx="1" fill="#B91C1C" />
        <rect x="45" y="68" width="11" height="6" rx="1" fill="#1A211D" />
        {/* Central tie (Gakuzuka) */}
        <rect x="33" y="14" width="4" height="6" fill="#1A211D" />
      </g>

      {/* Mist Overlay at base */}
      <rect x="0" y="160" width="700" height="80" fill="url(#mistGrad)" />
    </svg>
  );
}

/**
 * 3D-styled AI Mascot Companion ("VITTANAYA Tanuki/Robot")
 */
export function AiMascotAvatar({ size = 52, className = '' }) {
  return (
    <div
      className={`relative flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Head/Body Capsule in glossy porcelain/white */}
        <defs>
          <radialGradient id="headShine" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#E6ECE8" />
            <stop offset="100%" stopColor="#CCD6D0" />
          </radialGradient>
          <linearGradient id="visorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0F291E" />
            <stop offset="100%" stopColor="#06130D" />
          </linearGradient>
          <linearGradient id="kimonoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2F7757" />
            <stop offset="100%" stopColor="#143828" />
          </linearGradient>
        </defs>

        {/* Ears (Cute rounded tanuki/robot ears) */}
        <circle cx="28" cy="24" r="11" fill="url(#kimonoGrad)" stroke="#143828" strokeWidth="2" />
        <circle cx="28" cy="24" r="6" fill="#A6B5AC" />
        <circle cx="72" cy="24" r="11" fill="url(#kimonoGrad)" stroke="#143828" strokeWidth="2" />
        <circle cx="72" cy="24" r="6" fill="#A6B5AC" />

        {/* Head Outer */}
        <rect x="20" y="16" width="60" height="54" rx="27" fill="url(#headShine)" stroke="#CCD6D0" strokeWidth="2" />

        {/* Dark High-Tech Visor / Face Screen */}
        <rect x="27" y="27" width="46" height="26" rx="13" fill="url(#visorGrad)" />

        {/* Expressive Glowing Mint Eyes */}
        <ellipse cx="39" cy="40" rx="4.5" ry="5.5" fill="#4EBA7D" className="animate-pulse" />
        <circle cx="41" cy="38" r="1.5" fill="#FFFFFF" />
        <ellipse cx="61" cy="40" rx="4.5" ry="5.5" fill="#4EBA7D" className="animate-pulse" />
        <circle cx="63" cy="38" r="1.5" fill="#FFFFFF" />

        {/* Cheerful mouth line */}
        <path d="M 47 46 Q 50 49 53 46" stroke="#4EBA7D" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Lower Body / Kimono Robe */}
        <path
          d="M 28 66 L 38 90 L 62 90 L 72 66 Q 50 74 28 66 Z"
          fill="url(#kimonoGrad)"
          stroke="#0F291E"
          strokeWidth="1.5"
        />

        {/* Gold Trim Collar */}
        <path d="M 38 68 L 50 82 L 62 68" stroke="#D4A343" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Gold Monogram Badge on Chest */}
        <circle cx="50" cy="80" r="4.5" fill="#D4A343" />
        <text x="50" y="83" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0F291E">
          V
        </text>
      </svg>
    </div>
  );
}

/**
 * Bamboo silhouette for background watermark
 */
export function BambooWatermark({ className = 'w-32 h-32' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none ${className}`}
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12">
        {/* Stalk 1 */}
        <path d="M 80 95 L 82 70 M 82 68 L 84 40 M 84 38 L 86 10" />
        {/* Bamboo leaves */}
        <path d="M 82 70 C 70 65, 60 70, 50 78" />
        <path d="M 82 70 C 74 60, 68 55, 58 58" />
        <path d="M 84 40 C 72 35, 65 38, 52 45" />
        <path d="M 84 40 C 78 30, 72 26, 60 30" />
        {/* Stalk 2 */}
        <path d="M 94 95 L 95 65 M 95 63 L 96 35 M 96 33 L 97 10" />
        <path d="M 95 65 C 88 58, 80 56, 70 62" />
        <path d="M 96 35 C 88 28, 82 25, 72 30" />
      </g>
    </svg>
  );
}
