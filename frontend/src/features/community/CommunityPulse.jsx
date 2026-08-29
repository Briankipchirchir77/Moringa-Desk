import { Link } from 'react-router-dom';
import { useGetTrendingQuestionsQuery } from './stackExchangeApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';
import { decodeHtmlEntities } from '../../utils/decodeHtmlEntities';

// A compact live preview of the Explore tab (real Stack Overflow data),
// meant for the landing page — enough to prove this app talks to a real
// external API the moment a visitor opens it, without duplicating the
// full Explore experience (tag search, full list) that lives at /explore.
export default function CommunityPulse({ count = 3 }) {
  const { data: questions = [], isLoading, error } = useGetTrendingQuestionsQuery(undefined);

  return (
    <div className="community-pulse">
      <div className="community-pulse-head">
        <h2>Live from Stack Overflow</h2>
        <Link to="/explore">See more →</Link>
      </div>

      {isLoading && <Loading label="Loading live questions…" />}
      {error && <ErrorMessage error={error} fallback="Couldn't reach Stack Overflow right now." />}

      {!isLoading && !error && (
        <ul className="community-pulse-list">
          {questions.slice(0, count).map((q) => (
            <li key={q.question_id}>
              <a href={q.link} target="_blank" rel="noreferrer">
                {decodeHtmlEntities(q.title)}
              </a>
              <span>{q.answer_count} answers</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
