import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle2,
  List,
  Map,
  SearchX,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import SearchBar from '../../components/SearchBar';
import ResultCard from '../../components/ResultCard';
import Txt from '../../components/Txt';
import { categories, craftsmen } from '../../data/mock';
import { colors, radius, row, shadows } from '../../styles/theme';

type SortKey = 'nearest' | 'rating' | 'today';

type SearchParams = {
  q?: string | string[];
  ai?: string | string[];
  category?: string | string[];
  keywords?: string | string[];
  service?: string | string[];
};

type AiIntent = {
  categoryId: string;
  label: string;
  terms: string[];
};

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'nearest', label: 'الأقرب' },
  { key: 'rating', label: 'الأعلى تقييماً' },
  { key: 'today', label: 'متاح اليوم' },
];

const aiHints: Array<{ categoryId: string; label: string; terms: string[] }> = [
  {
    categoryId: 'appliances',
    label: 'صيانة الأجهزة المنزلية',
    terms: ['غسالة', 'غسالات', 'نشافة', 'جلاية', 'جلايات', 'تنشيف', 'عصر', 'ماتور', 'محرك', 'بورد', 'جهاز'],
  },
  {
    categoryId: 'electric',
    label: 'أعمال الكهرباء',
    terms: ['كهرباء', 'كهربائي', 'كهربجي', 'قاطع', 'قواطع', 'تمديد', 'تمديدات', 'إنارة', 'لمبة', 'مقبس'],
  },
  {
    categoryId: 'plumbing',
    label: 'السباكة والمياه',
    terms: ['ماسورة', 'مواسير', 'ماء', 'مي', 'مياه', 'تسريب', 'تهريب', 'حنفية', 'مغسلة', 'سباكة'],
  },
  {
    categoryId: 'ac',
    label: 'التكييف والتبريد',
    terms: ['تكييف', 'مكيف', 'مكيفات', 'تبريد', 'بارد', 'بيبرد', 'ما بيبرد', 'كمبروسر', 'فريون'],
  },
  {
    categoryId: 'carpentry',
    label: 'النجارة والأثاث',
    terms: ['نجار', 'نجارة', 'خزانة', 'خزانه', 'أثاث', 'غرفة نوم', 'طاولة', 'كراسي', 'خشب'],
  },
  {
    categoryId: 'cars',
    label: 'صيانة السيارات',
    terms: ['سيارة', 'سيارات', 'ميكانيكي', 'ميكانيك', 'محرك سيارة', 'فحص كمبيوتر', 'زيت', 'فرامل'],
  },
  {
    categoryId: 'tech',
    label: 'الهواتف والتقنية',
    terms: ['آيفون', 'ايفون', 'هاتف', 'هاتفين', 'شاشة', 'جوال', 'جهاز', 'تقنية', 'كمبيوتر', 'لابتوب'],
  },
];

const getParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
};

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[^\u0600-\u06FF\u0660-\u0669a-z0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const aliases: Record<string, string[]> = {
  كهربجي: ['كهرباء', 'كهربائي', 'كهربجي'],
  كهربائي: ['كهرباء', 'كهربائي', 'كهربجي'],
  تصليح: ['صيانة', 'تصليح'],
  مصلح: ['صيانة', 'تصليح'],
  غساله: ['غسالة', 'غسالات'],
  غسالات: ['غسالة', 'غسالات'],
  ايفون: ['آيفون', 'ايفون'],
  مكيف: ['تكييف', 'مكيف', 'مكيفات'],
  سباك: ['سباكة', 'مياه', 'ماء', 'مي'],
  نجار: ['نجارة', 'خزانة', 'أثاث'],
};

const expandTerms = (terms: string[]): string[] => {
  const expanded = new Set<string>();

  terms.forEach((term) => {
    const normalizedTerm = normalize(term);
    if (!normalizedTerm) return;

    expanded.add(normalizedTerm);

    (aliases[normalizedTerm] ?? []).forEach((alias) => {
      const normalizedAlias = normalize(alias);
      if (normalizedAlias) expanded.add(normalizedAlias);
    });
  });

  return [...expanded];
};

const getCategoryFromQuery = (query: string): string => {
  const normalizedQuery = normalize(query);

  const directCategory = categories.find((category) =>
    normalizedQuery === normalize(category.label),
  );

  return directCategory?.id ?? '';
};

const detectAiIntent = (query: string, explicitCategory: string): AiIntent | null => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return null;

  const explicitCategoryMatch = categories.find(
    (category) =>
      explicitCategory === category.id ||
      normalizedQuery.includes(normalize(category.label)),
  );

  if (explicitCategoryMatch) {
    const hint = aiHints.find((item) => item.categoryId === explicitCategoryMatch.id);
    return {
      categoryId: explicitCategoryMatch.id,
      label: explicitCategoryMatch.label,
      terms: hint?.terms ?? [explicitCategoryMatch.label],
    };
  }

  const ranked = aiHints
    .map((hint) => ({
      hint,
      score: hint.terms.reduce(
        (score, term) => (normalizedQuery.includes(normalize(term)) ? score + 1 : score),
        0,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return null;

  return {
    categoryId: ranked[0].hint.categoryId,
    label: ranked[0].hint.label,
    terms: ranked[0].hint.terms,
  };
};

const scoreCraftsman = (craftsman: (typeof craftsmen)[number], terms: string[]): number => {
  const fields = {
    name: normalize(craftsman.name),
    specialty: normalize(craftsman.specialty),
    description: normalize(craftsman.description),
    keywords: normalize(craftsman.keywords),
    area: normalize(craftsman.area),
  };

  return terms.reduce((score, term) => {
    let nextScore = score;

    if (fields.name.includes(term)) nextScore += 10;
    if (fields.specialty.includes(term)) nextScore += 8;
    if (fields.keywords.includes(term)) nextScore += 7;
    if (fields.description.includes(term)) nextScore += 5;
    if (fields.area.includes(term)) nextScore += 4;

    return nextScore;
  }, 0);
};

const searchCraftsmen = (
  query: string,
  isAi: boolean,
  explicitCategory: string,
  explicitKeywords: string,
): { results: typeof craftsmen; aiIntent: AiIntent | null } => {
  const trimmed = query.trim();

  if (!trimmed && !isAi && !explicitCategory) {
    return { results: [...craftsmen], aiIntent: null };
  }

  const categoryId = explicitCategory || getCategoryFromQuery(trimmed);
  const aiIntent = isAi ? detectAiIntent(trimmed, explicitCategory) : null;

  const categoryFilter = aiIntent?.categoryId || categoryId;
  let candidates = categoryFilter
    ? craftsmen.filter((craftsman) => craftsman.categoryIds.includes(categoryFilter))
    : [...craftsmen];

  const externalKeywords = explicitKeywords
    .split(/[،,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const queryTerms = expandTerms([
    ...trimmed.split(/\s+/),
    ...externalKeywords,
    ...(aiIntent?.terms ?? []),
  ]);

  if (queryTerms.length === 0) {
    return { results: candidates, aiIntent };
  }

  const scored = candidates
    .map((craftsman) => ({
      craftsman,
      score: scoreCraftsman(craftsman, queryTerms),
    }))
    .filter((item) => item.score > 0);

  if (scored.length === 0) {
    return { results: [], aiIntent };
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.craftsman.rating !== a.craftsman.rating) return b.craftsman.rating - a.craftsman.rating;
    return a.craftsman.distanceKm - b.craftsman.distanceKm;
  });

  return {
    results: scored.map((item) => item.craftsman),
    aiIntent,
  };
};

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<SearchParams>();

  const paramQuery = getParam(params.q);
  const isAi = getParam(params.ai) === '1';
  const explicitCategory = getParam(params.category);
  const explicitKeywords = getParam(params.keywords);
  const explicitService = getParam(params.service);

  const [query, setQuery] = useState<string>(paramQuery);
  const [sort, setSort] = useState<SortKey>('nearest');
  const [mode, setMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    setQuery(paramQuery);
  }, [paramQuery]);

  const { results: matchedResults, aiIntent } = useMemo(
    () => searchCraftsmen(query, isAi, explicitCategory, explicitKeywords),
    [query, isAi, explicitCategory, explicitKeywords],
  );

  const results = useMemo(() => {
    const copy = [...matchedResults];

    if (sort === 'nearest') {
      copy.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    if (sort === 'rating') {
      copy.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
    }

    if (sort === 'today') {
      copy.sort((a, b) => {
        if (Number(b.isOpen) !== Number(a.isOpen)) {
          return Number(b.isOpen) - Number(a.isOpen);
        }
        return a.distanceKm - b.distanceKm;
      });
    }

    return copy.slice(0, 6);
  }, [matchedResults, sort]);

  const openProfile = (id: string) => {
    router.push({ pathname: '/profile/[id]', params: { id } });
  };

  const openMap = () => {
    setMode('map');
    router.push({
      pathname: '/map',
      params: {
        q: query,
        ai: isAi ? '1' : '',
        category: aiIntent?.categoryId || explicitCategory,
      },
    });
  };

  const handleSubmit = () => {
    const nextQuery = query.trim();
    router.push({
      pathname: '/results',
      params: {
        q: nextQuery,
        ai: isAi ? '1' : '',
        category: explicitCategory,
        keywords: explicitKeywords,
      },
    });
  };

  const resultTitle = isAi
    ? explicitService || aiIntent?.label || 'نتائج البحث الذكي'
    : query.trim() || 'كل الخدمات القريبة';

  return (
    <View style={styles.screen}>
      <ScreenHeader title="نتائج البحث" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن خدمة أو مهنة أو منطقة..."
            onSubmit={handleSubmit}
            onFilterPress={() => setSort('nearest')}
          />
        </View>

        {isAi && (
          <View style={[styles.aiHeader, shadows.level1]}>
            <View style={styles.aiIcon}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <View style={styles.aiText}>
              <View style={row}>
                <Txt variant="h4" style={{ flex: 1 }}>
                  فهمنا طلبك
                </Txt>
                <View style={styles.aiTag}>
                  <Txt variant="labelSm" color={colors.primary} weight="600">
                    بحث ذكي
                  </Txt>
                </View>
              </View>
              <Txt variant="small" color={colors.muted} style={{ marginTop: 3 }} numberOfLines={2}>
                {aiIntent?.label || 'سنبحث داخل خدمات ومهنيي مهنتي'}
              </Txt>
            </View>
            <CheckCircle2 size={18} color={colors.success} />
          </View>
        )}

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="h3" style={{ fontSize: 19 }}>
              {resultTitle}
            </Txt>
            <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
              {results.length > 0
                ? `عرض ${results.length} من ${matchedResults.length} نتيجة مناسبة`
                : 'لم نجد مزودين مطابقين لهذا البحث'}
            </Txt>
          </View>

          <Pressable
            style={[styles.viewToggle, mode === 'list' && styles.viewToggleActive]}
            onPress={() => setMode('list')}
          >
            <List size={18} color={mode === 'list' ? colors.white : colors.primary} />
          </Pressable>
          <Pressable style={styles.viewToggle} onPress={openMap}>
            <Map size={18} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          <View style={styles.filterIcon}>
            <SlidersHorizontal size={16} color={colors.primary} />
          </View>
          {sortOptions.map((option) => {
            const selected = sort === option.key;
            return (
              <Pressable
                key={option.key}
                style={[styles.sortChip, selected && styles.sortChipSelected]}
                onPress={() => setSort(option.key)}
              >
                <Txt
                  variant="labelSm"
                  weight="600"
                  color={selected ? colors.white : colors.text}
                >
                  {option.label}
                </Txt>
              </Pressable>
            );
          })}
        </ScrollView>

        {results.length > 0 ? (
          <View style={styles.list}>
            {results.map((craftsman) => (
              <Pressable
                key={craftsman.id}
                onPress={() => openProfile(craftsman.id)}
                style={({ pressed }) => [pressed && styles.pressedCard]}
                accessibilityRole="button"
                accessibilityLabel={`فتح ملف ${craftsman.name}`}
              >
                <ResultCard craftsman={craftsman} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={[styles.empty, shadows.level1]}>
            <View style={styles.emptyIcon}>
              <SearchX size={30} color={colors.primary} />
            </View>
            <Txt variant="h3" align="center" style={{ marginTop: 12 }}>
              ما لقينا نتيجة مطابقة
            </Txt>
            <Txt variant="body" color={colors.muted} align="center" style={{ marginTop: 6 }}>
              جرّب كلمة أبسط، اسم منطقة، أو احكيلنا المشكلة من خلال مساعد مهنتي الذكي.
            </Txt>
            <Pressable
              style={styles.aiButton}
              onPress={() => router.push({ pathname: '/search', params: { q: query } })}
            >
              <Sparkles size={18} color={colors.white} />
              <Txt variant="label" color={colors.white} weight="600" style={{ marginRight: 8 }}>
                جرّب البحث بالذكاء الاصطناعي
              </Txt>
            </Pressable>
          </View>
        )}
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
    paddingBottom: 36,
  },
  searchWrap: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  aiHeader: {
    ...row,
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.lg,
    padding: 12,
  },
  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiText: {
    flex: 1,
    marginHorizontal: 10,
  },
  aiTag: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  titleRow: {
    ...row,
    paddingHorizontal: 14,
    marginTop: 18,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewToggleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 8,
    alignItems: 'center',
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortChip: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  list: {
    paddingHorizontal: 14,
    gap: 12,
  },
  pressedCard: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  empty: {
    marginHorizontal: 14,
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButton: {
    ...row,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 46,
    paddingHorizontal: 16,
    marginTop: 18,
    justifyContent: 'center',
  },
});
