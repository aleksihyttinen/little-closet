import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { apiRequest, fetchCategories, fetchSizes } from "../api";
import { analyzeClothing } from "../lib/analyzeClothing";
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
  language: 'en' | 'fi'
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
});

export function useAdminPanel({
  language,
  signedIn,
  t,
  setError,
  setNotice,
  openLogin,
  handleApiError,
  refreshItems,
}: UseAdminPanelOptions) {
  const adminPanelRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [editingName, setEditingName] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [filledFields, setFilledFields] = useState<(keyof ClothingForm)[]>([]);
  const [analyzingClothing, setAnalyzingClothing] = useState(false);
  const [analysisPreview, setAnalysisPreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [form, setForm] = useState<ClothingForm>(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [newSizeName, setNewSizeName] = useState("");
  const [creatingReference, setCreatingReference] = useState<ReferenceKind>(null);
  const [editingReference, setEditingReference] = useState<ReferenceEdit>(null);
  const [referenceName, setReferenceName] = useState("");
  const [referenceParentId, setReferenceParentId] = useState("");
  const [savingReferenceId, setSavingReferenceId] = useState<string | null>(null);
  const [referencesLoading, setReferencesLoading] = useState(true);

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

  useEffect(() => {
    if (!editingId || !panelExpanded) return;

    adminPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [editingId, panelExpanded]);

  const analyzeClothingImage = async (file: File) => {
    setAnalyzingClothing(true);
    setNotice("");
    setError("");

    const preview = URL.createObjectURL(file);
    setAnalysisPreview(preview);

    try {
      const result = await analyzeClothing(file, language);

      if (result.size_source === "estimated") {
        setNotice("sizeEstimated");
      }

      setForm((current) => ({
        ...current,
        name: result.name,
        category_id: result.category.id,
        size_id: result.size.id,
      }));
      setFormErrors({});
      setFilledFields(["name", "category_id", "size_id"]);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    } catch (error) {
      setError("analysisFailed");
    } finally {
      setAnalyzingClothing(false);
    }
  };

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

  const getTopCategoryName = (item: ClothingItem) => {
    let category = categories.find((entry) => entry.id === item.category_id);
    const visited = new Set<string>();
    while (category?.parentId && !visited.has(category.id)) {
      visited.add(category.id);
      const parent = categories.find((entry) => entry.id === category?.parentId);
      if (!parent) break;
      category = parent;
    }
    return category?.name ?? item.category_name ?? "Unknown category";
  };

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

  const updateFormField = (field: keyof ClothingForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
    setFilledFields((current) => current.filter((entry) => entry !== field));
  };

  const cancelItemEdit = () => {
    setFormErrors({});
    setFilledFields([]);
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

    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "nameRequired";
    if (!form.category_id) nextErrors.category_id = "categoryRequired";
    if (!form.size_id) nextErrors.size_id = "sizeRequired";
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.name) nameInputRef.current?.focus();
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = { ...form, name: form.name.trim() };
      const path = editingId ? `/clothing/${editingId}` : "/clothing";
      await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await refreshItems();
      const wasEditing = editingId !== null;
      setForm(
        wasEditing
          ? createEmptyForm(categories[0]?.id ?? "", sizes[0]?.id ?? "")
          : { ...createEmptyForm(), category_id: form.category_id, size_id: form.size_id },
      );
      setFilledFields([]);
      setEditingId(null);
      setNotice(wasEditing ? "itemUpdated" : "itemAdded");
      if (!wasEditing) nameInputRef.current?.focus();
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
    });
    setFormErrors({});
    setFilledFields([]);
    setEditingId(item.id);
    setEditingName(item.name);
    setPanelExpanded(true);
    setError("");
    setNotice("");
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
    const parsedOrder = getNextSizeOrder(sizes);
    if (!trimmedName) {
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
    setError("");
    setNotice("");
  };

  const cancelReferenceEdit = () => {
    setEditingReference(null);
    setReferenceName("");
    setReferenceParentId("");
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
    if (!trimmedName) {
      setError("invalidData");
      return;
    }

    setSavingReferenceId(size.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/size/${size.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: trimmedName, sort_order: size.sortOrder }),
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

  const moveSize = async (size: SizeOption, direction: -1 | 1) => {
    const from = sizes.findIndex((entry) => entry.id === size.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= sizes.length) return;

    const reordered = [...sizes];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    const changed = reordered
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry, index }) => entry.sortOrder !== index);

    setSavingReferenceId(size.id);
    setError("");
    setNotice("");
    try {
      await Promise.all(
        changed.map(({ entry, index }) =>
          apiRequest(`/size/${entry.id}`, {
            method: "PUT",
            body: JSON.stringify({ name: entry.name, sort_order: index }),
          }),
        ),
      );
      await refreshReferenceData();
      await refreshItems();
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingReferenceId(null);
    }
  };

  const deleteCategory = async (category: CategoryOption) => {
    if (!signedIn) {
      openLogin();
      return;
    }
    const categoryPath = getCategoryPath(category.id);
    if (!window.confirm(t.confirmDeleteCategory(categoryPath))) return;

    setSavingReferenceId(category.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/category/${category.id}`, { method: "DELETE" });
      await refreshReferenceData();
      await refreshItems();
      if (editingReference?.id === category.id) cancelReferenceEdit();
      setNotice("categoryDeleted");
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingReferenceId(null);
    }
  };

  const deleteSize = async (size: SizeOption) => {
    if (!signedIn) {
      openLogin();
      return;
    }
    if (!window.confirm(t.confirmDeleteSize(size.name))) return;

    setSavingReferenceId(size.id);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/size/${size.id}`, { method: "DELETE" });
      await refreshReferenceData();
      await refreshItems();
      if (editingReference?.id === size.id) cancelReferenceEdit();
      setNotice("sizeDeleted");
    } catch (error) {
      handleApiError(error);
    } finally {
      setSavingReferenceId(null);
    }
  };

  return {
    adminPanelRef,
    nameInputRef,
    formRef,
    editingName,
    formErrors,
    filledFields,
    updateFormField,
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
    deletingId,
    referencesLoading,
    newCategoryName,
    setNewCategoryName,
    newCategoryParentId,
    setNewCategoryParentId,
    newSizeName,
    setNewSizeName,
    creatingReference,
    editingReference,
    referenceName,
    setReferenceName,
    referenceParentId,
    setReferenceParentId,
    savingReferenceId,
    getCategoryPath,
    getCategoryName,
    getTopCategoryName,
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
    moveSize,
    deleteCategory,
    deleteSize,
  };
}

export type FormErrors = Partial<Record<keyof ClothingForm, "nameRequired" | "categoryRequired" | "sizeRequired">>;

function getNextSizeOrder(sizes: SizeOption[]): number {
  if (sizes.length === 0) return 0;
  return Math.max(...sizes.map((size) => size.sortOrder)) + 1;
}