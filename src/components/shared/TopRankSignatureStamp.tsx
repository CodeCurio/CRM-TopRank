import React from 'react';

interface TopRankSignatureStampProps {
  className?: string;
  width?: number;
  height?: number;
}

export const TopRankSignatureStamp: React.FC<TopRankSignatureStampProps> = ({
  className = '',
  width = 180,
  height = 100,
}) => {
  return (
    <div className={`relative inline-block ${className}`} style={{ width, height }}>
      <svg
        viewBox="0 0 480 270"
        className="w-full h-full object-contain overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Curved Text Paths */}
          <path
            id="topRankArcTop"
            d="M 120,200 A 95,95 0 0,1 310,200"
            fill="none"
          />
          <path
            id="topRankArcBottom"
            d="M 310,200 A 95,95 0 0,1 120,200"
            fill="none"
          />
          <path
            id="topRankArcInnerTop"
            d="M 140,195 A 75,75 0 0,1 290,195"
            fill="none"
          />

          {/* Linear Gradients for Bar Chart Logo */}
          <linearGradient id="barOrange" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="barPurple" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="barBlue" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="arrowGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* --- OFFICIAL TOPRANK DIGITAL SERVICE CIRCULAR STAMP --- */}
        <g transform="translate(15, -60)">
          {/* Outer Ring 1 */}
          <circle cx="215" cy="200" r="102" fill="none" stroke="#1e3a8a" strokeWidth="4.5" />
          {/* Outer Ring 2 */}
          <circle cx="215" cy="200" r="95" fill="none" stroke="#1e3a8a" strokeWidth="2" />
          {/* Inner Ring 1 */}
          <circle cx="215" cy="200" r="72" fill="none" stroke="#1e3a8a" strokeWidth="1.5" />
          {/* Inner Ring 2 */}
          <circle cx="215" cy="200" r="66" fill="none" stroke="#1e3a8a" strokeWidth="1" />

          {/* Curved Text: TOPRANK DIGITAL SERVICE */}
          <text fill="#1e3a8a" fontSize="17.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="1.2">
            <textPath href="#topRankArcTop" startOffset="50%" textAnchor="middle">
              TOPRANK DIGITAL SERVICE
            </textPath>
          </text>

          {/* Inner Curved Text: toprankindia.com */}
          <text fill="#1e3a8a" fontSize="11" fontWeight="800" fontFamily="sans-serif" letterSpacing="0.8">
            <textPath href="#topRankArcInnerTop" startOffset="50%" textAnchor="middle">
              toprankindia.com
            </textPath>
          </text>

          {/* Curved Text: 9305030523 */}
          <text fill="#1e3a8a" fontSize="16" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">
            <textPath href="#topRankArcBottom" startOffset="50%" textAnchor="middle">
              9305030523
            </textPath>
          </text>

          {/* --- CENTRAL TOPRANK LOGO GRAPHIC --- */}
          <g transform="translate(182, 168)">
            {/* Bar 1 (Orange) */}
            <rect x="0" y="24" width="10" height="18" rx="2" fill="url(#barOrange)" />
            {/* Bar 2 (Purple) */}
            <rect x="14" y="14" width="10" height="28" rx="2" fill="url(#barPurple)" />
            {/* Bar 3 (Blue) */}
            <rect x="28" y="6" width="10" height="36" rx="2" fill="url(#barBlue)" />

            {/* Upward Growth Arrow */}
            <path
              d="M -12,28 C -2,22 10,12 22,0 L 15,0 L 26,-4 L 26,7 L 21,2 C 10,12 -2,20 -12,28 Z"
              fill="url(#arrowGradient)"
            />

            {/* Top Dot / Star Sparkle */}
            <circle cx="28" cy="-10" r="4" fill="#ea580c" />
            <path
              d="M 12,-18 L 14,-14 L 18,-12 L 14,-10 L 12,-6 L 10,-10 L 6,-12 L 10,-14 Z"
              fill="#38bdf8"
            />
          </g>
        </g>

        {/* --- OVERLAID HANDWRITTEN BLUE INK SIGNATURE --- */}
        <g stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95">
          {/* Main Loop & Swoop across stamp */}
          <path d="M 85,155 C 80,150 95,120 120,130 C 145,140 180,110 220,95 C 255,80 230,125 210,140 C 190,155 170,175 195,170 C 220,165 260,110 280,125 C 295,135 280,155 260,158 C 240,161 310,150 370,145 C 410,142 435,138 445,138" />
          
          {/* Secondary flourish loop underneath */}
          <path d="M 135,160 C 160,185 230,175 270,160 C 300,150 250,195 215,198 C 190,200 175,190 200,185" strokeWidth="2.8" />
          
          {/* Terminal Signature Dot */}
          <circle cx="445" cy="138" r="3.5" fill="#0f172a" />
          <circle cx="85" cy="155" r="3.5" fill="#0f172a" />
        </g>
      </svg>
    </div>
  );
};
