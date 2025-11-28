import { apiHelpers } from './api';
import type { PaginatedResponse } from './api';

export interface AdminProduct {
  id: number;
  name: string;
  title?: string;
  description?: string;
  category_id?: number | null;
  is_active: boolean;
  created_at?: string;
}

export interface AdminPrice {
  id: number;
  product_id: number;
  currency: string;
  amount: number | string;
  sale_amount?: number | string | null;
  is_active: boolean;
  valid_from: string;
}

export interface AdminInventory {
  id: number;
  product_id: number;
  stock: number;
  reserved_stock: number;
  location: string;
  min_stock: number;
  created_at?: string;
  updated_at?: string;
}

export const ecommerceAdminService = {
  listProducts: async (): Promise<PaginatedResponse<AdminProduct> | AdminProduct[]> => {
    return apiHelpers.get<PaginatedResponse<AdminProduct> | AdminProduct[]>(`/ecommerce/admin/products/`);
  },
  getProduct: async (id: number): Promise<AdminProduct> => {
    return apiHelpers.get<AdminProduct>(`/ecommerce/admin/products/${id}/`);
  },
  createProduct: async (data: Partial<AdminProduct>): Promise<AdminProduct> => {
    return apiHelpers.post<AdminProduct>(`/ecommerce/admin/products/`, data);
  },
  updateProduct: async (id: number, data: Partial<AdminProduct>): Promise<AdminProduct> => {
    return apiHelpers.put<AdminProduct>(`/ecommerce/admin/products/${id}/`, data);
  },
  deleteProduct: async (id: number): Promise<void> => {
    return apiHelpers.delete<void>(`/ecommerce/admin/products/${id}/`);
  },

  listInventory: async (): Promise<PaginatedResponse<AdminInventory> | AdminInventory[]> => {
    return apiHelpers.get<PaginatedResponse<AdminInventory> | AdminInventory[]>(`/ecommerce/admin/inventory/`);
  },
  createInventory: async (data: Partial<AdminInventory>): Promise<AdminInventory> => {
    return apiHelpers.post<AdminInventory>(`/ecommerce/admin/inventory/`, data);
  },
  updateInventory: async (id: number, data: Partial<AdminInventory>): Promise<AdminInventory> => {
    return apiHelpers.put<AdminInventory>(`/ecommerce/admin/inventory/${id}/`, data);
  },
  deleteInventory: async (id: number): Promise<void> => {
    return apiHelpers.delete<void>(`/ecommerce/admin/inventory/${id}/`);
  },

  listPrices: async (): Promise<PaginatedResponse<AdminPrice> | AdminPrice[]> => {
    return apiHelpers.get<PaginatedResponse<AdminPrice> | AdminPrice[]>(`/ecommerce/admin/prices/`);
  },
  createPrice: async (data: Partial<AdminPrice>): Promise<AdminPrice> => {
    return apiHelpers.post<AdminPrice>(`/ecommerce/admin/prices/`, data);
  },
  updatePrice: async (id: number, data: Partial<AdminPrice>): Promise<AdminPrice> => {
    return apiHelpers.put<AdminPrice>(`/ecommerce/admin/prices/${id}/`, data);
  },
  deletePrice: async (id: number): Promise<void> => {
    return apiHelpers.delete<void>(`/ecommerce/admin/prices/${id}/`);
  },
};

export default ecommerceAdminService;
