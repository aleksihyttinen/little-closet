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
): Promise<ApiResponse> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
	//TODO REMOVE AUTH HEADER LOGIC WHEN DOMAIN NAME IS SET
  const token = localStorage.getItem("sessionToken");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    },
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
    created_at: item.CreatedAt,
    updated_at: item.UpdatedAt,
  };
}

export async function fetchClothingItems(): Promise<ClothingItem[]> {
  const data = await apiRequest("/clothing");
  return (data.items ?? []).map(normalizeItem);
}

export async function fetchCategories(): Promise<CategoryOption[]> {
  const data = (await apiRequest("/category")) as ApiCategoryResponse;
  return (data.items ?? []).map((category) => ({
    id: category.ID,
    name: category.Name,
    parentId: category.ParentID,
  }));
}

export async function fetchSizes(): Promise<SizeOption[]> {
  const data = (await apiRequest("/size")) as ApiSizeResponse;
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
): Promise<{ outfit: string; weather: OutfitWeather }> {
  const data = await apiRequest("/ai/generate-outfit", {
    method: "POST",
    body: JSON.stringify({ latitude, longitude, language }),
  });

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
