// There's no photo upload/storage pipeline, so every avatar in the app is a
// circular initials badge instead of an <img> — colored deterministically
// from the person's name so the same person always gets the same color.
const PALETTE = ['#f5821f', '#0b1f3f', '#2563eb', '#16a34a', '#9333ea', '#dc2626', '#0f766e'];

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name = '', size = 36 }) {
  const initials = getInitials(name);
  const color = PALETTE[hashString(name || '?') % PALETTE.length];

  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: color,
      }}
      title={name}
      aria-hidden={!name}
    >
      {initials}
    </span>
  );
}