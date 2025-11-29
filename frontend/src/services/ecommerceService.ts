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

export interface OfferSlide {
  id: number;
  title: string;
  subtitle?: string;
  badge?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string | null;
  position: number;
  is_active: boolean;
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

  getCart: async (): Promise<any> => {
    return apiHelpers.get<any>('/ecommerce/cart/');
  },

  addCartItem: async (productId: number, quantity: number = 1): Promise<any> => {
    return apiHelpers.post<any>('/ecommerce/cart/items/', { product_id: productId, quantity });
  },

  updateCartItem: async (itemId: number, quantity: number): Promise<any> => {
    return apiHelpers.patch<any>(`/ecommerce/cart-items/${itemId}/`, { quantity });
  },

  removeCartItem: async (itemId: number): Promise<any> => {
    return apiHelpers.delete<any>(`/ecommerce/cart-items/${itemId}/`);
  },

  clearCart: async (): Promise<void> => {
    await apiHelpers.post<void>('/ecommerce/cart/clear/', {});
  },

  getFavorites: async (): Promise<any[]> => {
    const res = await apiHelpers.get<PaginatedResponse<any>>('/ecommerce/favorites/');
    return Array.isArray(res as any) ? (res as any as any[]) : (res?.results ?? []);
  },

  addFavorite: async (productId: number): Promise<any> => {
    return apiHelpers.post<any>('/ecommerce/favorites/', { product: productId });
  },

  removeFavorite: async (favoriteId: number): Promise<any> => {
    return apiHelpers.delete<any>(`/ecommerce/favorites/${favoriteId}/`);
  },

  getOrders: async (): Promise<any[]> => {
    const res = await apiHelpers.get<PaginatedResponse<any>>('/ecommerce/orders/');
    return Array.isArray(res as any) ? (res as any as any[]) : (res?.results ?? []);
  },

  getOrder: async (id: number): Promise<any> => {
    return apiHelpers.get<any>(`/ecommerce/orders/${id}/`);
  },

  createStripePaymentIntent: async (): Promise<{ client_secret: string; order: any }> => {
    return apiHelpers.post<{ client_secret: string; order: any }>(`/ecommerce/checkout/stripe/`, {});
  },

  getOffers: async (): Promise<OfferSlide[]> => {
    const res = await apiHelpers.get<PaginatedResponse<any>>('/ecommerce/offers/');
    const list: any[] = Array.isArray(res as any) ? (res as any as any[]) : ((res as any)?.results ?? []);
    return list.map((it) => ({
      id: it.id,
      title: String(it.title || ''),
      subtitle: it.subtitle ?? '',
      badge: it.badge ?? 'Oferta',
      ctaText: it.cta_text ?? it.ctaText ?? 'Ver productos en oferta',
      ctaLink: it.cta_link ?? it.ctaLink ?? '/pharmacy/offers',
      image: it.image ?? null,
      position: Number(it.position ?? 0),
      is_active: Boolean(it.is_active ?? true),
    })) as OfferSlide[];
  },

};

export default ecommerceService;
