import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { useGetProblemsQuery } from '../problems/problemsApi';
import { useGetAnswersQuery } from '../answers/answersApi';
import { useGetTagsQuery } from '../tags/tagsApi';
import { useGetUsersQuery } from '../users/usersApi';
import QuestionRow from '../problems/QuestionRow';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import TagBadge from '../../components/common/TagBadge';
import { sameId } from '../../utils/id';
import { countAnswersByProblem } from '../../utils/answerCounts';
import { calculateReputationScore } from '../../utils/reputation';

export default function DashboardPage() {
  const user = useSelector(selectCurrentUser);

  const { data: problems = [], isLoading: loadingProblems, error: problemsError } =
    useGetProblemsQuery();
  const { data: answers = [], isLoading: loadingAnswers, error: answersError } =
    useGetAnswersQuery();
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

  const stats = useMemo(() => {
    if (!user) return { questions: 0, answers: 0, accepted: 0, reputation: 0 };
    const myProblems = problems.filter((p) => sameId(p.userId, user.id));
    const myAnswers = answers.filter((a) => sameId(a.userId, user.id));
    const accepted = myAnswers.filter((a) =>
      sameId(a.id, problems.find((p) => sameId(p.id, a.problemId))?.solvedAnswerId),
    ).length;
    return {
      questions: myProblems.length,
      answers: myAnswers.length,
      accepted,
      reputation: calculateReputationScore(myProblems.length + myAnswers.length + accepted),
    };
  }, [problems, answers, user]);

  const activeQuestions = useMemo(
    () =>
      [...problems]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [problems],
  );

  const followedQuestions = useMemo(
    () =>
      user
        ? problems.filter((p) => (p.followerIds ?? []).some((id) => sameId(id, user.id))).slice(0, 5)
        : [],
    [problems, user],
  );

  const isLoading = loadingProblems || loadingAnswers;
  const loadError = problemsError || answersError;

  return (
    <div className="page">
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0] ?? 'there'}!</h1>
          <p>
            Search for active cohort problems or post your technical challenge to get direct
            student and technical mentor feedback.
          </p>
        </div>
        <Link to="/ask" className="btn btn-primary">
          Ask a Question
        </Link>
      </div>

      <div className="admin-stat-row">
        <div className="admin-stat-card">
          <span className="admin-stat-value">{stats.questions}</span>
          <span>Questions Asked</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{stats.answers}</span>
          <span>Answers Provided</span>
        </div>
        <div className="admin-stat-card admin-stat-card-accent">
          <span className="admin-stat-value">{stats.accepted}</span>
          <span>Accepted Answers</span>
        </div>
        <div className="admin-stat-card admin-stat-card-navy">
          <span className="admin-stat-value">{stats.reputation}</span>
          <span>My Reputation Points</span>
        </div>
      </div>

      {isLoading && <Loading label="Loading dashboard…" />}
      {loadError && <ErrorMessage error={loadError} fallback="Couldn't load dashboard data." />}

      {!isLoading && !loadError && (
        <div className="dashboard-layout">
          <div>
            <div className="dashboard-section-head">
              <h2>Active Challenges &amp; Questions</h2>
              <Link to="/questions">View all questions →</Link>
            </div>

            {activeQuestions.length === 0 ? (
              <p className="empty-state">No questions posted yet.</p>
            ) : (
              <div className="question-row-list">
                {activeQuestions.map((problem) => (
                  <QuestionRow
                    key={problem.id}
                    problem={problem}
                    tagsById={tagsById}
                    answerCount={answerCounts[String(problem.id)] ?? 0}
                    authorName={usersById[String(problem.userId)]?.name ?? 'Unknown'}
                  />
                ))}
              </div>
            )}
          </div>

          <aside>
            <div className="dashboard-side-card">
              <h2>Trending Cohort Tags</h2>
              <div className="dashboard-tag-cloud">
                {tags.slice(0, 10).map((tag) => (
                  <TagBadge key={tag.id} label={tag.name} />
                ))}
              </div>
            </div>

            <div className="dashboard-side-card">
              <h2>Followed Questions</h2>
              {followedQuestions.length === 0 ? (
                <p className="empty-state">You&rsquo;re not following any questions yet.</p>
              ) : (
                <ul className="dashboard-followed-list">
                  {followedQuestions.map((p) => (
                    <li key={p.id}>
                      <Link to={`/questions/${p.id}`}>{p.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
