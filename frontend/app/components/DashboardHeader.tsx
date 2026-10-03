import type { Language, Messages } from "../messages";
import type { ClothingItem } from "../types";

type DashboardHeaderProps = {
  t: Messages;
  language: Language;
  signedIn: boolean;
  sessionLoading: boolean;
  totalUnits: number;
  items: ClothingItem[];
  onLanguageChange: (language: Language) => void;
  onLogout: () => void;
  onSignIn: () => void;
};

export default function DashboardHeader({
  t,
  language,
  signedIn,
  sessionLoading,
  totalUnits,
  items,
  onLanguageChange,
  onLogout,
  onSignIn,
}: DashboardHeaderProps) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-5 border-b border-[#cdd4cd] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60766b]">
            {t.inventoryKicker}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t.pageTitle}
          </h1>
          <p className="mt-2 text-sm text-[#65716b]">{t.pageSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <button
            type="button"
            onClick={signedIn ? onLogout : onSignIn}
            disabled={sessionLoading}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white transition hover:bg-[#244738] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c4c] disabled:cursor-wait disabled:opacity-70"
          >
            {sessionLoading ? t.checkingSession : signedIn ? t.logOut : t.adminSignIn}
          </button>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="border-l-2 border-[#a9bd8b] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">{t.piecesInCloset}</p>
          <p className="mt-1 text-2xl font-semibold">{totalUnits}</p>
        </div>
        <div className="border-l-2 border-[#d7a45b] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">{t.differentItems}</p>
          <p className="mt-1 text-2xl font-semibold">{items.length}</p>
        </div>
        <div className="border-l-2 border-[#94adb0] bg-white/70 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">{t.categories}</p>
          <p className="mt-1 text-2xl font-semibold">
            {new Set(items.map((item) => item.category_id)).size}
          </p>
        </div>
      </div>
    </>
  );
}