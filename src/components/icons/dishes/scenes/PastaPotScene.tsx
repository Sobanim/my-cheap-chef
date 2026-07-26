import { PotFrame } from "../parts/PotFrame";

/*
 * Pasta boiling in the pot. Two chunky elbows rather than many thin strands —
 * at 24px a nest of strands collapses into a smudge, so a couple of readable
 * shapes carry the idea better.
 */
export const PastaPotScene = () => (
  <PotFrame>
    <path
      d="M9.6 12c-1-.3-1.2-1.4-.3-1.9"
      stroke="#ef9f27"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M14.4 11.9c1-.3 1.2-1.4.3-1.9"
      stroke="#ba7517"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M11.9 12.1c-.9-.2-1-1.2-.2-1.6"
      stroke="#ef9f27"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </PotFrame>
);
