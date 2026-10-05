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
    </div>
  );
}
