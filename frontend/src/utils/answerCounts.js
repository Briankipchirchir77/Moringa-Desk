// Groups a flat answers list into a { [problemId]: count } map, so pages
// that list many problems (Questions, Dashboard) can show an answer count
// per row without a query per problem.
export function countAnswersByProblem(answers = []) {
  const counts = {};
  answers.forEach((answer) => {
    const key = String(answer.problemId);
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return counts;
}
