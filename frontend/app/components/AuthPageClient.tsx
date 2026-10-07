"use client";

import { AuthView } from "@neondatabase/auth-ui";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { messages, type Language } from "@/app/messages";

const languageChangeEvent = "little-closet-language-change";

function subscribeToLanguage(callback: () => void) {
  window.addEventListener(languageChangeEvent, callback);
  return () => window.removeEventListener(languageChangeEvent, callback);
}

function getLanguageSnapshot(): Language {
  return window.localStorage.getItem("little-closet-language") === "en" ? "en" : "fi";
}

function getServerLanguageSnapshot(): Language {
  return "fi";
}

export default function AuthPageClient({ path }: { path: string }) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const t = messages[language];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 p-4">
      <AuthView path={path} />
      {(path === "sign-in" || path === "sign-up") ? (
        <Link
          href="/demo"
          className="rounded-md border border-[#315c4c] px-5 py-3 text-sm font-semibold text-[#315c4c] transition hover:bg-[#edf6ee]"
        >
          {t.tryDemo}
        </Link>
      ) : null}
    </main>
  );
}
