import { apiHelpers } from './api';
import type { PaginatedResponse } from './api';

export interface Price {
  currency: string;
  amount: number | string;
  sale_amount?: number | string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: number;
  image: string;
  position: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: Category;
  images: ProductImage[];
  price: Price;
  is_active: boolean;
  created_at: string;
}

export interface ProductFilters {
  search?: string;
  category?: number;
  page?: number;
}

export const ecommerceService = {
  getProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    const params: Record<string, string | number> = {};
    if (filters?.search) params['search'] = filters.search;
    if (filters?.category) params['category'] = filters.category;
    if (filters?.page) params['page'] = filters.page;
    return apiHelpers.get<PaginatedResponse<Product>>('/ecommerce/products/', params);
  },

  getProduct: async (id: number): Promise<Product> => {
    return apiHelpers.get<Product>(`/ecommerce/products/${id}/`);
  },

  getCategories: async (): Promise<Category[]> => {
    const res = await apiHelpers.get<PaginatedResponse<Category>>('/ecommerce/categories/');
    return Array.isArray(res as any) ? (res as any as Category[]) : (res?.results ?? []);
  },
};

export default ecommerceService;
