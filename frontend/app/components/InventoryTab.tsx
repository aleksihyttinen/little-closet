"use client";

import type { Messages } from "../messages";
import type { ClothingItem, SizeOption } from "../types";
import AdminPanel from "./AdminPanel";
import InventorySection from "./InventorySection";
import type { useAdminPanel } from "../hooks/useAdminPanel";

type InventoryTabProps = {
  t: Messages;
  items: ClothingItem[];
  sizes: SizeOption[];
  loading: boolean;
  signedIn: boolean;
  deletingId: string | null;
  getCategoryName: (item: ClothingItem) => string;
  getTopCategoryName: (item: ClothingItem) => string;
  getSizeName: (item: ClothingItem) => string;
  controller: ReturnType<typeof useAdminPanel>;
  openLoginDialog: () => void;
};

export default function InventoryTab({
  t,
  items,
  sizes,
  loading,
  signedIn,
  deletingId,
  getCategoryName,
  getTopCategoryName,
  getSizeName,
  controller,
  openLoginDialog,
}: InventoryTabProps) {
  return (
    <div role="tabpanel" aria-label="Inventory">
      {!signedIn && (
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
              onClick={openLoginDialog}
              className="min-h-11 rounded-md bg-[#315c4c] px-6 text-sm font-semibold text-white transition hover:bg-[#244738]"
            >
              {t.signIn || "Sign In"}
            </button>
          </section>
      )}

      {signedIn && (
        <AdminPanel
          t={t}
          controller={controller}
        />
      )}

      <InventorySection
        items={items}
        sizes={sizes}
        loading={loading}
        signedIn={signedIn}
        deletingId={deletingId}
        t={t}
        getCategoryName={getCategoryName}
        getTopCategoryName={getTopCategoryName}
        getSizeName={getSizeName}
        onEdit={controller.editItem}
        onDelete={controller.deleteItem}
      />
    </div>
  );
}
