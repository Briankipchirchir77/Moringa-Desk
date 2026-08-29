import { useState } from 'react';
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} from '../faqs/faqApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';

const emptyForm = { question: '', answer: '', category: '' };

export default function AdminFaqsPage() {
  const { data: faqs = [], isLoading, error } = useGetFaqsQuery();
  const [createFaq, { isLoading: isCreating, error: saveError }] = useCreateFaqMutation();
  const [updateFaq] = useUpdateFaqMutation();
  const [deleteFaq] = useDeleteFaqMutation();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const startEdit = (faq) => {
    setEditingId(faq.id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category ?? '' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    if (editingId) {
      await updateFaq({ id: editingId, ...form });
    } else {
      await createFaq(form);
    }
    resetForm();
  };

  if (isLoading) return <Loading label="Loading FAQs…" />;
  if (error) return <ErrorMessage error={error} fallback="Couldn't load FAQs." />;

  return (
    <div className="admin-faqs">
      <form className="ask-form admin-faq-form" onSubmit={handleSubmit}>
        <h2>{editingId ? 'Edit FAQ' : 'New FAQ'}</h2>

        <label htmlFor="question">Question</label>
        <input id="question" name="question" value={form.question} onChange={handleChange} required />

        <label htmlFor="answer">Answer</label>
        <textarea
          id="answer"
          name="answer"
          rows={4}
          value={form.answer}
          onChange={handleChange}
          required
        />

        <label htmlFor="category">Category</label>
        <input
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="e.g. Git, React, JavaScript"
        />

        {saveError && <ErrorMessage error={saveError} fallback="Couldn't save that FAQ." />}

        <div className="admin-row-actions">
          <button type="submit" className="btn btn-primary" disabled={isCreating}>
            {editingId ? 'Save changes' : 'Add FAQ'}
          </button>
          {editingId && (
            <button type="button" className="btn btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <ul className="admin-flag-list">
        {faqs.map((faq) => (
          <li key={faq.id}>
            <div>
              <p>
                <strong>{faq.question}</strong>
              </p>
              <p className="auth-subtitle">{faq.category || 'Uncategorized'}</p>
            </div>
            <div className="admin-row-actions">
              <button type="button" className="btn btn-ghost" onClick={() => startEdit(faq)}>
                Edit
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  if (window.confirm('Delete this FAQ?')) deleteFaq(faq.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}