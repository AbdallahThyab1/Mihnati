import { supabase } from '../lib/supabase';
import type { MyService, MyServiceStatus, ReminderType, ServiceReminder } from '../types/database';

function mapDbService(row: any): MyService {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    categoryId: row.category_id,
    craftsmanId: row.craftsman_id,
    lastServiceDate: row.last_service_date,
    cost: row.cost ? parseFloat(row.cost) : undefined,
    currency: row.currency || '₪',
    status: row.status as MyServiceStatus,
    notes: row.notes || '',
    sourceBookingId: row.source_booking_id,
    nextBookingDate: row.next_booking_date,
    nextBookingTime: row.next_booking_time,
    createdAt: row.created_at,
  };
}

function mapDbReminder(row: any): ServiceReminder {
  return {
    id: row.id,
    serviceId: row.service_id,
    userId: row.user_id,
    title: row.title,
    date: row.reminder_date,
    type: row.type as ReminderType,
    isCompleted: row.is_completed ?? false,
    notes: row.notes || '',
  };
}

export async function getMyServices(userId?: string): Promise<MyService[]> {
  try {
    let query = supabase
      .from('my_services')
      .select('*')
      .order('last_service_date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapDbService);
  } catch (err) {
    console.warn('getMyServices exception:', err);
    return [];
  }
}

export async function getMyServiceById(id: string): Promise<MyService | null> {
  try {
    const { data, error } = await supabase
      .from('my_services')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbService(data);
  } catch (err) {
    console.warn('getMyServiceById exception:', err);
    return null;
  }
}

export async function createMyService(input: {
  userId: string;
  title: string;
  categoryId: string;
  craftsmanId?: string;
  lastServiceDate?: string;
  cost?: number;
  currency?: string;
  status?: MyServiceStatus;
  notes?: string;
  sourceBookingId?: string;
  nextBookingDate?: string;
  nextBookingTime?: string;
}): Promise<MyService> {
  const payload = {
    user_id: input.userId,
    title: input.title,
    category_id: input.categoryId,
    craftsman_id: input.craftsmanId || null,
    last_service_date: input.lastServiceDate || new Date().toISOString().split('T')[0],
    cost: input.cost || null,
    currency: input.currency || '₪',
    status: input.status || 'active',
    notes: input.notes || null,
    source_booking_id: input.sourceBookingId || null,
    next_booking_date: input.nextBookingDate || null,
    next_booking_time: input.nextBookingTime || null,
  };

  const { data, error } = await supabase
    .from('my_services')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbService(data);
}

export async function updateMyService(
  id: string,
  patch: Partial<MyService>,
): Promise<MyService | null> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.cost !== undefined) payload.cost = patch.cost;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.notes !== undefined) payload.notes = patch.notes;
  if (patch.nextBookingDate !== undefined) payload.next_booking_date = patch.nextBookingDate;
  if (patch.nextBookingTime !== undefined) payload.next_booking_time = patch.nextBookingTime;

  const { data, error } = await supabase
    .from('my_services')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) return null;
  return mapDbService(data);
}

export async function getServiceReminders(
  serviceId?: string,
  userId?: string,
): Promise<ServiceReminder[]> {
  try {
    let query = supabase
      .from('service_reminders')
      .select('*')
      .order('reminder_date', { ascending: true });

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data.map(mapDbReminder);
  } catch (err) {
    console.warn('getServiceReminders exception:', err);
    return [];
  }
}

export async function createServiceReminder(input: {
  serviceId: string;
  userId: string;
  title: string;
  date: string;
  type?: ReminderType;
  notes?: string;
}): Promise<ServiceReminder> {
  const payload = {
    service_id: input.serviceId,
    user_id: input.userId,
    title: input.title,
    reminder_date: input.date,
    type: input.type || 'maintenance',
    notes: input.notes || null,
    is_completed: false,
  };

  const { data, error } = await supabase
    .from('service_reminders')
    .insert([payload])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapDbReminder(data);
}

export async function toggleReminderCompleted(id: string, isCompleted: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('service_reminders')
    .update({ is_completed: isCompleted })
    .eq('id', id);

  return !error;
}
