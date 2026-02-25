"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const TopLineLoader = dynamic(
  () =>
    import("@/components/loading/TopLineLoader").then(
      (module) => module.TopLineLoader
    ),
  { ssr: false }
);
const InitialPageLoader = dynamic(
  () =>
    import("@/components/loading/InitialPageLoader").then(
      (module) => module.InitialPageLoader
    ),
  { ssr: false }
);
const AuthLoader = dynamic(
  () =>
    import("@/components/auth/AuthLoader").then((module) => module.AuthLoader),
  { ssr: false }
);
const FavoritesLoader = dynamic(
  () =>
    import("@/components/favorites/FavoritesLoader").then(
      (module) => module.FavoritesLoader
    ),
  { ssr: false }
);
const ToastContainer = dynamic(
  () =>
    import("@/components/toast/ToastContainer").then(
      (module) => module.ToastContainer
    ),
  { ssr: false }
);
const EffectManager = dynamic(() => import("@/components/effects/EffectManager"), {
  ssr: false,
});

export function ClientBootstrap() {
  return (
    <>
      <Suspense fallback={null}>
        <TopLineLoader />
      </Suspense>
      <InitialPageLoader />
      <AuthLoader />
      <FavoritesLoader />
      <ToastContainer />
      <EffectManager />
    </>
  );
}
