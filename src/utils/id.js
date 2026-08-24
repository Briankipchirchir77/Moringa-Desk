// IDs may come back as numbers (mock data) or strings (real API), so
// comparisons across the app go through this helper instead of `===`.
export function sameId(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  return String(a) === String(b);
}
