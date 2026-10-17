/** شعار المدينة: مبانٍ ونجمة وعلامات حسابية (يرث اللون من currentColor) */
export function Emblem({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="pp-emblem" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
        <rect x="26" y="56" width="16" height="28" />
        <path d="M23 58 L34 46 L45 58" />
        <rect x="46" y="38" width="16" height="46" />
        <rect x="66" y="60" width="14" height="24" />
        <rect x="82" y="50" width="12" height="34" />
        <line x1="20" y1="84" x2="100" y2="84" />
      </g>
      <g fill="currentColor">
        <rect x="50" y="44" width="3" height="4" />
        <rect x="55" y="44" width="3" height="4" />
        <rect x="50" y="54" width="3" height="4" />
        <rect x="55" y="54" width="3" height="4" />
        <path d="M60 14 l3 6 6.6 1 -4.8 4.6 1.2 6.6 -6 -3.2 -6 3.2 1.2 -6.6 -4.8 -4.6 6.6 -1 z" />
      </g>
      <text x="60" y="102" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
        + − × =
      </text>
    </svg>
  );
}
