import { apiClient } from "../client";

export const productsApi = {
  getAll: () => apiClient.get("/products"),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post("/products", data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/products/${id}`),
};
