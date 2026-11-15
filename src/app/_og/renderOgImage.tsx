import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

/** The size every social network expects for a link preview. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export const OG_IMAGE_CONTENT_TYPE = "image/png";

// Mirrors the dark theme tokens in globals.scss — CSS variables don't exist here.
const COLORS = {
  background: "#121316",
  surface: "#1c1d21",
  border: "#2c2e34",
  text: "#ffffff",
  textSecondary: "#9ca3af",
  accent: "#ff6d00",
  vibrant: "#ffd600",
};

type OgImageContent = {
  /** Small uppercase line above the title, e.g. the dish category. */
  eyebrow: string;
  title: string;
  /** Line under the title, e.g. the price. */
  subtitle?: string;
  /** Highlighted pill in the corner, e.g. "−41 %". */
  badge?: string;
};

/**
 * Draws a link-preview image (Open Graph): the picture a messenger or social
 * network shows when someone shares a page of the site.
 *
 * Inline styles are the one exception to the "SCSS Modules only" rule: the
 * image is rendered outside the browser, where only inline flexbox styles work.
 */
export const renderOgImage = ({ eyebrow, title, subtitle, badge }: Readonly<OgImageContent>): ImageResponse =>
  new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: `radial-gradient(circle at 85% 0%, rgba(255, 109, 0, 0.28) 0%, ${COLORS.background} 55%)`,
          color: COLORS.text,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: COLORS.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              %
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 34, fontWeight: 700 }}>{SITE_NAME}</div>
              <div style={{ fontSize: 22, color: COLORS.accent }}>Varím zo zliav</div>
            </div>
          </div>

          {badge ? (
            <div
              style={{
                display: "flex",
                padding: "14px 30px",
                borderRadius: 999,
                background: COLORS.accent,
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              {badge}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.accent,
            }}
          >
            {eyebrow}
          </div>
          <div style={{ fontSize: title.length > 48 ? 60 : 74, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
          {subtitle ? <div style={{ fontSize: 34, color: COLORS.textSecondary }}>{subtitle}</div> : null}
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
