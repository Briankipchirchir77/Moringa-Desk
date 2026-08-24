const UNITS = [
  { limit: 3600, divisor: 60, unit: 'minute' },
  { limit: 86400, divisor: 3600, unit: 'hour' },
  { limit: 604800, divisor: 86400, unit: 'day' },
  { limit: 2629800, divisor: 604800, unit: 'week' },
  { limit: 31557600, divisor: 2629800, unit: 'month' },
];

// Renders a timestamp as a short relative string ("5 minutes ago"),
// falling back to a plain date once it's more than a year old.
export function timeAgo(dateInput) {
  if (!dateInput) return '';

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return 'just now';

  for (const { limit, divisor, unit } of UNITS) {
    if (seconds < limit) {
      const value = Math.floor(seconds / divisor);
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }
  }

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
