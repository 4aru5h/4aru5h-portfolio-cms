import { useEffect, useState } from 'react';

interface ClockSnapshot {
  ist: string;
  utc: string;
}

function readClocks(): ClockSnapshot {
  const now = new Date();
  const ist = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(now)
    .toUpperCase();

  const utc = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);

  return { ist, utc: `${utc} UTC` };
}

export function useLiveClock(): ClockSnapshot {
  const [snapshot, setSnapshot] = useState<ClockSnapshot>(readClocks);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSnapshot(readClocks());
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  return snapshot;
}
