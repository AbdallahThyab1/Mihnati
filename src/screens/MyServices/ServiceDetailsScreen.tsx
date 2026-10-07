import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Bell,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  MapPin,
  NotebookPen,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';
import { categories, getCraftsman } from '../../data/mock';
import {
  addServiceReminder,
  completeServiceReminder,
  getMyService,
  getServiceReminders,
  markServiceCompleted,
  snoozeServiceReminder,
  subscribeMyServices,
  updateServiceReminder,
  type MyService,
  type ServiceReminder,
} from '../../data/myServices';
import { getBooking } from '../../data/bookings';
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

const getParam = (
  value: string | string[] | undefined,
): string => {
  return Array.isArray(value)
    ? value[0] ?? ''
    : value ?? '';
};

const formatDate = (value?: string) => {
  if (!value) {
    return '—';
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const formatShortDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getDate()}/${date.getMonth() + 1}`;
};

const daysFromToday = (value: string) => {
  const target = new Date(
    `${value}T12:00:00`,
  ).getTime();

  const today = new Date();

  const base = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
  ).getTime();

  if (Number.isNaN(target)) {
    return 0;
  }

  return Math.round(
    (target - base) / 86400000,
  );
};

const getRelativeDate = (value: string) => {
  const days = daysFromToday(value);

  if (days < 0) {
    const amount = Math.abs(days);
    return `متأخر ${amount} ${amount === 1 ? 'يوم' : 'أيام'
      }`;
  }

  if (days === 0) {
    return 'اليوم';
  }

  if (days === 1) {
    return 'غدًا';
  }

  return `بعد ${days} أيام`;
};

const getDateAfterMonths = (
  months: number,
) => {
  const date = new Date();

  date.setMonth(date.getMonth() + months);

  return date.toISOString().slice(0, 10);
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        {icon}
      </View>

      <View style={styles.detailText}>
        <Txt
          variant="small"
          color={colors.muted}
        >
          {label}
        </Txt>

        <Txt
          variant="label"
          weight="700"
          numberOfLines={2}
          style={styles.detailValue}
        >
          {value}
        </Txt>
      </View>
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeading}>
        <Txt
          variant="h3"
          style={styles.sectionTitle}
        >
          {title}
        </Txt>

        {subtitle ? (
          <Txt
            variant="small"
            color={colors.muted}
            style={styles.sectionSubtitle}
          >
            {subtitle}
          </Txt>
        ) : null}
      </View>

      {action}
    </View>
  );
}

function ReminderTypeLabel(
  type: ServiceReminder['type'],
) {
  switch (type) {
    case 'booking':
      return 'موعد حجز';

    case 'maintenance':
      return 'صيانة';

    case 'follow_up':
      return 'متابعة';

    default:
      return 'تذكير';
  }
}

export default function ServiceDetailsScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const id = getParam(params.id);

  const [service, setService] =
    useState<MyService | undefined>(() =>
      getMyService(id),
    );

  const [reminders, setReminders] =
    useState<ServiceReminder[]>(() =>
      getServiceReminders(id),
    );

  const [
    showReminderModal,
    setShowReminderModal,
  ] = useState(false);

  const [
    editingReminderId,
    setEditingReminderId,
  ] = useState<string | undefined>();

  const [reminderTitle, setReminderTitle] =
    useState('');

  const [reminderDate, setReminderDate] =
    useState('');

  useEffect(() => {
    const sync = () => {
      setService(getMyService(id));
      setReminders(getServiceReminders(id));
    };

    return subscribeMyServices(sync);
  }, [id]);

  const provider = service?.craftsmanId
    ? getCraftsman(service.craftsmanId)
    : undefined;

  const category = service
    ? categories.find(
      (item) =>
        item.id === service.categoryId,
    )
    : undefined;

  const activeReminder = useMemo(
    () =>
      reminders.find(
        (item) => !item.isCompleted,
      ),
    [reminders],
  );

  const relatedBooking = service?.sourceBookingId
    ? getBooking(service.sourceBookingId)
    : undefined;

  const hasUpcomingAppointment =
    Boolean(
      service?.nextBookingDate &&
      service?.nextBookingTime,
    );

  const isCompleted =
    service?.status === 'completed';

  const reminderIsOverdue = activeReminder
    ? daysFromToday(activeReminder.date) < 0
    : false;

  if (!service) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="الخدمة" />

        <View style={styles.notFound}>
          <View style={styles.notFoundIcon}>
            <Wrench
              size={26}
              color={colors.primary}
            />
          </View>

          <Txt
            variant="h2"
            align="center"
            style={styles.notFoundTitle}
          >
            الخدمة غير موجودة
          </Txt>

          <Txt
            variant="body"
            color={colors.muted}
            align="center"
            style={styles.notFoundDescription}
          >
            يبدو أن الخدمة غير متوفرة حاليًا في بيانات
            الـDemo.
          </Txt>

          <Pressable
            onPress={() =>
              router.replace('/services')
            }
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Txt
              variant="label"
              color={colors.white}
              weight="800"
            >
              العودة إلى خدماتي
            </Txt>
          </Pressable>
        </View>
      </View>
    );
  }

  const openProvider = () => {
    if (!provider) {
      return;
    }

    router.push({
      pathname: '/profile/[id]',
      params: {
        id: provider.id,
      },
    });
  };

  const openRebooking = () => {
    if (!provider) {
      return;
    }

    router.push({
      pathname: '/booking/[craftsmanId]',
      params: {
        craftsmanId: provider.id,
        categoryId: service.categoryId,
      },
    });
  };

  const openRelatedBooking = () => {
    if (!service.sourceBookingId) {
      return;
    }

    router.push('/bookings');
  };

  const saveReminder = () => {
    const title =
      reminderTitle.trim();

    const date =
      reminderDate.trim();

    if (
      !title ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      Alert.alert(
        'بيانات غير مكتملة',
        'اكتب اسم التذكير وتأكد أن التاريخ بصيغة YYYY-MM-DD.',
      );
      return;
    }

    if (editingReminderId) {
      updateServiceReminder(
        editingReminderId,
        {
          title,
          date,
          type:
            activeReminder?.type ??
            'maintenance',
        },
      );
    } else {
      addServiceReminder({
        serviceId: service.id,
        title,
        date,
        type: 'maintenance',
      });
    }

    setShowReminderModal(false);
    setEditingReminderId(undefined);
    setReminderTitle('');
    setReminderDate('');
  };

  const openNewReminder = () => {
    setEditingReminderId(undefined);
    setReminderTitle(
      `تذكير ${service.title}`,
    );
    setReminderDate(
      getDateAfterMonths(3),
    );
    setShowReminderModal(true);
  };

  const openEditReminder = () => {
    if (!activeReminder) {
      openNewReminder();
      return;
    }

    setEditingReminderId(
      activeReminder.id,
    );

    setReminderTitle(
      activeReminder.title,
    );

    setReminderDate(
      activeReminder.date,
    );

    setShowReminderModal(true);
  };

  const closeReminderModal = () => {
    setShowReminderModal(false);
    setEditingReminderId(undefined);
    setReminderTitle('');
    setReminderDate('');
  };

  const chooseReminderDate = (
    months: number,
  ) => {
    setReminderDate(
      getDateAfterMonths(months),
    );
  };

  const completeReminder = () => {
    if (!activeReminder) {
      return;
    }

    completeServiceReminder(
      activeReminder.id,
    );
  };

  const snoozeReminder = () => {
    if (!activeReminder) {
      return;
    }

    snoozeServiceReminder(
      activeReminder.id,
      7,
    );
  };

  const completeService = () => {
    if (isCompleted) {
      return;
    }

    Alert.alert(
      'تم إنجاز الخدمة؟',
      'سيتم تحويل الخدمة إلى مكتملة وإزالة الموعد القادم منها.',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تأكيد',
          onPress: () =>
            markServiceCompleted(
              service.id,
            ),
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="تفاصيل الخدمة" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Wrench
                size={24}
                color={colors.primary}
              />
            </View>

            <View style={styles.heroIdentity}>
              <Txt
                variant="h2"
                numberOfLines={2}
                style={styles.heroTitle}
              >
                {service.title}
              </Txt>

              <Txt
                variant="small"
                color={colors.muted}
                numberOfLines={1}
                style={styles.heroMeta}
              >
                {category?.label ?? 'خدمة'}
                {provider
                  ? ` • ${provider.name}`
                  : ''}
              </Txt>
            </View>

            <View
              style={[
                styles.statusPill,
                isCompleted
                  ? styles.statusPillCompleted
                  : styles.statusPillActive,
              ]}
            >
              <Txt
                variant="labelSm"
                color={
                  isCompleted
                    ? colors.success
                    : colors.primary
                }
                weight="700"
              >
                {isCompleted
                  ? 'مكتملة'
                  : 'نشطة'}
              </Txt>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottom}>
            <View style={styles.heroBottomItem}>
              <CalendarDays
                size={15}
                color={colors.muted}
              />

              <Txt
                variant="small"
                color={colors.muted}
                style={styles.heroBottomText}
              >
                آخر خدمة
              </Txt>

              <Txt
                variant="labelSm"
                weight="700"
                style={styles.heroBottomValue}
              >
                {formatDate(
                  service.lastServiceDate,
                )}
              </Txt>
            </View>

            {provider ? (
              <View style={styles.heroBottomItem}>
                <MapPin
                  size={15}
                  color={colors.muted}
                />

                <Txt
                  variant="small"
                  color={colors.muted}
                  style={styles.heroBottomText}
                >
                  المنطقة
                </Txt>

                <Txt
                  variant="labelSm"
                  weight="700"
                  numberOfLines={1}
                  style={styles.heroBottomValue}
                >
                  {provider.area}
                </Txt>
              </View>
            ) : null}
          </View>
        </View>

        {hasUpcomingAppointment ? (
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentTop}>
              <View style={styles.appointmentIcon}>
                <CalendarClock
                  size={22}
                  color={colors.primary}
                />
              </View>

              <View style={styles.appointmentBody}>
                <View
                  style={styles.appointmentLabelRow}
                >
                  <Txt
                    variant="labelSm"
                    color={colors.primary}
                    weight="700"
                  >
                    الموعد القادم
                  </Txt>

                  <View style={styles.confirmedPill}>
                    <Check
                      size={12}
                      color={colors.success}
                    />

                    <Txt
                      variant="labelSm"
                      color={colors.success}
                      weight="700"
                      style={{
                        marginRight: 4,
                      }}
                    >
                      مؤكد
                    </Txt>
                  </View>
                </View>

                <Txt
                  variant="h3"
                  style={styles.appointmentTitle}
                >
                  {formatDate(
                    service.nextBookingDate,
                  )}
                </Txt>

                <Txt
                  variant="small"
                  color={colors.muted}
                  style={styles.appointmentMeta}
                >
                  الساعة{' '}
                  {service.nextBookingTime}
                  {provider
                    ? ` • ${provider.name}`
                    : ''}
                </Txt>
              </View>
            </View>

            <View
              style={styles.appointmentFooter}
            >
              <Txt
                variant="small"
                color={colors.muted}
              >
                هذا الموعد محفوظ من الحجز.
              </Txt>

              <Pressable
                onPress={
                  openRelatedBooking
                }
                style={({ pressed }) => [
                  styles.smallLinkButton,
                  pressed &&
                  styles.smallLinkPressed,
                ]}
              >
                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                >
                  عرض الحجز
                </Txt>

                <ChevronLeft
                  size={15}
                  color={colors.primary}
                />
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title="ملخص الخدمة"
            subtitle="أهم المعلومات في مكان واحد"
          />

          <View style={styles.detailsCard}>
            <DetailRow
              icon={
                <CalendarDays
                  size={17}
                  color={colors.primary}
                />
              }
              label="تاريخ آخر خدمة"
              value={formatDate(
                service.lastServiceDate,
              )}
            />

            <View style={styles.detailDivider} />

            <DetailRow
              icon={
                <Wrench
                  size={17}
                  color={colors.primary}
                />
              }
              label="المجال"
              value={
                category?.label ?? '—'
              }
            />

            <View style={styles.detailDivider} />

            <DetailRow
              icon={
                <NotebookPen
                  size={17}
                  color={colors.primary}
                />
              }
              label="التكلفة"
              value={
                service.cost !== undefined
                  ? `${service.cost} ${service.currency}`
                  : 'حسب الاتفاق'
              }
            />
          </View>
        </View>

        {provider ? (
          <View style={styles.section}>
            <SectionHeader
              title="مقدم الخدمة"
              subtitle="المهني المرتبط بهذه الخدمة"
              action={
                <Pressable
                  onPress={openProvider}
                  style={({ pressed }) => [
                    styles.sectionAction,
                    pressed &&
                    styles.smallLinkPressed,
                  ]}
                >
                  <Txt
                    variant="labelSm"
                    color={colors.primary}
                    weight="700"
                  >
                    عرض الملف
                  </Txt>

                  <ChevronLeft
                    size={15}
                    color={colors.primary}
                  />
                </Pressable>
              }
            />

            <Pressable
              onPress={openProvider}
              style={({ pressed }) => [
                styles.providerCard,
                pressed &&
                styles.pressedCard,
              ]}
            >
              <View
                style={styles.providerAvatar}
              >
                <UserRound
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.providerInfo}>
                <Txt
                  variant="label"
                  weight="800"
                  numberOfLines={1}
                >
                  {provider.name}
                </Txt>

                <Txt
                  variant="small"
                  color={colors.muted}
                  numberOfLines={2}
                  style={
                    styles.providerSpecialty
                  }
                >
                  {provider.specialty}
                </Txt>

                <View
                  style={
                    styles.providerMeta
                  }
                >
                  <MapPin
                    size={13}
                    color={colors.muted}
                  />

                  <Txt
                    variant="labelSm"
                    color={colors.muted}
                    style={{
                      marginRight: 4,
                    }}
                  >
                    {provider.area}
                  </Txt>
                </View>
              </View>

              <ChevronLeft
                size={18}
                color={colors.muted}
              />
            </Pressable>
          </View>
        ) : null}

        {service.notes ? (
          <View style={styles.section}>
            <SectionHeader
              title="ملاحظات"
              subtitle="تفاصيل مرتبطة بالخدمة"
            />

            <View style={styles.notesCard}>
              <View style={styles.notesIcon}>
                <NotebookPen
                  size={19}
                  color={colors.primary}
                />
              </View>

              <Txt
                variant="body"
                color={colors.text}
                style={styles.notesText}
              >
                {service.notes}
              </Txt>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title="التذكير"
            subtitle="حتى لا تنسى موعد الصيانة القادم"
            action={
              <Bell
                size={18}
                color={colors.primary}
              />
            }
          />

          {activeReminder ? (
            <View
              style={[
                styles.reminderCard,
                reminderIsOverdue &&
                styles.reminderCardOverdue,
              ]}
            >
              <View
                style={styles.reminderTop}
              >
                <View
                  style={[
                    styles.reminderIcon,
                    reminderIsOverdue &&
                    styles.reminderIconOverdue,
                  ]}
                >
                  <Bell
                    size={19}
                    color={
                      reminderIsOverdue
                        ? colors.error
                        : colors.primary
                    }
                  />
                </View>

                <View
                  style={styles.reminderInfo}
                >
                  <View
                    style={styles.reminderTitleRow}
                  >
                    <Txt
                      variant="label"
                      weight="800"
                      numberOfLines={1}
                      style={
                        styles.reminderTitle
                      }
                    >
                      {
                        activeReminder.title
                      }
                    </Txt>

                    <View
                      style={[
                        styles.reminderDatePill,
                        reminderIsOverdue &&
                        styles.reminderDatePillOverdue,
                      ]}
                    >
                      <Txt
                        variant="labelSm"
                        color={
                          reminderIsOverdue
                            ? colors.error
                            : colors.primary
                        }
                        weight="700"
                      >
                        {getRelativeDate(
                          activeReminder.date,
                        )}
                      </Txt>
                    </View>
                  </View>

                  <Txt
                    variant="small"
                    color={colors.muted}
                    style={
                      styles.reminderMeta
                    }
                  >
                    {formatDate(
                      activeReminder.date,
                    )}{' '}
                    •{' '}
                    {ReminderTypeLabel(
                      activeReminder.type,
                    )}
                  </Txt>
                </View>
              </View>

              {activeReminder.notes ? (
                <Txt
                  variant="small"
                  color={colors.muted}
                  style={
                    styles.reminderNotes
                  }
                >
                  {activeReminder.notes}
                </Txt>
              ) : null}

              <View
                style={styles.reminderActions}
              >
                <Pressable
                  onPress={
                    completeReminder
                  }
                  style={({ pressed }) => [
                    styles.reminderPrimary,
                    pressed &&
                    styles.buttonPressed,
                  ]}
                >
                  <Check
                    size={16}
                    color={colors.white}
                  />

                  <Txt
                    variant="labelSm"
                    color={colors.white}
                    weight="800"
                    style={{
                      marginRight: 6,
                    }}
                  >
                    تمت
                  </Txt>
                </Pressable>

                <Pressable
                  onPress={
                    snoozeReminder
                  }
                  style={({ pressed }) => [
                    styles.reminderSecondary,
                    pressed &&
                    styles.smallLinkPressed,
                  ]}
                >
                  <Clock3
                    size={16}
                    color={colors.primary}
                  />

                  <Txt
                    variant="labelSm"
                    color={colors.primary}
                    weight="700"
                    style={{
                      marginRight: 6,
                    }}
                  >
                    تأجيل 7 أيام
                  </Txt>
                </Pressable>

                <Pressable
                  onPress={
                    openEditReminder
                  }
                  style={({ pressed }) => [
                    styles.reminderEdit,
                    pressed &&
                    styles.smallLinkPressed,
                  ]}
                  accessibilityLabel="تعديل التذكير"
                >
                  <NotebookPen
                    size={16}
                    color={colors.primary}
                  />
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.noReminderCard}>
              <View
                style={styles.noReminderIcon}
              >
                <Bell
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View
                style={styles.noReminderBody}
              >
                <Txt
                  variant="label"
                  weight="700"
                >
                  لا يوجد تذكير نشط
                </Txt>

                <Txt
                  variant="small"
                  color={colors.muted}
                  style={
                    styles.noReminderDescription
                  }
                >
                  أضف تذكيرًا للصيانة أو المتابعة القادمة.
                </Txt>
              </View>

              <Pressable
                onPress={
                  openNewReminder
                }
                style={({ pressed }) => [
                  styles.addReminderButton,
                  pressed &&
                  styles.smallLinkPressed,
                ]}
              >
                <Plus
                  size={18}
                  color={colors.primary}
                />

                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                  style={{
                    marginRight: 4,
                  }}
                >
                  إضافة
                </Txt>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="إجراءات"
            subtitle="ماذا تريد أن تفعل بهذه الخدمة؟"
          />

          <View style={styles.actionsCard}>
            {provider ? (
              <Pressable
                onPress={
                  openRebooking
                }
                style={({ pressed }) => [
                  styles.actionRow,
                  pressed &&
                  styles.actionRowPressed,
                ]}
              >
                <View
                  style={styles.actionIcon}
                >
                  <RefreshCw
                    size={18}
                    color={colors.primary}
                  />
                </View>

                <View
                  style={
                    styles.actionTextWrap
                  }
                >
                  <Txt
                    variant="label"
                    weight="700"
                  >
                    إعادة الحجز
                  </Txt>

                  <Txt
                    variant="small"
                    color={colors.muted}
                    style={
                      styles.actionDescription
                    }
                  >
                    احجز الخدمة مرة أخرى مع نفس مقدم الخدمة.
                  </Txt>
                </View>

                <ChevronLeft
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            ) : null}

            {provider ? (
              <View
                style={styles.actionDivider}
              />
            ) : null}

            {provider ? (
              <Pressable
                onPress={openProvider}
                style={({ pressed }) => [
                  styles.actionRow,
                  pressed &&
                  styles.actionRowPressed,
                ]}
              >
                <View
                  style={styles.actionIcon}
                >
                  <UserRound
                    size={18}
                    color={colors.primary}
                  />
                </View>

                <View
                  style={
                    styles.actionTextWrap
                  }
                >
                  <Txt
                    variant="label"
                    weight="700"
                  >
                    عرض ملف مقدم الخدمة
                  </Txt>

                  <Txt
                    variant="small"
                    color={colors.muted}
                    style={
                      styles.actionDescription
                    }
                  >
                    التقييمات والموقع وطرق التواصل.
                  </Txt>
                </View>

                <ChevronLeft
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            ) : null}

            {service.sourceBookingId ? (
              <>
                <View
                  style={styles.actionDivider}
                />

                <Pressable
                  onPress={
                    openRelatedBooking
                  }
                  style={({ pressed }) => [
                    styles.actionRow,
                    pressed &&
                    styles.actionRowPressed,
                  ]}
                >
                  <View
                    style={styles.actionIcon}
                  >
                    <CalendarClock
                      size={18}
                      color={colors.primary}
                    />
                  </View>

                  <View
                    style={
                      styles.actionTextWrap
                    }
                  >
                    <Txt
                      variant="label"
                      weight="700"
                    >
                      عرض الحجز المرتبط
                    </Txt>

                    <Txt
                      variant="small"
                      color={colors.muted}
                      style={
                        styles.actionDescription
                      }
                    >
                      تفاصيل الموعد الذي أنشأ هذه الخدمة.
                    </Txt>
                  </View>

                  <ChevronLeft
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              </>
            ) : null}

            {!isCompleted ? (
              <>
                <View
                  style={styles.actionDivider}
                />

                <Pressable
                  onPress={
                    completeService
                  }
                  style={({ pressed }) => [
                    styles.actionRow,
                    pressed &&
                    styles.actionRowPressed,
                  ]}
                >
                  <View
                    style={
                      styles.actionIconSuccess
                    }
                  >
                    <Check
                      size={18}
                      color={colors.success}
                    />
                  </View>

                  <View
                    style={
                      styles.actionTextWrap
                    }
                  >
                    <Txt
                      variant="label"
                      color={colors.success}
                      weight="700"
                    >
                      تحديد الخدمة كمكتملة
                    </Txt>

                    <Txt
                      variant="small"
                      color={colors.muted}
                      style={
                        styles.actionDescription
                      }
                    >
                      استخدمها بعد انتهاء موعد الخدمة فعليًا.
                    </Txt>
                  </View>

                  <ChevronLeft
                    size={18}
                    color={colors.muted}
                  />
                </Pressable>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.bottomTrust}>
          <ShieldCheck
            size={19}
            color={colors.primary}
          />

          <View style={styles.bottomTrustText}>
            <Txt
              variant="labelSm"
              color={colors.primary}
              weight="700"
            >
              سجل الخدمة محفوظ في مِهنتي
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
              style={{
                marginTop: 2,
              }}
            >
              في هذا الـDemo يتم حفظ البيانات محليًا، ويمكن ربطها لاحقًا
              بقاعدة البيانات.
            </Txt>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showReminderModal}
        transparent
        animationType="slide"
        onRequestClose={
          closeReminderModal
        }
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View
              style={styles.modalHeader}
            >
              <View>
                <Txt
                  variant="h3"
                  style={
                    styles.modalTitle
                  }
                >
                  {editingReminderId
                    ? 'تعديل التذكير'
                    : 'إضافة تذكير'}
                </Txt>

                <Txt
                  variant="small"
                  color={colors.muted}
                  style={
                    styles.modalSubtitle
                  }
                >
                  اختر موعدًا مناسبًا للخدمة القادمة.
                </Txt>
              </View>

              <Pressable
                onPress={
                  closeReminderModal
                }
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed &&
                  styles.smallLinkPressed,
                ]}
                accessibilityLabel="إغلاق"
              >
                <X
                  size={18}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <Txt
              variant="labelSm"
              color={colors.muted}
              weight="600"
              style={styles.fieldLabel}
            >
              اسم التذكير
            </Txt>

            <TextInput
              value={reminderTitle}
              onChangeText={
                setReminderTitle
              }
              placeholder="مثال: صيانة دورية"
              placeholderTextColor={
                colors.muted
              }
              textAlign="right"
              style={styles.input}
            />

            <View
              style={styles.fieldHeader}
            >
              <Txt
                variant="labelSm"
                color={colors.muted}
                weight="600"
              >
                تاريخ التذكير
              </Txt>

              <Txt
                variant="labelSm"
                color={colors.primary}
                weight="600"
              >
                YYYY-MM-DD
              </Txt>
            </View>

            <TextInput
              value={reminderDate}
              onChangeText={
                setReminderDate
              }
              placeholder="2027-01-15"
              placeholderTextColor={
                colors.muted
              }
              textAlign="right"
              keyboardType="numbers-and-punctuation"
              style={styles.input}
            />

            <Txt
              variant="labelSm"
              color={colors.muted}
              weight="600"
              style={styles.quickTitle}
            >
              اختيار سريع
            </Txt>

            <View
              style={styles.quickDates}
            >
              <Pressable
                onPress={() =>
                  chooseReminderDate(
                    1,
                  )
                }
                style={({ pressed }) => [
                  styles.quickDate,
                  pressed &&
                  styles.smallLinkPressed,
                ]}
              >
                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                >
                  بعد شهر
                </Txt>
              </Pressable>

              <Pressable
                onPress={() =>
                  chooseReminderDate(
                    3,
                  )
                }
                style={({ pressed }) => [
                  styles.quickDate,
                  pressed &&
                  styles.smallLinkPressed,
                ]}
              >
                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                >
                  بعد 3 أشهر
                </Txt>
              </Pressable>

              <Pressable
                onPress={() =>
                  chooseReminderDate(
                    6,
                  )
                }
                style={({ pressed }) => [
                  styles.quickDate,
                  pressed &&
                  styles.smallLinkPressed,
                ]}
              >
                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                >
                  بعد 6 أشهر
                </Txt>
              </Pressable>
            </View>

            <Pressable
              onPress={saveReminder}
              style={({ pressed }) => [
                styles.saveButton,
                pressed &&
                styles.buttonPressed,
              ]}
            >
              <Check
                size={18}
                color={colors.white}
              />

              <Txt
                variant="label"
                color={colors.white}
                weight="800"
                style={{
                  marginRight: 7,
                }}
              >
                حفظ التذكير
              </Txt>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    paddingTop: 13,
    paddingBottom: 40,
  },

  heroCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },

  heroTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroIdentity: {
    flex: 1,
    marginHorizontal: 10,
  },

  heroTitle: {
    fontSize: 20,
    lineHeight: 27,
  },

  heroMeta: {
    marginTop: 3,
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.full,
  },

  statusPillActive: {
    backgroundColor: colors.tintStrong,
  },

  statusPillCompleted: {
    backgroundColor: '#EEF8F2',
  },

  heroDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 13,
  },

  heroBottom: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 10,
  },

  heroBottomItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  heroBottomText: {
    marginHorizontal: 5,
  },

  heroBottomValue: {
    flexShrink: 1,
  },

  appointmentCard: {
    marginTop: 12,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.xl,
    padding: 13,
  },

  appointmentTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  appointmentIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  appointmentBody: {
    flex: 1,
    marginHorizontal: 10,
  },

  appointmentLabelRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  appointmentTitle: {
    fontSize: 17,
    marginTop: 3,
  },

  appointmentMeta: {
    marginTop: 2,
  },

  confirmedPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.white,
  },

  appointmentFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D8E8DE',
  },

  smallLinkButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  smallLinkPressed: {
    opacity: 0.7,
  },

  section: {
    marginTop: 23,
  },

  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  sectionHeading: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 17,
  },

  sectionSubtitle: {
    marginTop: 2,
  },

  sectionAction: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginRight: 8,
  },

  detailsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingHorizontal: 13,
  },

  detailRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    minHeight: 68,
  },

  detailIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailText: {
    flex: 1,
    marginRight: 10,
  },

  detailValue: {
    marginTop: 2,
  },

  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  providerCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 12,
  },

  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  providerInfo: {
    flex: 1,
    marginHorizontal: 10,
  },

  providerSpecialty: {
    marginTop: 2,
    lineHeight: 18,
  },

  providerMeta: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 5,
  },

  notesCard: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 13,
  },

  notesIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notesText: {
    flex: 1,
    marginRight: 10,
    lineHeight: 21,
  },

  reminderCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 13,
  },

  reminderCardOverdue: {
    borderColor: '#E8CACA',
  },

  reminderTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  reminderIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reminderIconOverdue: {
    backgroundColor: '#FFF1F1',
  },

  reminderInfo: {
    flex: 1,
    marginRight: 10,
  },

  reminderTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  reminderTitle: {
    flex: 1,
  },

  reminderDatePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.tintStrong,
    marginRight: 7,
  },

  reminderDatePillOverdue: {
    backgroundColor: '#FFF1F1',
  },

  reminderMeta: {
    marginTop: 3,
  },

  reminderNotes: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    lineHeight: 18,
  },

  reminderActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 12,
    gap: 7,
  },

  reminderPrimary: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reminderSecondary: {
    flex: 1.25,
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reminderEdit: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noReminderCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 12,
  },

  noReminderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noReminderBody: {
    flex: 1,
    marginHorizontal: 9,
  },

  noReminderDescription: {
    marginTop: 2,
    lineHeight: 17,
  },

  addReminderButton: {
    minHeight: 40,
    paddingHorizontal: 11,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionsCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },

  actionRow: {
    minHeight: 70,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  actionRowPressed: {
    backgroundColor: '#FAFBF9',
  },

  actionIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIconSuccess: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: '#EEF8F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTextWrap: {
    flex: 1,
    marginHorizontal: 10,
  },

  actionDescription: {
    marginTop: 2,
    lineHeight: 17,
  },

  actionDivider: {
    height: 1,
    backgroundColor: colors.border,
  },

  bottomTrust: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginTop: 15,
    paddingHorizontal: 3,
  },

  bottomTrustText: {
    flex: 1,
    marginRight: 8,
  },

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  notFoundIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notFoundTitle: {
    marginTop: 13,
  },

  notFoundDescription: {
    marginTop: 6,
    lineHeight: 21,
  },

  primaryButton: {
    minHeight: 48,
    marginTop: 18,
    paddingHorizontal: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonPressed: {
    opacity: 0.86,
  },

  pressedCard: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.38)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 18,
  },

  modalSubtitle: {
    marginTop: 2,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldLabel: {
    marginBottom: 6,
  },

  fieldHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 13,
  },

  quickTitle: {
    marginTop: 14,
    marginBottom: 7,
  },

  quickDates: {
    flexDirection: 'row-reverse',
    gap: 7,
  },

  quickDate: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButton: {
    minHeight: 53,
    marginTop: 15,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
});