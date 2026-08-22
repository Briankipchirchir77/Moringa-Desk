import { countAnswersByProblem } from './answerCounts';

describe('countAnswersByProblem', () => {
  test('counts answers grouped by problemId, coercing to string keys', () => {
    const answers = [
      { problemId: 1, id: 'a' },
      { problemId: '1', id: 'b' },
      { problemId: 2, id: 'c' },
    ];
    expect(countAnswersByProblem(answers)).toEqual({ 1: 2, 2: 1 });
  });

  test('returns an empty object for no answers', () => {
    expect(countAnswersByProblem([])).toEqual({});
  });
});
