import api, { apiHelpers } from './api';
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

  // Product Images
  listImages: async (productId?: number): Promise<any> => {
    const url = productId ? `/ecommerce/admin/images/?product_id=${productId}` : `/ecommerce/admin/images/`;
    return apiHelpers.get<any>(url);
  },
  uploadImage: async (productId: number, file: File, position: number = 0): Promise<any> => {
    const fd = new FormData();
    fd.append('product_id', String(productId));
    fd.append('image', file);
    fd.append('position', String(position));
    return api.post(`/ecommerce/admin/images/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  deleteImage: async (id: number): Promise<void> => {
    return apiHelpers.delete<void>(`/ecommerce/admin/images/${id}/`);
  },

  // Categories
  listCategories: async (): Promise<any> => {
    return apiHelpers.get<any>('/ecommerce/admin/categories/');
  },
  createCategory: async (data: { name: string; description?: string; is_active?: boolean }): Promise<any> => {
    return apiHelpers.post<any>('/ecommerce/admin/categories/', data);
  },
  updateCategory: async (id: number, data: { name?: string; description?: string; is_active?: boolean }): Promise<any> => {
    return apiHelpers.put<any>(`/ecommerce/admin/categories/${id}/`, data);
  },
  deleteCategory: async (id: number): Promise<void> => {
    return apiHelpers.delete<void>(`/ecommerce/admin/categories/${id}/`);
  },

  // Offers (promo slides)
  listOffers: async (): Promise<any[]> => {
    const res = await apiHelpers.get<any>(`/ecommerce/admin/offers/`);
    return Array.isArray(res as any) ? (res as any as any[]) : (res?.results ?? []);
  },
  createOffer: async (data: { title: string; subtitle?: string; badge?: string; cta_text?: string; cta_link?: string; position?: number; is_active?: boolean; image?: File | null }): Promise<any> => {
    const fd = new FormData();
    fd.append('title', data.title);
    if (data.subtitle) fd.append('subtitle', data.subtitle);
    if (data.badge) fd.append('badge', data.badge);
    if (data.cta_text) fd.append('cta_text', data.cta_text);
    if (data.cta_link) fd.append('cta_link', data.cta_link);
    if (typeof data.position === 'number') fd.append('position', String(data.position));
    if (typeof data.is_active === 'boolean') fd.append('is_active', String(data.is_active));
    if (data.image) fd.append('image', data.image);
    return api.post(`/ecommerce/admin/offers/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  updateOffer: async (id: number, data: { title?: string; subtitle?: string; badge?: string; cta_text?: string; cta_link?: string; position?: number; is_active?: boolean; image?: File | null }): Promise<any> => {
    const fd = new FormData();
    if (data.title) fd.append('title', data.title);
    if (data.subtitle) fd.append('subtitle', data.subtitle);
    if (data.badge) fd.append('badge', data.badge);
    if (data.cta_text) fd.append('cta_text', data.cta_text);
    if (data.cta_link) fd.append('cta_link', data.cta_link);
    if (typeof data.position === 'number') fd.append('position', String(data.position));
    if (typeof data.is_active === 'boolean') fd.append('is_active', String(data.is_active));
    if (data.image) fd.append('image', data.image);
    return api.put(`/ecommerce/admin/offers/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  deleteOffer: async (id: number): Promise<void> => {
    return apiHelpers.delete<void>(`/ecommerce/admin/offers/${id}/`);
  },
  activateOffer: async (id: number): Promise<any> => {
    return apiHelpers.post<any>(`/ecommerce/admin/offers/${id}/activate/`, {});
  },
};

export default ecommerceAdminService;
