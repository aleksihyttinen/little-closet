import { authClient } from "./lib/auth";
import type {
  ApiCategoryResponse,
  ApiClothingItem,
  ApiResponse,
  ApiSizeResponse,
  CategoryOption,
  ClothingItem,
  OutfitWeather,
  SizeOption,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

export type ApiMode = "authenticated" | "demo";

let cachedToken: { value: string; expiresAt: number } | null = null;

let pendingToken: Promise<string | undefined> | null = null;
let pendingSession: ReturnType<typeof authClient.getSession> | null = null;

export function getAuthSession() {
  pendingSession ??= authClient.getSession().finally(() => {
    pendingSession = null;
  });
  return pendingSession;
}

function getToken(): Promise<string | undefined> {
  if (cachedToken && cachedToken.expiresAt - Date.now() > 30_000) {
    return Promise.resolve(cachedToken.value);
  }

  pendingToken ??= fetchToken().finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}

async function fetchToken(): Promise<string | undefined> {
  const { data } = await getAuthSession();
  const value = data?.session?.token;
  if (!value) {
    cachedToken = null;
    return undefined;
  }

  let expiresAt = Date.now() + 60_000;
  try {
    const payload = JSON.parse(atob(value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp === "number") expiresAt = payload.exp * 1000;
  } catch {}

  cachedToken = { value, expiresAt };
  return value;
}

export function warmToken() {
  void getToken().catch(() => {});
}

export function clearCachedToken() {
  cachedToken = null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
  mode: ApiMode = "authenticated",
): Promise<ApiResponse> {
  const headers = new Headers(options.headers);

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (mode === "authenticated") {
    const token = await getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${mode === "demo" ? `/demo${path}` : path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data: ApiResponse = {};

  try {
    data = (await response.json()) as ApiResponse;
  } catch {
  }

  if (!response.ok) {
    throw new ApiError(
      data.error ?? `Request failed (${response.status})`,
      response.status,
    );
  }

  return data;
}

function normalizeItem(item: ApiClothingItem): ClothingItem {
  return {
    id: item.ID,
    name: item.Name,
    category_id: item.CategoryID,
    category_name: item.CategoryName,
    size_id: item.SizeID,
    size_name: item.SizeName,
    created_at: item.CreatedAt,
    updated_at: item.UpdatedAt,
  };
}

export async function fetchClothingItems(mode: ApiMode = "authenticated"): Promise<ClothingItem[]> {
  const data = await apiRequest("/clothing", {}, mode);
  return (data.items ?? []).map(normalizeItem);
}

export async function fetchCategories(mode: ApiMode = "authenticated"): Promise<CategoryOption[]> {
  const data = (await apiRequest("/category", {}, mode)) as ApiCategoryResponse;
  return (data.items ?? []).map((category) => ({
    id: category.ID,
    name: category.Name,
    parentId: category.ParentID,
  }));
}

export async function fetchSizes(mode: ApiMode = "authenticated"): Promise<SizeOption[]> {
  const data = (await apiRequest("/size", {}, mode)) as ApiSizeResponse;
  return (data.items ?? []).map((size) => ({
    id: size.ID,
    name: size.Name,
    sortOrder: size.SortOrder,
  }));
}

function isOutfitWeather(value: unknown): value is OutfitWeather {
  if (!value || typeof value !== "object" || !("current" in value)) return false;

  const current = value.current;
  return Boolean(
    current
    && typeof current === "object"
    && "temperature_2m" in current
    && typeof current.temperature_2m === "number"
    && Number.isFinite(current.temperature_2m)
    && "apparent_temperature" in current
    && typeof current.apparent_temperature === "number"
    && Number.isFinite(current.apparent_temperature)
    && "precipitation" in current
    && typeof current.precipitation === "number"
    && Number.isFinite(current.precipitation)
    && "wind_speed_10m" in current
    && typeof current.wind_speed_10m === "number"
    && Number.isFinite(current.wind_speed_10m),
  );
}

export async function generateOutfit(
  latitude: number,
  longitude: number,
  language: "en" | "fi",
  mode: ApiMode = "authenticated",
): Promise<{ outfit: string; weather: OutfitWeather }> {
  const data = await apiRequest("/ai/generate-outfit", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude, language }),
  }, mode);

  let weather: unknown = data.weather;
  if (typeof weather === "string") {
    try {
      const bytes = Uint8Array.from(atob(weather), (character) => character.charCodeAt(0));
      weather = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      throw new ApiError("Invalid outfit weather response", 502);
    }
  }

  if (
    typeof data.outfit !== "string"
    || !isOutfitWeather(weather)
  ) {
    throw new ApiError("Invalid outfit response", 502);
  }

  return { outfit: data.outfit, weather };
}
