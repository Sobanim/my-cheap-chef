/*
 * Small line-art meta icons shared by the recipe card and the recipe detail
 * page. Same 24x24 / currentColor style as the DishScene illustrations.
 */

export const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M12 8v4l2.6 1.6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ChefHatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M7 14a3.6 3.6 0 1 1 1.2-7 3 3 0 0 1 5.6 0A3.6 3.6 0 1 1 17 14z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <path
      d="M7.5 14v3.2a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V14"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>
);

export const TagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M11 3.5h7.5V11l-7.4 7.4a1.6 1.6 0 0 1-2.3 0L4.4 13a1.6 1.6 0 0 1 0-2.3z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="14.6" cy="7.4" r="1.3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <rect
      x="5"
      y="10"
      width="14"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8 10V7a4 4 0 0 1 8 0v3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);
