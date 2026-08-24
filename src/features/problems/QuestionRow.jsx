import { Link } from 'react-router-dom';
import TagBadge from '../../components/common/TagBadge';
import Avatar from '../../components/common/Avatar';
import { timeAgo } from '../../utils/timeAgo';

// Shared question-row card used by both the Questions list and the
// Dashboard's "Active Challenges & Questions" section.
export default function QuestionRow({ problem, tagsById, answerCount, authorName }) {
  const link = `/questions/${problem.id}`;
  const isSolved = Boolean(problem.solvedAnswerId);

  return (
    <div className="question-row">
      <div className="question-row-stats">
        <div className="question-stat">
          <strong>{problem.votes ?? 0}</strong>
          <span>votes</span>
        </div>
        <div className={`question-stat${answerCount > 0 ? ' question-stat-active' : ''}`}>
          <strong>{answerCount}</strong>
          <span>answers</span>
        </div>
        <div className="question-stat">
          <strong>{problem.views ?? 0}</strong>
          <span>views</span>
        </div>
      </div>

      <div className="question-row-main">
        <Link to={link} className="question-row-title">
          {isSolved && <span className="badge badge-solved-fill">SOLVED</span>}
          {problem.title}
        </Link>
        <div className="tag-row">
          {(problem.tagIds ?? []).map((tagId) => (
            <TagBadge key={tagId} label={tagsById[String(tagId)]?.name ?? '—'} />
          ))}
        </div>
      </div>

      <Link to={link} className="question-row-author">
        <span className="question-row-author-text">
          <strong>{authorName}</strong>
          <small>{timeAgo(problem.createdAt)}</small>
        </span>
        <Avatar name={authorName} size={36} />
      </Link>
    </div>
  );
}