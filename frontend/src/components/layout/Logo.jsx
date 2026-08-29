// MoringaDesk's mark — a branching circuit/tree glyph, echoing Moringa
// School's own "tech-tree" brand identity (a trunk branching into
// connected nodes) without reproducing their exact logo artwork, since
// this repo is public and isn't an official Moringa School property.
export default function Logo({ size = 26, tone = 'default' }) {
  const stroke = tone === 'light' ? 'rgba(245, 248, 255, 0.85)' : 'var(--text-h)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke={stroke} strokeWidth="1.8" strokeLinecap="round">
        <line x1="16" y1="8" x2="16" y2="26" />
        <line x1="16" y1="13" x2="9" y2="18" />
        <line x1="16" y1="13" x2="23" y2="18" />
        <line x1="16" y1="19" x2="11" y2="24" />
        <line x1="16" y1="19" x2="21" y2="24" />
      </g>
      <circle cx="16" cy="6.5" r="2.6" fill="#f5821f" />
      <circle cx="9" cy="18" r="1.8" fill="#f5821f" />
      <circle cx="23" cy="18" r="1.8" fill="#f5821f" />
      <circle cx="11" cy="24" r="1.4" fill="#f5821f" />
      <circle cx="21" cy="24" r="1.4" fill="#f5821f" />
    </svg>
  );
}
