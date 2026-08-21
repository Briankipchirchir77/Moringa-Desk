export function Loading({ label = 'Loading…' }) {
  return <p className="status-message">{label}</p>;
}

export function ErrorMessage({ error, fallback = 'Something went wrong.' }) {
  const message = error?.data?.message || fallback;
  return <p className="status-message status-error">{message}</p>;
}