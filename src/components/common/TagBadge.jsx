export default function TagBadge({ label, active = false, onClick }) {
  if (!onClick) {
    return <span className="tag-badge">{label}</span>;
  }

  return (
    <button
      type="button"
      className={`tag-badge${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}