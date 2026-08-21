import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCreateProblemMutation, useGetProblemsQuery } from './problemsApi';
import { useGetTagsQuery } from '../tags/tagsApi';
import { selectCurrentUser } from '../auth/authSlice';
import TagBadge from '../../components/common/TagBadge';
import { ErrorMessage } from '../../components/common/StatusMessage';
import { findRelatedProblems } from '../../utils/relatedProblems';

export default function AskProblemPage() {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const { data: tags = [] } = useGetTagsQuery();
  const { data: allProblems = [] } = useGetProblemsQuery();
  const [createProblem, { isLoading, error }] = useCreateProblemMutation();

  const DRAFT_KEY = `moringadesk_ask_draft_${user?.id ?? 'anon'}`;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [draftSaved, setDraftSaved] = useState(false);

  // tag-matched suggestions once the asker has picked tags; before that,
  // fall back to recently solved questions so the sidebar always has
  // something useful to check against
  const tagRelated = useMemo(
    () => findRelatedProblems(allProblems, selectedTagIds),
    [allProblems, selectedTagIds],
  );
  const recentSolved = useMemo(
    () =>
      allProblems
        .filter((p) => p.solvedAnswerId)
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [allProblems],
  );
  const suggestions = (tagRelated.length > 0 ? tagRelated : recentSolved).slice(0, 4);

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSaveDraft = () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, body, selectedTagIds }));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      const problem = await createProblem({
        title: title.trim(),
        body: body.trim(),
        userId: user.id,
        tagIds: selectedTagIds,
        createdAt: new Date().toISOString(),
        solvedAnswerId: null,
        followerIds: [user.id],
      }).unwrap();
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/questions/${problem.id}`);
    } catch {
      // surfaced via the `error` field below
    }
  };

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <h1>Ask a question</h1>
            <p>Describe what&rsquo;s going wrong — tag it well and we&rsquo;ll surface anything similar first.</p>
          </div>
        </div>
      </div>

      <div className="page page-tight ask-layout">
        <form className="ask-form ask-form-main" onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize the problem in one line"
            required
          />

          <label htmlFor="body">Details</label>
          <textarea
            id="body"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What have you tried? What did you expect vs. what happened?"
            required
          />

          <fieldset className="tag-picker">
            <legend>Tags (language, stage, logical or technical challenge, …)</legend>
            <div className="tag-row">
              {tags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  label={tag.name}
                  active={selectedTagIds.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                />
              ))}
            </div>
          </fieldset>

          {error && <ErrorMessage error={error} fallback="Couldn't post your question." />}

          <div className="ask-form-actions">
            <button type="button" className="btn btn-outline" onClick={handleSaveDraft}>
              {draftSaved ? 'Draft saved' : 'Save Draft'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Posting…' : 'Post question'}
            </button>
          </div>
        </form>

        <aside className="ask-side">
          <div className="dashboard-side-card">
            <h2>{tagRelated.length > 0 ? 'Similar Solved Questions' : 'Recently Solved'}</h2>
            <p className="ask-side-hint">
              {tagRelated.length > 0
                ? 'We found these previous challenges that might match your issue.'
                : 'Pick tags above to see closer matches, or browse what the cohort already solved.'}
            </p>
            {suggestions.length > 0 ? (
              <ul className="ask-suggestion-list">
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <span>{p.title}</span>
                    <Link to={`/questions/${p.id}`} className="ask-suggestion-link">
                      View Solution →
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="empty-state">No solved questions yet.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}