import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';
import {
  BadgeCheck,
  Compass,
  Crosshair,
  Fan,
  Heart,
  LayoutGrid,
  List,
  Navigation,
  Phone,
  Plus,
  Minus,
  ShieldCheck,
  Star,
  UserSquare2,
  WashingMachine,
  Wrench,
  Zap,
  Car,
} from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import HScroll from '../../components/HScroll';
import Chip from '../../components/Chip';
import Txt from '../../components/Txt';
import PrimaryButton from '../../components/PrimaryButton';
import { getCraftsman } from '../../data/mock';
import { colors, radius, row, shadows } from '../../styles/theme';

interface MapPinData {
  id: string;
  craftsmanId: string;
  label: string;
  rating: number;
  x: number; // percent from left
  y: number; // percent from top
  kind: 'washer' | 'zap' | 'wrench' | 'car' | 'fan';
}

const pins: MapPinData[] = [
  { id: 'p1', craftsmanId: 'c1', label: 'م. أسامة', rating: 4.9, x: 36, y: 41, kind: 'washer' },
  { id: 'p2', craftsmanId: 'c2', label: 'ورشة النور', rating: 4.8, x: 58, y: 18, kind: 'zap' },
  { id: 'p3', craftsmanId: 'c9', label: 'سباكة القدس', rating: 4.7, x: 70, y: 52, kind: 'wrench' },
  { id: 'p4', craftsmanId: 'c10', label: 'المركز الفني', rating: 4.6, x: 14, y: 66, kind: 'car' },
];

const filters: string[] = ['الكل (محدد)', 'صيانة غسالات', 'كهرباء', 'سباكة'];

function PinIcon({ kind, color }: { kind: MapPinData['kind']; color: string }) {
  if (kind === 'washer') return <WashingMachine size={20} color={color} />;
  if (kind === 'zap') return <Zap size={18} color={color} />;
  if (kind === 'wrench') return <Wrench size={18} color={color} />;
  if (kind === 'car') return <Car size={18} color={color} />;
  return <Fan size={18} color={color} />;
}

// A hand-drawn stylised map (no map SDK needed): soft land, roads and neighbourhood names.
function MapBackground() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 700" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
      <Rect width="360" height="700" fill="#EEF2EA" />
      <Path d="M0 120 C80 100 120 160 200 150 C260 140 320 170 360 150 L360 0 L0 0 Z" fill="#E6EFE6" />
      <Path d="M0 520 C70 500 150 560 230 540 C290 525 330 560 360 545 L360 700 L0 700 Z" fill="#E3EEE3" />
      <Path d="M0 360 C90 330 160 380 250 360 C300 348 340 370 360 360" stroke="#D5E3D8" strokeWidth={16} fill="none" />
      <Path d="M-10 410 C80 380 170 430 250 400 C310 380 340 400 370 390" stroke="#FFFFFF" strokeWidth={9} fill="none" />
      <Path d="M0 230 L360 260" stroke="#FFFFFF" strokeWidth={6} fill="none" />
      <Path d="M30 560 L330 520" stroke="#FFFFFF" strokeWidth={6} fill="none" />
      <Path d="M170 -10 C175 150 150 300 175 420 C190 520 160 620 150 710" stroke="#FBD9B8" strokeWidth={16} fill="none" />
      <Path d="M170 -10 C175 150 150 300 175 420 C190 520 160 620 150 710" stroke="#FFEBD6" strokeWidth={10} fill="none" />
      <Path d="M250 0 C240 100 280 200 270 330" stroke="#FFFFFF" strokeWidth={5} fill="none" />
      <Path d="M60 150 C90 260 70 360 100 470" stroke="#FFFFFF" strokeWidth={4} fill="none" />
    </Svg>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<number>(0);
  const [selectedId, setSelectedId] = useState<string>('p1');
  const [liked, setLiked] = useState<boolean>(false);

  const selectedPin = pins.find((p) => p.id === selectedId) ?? pins[0];
  const selected = getCraftsman(selectedPin.craftsmanId);

  return (
    <View style={styles.screen}>
      <AppHeader />
      <View style={styles.mapArea}>
        <MapBackground />

        {/* Neighbourhood labels */}
        <Txt variant="small" weight="600" color="#8A9A90" style={[styles.place, { left: '6%', top: '56%' }]}>
          الماصيون
        </Txt>
        <Txt variant="small" weight="600" color="#8A9A90" style={[styles.place, { left: '58%', top: '60%' }]}>
          مدينة البيرة
        </Txt>
        <Txt variant="small" weight="600" color="#A5B2A9" style={[styles.place, { left: '38%', top: '14%' }]}>
          حي الإرسال
        </Txt>

        {/* User location */}
        <View style={[styles.userHalo, { left: '17%', top: '57%' }]} />
        <View style={[styles.userDot, { left: '23%', top: '60.5%' }]} />

        {/* Pins */}
        {pins.map((pin) => {
          const active = pin.id === selectedId;
          return (
            <Pressable
              key={pin.id}
              onPress={() => setSelectedId(pin.id)}
              style={[styles.pinWrap, { left: `${pin.x}%`, top: `${pin.y}%`, zIndex: active ? 5 : 1 }]}
            >
              <View style={[styles.pinLabel, active && styles.pinLabelActive, shadows.level2]}>
                <Star size={12} color={colors.amber} fill={colors.amber} />
                <Txt variant="labelSm" weight="700" color={active ? colors.white : colors.text} style={{ marginHorizontal: 3 }}>
                  {pin.rating.toFixed(1)}
                </Txt>
                <Txt variant="labelSm" color={active ? colors.white : colors.text}>
                  {pin.label}
                </Txt>
              </View>
              <View style={[styles.pinBubble, active && styles.pinBubbleActive, shadows.level2]}>
                <PinIcon kind={pin.kind} color={active ? colors.white : colors.primary} />
              </View>
              <View style={[styles.pinTail, active && { backgroundColor: colors.primary }]} />
            </Pressable>
          );
        })}

        {/* Top controls */}
        <View style={styles.topControls} pointerEvents="box-none">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث في الخريطة: كهربجي، مصلح، سباك..."
            onFilterPress={() => router.push('/results')}
          />
          <View style={{ marginTop: 10, marginHorizontal: -16 }}>
            <HScroll>
              {filters.map((label, index) => (
                <Chip
                  key={label}
                  label={label}
                  selected={activeFilter === index}
                  icon={
                    index === 0 ? (
                      <LayoutGrid size={16} color={activeFilter === 0 ? colors.white : colors.primary} />
                    ) : index === 1 ? (
                      <WashingMachine size={16} color={activeFilter === 1 ? colors.white : colors.primary} />
                    ) : index === 2 ? (
                      <Zap size={16} color={activeFilter === 2 ? colors.white : colors.amber} fill={colors.amber} />
                    ) : (
                      <Wrench size={16} color={activeFilter === 3 ? colors.white : colors.primary} />
                    )
                  }
                  onPress={() => setActiveFilter(index)}
                />
              ))}
            </HScroll>
          </View>
        </View>

        <View style={styles.available}>
          <View style={styles.availableDot} />
          <Txt variant="labelSm" color={colors.text} style={{ marginRight: 6 }}>
            الماصيون • ٢٤ حرفي متوفر
          </Txt>
        </View>

        {/* Right-side tools */}
        <View style={styles.tools}>
          <Pressable style={[styles.listBtn, shadows.level2]} onPress={() => router.push('/results')}>
            <List size={18} color={colors.text} />
            <Txt variant="labelSm" style={{ marginRight: 6 }}>
              عرض القائمة
            </Txt>
          </Pressable>
          <View style={[styles.zoom, shadows.level2]}>
            <Pressable style={styles.zoomBtn}>
              <Plus size={20} color={colors.text} />
            </Pressable>
            <View style={styles.zoomDivider} />
            <Pressable style={styles.zoomBtn}>
              <Minus size={20} color={colors.text} />
            </Pressable>
          </View>
          <Pressable style={[styles.roundTool, shadows.level2]}>
            <Crosshair size={22} color={colors.primary} />
          </Pressable>
          <Pressable style={[styles.roundTool, shadows.level2]}>
            <Compass size={22} color={colors.error} />
          </Pressable>
        </View>

        {/* Bottom sheet */}
        <View style={[styles.sheet, shadows.level3]}>
          <View style={styles.handle} />
          <View style={[row, { alignItems: 'flex-start' }]}>
            <View>
              <Image source={{ uri: selected.photo }} style={styles.sheetPhoto} />
              <View style={styles.verified}>
                <BadgeCheck size={14} color={colors.white} />
              </View>
            </View>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Txt variant="h3" numberOfLines={1}>
                {selected.name}
              </Txt>
              <View style={styles.openPill}>
                <Txt variant="labelSm" color={colors.success}>
                  {selected.isOpen ? 'مفتوح الآن' : 'مغلق الآن'}
                </Txt>
              </View>
              <Txt variant="small" color={colors.muted} numberOfLines={1}>
                {selected.description}
              </Txt>
              <View style={row}>
                <Star size={13} color={colors.amber} fill={colors.amber} />
                <Txt variant="small" weight="700" style={{ marginRight: 3 }}>
                  {selected.rating.toFixed(1)}
                </Txt>
                <Txt variant="small" color={colors.muted} style={{ marginRight: 3 }}>
                  ({selected.reviewCount} تقييم)
                </Txt>
                <Navigation size={13} color={colors.success} style={{ marginRight: 10 }} />
                <Txt variant="small" color={colors.muted} style={{ marginRight: 3 }}>
                  {selected.distanceKm} كم منك
                </Txt>
              </View>
            </View>
            <Pressable style={styles.heart} onPress={() => setLiked((value) => !value)}>
              <Heart size={20} color={colors.primary} fill={liked ? colors.primary : 'transparent'} />
            </Pressable>
          </View>

          <View style={styles.divider} />
          <View style={[row, { gap: 8 }]}>
            <View style={styles.featPill}>
              <Zap size={14} color={colors.primary} />
              <Txt variant="labelSm" weight="500" color={colors.primary} style={{ marginRight: 4 }}>
                كشف سريع وخلال ساعة
              </Txt>
            </View>
            <View style={styles.featPill}>
              <ShieldCheck size={14} color={colors.primary} />
              <Txt variant="labelSm" weight="500" color={colors.primary} style={{ marginRight: 4 }}>
                قطع غيار أصلية ومكفولة
              </Txt>
            </View>
          </View>

          <View style={[row, { marginTop: 12, gap: 10 }]}>
            <PrimaryButton
              label="عرض الملف"
              kind="tint"
              icon={<UserSquare2 size={18} color={colors.primary} />}
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: selected.id } })}
            />
            <PrimaryButton label="اتصل الآن" icon={<Phone size={18} color={colors.white} />} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  mapArea: { flex: 1, overflow: 'hidden' },
  place: { position: 'absolute' },
  topControls: { position: 'absolute', top: 12, left: 16, right: 16 },
  available: {
    ...row,
    position: 'absolute',
    top: 148,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  availableDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  tools: { position: 'absolute', top: 190, left: 16, gap: 10, alignItems: 'flex-start' },
  listBtn: {
    ...row,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  zoom: { backgroundColor: colors.white, borderRadius: radius.md, width: 48 },
  zoomBtn: { height: 46, alignItems: 'center', justifyContent: 'center' },
  zoomDivider: { height: 1, backgroundColor: colors.border },
  roundTool: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userHalo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(64,145,108,0.22)',
  },
  userDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.white,
  },
  pinWrap: { position: 'absolute', alignItems: 'center', marginLeft: -40 },
  pinLabel: {
    ...row,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 4,
  },
  pinLabelActive: { backgroundColor: colors.primary },
  pinBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBubbleActive: { backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.white, width: 46, height: 46, borderRadius: 23 },
  pinTail: {
    width: 10,
    height: 10,
    backgroundColor: colors.white,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 16,
    paddingTop: 10,
  },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 12 },
  sheetPhoto: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: colors.tint },
  verified: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mint,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    marginVertical: 2,
  },
  heart: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  featPill: {
    ...row,
    flex: 1,
    backgroundColor: colors.tint,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: 'center',
  },
});
