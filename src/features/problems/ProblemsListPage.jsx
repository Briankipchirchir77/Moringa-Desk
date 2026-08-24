import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetProblemsQuery } from './problemsApi';
import { useGetAnswersQuery } from '../answers/answersApi';
import { useGetTagsQuery } from '../tags/tagsApi';
import { useGetUsersQuery } from '../auth/users/usersApi';
import { selectCurrentUser } from '../auth/authSlice';
import QuestionRow from './QuestionRow';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import { countAnswersByProblem } from '../../utils/answerCounts';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'solved', label: 'Solved' },
  { id: 'most-voted', label: 'Most Voted' },
];

const SORTS = {
  newest: { label: 'Newest', compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  'most-voted': { label: 'Most Voted', compare: (a, b) => (b.votes ?? 0) - (a.votes ?? 0) },
};

export default function ProblemsListPage() {
  const user = useSelector(selectCurrentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  // sourced straight from the URL (not local state) so a search from the
  // topbar navigating here with a new ?search= value is reflected for free
  const search = searchParams.get('search') || '';
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const { data: problems = [], isLoading, error } = useGetProblemsQuery();
  const { data: answers = [] } = useGetAnswersQuery();
  const { data: tags = [] } = useGetTagsQuery();
  const { data: users = [] } = useGetUsersQuery();

  const tagsById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [String(tag.id), tag])),
    [tags],
  );
  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [String(u.id), u])),
    [users],
  );
  const answerCounts = useMemo(() => countAnswersByProblem(answers), [answers]);
  const sortOptions = useMemo(
    () => ({
      ...SORTS,
      'most-answers': {
        label: 'Most Answers',
        compare: (a, b) =>
          (answerCounts[String(b.id)] ?? 0) - (answerCounts[String(a.id)] ?? 0),
      },
    }),
    [answerCounts],
  );

  const visibleProblems = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = problems.filter((problem) => {
      const matchesSearch = !query || problem.title.toLowerCase().includes(query);
      if (!matchesSearch) return false;

      if (filter === 'unanswered') return (answerCounts[String(problem.id)] ?? 0) === 0;
      if (filter === 'solved') return Boolean(problem.solvedAnswerId);
      if (filter === 'most-voted') return true;
      return true;
    });

    const activeSort = filter === 'most-voted' ? sortOptions['most-voted'] : sortOptions[sort];
    return [...list].sort(activeSort.compare);
  }, [problems, search, filter, sort, sortOptions, answerCounts]);

  return (
    <div className="page">
      <div className="page-title-header">
        <div>
          <h1>Questions</h1>
          <p>Real issues Moringa students have hit — and how they got unstuck.</p>
        </div>
        {user && (
          <Link to="/ask" className="btn btn-primary">
            Ask a question
          </Link>
        )}
      </div>

      <input
        type="search"
        className="search-input"
        placeholder="Search questions specifically…"
        value={search}
        onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
        aria-label="Search questions"
      />

      <div className="questions-toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-tab${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <label className="sort-by">
          Sort by:
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="most-voted">Most Voted</option>
            <option value="most-answers">Most Answers</option>
          </select>
        </label>
      </div>

      {isLoading && <Loading label="Loading questions…" />}
      {error && <ErrorMessage error={error} fallback="Couldn't load questions." />}

      {!isLoading && (
        <p className="questions-count">
          Showing <strong>{visibleProblems.length}</strong> total community questions
        </p>
      )}

      {!isLoading && visibleProblems.length === 0 && (
        <p className="empty-state">No questions match your filters yet.</p>
      )}

      <div className="question-row-list">
        {visibleProblems.map((problem) => (
          <QuestionRow
            key={problem.id}
            problem={problem}
            tagsById={tagsById}
            answerCount={answerCounts[String(problem.id)] ?? 0}
            authorName={usersById[String(problem.userId)]?.name ?? 'Unknown'}
          />
        ))}
      </div>
    </div>
  );
}