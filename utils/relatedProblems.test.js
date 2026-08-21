import { findRelatedProblems } from './relatedProblems';

const problems = [
  { id: '1', title: 'A', tagIds: [1, 2] },
  { id: '2', title: 'B', tagIds: [2, 3] },
  { id: '3', title: 'C', tagIds: [2] },
  { id: '4', title: 'D', tagIds: [9] },
];

describe('findRelatedProblems', () => {
  test('returns nothing when no tags are given', () => {
    expect(findRelatedProblems(problems, [])).toEqual([]);
  });

  test('only returns problems sharing at least one tag', () => {
    const related = findRelatedProblems(problems, [3]);
    expect(related.map((p) => p.id)).toEqual(['2']);
  });

  test('sorts by number of overlapping tags, most first', () => {
    const related = findRelatedProblems(problems, [1, 2]);
    // problem 1 shares 2 tags, problems 2 and 3 share 1 each
    expect(related[0].id).toBe('1');
    expect(related.map((p) => p.id).slice(1).sort()).toEqual(['2', '3']);
  });

  test('excludes the given problem id even if it matches', () => {
    const related = findRelatedProblems(problems, [1, 2], '1');
    expect(related.some((p) => p.id === '1')).toBe(false);
  });

  test('compares tag ids across string/number boundaries', () => {
    const related = findRelatedProblems(problems, ['2']);
    expect(related.map((p) => p.id).sort()).toEqual(['1', '2', '3']);
  });
});