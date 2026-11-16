import { useId } from 'react';

interface HalftoneFieldProps {
  variant?: 'hero-top' | 'hero-left' | 'experience' | 'footer';
  className?: string;
}

export function HalftoneField({ variant = 'hero-top', className = '' }: HalftoneFieldProps) {
  const uid = useId().replace(/:/g, '');
  const fineId = `ht-fine-${uid}`;
  const midId = `ht-mid-${uid}`;
  const mintId = `ht-mint-${uid}`;

  return (
    <div className={`halftone-field halftone-${variant} ${className}`} aria-hidden="true">
      <svg
        className="halftone-svg"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <pattern id={fineId} width="6" height="6" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="#2A2A27" />
          </pattern>
          <pattern id={midId} width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.6" fill="#3D3D38" />
            <circle cx="8" cy="8" r="1" fill="#262623" />
          </pattern>
          <pattern id={mintId} width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.4" fill="#7FF4B0" fillOpacity="0.42" />
          </pattern>
        </defs>

        <rect width="800" height="400" fill="#0E0E0D" />
        <rect width="800" height="400" fill={`url(#${fineId})`} />

        {variant === 'hero-top' && (
          <>
            <path d="M 380 0 L 800 0 L 800 400 L 140 400 Z" fill={`url(#${midId})`} />
            <path d="M 520 40 C 610 110, 680 210, 740 360 L 800 360 L 800 40 Z" fill={`url(#${mintId})`} />
            <g className="halftone-drift">
              <circle cx="560" cy="200" r="168" stroke="#30302C" strokeWidth="1.2" />
              <circle cx="560" cy="200" r="118" stroke="#7FF4B0" strokeOpacity="0.35" strokeWidth="1.2" />
              <path d="M 390 200 L 730 200 M 560 30 L 560 370" stroke="#282825" strokeWidth="1" />
              <polygon points="560,72 678,256 442,256" stroke="#F4F4F0" strokeOpacity="0.22" strokeWidth="1.2" />
            </g>
          </>
        )}

        {variant === 'hero-left' && (
          <>
            <path d="M 0 0 L 660 0 L 420 400 L 0 400 Z" fill={`url(#${midId})`} />
            <path d="M 480 0 L 800 0 L 800 220 L 360 220 Z" fill={`url(#${mintId})`} />
            <g className="halftone-drift">
              <path
                d="M 80 340 C 210 290, 310 150, 480 80 C 590 36, 700 110, 760 210"
                stroke="#7FF4B0"
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />
              <path
                d="M 40 280 C 170 230, 290 110, 450 50"
                stroke="#F4F4F0"
                strokeOpacity="0.22"
                strokeWidth="1"
              />
              <rect x="260" y="130" width="120" height="120" stroke="#3A3A35" strokeWidth="1.2" />
            </g>
          </>
        )}

        {variant === 'experience' && (
          <>
            <path d="M 0 0 L 800 0 L 800 400 L 0 400 Z" fill={`url(#${midId})`} />
            <path d="M 460 0 L 800 0 L 800 400 L 620 400 Z" fill={`url(#${mintId})`} />
            <g className="halftone-drift">
              <circle cx="620" cy="200" r="145" stroke="#F4F4F0" strokeOpacity="0.22" strokeWidth="1.2" />
              <circle cx="620" cy="200" r="95" stroke="#7FF4B0" strokeOpacity="0.42" strokeWidth="1.2" />
              <line x1="120" y1="200" x2="765" y2="200" stroke="#32322E" strokeWidth="1" />
            </g>
          </>
        )}

        {variant === 'footer' && (
          <>
            <path d="M 0 0 L 800 0 L 800 400 L 0 400 Z" fill={`url(#${midId})`} />
            <path d="M 280 0 L 520 0 L 640 400 L 160 400 Z" fill={`url(#${mintId})`} fillOpacity="0.7" />
            <g className="halftone-drift">
              <path
                d="M 400 32 L 545 368 L 492 368 L 456 276 L 344 276 L 308 368 L 255 368 Z"
                stroke="#F4F4F0"
                strokeOpacity="0.24"
                strokeWidth="1.6"
              />
              <polygon points="400,118 438,224 362,224" stroke="#7FF4B0" strokeOpacity="0.48" strokeWidth="1.4" />
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
