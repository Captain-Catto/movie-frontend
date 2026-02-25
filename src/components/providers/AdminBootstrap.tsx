"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const TopLineLoader = dynamic(
  () =>
    import("@/components/loading/TopLineLoader").then(
      (module) => module.TopLineLoader
    ),
  { ssr: false }
);
const AuthLoader = dynamic(
  () =>
    import("@/components/auth/AuthLoader").then((module) => module.AuthLoader),
  { ssr: false }
);
const ToastContainer = dynamic(
  () =>
    import("@/components/toast/ToastContainer").then(
      (module) => module.ToastContainer
    ),
  { ssr: false }
);

export function AdminBootstrap() {
  return (
    <>
      <Suspense fallback={null}>
        <TopLineLoader />
      </Suspense>
      <AuthLoader />
      <ToastContainer />
    </>
  );
}
