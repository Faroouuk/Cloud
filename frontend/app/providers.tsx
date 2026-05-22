"use client";

import "@/lib/amplify";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
