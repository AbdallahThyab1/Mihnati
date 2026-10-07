import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Car,
  ChevronLeft,
  Hammer,
  Paintbrush,
  Search,
  Smartphone,
  Sparkles,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';
import { categories } from '../../data/mock';
import { colors, radius, row } from '../../styles/theme';

const iconMap = {
  zap: Zap,
  briefcase: Wrench,
  car: Car,
  smartphone: Smartphone,
  wrench: Wrench,
  paint: Paintbrush,
  fan: Wrench,
  hammer: Hammer,
  brush: Wrench,
  truck: Truck,
} as const;

const descriptions: Record<string, string> = {
  electric: 'أعطال وتمديدات وإنارة',
  appliances: 'غسالات وأجهزة منزلية',
  cars: 'فحص وصيانة وأعطال',
  tech: 'هواتف وكمبيوتر وتقنية',
  plumbing: 'تسريبات ومياه وتمديدات',
  paint: 'دهان وتشطيبات وديكور',
  ac: 'صيانة وتنظيف وفحص',
  carpentry: 'أثاث وخشب وتركيبات',
  cleaning: 'تنظيف المنازل والمساحات',
  moving: 'نقل أثاث ومستلزمات',
};

export default function ExploreServicesScreen() {
  const router = useRouter();

  const openCategory = (
    categoryId: string,
    label: string,
  ) => {
    router.push({
      pathname: '/results',
      params: {
        category: categoryId,
        service: label,
      },
    });
  };

  const openAiSearch = () => {
    router.push('/search');
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title="استكشاف الخدمات" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Search
              size={22}
              color={colors.primary}
            />
          </View>

          <View style={styles.heroText}>
            <Txt
              variant="h2"
              style={styles.heroTitle}
            >
              شو الخدمة اللي تحتاجها؟
            </Txt>

            <Txt
              variant="body"
              color={colors.muted}
              style={styles.heroDescription}
            >
              اختر المجال الأقرب لاحتياجك وابدأ بمشاهدة مقدمي
              الخدمة.
            </Txt>
          </View>
        </View>

        <Pressable
          onPress={openAiSearch}
          style={({ pressed }) => [
            styles.aiCard,
            pressed && styles.cardPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="البحث بمساعد مهنتي الذكي"
        >
          <View style={styles.aiIcon}>
            <Sparkles
              size={21}
              color={colors.primary}
            />
          </View>

          <View style={styles.aiBody}>
            <View style={styles.aiTitleRow}>
              <Txt
                variant="h4"
                style={styles.aiTitle}
              >
                مش عارف اسم الخدمة؟
              </Txt>

              <View style={styles.aiBadge}>
                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                >
                  AI
                </Txt>
              </View>
            </View>

            <Txt
              variant="small"
              color={colors.muted}
              numberOfLines={2}
              style={styles.aiDescription}
            >
              احكي شو المشكلة بطريقتك، ومساعد مهنتي يساعدك توصل
              للمجال المناسب.
            </Txt>
          </View>

          <View style={styles.aiArrow}>
            <ArrowLeft
              size={17}
              color={colors.primary}
            />
          </View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Txt
              variant="h3"
              style={styles.sectionTitle}
            >
              كل الخدمات
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
              style={styles.sectionSubtitle}
            >
              اختر المجال للبدء
            </Txt>
          </View>

          <View style={styles.countBadge}>
            <Txt
              variant="labelSm"
              color={colors.primary}
              weight="700"
            >
              {categories.length}
            </Txt>
          </View>
        </View>

        <View style={styles.grid}>
          {categories.map((category) => {
            const Icon =
              iconMap[category.icon] ?? Wrench;

            return (
              <Pressable
                key={category.id}
                onPress={() =>
                  openCategory(
                    category.id,
                    category.label,
                  )
                }
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`استكشاف ${category.label}`}
              >
                <View style={styles.categoryTop}>
                  <View style={styles.categoryIcon}>
                    <Icon
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.categoryArrow}>
                    <ChevronLeft
                      size={16}
                      color={colors.muted}
                    />
                  </View>
                </View>

                <Txt
                  variant="label"
                  weight="800"
                  numberOfLines={1}
                  style={styles.categoryTitle}
                >
                  {category.label}
                </Txt>

                <Txt
                  variant="small"
                  color={colors.muted}
                  numberOfLines={2}
                  style={styles.categoryDescription}
                >
                  {descriptions[category.id] ??
                    'اكتشف مقدمي الخدمة المناسبين'}
                </Txt>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomHint}>
          <Sparkles
            size={16}
            color={colors.primary}
          />

          <Txt
            variant="small"
            color={colors.muted}
            align="center"
            style={styles.bottomHintText}
          >
            ما لقيت المجال المناسب؟ استخدم البحث الذكي ووصف
            احتياجك بطريقتك.
          </Txt>
        </View>
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
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 38,
  },

  hero: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroText: {
    flex: 1,
    marginHorizontal: 11,
  },

  heroTitle: {
    fontSize: 20,
    lineHeight: 27,
  },

  heroDescription: {
    marginTop: 3,
    lineHeight: 20,
  },

  aiCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },

  aiIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiBody: {
    flex: 1,
    marginHorizontal: 10,
  },

  aiTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  aiTitle: {
    flexShrink: 1,
  },

  aiBadge: {
    marginRight: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.mint,
  },

  aiDescription: {
    marginTop: 3,
    lineHeight: 18,
  },

  aiArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 10,
  },

  sectionTitleWrap: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
  },

  sectionSubtitle: {
    marginTop: 2,
  },

  countBadge: {
    minWidth: 30,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  categoryCard: {
    width: '48.6%',
    minHeight: 143,
    padding: 13,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },

  categoryTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryArrow: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryTitle: {
    marginTop: 13,
    fontSize: 14,
  },

  categoryDescription: {
    marginTop: 4,
    lineHeight: 18,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.992 }],
  },

  bottomHint: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 8,
  },

  bottomHintText: {
    flex: 1,
    marginRight: 7,
    lineHeight: 18,
  },
});