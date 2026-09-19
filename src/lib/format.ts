const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatCount(count: number): string {
  if (count < 1000) {
    return String(count);
  }
  if (count < 1_000_000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}m`;
}

export function timeAgo(timestamp: number, now: number = Date.now()): string {
  const diff = now - timestamp;
  if (diff < MINUTE) {
    return 'Now';
  }
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins}m ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'short' });
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}