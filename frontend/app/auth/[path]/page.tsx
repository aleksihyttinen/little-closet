import AuthPageClient from "@/app/components/AuthPageClient";
import { Suspense } from "react";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "forgot-password" },
    { path: "reset-password" },
    { path: "sign-out" },
    { path: "callback" },
  ];
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageClient path={path} />
    </Suspense>
  );
}