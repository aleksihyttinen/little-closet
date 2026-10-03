import type {
  ApiCategoryResponse,
  ApiClothingItem,
  ApiResponse,
  ApiSizeResponse,
  CategoryOption,
  ClothingItem,
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