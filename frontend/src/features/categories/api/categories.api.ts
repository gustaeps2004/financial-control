import { apiClient } from "@/lib/http/api-client";
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../types";

function withAuth(token: string): RequestInit {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const categoriesApi = {
  list: (token: string) => apiClient.get<Category[]>("/categories", withAuth(token)),
  create: (payload: CreateCategoryRequest, token: string) =>
    apiClient.post<Category, CreateCategoryRequest>("/categories", payload, withAuth(token)),
  rename: (id: string, payload: UpdateCategoryRequest, token: string) =>
    apiClient.patch<Category, UpdateCategoryRequest>(
      `/categories/${id}`,
      payload,
      withAuth(token),
    ),
  remove: (id: string, token: string) =>
    apiClient.delete(`/categories/${id}`, withAuth(token)),
};
