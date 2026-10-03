"use client";

import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
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
  const t = messages[language];

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
    setError(errorKey);
    if (status === 401 && !loginFailure) {
      setSignedIn(false);
      setLoginOpen(true);
    }
  };

  const admin = useAdminPanel({
    signedIn,
    t,
    setError,
    setNotice,
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
          setError("loadError");
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
    setError("");

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      //TODO REMOVE AUTH HEADER LOGIC WHEN DOMAIN NAME IS SET

      if (!data.token) {
        throw new Error("Login response did not contain a token");
      }

      localStorage.setItem("sessionToken", data.token);

      setSignedIn(true);
      setPassword("");
      setLoginOpen(false);
      setNotice("signedInNotice");
    } catch (requestError) {
      const status = requestError instanceof ApiError ? requestError.status : 0;

      if (status !== 401) {
        setError("serverError");
      }
      handleApiError(requestError, true);
    }
  };

  const handleLogout = async () => {
    setError("");
    setLoginOpen(false);

    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } catch (requestError) {
      const status = requestError instanceof ApiError ? requestError.status : 0;

      if (status !== 401) {
        setError("serverError");
      }
      handleApiError(requestError, true);
    } finally {
      localStorage.removeItem("sessionToken");
      setSignedIn(false);
      setNotice("signedOutNotice");
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f3ed] px-4 py-6 text-[#202a27] sm:px-8 sm:py-10">
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
            setError("");
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

        {error ? (
          <p
            role="alert"
            className="mb-4 border border-[#e0b9ae] bg-[#fff3ef] px-4 py-3 text-sm text-[#8c3928]"
          >
            {t[error]}
          </p>
        ) : null}
        {notice ? (
          <p
            role="status"
            className="mb-4 border border-[#b8d0bd] bg-[#edf6ee] px-4 py-3 text-sm text-[#315c4c]"
          >
            {t[notice]}
          </p>
        ) : null}

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
