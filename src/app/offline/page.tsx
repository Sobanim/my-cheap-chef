import type { Metadata } from "next";

// Static fallback shown by the service worker (public/sw.js) when a
// navigation request fails because the user is offline. Precached at SW
// install time, so it must render correctly with zero network access —
// including its own styling. That's why colors are inlined here instead of
// coming from globals.scss or a CSS Module: those are separate network
// requests the service worker doesn't cache, so relying on them would leave
// this page unstyled exactly when it matters most.
export const metadata: Metadata = {
  title: "Si offline — My Cheap Chef",
};

export default function OfflinePage() {
  return (
    <>
      <style>{`
        .offline-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px 24px;
          min-height: 60dvh;
          gap: 16px;
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
          color: #111827;
        }
        .offline-emoji {
          font-size: 4rem;
          line-height: 1;
        }
        .offline-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }
        .offline-description {
          font-size: 0.9375rem;
          color: #4b5563;
          line-height: 1.5;
          max-width: 280px;
          margin: 0;
        }
        @media (prefers-color-scheme: dark) {
          .offline-container { color: #ffffff; }
          .offline-description { color: #9ca3af; }
        }
      `}</style>
      <div className="offline-container">
        <div className="offline-emoji">📡</div>
        <h1 className="offline-title">Si offline</h1>
        <p className="offline-description">
          Nemáme pripojenie na internet. Skontroluj sieť a skús to znova.
        </p>
      </div>
    </>
  );
}
