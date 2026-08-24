import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../auth/authSlice';
import { useGetProblemsQuery } from '../problems/problemsApi';
import { useGetAnswersQuery } from '../answers/answersApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import { sameId } from '../../utils/id';
import {
  calculateReputationScore,
  getReputationBadge,
  getProgressToNextTier,
} from '../../utils/reputation';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);

  const { data: problems = [], isLoading: loadingProblems, error: problemsError } =
    useGetProblemsQuery();
  const { data: answers = [], isLoading: loadingAnswers, error: answersError } =
    useGetAnswersQuery();

  const stats = useMemo(() => {
    if (!user) return { questions: 0, answers: 0, votes: 0 };

    const myProblems = problems.filter((p) => sameId(p.userId, user.id));
    const myAnswers = answers.filter((a) => sameId(a.userId, user.id));
    const votes =
      myProblems.reduce((sum, p) => sum + (p.votes ?? 0), 0) +
      myAnswers.reduce((sum, a) => sum + (a.votes ?? 0), 0);

    return { questions: myProblems.length, answers: myAnswers.length, votes };
  }, [problems, answers, user]);

  const reputation = useMemo(() => {
    const score = calculateReputationScore(stats.questions + stats.answers + stats.votes);
    return {
      score,
      badge: getReputationBadge(score),
      progress: getProgressToNextTier(score),
    };
  }, [stats]);

  if (!user) return null;

  const isLoading = loadingProblems || loadingAnswers;
  const loadError = problemsError || answersError;

  return (
    <div className="page">
      <div className="page-title-header">
        <div>
          <h1>Your Profile</h1>
          <p>Account details and community standing.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => dispatch(logout())}>
          Log out
        </button>
      </div>

      <div className="card">
        <h3>{user.name}</h3>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Cohort:</strong> {user.cohort ?? '—'}
        </p>
        <p>
          <strong>Role:</strong>{' '}
          <span className={`badge ${user.role === 'admin' ? 'badge-solved' : 'badge-open'}`}>
            {user.role ?? 'student'}
          </span>
        </p>
      </div>

      {isLoading && <Loading label="Loading your activity…" />}
      {loadError && <ErrorMessage error={loadError} fallback="Couldn't load your activity." />}

      {!isLoading && !loadError && (
        <>
          <div className="admin-stat-row">
            <div className="admin-stat-card admin-stat-card-navy">
              <span className="admin-stat-value">{stats.questions}</span>
              <span>Questions asked</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-value">{stats.answers}</span>
              <span>Answers posted</span>
            </div>
            <div className="admin-stat-card admin-stat-card-accent">
              <span className="admin-stat-value">{stats.votes}</span>
              <span>Votes received</span>
            </div>
          </div>

          <div className="card">
            <h3>Reputation — {reputation.badge}</h3>
            <p>{reputation.score} points</p>
            <div className="sidebar-progress">
              <div className="sidebar-progress-fill" style={{ width: `${reputation.progress}%` }} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
