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
      {/* Chef's hat silhouette */}
      <path
        d="M6 20.5v-6.2a4.7 4.7 0 0 1-1.3-8.9A4.6 4.6 0 0 1 12 3.2a4.6 4.6 0 0 1 7.3 2.2 4.7 4.7 0 0 1-1.3 8.9v6.2A1.5 1.5 0 0 1 16.5 22h-9A1.5 1.5 0 0 1 6 20.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Fork enclosed inside the hat */}
      <path
        d="M12 8.4v8.4M10.4 8.4v2.1a1.6 1.6 0 0 0 3.2 0V8.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
