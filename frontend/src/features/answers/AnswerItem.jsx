import { useVoteAnswerMutation, useMarkAsSolutionMutation, useFlagAnswerMutation } from './answersApi';
import { sameId } from '../../utils/id';

export default function AnswerItem({ answer, problem, currentUser, isAccepted }) {
  const [voteAnswer, { isLoading: isVoting }] = useVoteAnswerMutation();
  const [markAsSolution, { isLoading: isMarking }] = useMarkAsSolutionMutation();
  const [flagAnswer, { isLoading: isFlagging }] = useFlagAnswerMutation();

  const isProblemOwner = currentUser && sameId(currentUser.id, problem.userId);
  const isAnswerAuthor = currentUser && sameId(currentUser.id, answer.userId);

  const handleVote = (delta) => {
    voteAnswer({ id: answer.id, votes: (answer.votes ?? 0) + delta });
  };

  const handleMarkSolution = () => {
    markAsSolution({ problemId: problem.id, answerId: answer.id });
  };

  return (
    <li className={`answer-item${isAccepted ? ' answer-item-accepted' : ''}`}>
      <div className="answer-badges">
        {isAccepted && <span className="badge badge-solved">✓ Marked as useful</span>}
        {answer.flagged && <span className="badge badge-flagged">Reported</span>}
      </div>
      <p>{answer.body}</p>
      <div className="answer-footer">
        <div className="vote-controls">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => handleVote(1)}
            disabled={!currentUser || isVoting}
            aria-label="Upvote this answer"
          >
            ▲
          </button>
          <span className="vote-count">{answer.votes ?? 0}</span>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => handleVote(-1)}
            disabled={!currentUser || isVoting}
            aria-label="Downvote this answer"
          >
            ▼
          </button>
        </div>

        <div className="admin-row-actions">
          {currentUser && !isAnswerAuthor && !answer.flagged && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => flagAnswer(answer.id)}
              disabled={isFlagging}
            >
              Report
            </button>
          )}

          {isProblemOwner && !isAccepted && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleMarkSolution}
              disabled={isMarking}
            >
              Mark as useful
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
