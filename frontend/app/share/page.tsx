"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  acceptClosetShare,
  clearActiveClosetOwnerId,
  getAuthSession,
  setActiveClosetOwnerId,
  type ClosetShare,
} from "../api";
import { messages, type Language } from "../messages";

export default function SharePage() {
  const router = useRouter();
  const language: Language = useSyncExternalStore(
    (callback) => {
      window.addEventListener("little-closet-language-change", callback);
      return () => window.removeEventListener("little-closet-language-change", callback);
    },
    () => window.localStorage.getItem("little-closet-language") === "en" ? "en" : "fi",
    () => "fi",
  );
  const token = useSyncExternalStore(
    () => () => { },
    () => new URLSearchParams(window.location.search).get("token") ?? "",
    () => "",
  );
  const [signedIn, setSignedIn] = useState(false);
  const [share, setShare] = useState<ClosetShare | null>(null);
  const [error, setError] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    clearActiveClosetOwnerId();
    void (async () => {
      const result = await getAuthSession();
      setSignedIn(Boolean(result.data?.session));
    })();
  }, []);

  const t = messages[language];

  const accept = async () => {
    if (!token) {
      setError(true);
      return;
    }
    setAccepting(true);
    setError(false);
    try {
      const accepted = await acceptClosetShare(token);
      setShare(accepted);
      setActiveClosetOwnerId(accepted.owner_user_id);
      window.setTimeout(() => router.push("/"), 700);
    } catch {
      setError(true);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f3ed] p-4 text-[#202a27]">
      <section className="w-full max-w-lg border border-[#d6dbd3] bg-white p-6 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">{t.acceptClosetShare}</p>
        <h1 className="mt-2 text-2xl font-semibold">{t.acceptClosetShare}</h1>
        <p className="mt-3 text-sm text-[#68746d]">{t.acceptClosetShareHint}</p>
        {!signedIn ? (
          <Link
            href={`/auth/sign-in?redirect=${encodeURIComponent(`/share?token=${token}`)}`}
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white"
          >
            {t.signIn}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => void accept()}
            disabled={accepting || Boolean(share)}
            className="mt-6 min-h-11 rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {share ? t.acceptedInvitation : accepting ? t.creatingShareLink : t.acceptShare}
          </button>
        )}
        {error ? <p role="alert" className="mt-4 text-sm text-[#a83d2b]">{t.sharingFailed}</p> : null}
      </section>
    </main>
  );
}
