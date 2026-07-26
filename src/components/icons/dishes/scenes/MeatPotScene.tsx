import { PotFrame } from "../parts/PotFrame";

/** A cut of meat stewing in the pot. Same meat tones as the other meat scenes. */
export const MeatPotScene = () => (
  <PotFrame>
    <ellipse cx="12" cy="11.2" rx="3" ry="1.15" fill="#d85a30" />
    <path
      d="M10.7 11h2.5"
      stroke="#4a1b0c"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
  </PotFrame>
);
