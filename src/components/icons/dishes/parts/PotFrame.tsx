import styles from "../DishScene.module.scss";

type PotFrameProps = {
  /** What's cooking. Drawn in the opening, centred around (12, 11.2). */
  children: React.ReactNode;
};

/*
 * The pot chassis, shared by every `*:pot` scene — front view with side handles
 * and steam, same rationale as OvenFrame: one viewing angle, one copy of the body.
 *
 * Drawn open rather than lidded. A lid with a knob was the original sketch, but it
 * hides the contents, and "you can see something cooking in there" is the rule the
 * oven scene is built on — a closed pot would be an anonymous cylinder. The slight
 * ellipse of the rim is what lets the food read at 24px.
 *
 * Food belongs in the opening: keep it within roughly x 7–17, y 10–12.4.
 */
export const PotFrame = ({ children }: Readonly<PotFrameProps>) => (
  <>
    <path
      className={styles.steamA}
      d="M9.5 4.6c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamB}
      d="M12 4.1c-.8.8-.8 1.6 0 2.4"
      stroke="#ffd600"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
    <path
      className={styles.steamC}
      d="M14.5 4.6c-.8.8-.8 1.6 0 2.4"
      stroke="#ff6d00"
      strokeWidth="1.3"
      strokeLinecap="round"
    />

    {/* Handles, drawn first so the body sits on top of their inner ends */}
    <path
      d="M4.9 12.3H3.2a1 1 0 0 0 0 2h1.9"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.1 12.3h1.7a1 1 0 0 1 0 2h-1.9"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Body */}
    <path
      d="M4.8 11.2 6.1 18.3a1.7 1.7 0 0 0 1.7 1.5h8.4a1.7 1.7 0 0 0 1.7-1.5l1.3-7.1"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />

    {children}

    {/* Rim last, so the food reads as sitting inside the pot */}
    <ellipse
      cx="12"
      cy="11.2"
      rx="7.2"
      ry="1.8"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </>
);
