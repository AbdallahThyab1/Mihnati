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

import { categories, getCraftsman } from '../../data/mock';

const COLORS = {
  primary: '#1B4332',
  secondary: '#40916C',
  background: '#F8F9F6',
  surface: '#FFFFFF',
  text: '#1F2933',
  muted: '#6B7280',
  border: '#E5E7EB',
  rating: '#F4B942',
  success: '#2D936C',
  danger: '#D64545',
};

const formatPhoneForWhatsApp = (phone: string) =>
  phone.replace(/[^0-9]/g, '');

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'location'>('about');

  const craftsmanId = Array.isArray(id) ? id[0] : id;
  const craftsman = getCraftsman(craftsmanId || 'c1');

  const categoryLabels = useMemo(
    () =>
      craftsman.categoryIds
        .map((categoryId) => categories.find((item) => item.id === categoryId)?.label)
        .filter((label): label is string => Boolean(label)),
    [craftsman.categoryIds],
  );

  const openUrl = async (url: string, message: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('تعذر فتح الرابط', message);
    }
  };

  const handleCall = () => {
    openUrl(`tel:${craftsman.phone}`, 'تأكد من وجود تطبيق اتصال على الجهاز.');
  };

  const handleWhatsApp = () => {
    const phone = formatPhoneForWhatsApp(craftsman.phone);
    openUrl(`https://wa.me/${phone}`, 'تعذر فتح واتساب على هذا الجهاز.');
  };

  const handleDirections = () => {
    const { latitude, longitude } = craftsman;

    if (Platform.OS === 'web') {
      openUrl(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        'تعذر فتح خرائط Google.',
      );
      return;
    }

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
          `مقدم خدمة على مِهنتي\n\n${craftsman.name}\n${craftsman.specialty}\n📍 ${craftsman.area}\n⭐ ${craftsman.rating} (${craftsman.reviewCount} تقييم)\n\nرقم التواصل: ${craftsman.phone}`,
      });
    } catch {
      // User cancelled the native share sheet or the device does not support it.
    }
  };

  const handleReviews = () => {
    router.push({
      pathname: '/screens/Reviews',
      params: {
        craftsmanId: craftsman.id,
      },
    });
  };

  const handleMap = () => {
    router.push({
      pathname: '/map',
      params: {
        id: craftsman.id,
      },
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.coverWrap}>
          <Image source={{ uri: craftsman.photo }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />

          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={styles.iconButton}
              accessibilityLabel="رجوع"
            >
              <Ionicons name="arrow-forward" size={21} color={COLORS.text} />
            </Pressable>

            <View style={styles.topActions}>
              <Pressable
                onPress={handleShare}
                style={styles.iconButton}
                accessibilityLabel="مشاركة الملف"
              >
                <Ionicons name="share-social-outline" size={20} color={COLORS.text} />
              </Pressable>

              <Pressable
                onPress={() => setSaved((value) => !value)}
                style={styles.iconButton}
                accessibilityLabel={saved ? 'إزالة من المحفوظات' : 'حفظ الملف'}
              >
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={saved ? COLORS.primary : COLORS.text}
                />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.profileRow}>
            <Image source={{ uri: craftsman.photo }} style={styles.avatar} />

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={2}>
                  {craftsman.name}
                </Text>

                {craftsman.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={12} color={COLORS.surface} />
                  </View>
                )}
              </View>

              <Text style={styles.specialty}>{craftsman.specialty}</Text>

              <View style={styles.metaRow}>
                <View style={styles.ratingWrap}>
                  <Ionicons name="star" size={15} color={COLORS.rating} />
                  <Text style={styles.rating}>{craftsman.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({craftsman.reviewCount})</Text>
                </View>

                <View style={styles.dot} />

                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={15} color={COLORS.muted} />
                  <Text style={styles.metaText}>{craftsman.distanceKm.toFixed(1)} كم</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: craftsman.isOpen ? COLORS.success : COLORS.danger },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: craftsman.isOpen ? COLORS.success : COLORS.danger },
                ]}
              >
                {craftsman.isOpen ? 'مفتوح الآن' : 'مغلق الآن'}
              </Text>
            </View>

            <Text style={styles.hoursText}>{craftsman.workingHours}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable onPress={handleCall} style={styles.primaryAction}>
            <Ionicons name="call" size={18} color={COLORS.surface} />
            <Text style={styles.primaryActionText}>اتصال</Text>
          </Pressable>

          <Pressable onPress={handleWhatsApp} style={styles.secondaryAction}>
            <Ionicons name="logo-whatsapp" size={19} color={COLORS.primary} />
            <Text style={styles.secondaryActionText}>واتساب</Text>
          </Pressable>

          <Pressable onPress={handleDirections} style={styles.secondaryAction}>
            <Ionicons name="navigate-outline" size={19} color={COLORS.primary} />
            <Text style={styles.secondaryActionText}>الموقع</Text>
          </Pressable>
        </View>

        <View style={styles.tabsCard}>
          <View style={styles.tabsRow}>
            <Pressable
              onPress={() => setActiveTab('about')}
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            >
              <Text
                style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}
              >
                عن مقدم الخدمة
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('location')}
              style={[styles.tab, activeTab === 'location' && styles.activeTab]}
            >
              <Text
                style={[styles.tabText, activeTab === 'location' && styles.activeTabText]}
              >
                الموقع
              </Text>
            </Pressable>
          </View>

          {activeTab === 'about' ? (
            <View style={styles.tabContent}>
              <SectionTitle title="نبذة" />
              <Text style={styles.description}>{craftsman.description}</Text>

              <SectionTitle title="الخدمات والمجالات" />
              <View style={styles.chipsWrap}>
                {categoryLabels.map((label) => (
                  <View key={label} style={styles.chip}>
                    <Text style={styles.chipText}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.infoGrid}>
                <InfoItem
                  icon="briefcase-outline"
                  label="الخبرة"
                  value={`${craftsman.experienceYears} سنة`}
                />
                <InfoItem icon="location-outline" label="المنطقة" value={craftsman.area} />
                <InfoItem
                  icon="cash-outline"
                  label={craftsman.priceHint}
                  value={craftsman.priceValue}
                />
                <InfoItem
                  icon={craftsman.fastResponse ? 'flash-outline' : 'time-outline'}
                  label="الاستجابة"
                  value={craftsman.fastResponse ? 'سريعة' : 'حسب التوفر'}
                />
              </View>

              <View style={styles.trustBox}>
                <View style={styles.trustIcon}>
                  <Ionicons name="shield-checkmark-outline" size={21} color={COLORS.primary} />
                </View>
                <View style={styles.trustTextWrap}>
                  <Text style={styles.trustTitle}>
                    {craftsman.verified ? 'ملف موثّق على مِهنتي' : 'معلومات الملف قابلة للمراجعة'}
                  </Text>
                  <Text style={styles.trustText}>
                    {craftsman.resultInfo}
                  </Text>
                </View>
              </View>

              <Pressable onPress={handleReviews} style={styles.reviewLink}>
                <View style={styles.reviewLinkLeft}>
                  <Ionicons name="star-outline" size={19} color={COLORS.rating} />
                  <Text style={styles.reviewLinkText}>
                    مشاهدة كل التقييمات ({craftsman.reviewCount})
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={18} color={COLORS.muted} />
              </Pressable>
            </View>
          ) : (
            <View style={styles.tabContent}>
              <SectionTitle title="موقع مقدم الخدمة" />

              <View style={styles.locationCard}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.locationTextWrap}>
                  <Text style={styles.locationTitle}>{craftsman.area}</Text>
                  <Text style={styles.locationSubtitle}>
                    على بُعد {craftsman.distanceKm.toFixed(1)} كم تقريباً
                  </Text>
                </View>
              </View>

              <Pressable onPress={handleMap} style={styles.mapButton}>
                <Ionicons name="map-outline" size={20} color={COLORS.surface} />
                <Text style={styles.mapButtonText}>فتح الموقع على الخريطة</Text>
              </Pressable>

              <Text style={styles.locationHint}>
                الإحداثيات المستخدمة في النموذج التجريبي: {craftsman.latitude.toFixed(4)},{' '}
                {craftsman.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomNote}>
          <Ionicons name="information-circle-outline" size={17} color={COLORS.muted} />
          <Text style={styles.bottomNoteText}>
            تواصل مع مقدم الخدمة مباشرة وتحقق من السعر النهائي ووقت الخدمة قبل الاتفاق.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

type SectionTitleProps = {
  title: string;
};

function SectionTitle({ title }: SectionTitleProps) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

type InfoItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.infoLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 36,
  },
  coverWrap: {
    height: 190,
    position: 'relative',
    backgroundColor: '#DDE7E1',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  topBar: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229,231,235,0.9)',
  },
  mainCard: {
    marginTop: -26,
    marginHorizontal: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: COLORS.surface,
    backgroundColor: '#EEF3EF',
  },
  profileInfo: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialty: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  metaRow: {
    marginTop: 9,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  ratingWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  reviewCount: {
    color: COLORS.muted,
    fontSize: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5D1',
    marginHorizontal: 9,
  },
  metaItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  statusRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  hoursText: {
    color: COLORS.muted,
    fontSize: 12,
  },
  quickActions: {
    marginHorizontal: 14,
    marginTop: 12,
    flexDirection: 'row-reverse',
    gap: 9,
  },
  primaryAction: {
    flex: 1.1,
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryActionText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryActionText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  tabsCard: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    overflow: 'hidden',
  },
  tabsRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 49,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 9,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'right',
    marginBottom: 20,
  },
  chipsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#EEF5F0',
    borderWidth: 1,
    borderColor: '#DCEBE0',
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 16,
  },
  infoItem: {
    width: '48%',
    minHeight: 100,
    padding: 11,
    borderRadius: 15,
    backgroundColor: '#FAFBF9',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-end',
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E9F2EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    width: '100%',
    color: COLORS.muted,
    fontSize: 11,
    textAlign: 'right',
  },
  infoValue: {
    width: '100%',
    marginTop: 3,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  trustBox: {
    padding: 12,
    borderRadius: 15,
    backgroundColor: '#EDF6F0',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCEBE0',
  },
  trustIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  trustTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  trustText: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'right',
  },
  reviewLink: {
    marginTop: 13,
    minHeight: 50,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewLinkLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },
  reviewLinkText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  locationCard: {
    padding: 13,
    borderRadius: 15,
    backgroundColor: '#FAFBF9',
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E9F2EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  locationTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  locationSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'right',
  },
  mapButton: {
    marginTop: 12,
    minHeight: 49,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  mapButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: '800',
  },
  locationHint: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'right',
  },
  bottomNote: {
    marginHorizontal: 18,
    marginTop: 14,
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 7,
  },
  bottomNoteText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'right',
  },
});
