import { useState } from 'react';
import { downloadResume } from '../lib/resume';
import { Download } from './Icons';

interface ResumeButtonProps {
  className?: string;
  label?: string;
  /** Put the icon after the label (panel bars read label-left, icon-right). */
  iconAfter?: boolean;
  onDone?: () => void;
}

/** Generates the résumé PDF from site data on click. */
export function ResumeButton({
  className = 'btn btn-ghost',
  label = 'Download résumé',
  iconAfter = className.split(' ').includes('bar'),
  onDone,
}: ResumeButtonProps) {
  const [state, setState] = useState<'idle' | 'busy' | 'error'>('idle');

  const handleClick = async () => {
    if (state === 'busy') return;
    setState('busy');
    try {
      await downloadResume();
      setState('idle');
      onDone?.();
    } catch {
      setState('error');
      window.setTimeout(() => setState('idle'), 3000);
    }
  };

  const text = <span>{state === 'busy' ? 'Preparing PDF…' : state === 'error' ? 'Try again' : label}</span>;

  return (
    <button type="button" className={className} onClick={handleClick} aria-busy={state === 'busy'}>
      {!iconAfter && <Download size={16} />}
      {text}
      {iconAfter && <Download size={18} />}
    </button>
  );
}
