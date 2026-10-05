import Image from "next/image";
import type { Language, Messages } from "../messages";
import type { ClothingItem } from "../types";

type DashboardHeaderProps = {
  t: Messages;
  language: Language;
  items: ClothingItem[];
  onLanguageChange: (language: Language) => void;
};

export default function DashboardHeader({
  t,
  language,
  onLanguageChange,
}: DashboardHeaderProps) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-5  sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60766b]">
            {t.inventoryKicker}
          </p>
          <div className="mt-2 flex gap-3 items-center ">
            <Image
              src="/favicon.svg"
              alt="Little Closet logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.pageTitle}
            </h1>
          </div>
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
        </div>
      </header>
    </>
  );
}