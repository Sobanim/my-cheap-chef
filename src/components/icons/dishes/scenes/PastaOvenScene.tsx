import { OvenFrame } from "../parts/OvenFrame";

/** A pasta bake in the oven — a slab in pasta tones with a wave of strands on top. */
export const PastaOvenScene = () => (
  <OvenFrame>
    <path
      d="M9.1 16.3v-1.5c0-.9.8-1.4 2.9-1.4s2.9.5 2.9 1.4v1.5Z"
      fill="#ef9f27"
      stroke="#ba7517"
      strokeWidth="1.1"
      strokeLinejoin="round"
    />
    <path
      d="M10 14.7c.7-.5 1.3-.5 2 0s1.3.5 2 0"
      stroke="#ba7517"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
  </OvenFrame>
);
