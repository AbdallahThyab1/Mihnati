import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheck, Zap } from 'lucide-react-native';
import Avatar from './Avatar';
import RatingPill from './RatingPill';
import Txt from './Txt';
import PrimaryButton from './PrimaryButton';
import { Craftsman } from '../data/mock';
import { card, colors, radius, row, shadows } from '../styles/theme';

interface CraftsmanCardProps {
  craftsman: Craftsman;
}

// Card used in the "nearby" list on the home screen.
export default function CraftsmanCard({ craftsman }: CraftsmanCardProps) {
  const router = useRouter();
  const openProfile = () => router.push({ pathname: '/profile/[id]', params: { id: craftsman.id } });

  return (
    <Pressable onPress={openProfile} style={[styles.card, shadows.level1]}>
      <View style={[row, { alignItems: 'flex-start' }]}>
        <Avatar uri={craftsman.photo} size={76} rounded={14} />
        <View style={styles.info}>
          <View style={row}>
            <Txt variant="h4" numberOfLines={1} style={{ flexShrink: 1 }}>
              {craftsman.name}
            </Txt>
            <BadgeCheck size={16} color={colors.success} style={{ marginRight: 4 }} />
            <View style={{ flex: 1 }} />
            <RatingPill rating={craftsman.rating} count={craftsman.reviewCount} />
          </View>
          <Txt variant="small" color={colors.muted} numberOfLines={1}>
            {craftsman.description}
          </Txt>
          <View style={[row, { marginTop: 4 }]}>
            <View style={[styles.dot, { backgroundColor: craftsman.isOpen ? colors.success : colors.muted }]} />
            <Txt variant="small" weight="600" color={craftsman.isOpen ? colors.success : colors.muted} style={{ marginRight: 4 }}>
              {craftsman.isOpen ? 'مفتوح الآن' : 'مغلق الآن'}
            </Txt>
            <Txt variant="small" color={colors.success} style={{ marginRight: 8 }}>
              • {craftsman.distanceKm} كم ({craftsman.area})
            </Txt>
          </View>
        </View>
      </View>

      <View style={[row, styles.footer]}>
        <View style={{ flex: 1 }}>
          <Txt variant="small" color={colors.muted}>
            {craftsman.priceHint}
          </Txt>
          <Txt variant="label" color={colors.text}>
            {craftsman.priceValue}
          </Txt>
        </View>
        {craftsman.fastResponse ? (
          <View style={styles.fast}>
            <Zap size={12} color={colors.success} fill={colors.success} />
            <Txt variant="labelSm" color={colors.success} style={{ marginRight: 4 }}>
              استجابة سريعة
            </Txt>
          </View>
        ) : null}
        <PrimaryButton label="عرض الملف" height={40} onPress={openProfile} style={{ minWidth: 112, marginLeft: 8 }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { ...card, padding: 14, marginHorizontal: 16, marginBottom: 12 },
  info: { flex: 1, marginRight: 12 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  footer: { marginTop: 12 },
  fast: {
    ...row,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
