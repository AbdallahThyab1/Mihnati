import React from 'react';

import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  Phone,
  Search,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';

import { getCraftsman } from '../../data/mock';
import {
  getBooking,
  type BookingStatus,
} from '../../data/bookings';

import {
  card,
  colors,
  radius,
  row,
} from '../../styles/theme';

const statusLabels: Record<
  BookingStatus,
  string
> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'تم التأكيد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const statusStyles: Record<
  BookingStatus,
  {
    backgroundColor: string;
    color: string;
  }
> = {
  pending: {
    backgroundColor:
      colors.tintStrong,
    color: colors.primary,
  },

  confirmed: {
    backgroundColor:
      '#EAF7F0',
    color: colors.success,
  },

  completed: {
    backgroundColor:
      '#EAF7F0',
    color: colors.success,
  },

  cancelled: {
    backgroundColor:
      '#FBEDEE',
    color: colors.error,
  },
};

const formatDate = (
  date: string,
): string => {
  const [year, month, day] =
    date.split('-').map(Number);

  const value = new Date(
    year,
    month - 1,
    day,
    12,
    0,
    0,
  );

  const weekdays = [
    'الأحد',
    'الاثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
    'الجمعة',
    'السبت',
  ];

  const months = [
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

  return `${weekdays[value.getDay()]}، ${day} ${
    months[month - 1]
  }`;
};

export default function BookingDetailsScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const bookingId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const booking = bookingId
    ? getBooking(bookingId)
    : undefined;

  if (!booking) {
    return (
      <View
        style={styles.screen}
      >
        <ScreenHeader
          title="تفاصيل الحجز"
        />

        <View
          style={styles.notFound}
        >
          <View
            style={
              styles.notFoundIcon
            }
          >
            <Search
              size={26}
              color={
                colors.primary
              }
            />
          </View>

          <Txt
            variant="h3"
            align="center"
            style={
              styles.notFoundTitle
            }
          >
            الحجز غير موجود
          </Txt>

          <Txt
            variant="body"
            color={colors.muted}
            align="center"
          >
            تعذر العثور على تفاصيل هذا
            الحجز.
          </Txt>

          <Pressable
            onPress={() =>
              router.replace(
                '/bookings',
              )
            }
            style={({
              pressed,
            }) => [
              styles.primaryButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Txt
              variant="label"
              weight="700"
              color={
                colors.white
              }
            >
              العودة إلى الحجوزات
            </Txt>
          </Pressable>
        </View>
      </View>
    );
  }

  const craftsman =
    getCraftsman(
      booking.craftsmanId,
    );

  const statusStyle =
    statusStyles[
      booking.status
    ];

  const contact = async () => {
    try {
      await Linking.openURL(
        `tel:${craftsman.phone}`,
      );
    } catch {
      Alert.alert(
        'تعذر بدء الاتصال',
        'تأكد من وجود تطبيق اتصال على الجهاز.',
      );
    }
  };

  const openProfile =
    () => {
      router.push({
        pathname:
          '/profile/[id]',
        params: {
          id: craftsman.id,
        },
      });
    };

  return (
    <View
      style={styles.screen}
    >
      <ScreenHeader
        title="تفاصيل الحجز"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >
        <View
          style={styles.heading}
        >
          <Txt variant="h2">
            الموعد
          </Txt>

          <Txt
            variant="body"
            color={colors.muted}
            style={
              styles.headingText
            }
          >
            كل معلومات موعدك في مكان واحد
          </Txt>
        </View>

        <View
          style={styles.statusCard}
        >
          <View
            style={
              styles.statusIcon
            }
          >
            <CalendarDays
              size={22}
              color={
                statusStyle.color
              }
            />
          </View>

          <View
            style={
              styles.statusTextWrap
            }
          >
            <Txt
              variant="small"
              color={
                colors.muted
              }
            >
              حالة الحجز
            </Txt>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    statusStyle.backgroundColor,
                },
              ]}
            >
              <Txt
                variant="labelSm"
                weight="700"
                color={
                  statusStyle.color
                }
              >
                {
                  statusLabels[
                    booking.status
                  ]
                }
              </Txt>
            </View>
          </View>
        </View>

        <View
          style={styles.cardSection}
        >
          <Txt
            variant="h3"
            style={
              styles.sectionTitle
            }
          >
            مقدم الخدمة
          </Txt>

          <View
            style={styles.providerCard}
          >
            <Image
              source={{
                uri: craftsman.photo,
              }}
              style={
                styles.providerImage
              }
            />

            <View
              style={
                styles.providerInfo
              }
            >
              <Txt
                variant="h4"
                numberOfLines={2}
              >
                {craftsman.name}
              </Txt>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
                numberOfLines={2}
              >
                {craftsman.specialty}
              </Txt>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
                style={
                  styles.providerArea
                }
              >
                {craftsman.area}
              </Txt>
            </View>
          </View>
        </View>

        <View
          style={styles.detailsCard}
        >
          <Txt
            variant="h3"
            style={
              styles.sectionTitle
            }
          >
            معلومات الموعد
          </Txt>

          <View
            style={styles.detailRow}
          >
            <CalendarDays
              size={18}
              color={
                colors.primary
              }
            />

            <View
              style={
                styles.detailText
              }
            >
              <Txt
                variant="small"
                color={
                  colors.muted
                }
              >
                التاريخ
              </Txt>

              <Txt
                variant="label"
                weight="700"
              >
                {formatDate(
                  booking.date,
                )}
              </Txt>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.detailRow}
          >
            <Clock3
              size={18}
              color={
                colors.primary
              }
            />

            <View
              style={
                styles.detailText
              }
            >
              <Txt
                variant="small"
                color={
                  colors.muted
                }
              >
                الوقت
              </Txt>

              <Txt
                variant="label"
                weight="700"
              >
                {booking.time}
              </Txt>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.detailRow}
          >
            <MapPin
              size={18}
              color={
                colors.primary
              }
            />

            <View
              style={
                styles.detailText
              }
            >
              <Txt
                variant="small"
                color={
                  colors.muted
                }
              >
                الموقع
              </Txt>

              <Txt
                variant="label"
                weight="700"
                numberOfLines={2}
              >
                {booking.location}
              </Txt>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.detailRow}
          >
            <FileText
              size={18}
              color={
                colors.primary
              }
            />

            <View
              style={
                styles.detailText
              }
            >
              <Txt
                variant="small"
                color={
                  colors.muted
                }
              >
                الخدمة
              </Txt>

              <Txt
                variant="label"
                weight="700"
                numberOfLines={2}
              >
                {booking.service}
              </Txt>
            </View>
          </View>
        </View>

        {booking.notes ? (
          <View
            style={
              styles.notesCard
            }
          >
            <Txt
              variant="h3"
              style={
                styles.sectionTitle
              }
            >
              ملاحظات
            </Txt>

            <Txt
              variant="body"
              color={
                colors.muted
              }
              style={
                styles.notesText
              }
            >
              {booking.notes}
            </Txt>
          </View>
        ) : null}

        <View
          style={styles.actions}
        >
          <Pressable
            onPress={contact}
            style={({
              pressed,
            }) => [
              styles.primaryAction,
              pressed &&
                styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`الاتصال بـ ${craftsman.name}`}
          >
            <Phone
              size={18}
              color={
                colors.white
              }
            />

            <Txt
              variant="label"
              weight="700"
              color={
                colors.white
              }
            >
              التواصل
            </Txt>
          </Pressable>

          <Pressable
            onPress={
              openProfile
            }
            style={({
              pressed,
            }) => [
              styles.secondaryAction,
              pressed &&
                styles.secondaryPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="عرض الملف المهني"
          >
            <Txt
              variant="label"
              weight="700"
              color={
                colors.primary
              }
            >
              عرض الملف
            </Txt>
          </Pressable>
        </View>

        <Txt
          variant="small"
          color={
            colors.muted
          }
          align="center"
          style={styles.hint}
        >
          يمكنك العودة إلى الحجوزات
          في أي وقت لمتابعة مواعيدك.
        </Txt>
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    content: {
      padding: 16,
      paddingBottom: 36,
    },

    heading: {
      marginBottom: 18,
    },

    headingText: {
      marginTop: 3,
    },

    statusCard: {
      ...card,
      ...row,
      alignItems:
        'center',
      backgroundColor:
        colors.white,
      padding: 14,
      marginBottom: 20,
    },

    statusIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        colors.tintStrong,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    statusTextWrap: {
      flex: 1,
      marginRight: 10,
    },

    statusPill: {
      alignSelf:
        'flex-start',
      borderRadius:
        radius.full,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginTop: 3,
    },

    cardSection: {
      marginBottom: 18,
    },

    sectionTitle: {
      marginBottom: 10,
    },

    providerCard: {
      ...card,
      ...row,
      alignItems:
        'center',
      backgroundColor:
        colors.white,
      padding: 13,
    },

    providerImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor:
        colors.tintStrong,
    },

    providerInfo: {
      flex: 1,
      minWidth: 0,
      marginRight: 12,
    },

    providerArea: {
      marginTop: 3,
    },

    detailsCard: {
      ...card,
      backgroundColor:
        colors.white,
      padding: 15,
      marginBottom: 18,
    },

    detailRow: {
      ...row,
      alignItems:
        'center',
    },

    detailText: {
      flex: 1,
      minWidth: 0,
      marginRight: 10,
    },

    divider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: 12,
    },

    notesCard: {
      ...card,
      backgroundColor:
        colors.white,
      padding: 15,
      marginBottom: 18,
    },

    notesText: {
      lineHeight: 23,
    },

    actions: {
      ...row,
      gap: 10,
      marginBottom: 14,
    },

    primaryAction: {
      flex: 1,
      minHeight: 48,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.primary,
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 7,
    },

    secondaryAction: {
      flex: 1,
      minHeight: 48,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    pressed: {
      opacity: 0.88,
    },

    secondaryPressed: {
      backgroundColor:
        colors.tint,
    },

    hint: {
      paddingHorizontal: 18,
    },

    notFound: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 28,
    },

    notFoundIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor:
        colors.tintStrong,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 16,
    },

    notFoundTitle: {
      marginBottom: 5,
    },

    primaryButton: {
      minHeight: 46,
      paddingHorizontal: 18,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.primary,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginTop: 18,
    },
  });