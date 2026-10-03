"use client";

import { useEffect, useState, type FormEvent } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

type Language = "fi" | "en";

type ApiCategory = {
  ID: string;
  Name: string;
  ParentID: string | null;
  CreatedAt: string;
};

type ApiSize = {
  ID: string;
  Name: string;
  SortOrder: number;
};

type CategoryOption = {
  id: string;
  name: string;
  parentId: string | null;
};

type SizeOption = {
  id: string;
  name: string;
  sortOrder: number;
};

const messages = {
  fi: {
    inventoryKicker: "Little Closet / Vaatevarasto",
    pageTitle: "Vaatevarasto",
    pageSubtitle: "Näet helposti, mitä vaatteita on saatavilla ja missä koossa.",
    adminSignIn: "Sisäänkirjautuminen",
    signedIn: "Kirjautunut sisään",
    piecesInCloset: "Vaatteita yhteensä",
    differentItems: "Tuotenimikkeitä",
    categories: "Kategorioita",
    signedInNotice: "Olet kirjautunut sisään. Voit nyt muokata varastoa.",
    signedOutNotice: "Onnistuneesti kirjauduttu ulos.",
    itemUpdated: "Vaate päivitetty.",
    itemAdded: "Vaate lisätty varastoon.",
    itemDeleted: "Vaate poistettu.",
    categoryAdded: "Kategoria lisätty.",
    sizeAdded: "Koko lisätty.",
    categoryUpdated: "Kategoria päivitetty.",
    sizeUpdated: "Koko päivitetty.",
    updateDetails: "Päivitä tiedot",
    addToInventory: "Lisää varastoon",
    editClothingItem: "Muokkaa vaatetta",
    newClothingItem: "Uusi vaate",
    itemName: "Vaatteen nimi",
    namePlaceholder: "esim. Puuvillabody",
    category: "Kategoria",
    size: "Koko",
    addCategory: "Lisää kategoria",
    addSize: "Lisää koko",
    categoryName: "Kategorian nimi",
    parentCategory: "Yläkategoria (valinnainen)",
    noParentCategory: "Ei yläkategoriaa",
    sizeName: "Koon nimi",
    manageCategories: "Muokkaa kategorioita",
    manageSizes: "Muokkaa kokoja",
    sizeOrder: "Järjestys",
    categoryPlaceholder: "esim. Bodyt",
    sizePlaceholder: "esim. 3T",
    quantity: "Määrä",
    saving: "Tallennetaan…",
    saveChanges: "Tallenna muutokset",
    addItem: "Lisää vaate",
    cancel: "Peruuta",
    adminAccess: "Ylläpitäjän käyttöoikeus",
    signInToManage: "Kirjaudu sisään hallitaksesi vaatevarastoa",
    adminOnly: "Varaston lisääminen, muokkaaminen ja poistaminen on ylläpitäjän käytössä.",
    currentStock: "Nykyinen varasto",
    clothingItems: "Vaatteet",
    searchInventory: "Hae varastosta",
    searchPlaceholder: "Nimi, kategoria tai koko",
    loading: "Ladataan varastoa…",
    emptyCloset: "Vaatevarasto on tyhjä.",
    emptyClosetHint: "Lisätyt vaatteet näkyvät täällä.",
    noMatches: "Ei hakutuloksia.",
    noMatchesHint: "Kokeile toista nimeä, kategoriaa tai kokoa.",
    actions: "Toiminnot",
    edit: "Muokkaa",
    deleting: "Poistetaan…",
    delete: "Poista",
    confirmDelete: (name: string) => `Poistetaanko “${name}” varastosta?`,
    inventoryAccess: "Varaston käyttöoikeus",
    loginTitle: "Ylläpitäjän kirjautuminen",
    close: "Sulje",
    email: "Sähköposti",
    password: "Salasana",
    signIn: "Kirjaudu sisään",
    logOut: "Kirjaudu ulos",
    loginFailed: "Virheellinen sähköposti tai salasana.",
    sessionExpired: "Istunto on vanhentunut. Kirjaudu uudelleen.",
    loadError: "Varastoa ei voitu ladata.",
    connectionError: "Yhteyttä palvelimeen ei saatu.",
    requestFailed: "Pyyntö epäonnistui.",
    invalidData: "Tarkista lomakkeen tiedot.",
    notFound: "Vaate ei löytynyt.",
    serverError: "Palvelimessa tapahtui virhe.",
  },
  en: {
    inventoryKicker: "Little Closet / Inventory",
    pageTitle: "The clothing room",
    pageSubtitle: "A clear view of what fits, what’s clean, and what’s on hand.",
    adminSignIn: "Admin sign in",
    signedIn: "Signed in",
    piecesInCloset: "Pieces in closet",
    differentItems: "Different items",
    categories: "Categories",
    signedInNotice: "You’re signed in. Inventory changes are enabled.",
    signedOutNotice: "Successfully signed out.",
    itemUpdated: "Item updated.",
    itemAdded: "Item added to the closet.",
    itemDeleted: "Item deleted.",
    categoryAdded: "Category added.",
    sizeAdded: "Size added.",
    categoryUpdated: "Category updated.",
    sizeUpdated: "Size updated.",
    updateDetails: "Update details",
    addToInventory: "Add to inventory",
    editClothingItem: "Edit clothing item",
    newClothingItem: "New clothing item",
    itemName: "Item name",
    namePlaceholder: "e.g. Cotton bodysuit",
    category: "Category",
    size: "Size",
    addCategory: "Add category",
    addSize: "Add size",
    categoryName: "Category name",
    parentCategory: "Parent category (optional)",
    noParentCategory: "No parent category",
    sizeName: "Size name",
    manageCategories: "Edit categories",
    manageSizes: "Edit sizes",
    sizeOrder: "Order",
    categoryPlaceholder: "e.g. Bodysuits",
    sizePlaceholder: "e.g. 3T",
    quantity: "Quantity",
    saving: "Saving…",
    saveChanges: "Save changes",
    addItem: "Add item",
    cancel: "Cancel",
    adminAccess: "Admin access",
    signInToManage: "Sign in to manage clothing",
    adminOnly: "Adding, editing, and deleting inventory is available to the admin.",
    currentStock: "Current stock",
    clothingItems: "Clothing items",
    searchInventory: "Search inventory",
    searchPlaceholder: "Name, category, or size",
    loading: "Loading inventory…",
    emptyCloset: "Nothing in the closet yet.",
    emptyClosetHint: "Added items will appear here.",
    noMatches: "No matches found.",
    noMatchesHint: "Try another name, category, or size.",
    actions: "Actions",
    edit: "Edit",
    deleting: "Deleting…",
    delete: "Delete",
    confirmDelete: (name: string) => `Delete “${name}” from the inventory?`,
    inventoryAccess: "Inventory access",
    loginTitle: "Admin sign in",
    close: "Close",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    logOut: "Log out",
    loginFailed: "Invalid email or password.",
    sessionExpired: "Your session expired. Please sign in again.",
    loadError: "Unable to load the inventory.",
    connectionError: "Could not connect to the server.",
    requestFailed: "The request failed.",
    invalidData: "Please check the form details.",
    notFound: "Clothing item not found.",
    serverError: "The server encountered an error.",
  },
} as const;

type NoticeKey =
  | "signedInNotice"
  | "signedOutNotice"
  | "itemUpdated"
  | "itemAdded"
  | "itemDeleted"
  | "categoryAdded"
  | "sizeAdded"
  | "categoryUpdated"
  | "sizeUpdated";
type ErrorKey =
  | "loadError"
  | "connectionError"
  | "requestFailed"
  | "invalidData"
  | "loginFailed"
  | "sessionExpired"
  | "notFound"
  | "serverError";
type ClothingItem = {
  id: string;
  name: string;
  quantity: number;
  category_id: string;
  category_name: string;
  size_id: string;
  size_name: string;
};

type ApiClothingItem = {
  ID: string;
  Name: string;
  Quantity: number;
  CategoryID: string;
  CategoryName: string;
  SizeID: string;
  SizeName: string;
};

type ApiResponse = {
  error?: string;
  items?: ApiClothingItem[];
  item?: { ID?: string };
};

type ApiCategoryResponse = {
  error?: string;
  items?: ApiCategory[];
};

type ApiSizeResponse = {
  error?: string;
  items?: ApiSize[];
};

type ClothingForm = {
  name: string;
  category_id: string;
  size_id: string;
  quantity: string;
};

const createEmptyForm = (categoryId = "", sizeId = ""): ClothingForm => ({
  name: "",
  category_id: categoryId,
  size_id: sizeId,
  quantity: "1",
});

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data: ApiResponse = {};
  try {
    data = (await response.json()) as ApiResponse;
  } catch {
    // Some successful API responses do not include a response body.
  }

  if (!response.ok) {
    throw new ApiError(data.error ?? `Request failed (${response.status})`, response.status);
  }

  return data;
}

function normalizeItem(item: ApiClothingItem): ClothingItem {
  return {
    id: item.ID,
    name: item.Name,
    quantity: item.Quantity,
    category_id: item.CategoryID,
    category_name: item.CategoryName,
    size_id: item.SizeID,
    size_name: item.SizeName,
  };
}

async function fetchClothingItems(): Promise<ClothingItem[]> {
  const data = await apiRequest("/clothing");
  return (data.items ?? []).map(normalizeItem);
}

async function fetchCategories(): Promise<CategoryOption[]> {
  const data = (await apiRequest("/category")) as ApiCategoryResponse;
  return (data.items ?? []).map((category) => ({
    id: category.ID,
    name: category.Name,
    parentId: category.ParentID,
  }));
}

async function fetchSizes(): Promise<SizeOption[]> {
  const data = (await apiRequest("/size")) as ApiSizeResponse;
  return (data.items ?? []).map((size) => ({
    id: size.ID,
    name: size.Name,
    sortOrder: size.SortOrder,
  }));
}

function getNextSizeOrder(sizes: SizeOption[]): string {
  if (sizes.length === 0) return "0";
  return String(Math.max(...sizes.map((size) => size.sortOrder)) + 1);
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("fi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [sizes, setSizes] = useState<SizeOption[]>([]);
  const [form, setForm] = useState<ClothingForm>(createEmptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<ErrorKey | "">("");
  const [notice, setNotice] = useState<NoticeKey | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParentId, setNewCategoryParentId] = useState("");
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeOrder, setNewSizeOrder] = useState<string | null>(null);
  const [creatingReference, setCreatingReference] = useState<"category" | "size" | null>(null);
  const [editingReference, setEditingReference] = useState<
    { kind: "category" | "size"; id: string } | null
  >(null);
  const [referenceName, setReferenceName] = useState("");
  const [referenceParentId, setReferenceParentId] = useState("");
  const [referenceSortOrder, setReferenceSortOrder] = useState("0");
  const [savingReferenceId, setSavingReferenceId] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const t = messages[language];
  const sizeOrderValue = newSizeOrder ?? getNextSizeOrder(sizes);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("little-closet-language");
    if (savedLanguage === "fi" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await apiRequest("/auth/session", { method: "GET" });
        setSignedIn(true);
      } catch {
        setSignedIn(false);
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      try {
        const [loadedCategories, loadedSizes, loadedItems] = await Promise.all([
          fetchCategories(),
          fetchSizes(),
          fetchClothingItems(),
        ]);

        if (!active) return;

        setCategories(loadedCategories);
        setSizes(loadedSizes);
        setItems(loadedItems);
        setForm((current) => ({
          ...current,
          category_id: current.category_id || loadedCategories[0]?.id || "",
          size_id: current.size_id || loadedSizes[0]?.id || "",
        }));
      } catch {
        if (active) {
          setError("loadError");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadInitialData();

    return () => {
      active = false;
    };
  }, []);

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

  const getSizeName = (item: ClothingItem) =>
    item.size_name || sizes.find((entry) => entry.id === item.size_id)?.name || "Unknown size";

  const filteredItems = items.filter((item) =>
    `${item.name} ${getCategoryName(item)} ${getSizeName(item)}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);

  const refreshItems = async () => {
    setItems(await fetchClothingItems());
  };

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signedIn) {
      setLoginOpen(true);
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
        body: JSON.stringify({
          name: trimmedName,
          parent_id: newCategoryParentId || "",
        }),
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
    } catch (requestError) {
      handleApiError(requestError);
    } finally {
      setCreatingReference(null);
    }
  };

  const handleCreateSize = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signedIn) {
      setLoginOpen(true);
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
    } catch (requestError) {
      handleApiError(requestError);
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

  const handleUpdateCategory = async (
    event: FormEvent<HTMLFormElement>,
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
    } catch (requestError) {
      handleApiError(requestError);
    } finally {
      setSavingReferenceId(null);
    }
  };

  const handleUpdateSize = async (
    event: FormEvent<HTMLFormElement>,
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
    } catch (requestError) {
      handleApiError(requestError);
    } finally {
      setSavingReferenceId(null);
    }
  };

  const handleApiError = (requestError: unknown, loginFailure = false) => {
    const status = requestError instanceof ApiError ? requestError.status : 0;
    const errorKey: ErrorKey =
      status === 400
        ? "invalidData"
        : status === 401
          ? loginFailure
            ? "loginFailed"
            : "sessionExpired"
          : status === 404
            ? "notFound"
            : status >= 500
              ? "serverError"
              : requestError instanceof ApiError
                ? "requestFailed"
                : "connectionError";
    setError(errorKey);
    if (status === 401 && !loginFailure) {
      setSignedIn(false);
      setLoginOpen(true);
    }
  };

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("little-closet-language", nextLanguage);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSignedIn(true);
      setPassword("");
      setLoginOpen(false);
      setNotice("signedInNotice");
    } catch (requestError) {
      const status = requestError instanceof ApiError ? requestError.status : 0;

      if (status !== 401) {
        setError("serverError");
      }
      handleApiError(requestError, true);
    }
  };

  const handleLogout = async () => {
    setError("");
    setLoginOpen(false);

    try {
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } catch (requestError) {
      const status = requestError instanceof ApiError ? requestError.status : 0;

      if (status !== 401) {
        setError("serverError");
      }
      handleApiError(requestError, true);
    } finally {
      setSignedIn(false);
      setNotice("signedOutNotice");
    }
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signedIn) {
      setLoginOpen(true);
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
      };
      const path = editingId ? `/clothing/${editingId}` : "/clothing";
      await apiRequest(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      await refreshItems();
      setForm(createEmptyForm(categories[0]?.id ?? "", sizes[0]?.id ?? ""));
      setEditingId(null);
      setNotice(editingId ? "itemUpdated" : "itemAdded");
    } catch (requestError) {
      handleApiError(requestError);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ClothingItem) => {
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

  const handleDelete = async (item: ClothingItem) => {
    if (!signedIn) {
      setLoginOpen(true);
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
    } catch (requestError) {
      handleApiError(requestError);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => {
    setForm(createEmptyForm(categories[0]?.id ?? "", sizes[0]?.id ?? ""));
    setEditingId(null);
    setError("");
    setNotice("");
  };

  return (
    <main className="min-h-screen bg-[#f4f3ed] px-4 py-6 text-[#202a27] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-[#cdd4cd] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#60766b]">
              {t.inventoryKicker}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.pageTitle}
            </h1>
            <p className="mt-2 text-sm text-[#65716b]">
              {t.pageSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label={language === "fi" ? "Kieli" : "Language"}
              className="flex rounded-md border border-[#cbd3ca] bg-white p-1"
            >
              {(["fi", "en"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={language === option}
                  onClick={() => changeLanguage(option)}
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
              onClick={signedIn ? () => {
                handleLogout()
              } : () => {
                setError("");
                setLoginOpen(true);
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white transition hover:bg-[#244738] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c4c]"
            >
              {signedIn ? t.logOut : t.adminSignIn}
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="border-l-2 border-[#a9bd8b] bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">
              {t.piecesInCloset}
            </p>
            <p className="mt-1 text-2xl font-semibold">{totalUnits}</p>
          </div>
          <div className="border-l-2 border-[#d7a45b] bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">
              {t.differentItems}
            </p>
            <p className="mt-1 text-2xl font-semibold">{items.length}</p>
          </div>
          <div className="border-l-2 border-[#94adb0] bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">
              {t.categories}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {new Set(items.map((item) => item.category_id)).size}
            </p>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-4 border border-[#e0b9ae] bg-[#fff3ef] px-4 py-3 text-sm text-[#8c3928]"
          >
            {t[error]}
          </p>
        ) : null}
        {notice ? (
          <p
            role="status"
            className="mb-4 border border-[#b8d0bd] bg-[#edf6ee] px-4 py-3 text-sm text-[#315c4c]"
          >
            {t[notice]}
          </p>
        ) : null}

        {signedIn ? (
          <section className="mb-8 border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
                  {editingId ? t.updateDetails : t.addToInventory}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {editingId ? t.editClothingItem : t.newClothingItem}
                </h2>
              </div>
            </div>

            <form onSubmit={handleSave} className="mb-6 grid gap-4 border-b border-[#e1e5df] pb-6 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-sm font-medium text-[#45534b] lg:col-span-2">
                {t.itemName}
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder={t.namePlaceholder}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none transition focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                />
              </label>
              <label className="text-sm font-medium text-[#45534b]">
                {t.category}
                <select
                  required
                  value={form.category_id}
                  onChange={(event) => setForm({ ...form, category_id: event.target.value })}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryPath(category.id)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#45534b]">
                {t.size}
                <select
                  required
                  value={form.size_id}
                  onChange={(event) => setForm({ ...form, size_id: event.target.value })}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                >
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#45534b]">
                {t.quantity}
                <input
                  required
                  type="number"
                  min="0"
                  max="2147483647"
                  step="1"
                  value={form.quantity}
                  onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                />
              </label>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
                <button
                  type="submit"
                  disabled={saving || !signedIn}
                  className="min-h-11 rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white transition hover:bg-[#244738] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {saving ? t.saving : editingId ? t.saveChanges : t.addItem}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={cancelEdit}
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
                <form onSubmit={handleCreateCategory} className="mb-4 border-b border-[#e8ebe6] pb-4">
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
                        <form onSubmit={(event) => void handleUpdateCategory(event, category)} className="space-y-3">
                          <label className="block text-sm font-medium text-[#45534b]">
                            {t.categoryName}
                            <input
                              required
                              maxLength={120}
                              value={referenceName}
                              onChange={(event) => setReferenceName(event.target.value)}
                              className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm"
                            />
                          </label>
                          <label className="block text-sm font-medium text-[#45534b]">
                            {t.parentCategory}
                            <select
                              value={referenceParentId}
                              onChange={(event) => setReferenceParentId(event.target.value)}
                              className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm"
                            >
                              <option value="">{t.noParentCategory}</option>
                              {categories
                                .filter((option) => !getDescendantCategoryIds(category.id).has(option.id))
                                .map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {getCategoryPath(option.id)}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <div className="flex gap-2">
                            <button type="submit" disabled={savingReferenceId === category.id} className="min-h-9 rounded-md bg-[#315c4c] px-3 text-xs font-semibold text-white disabled:opacity-45">
                              {t.saveChanges}
                            </button>
                            <button type="button" onClick={cancelReferenceEdit} className="min-h-9 rounded-md border border-[#cbd3ca] px-3 text-xs font-semibold text-[#45534b]">
                              {t.cancel}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm text-[#34433b]">{getCategoryPath(category.id)}</p>
                          <button type="button" onClick={() => startEditCategory(category)} className="shrink-0 rounded-md border border-[#cbd3ca] px-3 py-1.5 text-xs font-semibold text-[#315c4c] hover:bg-[#edf3eb]">
                            {t.edit}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-[#34433b]">{t.manageSizes}</h3>
                <form onSubmit={handleCreateSize} className="mb-4 border-b border-[#e8ebe6] pb-4">
                  <label className="block text-sm font-medium text-[#45534b]">
                    {t.sizeName}
                    <input
                      required
                      maxLength={60}
                      value={newSizeName}
                      onChange={(event) => setNewSizeName(event.target.value)}
                      placeholder={t.sizePlaceholder}
                      className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                    />
                  </label>
                  <label className="mt-3 block text-sm font-medium text-[#45534b]">
                    {t.sizeOrder}
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={sizeOrderValue}
                      onChange={(event) => setNewSizeOrder(event.target.value)}
                      className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                    />
                  </label>
                  <button type="submit" disabled={creatingReference !== null} className="mt-3 min-h-10 rounded-md bg-[#315c4c] px-4 text-sm font-semibold text-white disabled:opacity-45">
                    {creatingReference === "size" ? "…" : t.addSize}
                  </button>
                </form>
                <div className="max-h-72 overflow-y-auto">
                  {sizes.map((size) => (
                    <div key={size.id} className="border-b border-[#e8ebe6] py-3 last:border-b-0">
                      {editingReference?.kind === "size" && editingReference.id === size.id ? (
                        <form onSubmit={(event) => void handleUpdateSize(event, size)} className="space-y-3">
                          <label className="block text-sm font-medium text-[#45534b]">
                            {t.sizeName}
                            <input
                              required
                              maxLength={60}
                              value={referenceName}
                              onChange={(event) => setReferenceName(event.target.value)}
                              className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm"
                            />
                          </label>
                          <label className="block text-sm font-medium text-[#45534b]">
                            {t.sizeOrder}
                            <input
                              required
                              type="number"
                              min="0"
                              step="1"
                              value={referenceSortOrder}
                              onChange={(event) => setReferenceSortOrder(event.target.value)}
                              className="mt-1 min-h-10 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm"
                            />
                          </label>
                          <div className="flex gap-2">
                            <button type="submit" disabled={savingReferenceId === size.id} className="min-h-9 rounded-md bg-[#315c4c] px-3 text-xs font-semibold text-white disabled:opacity-45">
                              {t.saveChanges}
                            </button>
                            <button type="button" onClick={cancelReferenceEdit} className="min-h-9 rounded-md border border-[#cbd3ca] px-3 text-xs font-semibold text-[#45534b]">
                              {t.cancel}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <p className="min-w-0 truncate text-sm text-[#34433b]">
                            {size.name} <span className="text-xs text-[#718077]">({size.sortOrder})</span>
                          </p>
                          <button type="button" onClick={() => startEditSize(size)} className="shrink-0 rounded-md border border-[#cbd3ca] px-3 py-1.5 text-xs font-semibold text-[#315c4c] hover:bg-[#edf3eb]">
                            {t.edit}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

          </section>
        ) : (
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
          </section>
        )}

        <section className="border border-[#d6dbd3] bg-white shadow-[0_8px_24px_rgba(35,53,43,0.04)]">
          <div className="flex flex-col gap-4 border-b border-[#e1e5df] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
                {t.currentStock}
              </p>
              <h2 className="mt-1 text-xl font-semibold">{t.clothingItems}</h2>
            </div>
            <label className="w-full text-xs font-semibold uppercase tracking-wide text-[#65716b] sm:max-w-xs">
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

          {loading ? (
            <p className="px-6 py-10 text-center text-sm text-[#68746d]">
              {t.loading}
            </p>
          ) : filteredItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-[#34433b]">
                {items.length === 0 ? t.emptyCloset : t.noMatches}
              </p>
              <p className="mt-1 text-sm text-[#68746d]">
                {items.length === 0
                  ? t.emptyClosetHint
                  : t.noMatchesHint}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-[#f5f7f3] text-xs uppercase tracking-wide text-[#65716b]">
                  <tr>
                    <th scope="col" className="px-6 py-3 font-semibold">{t.itemName}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.category}</th>
                    <th scope="col" className="px-4 py-3 font-semibold">{t.size}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">{t.quantity}</th>
                    {signedIn ? (
                      <th scope="col" className="px-6 py-3 text-right font-semibold">{t.actions}</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8ebe6]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-[#fafbf8]">
                      <th scope="row" className="px-6 py-4 font-semibold text-[#293730]">
                        {item.name}
                      </th>
                      <td className="px-4 py-4 text-[#59675e]">{getCategoryName(item)}</td>
                      <td className="px-4 py-4 text-[#59675e]">{getSizeName(item)}</td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">
                        {item.quantity}
                      </td>
                      {signedIn ? <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={!signedIn || deletingId === item.id}
                            onClick={() => handleEdit(item)}
                            className="rounded-md border border-[#cbd3ca] px-3 py-1.5 text-xs font-semibold text-[#315c4c] transition hover:bg-[#edf3eb] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {t.edit}
                          </button>
                          <button
                            type="button"
                            disabled={!signedIn || deletingId === item.id}
                            onClick={() => void handleDelete(item)}
                            className="rounded-md border border-[#e0c8c0] px-3 py-1.5 text-xs font-semibold text-[#9b4938] transition hover:bg-[#fff3ef] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {deletingId === item.id ? t.deleting : t.delete}
                          </button>
                        </div>
                      </td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {loginOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18251f]/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            className="w-full max-w-md border border-[#d6dbd3] bg-[#fffefa] p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
                  {t.inventoryAccess}
                </p>
                <h2 id="login-title" className="mt-1 text-xl font-semibold">
                  {t.loginTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLoginOpen(false)}
                aria-label="Close sign-in dialog"
                className="rounded-md border border-[#cbd3ca] px-3 py-1.5 text-sm text-[#45534b] hover:bg-[#f4f6f1]"
              >
                {t.close}
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <label className="block text-sm font-medium text-[#45534b]">
                {t.email}
                <input
                  required
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                />
              </label>
              <label className="block text-sm font-medium text-[#45534b]">
                {t.password}
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                />
              </label>
              <button
                type="submit"
                className="min-h-11 w-full rounded-md bg-[#315c4c] px-4 text-sm font-semibold text-white transition hover:bg-[#244738]"
              >
                {t.signIn}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </main>
  );
}
