import { useMemo } from 'react';
import { useGetProblemsQuery } from '../problems/problemsApi';
import { useGetAnswersQuery } from '../answers/answersApi';
import { useGetUsersQuery } from '../auth/users/usersApi';
import { useGetTagsQuery } from '../tags/tagsApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';

export default function AdminReportsPage() {
  const { data: problems = [], isLoading: loadingProblems, error: problemsError } =
    useGetProblemsQuery();
  const { data: answers = [], isLoading: loadingAnswers, error: answersError } =
    useGetAnswersQuery();
  const { data: users = [], isLoading: loadingUsers, error: usersError } = useGetUsersQuery();
  const { data: tags = [], isLoading: loadingTags, error: tagsError } = useGetTagsQuery();

  const tagsById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [String(tag.id), tag])),
    [tags],
  );

  const tagCounts = useMemo(() => {
    const counts = new Map();
    problems.forEach((problem) => {
      (problem.tagIds ?? []).forEach((tagId) => {
        const key = String(tagId);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([tagId, count]) => ({ tagId, count, name: tagsById[tagId]?.name ?? 'Unknown' }))
      .sort((a, b) => b.count - a.count);
  }, [problems, tagsById]);

  const contributors = useMemo(() => {
    const stats = new Map();
    answers.forEach((answer) => {
      const key = String(answer.userId);
      const current = stats.get(key) ?? { answers: 0, votes: 0 };
      current.answers += 1;
      current.votes += answer.votes ?? 0;
      stats.set(key, current);
    });
    const usersById = Object.fromEntries(users.map((user) => [String(user.id), user]));
    return [...stats.entries()]
      .map(([userId, stat]) => ({ userId, name: usersById[userId]?.name ?? 'Unknown', ...stat }))
      .sort((a, b) => b.votes - a.votes || b.answers - a.answers)
      .slice(0, 5);
  }, [answers, users]);

  const isLoading = loadingProblems || loadingAnswers || loadingUsers || loadingTags;
  const loadError = problemsError || answersError || usersError || tagsError;

  if (isLoading) return <Loading label="Crunching numbers…" />;
  if (loadError) return <ErrorMessage error={loadError} fallback="Couldn't load report data." />;

  const solvedCount = problems.filter((p) => p.solvedAnswerId).length;
  const solvedRate = problems.length ? Math.round((solvedCount / problems.length) * 100) : 0;

  return (
    <div className="admin-reports">
      <div className="admin-stat-row">
        <div className="admin-stat-card admin-stat-card-navy">
          <span className="admin-stat-value">{problems.length}</span>
          <span>Problems posted</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{answers.length}</span>
          <span>Answers posted</span>
        </div>
        <div className="admin-stat-card admin-stat-card-accent">
          <span className="admin-stat-value">{solvedRate}%</span>
          <span>Marked solved</span>
        </div>
        <div className="admin-stat-card admin-stat-card-navy">
          <span className="admin-stat-value">{users.length}</span>
          <span>Registered users</span>
        </div>
      </div>

      <h2>Most frequent problem categories</h2>
      {tagCounts.length === 0 && <p className="empty-state">No tagged problems yet.</p>}
      <ol className="admin-rank-list">
        {tagCounts.map((tag) => (
          <li key={tag.tagId}>
            <span>{tag.name}</span>
            <span>{tag.count}</span>
          </li>
        ))}
      </ol>

      <h2>Top contributors</h2>
      {contributors.length === 0 && <p className="empty-state">No answers yet.</p>}
      <ol className="admin-rank-list">
        {contributors.map((contributor) => (
          <li key={contributor.userId}>
            <span>{contributor.name}</span>
            <span>
              {contributor.answers} answers · {contributor.votes} votes
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}