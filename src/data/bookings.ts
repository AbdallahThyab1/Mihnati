import type { ServiceCategory } from './mock';

export type BookingStatus =
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export interface ServiceBooking {
  id: string;
  craftsmanId: string;
  categoryId: ServiceCategory['id'];
  serviceTitle: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

const demoBookings: ServiceBooking[] = [
  {
    id: 'b-demo-1',
    craftsmanId: 'c1',
    categoryId: 'appliances',
    serviceTitle: 'صيانة الغسالة',
    date: '2026-10-12',
    time: '10:30',
    status: 'confirmed',
    notes: 'متابعة أداء الغسالة بعد الإصلاح.',
    createdAt: '2026-10-06T18:00:00',
  },
  {
    id: 'b-demo-2',
    craftsmanId: 'c3',
    categoryId: 'ac',
    serviceTitle: 'صيانة المكيف',
    date: '2026-09-18',
    time: '17:00',
    status: 'completed',
    notes: 'تنظيف وفحص الوحدة.',
    createdAt: '2026-09-17T12:00:00',
  },
];

let bookings: ServiceBooking[] = [...demoBookings];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const getBookings = () => [...bookings].sort((a, b) =>
  `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
);

export const getBooking = (id: string) =>
  bookings.find((item) => item.id === id);

export const getUpcomingBookings = () =>
  getBookings().filter(
    (booking) => booking.status === 'confirmed',
  );

export const addBooking = (input: Omit<ServiceBooking, 'id' | 'createdAt' | 'status'>) => {
  const booking: ServiceBooking = {
    ...input,
    id: `booking-${Date.now()}`,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };

  bookings = [booking, ...bookings];
  emit();
  return booking;
};

export const updateBooking = (
  id: string,
  patch: Partial<ServiceBooking>,
) => {
  bookings = bookings.map((booking) =>
    booking.id === id ? { ...booking, ...patch } : booking,
  );
  emit();
  return getBooking(id);
};

export const subscribeBookings = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const resetBookingsDemoData = () => {
  bookings = [...demoBookings];
  emit();
};
