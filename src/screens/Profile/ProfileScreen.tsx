import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Award,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Clock,
  Contact,
  Navigation,
  Phone,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  WashingMachine,
  Wrench,
  MessageSquare,
  Compass,
} from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import HScroll from '../../components/HScroll';
import Chip from '../../components/Chip';
import Txt from '../../components/Txt';
import { coverPhoto, getCraftsman, priceServices, PriceService } from '../../data/mock';
import { card, colors, radius, row, shadows } from '../../styles/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabs: string[] = ['النبذة والخدمات', 'صور الأعمال (16)', 'التقييمات (128)', 'الموقع'];

function ServiceIcon({ icon }: { icon: PriceService['icon'] }) {
  if (icon === 'washer') return <WashingMachine size={20} color={colors.primary} />;
  if (icon === 'dishes') return <WashingMachine size={20} color={colors.primary} />;
  if (icon === 'settings') return <Settings size={20} color={colors.primary} />;
  return <Briefcase size={20} color={colors.primary} />;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const craftsman = getCraftsman(typeof id === 'string' ? id : 'c1');
  const [saved, setSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="الملف المهني" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1, ...row } as object}>
            <Txt variant="h3" style={{ fontSize: 19 }}>
              الملف المهني المعتمد
            </Txt>
            <View style={styles.onlineDot} />
          </View>
          <View style={row}>
            <Pressable style={styles.roundBtn} onPress={() => setSaved((v) => !v)}>
              <Bookmark size={20} color={colors.primary} fill={saved ? colors.primary : 'transparent'} />
            </Pressable>
            <Pressable style={[styles.roundBtn, { marginRight: 8 }]}>
              <Share2 size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Cover */}
        <View>
          <Image source={{ uri: coverPhoto }} style={styles.cover} />
          <View style={styles.coverBadge}>
            <ShieldCheck size={14} color={colors.success} />
            <Txt variant="labelSm" color={colors.text} style={{ marginRight: 4 }}>
              حساب مهني موثق
            </Txt>
          </View>
        </View>

        {/* Identity card */}
        <View style={[styles.identity, shadows.level2]}>
          <View style={[row, { alignItems: 'flex-start' }]}>
            <View>
              <Image source={{ uri: craftsman.photo }} style={styles.photo} />
              <View style={styles.photoBadge}>
                <BadgeCheck size={14} color={colors.white} />
              </View>
            </View>
            <View style={{ flex: 1, marginRight: 12, paddingTop: 4 }}>
              <Txt variant="h2" style={{ fontSize: 21 }}>
                {craftsman.name}
              </Txt>
              <Txt variant="small" color={colors.muted}>
                {craftsman.specialty}
              </Txt>
            </View>
          </View>
          <View style={[row, { marginTop: 14, gap: 8 }]}>
            <View style={[styles.infoPill, { backgroundColor: colors.tint }]}>
              <Navigation size={16} color={colors.primary} />
              <Txt variant="labelSm" weight="500" style={{ flex: 1, marginRight: 6 }} numberOfLines={1}>
                رام الله - {craftsman.area} (يبعد {craftsman.distanceKm} كم)
              </Txt>
            </View>
            <View style={[styles.infoPill, { backgroundColor: colors.mint }]}>
              <Clock size={16} color={colors.primary} />
              <Txt variant="labelSm" color={colors.primary} style={{ flex: 1, marginRight: 6 }} numberOfLines={1}>
                مفتوح الآن - حتى 8:00 م
              </Txt>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[row, { flex: 1, justifyContent: 'center' }]}>
              <Star size={18} color={colors.amber} fill={colors.amber} />
              <Txt variant="h4" style={{ marginHorizontal: 4 }}>
                {craftsman.rating.toFixed(1)}
              </Txt>
              <Pressable onPress={() => router.push({ pathname: '/reviews/[id]', params: { id: craftsman.id } })}>
                <Txt variant="small" color={colors.muted}>
                  ({craftsman.reviewCount} تقييم موثق)
                </Txt>
              </Pressable>
            </View>
            <View style={styles.vDivider} />
            <View style={[row, { flex: 1, justifyContent: 'center' }]}>
              <Award size={18} color={colors.primary} />
              <Txt variant="label" weight="500" style={{ marginRight: 6 }}>
                خبرة 14 سنة محلياً
              </Txt>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsWrap}>
          <HScroll>
            {tabs.map((tab, index) => (
              <Chip
                key={tab}
                label={tab}
                selected={activeTab === index}
                onPress={() => {
                  setActiveTab(index);
                  if (index === 2) router.push({ pathname: '/reviews/[id]', params: { id: craftsman.id } });
                }}
              />
            ))}
          </HScroll>
        </View>

        {/* About */}
        <View style={[styles.section, shadows.level1]}>
          <View style={row}>
            <Contact size={20} color={colors.primary} />
            <Txt variant="h3" style={{ marginRight: 8, fontSize: 19 }}>
              نبذة تعريفية
            </Txt>
          </View>
          <Txt variant="body" color={colors.text} style={{ marginTop: 8 }}>
            فني صيانة معتمد بخبرة تزيد عن 14 عاماً في صيانة كافة أنواع الغسالات الأوتوماتيك والعادية، الجلايات، والنشافات. نوفر قطع غيار أصلية مع ضمانة حقيقية، وكشفية منزلية سريعة داخل رام الله والبيرة وبيتونيا.
          </Txt>
          <View style={[row, { marginTop: 12, gap: 8 }]}>
            <View style={[styles.tag, { backgroundColor: colors.mint }]}>
              <Txt variant="labelSm" color={colors.primary}>ضمان خطي معتمد</Txt>
            </View>
            <View style={styles.tag}>
              <Txt variant="labelSm" color={colors.muted}>قطع أصلية مستوردة</Txt>
            </View>
            <View style={styles.tag}>
              <Txt variant="labelSm" color={colors.muted}>استجابة طارئة</Txt>
            </View>
          </View>
        </View>

        {/* AI quick inspection */}
        <View style={styles.aiBanner}>
          <Sparkles size={20} color={colors.mint} style={{ position: 'absolute', top: 14, right: 14 }} />
          <Txt variant="h4" color={colors.white} style={{ marginRight: 30 }}>
            خدمة الفحص السريع الذكي
          </Txt>
          <View style={[row, { marginTop: 8 }]}>
            <Pressable style={styles.sendBtn} onPress={() => router.navigate('/search')}>
              <Txt variant="label" color={colors.primary}>إرسال العطل</Txt>
            </Pressable>
            <Txt variant="small" color="#D2E6DB" style={{ flex: 1, marginRight: 12 }}>
              أرسل صوت أو فيديو للمشكلة لمهندس أسامة لتقدير العطل قبل الزيارة
            </Txt>
          </View>
        </View>

        {/* Services & prices */}
        <View style={[styles.section, shadows.level1]}>
          <View style={[row, { alignItems: 'flex-start' }]}>
            <View style={styles.wrenchCircle}>
              <Wrench size={20} color={colors.success} />
            </View>
            <Txt variant="h3" style={{ flex: 1, marginRight: 10, fontSize: 19, lineHeight: 28 }}>
              الخدمات وقائمة الأسعار الاسترشادية
            </Txt>
            <Txt variant="labelSm" weight="400" color={colors.muted}>شامل الفحص الأولي</Txt>
          </View>
          {priceServices.map((service) => (
            <View key={service.id} style={styles.service}>
              <View style={[row, { alignItems: 'flex-start' }]}>
                <View style={styles.serviceIcon}>
                  <ServiceIcon icon={service.icon} />
                </View>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Txt variant="h4" style={{ fontSize: 15, lineHeight: 22 }}>
                    {service.title}
                  </Txt>
                  <Txt variant="small" color={colors.muted}>
                    {service.description}
                  </Txt>
                  <Txt variant="labelSm" color={colors.success} style={{ marginTop: 4 }}>
                    {service.duration}
                  </Txt>
                </View>
                <View style={{ alignItems: 'flex-start', minWidth: 84 }}>
                  <Txt variant="h4" align="left">{service.priceRange}</Txt>
                  <Txt variant="labelSm" weight="400" color={colors.muted} align="left">
                    {service.priceNote}
                  </Txt>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
        <Pressable style={[styles.callBtn]}>
          <Txt variant="h4" color={colors.white} align="center" style={{ marginRight: 8 }}>
            اتصال مباشر
          </Txt>
          <Phone size={20} color={colors.white} />
        </Pressable>
        <Pressable style={styles.waBtn}>
          <Txt variant="h4" color={colors.success} align="center" style={{ marginRight: 8 }}>
            واتساب
          </Txt>
          <MessageSquare size={20} color={colors.success} />
        </Pressable>
        <Pressable style={styles.dirBtn}>
          <Compass size={22} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.tint },
  titleRow: { ...row, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.white },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 8 },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cover: { width: '100%', height: 150, backgroundColor: colors.tintStrong },
  coverBadge: {
    ...row,
    position: 'absolute',
    top: 12,
    right: 14,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  identity: {
    ...card,
    marginHorizontal: 14,
    marginTop: -34,
    padding: 14,
    borderRadius: radius.xl,
  },
  photo: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.tint, borderWidth: 3, borderColor: colors.white },
  photoBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPill: { ...row, flex: 1, borderRadius: radius.md, paddingHorizontal: 10, height: 46 },
  statsRow: {
    ...row,
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    height: 48,
    marginTop: 10,
  },
  vDivider: { width: 1, height: 22, backgroundColor: colors.border },
  tabsWrap: { marginTop: 14, marginBottom: 14 },
  section: { ...card, marginHorizontal: 14, padding: 16, marginBottom: 14, borderRadius: radius.lg },
  tag: { backgroundColor: colors.tintStrong, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  aiBanner: {
    marginHorizontal: 14,
    marginBottom: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  sendBtn: { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 16, height: 40, justifyContent: 'center' },
  wrenchCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  service: { backgroundColor: colors.tint, borderRadius: radius.md, padding: 12, marginTop: 12 },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    ...row,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  callBtn: {
    ...row,
    flex: 1.4,
    justifyContent: 'center',
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  waBtn: {
    ...row,
    flex: 1,
    justifyContent: 'center',
    height: 52,
    backgroundColor: colors.mint,
    borderRadius: radius.md,
  },
  dirBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
