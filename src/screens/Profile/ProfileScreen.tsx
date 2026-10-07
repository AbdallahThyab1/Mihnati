import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CalendarClock,
  Check,
  ChevronLeft,
  Clock3,
  MapPin,
  Share2,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react-native';

import { categories, getCraftsman } from '../../data/mock';
import { colors, radius } from '../../styles/theme';

const formatPhoneForWhatsApp = (
  phone: string,
) => phone.replace(/[^0-9]/g, '');

const openUrl = async (
  url: string,
  message: string,
) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(
      'تعذر فتح الرابط',
      message,
    );
  }
};

export default function ProfileScreen() {
  const router = useRouter();

  const {
    id,
  } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'about' | 'location'
  >('about');

  const craftsmanId = Array.isArray(id)
    ? id[0]
    : id;

  const craftsman = getCraftsman(
    craftsmanId || 'c1',
  );

  const categoryItems = useMemo(
    () =>
      craftsman.categoryIds
        .map((categoryId) =>
          categories.find(
            (item) =>
              item.id === categoryId,
          ),
        )
        .filter(
          (
            item,
          ): item is NonNullable<
            typeof item
          > => Boolean(item),
        ),
    [craftsman.categoryIds],
  );

  const categoryLabels = categoryItems.map(
    (item) => item.label,
  );

  const handleCall = () => {
    openUrl(
      `tel:${craftsman.phone}`,
      'تأكد من وجود تطبيق اتصال على الجهاز.',
    );
  };

  const handleWhatsApp = () => {
    const phone =
      formatPhoneForWhatsApp(
        craftsman.phone,
      );

    openUrl(
      `https://wa.me/${phone}`,
      'تعذر فتح واتساب على هذا الجهاز.',
    );
  };

  const handleDirections = () => {
    const {
      latitude,
      longitude,
    } = craftsman;

    openUrl(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      'تعذر فتح خرائط Google.',
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `مِهنتي - ${craftsman.name}`,
        message:
          `مقدم خدمة على مِهنتي\n\n${craftsman.name}\n${craftsman.specialty}\n📍 ${craftsman.area}\n⭐ ${craftsman.rating.toFixed(
            1,
          )} (${craftsman.reviewCount} تقييم)\n\n${craftsman.phone}`,
      });
    } catch {
      // User cancelled the native share sheet.
    }
  };

  const openReviews = () => {
    router.push({
      pathname: '/reviews',
      params: {
        craftsmanId:
          craftsman.id,
      },
    });
  };

  const openMap = () => {
    router.push({
      pathname: '/map',
      params: {
        id: craftsman.id,
      },
    });
  };

  const openBooking = (
    categoryId?: string,
  ) => {
    router.push({
      pathname:
        '/booking/[craftsmanId]',
      params: {
        craftsmanId:
          craftsman.id,
        categoryId:
          categoryId ??
          craftsman.categoryIds[0] ??
          '',
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Cover */}
        <View style={styles.cover}>
          <Image
            source={{
              uri: craftsman.photo,
            }}
            style={styles.coverImage}
          />

          <View
            style={styles.coverOverlay}
          />

          <View
            style={styles.coverTopBar}
          >
            <Pressable
              onPress={() =>
                router.back()
              }
              style={({ pressed }) => [
                styles.roundButton,
                pressed &&
                  styles.roundButtonPressed,
              ]}
              accessibilityLabel="رجوع"
            >
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.text}
              />
            </Pressable>

            <View
              style={
                styles.coverActions
              }
            >
              <Pressable
                onPress={
                  handleShare
                }
                style={({ pressed }) => [
                  styles.roundButton,
                  pressed &&
                    styles.roundButtonPressed,
                ]}
                accessibilityLabel="مشاركة الملف"
              >
                <Share2
                  size={19}
                  color={colors.text}
                />
              </Pressable>

              <Pressable
                onPress={() =>
                  setSaved(
                    (value) =>
                      !value,
                  )
                }
                style={({ pressed }) => [
                  styles.roundButton,
                  pressed &&
                    styles.roundButtonPressed,
                ]}
                accessibilityLabel={
                  saved
                    ? 'إزالة من المحفوظات'
                    : 'حفظ الملف'
                }
              >
                <Ionicons
                  name={
                    saved
                      ? 'bookmark'
                      : 'bookmark-outline'
                  }
                  size={20}
                  color={
                    saved
                      ? colors.primary
                      : colors.text
                  }
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Identity */}
        <View style={styles.identityCard}>
          <View
            style={
              styles.identityRow
            }
          >
            <View
              style={styles.avatarWrap}
            >
              <Image
                source={{
                  uri: craftsman.photo,
                }}
                style={styles.avatar}
              />
            </View>

            <View
              style={
                styles.identityInfo
              }
            >
              <View
                style={
                  styles.nameRow
                }
              >
                <Text
                  style={
                    styles.name
                  }
                  numberOfLines={2}
                >
                  {
                    craftsman.name
                  }
                </Text>

                {craftsman.verified ? (
                  <View
                    style={
                      styles.verifiedBadge
                    }
                  >
                    <Check
                      size={11}
                      color={
                        colors.white
                      }
                      strokeWidth={
                        3
                      }
                    />
                  </View>
                ) : null}
              </View>

              <Text
                style={
                  styles.specialty
                }
                numberOfLines={3}
              >
                {
                  craftsman.specialty
                }
              </Text>

              <View
                style={
                  styles.identityMeta
                }
              >
                <View
                  style={
                    styles.ratingMeta
                  }
                >
                  <Star
                    size={15}
                    color={
                      colors.rating
                    }
                    fill={
                      colors.rating
                    }
                  />

                  <Text
                    style={
                      styles.ratingValue
                    }
                  >
                    {craftsman.rating.toFixed(
                      1,
                    )}
                  </Text>

                  <Text
                    style={
                      styles.ratingCount
                    }
                  >
                    ({craftsman.reviewCount})
                  </Text>
                </View>

                <View
                  style={styles.metaDot}
                />

                <View
                  style={
                    styles.locationMeta
                  }
                >
                  <MapPin
                    size={14}
                    color={
                      colors.muted
                    }
                  />

                  <Text
                    style={
                      styles.metaText
                    }
                  >
                    {craftsman.area}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={styles.statusRow}
          >
            <View
              style={
                styles.statusLeft
              }
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      craftsman.isOpen
                        ? colors.success
                        : colors.error,
                  },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      craftsman.isOpen
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {craftsman.isOpen
                  ? 'مفتوح الآن'
                  : 'مغلق الآن'}
              </Text>
            </View>

            <View
              style={
                styles.hoursWrap
              }
            >
              <Clock3
                size={14}
                color={
                  colors.muted
                }
              />

              <Text
                style={
                  styles.hoursText
                }
              >
                {
                  craftsman.workingHours
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Primary booking */}
        <Pressable
          onPress={() =>
            openBooking()
          }
          style={({ pressed }) => [
            styles.primaryBooking,
            pressed &&
              styles.primaryBookingPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="حجز موعد مع مقدم الخدمة"
        >
          <View
            style={
              styles.primaryBookingIcon
            }
          >
            <CalendarClock
              size={22}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.primaryBookingText
            }
          >
            <Text
              style={
                styles.primaryBookingTitle
              }
            >
              حجز موعد
            </Text>

            <Text
              style={
                styles.primaryBookingSubtitle
              }
            >
              اختر الخدمة واليوم والوقت المناسب لك
            </Text>
          </View>

          <ChevronLeft
            size={21}
            color={
              colors.white
            }
          />
        </Pressable>

        {/* Contact actions */}
        <View
          style={
            styles.contactRow
          }
        >
          <Pressable
            onPress={
              handleCall
            }
            style={({ pressed }) => [
              styles.contactButton,
              pressed &&
                styles.contactPressed,
            ]}
            accessibilityLabel="الاتصال"
          >
            <Ionicons
              name="call-outline"
              size={19}
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.contactText
              }
            >
              اتصال
            </Text>
          </Pressable>

          <Pressable
            onPress={
              handleWhatsApp
            }
            style={({ pressed }) => [
              styles.contactButton,
              pressed &&
                styles.contactPressed,
            ]}
            accessibilityLabel="واتساب"
          >
            <Ionicons
              name="logo-whatsapp"
              size={19}
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.contactText
              }
            >
              واتساب
            </Text>
          </Pressable>

          <Pressable
            onPress={
              handleDirections
            }
            style={({ pressed }) => [
              styles.contactButton,
              pressed &&
                styles.contactPressed,
            ]}
            accessibilityLabel="الموقع"
          >
            <MapPin
              size={19}
              color={
                colors.primary
              }
            />

            <Text
              style={
                styles.contactText
              }
            >
              الموقع
            </Text>
          </Pressable>
        </View>

        {/* Trust */}
        <View
          style={styles.trustStrip}
        >
          <View
            style={
              styles.trustIcon
            }
          >
            <ShieldCheck
              size={20}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.trustContent
            }
          >
            <View
              style={
                styles.trustTitleRow
              }
            >
              <Text
                style={
                  styles.trustTitle
                }
              >
                {craftsman.verified
                  ? 'مقدم خدمة موثّق'
                  : 'معلومات مقدم الخدمة واضحة'}
              </Text>

              {craftsman.verified ? (
                <View
                  style={
                    styles.trustBadge
                  }
                >
                  <Check
                    size={11}
                    color={
                      colors.success
                    }
                  />

                  <Text
                    style={
                      styles.trustBadgeText
                    }
                  >
                    موثّق
                  </Text>
                </View>
              ) : null}
            </View>

            <Text
              style={
                styles.trustDescription
              }
              numberOfLines={2}
            >
              {
                craftsman.resultInfo
              }
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View
          style={
            styles.contentCard
          }
        >
          <View
            style={styles.tabs}
          >
            <Pressable
              onPress={() =>
                setActiveTab(
                  'about',
                )
              }
              style={[
                styles.tab,
                activeTab ===
                  'about' &&
                  styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab ===
                    'about' &&
                    styles.activeTabText,
                ]}
              >
                عن مقدم الخدمة
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                setActiveTab(
                  'location',
                )
              }
              style={[
                styles.tab,
                activeTab ===
                  'location' &&
                  styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab ===
                    'location' &&
                    styles.activeTabText,
                ]}
              >
                الموقع
              </Text>
            </Pressable>
          </View>

          {activeTab ===
          'about' ? (
            <View
              style={
                styles.tabContent
              }
            >
              <SectionTitle
                title="نبذة"
                subtitle="تعرف أكثر على الخدمة"
              />

              <Text
                style={
                  styles.description
                }
              >
                {
                  craftsman.description
                }
              </Text>

              <SectionTitle
                title="المجالات"
                subtitle="اختر المجال الذي تحتاجه للحجز"
              />

              <View
                style={
                  styles.serviceGrid
                }
              >
                {categoryItems.map(
                  (category) => (
                    <Pressable
                      key={
                        category.id
                      }
                      onPress={() =>
                        openBooking(
                          category.id,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.serviceChip,
                        pressed &&
                          styles.serviceChipPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`حجز ${category.label}`}
                    >
                      <View
                        style={
                          styles.serviceChipIcon
                        }
                      >
                        <Ionicons
                          name="construct-outline"
                          size={
                            16
                          }
                          color={
                            colors.primary
                          }
                        />
                      </View>

                      <Text
                        style={
                          styles.serviceChipText
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {
                          category.label
                        }
                      </Text>

                      <ChevronLeft
                        size={
                          15
                        }
                        color={
                          colors.muted
                        }
                      />
                    </Pressable>
                  ),
                )}
              </View>

              <View
                style={
                  styles.infoGrid
                }
              >
                <InfoItem
                  icon="briefcase-outline"
                  label="الخبرة"
                  value={`${craftsman.experienceYears} سنة`}
                />

                <InfoItem
                  icon="location-outline"
                  label="المنطقة"
                  value={
                    craftsman.area
                  }
                />

                <InfoItem
                  icon="cash-outline"
                  label={
                    craftsman.priceHint
                  }
                  value={
                    craftsman.priceValue
                  }
                />

                <InfoItem
                  icon={
                    craftsman.fastResponse
                      ? 'flash-outline'
                      : 'time-outline'
                  }
                  label="الاستجابة"
                  value={
                    craftsman.fastResponse
                      ? 'سريعة'
                      : 'حسب التوفر'
                  }
                />
              </View>

              <Pressable
                onPress={
                  openReviews
                }
                style={({ pressed }) => [
                  styles.reviewsButton,
                  pressed &&
                    styles.reviewsButtonPressed,
                ]}
              >
                <View
                  style={
                    styles.reviewsButtonLeft
                  }
                >
                  <View
                    style={
                      styles.reviewsIcon
                    }
                  >
                    <Star
                      size={
                        18
                      }
                      color={
                        colors.rating
                      }
                      fill={
                        colors.rating
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.reviewsTitle
                      }
                    >
                      التقييمات والمراجعات
                    </Text>

                    <Text
                      style={
                        styles.reviewsSubtitle
                      }
                    >
                      {craftsman.rating.toFixed(
                        1,
                      )}{' '}
                      من{' '}
                      {
                        craftsman.reviewCount
                      }{' '}
                      تقييم
                    </Text>
                  </View>
                </View>

                <ChevronLeft
                  size={
                    18
                  }
                  color={
                    colors.muted
                  }
                />
              </Pressable>
            </View>
          ) : (
            <View
              style={
                styles.tabContent
              }
            >
              <SectionTitle
                title="موقع مقدم الخدمة"
                subtitle="اعرف المنطقة والمسافة قبل الحجز"
              />

              <View
                style={
                  styles.locationCard
                }
              >
                <View
                  style={
                    styles.locationIcon
                  }
                >
                  <MapPin
                    size={
                      22
                    }
                    color={
                      colors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.locationInfo
                  }
                >
                  <Text
                    style={
                      styles.locationTitle
                    }
                  >
                    {
                      craftsman.area
                    }
                  </Text>

                  <Text
                    style={
                      styles.locationSubtitle
                    }
                  >
                    على بُعد{' '}
                    {craftsman.distanceKm.toFixed(
                      1,
                    )}{' '}
                    كم تقريبًا
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={
                  openMap
                }
                style={({ pressed }) => [
                  styles.mapButton,
                  pressed &&
                    styles.mapButtonPressed,
                ]}
              >
                <MapPin
                  size={
                    19
                  }
                  color={
                    colors.white
                  }
                />

                <Text
                  style={
                    styles.mapButtonText
                  }
                >
                  فتح الموقع على الخريطة
                </Text>

                <ChevronLeft
                  size={
                    18
                  }
                  color={
                    colors.white
                  }
                />
              </Pressable>

              <View
                style={
                  styles.locationFacts
                }
              >
                <View
                  style={
                    styles.locationFact
                  }
                >
                  <Text
                    style={
                      styles.locationFactLabel
                    }
                  >
                    المنطقة
                  </Text>

                  <Text
                    style={
                      styles.locationFactValue
                    }
                  >
                    {
                      craftsman.area
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.locationFactDivider
                  }
                />

                <View
                  style={
                    styles.locationFact
                  }
                >
                  <Text
                    style={
                      styles.locationFactLabel
                    }
                  >
                    المسافة
                  </Text>

                  <Text
                    style={
                      styles.locationFactValue
                    }
                  >
                    {craftsman.distanceKm.toFixed(
                      1,
                    )}{' '}
                    كم
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.coordinates
                }
              >
                الإحداثيات المستخدمة في الـDemo:{' '}
                {craftsman.latitude.toFixed(
                  4,
                )}
                ,{' '}
                {craftsman.longitude.toFixed(
                  4,
                )}
              </Text>
            </View>
          )}
        </View>

        <View
          style={
            styles.bottomNote
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={
              17
            }
            color={
              colors.muted
            }
          />

          <Text
            style={
              styles.bottomNoteText
            }
          >
            تواصل مع مقدم الخدمة عند الحاجة، وتأكد من السعر النهائي
            ووقت تنفيذ الخدمة قبل الاتفاق.
          </Text>
        </View>
      </ScrollView>

      <View
        style={
          styles.bottomBookingBar
        }
      >
        <Pressable
          onPress={() =>
            openBooking()
          }
          style={({ pressed }) => [
            styles.bottomBookingButton,
            pressed &&
              styles.bottomBookingPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="حجز موعد"
        >
          <CalendarClock
            size={
              19
            }
            color={
              colors.white
            }
          />

          <Text
            style={
              styles.bottomBookingText
            }
          >
            حجز موعد
          </Text>

          <ChevronLeft
            size={
              18
            }
            color={
              colors.white
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <View
      style={
        styles.sectionTitleWrap
      }
    >
      <Text
        style={
          styles.sectionTitle
        }
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

type InfoItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <View
      style={styles.infoItem}
    >
      <View
        style={
          styles.infoIcon
        }
      >
        <Ionicons
          name={icon}
          size={
            18
          }
          color={
            colors.primary
          }
        />
      </View>

      <Text
        style={
          styles.infoLabel
        }
        numberOfLines={
          1
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.infoValue
        }
        numberOfLines={
          2
        }
      >
        {value}
      </Text>
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
      paddingBottom: 116,
    },

    cover: {
      height: 205,
      position: 'relative',
      backgroundColor:
        '#DDE7E1',
    },

    coverImage: {
      width: '100%',
      height: '100%',
    },

    coverOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        'rgba(0,0,0,0.16)',
    },

    coverTopBar: {
      position: 'absolute',
      top: 16,
      left: 14,
      right: 14,
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
    },

    coverActions: {
      flexDirection:
        'row',
      gap: 9,
    },

    roundButton: {
      width: 42,
      height: 42,
      borderRadius:
        21,
      backgroundColor:
        'rgba(255,255,255,0.95)',
      alignItems:
        'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor:
        'rgba(229,231,235,0.9)',
    },

    roundButtonPressed: {
      opacity: 0.72,
      transform: [
        {
          scale: 0.97,
        },
      ],
    },

    identityCard: {
      marginTop: -28,
      marginHorizontal: 14,
      backgroundColor:
        colors.white,
      borderRadius:
        radius.xl,
      borderWidth: 1,
      borderColor:
        colors.border,
      padding: 14,
      position: 'relative',
    },

    identityRow: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    avatarWrap: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        colors.canvas,
      borderWidth: 4,
      borderColor:
        colors.white,
      overflow: 'hidden',
    },

    avatar: {
      width: '100%',
      height: '100%',
    },

    identityInfo: {
      flex: 1,
      marginRight: 11,
    },

    nameRow: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    name: {
      flex: 1,
      color: colors.text,
      fontSize: 20,
      lineHeight: 27,
      fontWeight:
        '800',
      textAlign:
        'right',
    },

    verifiedBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor:
        colors.secondary,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 6,
    },

    specialty: {
      marginTop: 4,
      color: colors.muted,
      fontSize: 12,
      lineHeight: 19,
      textAlign:
        'right',
    },

    identityMeta: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      marginTop: 8,
    },

    ratingMeta: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    ratingValue: {
      marginRight: 4,
      color: colors.text,
      fontSize: 13,
      fontWeight:
        '800',
    },

    ratingCount: {
      marginRight: 3,
      color: colors.muted,
      fontSize: 11,
    },

    metaDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        '#CBD5D1',
      marginHorizontal: 9,
    },

    locationMeta: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    metaText: {
      marginRight: 4,
      color: colors.muted,
      fontSize: 11,
    },

    statusRow: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginTop: 13,
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
    },

    statusLeft: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginLeft: 6,
    },

    statusText: {
      fontSize: 12,
      fontWeight:
        '700',
    },

    hoursWrap: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    hoursText: {
      marginRight: 5,
      color: colors.muted,
      fontSize: 11,
    },

    primaryBooking: {
      marginHorizontal: 14,
      marginTop: 11,
      minHeight: 63,
      paddingHorizontal: 13,
      borderRadius:
        radius.xl,
      backgroundColor:
        colors.primary,
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    primaryBookingPressed: {
      opacity: 0.86,
      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    primaryBookingIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor:
        colors.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    primaryBookingText: {
      flex: 1,
      marginHorizontal: 9,
    },

    primaryBookingTitle: {
      color: colors.white,
      fontSize: 15,
      fontWeight:
        '800',
      textAlign:
        'right',
    },

    primaryBookingSubtitle: {
      marginTop: 2,
      color: '#DCEBE3',
      fontSize: 10,
      lineHeight: 16,
      textAlign:
        'right',
    },

    contactRow: {
      flexDirection:
        'row-reverse',
      gap: 8,
      marginHorizontal: 14,
      marginTop: 9,
    },

    contactButton: {
      flex: 1,
      minHeight: 43,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    contactText: {
      marginRight: 6,
      color: colors.primary,
      fontSize: 12,
      fontWeight:
        '700',
    },

    contactPressed: {
      backgroundColor:
        '#FAFBF9',
      opacity: 0.8,
    },

    trustStrip: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      marginHorizontal: 14,
      marginTop: 11,
      padding: 11,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.tintStrong,
      borderWidth: 1,
      borderColor:
        '#DCEBE0',
    },

    trustIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        colors.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    trustContent: {
      flex: 1,
      marginRight: 9,
    },

    trustTitleRow: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    trustTitle: {
      flex: 1,
      color: colors.primary,
      fontSize: 12,
      fontWeight:
        '800',
      textAlign:
        'right',
    },

    trustBadge: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius:
        radius.full,
      backgroundColor:
        colors.white,
      marginRight: 6,
    },

    trustBadgeText: {
      marginRight: 3,
      color: colors.success,
      fontSize: 10,
      fontWeight:
        '700',
    },

    trustDescription: {
      marginTop: 3,
      color: colors.muted,
      fontSize: 10,
      lineHeight: 16,
      textAlign:
        'right',
    },

    contentCard: {
      marginHorizontal: 14,
      marginTop: 12,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.xl,
      overflow:
        'hidden',
    },

    tabs: {
      flexDirection:
        'row-reverse',
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    tab: {
      flex: 1,
      minHeight: 48,
      alignItems:
        'center',
      justifyContent:
        'center',
      borderBottomWidth: 2,
      borderBottomColor:
        'transparent',
    },

    activeTab: {
      borderBottomColor:
        colors.primary,
    },

    tabText: {
      color: colors.muted,
      fontSize: 12,
      fontWeight:
        '700',
    },

    activeTabText: {
      color: colors.primary,
    },

    tabContent: {
      padding: 15,
    },

    sectionTitleWrap: {
      marginBottom: 10,
    },

    sectionTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight:
        '800',
      textAlign:
        'right',
    },

    sectionSubtitle: {
      marginTop: 2,
      color: colors.muted,
      fontSize: 10,
      lineHeight: 16,
      textAlign:
        'right',
    },

    description: {
      color: colors.muted,
      fontSize: 12,
      lineHeight: 21,
      textAlign:
        'right',
      marginBottom: 19,
    },

    serviceGrid: {
      gap: 8,
      marginBottom: 17,
    },

    serviceChip: {
      minHeight: 49,
      paddingHorizontal: 9,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.canvas,
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    serviceChipIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        colors.white,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    serviceChipText: {
      flex: 1,
      marginHorizontal: 9,
      color: colors.text,
      fontSize: 12,
      fontWeight:
        '700',
      textAlign:
        'right',
    },

    serviceChipPressed: {
      opacity: 0.75,
      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    infoGrid: {
      flexDirection:
        'row-reverse',
      flexWrap:
        'wrap',
      gap: 8,
      marginBottom: 14,
    },

    infoItem: {
      width: '48.5%',
      minHeight: 93,
      padding: 10,
      borderRadius:
        radius.lg,
      backgroundColor:
        '#FAFBF9',
      borderWidth: 1,
      borderColor:
        colors.border,
      alignItems:
        'flex-end',
    },

    infoIcon: {
      width: 31,
      height: 31,
      borderRadius: 10,
      backgroundColor:
        '#E9F2EC',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 7,
    },

    infoLabel: {
      width: '100%',
      color: colors.muted,
      fontSize: 10,
      textAlign:
        'right',
    },

    infoValue: {
      width: '100%',
      marginTop: 3,
      color: colors.text,
      fontSize: 12,
      lineHeight: 17,
      fontWeight:
        '700',
      textAlign:
        'right',
    },

    reviewsButton: {
      minHeight: 58,
      paddingHorizontal: 10,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    reviewsButtonPressed: {
      backgroundColor:
        '#FAFBF9',
    },

    reviewsButtonLeft: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    reviewsIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        '#FFF7E7',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    reviewsTitle: {
      marginRight: 9,
      color: colors.text,
      fontSize: 12,
      fontWeight:
        '800',
      textAlign:
        'right',
    },

    reviewsSubtitle: {
      marginRight: 9,
      marginTop: 2,
      color: colors.muted,
      fontSize: 10,
      textAlign:
        'right',
    },

    locationCard: {
      minHeight: 67,
      padding: 11,
      borderRadius:
        radius.lg,
      backgroundColor:
        '#FAFBF9',
      borderWidth: 1,
      borderColor:
        colors.border,
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    locationIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      backgroundColor:
        '#E9F2EC',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    locationInfo: {
      flex: 1,
      marginRight: 9,
    },

    locationTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight:
        '800',
      textAlign:
        'right',
    },

    locationSubtitle: {
      marginTop: 2,
      color: colors.muted,
      fontSize: 10,
      textAlign:
        'right',
    },

    mapButton: {
      minHeight: 49,
      marginTop: 9,
      paddingHorizontal: 13,
      borderRadius:
        radius.lg,
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

    mapButtonPressed: {
      opacity: 0.84,
    },

    mapButtonText: {
      color: colors.white,
      fontSize: 12,
      fontWeight:
        '800',
    },

    locationFacts: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      marginTop: 10,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
    },

    locationFact: {
      flex: 1,
      alignItems:
        'flex-end',
    },

    locationFactLabel: {
      color: colors.muted,
      fontSize: 10,
    },

    locationFactValue: {
      marginTop: 2,
      color: colors.text,
      fontSize: 12,
      fontWeight:
        '700',
    },

    locationFactDivider: {
      width: 1,
      height: 28,
      backgroundColor:
        colors.border,
      marginHorizontal: 12,
    },

    coordinates: {
      marginTop: 9,
      color: colors.muted,
      fontSize: 9,
      lineHeight: 15,
      textAlign:
        'right',
    },

    bottomNote: {
      flexDirection:
        'row-reverse',
      alignItems:
        'flex-start',
      marginHorizontal: 18,
      marginTop: 13,
      gap: 7,
    },

    bottomNoteText: {
      flex: 1,
      color: colors.muted,
      fontSize: 10,
      lineHeight: 16,
      textAlign:
        'right',
    },

    bottomBookingBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 14,
      paddingTop: 9,
      paddingBottom: 11,
      backgroundColor:
        colors.canvas,
      borderTopWidth: 1,
      borderTopColor:
        colors.border,
    },

    bottomBookingButton: {
      minHeight: 52,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.primary,
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 8,
    },

    bottomBookingPressed: {
      opacity: 0.86,
    },

    bottomBookingText: {
      color: colors.white,
      fontSize: 14,
      fontWeight:
        '800',
    },
  });