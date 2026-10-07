import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  CalendarClock,
  Check,
  ChevronLeft,
  Clock3,
  Search,
  Sparkles,
  Wrench,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';
import { categories, getCraftsman } from '../../data/mock';
import {
  completeServiceReminder,
  getMyServices,
  getServiceReminders,
  snoozeServiceReminder,
  subscribeMyServices,
  type MyService,
  type ServiceReminder,
} from '../../data/myServices';
import {
  getUpcomingBookings,
  subscribeBookings,
  type ServiceBooking,
} from '../../data/bookings';
import { colors, radius, row } from '../../styles/theme';

const monthNames = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const formatDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const daysFromToday = (value: string) => {
  const target = new Date(`${value}T12:00:00`);
  const today = new Date();
  const base = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
  );

  if (Number.isNaN(target.getTime())) {
    return 0;
  }

  return Math.round(
    (target.getTime() - base.getTime()) / 86400000,
  );
};

const relativeDate = (value: string) => {
  const days = daysFromToday(value);

  if (days < 0) {
    const amount = Math.abs(days);
    return `متأخر ${amount} ${amount === 1 ? 'يوم' : 'أيام'}`;
  }

  if (days === 0) {
    return 'اليوم';
  }

  if (days === 1) {
    return 'غدًا';
  }

  return `بعد ${days} أيام`;
};

const categoryLabel = (id: string) =>
  categories.find((item) => item.id === id)?.label ?? 'خدمة';

const getBookingForService = (
  service: MyService,
  bookings: ServiceBooking[],
) => {
  if (service.sourceBookingId) {
    return bookings.find(
      (booking) => booking.id === service.sourceBookingId,
    );
  }

  return bookings.find(
    (booking) =>
      booking.craftsmanId === service.craftsmanId &&
      booking.categoryId === service.categoryId &&
      booking.serviceTitle === service.title,
  );
};

function CategoryGlyph({ categoryId }: { categoryId: string }) {
  const icon = categories.find(
    (item) => item.id === categoryId,
  )?.icon;

  return (
    <View style={styles.categoryGlyph}>
      <Wrench size={19} color={colors.primary} />

      <View
        style={[
          styles.categoryDot,
          icon === 'car' && {
            backgroundColor: colors.secondary,
          },
          icon === 'fan' && {
            backgroundColor: colors.success,
          },
        ]}
      />
    </View>
  );
}

function ReminderCard({
  reminder,
  service,
  onOpen,
  onDone,
  onSnooze,
}: {
  reminder: ServiceReminder;
  service: MyService;
  onOpen: () => void;
  onDone: () => void;
  onSnooze: () => void;
}) {
  const overdue = daysFromToday(reminder.date) < 0;

  const provider = service.craftsmanId
    ? getCraftsman(service.craftsmanId)
    : undefined;

  return (
    <View
      style={[
        styles.reminderCard,
        overdue && styles.reminderCardOverdue,
      ]}
    >
      <Pressable
        onPress={onOpen}
        style={({ pressed }) => [
          styles.reminderMain,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`فتح ${reminder.title}`}
      >
        <View
          style={[
            styles.reminderIcon,
            overdue && styles.reminderIconOverdue,
          ]}
        >
          <Bell
            size={18}
            color={overdue ? colors.error : colors.primary}
          />
        </View>

        <View style={styles.reminderBody}>
          <View style={styles.reminderTitleRow}>
            <Txt
              variant="h4"
              numberOfLines={1}
              style={styles.reminderTitle}
            >
              {reminder.title}
            </Txt>

            <View
              style={[
                styles.reminderTimePill,
                overdue && styles.reminderTimePillOverdue,
              ]}
            >
              <Txt
                variant="labelSm"
                color={
                  overdue ? colors.error : colors.primary
                }
                weight="700"
              >
                {relativeDate(reminder.date)}
              </Txt>
            </View>
          </View>

          <Txt
            variant="small"
            color={colors.muted}
            numberOfLines={1}
            style={styles.reminderMeta}
          >
            {formatDate(reminder.date)} • {service.title}
            {provider ? ` • ${provider.name}` : ''}
          </Txt>
        </View>

        <ChevronLeft size={18} color={colors.muted} />
      </Pressable>

      <View style={styles.reminderActions}>
        <Pressable
          onPress={onDone}
          style={({ pressed }) => [
            styles.reminderAction,
            pressed && styles.actionPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`تم إكمال ${reminder.title}`}
        >
          <Check size={14} color={colors.success} />

          <Txt
            variant="labelSm"
            color={colors.success}
            weight="700"
            style={styles.actionText}
          >
            تمت
          </Txt>
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable
          onPress={onSnooze}
          style={({ pressed }) => [
            styles.reminderAction,
            pressed && styles.actionPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`تأجيل ${reminder.title} لسبعة أيام`}
        >
          <Clock3 size={14} color={colors.primary} />

          <Txt
            variant="labelSm"
            color={colors.primary}
            weight="700"
            style={styles.actionText}
          >
            تأجيل 7 أيام
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

function ServiceCard({
  service,
  bookings,
  onPress,
}: {
  service: MyService;
  bookings: ServiceBooking[];
  onPress: () => void;
}) {
  const provider = service.craftsmanId
    ? getCraftsman(service.craftsmanId)
    : undefined;

  const activeReminder = getServiceReminders(service.id).find(
    (item) => !item.isCompleted,
  );

  const booking = getBookingForService(service, bookings);

  const hasUpcomingBooking =
    Boolean(service.nextBookingDate) &&
    Boolean(service.nextBookingTime) &&
    service.status !== 'completed';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.serviceCard,
        pressed && styles.pressedCard,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`فتح تفاصيل ${service.title}`}
    >
      <View style={styles.serviceTopRow}>
        <CategoryGlyph categoryId={service.categoryId} />

        <View style={styles.serviceIdentity}>
          <View style={styles.serviceTitleRow}>
            <Txt
              variant="h3"
              numberOfLines={1}
              style={styles.serviceTitle}
            >
              {service.title}
            </Txt>

            <ChevronLeft
              size={18}
              color={colors.muted}
            />
          </View>

          <Txt
            variant="small"
            color={colors.muted}
            numberOfLines={1}
            style={styles.serviceMeta}
          >
            {categoryLabel(service.categoryId)}
            {provider ? ` • ${provider.name}` : ''}
          </Txt>
        </View>

        <View
          style={[
            styles.statusPill,
            service.status === 'completed'
              ? styles.statusPillCompleted
              : styles.statusPillActive,
          ]}
        >
          <Txt
            variant="labelSm"
            color={
              service.status === 'completed'
                ? colors.success
                : colors.primary
            }
            weight="700"
          >
            {service.status === 'completed'
              ? 'مكتملة'
              : 'نشطة'}
          </Txt>
        </View>
      </View>

      {hasUpcomingBooking && (
        <View style={styles.bookingStrip}>
          <View style={styles.bookingStripIcon}>
            <CalendarClock
              size={16}
              color={colors.primary}
            />
          </View>

          <View style={styles.bookingStripBody}>
            <Txt
              variant="labelSm"
              color={colors.primary}
              weight="700"
            >
              الموعد القادم
            </Txt>

            <Txt
              variant="small"
              color={colors.text}
              numberOfLines={1}
              style={styles.bookingStripValue}
            >
              {formatDate(service.nextBookingDate!)} •{' '}
              {service.nextBookingTime}
            </Txt>
          </View>

          <View style={styles.confirmedPill}>
            <Txt
              variant="labelSm"
              color={colors.success}
              weight="700"
            >
              مؤكد
            </Txt>
          </View>
        </View>
      )}

      <View style={styles.serviceFacts}>
        <View style={styles.factBlock}>
          <Txt
            variant="labelSm"
            color={colors.muted}
          >
            آخر خدمة
          </Txt>

          <Txt
            variant="label"
            weight="700"
            numberOfLines={1}
            style={styles.factValue}
          >
            {formatDate(service.lastServiceDate)}
          </Txt>
        </View>

        <View style={styles.factDivider} />

        <View style={styles.factBlock}>
          <Txt
            variant="labelSm"
            color={colors.muted}
          >
            التكلفة
          </Txt>

          <Txt
            variant="label"
            weight="700"
            numberOfLines={1}
            style={styles.factValue}
          >
            {service.cost !== undefined
              ? `${service.cost} ${service.currency}`
              : 'حسب الاتفاق'}
          </Txt>
        </View>
      </View>

      <View style={styles.serviceBottomRow}>
        <View style={styles.reminderStatus}>
          <Bell
            size={14}
            color={
              activeReminder
                ? colors.primary
                : colors.muted
            }
          />

          <Txt
            variant="labelSm"
            color={
              activeReminder
                ? colors.primary
                : colors.muted
            }
            weight={
              activeReminder ? '700' : '400'
            }
            numberOfLines={1}
            style={styles.reminderStatusText}
          >
            {activeReminder
              ? `التذكير: ${relativeDate(
                activeReminder.date,
              )}`
              : 'لا يوجد تذكير نشط'}
          </Txt>
        </View>

        {booking?.status === 'completed' && (
          <View style={styles.completedBookingTag}>
            <Check
              size={13}
              color={colors.success}
            />

            <Txt
              variant="labelSm"
              color={colors.success}
              weight="600"
              style={{ marginRight: 4 }}
            >
              من حجز مكتمل
            </Txt>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function EmptyServicesState() {
  const router = useRouter();

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Sparkles
          size={24}
          color={colors.primary}
        />
      </View>

      <Txt
        variant="h3"
        align="center"
        style={styles.emptyTitle}
      >
        لا توجد خدمات محفوظة بعد
      </Txt>

      <Txt
        variant="body"
        color={colors.muted}
        align="center"
        style={styles.emptyDescription}
      >
        ابدأ من استكشاف الخدمات، اختر مقدم الخدمة المناسب واحجز
        موعدك. بعدها تُحفظ الخدمة هنا تلقائيًا.
      </Txt>

      <Pressable
        onPress={() =>
          router.push('/services/explore')
        }
        style={({ pressed }) => [
          styles.emptyCta,
          pressed && styles.buttonPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="استكشاف الخدمات"
      >
        <Search size={18} color={colors.white} />

        <Txt
          variant="label"
          color={colors.white}
          weight="800"
          style={{ marginHorizontal: 8 }}
        >
          استكشاف الخدمات
        </Txt>

        <ArrowLeft
          size={17}
          color={colors.white}
        />
      </Pressable>
    </View>
  );
}

export default function MyServicesScreen() {
  const router = useRouter();

  const [services, setServices] = useState<MyService[]>(
    getMyServices(),
  );

  const [reminders, setReminders] =
    useState<ServiceReminder[]>(
      getServiceReminders(),
    );

  const [bookings, setBookings] =
    useState<ServiceBooking[]>(
      getUpcomingBookings(),
    );

  useEffect(() => {
    const syncServices = () => {
      setServices(getMyServices());
      setReminders(getServiceReminders());
    };

    const syncBookings = () => {
      setBookings(getUpcomingBookings());
    };

    const unsubscribeServices =
      subscribeMyServices(syncServices);

    const unsubscribeBookings =
      subscribeBookings(syncBookings);

    return () => {
      unsubscribeServices();
      unsubscribeBookings();
    };
  }, []);

  const serviceById = useMemo(
    () =>
      new Map(
        services.map((service) => [
          service.id,
          service,
        ]),
      ),
    [services],
  );

  const activeReminders = useMemo(
    () =>
      reminders
        .filter((item) => !item.isCompleted)
        .sort((a, b) =>
          a.date.localeCompare(b.date),
        ),
    [reminders],
  );

  const visibleReminders =
    activeReminders.slice(0, 3);

  const upcomingBooking = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            daysFromToday(booking.date) >= 0,
        )
        .sort((a, b) =>
          `${a.date} ${a.time}`.localeCompare(
            `${b.date} ${b.time}`,
          ),
        )[0],
    [bookings],
  );

  const completedCount = services.filter(
    (service) =>
      service.status === 'completed',
  ).length;

  const activeCount =
    services.length - completedCount;

  const openService = (id: string) => {
    router.push({
      pathname: '/services/[id]',
      params: { id },
    });
  };

  const openUpcomingBooking = () => {
    if (!upcomingBooking) {
      return;
    }

    const relatedService = services.find(
      (service) =>
        service.sourceBookingId ===
        upcomingBooking.id,
    );

    if (relatedService) {
      openService(relatedService.id);
      return;
    }

    router.push({
      pathname: '/bookings',
    });
  };

  const handleCompleteReminder = (
    id: string,
  ) => {
    completeServiceReminder(id);
  };

  const handleSnoozeReminder = (
    id: string,
  ) => {
    snoozeServiceReminder(id, 7);
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="خدماتي" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <Wrench
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.introText}>
            <Txt
              variant="h2"
              style={styles.introTitle}
            >
              خدماتك، مواعيدك، كلها هنا
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
              style={styles.introSubtitle}
            >
              بعد كل حجز، تُحفظ خدمتك هنا تلقائيًا لتبقى متابعتها
              أسهل.
            </Txt>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Txt
              variant="h3"
              style={styles.summaryValue}
            >
              {services.length}
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
            >
              إجمالي الخدمات
            </Txt>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Txt
              variant="h3"
              style={styles.summaryValue}
            >
              {activeCount}
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
            >
              خدمات نشطة
            </Txt>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Txt
              variant="h3"
              style={styles.summaryValue}
            >
              {activeReminders.length}
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
            >
              تذكيرات نشطة
            </Txt>
          </View>
        </View>

        {upcomingBooking && (
          <Pressable
            onPress={openUpcomingBooking}
            style={({ pressed }) => [
              styles.nextBookingCard,
              pressed && styles.pressedCard,
            ]}
            accessibilityRole="button"
            accessibilityLabel="فتح الموعد القادم"
          >
            <View style={styles.nextBookingAccent} />

            <View style={styles.nextBookingIcon}>
              <CalendarClock
                size={21}
                color={colors.primary}
              />
            </View>

            <View style={styles.nextBookingBody}>
              <View style={styles.nextBookingLabelRow}>
                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                >
                  موعدك القادم
                </Txt>

                <View style={styles.confirmedPill}>
                  <Txt
                    variant="labelSm"
                    color={colors.success}
                    weight="700"
                  >
                    مؤكد
                  </Txt>
                </View>
              </View>

              <Txt
                variant="h3"
                numberOfLines={1}
                style={styles.nextBookingTitle}
              >
                {upcomingBooking.serviceTitle}
              </Txt>

              <Txt
                variant="small"
                color={colors.muted}
                numberOfLines={1}
                style={styles.nextBookingMeta}
              >
                {formatDate(
                  upcomingBooking.date,
                )}{' '}
                • {upcomingBooking.time}
                {' • '}
                {
                  getCraftsman(
                    upcomingBooking.craftsmanId,
                  ).name
                }
              </Txt>
            </View>

            <ChevronLeft
              size={19}
              color={colors.muted}
            />
          </Pressable>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Txt
              variant="h3"
              style={styles.sectionTitle}
            >
              التذكيرات
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
            >
              مواعيد تستحق انتباهك
            </Txt>
          </View>

          {activeReminders.length > 0 && (
            <View style={styles.sectionCount}>
              <Txt
                variant="labelSm"
                color={colors.primary}
                weight="700"
              >
                {activeReminders.length}
              </Txt>
            </View>
          )}
        </View>

        {visibleReminders.length > 0 ? (
          <View style={styles.remindersList}>
            {visibleReminders.map(
              (reminder) => {
                const service =
                  serviceById.get(
                    reminder.serviceId,
                  );

                if (!service) {
                  return null;
                }

                return (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    service={service}
                    onOpen={() =>
                      openService(service.id)
                    }
                    onDone={() =>
                      handleCompleteReminder(
                        reminder.id,
                      )
                    }
                    onSnooze={() =>
                      handleSnoozeReminder(
                        reminder.id,
                      )
                    }
                  />
                );
              },
            )}
          </View>
        ) : (
          <View style={styles.emptyReminderCard}>
            <View style={styles.emptyReminderIcon}>
              <Bell
                size={19}
                color={colors.primary}
              />
            </View>

            <View style={styles.emptyReminderText}>
              <Txt
                variant="label"
                weight="700"
              >
                لا توجد تذكيرات نشطة
              </Txt>

              <Txt
                variant="small"
                color={colors.muted}
                style={styles.emptyReminderDescription}
              >
                يمكنك ضبطها من تفاصيل أي خدمة محفوظة.
              </Txt>
            </View>
          </View>
        )}

        {activeReminders.length > 3 && (
          <Txt
            variant="small"
            color={colors.primary}
            weight="700"
            align="right"
            style={styles.moreRemindersText}
          >
            لديك {activeReminders.length - 3} تذكيرات إضافية داخل
            خدماتك.
          </Txt>
        )}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Txt
              variant="h3"
              style={styles.sectionTitle}
            >
              خدماتك
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
            >
              الخدمات التي بدأت بها أو أنجزتها
            </Txt>
          </View>

          {services.length > 0 && (
            <View style={styles.sectionCount}>
              <Txt
                variant="labelSm"
                color={colors.primary}
                weight="700"
              >
                {services.length}
              </Txt>
            </View>
          )}
        </View>

        {services.length > 0 ? (
          <View style={styles.servicesList}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                bookings={bookings}
                onPress={() =>
                  openService(service.id)
                }
              />
            ))}
          </View>
        ) : (
          <EmptyServicesState />
        )}

        <Pressable
          onPress={() =>
            router.push('/services/explore')
          }
          style={({ pressed }) => [
            styles.exploreButton,
            pressed && styles.buttonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="استكشاف الخدمات"
        >
          <View style={styles.exploreIcon}>
            <Search
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={styles.exploreBody}>
            <Txt
              variant="label"
              color={colors.white}
              weight="800"
            >
              استكشاف خدمة جديدة
            </Txt>

            <Txt
              variant="small"
              color="#DCEBE3"
              style={styles.exploreSubtitle}
            >
              ابحث، اختر مقدم الخدمة، واحجز — وستُضاف هنا تلقائيًا
            </Txt>
          </View>

          <ArrowLeft
            size={18}
            color={colors.white}
          />
        </Pressable>

        <Txt
          variant="small"
          color={colors.muted}
          align="center"
          style={styles.bottomNote}
        >
          هذه النسخة تحفظ الخدمات والحجوزات محليًا ضمن الـDemo.
        </Txt>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 36,
  },

  intro: {
    ...row,
    alignItems: 'center',
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  introText: {
    flex: 1,
    marginHorizontal: 11,
  },

  introTitle: {
    fontSize: 20,
  },

  introSubtitle: {
    marginTop: 3,
    lineHeight: 19,
  },

  summaryRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 11,
    paddingHorizontal: 7,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    fontSize: 18,
    lineHeight: 24,
  },

  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },

  nextBookingCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 13,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    overflow: 'hidden',
  },

  nextBookingAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 4,
    backgroundColor: colors.primary,
  },

  nextBookingIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextBookingBody: {
    flex: 1,
    marginHorizontal: 10,
  },

  nextBookingLabelRow: {
    ...row,
    justifyContent: 'space-between',
  },

  nextBookingTitle: {
    marginTop: 3,
    fontSize: 16,
  },

  nextBookingMeta: {
    marginTop: 2,
  },

  confirmedPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: '#EEF8F2',
  },

  sectionHeader: {
    ...row,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 23,
    marginBottom: 10,
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
  },

  sectionCount: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  remindersList: {
    gap: 10,
  },

  reminderCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  reminderCardOverdue: {
    borderColor: '#EBCFCF',
  },

  reminderMain: {
    ...row,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  reminderIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reminderIconOverdue: {
    backgroundColor: '#FFF1F1',
  },

  reminderBody: {
    flex: 1,
    marginHorizontal: 9,
  },

  reminderTitleRow: {
    ...row,
    alignItems: 'center',
    gap: 7,
  },

  reminderTitle: {
    flex: 1,
    fontSize: 14,
  },

  reminderTimePill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.tintStrong,
  },

  reminderTimePillOverdue: {
    backgroundColor: '#FFF1F1',
  },

  reminderMeta: {
    marginTop: 3,
  },

  reminderActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    minHeight: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  reminderAction: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },

  actionText: {
    marginRight: 5,
  },

  actionPressed: {
    backgroundColor: '#FAFBF9',
  },

  serviceCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 13,
  },

  pressedCard: {
    opacity: 0.84,
    transform: [{ scale: 0.995 }],
  },

  servicesList: {
    gap: 11,
  },

  serviceTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  categoryGlyph: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  categoryDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    right: 9,
    bottom: 8,
    backgroundColor: colors.primary,
  },

  serviceIdentity: {
    flex: 1,
    marginHorizontal: 9,
  },

  serviceTitleRow: {
    ...row,
    alignItems: 'center',
  },

  serviceTitle: {
    flex: 1,
    fontSize: 15,
  },

  serviceMeta: {
    marginTop: 2,
  },

  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
  },

  statusPillActive: {
    backgroundColor: colors.tintStrong,
  },

  statusPillCompleted: {
    backgroundColor: '#EEF8F2',
  },

  bookingStrip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 11,
    padding: 9,
    borderRadius: radius.lg,
    backgroundColor: colors.tintStrong,
  },

  bookingStripIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bookingStripBody: {
    flex: 1,
    marginHorizontal: 8,
  },

  bookingStripValue: {
    marginTop: 1,
  },

  serviceFacts: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  factBlock: {
    flex: 1,
  },

  factValue: {
    marginTop: 2,
  },

  factDivider: {
    width: 1,
    height: 29,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },

  serviceBottomRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  reminderStatus: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  reminderStatusText: {
    flex: 1,
    marginRight: 5,
  },

  completedBookingTag: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginRight: 8,
  },

  emptyReminderCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },

  emptyReminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyReminderText: {
    flex: 1,
    marginRight: 10,
  },

  emptyReminderDescription: {
    marginTop: 2,
  },

  moreRemindersText: {
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 25,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
  },

  emptyDescription: {
    marginTop: 6,
    lineHeight: 21,
  },

  emptyCta: {
    minHeight: 46,
    marginTop: 16,
    paddingHorizontal: 15,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },

  exploreButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 14,
    minHeight: 61,
    paddingHorizontal: 12,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
  },

  exploreIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exploreBody: {
    flex: 1,
    marginHorizontal: 9,
  },

  exploreSubtitle: {
    marginTop: 1,
    lineHeight: 17,
  },

  buttonPressed: {
    opacity: 0.88,
  },

  bottomNote: {
    marginTop: 13,
    lineHeight: 17,
  },
});