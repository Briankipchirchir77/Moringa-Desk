// An original mark for MoringaDesk — a speech-bubble-and-spark glyph, not a
// reproduction of Moringa School's own logo. `tone="light"` is for use on
// the fixed-navy surfaces (navbar stays theme-aware, so it uses the default).
export default function Logo({ size = 26, tone = 'default' }) {
  const stroke = tone === 'light' ? '#f5f8ff' : 'var(--text-h)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4H15l-6 4.5V22a4 4 0 0 1-4-4V9Z"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="13.5" r="2.3" fill="#f5821f" />
    </svg>
  );
}