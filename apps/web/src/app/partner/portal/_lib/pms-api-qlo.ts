// QloApps-parity client methods for partner portal.
// Add these to apps/web/src/app/partner/portal/_lib/pms-api.ts (or import alongside).
import { api } from '@/lib/api';

export interface Promotion {
  id: string; code: string; name: string; description?: string;
  kind: 'percent' | 'flat'; value: string;
  minAmount?: number; maxDiscount?: number;
  min_amount?: string; max_discount?: string;
  starts_at?: string; ends_at?: string;
  max_uses?: number; uses?: number;
  status: 'active' | 'paused' | 'expired';
  created_at: string;
}

export type PromotionInput = Pick<Promotion, 'code' | 'name' | 'kind'> & {
  description?: string;
  value: number;
  minAmount?: number;
  maxDiscount?: number;
};

export interface Review {
  id: string; booking_id?: string;
  user_id?: string; first_name?: string; last_name?: string; email?: string;
  rating: number; cleanliness?: number; comfort?: number;
  staff_score?: number; value_score?: number;
  title?: string; body?: string;
  partner_reply?: string; replied_at?: string;
  status: 'pending' | 'published' | 'hidden' | 'flagged';
  created_at: string;
}

export interface HotelImage {
  id: string; url: string; caption?: string; alt_text?: string;
  category?: 'room' | 'exterior' | 'restaurant' | 'amenity' | 'other';
  sort_order?: number; is_cover?: boolean; created_at: string;
}

export interface CustomerSummary {
  user_id: string; name: string; email?: string; phone?: string;
  booking_count: number;
  lifetime_spend: string;
  last_visit: string; first_visit: string;
}

export const pmsQloApi = {
  // Promotions
  listPromotions: () =>
    api.get<{ success: boolean; promotions: Promotion[] }>('/api/v1/pms/promotions'),
  createPromotion: (input: PromotionInput) =>
    api.post<{ success: boolean; promotion: Promotion }>('/api/v1/pms/promotions', input),
  updatePromotion: (id: string, input: Partial<Promotion>) =>
    api.put<{ success: boolean }>(`/api/v1/pms/promotions/${id}`, input),
  deletePromotion: (id: string) =>
    api.delete<{ success: boolean }>(`/api/v1/pms/promotions/${id}`),

  // Reviews
  listReviews: () =>
    api.get<{ success: boolean; reviews: Review[]; summary: { total: string; avg_rating: string } }>('/api/v1/pms/reviews'),
  replyToReview: (id: string, reply: string) =>
    api.post<{ success: boolean }>(`/api/v1/pms/reviews/${id}/reply`, { reply }),

  // Gallery
  listGallery: () =>
    api.get<{ success: boolean; images: HotelImage[] }>('/api/v1/pms/gallery'),
  uploadImage: (input: { url: string; caption?: string; altText?: string; category?: string; sortOrder?: number; isCover?: boolean }) =>
    api.post<{ success: boolean; image: HotelImage }>('/api/v1/pms/gallery', input),
  deleteImage: (id: string) =>
    api.delete<{ success: boolean }>(`/api/v1/pms/gallery/${id}`),
  setCover: (id: string) =>
    api.post<{ success: boolean }>(`/api/v1/pms/gallery/${id}/cover`, {}),

  // Customers
  listCustomers: () =>
    api.get<{ success: boolean; count: number; customers: CustomerSummary[] }>('/api/v1/pms/customers'),
};
