"use client";

import type { Messages } from "../messages";
import type { ClothingItem, SizeOption } from "../types";
import InventoryInsights from "./InventoryInsights";

type DashboardTabProps = {
  t: Messages;
  language: "en" | "fi";
  items: ClothingItem[];
  totalUnits: number
  sizes: SizeOption[];
  loading: boolean;
  getCategoryName: (item: ClothingItem) => string;
  getSizeName: (item: ClothingItem) => string;
  onAddItemClick: () => void;
};

export default function DashboardTab({
  t,
  language,
  items,
  sizes,
  loading,
  totalUnits,
  getCategoryName,
  getSizeName,
  onAddItemClick,
}: DashboardTabProps) {
  return (
    <div role="tabpanel" aria-label="Dashboard">
      <InventoryInsights
        items={items}
        sizes={sizes}
        totalUnits={totalUnits}
        language={language}
        loading={loading}
        t={t}
        getCategoryName={getCategoryName}
        getSizeName={getSizeName}
      />
      <section className="mt-6 border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
              {t.quickActions || "Quick Actions"}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{t.addNewItem || "Add New Item"}</h2>
            <p className="mt-1 text-sm text-[#68746d]">
              {t.addItemDescription || "Add a new clothing item to your inventory"}
            </p>
          </div>
          <button
            onClick={onAddItemClick}
            className="min-h-11 rounded-md bg-[#315c4c] px-6 text-sm font-semibold text-white transition hover:bg-[#244738] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c4c]"
          >
            {t.addItem || "Add Item"}
          </button>
        </div>
      </section>
    </div>
  );
}
