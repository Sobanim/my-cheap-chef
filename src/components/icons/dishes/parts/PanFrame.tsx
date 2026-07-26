type PanFrameProps = {
  /** What's frying. Drawn in the pan, centred around (10.5, 14). */
  children: React.ReactNode;
};

/*
 * The frying pan chassis — seen from above at a slight angle, matching the shape
 * MeatPanScene has always used (circle plus handle). Shared by the newer `*:pan`
 * scenes so they can't drift from it.
 *
 * Note: PastaPanScene predates this and draws a shallow bowl instead of this pan,
 * so the pan column isn't fully consistent yet. Left alone deliberately — that
 * scene was signed off as-is; redraw it here if the mismatch starts to show.
 *
 * Food belongs inside the circle: keep it within radius ~4.5 of (10.5, 14).
 */
export const PanFrame = ({ children }: Readonly<PanFrameProps>) => (
  <>
    <circle cx="10.5" cy="14" r="6.6" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M17.1 14h5.4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    {children}
  </>
);
