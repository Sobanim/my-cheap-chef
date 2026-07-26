import { PotFrame } from "../parts/PotFrame";

/** Vegetables stewing in the pot — greens plus one warm accent so it isn't a green blob. */
export const VeggiePotScene = () => (
  <PotFrame>
    <circle cx="9.9" cy="11.3" r="1.15" fill="#3b6d11" />
    <circle cx="13.6" cy="11.4" r="1" fill="#639922" />
    <circle cx="11.8" cy="10.7" r="0.85" fill="#e24b4a" />
  </PotFrame>
);
