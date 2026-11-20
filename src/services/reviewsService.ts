import { supabase } from '../lib/supabase';
import type { CraftsmanReview, RatingDistribution, ReviewInsight } from '../types/database';

function mapDbReview(row: any): CraftsmanReview {
  return {
    id: row.id,
    craftsmanId: row.craftsman_id,
    customerId: row.customer_id,
    bookingId: row.booking_id,
    author: row.author_name,
    initial: row.author_initial || (row.author_name ? row.author_name.trim().charAt(0) : 'ز'),
    rating: parseFloat(row.rating || '5.0'),
    service: row.service || 'صيانة عامة',
    text: row.comment || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    helpful: row.helpful || 0,
    time: row.time_ago || 'مؤخراً',
    note: row.verified_request ? 'من طلب خدمة مكتمل' : 'مراجعة بانتظار التحقق',
    createdAt: row.created_at,
    verifiedRequest: row.verified_request ?? true,
  };
}

export async function getCraftsmanReviews(craftsmanId: string): Promise<CraftsmanReview[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('craftsman_id', craftsmanId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('getCraftsmanReviews error:', error?.message);
      return [];
    }

    return data.map(mapDbReview);
  } catch (err) {
    console.warn('getCraftsmanReviews exception:', err);
    return [];
  }
}

export async function createReview(input: {
  craftsmanId: string;
  customerId?: string | null;
  bookingId?: string | null;
  authorName: string;
  rating: number;
  service: string;
  comment: string;
  tags?: string[];
  verifiedRequest?: boolean;
}): Promise<CraftsmanReview> {
  const author = input.authorName.trim() || 'زبون مهنتي';
  const initial = author.charAt(0);

  const payload = {
    craftsman_id: input.craftsmanId,
    customer_id: input.customerId || null,
    booking_id: input.bookingId || null,
    author_name: author,
    author_initial: initial,
    rating: input.rating,
    service: input.service.trim() || 'خدمة صيانة',
    comment: input.comment.trim(),
    tags: input.tags || [],
    helpful: 0,
    time_ago: 'الآن',
    verified_request: input.verifiedRequest ?? false,
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbReview(data);
}

export function getRatingDistribution(reviews: CraftsmanReview[]): RatingDistribution[] {
  if (reviews.length === 0) {
    return [5, 4, 3, 2, 1].map((stars) => ({ stars, percent: 0 }));
  }

  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.floor(r.rating) === stars).length;
    return {
      stars,
      percent: Math.round((count / reviews.length) * 100),
    };
  });
}

export function getReviewInsights(reviews: CraftsmanReview[]): ReviewInsight[] {
  const counts = new Map<string, number>();

  for (const review of reviews) {
    for (const tag of review.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}
