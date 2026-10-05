"use client";

import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/app/lib/auth";
import { finnishAuthLocalization } from "@/app/lib/auth/localization.fi";

const subscribe = (callback: () => void) => {
  window.addEventListener("little-closet-language-change", callback);
  return () => window.removeEventListener("little-closet-language-change", callback);
};
const getLanguage = () =>
  window.localStorage.getItem("little-closet-language") === "en" ? "en" : "fi";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const language = useSyncExternalStore(subscribe, getLanguage, () => "fi");

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      Link={Link}
      defaultTheme="light"
      redirectTo="/"
      localization={language === "fi" ? finnishAuthLocalization : undefined}
      social={{ providers: ["google"] }}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
