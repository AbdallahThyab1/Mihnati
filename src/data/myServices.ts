import type { ServiceCategory } from './mock';

export type ReminderType =
  | 'maintenance'
  | 'follow_up'
  | 'booking'
  | 'custom';

export type MyServiceStatus = 'active' | 'completed';

export interface MyService {
  id: string;
  title: string;
  categoryId: ServiceCategory['id'];
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
  title: string;
  date: string;
  type: ReminderType;
  isCompleted: boolean;
  notes?: string;
}

const initialServices: MyService[] = [
  {
    id: 'ms1',
    title: 'صيانة المكيف',
    categoryId: 'ac',
    craftsmanId: 'c3',
    lastServiceDate: '2026-09-18',
    cost: 120,
    currency: '₪',
    status: 'completed',
    notes: 'تم تنظيف الوحدة وفحص التبريد والتأكد من عدم وجود تسريب واضح.',
    sourceBookingId: 'b-demo-2',
    createdAt: '2026-09-18T18:00:00',
  },
  {
    id: 'ms2',
    title: 'صيانة الغسالة',
    categoryId: 'appliances',
    craftsmanId: 'c1',
    lastServiceDate: '2026-07-30',
    cost: 150,
    currency: '₪',
    status: 'active',
    notes: 'متابعة أداء الغسالة بعد الإصلاح.',
    sourceBookingId: 'b-demo-1',
    nextBookingDate: '2026-10-12',
    nextBookingTime: '10:30',
    createdAt: '2026-07-30T16:30:00',
  },
  {
    id: 'ms3',
    title: 'فحص كمبيوتر السيارة',
    categoryId: 'cars',
    craftsmanId: 'c10',
    lastServiceDate: '2026-08-28',
    cost: 30,
    currency: '₪',
    status: 'completed',
    notes: 'تم فحص الأعطال ومسح الأكواد وشرح الملاحظات.',
    createdAt: '2026-08-28T11:00:00',
  },
];

const initialReminders: ServiceReminder[] = [
  {
    id: 'sr1',
    serviceId: 'ms1',
    title: 'تذكير صيانة المكيف',
    date: '2027-01-12',
    type: 'maintenance',
    isCompleted: false,
    notes: 'تذكير دوري.',
  },
  {
    id: 'sr2',
    serviceId: 'ms3',
    title: 'تذكير فحص السيارة',
    date: '2026-10-28',
    type: 'maintenance',
    isCompleted: false,
  },
];

let services: MyService[] = [...initialServices];
let reminders: ServiceReminder[] = [...initialReminders];

const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const getMyServices = () => [...services];

export const getMyService = (id: string) =>
  services.find((item) => item.id === id);

export const getServiceReminders = (serviceId?: string) => {
  const result = serviceId
    ? reminders.filter((item) => item.serviceId === serviceId)
    : reminders;

  return [...result].sort((a, b) => a.date.localeCompare(b.date));
};

export const getReminder = (id: string) =>
  reminders.find((item) => item.id === id);

export const subscribeMyServices = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const addMyService = (input: {
  title: string;
  categoryId: ServiceCategory['id'];
  craftsmanId?: string;
  lastServiceDate: string;
  cost?: number;
  notes?: string;
  sourceBookingId?: string;
  nextBookingDate?: string;
  nextBookingTime?: string;
}) => {
  const service: MyService = {
    id: `ms-${Date.now()}`,
    title: input.title.trim(),
    categoryId: input.categoryId,
    craftsmanId: input.craftsmanId,
    lastServiceDate: input.lastServiceDate,
    cost: input.cost,
    currency: '₪',
    status: 'active',
    notes: input.notes?.trim(),
    sourceBookingId: input.sourceBookingId,
    nextBookingDate: input.nextBookingDate,
    nextBookingTime: input.nextBookingTime,
    createdAt: new Date().toISOString(),
  };

  services = [service, ...services];
  emit();
  return service;
};

export const addServiceReminder = (input: {
  serviceId: string;
  title: string;
  date: string;
  type?: ReminderType;
  notes?: string;
}) => {
  const reminder: ServiceReminder = {
    id: `sr-${Date.now()}`,
    serviceId: input.serviceId,
    title: input.title.trim(),
    date: input.date,
    type: input.type ?? 'custom',
    isCompleted: false,
    notes: input.notes?.trim(),
  };

  reminders = [
    ...reminders.filter(
      (item) => item.serviceId !== input.serviceId || item.isCompleted,
    ),
    reminder,
  ];

  emit();
  return reminder;
};

export const updateServiceReminder = (
  id: string,
  patch: Partial<ServiceReminder>,
) => {
  reminders = reminders.map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
  emit();
  return getReminder(id);
};

export const completeServiceReminder = (id: string) =>
  updateServiceReminder(id, { isCompleted: true });

export const snoozeServiceReminder = (id: string, days: number) => {
  const reminder = getReminder(id);
  if (!reminder) return undefined;

  const date = new Date(`${reminder.date}T12:00:00`);
  date.setDate(date.getDate() + days);

  return updateServiceReminder(id, {
    date: date.toISOString().slice(0, 10),
    isCompleted: false,
  });
};

export const markServiceCompleted = (serviceId: string) => {
  services = services.map((service) =>
    service.id === serviceId
      ? {
        ...service,
        status: 'completed',
        nextBookingDate: undefined,
        nextBookingTime: undefined,
      }
      : service,
  );
  emit();
};

export const deleteServiceReminder = (id: string) => {
  reminders = reminders.filter((item) => item.id !== id);
  emit();
};

export const resetMyServicesDemoData = () => {
  services = [...initialServices];
  reminders = [...initialReminders];
  emit();
};
