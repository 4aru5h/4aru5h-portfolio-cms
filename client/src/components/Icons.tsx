import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 16, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'square' as const,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  };
}

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export const ArrowUp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20V5M6 11l6-6 6 6" />
  </svg>
);

export const ArrowDown = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v15M6 13l6 6 6-6" />
  </svg>
);

export const Download = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 6h18v12H3z" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

export const Copy = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 9h11v11H9z" />
    <path d="M5 15H4V4h11v1" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);

export const Plus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const GitHub = ({ size = 16, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable={false} {...rest}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const LinkedIn = ({ size = 16, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable={false} {...rest}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.14v5.42h-4v-4.8c0-1.15-.02-2.62-1.6-2.62-1.6 0-1.84 1.25-1.84 2.54v4.88h-4V9.75Z" />
  </svg>
);

export const Logo = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden focusable={false}>
    <path d="M7 26 14 6h4l7 20h-4.2l-1.5-4.6h-6.6L11.2 26H7Zm6.8-8h4.4L16 10.8 13.8 18Z" fill="currentColor" />
    <rect x="23" y="21" width="4" height="5" fill="var(--mint)" />
  </svg>
);
