export const Wordmark = () => (
  <div className="wordmark" aria-label="STARBASE">
    <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden>
      <defs>
        <linearGradient id="wm-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f4f6" /><stop offset=".55" stopColor="#9ea3ad" /><stop offset="1" stopColor="#d8c08a" />
        </linearGradient>
      </defs>
      <path d="M32 4 L60 58 L32 46 L4 58 Z" fill="none" stroke="url(#wm-metal)" strokeWidth="5" strokeLinejoin="miter"/>
      <circle cx="32" cy="34" r="4" fill="var(--accent)"/>
    </svg>
    <span aria-hidden>STARBASE</span>
  </div>
);
