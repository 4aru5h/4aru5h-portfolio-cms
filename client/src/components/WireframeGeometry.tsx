import type { Wireframe } from '../data/portfolio';

const DIM = '#3E3E3A';
const MID = '#787872';
const HI = '#B8B8B0';
const MINT = '#7FF4B0';
const BONE = '#F4F4F0';

/** Small line-art glyphs for the toolbox panels. Purely decorative. */
export function WireframeGeometry({ kind }: { kind: Wireframe }) {
  return (
    <div className={`wireframe wireframe-${kind}`} aria-hidden="true">
      <svg viewBox="0 0 140 140" fill="none" className="wireframe-svg">
        {kind === 'radar' && (
          <>
            <circle cx="70" cy="70" r="56" stroke="#52524E" strokeWidth="1.1" />
            <circle cx="70" cy="70" r="38" stroke={MID} strokeWidth="1.1" />
            <circle cx="70" cy="70" r="19" stroke={BONE} strokeOpacity="0.55" strokeWidth="1.1" />
            <line x1="14" y1="70" x2="126" y2="70" stroke={DIM} />
            <line x1="70" y1="14" x2="70" y2="126" stroke={DIM} />
            <g className="wf-spin">
              <line x1="70" y1="70" x2="112" y2="34" stroke={MINT} strokeWidth="1.4" />
              <circle cx="112" cy="34" r="4" fill={MINT} />
            </g>
          </>
        )}

        {kind === 'cube' && (
          <g className="wf-float">
            <polygon points="70,18 118,46 118,94 70,122 22,94 22,46" stroke="#9A9A92" strokeWidth="1.2" />
            <polyline points="22,46 70,74 118,46" stroke="#D4D4CC" strokeWidth="1.2" />
            <line x1="70" y1="74" x2="70" y2="122" stroke="#D4D4CC" strokeWidth="1.2" />
            <polyline points="22,94 70,66 118,94" stroke="#484844" strokeDasharray="3 3" />
            <line x1="70" y1="18" x2="70" y2="66" stroke="#484844" strokeDasharray="3 3" />
            <circle cx="70" cy="74" r="3.5" fill={MINT} />
          </g>
        )}

        {kind === 'orbits' && (
          <>
            <g className="wf-spin">
              <ellipse cx="70" cy="70" rx="54" ry="26" stroke="#8A8A84" strokeWidth="1.15" />
              <ellipse cx="70" cy="70" rx="54" ry="26" transform="rotate(60 70 70)" stroke={HI} strokeWidth="1.15" />
              <ellipse cx="70" cy="70" rx="54" ry="26" transform="rotate(-60 70 70)" stroke="#686862" strokeWidth="1.15" />
            </g>
            <circle cx="70" cy="70" r="5" fill={MINT} />
          </>
        )}

        {kind === 'lattice' && (
          <>
            <g className="wf-spin">
              <circle cx="70" cy="70" r="48" stroke="#52524E" />
              <polygon points="70,22 118,70 70,118 22,70" stroke="#9C9C94" strokeWidth="1.15" />
              <rect x="38" y="38" width="64" height="64" stroke="#6E6E68" />
              <circle cx="70" cy="22" r="3.2" fill={BONE} />
              <circle cx="118" cy="70" r="3.2" fill={MINT} />
              <circle cx="70" cy="118" r="3.2" fill={BONE} />
              <circle cx="22" cy="70" r="3.2" fill={BONE} />
            </g>
            <circle cx="70" cy="70" r="4" fill={MINT} />
          </>
        )}

        {kind === 'nodes' && (
          <g className="wf-float">
            {[34, 70, 106].map((y1) =>
              [46, 94].map((y2) => (
                <line key={`a${y1}-${y2}`} x1="24" y1={y1} x2="70" y2={y2} stroke={DIM} />
              )),
            )}
            {[46, 94].map((y1) => (
              <line key={`b${y1}`} x1="70" y1={y1} x2="116" y2="70" stroke={MID} />
            ))}
            <line x1="24" y1="70" x2="70" y2="46" stroke={MINT} strokeOpacity="0.7" strokeWidth="1.3" />
            <line x1="70" y1="46" x2="116" y2="70" stroke={MINT} strokeOpacity="0.7" strokeWidth="1.3" />
            {[34, 70, 106].map((y) => (
              <circle key={`i${y}`} cx="24" cy={y} r="5" fill="#0E0E0D" stroke={HI} strokeWidth="1.2" />
            ))}
            {[46, 94].map((y) => (
              <circle key={`h${y}`} cx="70" cy={y} r="5" fill="#0E0E0D" stroke={HI} strokeWidth="1.2" />
            ))}
            <circle cx="116" cy="70" r="6" fill={MINT} />
          </g>
        )}
      </svg>
    </div>
  );
}
