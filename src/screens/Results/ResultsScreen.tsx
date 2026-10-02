import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, List, Map as MapIcon, Navigation, SlidersHorizontal, Sparkles, Stethoscope, Zap, Star, Clock } from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import HScroll from '../../components/HScroll';
import Chip from '../../components/Chip';
import ResultCard from '../../components/ResultCard';
import Txt from '../../components/Txt';
import { craftsmen, Craftsman } from '../../data/mock';
import { colors, radius, row } from '../../styles/theme';

type SortKey = 'nearest' | 'rating' | 'today';

const sortLabels: { key: SortKey; label: string }[] = [
  { key: 'nearest', label: 'الأقرب (ضمن 5 كم)' },
  { key: 'rating', label: 'الأعلى تقييماً' },
  { key: 'today', label: 'متوفر اليوم' },
];

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; ai?: string }>();
  const initial = typeof params.q === 'string' && params.q.length < 30 ? params.q : 'صيانة غسالات';
  const [query, setQuery] = useState<string>(initial);
  const [sort, setSort] = useState<SortKey>('nearest');

  const results = useMemo<Craftsman[]>(() => {
    let list = craftsmen.filter((c) => c.keywords.includes('غسالات') || c.keywords.includes('أجهزة'));
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      const words = trimmed.split(' ');
      const matched = craftsmen.filter((c) => words.some((w) => w.length > 2 && (c.name + c.keywords + c.description).includes(w)));
      if (matched.length > 0) {
        list = matched;
      }
    }
    const copy = [...list];
    if (sort === 'nearest') copy.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sort === 'rating') copy.sort((a, b) => b.rating - a.rating);
    if (sort === 'today') copy.sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
    return copy.slice(0, 6);
  }, [query, sort]);

  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={styles.searchWrap}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="ابحث عن خدمة أو مهنة..." variant="soft" />
        </View>

        <View style={{ marginTop: 10 }}>
          <HScroll>
            <Chip label="تصفية وفرز" selected icon={<SlidersHorizontal size={16} color={colors.white} />} />
            {sortLabels.map((item) => (
              <Chip
                key={item.key}
                label={item.label}
                tone="ai"
                selected={false}
                icon={
                  sort === item.key ? (
                    <Check size={15} color={colors.primary} />
                  ) : item.key === 'nearest' ? (
                    <Navigation size={14} color={colors.primary} />
                  ) : item.key === 'rating' ? (
                    <Star size={14} color={colors.primary} />
                  ) : (
                    <Clock size={14} color={colors.primary} />
                  )
                }
                onPress={() => setSort(item.key)}
              />
            ))}
          </HScroll>
        </View>

        <View style={styles.resultsHead}>
          <View style={styles.toggle}>
            <View style={[styles.toggleItem, styles.toggleActive]}>
              <List size={16} color={colors.text} />
              <Txt variant="labelSm" style={{ marginRight: 4 }}>
                قائمة
              </Txt>
            </View>
            <Pressable style={styles.toggleItem} onPress={() => router.navigate('/map')}>
              <MapIcon size={16} color={colors.muted} />
              <Txt variant="labelSm" color={colors.muted} style={{ marginRight: 4 }}>
                خريطة
              </Txt>
            </Pressable>
          </View>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={row}>
              <Txt variant="h2" style={{ fontSize: 20 }}>
                نتائج البحث
              </Txt>
              <View style={styles.liveDot} />
            </View>
            <Txt variant="small" color={colors.muted}>
              وجدنالك <Txt variant="small" weight="700">{results.length} مزود خدمة</Txt> ومحل مناسب
            </Txt>
          </View>
        </View>

        <View style={{ marginTop: 14 }}>
          {results.map((craftsman) => (
            <ResultCard key={craftsman.id} craftsman={craftsman} />
          ))}
        </View>

        <View style={styles.diag}>
          <View style={styles.diagIcon}>
            <Stethoscope size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1, marginRight: 14 }}>
            <Txt variant="h3" style={{ fontSize: 19, lineHeight: 28 }}>
              مش متأكد من العطل؟
            </Txt>
            <Txt variant="small" color={colors.muted}>
              احكي مع المساعد الذكي لمهنتي لتشخيص مشكلة الغسالة
            </Txt>
            <Pressable style={styles.diagBtn} onPress={() => router.navigate('/search')}>
              <Txt variant="labelSm" color={colors.white}>
                تشخيص سريع
              </Txt>
              <Sparkles size={12} color={colors.mint} style={{ marginRight: 4 }} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  resultsHead: { ...row, paddingHorizontal: 16, marginTop: 18, alignItems: 'flex-start' },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.tintStrong,
    borderRadius: radius.full,
    padding: 3,
    marginTop: 6,
  },
  toggleItem: { ...row, paddingHorizontal: 12, height: 32, borderRadius: radius.full },
  toggleActive: { backgroundColor: colors.white },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success, marginRight: 6 },
  diag: {
    ...row,
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.aiSurface,
  },
  diagIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diagBtn: {
    ...row,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
});
