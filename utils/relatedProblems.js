// Naive tag-overlap "related problems" lookup, computed client-side over
// the already-fetched problems list. json-server's `_like` filter doesn't
// match against array fields (tagIds), so this can't be pushed down into
// the query — swap for a real backend endpoint once one exists.
export function findRelatedProblems(problems, tagIds = [], excludeId = null) {
  if (!tagIds.length) return [];
  const tagIdSet = new Set(tagIds.map(String));

  return problems
    .filter((problem) => String(problem.id) !== String(excludeId))
    .map((problem) => ({
      problem,
      overlap: (problem.tagIds ?? []).filter((tagId) => tagIdSet.has(String(tagId))).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .map(({ problem }) => problem);
}