import { supabase } from '../lib/supabase';
import type { Craftsman, PriceService, ServiceCategory } from '../types/database';
import { categories as fallbackCategories, craftsmen as fallbackCraftsmen } from '../data/mock';

function mapDbCraftsman(row: any): Craftsman {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    specialty: row.specialty,
    description: row.description || '',
    rating: typeof row.rating === 'number' ? row.rating : parseFloat(row.rating || '5.0'),
    reviewCount: row.review_count || 0,
    distanceKm: typeof row.distance_km === 'number' ? row.distance_km : parseFloat(row.distance_km || '1.0'),
    area: row.area || 'رام الله',
    city: row.city || 'رام الله والبيرة',
    isOpen: row.is_open ?? true,
    photo: row.photo || 'https://images.unsplash.com/photo-1624697330553-3a4cca85514c?w=400&q=80&fit=crop',
    phone: row.phone || '+970598765432',
    priceHint: row.price_hint || 'معاينة فنية ميدانية',
    priceValue: row.price_value || '30 شيكل',
    fastResponse: row.fast_response ?? true,
    keywords: row.keywords || '',
    resultInfo: row.result_info || '',
    categoryIds: Array.isArray(row.category_ids) ? row.category_ids : [],
    latitude: typeof row.latitude === 'number' ? row.latitude : parseFloat(row.latitude || '31.9073'),
    longitude: typeof row.longitude === 'number' ? row.longitude : parseFloat(row.longitude || '35.2034'),
    experienceYears: row.experience_years || 5,
    verified: row.verified ?? false,
    workingHours: row.working_hours || '08:00 ص - 08:00 م',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCategories(): Promise<ServiceCategory[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackCategories;
    }
    return data.map((c) => ({
      id: c.id,
      label: c.label,
      icon: c.icon,
      description: c.description,
      sort_order: c.sort_order,
    }));
  } catch {
    return fallbackCategories;
  }
}

export async function getCraftsmen(filters?: {
  categoryId?: string;
  search?: string;
  limit?: number;
}): Promise<Craftsman[]> {
  try {
    let query = supabase.from('craftsmen').select('*');

    if (filters?.categoryId) {
      query = query.contains('category_ids', [filters.categoryId]);
    }

    if (filters?.search && filters.search.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(`name.ilike.${term},specialty.ilike.${term},keywords.ilike.${term},area.ilike.${term}`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // If offline or filter returns empty from empty local DB, fallback
      if (!filters?.categoryId && !filters?.search) {
        return fallbackCraftsmen;
      }
      return data ? data.map(mapDbCraftsman) : [];
    }

    return data.map(mapDbCraftsman);
  } catch (err) {
    console.warn('getCraftsmen error:', err);
    return fallbackCraftsmen;
  }
}

export async function getCraftsmanById(id: string): Promise<Craftsman> {
  try {
    const { data, error } = await supabase
      .from('craftsmen')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data && !error) {
      return mapDbCraftsman(data);
    }
  } catch (err) {
    console.warn('getCraftsmanById error:', err);
  }

  const fallback = fallbackCraftsmen.find((c) => c.id === id);
  if (fallback) return fallback;
  return fallbackCraftsmen[0];
}

export async function getCraftsmanServices(craftsmanId: string): Promise<PriceService[]> {
  try {
    const { data, error } = await supabase
      .from('craftsman_services')
      .select('*')
      .eq('craftsman_id', craftsmanId)
      .eq('is_active', true);

    if (error || !data || data.length === 0) {
      // Default standard services
      return [
        {
          id: `ps-${craftsmanId}-1`,
          craftsman_id: craftsmanId,
          title: 'معاينة وفحص فني شامل',
          description: 'فحص ميداني دقيق لتحديد مكان العطل وتحديد التكلفة الإجمالية.',
          duration: '30 - 45 دقيقة',
          priceRange: '30 - 50 ₪',
          priceNote: 'تخصم من تكلفة التصليح عند التنفيذ',
          icon: 'toolbox',
        },
        {
          id: `ps-${craftsmanId}-2`,
          craftsman_id: craftsmanId,
          title: 'خدمة صيانة وإصلاح معتمدة',
          description: 'تنفيذ أعمال الإصلاح مع توريد وتركيب قطع الغيار المناسبة بضمان مهنتي.',
          duration: 'حسب نوع العطل',
          priceRange: '100 - 250 ₪',
          priceNote: 'شامل الضمان على القطع',
          icon: 'settings',
        },
      ];
    }

    return data.map((s) => ({
      id: s.id,
      craftsman_id: s.craftsman_id,
      title: s.title,
      description: s.description || '',
      duration: s.duration || '',
      priceRange: s.price_range || '',
      priceNote: s.price_note || '',
      icon: s.icon || 'toolbox',
      isActive: s.is_active,
    }));
  } catch (err) {
    console.warn('getCraftsmanServices error:', err);
    return [];
  }
}

export async function createCraftsman(input: {
  userId?: string | null;
  name: string;
  specialty: string;
  description: string;
  phone: string;
  area: string;
  city?: string;
  photo?: string;
  priceHint?: string;
  priceValue?: string;
  categoryIds: string[];
  latitude?: number;
  longitude?: number;
  experienceYears?: number;
  workingHours?: string;
}): Promise<Craftsman> {
  const payload = {
    user_id: input.userId || null,
    name: input.name,
    specialty: input.specialty,
    description: input.description,
    phone: input.phone,
    area: input.area,
    city: input.city || 'رام الله والبيرة',
    photo: input.photo || 'https://images.unsplash.com/photo-1624697330553-3a4cca85514c?w=400&q=80&fit=crop',
    price_hint: input.priceHint || 'معاينة فنية ميدانية',
    price_value: input.priceValue || '30 شيكل',
    category_ids: input.categoryIds,
    latitude: input.latitude || 31.9073,
    longitude: input.longitude || 35.2034,
    experience_years: input.experienceYears || 5,
    working_hours: input.workingHours || '08:00 ص - 08:00 م',
    is_open: true,
    fast_response: true,
    verified: false,
    rating: 5.0,
    review_count: 0,
    distance_km: 1.5,
    keywords: `${input.name} ${input.specialty} ${input.area} ${input.categoryIds.join(' ')}`,
    result_info: 'مسجل حديثاً في منصة مهنتي',
  };

  const { data, error } = await supabase
    .from('craftsmen')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbCraftsman(data);
}

export async function isCraftsmanSaved(userId: string, craftsmanId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('saved_craftsmen')
      .select('craftsman_id')
      .eq('user_id', userId)
      .eq('craftsman_id', craftsmanId)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

export async function toggleSaveCraftsman(userId: string, craftsmanId: string): Promise<boolean> {
  try {
    const isSaved = await isCraftsmanSaved(userId, craftsmanId);
    if (isSaved) {
      await supabase
        .from('saved_craftsmen')
        .delete()
        .eq('user_id', userId)
        .eq('craftsman_id', craftsmanId);
      return false;
    } else {
      await supabase
        .from('saved_craftsmen')
        .insert([{ user_id: userId, craftsman_id: craftsmanId }]);
      return true;
    }
  } catch (err) {
    console.warn('toggleSaveCraftsman error:', err);
    return false;
  }
}

export async function getSavedCraftsmen(userId: string): Promise<Craftsman[]> {
  try {
    const { data, error } = await supabase
      .from('saved_craftsmen')
      .select('craftsman_id, craftsmen(*)')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data
      .map((item: any) => item.craftsmen)
      .filter(Boolean)
      .map(mapDbCraftsman);
  } catch {
    return [];
  }
}
