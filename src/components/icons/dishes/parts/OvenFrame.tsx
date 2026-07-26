import styles from "../DishScene.module.scss";

type OvenFrameProps = {
  /** The dish on the rack. Drawn inside the window, centred around (12, 15). */
  children: React.ReactNode;
};

/*
 * The oven chassis, shared by every `*:oven` scene — front view, per the reference:
 * body, control panel with three knobs, door window, rack, and heat behind the glass.
 *
 * This is NOT the "vessel + filling" composition that was rejected for the scene set
 * as a whole. That failed because a pan is drawn from above and an oven from the
 * front, so one normalised food shape cannot be right in both. Here every consumer
 * shares a single viewing angle, so the only thing being shared is the chassis —
 * and copying it into four files would guarantee they drift apart.
 *
 * Food belongs on the rack: keep it within roughly x 9–15, y 13.5–16.5.
 */
export const OvenFrame = ({ children }: Readonly<OvenFrameProps>) => (
  <>
    {/* Body */}
    <rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="2.2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    {/* Control panel */}
    <path
      d="M2.9 7.4h18.2"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="8.6" cy="5" r="0.62" fill="currentColor" />
    <circle cx="12" cy="5" r="0.62" fill="currentColor" />
    <circle cx="15.4" cy="5" r="0.62" fill="currentColor" />

    {/* Door window — the warm fill is what reads as "hot inside" */}
    <rect
      x="5.6"
      y="9.4"
      width="12.8"
      height="9.4"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      fill="#ef9f27"
      fillOpacity="0.3"
    />

    {/* Heat, contained behind the glass */}
    <path
      className={styles.heatA}
      d="M9.8 11.4c-.6.6-.6 1.2 0 1.8"
      stroke="#ff6d00"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <path
      className={styles.heatB}
      d="M12 11.1c-.6.6-.6 1.2 0 1.8"
      stroke="#ffd600"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <path
      className={styles.heatC}
      d="M14.2 11.4c-.6.6-.6 1.2 0 1.8"
      stroke="#ff6d00"
      strokeWidth="1.1"
      strokeLinecap="round"
    />

    {children}

    {/* Rack, drawn after the food so the dish sits on it */}
    <path
      d="M7.4 16.4h9.2"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
  </>
);
