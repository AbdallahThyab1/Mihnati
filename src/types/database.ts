export type UserRole = 'customer' | 'professional' | 'admin';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type ReminderType = 'maintenance' | 'follow_up' | 'booking' | 'custom';

export type MyServiceStatus = 'active' | 'completed';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: 'zap' | 'briefcase' | 'car' | 'smartphone' | 'wrench' | 'paint' | 'fan' | 'hammer' | 'brush' | 'truck' | string;
  description?: string | null;
  sort_order?: number;
}

export interface Craftsman {
  id: string;
  user_id?: string | null;
  name: string;
  specialty: string;
  description: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  area: string;
  city?: string;
  isOpen: boolean;
  photo: string;
  phone: string;
  priceHint: string;
  priceValue: string;
  fastResponse: boolean;
  keywords: string;
  resultInfo: string;
  categoryIds: string[];
  latitude: number;
  longitude: number;
  experienceYears: number;
  verified: boolean;
  workingHours: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceService {
  id: string;
  craftsman_id?: string;
  title: string;
  description: string;
  duration: string;
  priceRange: string;
  priceNote: string;
  icon: 'washer' | 'dishes' | 'settings' | 'toolbox' | string;
  isActive?: boolean;
}

export interface ServiceBooking {
  id: string;
  customerId?: string | null;
  craftsmanId: string;
  categoryId: string;
  serviceTitle: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  createdAt: string;
  craftsman?: Craftsman;
}

export interface MyService {
  id: string;
  userId?: string;
  title: string;
  categoryId: string;
  craftsmanId?: string;
  lastServiceDate: string;
  cost?: number;
  currency: string;
  status: MyServiceStatus;
  notes?: string;
  sourceBookingId?: string;
  nextBookingDate?: string;
  nextBookingTime?: string;
  createdAt: string;
}

export interface ServiceReminder {
  id: string;
  serviceId: string;
  userId?: string;
  title: string;
  date: string;
  type: ReminderType;
  isCompleted: boolean;
  notes?: string;
}

export interface CraftsmanReview {
  id: string;
  craftsmanId: string;
  customerId?: string | null;
  bookingId?: string | null;
  author: string;
  initial: string;
  rating: number;
  service: string;
  text: string;
  tags: string[];
  helpful: number;
  time: string;
  note: string;
  createdAt: string;
  verifiedRequest: boolean;
}

export interface ReviewInsight {
  label: string;
  count: number;
}

export interface RatingDistribution {
  stars: number;
  percent: number;
}
