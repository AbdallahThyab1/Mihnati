import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, MapPin, Phone, ShieldCheck, Star } from 'lucide-react-native';
import Avatar from './Avatar';
import Txt from './Txt';
import PrimaryButton from './PrimaryButton';
import { Craftsman } from '../data/mock';
import { card, colors, radius, row, shadows } from '../styles/theme';

interface ResultCardProps {
  craftsman: Craftsman;
}

// Search result card: photo, rating, distance, a highlight line and two actions.
export default function ResultCard({ craftsman }: ResultCardProps) {
  const router = useRouter();
  const openProfile = () => router.push({ pathname: '/profile/[id]', params: { id: craftsman.id } });

  return (
    <Pressable onPress={openProfile} style={[styles.card, shadows.level1]}>
      <View style={[row, { alignItems: 'flex-start' }]}>
        <Avatar uri={craftsman.photo} size={72} verified rounded={14} />
        <View style={styles.info}>
          {craftsman.isOpen ? (
            <View style={styles.openPill}>
              <Clock size={11} color={colors.success} />
              <Txt variant="labelSm" color={colors.success} style={{ marginRight: 4 }}>
                مفتوح الآن
              </Txt>
            </View>
          ) : (
            <View style={[styles.openPill, { backgroundColor: colors.tintStrong }]}>
              <Txt variant="labelSm" color={colors.muted}>
                متاح اليوم
              </Txt>
            </View>
          )}
          <Txt variant="h4" numberOfLines={1}>
            {craftsman.name}
          </Txt>
          <Txt variant="small" color={colors.muted} numberOfLines={1}>
            {craftsman.description}
          </Txt>
          <View style={[row, { marginTop: 2 }]}>
            <Star size={13} color={colors.amber} fill={colors.amber} />
            <Txt variant="small" weight="700" style={{ marginRight: 3 }}>
              {craftsman.rating.toFixed(1)}
            </Txt>
            <Txt variant="small" color={colors.muted} style={{ marginRight: 3 }}>
              ({craftsman.reviewCount} تقييم)
            </Txt>
            <MapPin size={13} color={colors.success} style={{ marginRight: 10 }} />
            <Txt variant="small" color={colors.muted} style={{ marginRight: 3 }} numberOfLines={1}>
              {craftsman.distanceKm} كم · {craftsman.area}
            </Txt>
          </View>
        </View>
      </View>

      <View style={[row, styles.highlight]}>
        <ShieldCheck size={15} color={colors.success} />
        <Txt variant="small" color={colors.text} style={styles.highlightText} numberOfLines={1}>
          {craftsman.resultInfo}
        </Txt>
      </View>

      <View style={[row, { marginTop: 12, gap: 8 }]}>
        <PrimaryButton
          label="اتصال مباشر"
          icon={<Phone size={16} color={colors.white} />}
          style={{ flex: 1.2 }}
        />
        <PrimaryButton
          label="الملف والأسعار"
          kind="tint"
          icon={<ArrowLeft size={16} color={colors.primary} />}
          onPress={openProfile}
          style={{ flex: 1 }}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...card, padding: 14, marginHorizontal: 16, marginBottom: 12 },
  info: { flex: 1, marginRight: 12, alignItems: 'flex-end' },
  openPill: {
    ...row,
    alignSelf: 'flex-start',
    backgroundColor: colors.mintSoft,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 1,
    marginBottom: 2,
  },
  highlight: {
    backgroundColor: colors.tint,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  highlightText: { flex: 1, marginRight: 8 },
});
