import { OvenFrame } from "../parts/OvenFrame";

/*
 * Roasted vegetables in the oven. Greens are the darker end of the palette on
 * purpose — vegetables lose their fresh colour in the oven, which is also what
 * keeps this scene distinct from VeggieRawScene's bright salad leaves.
 *
 * Replaces the original BakedScene, which drew a casserole dish rather than an
 * oven and so didn't match the rest of the oven column.
 */
export const VeggieOvenScene = () => (
  <OvenFrame>
    <ellipse cx="10.2" cy="15.3" rx="1.35" ry="1.1" fill="#3b6d11" />
    <ellipse cx="12.6" cy="15.1" rx="1.45" ry="1.2" fill="#639922" />
    <circle cx="14.8" cy="15.4" r="1" fill="#e24b4a" />
  </OvenFrame>
);
