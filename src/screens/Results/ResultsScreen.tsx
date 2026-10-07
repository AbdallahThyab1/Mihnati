import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  CheckCircle2,
  ChevronLeft,
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

import {
  categories,
  craftsmen,
} from '../../data/mock';

import {
  colors,
  radius,
  row,
  shadows,
} from '../../styles/theme';

/* =========================================================
   TYPES
========================================================= */

type SortKey =
  | 'nearest'
  | 'rating'
  | 'today';

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

/* =========================================================
   CONSTANTS
========================================================= */

const sortOptions: {
  key: SortKey;
  label: string;
}[] = [
  {
    key: 'nearest',
    label: 'الأقرب',
  },
  {
    key: 'rating',
    label: 'الأعلى تقييماً',
  },
  {
    key: 'today',
    label: 'متاح اليوم',
  },
];

const aiHints: Array<{
  categoryId: string;
  label: string;
  terms: string[];
}> = [
  {
    categoryId: 'appliances',
    label: 'صيانة الأجهزة المنزلية',
    terms: [
      'غسالة',
      'غسالات',
      'نشافة',
      'جلاية',
      'جلايات',
      'تنشيف',
      'عصر',
      'ماتور',
      'محرك',
      'بورد',
      'جهاز',
    ],
  },

  {
    categoryId: 'electric',
    label: 'أعمال الكهرباء',
    terms: [
      'كهرباء',
      'كهربائي',
      'كهربجي',
      'قاطع',
      'قواطع',
      'تمديد',
      'تمديدات',
      'إنارة',
      'لمبة',
      'مقبس',
    ],
  },

  {
    categoryId: 'plumbing',
    label: 'السباكة والمياه',
    terms: [
      'ماسورة',
      'مواسير',
      'ماء',
      'مي',
      'مياه',
      'تسريب',
      'تهريب',
      'حنفية',
      'مغسلة',
      'سباكة',
    ],
  },

  {
    categoryId: 'ac',
    label: 'التكييف والتبريد',
    terms: [
      'تكييف',
      'مكيف',
      'مكيفات',
      'تبريد',
      'بارد',
      'بيبرد',
      'ما بيبرد',
      'كمبروسر',
      'فريون',
    ],
  },

  {
    categoryId: 'carpentry',
    label: 'النجارة والأثاث',
    terms: [
      'نجار',
      'نجارة',
      'خزانة',
      'خزانه',
      'أثاث',
      'غرفة نوم',
      'طاولة',
      'كراسي',
      'خشب',
    ],
  },

  {
    categoryId: 'cars',
    label: 'صيانة السيارات',
    terms: [
      'سيارة',
      'سيارات',
      'ميكانيكي',
      'ميكانيك',
      'محرك سيارة',
      'فحص كمبيوتر',
      'زيت',
      'فرامل',
    ],
  },

  {
    categoryId: 'tech',
    label: 'الهواتف والتقنية',
    terms: [
      'آيفون',
      'ايفون',
      'هاتف',
      'هاتفين',
      'شاشة',
      'جوال',
      'جهاز',
      'تقنية',
      'كمبيوتر',
      'لابتوب',
    ],
  },
];

/* =========================================================
   PARAM HELPERS
========================================================= */

const getParam = (
  value:
    | string
    | string[]
    | undefined,
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
};

/* =========================================================
   NORMALIZATION
========================================================= */

const normalize = (
  value: string,
): string =>
  value
    .toLowerCase()
    .replace(
      /[\u064B-\u065F\u0670]/g,
      '',
    )
    .replace(
      /[إأآٱ]/g,
      'ا',
    )
    .replace(
      /ى/g,
      'ي',
    )
    .replace(
      /ة/g,
      'ه',
    )
    .replace(
      /[ًٌٍَُِّْـ]/g,
      '',
    )
    .replace(
      /[^\u0600-\u06FF\u0660-\u0669a-z0-9]+/gi,
      ' ',
    )
    .replace(
      /\s+/g,
      ' ',
    )
    .trim();

/* =========================================================
   ALIASES
========================================================= */

const aliases: Record<
  string,
  string[]
> = {
  كهربجي: [
    'كهرباء',
    'كهربائي',
    'كهربجي',
  ],

  كهربائي: [
    'كهرباء',
    'كهربائي',
    'كهربجي',
  ],

  تصليح: [
    'صيانة',
    'تصليح',
  ],

  مصلح: [
    'صيانة',
    'تصليح',
  ],

  غساله: [
    'غسالة',
    'غسالات',
  ],

  غسالات: [
    'غسالة',
    'غسالات',
  ],

  ايفون: [
    'آيفون',
    'ايفون',
  ],

  مكيف: [
    'تكييف',
    'مكيف',
    'مكيفات',
  ],

  سباك: [
    'سباكة',
    'مياه',
    'ماء',
    'مي',
  ],

  نجار: [
    'نجارة',
    'خزانة',
    'أثاث',
  ],
};

/* =========================================================
   TERM EXPANSION
========================================================= */

const expandTerms = (
  terms: string[],
): string[] => {
  const expanded =
    new Set<string>();

  terms.forEach(
    (term) => {
      const normalizedTerm =
        normalize(term);

      if (!normalizedTerm) {
        return;
      }

      expanded.add(
        normalizedTerm,
      );

      (
        aliases[
          normalizedTerm
        ] ?? []
      ).forEach(
        (alias) => {
          const normalizedAlias =
            normalize(alias);

          if (
            normalizedAlias
          ) {
            expanded.add(
              normalizedAlias,
            );
          }
        },
      );
    },
  );

  return [
    ...expanded,
  ];
};

/* =========================================================
   CATEGORY DETECTION
========================================================= */

const getCategoryFromQuery = (
  query: string,
): string => {
  const normalizedQuery =
    normalize(query);

  const directCategory =
    categories.find(
      (category) =>
        normalizedQuery ===
        normalize(
          category.label,
        ),
    );

  return (
    directCategory?.id ??
    ''
  );
};

/* =========================================================
   AI INTENT DETECTION
========================================================= */

const detectAiIntent = (
  query: string,
  explicitCategory: string,
): AiIntent | null => {
  const normalizedQuery =
    normalize(query);

  if (!normalizedQuery) {
    return null;
  }

  const explicitCategoryMatch =
    categories.find(
      (category) =>
        explicitCategory ===
          category.id ||
        normalizedQuery.includes(
          normalize(
            category.label,
          ),
        ),
    );

  if (explicitCategoryMatch) {
    const hint =
      aiHints.find(
        (item) =>
          item.categoryId ===
          explicitCategoryMatch.id,
      );

    return {
      categoryId:
        explicitCategoryMatch.id,
      label:
        explicitCategoryMatch.label,
      terms:
        hint?.terms ??
        [
          explicitCategoryMatch.label,
        ],
    };
  }

  const ranked = aiHints
    .map((hint) => ({
      hint,
      score:
        hint.terms.reduce(
          (
            score,
            term,
          ) =>
            normalizedQuery.includes(
              normalize(term),
            )
              ? score + 1
              : score,
          0,
        ),
    }))
    .filter(
      (item) =>
        item.score > 0,
    )
    .sort(
      (a, b) =>
        b.score - a.score,
    );

  if (
    ranked.length === 0
  ) {
    return null;
  }

  return {
    categoryId:
      ranked[0].hint
        .categoryId,
    label:
      ranked[0].hint.label,
    terms:
      ranked[0].hint.terms,
  };
};

/* =========================================================
   PROVIDER SCORING
========================================================= */

const scoreCraftsman = (
  craftsman:
    (typeof craftsmen)[number],
  terms: string[],
): number => {
  const fields = {
    name: normalize(
      craftsman.name,
    ),

    specialty:
      normalize(
        craftsman.specialty,
      ),

    description:
      normalize(
        craftsman.description,
      ),

    keywords:
      normalize(
        craftsman.keywords,
      ),

    area: normalize(
      craftsman.area,
    ),
  };

  return terms.reduce(
    (score, term) => {
      let nextScore =
        score;

      if (
        fields.name.includes(
          term,
        )
      ) {
        nextScore += 10;
      }

      if (
        fields.specialty.includes(
          term,
        )
      ) {
        nextScore += 8;
      }

      if (
        fields.keywords.includes(
          term,
        )
      ) {
        nextScore += 7;
      }

      if (
        fields.description.includes(
          term,
        )
      ) {
        nextScore += 5;
      }

      if (
        fields.area.includes(
          term,
        )
      ) {
        nextScore += 4;
      }

      return nextScore;
    },
    0,
  );
};

/* =========================================================
   SEARCH
========================================================= */

const searchCraftsmen = (
  query: string,
  isAi: boolean,
  explicitCategory: string,
  explicitKeywords: string,
): {
  results: typeof craftsmen;
  aiIntent:
    | AiIntent
    | null;
} => {
  const trimmed =
    query.trim();

  if (
    !trimmed &&
    !isAi &&
    !explicitCategory
  ) {
    return {
      results: [
        ...craftsmen,
      ],
      aiIntent: null,
    };
  }

  const categoryId =
    explicitCategory ||
    getCategoryFromQuery(
      trimmed,
    );

  const aiIntent = isAi
    ? detectAiIntent(
        trimmed,
        explicitCategory,
      )
    : null;

  const categoryFilter =
    aiIntent?.categoryId ||
    categoryId;

  let candidates =
    categoryFilter
      ? craftsmen.filter(
          (craftsman) =>
            craftsman.categoryIds.includes(
              categoryFilter,
            ),
        )
      : [
          ...craftsmen,
        ];

  const externalKeywords =
    explicitKeywords
      .split(
        /[،,\s]+/,
      )
      .map(
        (item) =>
          item.trim(),
      )
      .filter(Boolean);

  const queryTerms =
    expandTerms([
      ...trimmed.split(
        /\s+/,
      ),
      ...externalKeywords,
      ...(aiIntent?.terms ??
        []),
    ]);

  if (
    queryTerms.length ===
    0
  ) {
    return {
      results: candidates,
      aiIntent,
    };
  }

  const scored = candidates
    .map(
      (craftsman) => ({
        craftsman,
        score:
          scoreCraftsman(
            craftsman,
            queryTerms,
          ),
      }),
    )
    .filter(
      (item) =>
        item.score > 0,
    );

  if (
    scored.length === 0
  ) {
    return {
      results: [],
      aiIntent,
    };
  }

  scored.sort(
    (a, b) => {
      if (
        b.score !==
        a.score
      ) {
        return (
          b.score -
          a.score
        );
      }

      if (
        b.craftsman.rating !==
        a.craftsman.rating
      ) {
        return (
          b.craftsman.rating -
          a.craftsman.rating
        );
      }

      return (
        a.craftsman.distanceKm -
        b.craftsman
          .distanceKm
      );
    },
  );

  return {
    results:
      scored.map(
        (item) =>
          item.craftsman,
      ),
    aiIntent,
  };
};

/* =========================================================
   SCREEN
========================================================= */

export default function ResultsScreen() {
  const router =
    useRouter();

  const params =
    useLocalSearchParams<SearchParams>();

  const paramQuery =
    getParam(params.q);

  const isAi =
    getParam(params.ai) ===
    '1';

  const explicitCategory =
    getParam(
      params.category,
    );

  const explicitKeywords =
    getParam(
      params.keywords,
    );

  const explicitService =
    getParam(params.service);

  const [query, setQuery] =
    useState<string>(
      paramQuery,
    );

  const [sort, setSort] =
    useState<SortKey>(
      'nearest',
    );

  const [mode, setMode] =
    useState<
      'list' | 'map'
    >('list');

  /* =======================================================
     PARAM SYNC
  ======================================================= */

  useEffect(() => {
    setQuery(
      paramQuery,
    );
  }, [paramQuery]);

  /* =======================================================
     SEARCH RESULTS
  ======================================================= */

  const {
    results:
      matchedResults,
    aiIntent,
  } =
    useMemo(
      () =>
        searchCraftsmen(
          query,
          isAi,
          explicitCategory,
          explicitKeywords,
        ),
      [
        query,
        isAi,
        explicitCategory,
        explicitKeywords,
      ],
    );

  /* =======================================================
     SORT
  ======================================================= */

  const results =
    useMemo(() => {
      const copy = [
        ...matchedResults,
      ];

      if (
        sort ===
        'nearest'
      ) {
        copy.sort(
          (a, b) =>
            a.distanceKm -
            b.distanceKm,
        );
      }

      if (
        sort ===
        'rating'
      ) {
        copy.sort(
          (a, b) => {
            if (
              b.rating !==
              a.rating
            ) {
              return (
                b.rating -
                a.rating
              );
            }

            return (
              b.reviewCount -
              a.reviewCount
            );
          },
        );
      }

      if (
        sort ===
        'today'
      ) {
        copy.sort(
          (a, b) => {
            if (
              Number(
                b.isOpen,
              ) !==
              Number(
                a.isOpen,
              )
            ) {
              return (
                Number(
                  b.isOpen,
                ) -
                Number(
                  a.isOpen,
                )
              );
            }

            return (
              a.distanceKm -
              b.distanceKm
            );
          },
        );
      }

      return copy.slice(
        0,
        6,
      );
    }, [
      matchedResults,
      sort,
    ]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const openProfile = (
    id: string,
  ) => {
    router.push({
      pathname:
        '/profile/[id]',
      params: {
        id,
      },
    });
  };

  const openMap = () => {
    setMode(
      'map',
    );

    router.push({
      pathname: '/map',
      params: {
        q: query,
        ai: isAi
          ? '1'
          : '',
        category:
          aiIntent?.categoryId ||
          explicitCategory,
      },
    });
  };

  const handleSubmit = () => {
    const nextQuery =
      query.trim();

    router.push({
      pathname: '/results',
      params: {
        q: nextQuery,
        ai: isAi
          ? '1'
          : '',
        category:
          explicitCategory,
        keywords:
          explicitKeywords,
      },
    });
  };

  /* =======================================================
     DISPLAY
  ======================================================= */

  const resultTitle =
    isAi
      ? explicitService ||
        aiIntent?.label ||
        'نتائج البحث الذكي'
      : query.trim() ||
        'كل الخدمات القريبة';

  const resultSubtitle =
    results.length > 0
      ? `عرض ${results.length} من ${matchedResults.length} نتيجة مناسبة`
      : 'لم نجد مزودين مطابقين لهذا البحث';

  return (
    <View
      style={
        styles.screen
      }
    >
      <ScreenHeader
        title="نتائج البحث"
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* =================================================
            SEARCH
        ================================================= */}

        <View
          style={
            styles.searchWrap
          }
        >
          <SearchBar
            value={query}
            onChangeText={
              setQuery
            }
            placeholder="ابحث عن خدمة أو مهنة أو منطقة..."
            onSubmit={
              handleSubmit
            }
            onFilterPress={() =>
              setSort(
                'nearest',
              )
            }
          />
        </View>

        {/* =================================================
            AI CONTEXT
        ================================================= */}

        {isAi && (
          <View
            style={
              styles.aiCard
            }
          >
            <View
              style={
                styles.aiIcon
              }
            >
              <Sparkles
                size={18}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={
                styles.aiContent
              }
            >
              <View
                style={
                  styles.aiTitleRow
                }
              >
                <Txt
                  variant="h4"
                  style={
                    styles.aiTitle
                  }
                >
                  فهمنا طلبك
                </Txt>

                <View
                  style={
                    styles.aiTag
                  }
                >
                  <Txt
                    variant="labelSm"
                    weight="700"
                    color={
                      colors.primary
                    }
                  >
                    بحث ذكي
                  </Txt>
                </View>
              </View>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
                style={
                  styles.aiDescription
                }
                numberOfLines={2}
              >
                {aiIntent?.label ||
                  explicitService ||
                  'سنبحث داخل خدمات ومهنيي مهنتي'}
              </Txt>
            </View>

            <View
              style={
                styles.aiCheck
              }
            >
              <CheckCircle2
                size={18}
                color={
                  colors.success
                }
              />
            </View>
          </View>
        )}

        {/* =================================================
            RESULT HEADER
        ================================================= */}

        <View
          style={
            styles.resultHeader
          }
        >
          <View
            style={
              styles.resultHeaderText
            }
          >
            <Txt
              variant="h3"
              style={
                styles.resultTitle
              }
              numberOfLines={2}
            >
              {resultTitle}
            </Txt>

            <Txt
              variant="small"
              color={
                colors.muted
              }
              style={
                styles.resultSubtitle
              }
            >
              {resultSubtitle}
            </Txt>
          </View>

          {/* VIEW SWITCHER */}

          <View
            style={
              styles.viewSwitcher
            }
          >
            <Pressable
              style={[
                styles.viewOption,
                mode ===
                  'list' &&
                  styles.viewOptionActive,
              ]}
              onPress={() =>
                setMode(
                  'list',
                )
              }
              accessibilityRole="button"
              accessibilityLabel="عرض القائمة"
            >
              <List
                size={17}
                color={
                  mode ===
                  'list'
                    ? colors.white
                    : colors.primary
                }
              />

              <Txt
                variant="labelSm"
                weight="700"
                color={
                  mode ===
                  'list'
                    ? colors.white
                    : colors.primary
                }
              >
                قائمة
              </Txt>
            </Pressable>

            <Pressable
              style={[
                styles.viewOption,
                mode ===
                  'map' &&
                  styles.viewOptionActive,
              ]}
              onPress={
                openMap
              }
              accessibilityRole="button"
              accessibilityLabel="عرض الخريطة"
            >
              <Map
                size={17}
                color={
                  colors.primary
                }
              />

              <Txt
                variant="labelSm"
                weight="700"
                color={
                  colors.primary
                }
              >
                خريطة
              </Txt>
            </Pressable>
          </View>
        </View>

        {/* =================================================
            RESULT CONTEXT
        ================================================= */}

        {matchedResults.length >
          0 && (
          <View
            style={
              styles.contextRow
            }
          >
            <View
              style={
                styles.resultCountBadge
              }
            >
              <View
                style={
                  styles.resultDot
                }
              />

              <Txt
                variant="labelSm"
                weight="700"
                color={
                  colors.text
                }
              >
                {
                  matchedResults.length
                }
              </Txt>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
                style={
                  styles.resultCountText
                }
              >
                مزود خدمة
              </Txt>
            </View>

            {aiIntent && (
              <View
                style={
                  styles.intentBadge
                }
              >
                <Sparkles
                  size={13}
                  color={
                    colors.primary
                  }
                />

                <Txt
                  variant="labelSm"
                  weight="600"
                  color={
                    colors.primary
                  }
                  style={
                    styles.intentText
                  }
                  numberOfLines={1}
                >
                  {aiIntent.label}
                </Txt>
              </View>
            )}
          </View>
        )}

        {/* =================================================
            SORT
        ================================================= */}

        <View
          style={
            styles.sortSection
          }
        >
          <View
            style={
              styles.sortHeader
            }
          >
            <SlidersHorizontal
              size={15}
              color={
                colors.primary
              }
            />

            <Txt
              variant="labelSm"
              weight="700"
              color={
                colors.muted
              }
              style={
                styles.sortLabel
              }
            >
              ترتيب النتائج
            </Txt>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.sortRow
            }
          >
            {sortOptions.map(
              (
                option,
              ) => {
                const selected =
                  sort ===
                  option.key;

                return (
                  <Pressable
                    key={
                      option.key
                    }
                    style={({ pressed }) => [
                      styles.sortChip,
                      selected &&
                        styles.sortChipSelected,
                      pressed &&
                        styles.sortChipPressed,
                    ]}
                    onPress={() =>
                      setSort(
                        option.key,
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`ترتيب حسب ${option.label}`}
                    accessibilityState={{
                      selected,
                    }}
                  >
                    <Txt
                      variant="labelSm"
                      weight="600"
                      color={
                        selected
                          ? colors.white
                          : colors.text
                      }
                    >
                      {
                        option.label
                      }
                    </Txt>
                  </Pressable>
                );
              },
            )}
          </ScrollView>
        </View>

        {/* =================================================
            RESULTS
        ================================================= */}

        {results.length >
        0 ? (
          <View
            style={
              styles.list
            }
          >
            {results.map(
              (
                craftsman,
                index,
              ) => (
                <Pressable
                  key={
                    craftsman.id
                  }
                  onPress={() =>
                    openProfile(
                      craftsman.id,
                    )
                  }
                  style={({ pressed }) => [
                    styles.resultItem,
                    pressed &&
                      styles.resultItemPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`فتح ملف ${craftsman.name}`}
                >
                  <View
                    style={
                      styles.resultRank
                    }
                  >
                    <Txt
                      variant="labelSm"
                      weight="700"
                      color={
                        colors.muted
                      }
                    >
                      {index +
                        1}
                    </Txt>
                  </View>

                  <View
                    style={
                      styles.resultCardWrap
                    }
                  >
                    <ResultCard
                      craftsman={
                        craftsman
                      }
                    />
                  </View>
                </Pressable>
              ),
            )}
          </View>
        ) : (
          <View
            style={
              styles.empty
            }
          >
            <View
              style={
                styles.emptyIcon
              }
            >
              <SearchX
                size={30}
                color={
                  colors.primary
                }
              />
            </View>

            <Txt
              variant="h3"
              align="center"
              style={
                styles.emptyTitle
              }
            >
              ما لقينا نتيجة مطابقة
            </Txt>

            <Txt
              variant="body"
              color={
                colors.muted
              }
              align="center"
              style={
                styles.emptyDescription
              }
            >
              جرّب كلمة أبسط، اسم منطقة، أو احكيلنا المشكلة من خلال مساعد مهنتي الذكي.
            </Txt>

            <Pressable
              style={({ pressed }) => [
                styles.aiButton,
                pressed &&
                  styles.aiButtonPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    '/search',
                  params: {
                    q: query,
                  },
                })
              }
              accessibilityRole="button"
              accessibilityLabel="تجربة البحث بالذكاء الاصطناعي"
            >
              <Sparkles
                size={18}
                color={
                  colors.white
                }
              />

              <Txt
                variant="label"
                color={
                  colors.white
                }
                weight="600"
                style={
                  styles.aiButtonText
                }
              >
                جرّب البحث بالذكاء الاصطناعي
              </Txt>
            </Pressable>
          </View>
        )}

        {/* =================================================
            BOTTOM NOTE
        ================================================= */}

        {results.length >
          0 && (
          <View
            style={
              styles.bottomHint
            }
          >
            <CheckCircle2
              size={15}
              color={
                colors.success
              }
            />

            <Txt
              variant="small"
              color={
                colors.muted
              }
              style={
                styles.bottomHintText
              }
            >
              اضغط على أي مقدم خدمة لمعرفة التفاصيل والتقييمات والموقع.
            </Txt>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    content: {
      paddingBottom: 34,
    },

    /* =====================================================
       SEARCH
    ===================================================== */

    searchWrap: {
      paddingHorizontal: 14,
      paddingTop: 12,
    },

    /* =====================================================
       AI
    ===================================================== */

    aiCard: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      marginHorizontal: 14,
      marginTop: 11,
      padding: 11,
      backgroundColor:
        colors.tintStrong,
      borderRadius:
        radius.lg,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    aiIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor:
        colors.mint,
      alignItems: 'center',
      justifyContent: 'center',
    },

    aiContent: {
      flex: 1,
      minWidth: 0,
      marginHorizontal: 10,
    },

    aiTitleRow: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
    },

    aiTitle: {
      flex: 1,
    },

    aiTag: {
      backgroundColor:
        colors.white,
      borderRadius:
        radius.full,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginLeft: 7,
    },

    aiDescription: {
      marginTop: 2,
      lineHeight: 18,
    },

    aiCheck: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* =====================================================
       RESULT HEADER
    ===================================================== */

    resultHeader: {
      ...row,
      alignItems: 'center',
      paddingHorizontal: 14,
      marginTop: 18,
    },

    resultHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    resultTitle: {
      fontSize: 20,
      lineHeight: 28,
    },

    resultSubtitle: {
      marginTop: 2,
      lineHeight: 18,
    },

    /* =====================================================
       VIEW SWITCHER
    ===================================================== */

    viewSwitcher: {
      flexDirection:
        'row-reverse',
      backgroundColor:
        colors.white,
      borderWidth: 1,
      borderColor:
        colors.border,
      borderRadius:
        radius.md,
      overflow:
        'hidden',
      marginLeft: 10,
    },

    viewOption: {
      minHeight: 40,
      paddingHorizontal: 9,
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },

    viewOptionActive: {
      backgroundColor:
        colors.primary,
    },

    /* =====================================================
       CONTEXT
    ===================================================== */

    contextRow: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 14,
      marginTop: 11,
    },

    resultCountBadge: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      backgroundColor:
        colors.white,
      borderRadius:
        radius.full,
      borderWidth: 1,
      borderColor:
        colors.border,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },

    resultDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        colors.success,
      marginLeft: 6,
    },

    resultCountText: {
      marginRight: 3,
    },

    intentBadge: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      maxWidth: '64%',
      backgroundColor:
        colors.mintSoft,
      borderRadius:
        radius.full,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },

    intentText: {
      marginRight: 4,
      flexShrink: 1,
    },

    /* =====================================================
       SORT
    ===================================================== */

    sortSection: {
      marginTop: 14,
    },

    sortHeader: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      paddingHorizontal: 14,
    },

    sortLabel: {
      marginRight: 5,
    },

    sortRow: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },

    sortChip: {
      minHeight: 36,
      paddingHorizontal: 13,
      borderRadius:
        radius.full,
      backgroundColor:
        colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    sortChipSelected: {
      backgroundColor:
        colors.primary,
      borderColor:
        colors.primary,
    },

    sortChipPressed: {
      opacity: 0.82,
    },

    /* =====================================================
       LIST
    ===================================================== */

    list: {
      paddingHorizontal: 14,
      gap: 11,
    },

    resultItem: {
      position:
        'relative',
    },

    resultItemPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.995,
        },
      ],
    },

    resultCardWrap: {
      minWidth: 0,
    },

    resultRank: {
      position:
        'absolute',
      top: 10,
      left: 10,
      zIndex: 5,
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor:
        colors.tintStrong,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    /* =====================================================
       EMPTY
    ===================================================== */

    empty: {
      marginHorizontal: 14,
      marginTop: 10,
      backgroundColor:
        colors.white,
      borderRadius:
        radius.xl,
      borderWidth: 1,
      borderColor:
        colors.border,
      paddingHorizontal: 22,
      paddingVertical: 28,
      alignItems: 'center',
      ...shadows.level1,
    },

    emptyIcon: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor:
        colors.tintStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },

    emptyTitle: {
      marginTop: 13,
    },

    emptyDescription: {
      marginTop: 7,
      lineHeight: 21,
      maxWidth: 310,
    },

    aiButton: {
      ...row,
      alignItems: 'center',
      backgroundColor:
        colors.primary,
      borderRadius:
        radius.md,
      minHeight: 47,
      paddingHorizontal: 16,
      marginTop: 18,
      justifyContent: 'center',
    },

    aiButtonPressed: {
      opacity: 0.88,
    },

    aiButtonText: {
      marginRight: 8,
    },

    /* =====================================================
       BOTTOM HINT
    ===================================================== */

    bottomHint: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      marginTop: 15,
    },

    bottomHintText: {
      flex: 1,
      marginRight: 5,
      textAlign: 'right',
      lineHeight: 18,
    },
  });