export type NoticeKey =
  | "signedInNotice"
  | "signedOutNotice"
  | "itemUpdated"
  | "itemAdded"
  | "itemDeleted"
  | "categoryAdded"
  | "sizeAdded"
  | "categoryUpdated"
  | "sizeUpdated";

export type ErrorKey =
  | "loadError"
  | "connectionError"
  | "requestFailed"
  | "invalidData"
  | "loginFailed"
  | "sessionExpired"
  | "notFound"
  | "serverError";

export type ClothingItem = {
  id: string;
  name: string;
  quantity: number;
  category_id: string;
  category_name: string;
  size_id: string;
  size_name: string;
};

export type ApiClothingItem = {
  ID: string;
  Name: string;
  Quantity: number;
  CategoryID: string;
  CategoryName: string;
  SizeID: string;
  SizeName: string;
};

export type ApiResponse = {
  error?: string;
  items?: ApiClothingItem[];
  item?: { ID?: string };
};

export type ApiCategory = {
  ID: string;
  Name: string;
  ParentID: string | null;
  CreatedAt: string;
};

export type ApiSize = {
  ID: string;
  Name: string;
  SortOrder: number;
};

export type ApiCategoryResponse = {
  error?: string;
  items?: ApiCategory[];
};

export type ApiSizeResponse = {
  error?: string;
  items?: ApiSize[];
};

export type CategoryOption = {
  id: string;
  name: string;
  parentId: string | null;
};

export type SizeOption = {
  id: string;
  name: string;
  sortOrder: number;
};

export type ClothingForm = {
  name: string;
  category_id: string;
  size_id: string;
  quantity: string;
};