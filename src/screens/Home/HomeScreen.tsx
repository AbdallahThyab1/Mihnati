import React, { useState } from 'react';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  ArrowUpLeft,
  HandHelping,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react-native';

import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import CategoryIcon from '../../components/CategoryIcon';
import CraftsmanCard from '../../components/CraftsmanCard';
import TrustBanner from '../../components/TrustBanner';
import Txt from '../../components/Txt';

import {
  categories,
  craftsmen,
  getCraftsman,
  topReviews,
} from '../../data/mock';

import {
  card,
  colors,
  radius,
  row,
} from '../../styles/theme';

const aiSuggestions: string[] = [
  'الغسالة بتشتغل بس ما بتعصر',
  'بدي كهربجي شاطر قريب',
  'تصليح شاشة آيفون',
];

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');

  const goToResults = (text: string) => {
    router.push({
      pathname: '/results',
      params: {
        q: text,
      },
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            GREETING
        ================================================= */}

        <View style={styles.greeting}>
          <View style={styles.cityChip}>
            <MapPin
              size={13}
              color={colors.primary}
            />

            <Txt
              variant="labelSm"
              weight="600"
              color={colors.primary}
              style={styles.cityText}
            >
              رام الله والبيرة
            </Txt>
          </View>

          <Txt
            variant="bodyLg"
            weight="600"
            color={colors.text}
            style={styles.greetingText}
          >
            مرحباً بك في مهنتي
          </Txt>
        </View>

        {/* =================================================
            HERO
        ================================================= */}

        <View style={styles.heroSection}>
          <Txt
            variant="h1"
            style={styles.heroTitle}
          >
            شو محتاج اليوم؟
          </Txt>

          <Txt
            variant="body"
            color={colors.muted}
            style={styles.heroDescription}
          >
            ابحث عن الخدمة التي تحتاجها أو احكيلنا عن مشكلتك.
          </Txt>
        </View>

        {/* =================================================
            SEARCH
        ================================================= */}

        <View style={styles.searchSection}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن خدمة أو مهني..."
            onSubmit={() =>
              goToResults(query)
            }
            onFilterPress={() =>
              router.push('/results')
            }
          />
        </View>

        {/* =================================================
            AI DISCOVERY
        ================================================= */}

        <View style={styles.aiSection}>
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <Sparkles
                  size={13}
                  color={colors.mint}
                />

                <Txt
                  variant="labelSm"
                  weight="600"
                  color={colors.mint}
                  style={styles.aiBadgeText}
                >
                  مساعد مهنتي
                </Txt>
              </View>

              <View
                style={styles.aiStatus}
              >
                <Txt
                  variant="labelSm"
                  weight="600"
                  color="#D7E9DF"
                >
                  يفهم طلبك
                </Txt>
              </View>
            </View>

            <Txt
              variant="h2"
              color={colors.white}
              style={styles.aiTitle}
            >
              مش عارف اسم الخدمة؟
            </Txt>

            <Txt
              variant="body"
              color="#D7E9DF"
              style={styles.aiDescription}
            >
              احكيلنا شو المشكلة بطريقتك، ومِهنتي بساعدك تلاقي الخدمة المناسبة.
            </Txt>

            <View style={styles.aiChips}>
              {aiSuggestions.map(
                (text) => (
                  <Pressable
                    key={text}
                    style={({ pressed }) => [
                      styles.aiChip,
                      pressed &&
                        styles.aiChipPressed,
                    ]}
                    onPress={() =>
                      router.push(
                        '/search',
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`استخدم مثال البحث: ${text}`}
                  >
                    <ArrowUpLeft
                      size={13}
                      color="#D7E9DF"
                    />

                    <Txt
                      variant="labelSm"
                      weight="500"
                      color={
                        colors.white
                      }
                      style={
                        styles.aiChipText
                      }
                    >
                      {text}
                    </Txt>
                  </Pressable>
                ),
              )}
            </View>
          </View>
        </View>

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <View style={styles.categoriesSection}>
          <SectionHeader
            title="الخدمات الأكثر طلباً"
            actionLabel="عرض الكل"
            onActionPress={() =>
              router.push('/results')
            }
          />

          <View style={styles.grid}>
            {categories.map(
              (category) => (
                <Pressable
                  key={category.id}
                  style={({ pressed }) => [
                    styles.category,
                    pressed &&
                      styles.categoryPressed,
                  ]}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/results',
                      params: {
                        q: category.label,
                      },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`استكشف ${category.label}`}
                >
                  <View
                    style={
                      styles.categoryIcon
                    }
                  >
                    <CategoryIcon
                      icon={
                        category.icon
                      }
                      color={
                        colors.primary
                      }
                      size={22}
                    />
                  </View>

                  <Txt
                    variant="labelSm"
                    weight="600"
                    align="center"
                    numberOfLines={1}
                  >
                    {category.label}
                  </Txt>
                </Pressable>
              ),
            )}
          </View>
        </View>

        {/* =================================================
            NEARBY
        ================================================= */}

        <View style={styles.nearbySection}>
          <SectionHeader
            title="قريب منك في رام الله"
            icon={
              <Navigation
                size={19}
                color={colors.primary}
              />
            }
            rightNote={
              <View
                style={styles.liveChip}
              >
                <View
                  style={
                    styles.liveDot
                  }
                />

                <Txt
                  variant="labelSm"
                  weight="600"
                  color={
                    colors.success
                  }
                  style={
                    styles.liveText
                  }
                >
                  متاحين الآن
                </Txt>
              </View>
            }
          />

          <View style={styles.nearbyList}>
            {craftsmen
              .slice(0, 3)
              .map(
                (craftsman) => (
                  <CraftsmanCard
                    key={
                      craftsman.id
                    }
                    craftsman={
                      craftsman
                    }
                  />
                ),
              )}
          </View>
        </View>

        {/* =================================================
            TOP RATED
        ================================================= */}

        <View
          style={styles.topRatedSection}
        >
          <SectionHeader
            title="الأعلى تقييماً"
            icon={
              <Trophy
                size={19}
                color={colors.amber}
              />
            }
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.topList
          }
          >
            {topReviews.map(
              (review) => {
                const craftsman =
                  getCraftsman(
                    review.craftsmanId,
                  );

                return (
                  <Pressable
                    key={review.id}
                    style={({ pressed }) => [
                      styles.topCard,
                      pressed &&
                        styles.topCardPressed,
                    ]}
                    onPress={() =>
                      router.push({
                        pathname:
                          '/profile/[id]',
                        params: {
                          id: craftsman.id,
                        },
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`عرض ملف ${craftsman.name}`}
                  >
                    <View style={styles.topHeader}>
                      <Image
                        source={{
                          uri: craftsman.photo,
                        }}
                        style={
                          styles.topPhoto
                        }
                      />

                      <View
                        style={
                          styles.topIdentity
                        }
                      >
                        <Txt
                          variant="h4"
                          numberOfLines={
                            1
                          }
                        >
                          {
                            craftsman.name
                          }
                        </Txt>

                        <View
                          style={
                            styles.ratingRow
                          }
                        >
                          <Star
                            size={12}
                            color={
                              colors.amber
                            }
                            fill={
                              colors.amber
                            }
                          />

                          <Txt
                            variant="small"
                            weight="700"
                            style={
                              styles.ratingValue
                            }
                          >
                            {craftsman.rating.toFixed(
                              1,
                            )}
                          </Txt>

                          <Txt
                            variant="small"
                            color={
                              colors.muted
                            }
                          >
                            (
                            {
                              craftsman.reviewCount
                            }{' '}
                            تقييم
                            )
                          </Txt>
                        </View>
                      </View>
                    </View>

                    <View
                      style={styles.quote}
                    >
                      <Txt
                        variant="small"
                        color={
                          colors.text
                        }
                        style={
                          styles.quoteText
                        }
                        numberOfLines={3}
                      >
                        "{review.quote}"
                      </Txt>

                      <Txt
                        variant="labelSm"
                        weight="400"
                        color={
                          colors.muted
                        }
                        align="left"
                        style={
                          styles.quoteAuthor
                        }
                      >
                        - {review.author}
                      </Txt>
                    </View>

                    <View
                      style={
                        styles.topFooter
                      }
                    >
                      <ShieldCheck
                        size={14}
                        color={
                          colors.success
                        }
                      />

                      <Txt
                        variant="labelSm"
                        weight="500"
                        color={
                          colors.success
                        }
                        style={
                          styles.topTrustText
                        }
                        numberOfLines={1}
                      >
                        {
                          review.footer
                        }
                      </Txt>

                      <View
                        style={
                          styles.contactBtn
                        }
                      >
                        <Txt
                          variant="labelSm"
                          weight="600"
                          color={
                            colors.primary
                          }
                        >
                          تواصل
                        </Txt>
                      </View>
                    </View>
                  </Pressable>
                );
              },
            )}
          </ScrollView>
        </View>

        {/* =================================================
            TRUST
        ================================================= */}

        <View
          style={styles.trustSection}
        >
          <TrustBanner
            title="الثقة تبدأ بالمعلومة الواضحة"
            text="راجع تقييمات المهني وموقعه وخدماته وساعات عمله قبل التواصل أو الحجز."
            icon={
              <HandHelping
                size={23}
                color={
                  colors.primary
                }
              />
            }
          />
        </View>
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
      paddingBottom: 36,
    },

    /* =====================================================
       GREETING
    ===================================================== */

    greeting: {
      ...row,
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 13,
    },

    greetingText: {
      flex: 1,
      marginRight: 10,
    },

    cityChip: {
      ...row,
      alignItems: 'center',
      backgroundColor:
        colors.tintStrong,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius:
        radius.full,
    },

    cityText: {
      marginRight: 4,
    },

    /* =====================================================
       HERO
    ===================================================== */

    heroSection: {
      paddingHorizontal: 16,
      marginTop: 8,
    },

    heroTitle: {
      fontSize: 28,
      lineHeight: 38,
    },

    heroDescription: {
      marginTop: 3,
      lineHeight: 22,
    },

    /* =====================================================
       SEARCH
    ===================================================== */

    searchSection: {
      paddingHorizontal: 16,
      marginTop: 17,
    },

    /* =====================================================
       AI
    ===================================================== */

    aiSection: {
      paddingHorizontal: 16,
      marginTop: 14,
    },

    aiCard: {
      backgroundColor:
        colors.primary,
      borderRadius:
        radius.xl,
      padding: 17,
    },

    aiHeader: {
      ...row,
      alignItems: 'center',
    },

    aiBadge: {
      ...row,
      alignItems: 'center',
      backgroundColor:
        'rgba(161,244,200,0.13)',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius:
        radius.full,
    },

    aiBadgeText: {
      marginRight: 4,
    },

    aiStatus: {
      backgroundColor:
        'rgba(255,255,255,0.09)',
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius:
        radius.full,
      marginLeft: 'auto',
    },

    aiTitle: {
      marginTop: 11,
    },

    aiDescription: {
      marginTop: 3,
      lineHeight: 21,
    },

    aiChips: {
      flexDirection:
        'row-reverse',
      flexWrap: 'wrap',
      gap: 7,
      marginTop: 13,
    },

    aiChip: {
      ...row,
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.10)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.15)',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius:
        radius.full,
    },

    aiChipPressed: {
      backgroundColor:
        'rgba(255,255,255,0.18)',
    },

    aiChipText: {
      marginRight: 4,
    },

    /* =====================================================
       CATEGORIES
    ===================================================== */

    categoriesSection: {
      marginTop: 24,
    },

    grid: {
      flexDirection:
        'row-reverse',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
    },

    category: {
      width: '25%',
      alignItems: 'center',
      paddingHorizontal: 4,
      paddingVertical: 5,
      marginBottom: 7,
    },

    categoryPressed: {
      opacity: 0.72,
    },

    categoryIcon: {
      width: 52,
      height: 52,
      borderRadius:
        radius.lg,
      backgroundColor:
        colors.tintStrong,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },

    /* =====================================================
       NEARBY
    ===================================================== */

    nearbySection: {
      marginTop: 22,
    },

    nearbyList: {
      paddingHorizontal: 16,
    },

    liveChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        colors.mintSoft,
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius:
        radius.full,
    },

    liveDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor:
        colors.success,
      marginRight: 5,
    },

    liveText: {
      marginLeft: 1,
    },

    /* =====================================================
       TOP RATED
    ===================================================== */

    topRatedSection: {
      marginTop: 20,
    },

    topList: {
      paddingHorizontal: 16,
      gap: 11,
      flexDirection:
        'row-reverse',
    },

    topCard: {
      ...card,
      width: 292,
      padding: 13,
    },

    topCardPressed: {
      backgroundColor:
        colors.tint,
    },

    topHeader: {
      ...row,
      alignItems: 'center',
    },

    topPhoto: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        colors.tint,
    },

    topIdentity: {
      flex: 1,
      marginRight: 10,
      minWidth: 0,
    },

    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },

    ratingValue: {
      marginRight: 3,
    },

    quote: {
      backgroundColor:
        colors.tint,
      borderRadius:
        radius.md,
      padding: 11,
      marginTop: 9,
    },

    quoteText: {
      lineHeight: 20,
      fontStyle: 'italic',
    },

    quoteAuthor: {
      marginTop: 4,
    },

    topFooter: {
      ...row,
      alignItems: 'center',
      marginTop: 10,
    },

    topTrustText: {
      flex: 1,
      marginHorizontal: 5,
    },

    contactBtn: {
      backgroundColor:
        colors.tintStrong,
      paddingHorizontal: 15,
      paddingVertical: 7,
      borderRadius:
        radius.md,
    },

    /* =====================================================
       TRUST
    ===================================================== */

    trustSection: {
      paddingHorizontal: 16,
      marginTop: 20,
    },
  });