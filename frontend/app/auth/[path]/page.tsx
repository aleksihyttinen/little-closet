import AuthPageClient from "@/app/components/AuthPageClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { path: "sign-in" },
    { path: "sign-up" },
    { path: "forgot-password" },
    { path: "reset-password" },
    { path: "sign-out" },
  ];
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return <AuthPageClient path={path} />;
}
