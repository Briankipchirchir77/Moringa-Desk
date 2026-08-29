import { useGetAnswersByProblemQuery } from './answersApi';
import AnswerItem from './AnswerItem';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import { sameId } from '../../utils/id';

export default function AnswerList({ problem, currentUser }) {
  const { data: answers = [], isLoading, error } = useGetAnswersByProblemQuery(problem.id);

  if (isLoading) return <Loading label="Loading answers…" />;
  if (error) return <ErrorMessage error={error} fallback="Couldn't load answers." />;
  if (answers.length === 0) {
    return <p className="empty-state">No answers yet — be the first to help out.</p>;
  }

  // accepted solution first, then highest-voted
  const sorted = [...answers].sort((a, b) => {
    const aSolved = sameId(a.id, problem.solvedAnswerId);
    const bSolved = sameId(b.id, problem.solvedAnswerId);
    if (aSolved !== bSolved) return aSolved ? -1 : 1;
    return (b.votes ?? 0) - (a.votes ?? 0);
  });

  return (
    <ul className="answer-list">
      {sorted.map((answer) => (
        <AnswerItem
          key={answer.id}
          answer={answer}
          problem={problem}
          currentUser={currentUser}
          isAccepted={sameId(answer.id, problem.solvedAnswerId)}
        />
      ))}
    </ul>
  );
}
