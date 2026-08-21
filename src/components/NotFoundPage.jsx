import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page empty-state">
      <h1>Page not found</h1>
      <p>
        <Link to="/questions">Back to questions</Link>
      </p>
    </div>
  );
}