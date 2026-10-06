"use client";

import type { Language, Messages } from "../messages";

type UserTabProps = {
  t: Messages;
  signedIn: boolean;
  language: Language;
  onLanguageChange: (language: Language) => void;
  user: { name: string; email: string; image?: string | null } | null;
  onSignInClick: () => void;
  onLogout?: () => void;
};

export default function UserTab({ t, language, onLanguageChange, user, signedIn, onSignInClick, onLogout }: UserTabProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div role="group" aria-label={t.languageLabel} className="flex rounded-md border border-[#cbd3ca] bg-white p-1">
        {(["fi", "en"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={language === option}
            onClick={() => onLanguageChange(option)}
            className={`min-h-9 min-w-11 rounded px-3 text-xs font-bold transition ${language === option
              ? "bg-[#315c4c] text-white"
              : "text-[#45534b] hover:bg-[#f4f6f1]"
              }`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
      {!signedIn ?
        <div role="tabpanel" aria-label="User" className="w-full px-4">
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
            <button
              onClick={onSignInClick}
              className="min-h-11 rounded-md bg-[#315c4c] px-6 text-sm font-semibold text-white transition hover:bg-[#244738]"
            >
              {t.signIn || "Sign In"}
            </button>
          </section>
        </div>
        :
        <div role="tabpanel" aria-label="User" className="w-full px-4">
          <section className="border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
                  {t.userManagement || "User Management"}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{t.currentUser || "Current User"}</h2>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="min-h-11 rounded-md bg-[#a83d2b] px-6 text-sm font-semibold text-white transition hover:bg-[#8b3220] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a83d2b]"
                >
                  {t.logOut || "Log Out"}
                </button>
              )}
            </div>

            <div className="mt-6 flex items-center gap-4 rounded-lg border border-[#d6dbd3] bg-[#f8faf7] p-4">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" referrerPolicy="no-referrer" className="size-14 rounded-full object-cover" />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-[#315c4c] text-xl font-semibold text-white">
                  {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <dl className="min-w-0 text-sm">
                <dt className="text-xs font-semibold text-[#718077]">{t.nameLabel}</dt>
                <dd className="truncate font-semibold text-[#202a27]">{user?.name || "-"}</dd>
                <dt className="mt-2 text-xs font-semibold text-[#718077]">{t.emailLabel}</dt>
                <dd className="truncate text-[#45534b]">{user?.email || "-"}</dd>
              </dl>
            </div>
          </section>
        </div>
      }
    </div>
  )
}
