import { useEffect, useState } from 'react';

const FALLBACK_QUESTIONS = [
  { title: 'How do I structure a reusable React component?', link: 'https://stackoverflow.com/questions/tagged/reactjs', answerCount: 0 },
  { title: 'What is the best way to handle async requests in JavaScript?', link: 'https://stackoverflow.com/questions/tagged/javascript', answerCount: 0 },
  { title: 'How should I organize a Flask project?', link: 'https://stackoverflow.com/questions/tagged/flask', answerCount: 0 },
];

export default function LiveQuestionStrip() {
  const [questions, setQuestions] = useState(FALLBACK_QUESTIONS);

  useEffect(() => {
    const controller = new AbortController();

    fetch('https://api.stackexchange.com/2.3/questions?order=desc&sort=activity&tagged=javascript;reactjs;flask&site=stackoverflow&pagesize=3', {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Stack Overflow feed unavailable');
        return response.json();
      })
      .then((data) => {
        if (data.items?.length) {
          setQuestions(data.items.map(({ title, link, answer_count: answerCount }) => ({ title, link, answerCount })));
        }
      })
      .catch(() => {
        // The curated fallback keeps this optional feed from affecting the page.
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="live-question-strip" aria-labelledby="live-question-heading">
      <div className="live-question-heading">
        <h2 id="live-question-heading">Live from Stack Overflow</h2>
        <a href="https://stackoverflow.com/questions" target="_blank" rel="noreferrer">See more →</a>
      </div>
      <ul>
        {questions.map((question) => (
          <li key={question.link}>
            <a href={question.link} target="_blank" rel="noreferrer">{question.title}</a>
            <span>{question.answerCount} {question.answerCount === 1 ? 'answer' : 'answers'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
