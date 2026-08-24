export function sameId(firstId, secondId) {
  return firstId != null && secondId != null && String(firstId) === String(secondId);
}
