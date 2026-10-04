"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { ApiError, apiRequest, fetchClothingItems } from "./api";
import { messages, type Language } from "./messages";
import AdminPanel from "./components/AdminPanel";
import DashboardHeader from "./components/DashboardHeader";
import InventoryInsights from "./components/InventoryInsights";
import InventorySection from "./components/InventorySection";
import LoginDialog from "./components/LoginDialog";
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

export default function Home() {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [error, setError] = useState<ErrorKey | "">("");
  const [notice, setNotice] = useState<NoticeKey | "">("");
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const signingInRef = useRef(false);
  const t = messages[language];

  const showError: Dispatch<SetStateAction<ErrorKey | "">> = (nextError) => {
    setError(nextError);
    setNotice("");
  };
  const showNotice: Dispatch<SetStateAction<NoticeKey | "">> = (nextNotice) => {
    setNotice(nextNotice);
    setError("");
  };

  useEffect(() => {
    if (!error && !notice) return;

    const timeout = window.setTimeout(() => {
      setError("");
      setNotice("");
    }, 7000);

    return () => window.clearTimeout(timeout);
  }, [error, notice]);

  const refreshItems = async () => {
    setItems(await fetchClothingItems());
  };

  const handleApiError = (requestError: unknown, loginFailure = false) => {
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
      setLoginOpen(true);
    }
  };

  const admin = useAdminPanel({
    signedIn,
    t,
    setError: showError,
    setNotice: showNotice,
    openLogin: () => setLoginOpen(true),
    handleApiError,
    refreshItems,
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        await apiRequest("/auth/session", { method: "GET" });
        if (active) setSignedIn(true);
      } catch {
        if (active) setSignedIn(false);
      } finally {
        if (active) setSessionLoading(false);
      }
    };

    void checkSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      try {
        const loadedItems = await fetchClothingItems();

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
  }, []);

  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);

  const changeLanguage = (nextLanguage: Language) => {
    window.localStorage.setItem("little-closet-language", nextLanguage);
    window.dispatchEvent(new Event(languageChangeEvent));
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (signingInRef.current) return;

    signingInRef.current = true;
    setSigningIn(true);
    showError("");

    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSignedIn(true);
      setPassword("");
      setLoginOpen(false);
      showNotice("signedInNotice");
    } catch (requestError) {
      const status = requestError instanceof ApiError ? requestError.status : 0;

      if (status !== 401) {
        showError("serverError");
      }
      handleApiError(requestError, true);
    } finally {
      signingInRef.current = false;
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    showError("");
    setLoginOpen(false);

    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
      showNotice("signedOutNotice");
    } catch (requestError) {
      const status = requestError instanceof ApiError ? requestError.status : 0;

      if (status !== 401) {
        showError("serverError");
      }
      handleApiError(requestError, true);
    } finally {
      setSignedIn(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f3ed] px-4 py-6 text-[#202a27] sm:px-8 sm:py-10">
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
        <DashboardHeader
          t={t}
          language={language}
          signedIn={signedIn}
          sessionLoading={sessionLoading}
          totalUnits={totalUnits}
          items={items}
          onLanguageChange={changeLanguage}
          onLogout={() => void handleLogout()}
          onSignIn={() => {
            showError("");
            setLoginOpen(true);
          }}
        />

        <InventoryInsights
          items={items}
          sizes={admin.sizes}
          language={language}
          loading={loading || admin.referencesLoading}
          t={t}
          getCategoryName={admin.getCategoryName}
          getSizeName={admin.getSizeName}
        />

        {sessionLoading ? (
          <section role="status" className="mb-8 border border-[#d6dbd3] bg-white p-5 text-sm text-[#68746d]">
            {t.checkingSession}
          </section>
        ) : signedIn ? (
          <AdminPanel
            t={t}
            controller={admin}
          />
        ) : (
          <section className="mb-8 flex flex-col gap-4 border border-[#d6dbd3] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
                {t.adminAccess}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{t.signInToManage}</h2>
              <p className="mt-1 text-sm text-[#68746d]">
                {t.adminOnly}
              </p>
            </div>
          </section>
        )}

        <InventorySection
          items={items}
          sizes={admin.sizes}
          loading={loading || admin.referencesLoading}
          signedIn={signedIn}
          deletingId={admin.deletingId}
          t={t}
          getCategoryName={admin.getCategoryName}
          getTopCategoryName={admin.getTopCategoryName}
          getSizeName={admin.getSizeName}
          onEdit={admin.editItem}
          onDelete={admin.deleteItem}
        />
      </div>

      {loginOpen ? (
        <LoginDialog
          t={t}
          email={email}
          signingIn={signingIn}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onClose={() => setLoginOpen(false)}
          onSubmit={handleLogin}
        />
      ) : null}
    </main>
  );
}
