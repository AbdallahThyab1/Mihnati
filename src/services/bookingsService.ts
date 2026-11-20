import { supabase } from '../lib/supabase';
import type { BookingStatus, ServiceBooking } from '../types/database';

function mapDbBooking(row: any): ServiceBooking {
  return {
    id: row.id,
    customerId: row.customer_id,
    craftsmanId: row.craftsman_id,
    categoryId: row.category_id,
    serviceTitle: row.service_title,
    date: row.booking_date,
    time: row.booking_time,
    status: row.status as BookingStatus,
    notes: row.notes || '',
    customerName: row.customer_name || 'زبون مهنتي',
    customerPhone: row.customer_phone || '',
    customerAddress: row.customer_address || '',
    createdAt: row.created_at,
    craftsman: row.craftsmen ? {
      id: row.craftsmen.id,
      name: row.craftsmen.name,
      specialty: row.craftsmen.specialty,
      description: row.craftsmen.description || '',
      rating: parseFloat(row.craftsmen.rating || '5.0'),
      reviewCount: row.craftsmen.review_count || 0,
      distanceKm: parseFloat(row.craftsmen.distance_km || '1.0'),
      area: row.craftsmen.area || '',
      city: row.craftsmen.city || '',
      isOpen: row.craftsmen.is_open ?? true,
      photo: row.craftsmen.photo || '',
      phone: row.craftsmen.phone || '',
      priceHint: row.craftsmen.price_hint || '',
      priceValue: row.craftsmen.price_value || '',
      fastResponse: row.craftsmen.fast_response ?? true,
      keywords: row.craftsmen.keywords || '',
      resultInfo: row.craftsmen.result_info || '',
      categoryIds: row.craftsmen.category_ids || [],
      latitude: parseFloat(row.craftsmen.latitude || '31.9073'),
      longitude: parseFloat(row.craftsmen.longitude || '35.2034'),
      experienceYears: row.craftsmen.experience_years || 5,
      verified: row.craftsmen.verified ?? false,
      workingHours: row.craftsmen.working_hours || '',
    } : undefined,
  };
}

export async function getBookings(filters?: {
  customerId?: string;
  craftsmanId?: string;
  status?: BookingStatus;
}): Promise<ServiceBooking[]> {
  try {
    let query = supabase
      .from('bookings')
      .select('*, craftsmen(*)')
      .order('booking_date', { ascending: false })
      .order('booking_time', { ascending: false });

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }
    if (filters?.craftsmanId) {
      query = query.eq('craftsman_id', filters.craftsmanId);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.warn('getBookings error:', error?.message);
      return [];
    }

    return data.map(mapDbBooking);
  } catch (err) {
    console.warn('getBookings exception:', err);
    return [];
  }
}

export async function getBookingById(id: string): Promise<ServiceBooking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, craftsmen(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapDbBooking(data);
  } catch (err) {
    console.warn('getBookingById exception:', err);
    return null;
  }
}

export async function createBooking(input: {
  customerId?: string | null;
  craftsmanId: string;
  categoryId: string;
  serviceTitle: string;
  date: string;
  time: string;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}): Promise<ServiceBooking> {
  const payload = {
    customer_id: input.customerId || null,
    craftsman_id: input.craftsmanId,
    category_id: input.categoryId,
    service_title: input.serviceTitle,
    booking_date: input.date,
    booking_time: input.time,
    notes: input.notes || null,
    customer_name: input.customerName || 'زبون مهنتي',
    customer_phone: input.customerPhone || '0599000000',
    customer_address: input.customerAddress || 'رام الله',
    status: 'confirmed',
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([payload])
    .select('*, craftsmen(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbBooking(data);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<ServiceBooking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, craftsmen(*)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbBooking(data);
}

export async function cancelBooking(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}
