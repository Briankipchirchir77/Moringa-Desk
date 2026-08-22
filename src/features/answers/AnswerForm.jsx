import { useState } from 'react';
import { useCreateAnswerMutation } from './answersApi';
import { ErrorMessage } from '../../components/common/StatusMessage';

export default function AnswerForm({ problemId, userId }) {
  const [body, setBody] = useState('');
  const [createAnswer, { isLoading, error }] = useCreateAnswerMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await createAnswer({
        problemId,
        userId,
        body: body.trim(),
        votes: 0,
        createdAt: new Date().toISOString(),
      }).unwrap();
      setBody('');
    } catch {
      // surfaced via the `error` field below
    }
  };

  return (
    <form className="answer-form" onSubmit={handleSubmit}>
      <label htmlFor="answer-body">Add a reply</label>
      <textarea
        id="answer-body"
        rows={4}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share a solution or workaround…"
        required
      />
      {error && <ErrorMessage error={error} fallback="Couldn't post your reply." />}
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? 'Posting…' : 'Post reply'}
      </button>
    </form>
  );
}
