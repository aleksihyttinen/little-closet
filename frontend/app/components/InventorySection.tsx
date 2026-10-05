"use client";

import { Fragment, useState } from "react";
import type { Messages } from "../messages";
import type { ClothingItem, SizeOption } from "../types";

type SortField = "name" | "category" | "size";
type SortDirection = "asc" | "desc";

type InventorySectionProps = {
    items: ClothingItem[];
    sizes: SizeOption[];
    loading: boolean;
    signedIn: boolean;
    deletingId: string | null;
    t: Messages;
    getCategoryName: (item: ClothingItem) => string;
    getTopCategoryName: (item: ClothingItem) => string;
    getSizeName: (item: ClothingItem) => string;
    onEdit: (item: ClothingItem) => void;
    onDelete: (item: ClothingItem) => void | Promise<void>;
};

export default function InventorySection({
    items,
    sizes,
    loading,
    signedIn,
    deletingId,
    t,
    getCategoryName,
    getTopCategoryName,
    getSizeName,
    onEdit,
    onDelete,
}: InventorySectionProps) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("size");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const filteredItems = items.filter((item) =>
        `${item.name} ${getCategoryName(item)} ${getSizeName(item)}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
    );

    const sortedItems = [...filteredItems].sort((left, right) => {
        let comparison = 0;

        if (sortField === "name") {
            comparison = left.name.localeCompare(right.name);
        } else if (sortField === "category") {
            comparison = getCategoryName(left).localeCompare(getCategoryName(right));
        } else if (sortField === "size") {
            const leftSize = sizes.find((size) => size.id === left.size_id);
            const rightSize = sizes.find((size) => size.id === right.size_id);
            comparison = (leftSize?.sortOrder ?? Number.MAX_SAFE_INTEGER) -
                (rightSize?.sortOrder ?? Number.MAX_SAFE_INTEGER);
            if (comparison === 0) comparison = getSizeName(left).localeCompare(getSizeName(right));
        }

        if (comparison === 0) comparison = left.name.localeCompare(right.name);
        return sortDirection === "asc" ? comparison : -comparison;
    });

    const groupedItems = new Map<string, ClothingItem[]>();
    for (const item of sortedItems) {
        const categoryName = getTopCategoryName(item);
        const group = groupedItems.get(categoryName) ?? [];
        group.push(item);
        groupedItems.set(categoryName, group);
    }
    const sortedGroups = [...groupedItems.entries()].sort(([left], [right]) => {
        const comparison = left.localeCompare(right);
        return sortField === "category" && sortDirection === "desc" ? -comparison : comparison;
    });

    const chooseSortField = (field: SortField) => {
        if (field === sortField) {
            setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
            return;
        }
        setSortField(field);
        setSortDirection("asc");
    };

    const sortHeading = (field: SortField, label: string, className: string) => (
        <th
            scope="col"
            aria-sort={sortField === field ? sortDirection === "asc" ? "ascending" : "descending" : "none"}
            className={className}
        >
            <button
                type="button"
                onClick={() => chooseSortField(field)}
                aria-label={`${label}, ${sortField === field
                    ? sortDirection === "asc" ? t.sortAscending : t.sortDescending
                    : t.sortColumn
                    }`}
                className={`group -mx-2 inline-flex min-h-8 items-center gap-1 rounded px-2 text-left font-semibold normal-case transition hover:bg-[#477361] hover:text-[#e4ece6] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#c5d7ca] ${sortField === field ? "text-[#e4ece6]" : "text-[#cbd8d0]"}`}
            >
                {label}
                <span aria-hidden="true" className="text-[#c0d0c6] group-hover:text-[#e4ece6]">
                    {sortField === field ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
                </span>
            </button>
        </th>
    );

    return (
        <section className="border border-[#d6dbd3] bg-white shadow-[0_8px_24px_rgba(35,53,43,0.04)]">
            <div className="flex flex-col gap-4 border-b border-[#e1e5df] px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
                            {t.currentStock}
                        </p>
                        <h2 className="mt-1 text-xl font-semibold">{t.clothingItems}</h2>
                    </div>
                    <label className="w-full text-xs font-semibold uppercase tracking-wide text-[#65716b] lg:max-w-xs">
                        {t.searchInventory}
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="mt-1.5 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm font-normal normal-case tracking-normal text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                        />
                    </label>
                </div>
            </div>

            {loading ? (
                <p className="px-6 py-10 text-center text-sm text-[#68746d]">{t.loading}</p>
            ) : sortedItems.length === 0 ? (
                <div className="px-6 py-12 text-center">
                    <p className="font-medium text-[#34433b]">
                        {items.length === 0 ? t.emptyCloset : t.noMatches}
                    </p>
                    <p className="mt-1 text-sm text-[#68746d]">
                        {items.length === 0 ? t.emptyClosetHint : t.noMatchesHint}
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="border-b-2  bg-[#315c4c] text-xs uppercase tracking-wide text-[#dce9df]">
                            <tr>
                                {sortHeading("name", t.itemName, "px-6 py-3")}
                                {sortHeading("category", t.category, "px-4 py-3")}
                                {sortHeading("size", t.size, "px-4 py-3")}
                                {signedIn ? (
                                    <th scope="col" className="px-6 py-3 text-right font-semibold">{t.actions}</th>
                                ) : null}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8ebe6]">
                            {sortedGroups.map(([categoryName, categoryItems]) => (
                                    <Fragment key={categoryName}>
                                        <tr className="border-y border-[#d6ded5] bg-[#e7efe7]">
                                            <th
                                                scope="rowgroup"
                                                colSpan={signedIn ? 4 : 3}
                                                className="px-6 py-3"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-sm font-semibold text-[#293730]">{categoryName}</span>
                                                    <span className="inline-flex shrink-0 rounded-full border border-[#d6ded5] bg-white px-3 py-1 text-xs font-semibold tabular-nums text-[#315c4c]">
                                                        {categoryItems.length} {t.unitsLabel}
                                                    </span>
                                                </div>

                                            </th>
                                        </tr>
                                        {categoryItems.map((item) => (
                                            <tr key={item.id} className="transition-colors hover:bg-[#fafbf8]">
                                                <th scope="row" className="px-6 py-4 font-semibold text-[#293730]">
                                                    {item.name}
                                                </th>
                                                <td className="px-4 py-4 text-[#59675e]">{getCategoryName(item)}</td>
                                                <td className="px-4 py-4 text-[#59675e]">{getSizeName(item)}</td>
                                                {signedIn ? (
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={deletingId === item.id}
                                                                onClick={() => onEdit(item)}
                                                                className="rounded-md border border-[#cbd3ca] px-3 py-1.5 text-xs font-semibold text-[#315c4c] transition hover:bg-[#edf3eb] disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                {t.edit}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={deletingId === item.id}
                                                                onClick={() => void onDelete(item)}
                                                                className="rounded-md border border-[#e0c8c0] px-3 py-1.5 text-xs font-semibold text-[#9b4938] transition hover:bg-[#fff3ef] disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                {deletingId === item.id ? t.deleting : t.delete}
                                                            </button>
                                                        </div>
                                                    </td>
                                                ) : null}
                                            </tr>
                                        ))}
                                    </Fragment>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}