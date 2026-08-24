import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetProblemByIdQuery,
  useGetProblemsQuery,
  useFollowProblemMutation,
  useVoteProblemMutation,
  useFlagProblemMutation,
} from './problemsApi';
import { useGetAnswersByProblemQuery } from '../answers/answersApi';
import { useGetTagsQuery } from '../tags/tagsApi';
import { useGetUsersQuery } from '../auth/users/usersApi';
import { selectCurrentUser } from '../auth/authSlice';
import AnswerList from '../answers/AnswerList';
import AnswerForm from '../answers/AnswerForm';
import TagBadge from '../../components/common/TagBadge';
import Avatar from '../../components/common/Avatar';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import { sameId } from '../../utils/id';
import { timeAgo } from '../../utils/timeAgo';
import { findRelatedProblems } from '../../utils/relatedProblems';

export default function ProblemDetailPage() {
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);

  const { data: problem, isLoading, error } = useGetProblemByIdQuery(id);
  const { data: tags = [] } = useGetTagsQuery();
  const { data: users = [] } = useGetUsersQuery();
  const { data: allProblems = [] } = useGetProblemsQuery();
  const { data: answers = [] } = useGetAnswersByProblemQuery(id);
  const [followProblem, { isLoading: isFollowToggling }] = useFollowProblemMutation();
  const [voteProblem, { isLoading: isVoting }] = useVoteProblemMutation();
  const [flagProblem, { isLoading: isFlagging }] = useFlagProblemMutation();

  const tagsById = useMemo(
    () => Object.fromEntries(tags.map((tag) => [String(tag.id), tag])),
    [tags],
  );
  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [String(u.id), u])),
    [users],
  );

  const related = useMemo(
    () => findRelatedProblems(allProblems, problem?.tagIds ?? [], problem?.id).slice(0, 5),
    [allProblems, problem],
  );

  const isFollowing = useMemo(
    () => (problem?.followerIds ?? []).some((followerId) => sameId(followerId, user?.id)),
    [problem, user],
  );

  if (isLoading) return <Loading label="Loading question…" />;
  if (error) return <ErrorMessage error={error} fallback="Couldn't load this question." />;
  if (!problem) return null;

  const authorName = usersById[String(problem.userId)]?.name ?? 'Unknown';

  const handleVote = (delta) => {
    voteProblem({ id: problem.id, votes: (problem.votes ?? 0) + delta });
  };

  const handleToggleFollow = () => {
    const followerIds = problem.followerIds ?? [];
    const nextFollowerIds = isFollowing
      ? followerIds.filter((followerId) => !sameId(followerId, user.id))
      : [...followerIds, user.id];
    followProblem({ id: problem.id, followerIds: nextFollowerIds });
  };

  return (
    <div className="page question-detail-page">
      <div className="question-detail-main">
        <div className="question-detail-card">
          <div className="question-detail-vote">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleVote(1)}
              disabled={!user || isVoting}
              aria-label="Upvote this question"
            >
              ▲
            </button>
            <span className="vote-count">{problem.votes ?? 0}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => handleVote(-1)}
              disabled={!user || isVoting}
              aria-label="Downvote this question"
            >
              ▼
            </button>
          </div>

          <div className="question-detail-body">
            <div className="page-header">
              <h1>{problem.title}</h1>
              <div className="admin-row-actions">
                {problem.flagged && <span className="badge badge-flagged">Reported</span>}
                {user && !sameId(user.id, problem.userId) && !problem.flagged && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => flagProblem(problem.id)}
                    disabled={isFlagging}
                  >
                    Report
                  </button>
                )}
                {user && (
                  <button
                    type="button"
                    className={`btn ${isFollowing ? 'btn-ghost' : 'btn-outline'}`}
                    onClick={handleToggleFollow}
                    disabled={isFollowToggling}
                  >
                    {isFollowing ? 'Following' : 'Follow Question'}
                  </button>
                )}
              </div>
            </div>

            <div className="question-detail-author">
              <Avatar name={authorName} size={36} />
              <div>
                <strong>{authorName}</strong>
                <span>{problem.category || 'Software Engineering'}</span>
              </div>
              <span className="question-detail-meta">{timeAgo(problem.createdAt)}</span>
            </div>

            <p className="problem-body">{problem.body}</p>

            <div className="tag-row">
              {(problem.tagIds ?? []).map((tagId) => (
                <TagBadge key={tagId} label={tagsById[String(tagId)]?.name ?? '—'} />
              ))}
            </div>
          </div>
        </div>

        <h2>Answers ({answers.length})</h2>
        <AnswerList problem={problem} currentUser={user} />

        {user ? (
          <AnswerForm problemId={problem.id} userId={user.id} />
        ) : (
          <p className="empty-state">
            <Link to="/login">Log in</Link> to reply.
          </p>
        )}
      </div>

      <aside className="question-detail-side">
        <div className="dashboard-side-card">
          <h2>Related Questions</h2>
          {related.length === 0 ? (
            <p className="empty-state">No related questions yet.</p>
          ) : (
            <ul className="dashboard-followed-list">
              {related.map((p) => (
                <li key={p.id}>
                  <Link to={`/questions/${p.id}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}