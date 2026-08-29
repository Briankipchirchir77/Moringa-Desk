import {
  useGetProblemsQuery,
  useUpdateProblemMutation,
  useDeleteProblemMutation,
} from '../problems/problemsApi';
import {
  useGetAnswersQuery,
  useUpdateAnswerMutation,
  useDeleteAnswerMutation,
} from '../answers/answersApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';

// NOTE: json-server doesn't cascade-delete related records, so removing a
// problem here leaves its answers orphaned in db.json. The real backend
// should cascade this; flag it if that matters before launch.
export default function AdminContentPage() {
  const {
    data: problems = [],
    isLoading: loadingProblems,
    error: problemsError,
  } = useGetProblemsQuery();
  const {
    data: answers = [],
    isLoading: loadingAnswers,
    error: answersError,
  } = useGetAnswersQuery();

  const [updateProblem] = useUpdateProblemMutation();
  const [deleteProblem] = useDeleteProblemMutation();
  const [updateAnswer] = useUpdateAnswerMutation();
  const [deleteAnswer] = useDeleteAnswerMutation();

  if (loadingProblems || loadingAnswers) return <Loading label="Loading flagged content…" />;
  if (problemsError || answersError) {
    return <ErrorMessage error={problemsError || answersError} fallback="Couldn't load content." />;
  }

  const flaggedProblems = problems.filter((p) => p.flagged);
  const flaggedAnswers = answers.filter((a) => a.flagged);

  return (
    <div className="admin-content">
      <section>
        <h2>Flagged problems ({flaggedProblems.length})</h2>
        {flaggedProblems.length === 0 && (
          <p className="empty-state">Nothing flagged right now.</p>
        )}
        <ul className="admin-flag-list">
          {flaggedProblems.map((problem) => (
            <li key={problem.id}>
              <p>{problem.title}</p>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => updateProblem({ id: problem.id, flagged: false })}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    if (window.confirm('Remove this problem and its answers?')) {
                      deleteProblem(problem.id);
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Flagged answers ({flaggedAnswers.length})</h2>
        {flaggedAnswers.length === 0 && (
          <p className="empty-state">Nothing flagged right now.</p>
        )}
        <ul className="admin-flag-list">
          {flaggedAnswers.map((answer) => (
            <li key={answer.id}>
              <p>{answer.body}</p>
              <div className="admin-row-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => updateAnswer({ id: answer.id, flagged: false })}
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    if (window.confirm('Remove this answer?')) {
                      deleteAnswer(answer.id);
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}