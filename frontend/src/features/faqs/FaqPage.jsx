import { useMemo, useState } from 'react';
import { useGetFaqsQuery } from './faqApi';
import { Loading, ErrorMessage } from '../../components/common/StatusMessage';

export default function FaqPage() {
  const { data: faqs = [], isLoading, error } = useGetFaqsQuery();
  const [openId, setOpenId] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = useMemo(
    () => ['All', ...new Set(faqs.map((faq) => faq.category).filter(Boolean))],
    [faqs],
  );

  const visibleFaqs = faqs.filter((faq) => {
    const matchesCategory = category === 'All' || faq.category === category;
    const matchesSearch = !search.trim() || faq.question.toLowerCase().includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <h1>Frequently Asked Questions</h1>
            <p>Answers to the questions Moringa students ask most, so you don&rsquo;t have to wait.</p>
          </div>
        </div>
      </div>

      <div className="page page-tight">
        {isLoading && <Loading label="Loading FAQs…" />}
        {error && <ErrorMessage error={error} fallback="Couldn't load FAQs." />}

        <input
          type="search"
          className="search-input"
          placeholder="Search Moringa FAQs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search FAQs"
        />

        {categories.length > 1 && (
          <div className="tag-filter-row">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`tag-badge${category === cat ? ' active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {!isLoading && visibleFaqs.length === 0 && (
          <p className="empty-state">No FAQs in this category yet.</p>
        )}

        <ul className="faq-list">
          {visibleFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <li key={faq.id} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-question-text">
                    {faq.category && <span className="faq-category-badge">{faq.category}</span>}
                    {faq.question}
                  </span>
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <p className="faq-answer">{faq.answer}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
