"use client";

import { useEffect } from "react";

// Registers public/sw.js so the offline fallback (see src/app/offline) can
// kick in. Renders nothing — this is a side-effect-only component.
export const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => console.error("Service worker registration failed:", error));
  }, []);

  return null;
};
