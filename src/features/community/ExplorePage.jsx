import { useState } from 'react';
import { useGetTrendingQuestionsQuery } from './stackExchangeApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import TagBadge from '../../components/common/TagBadge';

const SUGGESTED_TAGS = ['javascript', 'react', 'python', 'flask', 'docker', 'sql'];

// Stack Exchange API titles come HTML-entity-encoded (e.g. `&quot;`) since
// they're meant for direct HTML embedding — decode before rendering as
// plain React text, or entities show up literally instead of as `"`/`'`.
function decodeHtmlEntities(text) {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

function timeAgoFromUnix(unixSeconds) {
  const seconds = Math.floor(Date.now() / 1000) - unixSeconds;
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ExplorePage() {
  // Controlled input: the tag search box. `tag` (submitted) is what's
  // actually queried; `draft` is what the user is currently typing —
  // kept separate so every keystroke doesn't refire the API request.
  const [draft, setDraft] = useState('');
  const [tag, setTag] = useState('');

  const { data: questions = [], isLoading, error, isFetching } = useGetTrendingQuestionsQuery(tag);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTag(draft.trim());
  };

  return (
    <div className="page">
      <div className="page-title-header">
        <div>
          <h1>Explore the Wider Dev Community</h1>
          <p>
            Live questions pulled from the Stack Overflow public API — see what developers
            outside your cohort are asking about the same topics.
          </p>
        </div>
      </div>

      <form className="explore-search" onSubmit={handleSubmit} role="search">
        <input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Filter by tag (e.g. react, flask, docker)…"
          aria-label="Filter Stack Overflow questions by tag"
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div className="explore-tag-cloud">
        {SUGGESTED_TAGS.map((t) => (
          <TagBadge
            key={t}
            label={t}
            active={t === tag}
            onClick={() => {
              setDraft(t);
              setTag(t);
            }}
          />
        ))}
        {tag && (
          <TagBadge
            label="Clear filter ✕"
            onClick={() => {
              setDraft('');
              setTag('');
            }}
          />
        )}
      </div>

      {isLoading && <Loading label="Loading questions from Stack Overflow…" />}
      {error && (
        <ErrorMessage
          error={error}
          fallback="Couldn't reach the Stack Overflow API right now — try again shortly."
        />
      )}

      {!isLoading && !error && (
        <>
          {isFetching && <p className="status-message">Updating…</p>}
          {questions.length === 0 ? (
            <p className="empty-state">
              No questions found for that tag on Stack Overflow. Try another one.
            </p>
          ) : (
            <div className="question-row-list">
              {questions.map((q) => (
                <a
                  key={q.question_id}
                  className="question-row explore-question-row"
                  href={q.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="question-row-stats">
                    <div className="question-stat question-stat-active">
                      <strong>{q.score}</strong>
                      votes
                    </div>
                    <div className="question-stat">
                      <strong>{q.answer_count}</strong>
                      answers
                    </div>
                  </div>

                  <div>
                    <span className="question-row-title">
                      {q.is_answered && <span className="badge badge-solved-fill">SOLVED</span>}
                      {decodeHtmlEntities(q.title)}
                    </span>
                    <div className="explore-tag-row">
                      {(q.tags ?? []).slice(0, 5).map((t) => (
                        <TagBadge key={t} label={t} />
                      ))}
                    </div>
                  </div>

                  <div className="explore-question-meta">
                    <span>{q.owner?.display_name ?? 'Anonymous'}</span>
                    <small>{timeAgoFromUnix(q.last_activity_date)}</small>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
