/** Kinetic type band: two rows that slide in opposite directions as you scroll. Decorative. */
export function Marquee({ lines }: { lines: [string, string] }) {
  const row = (text: string) => Array.from({ length: 4 }, () => text).join('');
  return (
    <div className="band" aria-hidden="true">
      <div className="band-row">
        <div className="px" data-px="-320" data-drift="-28">
          <span className="band-text">{row(lines[0])}</span>
        </div>
      </div>
      <div className="band-row band-row-alt">
        <div className="px" data-px="320" data-drift="28">
          <span className="band-text band-text-outline">{row(lines[1])}</span>
        </div>
      </div>
    </div>
  );
}
