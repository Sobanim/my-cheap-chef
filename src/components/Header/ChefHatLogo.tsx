type ChefHatLogoProps = {
  className?: string;
};

/**
 * Minimalist logo: a chef's hat with a fork enclosed inside it.
 */
export const ChefHatLogo = ({ className }: Readonly<ChefHatLogoProps>) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Chef's hat silhouette (Original but with thin stroke) */}
      <path
        d="M6 20.5v-6.2a4.7 4.7 0 0 1-1.3-8.9A4.6 4.6 0 0 1 12 3.2a4.6 4.6 0 0 1 7.3 2.2 4.7 4.7 0 0 1-1.3 8.9v6.2A1.5 1.5 0 0 1 16.5 22h-9A1.5 1.5 0 0 1 6 20.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bottom band line */}
      <line
        x1="6"
        y1="20.5"
        x2="18"
        y2="20.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      {/* Elegant 3-Prong Fork (exactly three lines/paths) */}
      <g
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* Line 1: Outer prongs & base U-curve */}
        <path d="M10 7.5v3.5a2 2 0 0 0 4 0V7.5" />
        {/* Line 2: Center prong */}
        <line x1="12" y1="7.5" x2="12" y2="10.5" />
        {/* Line 3: Handle */}
        <line x1="12" y1="13" x2="12" y2="17.2" />
      </g>

      {/* Discount Badge (Scalloped edge, filled, white % symbol as text) */}
      <g transform="translate(10.5, 10.5) scale(0.62)">
        <path
          d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
          fill="var(--color-vibrant, #ff9100)"
        />
        {/* Percent Sign as actual Text symbol */}
        <text
          x="12"
          y="12"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11"
          fontWeight="bold"
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="central"
        >
          %
        </text>
      </g>
    </svg>
  );
};
