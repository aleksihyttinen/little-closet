"use client";

import { useEffect, useState, type FormEvent } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

const categories = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Bodysuits" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Tops" },
  { id: "33333333-3333-4333-8333-333333333333", name: "Bottoms" },
  { id: "44444444-4444-4444-8444-444444444444", name: "Dresses" },
  { id: "55555555-5555-4555-8555-555555555555", name: "Outerwear" },
  { id: "66666666-6666-4666-8666-666666666666", name: "Sleepwear" },
  { id: "77777777-7777-4777-8777-777777777777", name: "Footwear" },
  { id: "88888888-8888-4888-8888-888888888888", name: "Sets" },
  { id: "99999999-9999-4999-8999-999999999999", name: "Accessories" },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Swimwear" },
];

const sizes = [
  { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", name: "Newborn" },
  { id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", name: "0-3M" },
  { id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", name: "3-6M" },
  { id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", name: "6-12M" },
  { id: "ffffffff-ffff-4fff-8fff-ffffffffffff", name: "12-18M" },
  { id: "12121212-1212-4121-8121-121212121212", name: "18-24M" },
  { id: "13131313-1313-4131-8131-131313131313", name: "2T" },
  { id: "14141414-1414-4141-8141-141414141414", name: "3T" },
  { id: "15151515-1515-4151-8151-151515151515", name: "4T" },
  { id: "16161616-1616-4161-8161-161616161616", name: "5T" },
];

type Language = "fi" | "en";

const categoryLabels: Record<Language, Record<string, string>> = {
  fi: {
    "11111111-1111-4111-8111-111111111111": "Bodyt",
    "22222222-2222-4222-8222-222222222222": "Paidat",
    "33333333-3333-4333-8333-333333333333": "Alaosat",
    "44444444-4444-4444-8444-444444444444": "Mekot",
    "55555555-5555-4555-8555-555555555555": "Päällysvaatteet",
    "66666666-6666-4666-8666-666666666666": "Yöasut",
    "77777777-7777-4777-8777-777777777777": "Jalkineet",
    "88888888-8888-4888-8888-888888888888": "Asut",
    "99999999-9999-4999-8999-999999999999": "Asusteet",
    "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa": "Uima-asut",
  },
  en: Object.fromEntries(categories.map(({ id, name }) => [id, name])),
};

const sizeLabels: Record<Language, Record<string, string>> = {
  fi: { [sizes[0].id]: "Vastasyntynyt" },
  en: {},
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
    updateDetails: "Päivitä tiedot",
    addToInventory: "Lisää varastoon",
    editClothingItem: "Muokkaa vaatetta",
    newClothingItem: "Uusi vaate",
    itemName: "Vaatteen nimi",
    namePlaceholder: "esim. Puuvillabody",
    category: "Kategoria",
    size: "Koko",
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
    updateDetails: "Update details",
    addToInventory: "Add to inventory",
    editClothingItem: "Edit clothing item",
    newClothingItem: "New clothing item",
    itemName: "Item name",
    namePlaceholder: "e.g. Cotton bodysuit",
    category: "Category",
    size: "Size",
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

type NoticeKey = "signedInNotice" | "signedOutNotice" | "itemUpdated" | "itemAdded" | "itemDeleted";
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
};

type ClothingForm = {
  name: string;
  category_id: string;
  size_id: string;
  quantity: string;
};

const emptyForm: ClothingForm = {
  name: "",
  category_id: categories[0].id,
  size_id: sizes[0].id,
  quantity: "1",
};

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

export default function Home() {
  const [language, setLanguage] = useState<Language>("fi");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [form, setForm] = useState<ClothingForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<ErrorKey | "">("");
  const [notice, setNotice] = useState<NoticeKey | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const t = messages[language];

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

    void fetchClothingItems()
      .then((loadedItems) => {
        if (active) setItems(loadedItems);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError("loadError");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const getCategoryName = (item: ClothingItem) =>
    categoryLabels[language][item.category_id] ?? item.category_name;

  const filteredItems = items.filter((item) =>
    `${item.name} ${getCategoryName(item)} ${item.size_name}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0);

  const refreshItems = async () => {
    setItems(await fetchClothingItems());
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
      setForm(emptyForm);
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
        setForm(emptyForm);
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
    setForm(emptyForm);
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

            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-sm font-medium text-[#45534b] lg:col-span-2">
                {t.itemName}
                <input
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder={t.namePlaceholder}
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none transition focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                />
              </label>
              <label className="text-sm font-medium text-[#45534b]">
                {t.category}
                <select
                  required
                  value={form.category_id}
                  onChange={(event) =>
                    setForm({ ...form, category_id: event.target.value })
                  }
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {categoryLabels[language][category.id] ?? category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-[#45534b]">
                {t.size}
                <select
                  required
                  value={form.size_id}
                  onChange={(event) =>
                    setForm({ ...form, size_id: event.target.value })
                  }
                  className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-[#fbfcf9] px-3 text-sm text-[#202a27] outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
                >
                  {sizes.map((size) => (
                    <option key={size.id} value={size.id}>
                      {sizeLabels[language][size.id] ?? size.name}
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
                  onChange={(event) =>
                    setForm({ ...form, quantity: event.target.value })
                  }
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
                      <td className="px-4 py-4 text-[#59675e]">{sizeLabels[language][item.size_id] ?? item.size_name}</td>
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
