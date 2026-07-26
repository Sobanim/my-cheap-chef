import { OvenFrame } from "../parts/OvenFrame";

/** A cut of meat roasting on the oven rack. Same meat tones as MeatPanScene. */
export const MeatOvenScene = () => (
  <OvenFrame>
    <ellipse cx="12" cy="15.1" rx="2.9" ry="1.3" fill="#d85a30" />
    <path
      d="M10.6 14.8l2.6 .7"
      stroke="#4a1b0c"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
  </OvenFrame>
);
