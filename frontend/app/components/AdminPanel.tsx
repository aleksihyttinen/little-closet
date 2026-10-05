"use client";

import type { Messages } from "../messages";
import type { useAdminPanel } from "../hooks/useAdminPanel";

type AdminPanelProps = {
  t: Messages;
  controller: ReturnType<typeof useAdminPanel>;
};
export default function AdminPanel({ t, controller }: AdminPanelProps) {
  const {
    adminPanelRef,
    analyzingClothing,
    analysisPreview,
    analyzeClothingImage,
    categories,
    sizes,
    form,
    setForm,
    editingId,
    panelExpanded,
    setPanelExpanded,
    saving,
    newCategoryName,
    setNewCategoryName,
    newCategoryParentId,
    setNewCategoryParentId,
    newSizeName,
    setNewSizeName,
    setNewSizeOrder,
    sizeOrderValue,
    creatingReference,
    editingReference,
    referenceName,
    setReferenceName,
    referenceParentId,
    setReferenceParentId,
    referenceSortOrder,
    setReferenceSortOrder,
    savingReferenceId,
    getCategoryPath,
    getDescendantCategoryIds,
    saveItem: onSaveItem,
    cancelItemEdit: onCancelItemEdit,
    createCategory: onCreateCategory,
    createSize: onCreateSize,
    updateCategory: onUpdateCategory,
    updateSize: onUpdateSize,
    deleteCategory: onDeleteCategory,
    deleteSize: onDeleteSize,
    startEditCategory: onStartEditCategory,
    startEditSize: onStartEditSize,
    cancelReferenceEdit: onCancelReferenceEdit,
  } = controller;

  return (
    <section ref={adminPanelRef} className="scroll-mt-24 mb-8 border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
            {editingId ? t.updateDetails : t.addToInventory}
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {editingId ? t.editClothingItem : t.newClothingItem}
          </h2>
        </div>
        <button
          type="button"
          aria-expanded={panelExpanded}
          aria-controls="admin-tools-content"
          onClick={() => setPanelExpanded((isExpanded) => !isExpanded)}
          className="min-h-10 rounded-md border border-[#cbd3ca] px-3 text-sm font-semibold text-[#45534b] transition hover:bg-[#f4f6f1]"
        >
          {panelExpanded ? t.hideAdminPanel : t.showAdminPanel}
        </button>
      </div>

      <div id="admin-tools-content" hidden={!panelExpanded}>
        <div className="mb-6 border-b border-[#e1e5df] pb-6">
          <div className="flex flex-col gap-4 rounded-lg border border-[#d6dbd3] bg-[#f8faf7] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#34433b]">
                {t.scanClothing}
              </p>

              <p className="mt-1 text-xs leading-5 text-[#718077]">
                {t.scanClothingHint}
              </p>
            </div>

            <label className="relative inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white transition hover:bg-[#244738]">
              {analyzingClothing
                ? t.analyzingClothing
                : t.takeOrChoosePhoto}

              <input
                type="file"
                accept="image/*"
                capture="environment"
                disabled={analyzingClothing}
                className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void analyzeClothingImage(file);
                  }

                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {analysisPreview ? (
            <div className="mt-4 flex items-center gap-3">
              <img
                src={analysisPreview}
                alt=""
                className="h-20 w-20 rounded-md border border-[#d6dbd3] object-cover"
              />

              <div className="min-w-0">
                {analyzingClothing ? (
                  <>
                    <p className="text-sm font-medium text-[#34433b]">
                      {t.analyzingClothing}
                    </p>

                    <p className="mt-1 text-xs text-[#718077]">
                      {t.analyzingClothingHint}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-[#34433b]">
                      {t.analysisComplete}
                    </p>

                    <p className="mt-1 text-xs text-[#718077]">
                      {t.analysisCompleteHint}
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <form onSubmit={onSaveItem} className="mb-6 grid gap-4 border-b border-[#e1e5df] pb-6 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-medium text-[#45534b] lg:col-span-2">
            {t.itemName}
            <input
              required
              maxLength={120}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder={t.namePlaceholder}
              className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none transition focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
            />
          </label>
          <label className="text-sm font-medium text-[#45534b]">
            {t.category}
            <select
              required
              value={form.category_id}
              onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
              className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{getCategoryPath(category.id)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-[#45534b]">
            {t.size}
            <select
              required
              value={form.size_id}
              onChange={(event) => setForm((current) => ({ ...current, size_id: event.target.value }))}
              className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
            >
              {sizes.map((size) => (
                <option key={size.id} value={size.id}>{size.name}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white transition hover:bg-[#244738] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? t.saving : editingId ? t.saveChanges : t.addItem}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={onCancelItemEdit}
                className="min-h-11 rounded-md border border-[#cbd3ca] px-4 text-sm font-semibold text-[#45534b] transition hover:bg-[#f4f6f1]"
              >
                {t.cancel}
              </button>
            ) : null}
          </div>
        </form>

        <div className="grid gap-6 border-t border-[#e1e5df] pt-5 md:grid-cols-2">
          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#34433b]">{t.manageCategories}</h3>
            <form onSubmit={onCreateCategory} className="mb-4 border-b border-[#e8ebe6] pb-4">
              <label className="block text-sm font-medium text-[#45534b]">
                {t.categoryName}
                <input
                  required
                  maxLength={120}
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  placeholder={t.categoryPlaceholder}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-[#45534b]">
                {t.parentCategory}
                <select
                  value={newCategoryParentId}
                  onChange={(event) => setNewCategoryParentId(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                >
                  <option value="">{t.noParentCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{getCategoryPath(category.id)}</option>
                  ))}
                </select>
              </label>
              <button type="submit" disabled={creatingReference !== null} className="mt-3 min-h-10 rounded-md bg-[#315c4c] px-4 text-sm font-semibold text-white disabled:opacity-45">
                {creatingReference === "category" ? "…" : t.addCategory}
              </button>
            </form>
            <div className="max-h-72 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="border-b border-[#e8ebe6] py-3 last:border-b-0">
                  {editingReference?.kind === "category" && editingReference.id === category.id ? (
                    <form onSubmit={(event) => void onUpdateCategory(event, category)} className="space-y-3">
                      <label className="block text-sm font-medium text-[#45534b]">
                        {t.categoryName}
                        <input required maxLength={120} value={referenceName} onChange={(event) => setReferenceName(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm" />
                      </label>
                      <label className="block text-sm font-medium text-[#45534b]">
                        {t.parentCategory}
                        <select value={referenceParentId} onChange={(event) => setReferenceParentId(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm">
                          <option value="">{t.noParentCategory}</option>
                          {categories
                            .filter((option) => !getDescendantCategoryIds(category.id).has(option.id))
                            .map((option) => (
                              <option key={option.id} value={option.id}>{getCategoryPath(option.id)}</option>
                            ))}
                        </select>
                      </label>
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingReferenceId === category.id} className="min-h-9 rounded-md bg-[#315c4c] px-3 text-xs font-semibold text-white disabled:opacity-45">{t.saveChanges}</button>
                        <button type="button" onClick={onCancelReferenceEdit} className="min-h-9 rounded-md border border-[#cbd3ca] px-3 text-xs font-semibold text-[#45534b]">{t.cancel}</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm text-[#34433b]">{getCategoryPath(category.id)}</p>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" disabled={savingReferenceId === category.id} onClick={() => onStartEditCategory(category)} className="rounded-md border border-[#cbd3ca] px-3 py-1.5 text-xs font-semibold text-[#315c4c] hover:bg-[#edf3eb] disabled:opacity-45">{t.edit}</button>
                        <button type="button" disabled={savingReferenceId === category.id} onClick={() => void onDeleteCategory(category)} className="rounded-md border border-[#e0c8c0] px-3 py-1.5 text-xs font-semibold text-[#9b4938] hover:bg-[#fff3ef] disabled:opacity-45">{savingReferenceId === category.id ? t.deleting : t.delete}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-[#34433b]">{t.manageSizes}</h3>
            <form onSubmit={onCreateSize} className="mb-4 border-b border-[#e8ebe6] pb-4">
              <label className="block text-sm font-medium text-[#45534b]">
                {t.sizeName}
                <input required maxLength={60} value={newSizeName} onChange={(event) => setNewSizeName(event.target.value)} placeholder={t.sizePlaceholder} className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15" />
              </label>
              <label className="mt-3 block text-sm font-medium text-[#45534b]">
                {t.sizeOrder}
                <input type="number" min="0" step="1" value={sizeOrderValue} onChange={(event) => setNewSizeOrder(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15" />
              </label>
              <button type="submit" disabled={creatingReference !== null} className="mt-3 min-h-10 rounded-md bg-[#315c4c] px-4 text-sm font-semibold text-white disabled:opacity-45">
                {creatingReference === "size" ? "…" : t.addSize}
              </button>
            </form>
            <div className="max-h-72 overflow-y-auto">
              {sizes.map((size) => (
                <div key={size.id} className="border-b border-[#e8ebe6] py-3 last:border-b-0">
                  {editingReference?.kind === "size" && editingReference.id === size.id ? (
                    <form onSubmit={(event) => void onUpdateSize(event, size)} className="space-y-3">
                      <label className="block text-sm font-medium text-[#45534b]">
                        {t.sizeName}
                        <input required maxLength={60} value={referenceName} onChange={(event) => setReferenceName(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm" />
                      </label>
                      <label className="block text-sm font-medium text-[#45534b]">
                        {t.sizeOrder}
                        <input required type="number" min="0" step="1" value={referenceSortOrder} onChange={(event) => setReferenceSortOrder(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm" />
                      </label>
                      <div className="flex gap-2">
                        <button type="submit" disabled={savingReferenceId === size.id} className="min-h-9 rounded-md bg-[#315c4c] px-3 text-xs font-semibold text-white disabled:opacity-45">{t.saveChanges}</button>
                        <button type="button" onClick={onCancelReferenceEdit} className="min-h-9 rounded-md border border-[#cbd3ca] px-3 text-xs font-semibold text-[#45534b]">{t.cancel}</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm text-[#34433b]">
                        {size.name} <span className="text-xs text-[#718077]">({size.sortOrder})</span>
                      </p>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" disabled={savingReferenceId === size.id} onClick={() => onStartEditSize(size)} className="rounded-md border border-[#cbd3ca] px-3 py-1.5 text-xs font-semibold text-[#315c4c] hover:bg-[#edf3eb] disabled:opacity-45">{t.edit}</button>
                        <button type="button" disabled={savingReferenceId === size.id} onClick={() => void onDeleteSize(size)} className="rounded-md border border-[#e0c8c0] px-3 py-1.5 text-xs font-semibold text-[#9b4938] hover:bg-[#fff3ef] disabled:opacity-45">{savingReferenceId === size.id ? t.deleting : t.delete}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}