import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { apiRequest, fetchCategories, fetchSizes } from "../api";
import type { Messages } from "../messages";
import type {
  CategoryOption,
  ClothingForm,
  ClothingItem,
  ErrorKey,
  NoticeKey,
  SizeOption,
} from "../types";

type ReferenceKind = "category" | "size" | null;
type ReferenceEdit = { kind: "category" | "size"; id: string } | null;

type UseAdminPanelOptions = {
  signedIn: boolean;
  t: Messages;
  setError: Dispatch<SetStateAction<ErrorKey | "">>;
  setNotice: Dispatch<SetStateAction<NoticeKey | "">>;
  openLogin: () => void;
  handleApiError: (error: unknown) => void;
  refreshItems: () => Promise<void>;
};

const createEmptyForm = (categoryId = "", sizeId = ""): ClothingForm => ({
  name: "",
  category_id: categoryId,
  size_id: sizeId,
  quantity: "1",
});

export function useAdminPanel({
  signedIn,
  t,
  setError,
  setNotice,
  openLogin,
  handleApiError,
  refreshItems,
}: UseAdminPanelOptions) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [form, setForm] = useState<ClothingForm>(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeOrder, setNewSizeOrder] = useState<string | null>(null);
  const [creatingReference, setCreatingReference] = useState<ReferenceKind>(null);
  const [editingReference, setEditingReference] = useState<ReferenceEdit>(null);
  const [referenceName, setReferenceName] = useState("");
  const [referenceParentId, setReferenceParentId] = useState("");
  const [referenceSortOrder, setReferenceSortOrder] = useState("0");
  const [savingReferenceId, setSavingReferenceId] = useState<string | null>(null);
  const [referencesLoading, setReferencesLoading] = useState(true);
  const sizeOrderValue = newSizeOrder ?? getNextSizeOrder(sizes);

  useEffect(() => {
    let active = true;

    const loadReferences = async () => {
      try {
        const [loadedCategories, loadedSizes] = await Promise.all([
          fetchCategories(),
          fetchSizes(),
        ]);
        if (!active) return;

        setCategories(loadedCategories);
        setSizes(loadedSizes);
        setForm((current) => ({
          ...current,
          category_id: current.category_id || loadedCategories[0]?.id || "",
          size_id: current.size_id || loadedSizes[0]?.id || "",
        }));
      } catch {
        if (active) setError("loadError");
      } finally {
        if (active) setReferencesLoading(false);
      }
    };

    void loadReferences();
    return () => {
      active = false;
    };
  }, [setError]);

  const refreshReferenceData = async () => {
    const [nextCategories, nextSizes] = await Promise.all([
      fetchCategories(),
      fetchSizes(),
    ]);

    setCategories(nextCategories);
    setSizes(nextSizes);
    setForm((current) => ({
      ...current,
      category_id: nextCategories.some((entry) => entry.id === current.category_id)
        ? current.category_id
        : nextCategories[0]?.id ?? "",
      size_id: nextSizes.some((entry) => entry.id === current.size_id)
        ? current.size_id
        : nextSizes[0]?.id ?? "",
    }));

    return { nextCategories, nextSizes };
  };

  const getCategoryPath = (categoryId: string, visited = new Set<string>()): string => {
    const category = categories.find((entry) => entry.id === categoryId);
    if (!category) return "";
    if (!category.parentId || visited.has(category.id)) return category.name;

    visited.add(category.id);
    const parentPath = getCategoryPath(category.parentId, visited);
    return parentPath ? `${parentPath} > ${category.name}` : category.name;
  };

  const getCategoryName = (item: ClothingItem) =>
    getCategoryPath(item.category_id) || item.category_name || "Unknown category";

  const getSizeName = (item: ClothingItem) =>
    item.size_name || sizes.find((entry) => entry.id === item.size_id)?.name || "Unknown size";

  const getDescendantCategoryIds = (categoryId: string) => {
    const descendantIds = new Set([categoryId]);
    let foundDescendant = true;
    while (foundDescendant) {
      foundDescendant = false;
      for (const category of categories) {
        if (
          category.parentId &&
          descendantIds.has(category.parentId) &&
          !descendantIds.has(category.id)
        ) {
          descendantIds.add(category.id);
          foundDescendant = true;
        }
      }
    }
    return descendantIds;
  };

  const cancelItemEdit = () => {
    setForm(createEmptyForm(categories[0]?.id ?? "", sizes[0]?.id ?? ""));
    setEditingId(null);
    setError("");
    setNotice("");
  };

  const saveItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signedIn) {
      openLogin();
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = { ...form, quantity: Number(form.quantity) };
      const path = editingId ? `/clothing/${editingId}` : "/clothing";
      await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await refreshItems();
      const wasEditing = editingId !== null;
      setForm(createEmptyForm(categories[0]?.id ?? "", sizes[0]?.id ?? ""));
      setEditingId(null);
      setNotice(wasEditing ? "itemUpdated" : "itemAdded");
    } catch (error) {
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item: ClothingItem) => {
    setForm({
      name: item.name,
      category_id: item.category_id,
      size_id: item.size_id,
      quantity: String(item.quantity),
    });
    setEditingId(item.id);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (item: ClothingItem) => {
    if (!signedIn) {
      openLogin();
      return;
    }
    if (!window.confirm(t.confirmDelete(item.name))) return;

    setDeletingId(item.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/clothing/${item.id}`, { method: "DELETE" });
      await refreshItems();
      if (editingId === item.id) {
        setForm(createEmptyForm(categories[0]?.id ?? "", sizes[0]?.id ?? ""));
        setEditingId(null);
      }
      setNotice("itemDeleted");
    } catch (error) {
      handleApiError(error);
    } finally {
      setDeletingId(null);
    }
  };

  const createCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signedIn) {
      openLogin();
      return;
    }

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      setError("invalidData");
      return;
    }

    setCreatingReference("category");
    setError("");
    setNotice("");
    try {
      const created = await apiRequest("/category", {
        method: "POST",
        body: JSON.stringify({ name: trimmedName, parent_id: newCategoryParentId || "" }),
      });
      const { nextCategories } = await refreshReferenceData();
      setNewCategoryName("");
      setNewCategoryParentId("");
      setForm((current) => ({
        ...current,
        category_id:
          created.item?.ID ??
          nextCategories.find(
            (category) =>
              category.name === trimmedName && category.parentId === (newCategoryParentId || null),
          )?.id ??
          current.category_id,
      }));
      setNotice("categoryAdded");
    } catch (error) {
      handleApiError(error);
    } finally {
      setCreatingReference(null);
    }
  };

  const createSize = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signedIn) {
      openLogin();
      return;
    }

    const trimmedName = newSizeName.trim();
    const parsedOrder = Number(sizeOrderValue);
    if (!trimmedName || !Number.isInteger(parsedOrder) || parsedOrder < 0) {
      setError("invalidData");
      return;
    }

    setCreatingReference("size");
    setError("");
    setNotice("");
    try {
      await apiRequest("/size", {
        method: "POST",
        body: JSON.stringify({ name: trimmedName, sort_order: parsedOrder }),
      });
      const { nextSizes } = await refreshReferenceData();
      setNewSizeName("");
      setNewSizeOrder(null);
      setForm((current) => ({
        ...current,
        size_id: nextSizes[nextSizes.length - 1]?.id ?? current.size_id ?? nextSizes[0]?.id ?? "",
      }));
      setNotice("sizeAdded");
    } catch (error) {
      handleApiError(error);
    } finally {
      setCreatingReference(null);
    }
  };

  const startEditCategory = (category: CategoryOption) => {
    setEditingReference({ kind: "category", id: category.id });
    setReferenceName(category.name);
    setReferenceParentId(category.parentId ?? "");
    setError("");
    setNotice("");
  };

  const startEditSize = (size: SizeOption) => {
    setEditingReference({ kind: "size", id: size.id });
    setReferenceName(size.name);
    setReferenceSortOrder(String(size.sortOrder));
    setError("");
    setNotice("");
  };

  const cancelReferenceEdit = () => {
    setEditingReference(null);
    setReferenceName("");
    setReferenceParentId("");
    setReferenceSortOrder("0");
  };

  const updateCategory = async (
    event: React.FormEvent<HTMLFormElement>,
    category: CategoryOption,
  ) => {
    event.preventDefault();
    const trimmedName = referenceName.trim();
    if (!trimmedName) {
      setError("invalidData");
      return;
    }

    setSavingReferenceId(category.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/category/${category.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: trimmedName, parent_id: referenceParentId }),
      });
      await refreshReferenceData();
      await refreshItems();
      cancelReferenceEdit();
      setNotice("categoryUpdated");
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingReferenceId(null);
    }
  };

  const updateSize = async (
    event: React.FormEvent<HTMLFormElement>,
    size: SizeOption,
  ) => {
    event.preventDefault();
    const trimmedName = referenceName.trim();
    const sortOrder = Number(referenceSortOrder);
    if (!trimmedName || !Number.isInteger(sortOrder) || sortOrder < 0) {
      setError("invalidData");
      return;
    }

    setSavingReferenceId(size.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/size/${size.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: trimmedName, sort_order: sortOrder }),
      });
      await refreshReferenceData();
      await refreshItems();
      cancelReferenceEdit();
      setNotice("sizeUpdated");
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingReferenceId(null);
    }
  };

  return {
    categories,
    sizes,
    form,
    setForm,
    editingId,
    saving,
    deletingId,
    referencesLoading,
    newCategoryName,
    setNewCategoryName,
    newCategoryParentId,
    setNewCategoryParentId,
    newSizeName,
    setNewSizeName,
    newSizeOrder,
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
    getCategoryName,
    getSizeName,
    getDescendantCategoryIds,
    saveItem,
    editItem,
    deleteItem,
    cancelItemEdit,
    createCategory,
    createSize,
    startEditCategory,
    startEditSize,
    cancelReferenceEdit,
    updateCategory,
    updateSize,
  };
}

function getNextSizeOrder(sizes: SizeOption[]): string {
  if (sizes.length === 0) return "0";
  return String(Math.max(...sizes.map((size) => size.sortOrder)) + 1);
}