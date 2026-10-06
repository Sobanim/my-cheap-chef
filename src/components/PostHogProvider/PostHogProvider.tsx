"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

if (
  typeof window !== "undefined" &&
  !posthog.__loaded &&
  process.env.NEXT_PUBLIC_POSTHOG_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false, // We capture manually below
    capture_pageleave: true,
    // No cookies or local storage: visitor identity is a daily-rotating hash computed
    // by PostHog's servers, so no consent banner is needed. Requires cookieless mode
    // to be enabled in the PostHog project settings, otherwise events are dropped.
    cookieless_mode: "always",
  });
}

// Captures page views on route changes (Next.js App Router)
const PostHogPageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams?.toString();
      if (search) {
        url += `?${search}`;
      }
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
};

type Props = {
  children: React.ReactNode;
};

export const PostHogProvider = ({ children }: Readonly<Props>) => {
  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
};
