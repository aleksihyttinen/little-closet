"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { authClient } from "./lib/auth";
import {
  ApiError,
  clearCachedToken,
  fetchClothingItems,
  getAuthSession,
  clearActiveClosetOwnerId,
  type ApiMode,
} from "./api";
import { messages, type Language } from "./messages";
import DashboardHeader from "./components/DashboardHeader";
import SplashScreen from "./components/SplashScreen";
import TabNavigation from "./components/TabNavigation";
import DashboardTab from "./components/DashboardTab";
import InventoryTab from "./components/InventoryTab";
import UserTab from "./components/UserTab";
import { useAdminPanel } from "./hooks/useAdminPanel";
import type {
  ClothingItem,
  ErrorKey,
  NoticeKey,
} from "./types";

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

type Tab = "dashboard" | "inventory" | "user";

export default function ClosetApp({ mode }: { mode: ApiMode }) {
  const isDemo = mode === "demo";
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const [user, setUser] = useState<{
    name: string;
    email: string;
    image?: string | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [error, setError] = useState<ErrorKey | "">("");
  const [notice, setNotice] = useState<NoticeKey | "">("");
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const router = useRouter();
  const t = messages[language];

  const showError = useCallback<Dispatch<SetStateAction<ErrorKey | "">>>(
    (nextError) => {
      setError(nextError);
      setNotice("");
    },
    [],
  );
  const showNotice = useCallback<Dispatch<SetStateAction<NoticeKey | "">>>(
    (nextNotice) => {
      setNotice(nextNotice);
      setError("");
    },
    [],
  );

  useEffect(() => {
    if (!error && !notice) return;

    const timeout = window.setTimeout(() => {
      setError("");
      setNotice("");
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [error, notice]);

  const refreshItems = useCallback(async () => {
    setItems(await fetchClothingItems(mode));
  }, [mode]);

  const handleApiError = useCallback(
    (requestError: unknown, loginFailure = false) => {
      const status = requestError instanceof ApiError ? requestError.status : 0;

      const errorKey: ErrorKey =
        status === 400
          ? "invalidData"
          : status === 401
            ? loginFailure
              ? "loginFailed"
              : "sessionExpired"
            : status === 404
              ? "notFound"
              : status === 409
                ? "referenceInUse"
                : status >= 500
                  ? "serverError"
                  : requestError instanceof ApiError
                    ? "requestFailed"
                    : "connectionError";

      showError(errorKey);

      if (status === 401 && !loginFailure) {
        setSignedIn(false);
        router.push("/auth/sign-in");
      }
    },
    [showError, router],
  );

  const openLogin = useCallback(() => {
    router.push("/auth/sign-in");
  }, [router]);

  const admin = useAdminPanel({
    language,
    signedIn,
    apiMode: mode,
    t,
    setError: showError,
    setNotice: showNotice,
    openLogin,
    handleApiError,
    refreshItems,
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      if (isDemo) {
        setSessionLoading(false);
        return;
      }

      let hasSession = false;

      try {
        const { data } = await getAuthSession();
        if (window.location.search.includes("neon_auth_session_verifier")) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        hasSession = Boolean(data?.session);
        if (data?.user && active) {
          setUser({
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
          });
        }
      } catch {}

      if (!active) return;

      if (hasSession) {
        setSignedIn(true);
        setSessionLoading(false);
      } else {
        setSignedIn(false);
        router.replace("/auth/sign-in");
      }
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, [isDemo, router]);

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      try {
        const loadedItems = await fetchClothingItems(mode);

        if (!active) return;

        setItems(loadedItems);
      } catch {
        if (active) {
          showError("loadError");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadItems();

    return () => {
      active = false;
    };
  }, [mode, showError]);

  const totalUnits = items.length;

  const changeLanguage = (nextLanguage: Language) => {
    window.localStorage.setItem("little-closet-language", nextLanguage);
    window.dispatchEvent(new Event(languageChangeEvent));
  };

  const handleLogout = async () => {
    showError("");
    try {
      await authClient.signOut();
      clearCachedToken();
      clearActiveClosetOwnerId();
      navigator.serviceWorker.controller?.postMessage({
        type: "CLEAR_API_CACHE",
      });
      setSignedIn(false);
      router.replace("/auth/sign-in");
    } catch (requestError) {
      const status =
        requestError instanceof ApiError ? requestError.status : 0;
      if (status === 401) {
        navigator.serviceWorker.controller?.postMessage({
          type: "CLEAR_API_CACHE",
        });
        setSignedIn(false);
      } else {
        showError("serverError");
      }
      handleApiError(requestError, true);
    }
  };

  if (sessionLoading || loading) {
    return <SplashScreen label={t.checkingSession} />;
  }

  return (
    <main className="min-h-screen bg-[#f4f3ed] px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-28 text-[#202a27] sm:px-8 sm:py-10 sm:pb-20">
      {error || notice ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
          {error ? (
            <div
              role="alert"
              className="pointer-events-auto flex w-full max-w-xl items-start justify-between gap-4 border border-[#d99a8d] border-l-4 border-l-[#a83d2b] bg-[#fff3ef] px-4 py-3 text-sm text-[#7e2f22] shadow-[0_10px_35px_rgba(49,38,32,0.22)]"
            >
              <p className="font-medium">{t[error]}</p>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label={t.close}
                className="shrink-0 rounded px-1 font-semibold text-[#7e2f22] hover:bg-[#f8ded7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e2f22]"
              >
                {t.close}
              </button>
            </div>
          ) : null}
          {notice ? (
            <div
              role="status"
              className="pointer-events-auto flex w-full max-w-xl items-start justify-between gap-4 border border-[#a9c5ad] border-l-4 border-l-[#315c4c] bg-[#edf6ee] px-4 py-3 text-sm text-[#294d3e] shadow-[0_10px_35px_rgba(49,38,32,0.22)]"
            >
              <p className="font-medium">{t[notice]}</p>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label={t.close}
                className="shrink-0 rounded px-1 font-semibold text-[#294d3e] hover:bg-[#dcebdd] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c4c]"
              >
                {t.close}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="mx-auto max-w-6xl">
        {isDemo ? (
          <section
            role="status"
            className="mb-6 border border-[#c9d9ca] bg-[#edf6ee] px-4 py-3 text-sm text-[#294d3e] sm:px-5"
          >
            <p className="font-semibold">{t.demoMode}</p>
            <p className="mt-1">{t.demoModeDescription}</p>
          </section>
        ) : null}

        <DashboardHeader
          t={t}
          items={items}
        />

        <TabNavigation
          t={t}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {sessionLoading ? (
          <section role="status" className="mb-8 border border-[#d6dbd3] bg-white p-5 text-sm text-[#68746d]">
            {t.checkingSession}
          </section>
        ) : null}

        {activeTab === "dashboard" && (
          <DashboardTab
            t={t}
            language={language}
            items={items}
            totalUnits={totalUnits}
            sizes={admin.sizes}
            loading={loading || admin.referencesLoading}
            getCategoryName={admin.getCategoryName}
            getSizeName={admin.getSizeName}
            apiMode={mode}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryTab
            t={t}
            items={items}
            sizes={admin.sizes}
            loading={loading || admin.referencesLoading}
            signedIn={signedIn}
            deletingId={admin.deletingId}
            getCategoryName={admin.getCategoryName}
            getTopCategoryName={admin.getTopCategoryName}
            getSizeName={admin.getSizeName}
            controller={admin}
            openLoginDialog={openLogin}
          />
        )}

        {activeTab === "user" && (
          <UserTab
            t={t}
            signedIn={signedIn}
            language={language}
            onLanguageChange={changeLanguage}
            user={user}
            canShare={signedIn && !isDemo}
            onSignInClick={openLogin}
            onLogout={() => void handleLogout()}
          />
        )}
      </div>

    </main>
  );
}
