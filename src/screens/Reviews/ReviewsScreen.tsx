import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  MessageSquarePlus,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';

import { getCraftsman } from '../../data/mock';
import type { CraftsmanReview } from '../../data/reviews';
import {
  getCraftsmanReviews,
  getRatingDistribution,
  getReviewInsights,
} from '../../data/reviews';

import {
  card,
  colors,
  fontFamilies,
  radius,
  row,
  shadows,
} from '../../styles/theme';

const ratingWords: Record<number, string> = {
  1: 'تجربة تحتاج إلى تحسين',
  2: 'تجربة مقبولة',
  3: 'تجربة جيدة',
  4: 'تجربة جيدة جدًا',
  5: 'تجربة ممتازة',
};

const ratingFilters = [
  {
    value: 0,
    label: 'الكل',
  },
  {
    value: 5,
    label: '5 نجوم',
  },
  {
    value: 4,
    label: '4 نجوم+',
  },
] as const;

const reviewTags = [
  'سريع وملتزم',
  'شغل نظيف',
  'سعر منصف',
  'أمين ومحترم',
];

function Stars({
  value,
  size = 14,
}: {
  value: number;
  size?: number;
}) {
  return (
    <View style={row}>
      {[1, 2, 3, 4, 5].map((number) => {
        const filled = value >= number - 0.5;

        return (
          <Star
            key={number}
            size={size}
            color={colors.amber}
            fill={filled ? colors.amber : 'transparent'}
            strokeWidth={1.8}
            style={{ marginLeft: 2 }}
          />
        );
      })}
    </View>
  );
}

function ProviderAvatar({
  photo,
  name,
  large = false,
}: {
  photo: string;
  name: string;
  large?: boolean;
}) {
  return (
    <View
      style={[
        styles.providerAvatar,
        large && styles.providerAvatarLarge,
      ]}
    >
      <Image
        source={{ uri: photo }}
        style={[
          styles.providerAvatarImage,
          large && styles.providerAvatarImageLarge,
        ]}
      />
    </View>
  );
}

function RatingBar({
  stars,
  percent,
}: {
  stars: number;
  percent: number;
}) {
  return (
    <View style={styles.ratingBarRow}>
      <Txt
        variant="labelSm"
        weight="600"
        style={styles.ratingBarNumber}
      >
        {stars}
      </Txt>

      <Star
        size={12}
        color={colors.amber}
        fill={colors.amber}
      />

      <View style={styles.ratingBarTrack}>
        <View
          style={[
            styles.ratingBarFill,
            {
              width: `${percent}%`,
            },
          ]}
        />
      </View>

      <Txt
        variant="labelSm"
        color={colors.muted}
        style={styles.ratingBarPercent}
      >
        {percent}%
      </Txt>
    </View>
  );
}

function ReviewCard({
  review,
  liked,
  onLike,
}: {
  review: CraftsmanReview;
  liked: boolean;
  onLike: () => void;
}) {
  return (
    <View style={[styles.reviewCard, shadows.level1]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerAvatar}>
          {review.photo ? (
            <Image
              source={{ uri: review.photo }}
              style={styles.reviewerPhoto}
            />
          ) : (
            <Txt
              variant="h4"
              color={colors.primary}
              align="center"
            >
              {review.initial ||
                review.author.charAt(0)}
            </Txt>
          )}
        </View>

        <View style={styles.reviewerInfo}>
          <View style={styles.reviewerNameRow}>
            <Txt
              variant="h4"
              numberOfLines={1}
              style={{
                fontSize: 15,
                flexShrink: 1,
              }}
            >
              {review.author}
            </Txt>

            {review.verifiedRequest && (
              <CheckCircle2
                size={14}
                color={colors.success}
                style={{ marginRight: 5 }}
              />
            )}
          </View>

          <Txt
            variant="labelSm"
            color={colors.muted}
            numberOfLines={1}
          >
            {review.service}
          </Txt>
        </View>

        <Txt
          variant="labelSm"
          color={colors.muted}
        >
          {review.time}
        </Txt>
      </View>

      <View style={styles.reviewRatingRow}>
        <Stars value={review.rating} />

        <Txt
          variant="label"
          weight="700"
          style={{ marginRight: 6 }}
        >
          {review.rating.toFixed(1)}
        </Txt>
      </View>

      <Txt
        variant="body"
        style={styles.reviewBody}
      >
        {review.text}
      </Txt>

      {review.tags.length > 0 && (
        <View style={styles.reviewTags}>
          {review.tags.map((tag) => (
            <View
              key={tag}
              style={styles.reviewTag}
            >
              <Txt
                variant="labelSm"
                weight="500"
                color={colors.primary}
              >
                {tag}
              </Txt>
            </View>
          ))}
        </View>
      )}

      <View style={styles.reviewFooter}>
        <Pressable
          onPress={onLike}
          style={({ pressed }) => [
            styles.helpfulButton,
            pressed && styles.helpfulPressed,
          ]}
          hitSlop={8}
        >
          <ThumbsUp
            size={16}
            color={
              liked
                ? colors.success
                : colors.muted
            }
            fill={
              liked
                ? colors.mint
                : 'transparent'
            }
          />

          <Txt
            variant="labelSm"
            weight="600"
            color={
              liked
                ? colors.success
                : colors.muted
            }
            style={{ marginRight: 5 }}
          >
            مفيد {review.helpful + (liked ? 1 : 0)}
          </Txt>
        </Pressable>

        <View style={{ flex: 1 }} />

        <View style={styles.reviewVerified}>
          {review.verifiedRequest ? (
            <>
              <CheckCircle2
                size={13}
                color={colors.success}
              />

              <Txt
                variant="labelSm"
                color={colors.success}
                weight="600"
                style={{ marginRight: 4 }}
              >
                طلب مكتمل
              </Txt>
            </>
          ) : (
            <>
              <ShieldCheck
                size={13}
                color={colors.primary}
              />

              <Txt
                variant="labelSm"
                color={colors.primary}
                weight="600"
                style={{ marginRight: 4 }}
              >
                قيد التحقق
              </Txt>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ReviewsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    craftsmanId?: string;
    id?: string;
  }>();

  const craftsmanId =
    typeof params.craftsmanId === 'string'
      ? params.craftsmanId
      : typeof params.id === 'string'
        ? params.id
        : 'c1';

  const craftsman = getCraftsman(
    craftsmanId || 'c1',
  );

  const [list, setList] = useState<CraftsmanReview[]>(
    () => getCraftsmanReviews(craftsman.id),
  );

  const [rating, setRating] =
    useState<number>(0);

  const [selectedTags, setSelectedTags] =
    useState<string[]>([]);

  const [comment, setComment] =
    useState<string>('');

  const [sort, setSort] =
    useState<'new' | 'top'>('new');

  const [ratingFilter, setRatingFilter] =
    useState<0 | 4 | 5>(0);

  const [liked, setLiked] =
    useState<string[]>([]);

  const [submitted, setSubmitted] =
    useState<boolean>(false);

  useEffect(() => {
    setList(
      getCraftsmanReviews(craftsman.id),
    );
    setRating(0);
    setSelectedTags([]);
    setComment('');
    setSort('new');
    setRatingFilter(0);
    setLiked([]);
    setSubmitted(false);
  }, [craftsman.id]);

  const distribution = useMemo(
    () =>
      getRatingDistribution(
        craftsman.id,
      ),
    [craftsman.id],
  );

  const insights = useMemo(
    () =>
      getReviewInsights(
        craftsman.id,
      ),
    [craftsman.id],
  );

  const visibleReviews = useMemo(() => {
    const filtered = list.filter((review) => {
      if (ratingFilter === 5) {
        return review.rating === 5;
      }

      if (ratingFilter === 4) {
        return review.rating >= 4;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === 'top') {
        return (
          b.rating - a.rating ||
          b.helpful - a.helpful
        );
      }

      return b.createdAt.localeCompare(
        a.createdAt,
      );
    });
  }, [
    list,
    ratingFilter,
    sort,
  ]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter(
          (item) => item !== tag,
        )
        : [...current, tag],
    );
  };

  const submitReview = () => {
    if (rating === 0) {
      return;
    }

    const newReview: CraftsmanReview = {
      id: `mine-${craftsman.id}-${Date.now()}`,
      craftsmanId: craftsman.id,
      author: 'أنت',
      initial: 'أ',
      meta: 'تقييم جديد',
      rating,
      text:
        comment.trim().length > 0
          ? comment.trim()
          : 'تجربة ممتازة، أنصح بالتعامل معه.',
      tags: selectedTags,
      helpful: 0,
      time: 'الآن',
      note: 'مراجعة بانتظار التحقق',
      service: 'تجربتي مع الخدمة',
      createdAt: new Date().toISOString(),
      verifiedRequest: false,
    };

    setList((current) => [
      newReview,
      ...current,
    ]);

    setRating(0);
    setSelectedTags([]);
    setComment('');
    setSubmitted(true);
  };

  const openProfile = () => {
    router.push({
      pathname: '/profile/[id]',
      params: {
        id: craftsman.id,
      },
    });
  };

  const ratingDescription =
    rating > 0
      ? ratingWords[rating]
      : 'اختر عدد النجوم التي تعبّر عن تجربتك';

  const totalDisplayed =
    list.length;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScreenHeader title="التقييمات والمراجعات" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={
          styles.content
        }
      >
        {/* =====================================================
            Provider identity
        ====================================================== */}
        <Pressable
          onPress={openProfile}
          style={({ pressed }) => [
            styles.providerCard,
            shadows.level1,
            pressed &&
            styles.providerPressed,
          ]}
        >
          <View style={styles.providerTop}>
            <ProviderAvatar
              photo={craftsman.photo}
              name={craftsman.name}
              large
            />

            <View
              style={styles.providerInfo}
            >
              <View
                style={styles.providerNameRow}
              >
                <Txt
                  variant="h3"
                  numberOfLines={2}
                  style={{
                    flex: 1,
                    fontSize: 18,
                  }}
                >
                  {craftsman.name}
                </Txt>

                {craftsman.verified && (
                  <View
                    style={
                      styles.verifiedBadge
                    }
                  >
                    <BadgeCheck
                      size={15}
                      color={colors.success}
                    />

                    <Txt
                      variant="labelSm"
                      color={
                        colors.success
                      }
                      weight="700"
                      style={{
                        marginRight: 4,
                      }}
                    >
                      موثّق
                    </Txt>
                  </View>
                )}
              </View>

              <Txt
                variant="small"
                color={colors.muted}
                numberOfLines={2}
                style={{ marginTop: 3 }}
              >
                {craftsman.specialty}
              </Txt>
            </View>

            <ChevronLeft
              size={20}
              color={colors.muted}
            />
          </View>

          <View
            style={
              styles.providerStats
            }
          >
            <View
              style={styles.providerStat}
            >
              <Star
                size={14}
                color={colors.amber}
                fill={colors.amber}
              />

              <Txt
                variant="label"
                weight="700"
                style={{ marginRight: 4 }}
              >
                {craftsman.rating.toFixed(
                  1,
                )}
              </Txt>

              <Txt
                variant="labelSm"
                color={colors.muted}
              >
                التقييم
              </Txt>
            </View>

            <View
              style={styles.statDivider}
            />

            <View
              style={styles.providerStat}
            >
              <MessageSquarePlus
                size={14}
                color={colors.primary}
              />

              <Txt
                variant="label"
                weight="700"
                style={{ marginRight: 4 }}
              >
                {craftsman.reviewCount}
              </Txt>

              <Txt
                variant="labelSm"
                color={colors.muted}
              >
                تقييم
              </Txt>
            </View>

            <View
              style={styles.statDivider}
            />

            <View
              style={styles.providerStat}
            >
              <Clock3
                size={14}
                color={colors.primary}
              />

              <Txt
                variant="label"
                weight="700"
                style={{ marginRight: 4 }}
              >
                {craftsman.experienceYears}
              </Txt>

              <Txt
                variant="labelSm"
                color={colors.muted}
              >
                سنة خبرة
              </Txt>
            </View>
          </View>
        </Pressable>

        {/* =====================================================
            Rating summary
        ====================================================== */}
        <View
          style={[
            styles.card,
            styles.summaryCard,
          ]}
        >
          <View
            style={styles.summaryTop}
          >
            <View
              style={styles.scoreSide}
            >
              <Txt
                variant="labelSm"
                color={colors.muted}
              >
                تقييم العملاء
              </Txt>

              <View
                style={styles.scoreRow}
              >
                <Txt
                  variant="h1"
                  style={
                    styles.mainScore
                  }
                >
                  {craftsman.rating.toFixed(
                    1,
                  )}
                </Txt>

                <Txt
                  variant="small"
                  color={colors.muted}
                  style={{
                    marginRight: 5,
                    marginBottom: 6,
                  }}
                >
                  / 5
                </Txt>
              </View>

              <Stars
                value={craftsman.rating}
                size={17}
              />

              <Txt
                variant="labelSm"
                color={colors.success}
                weight="700"
                style={{ marginTop: 4 }}
              >
                تقييم مرتفع
              </Txt>

              <Txt
                variant="labelSm"
                color={colors.muted}
                style={{ marginTop: 2 }}
              >
                {craftsman.reviewCount}{' '}
                تقييمًا على الملف
              </Txt>
            </View>

            <View
              style={
                styles.distributionSide
              }
            >
              {distribution.map(
                (item) => (
                  <RatingBar
                    key={item.stars}
                    stars={item.stars}
                    percent={item.percent}
                  />
                ),
              )}
            </View>
          </View>

          <View
            style={
              styles.summaryTrust
            }
          >
            <View
              style={
                styles.summaryTrustIcon
              }
            >
              <ShieldCheck
                size={17}
                color={colors.primary}
              />
            </View>

            <View
              style={{
                flex: 1,
                marginRight: 9,
              }}
            >
              <Txt
                variant="label"
                weight="700"
              >
                الثقة قبل الحجز
              </Txt>

              <Txt
                variant="labelSm"
                color={colors.muted}
                style={{ marginTop: 1 }}
              >
                راجع التجارب والتقييمات قبل التواصل مع {craftsman.name}
              </Txt>
            </View>
          </View>
        </View>

        {/* =====================================================
            Review insights
        ====================================================== */}
        {insights.length > 0 && (
          <View
            style={[
              styles.card,
              styles.insightsCard,
            ]}
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View
                style={styles.sectionIcon}
              >
                <Sparkles
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View
                style={{
                  flex: 1,
                  marginRight: 9,
                }}
              >
                <Txt
                  variant="h3"
                  style={{
                    fontSize: 17,
                  }}
                >
                  ماذا يمدح العملاء؟
                </Txt>

                <Txt
                  variant="labelSm"
                  color={colors.muted}
                  style={{ marginTop: 1 }}
                >
                  أبرز النقاط المتكررة في المراجعات المعروضة
                </Txt>
              </View>
            </View>

            <View
              style={styles.insightsGrid}
            >
              {insights.map(
                (item) => (
                  <View
                    key={item.label}
                    style={
                      styles.insightItem
                    }
                  >
                    <View
                      style={
                        styles.insightCheck
                      }
                    >
                      <CheckCircle2
                        size={14}
                        color={
                          colors.success
                        }
                      />
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginRight: 7,
                      }}
                    >
                      <Txt
                        variant="labelSm"
                        weight="600"
                        color={
                          colors.primary
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {item.label}
                      </Txt>

                      <Txt
                        variant="labelSm"
                        color={
                          colors.muted
                        }
                        style={{
                          marginTop: 1,
                        }}
                      >
                        {item.count}{' '}
                        تجارب
                      </Txt>
                    </View>
                  </View>
                ),
              )}
            </View>
          </View>
        )}

        {/* =====================================================
            Add review
        ====================================================== */}
        <View
          style={[
            styles.card,
            styles.reviewComposer,
          ]}
        >
          <View
            style={
              styles.composerHeader
            }
          >
            <View
              style={styles.sectionIcon}
            >
              <MessageSquarePlus
                size={18}
                color={colors.success}
              />
            </View>

            <View
              style={{
                flex: 1,
                marginRight: 9,
              }}
            >
              <Txt
                variant="h3"
                style={{
                  fontSize: 18,
                }}
              >
                شارك تجربتك
              </Txt>

              <Txt
                variant="labelSm"
                color={colors.muted}
                style={{ marginTop: 1 }}
              >
                تقييمك يساعد المستخدمين القادمين
              </Txt>
            </View>
          </View>

          {submitted && (
            <View
              style={
                styles.successMessage
              }
            >
              <View
                style={
                  styles.successIcon
                }
              >
                <CheckCircle2
                  size={17}
                  color={colors.success}
                />
              </View>

              <View
                style={{
                  flex: 1,
                  marginRight: 8,
                }}
              >
                <Txt
                  variant="label"
                  color={colors.success}
                  weight="700"
                >
                  تم إرسال تقييمك
                </Txt>

                <Txt
                  variant="labelSm"
                  color={colors.muted}
                  style={{ marginTop: 1 }}
                >
                  سيبقى ظاهرًا في الـDemo بانتظار التحقق.
                </Txt>
              </View>

              <Pressable
                onPress={() =>
                  setSubmitted(false)
                }
              >
                <Txt
                  variant="labelSm"
                  color={colors.primary}
                  weight="700"
                >
                  إغلاق
                </Txt>
              </Pressable>
            </View>
          )}

          <Txt
            variant="label"
            weight="600"
            align="center"
            style={{ marginTop: 17 }}
          >
            كم نجمة تعطي تجربتك؟
          </Txt>

          <View
            style={styles.largeStars}
          >
            {[1, 2, 3, 4, 5].map(
              (number) => (
                <Pressable
                  key={number}
                  onPress={() =>
                    setRating(number)
                  }
                  style={({ pressed }) => [
                    styles.starButton,
                    pressed &&
                    styles.starPressed,
                  ]}
                  hitSlop={7}
                >
                  <Star
                    size={36}
                    color={colors.amber}
                    fill={
                      rating >= number
                        ? colors.amber
                        : 'transparent'
                    }
                    strokeWidth={1.8}
                  />
                </Pressable>
              ),
            )}
          </View>

          <Txt
            variant="labelSm"
            color={
              rating > 0
                ? colors.primary
                : colors.muted
            }
            weight="600"
            align="center"
            style={{ marginTop: 2 }}
          >
            {ratingDescription}
          </Txt>

          {rating > 0 && (
            <View
              style={
                styles.composerBody
              }
            >
              <Txt
                variant="label"
                weight="600"
              >
                ما الذي ميّز الخدمة؟
              </Txt>

              <View
                style={
                  styles.composerTags
                }
              >
                {reviewTags.map(
                  (tag) => {
                    const active =
                      selectedTags.includes(
                        tag,
                      );

                    return (
                      <Pressable
                        key={tag}
                        onPress={() =>
                          toggleTag(
                            tag,
                          )
                        }
                        style={[
                          styles.composerTag,
                          active &&
                          styles.composerTagActive,
                        ]}
                      >
                        {active && (
                          <CheckCircle2
                            size={13}
                            color={
                              colors.primary
                            }
                          />
                        )}

                        <Txt
                          variant="labelSm"
                          color={
                            active
                              ? colors.primary
                              : colors.text
                          }
                          weight={
                            active
                              ? '700'
                              : '500'
                          }
                          style={{
                            marginRight:
                              active
                                ? 4
                                : 0,
                          }}
                        >
                          {tag}
                        </Txt>
                      </Pressable>
                    );
                  },
                )}
              </View>

              <Txt
                variant="label"
                weight="600"
                style={{ marginTop: 15 }}
              >
                اكتب تجربتك
              </Txt>

              <TextInput
                value={comment}
                onChangeText={
                  setComment
                }
                multiline
                maxLength={300}
                textAlign="right"
                textAlignVertical="top"
                placeholder="مثلاً: التزم بالموعد، شرح المشكلة بوضوح، والسعر كان واضح..."
                placeholderTextColor={
                  colors.muted
                }
                style={
                  styles.commentInput
                }
              />

              <View
                style={
                  styles.commentBottom
                }
              >
                <Txt
                  variant="labelSm"
                  color={colors.muted}
                >
                  {comment.length}/300
                </Txt>

                <View
                  style={{
                    flex: 1,
                  }}
                />

                <Txt
                  variant="labelSm"
                  color={colors.muted}
                >
                  كن واضحًا ومحترمًا
                </Txt>
              </View>

              <Pressable
                onPress={
                  submitReview
                }
                style={({ pressed }) => [
                  styles.publishButton,
                  pressed &&
                  styles.publishPressed,
                ]}
              >
                <Txt
                  variant="h4"
                  color={colors.white}
                  align="center"
                >
                  نشر التقييم
                </Txt>
              </Pressable>
            </View>
          )}
        </View>

        {/* =====================================================
            Reviews section header
        ====================================================== */}
        <View
          style={
            styles.reviewsSectionHeader
          }
        >
          <View
            style={{
              flex: 1,
            }}
          >
            <Txt
              variant="h3"
              style={{
                fontSize: 20,
              }}
            >
              تجارب العملاء
            </Txt>

            <Txt
              variant="labelSm"
              color={colors.muted}
              style={{ marginTop: 1 }}
            >
              {totalDisplayed}{' '}
              تجارب معروضة في الـDemo
            </Txt>
          </View>

          <View
            style={
              styles.sortToggle
            }
          >
            <Pressable
              onPress={() =>
                setSort('new')
              }
              style={[
                styles.sortButton,
                sort === 'new' &&
                styles.sortButtonActive,
              ]}
            >
              <Txt
                variant="labelSm"
                color={
                  sort === 'new'
                    ? colors.white
                    : colors.text
                }
                weight="700"
              >
                الأحدث
              </Txt>
            </Pressable>

            <Pressable
              onPress={() =>
                setSort('top')
              }
              style={[
                styles.sortButton,
                sort === 'top' &&
                styles.sortButtonActive,
              ]}
            >
              <Txt
                variant="labelSm"
                color={
                  sort === 'top'
                    ? colors.white
                    : colors.text
                }
                weight="700"
              >
                الأعلى
              </Txt>
            </Pressable>
          </View>
        </View>

        {/* =====================================================
            Filters
        ====================================================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filtersContent
          }
        >
          {ratingFilters.map(
            (filter) => {
              const active =
                ratingFilter ===
                filter.value;

              return (
                <Pressable
                  key={filter.value}
                  onPress={() =>
                    setRatingFilter(
                      filter.value,
                    )
                  }
                  style={[
                    styles.filterChip,
                    active &&
                    styles.filterChipActive,
                  ]}
                >
                  {filter.value >
                    0 && (
                      <Star
                        size={13}
                        color={
                          active
                            ? colors.white
                            : colors.amber
                        }
                        fill={colors.amber}
                      />
                    )}

                  <Txt
                    variant="labelSm"
                    color={
                      active
                        ? colors.white
                        : colors.text
                    }
                    weight="600"
                    style={{
                      marginRight:
                        filter.value >
                          0
                          ? 5
                          : 0,
                    }}
                  >
                    {filter.label}
                  </Txt>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        {/* =====================================================
            Review list
        ====================================================== */}
        {visibleReviews.map(
          (review) => (
            <ReviewCard
              key={review.id}
              review={review}
              liked={liked.includes(
                review.id,
              )}
              onLike={() =>
                setLiked((current) =>
                  current.includes(
                    review.id,
                  )
                    ? current.filter(
                      (id) =>
                        id !==
                        review.id,
                    )
                    : [
                      ...current,
                      review.id,
                    ],
                )
              }
            />
          ),
        )}

        {/* =====================================================
            Empty filtered state
        ====================================================== */}
        {visibleReviews.length === 0 && (
          <View style={styles.emptyState}>
            <View
              style={
                styles.emptyIcon
              }
            >
              <Star
                size={22}
                color={colors.primary}
              />
            </View>

            <Txt
              variant="h3"
              align="center"
              style={{ fontSize: 17 }}
            >
              لا توجد مراجعات بهذا الفلتر
            </Txt>

            <Txt
              variant="small"
              color={colors.muted}
              align="center"
              style={{
                marginTop: 5,
              }}
            >
              غيّر الفلتر لعرض تجارب أخرى.
            </Txt>
          </View>
        )}

        {/* =====================================================
            Trust footer
        ====================================================== */}
        <View
          style={
            styles.trustFooter
          }
        >
          <View
            style={
              styles.trustFooterIcon
            }
          >
            <ShieldCheck
              size={19}
              color={colors.primary}
            />
          </View>

          <View
            style={{
              flex: 1,
              marginRight: 9,
            }}
          >
            <Txt
              variant="label"
              weight="700"
            >
              الثقة تُبنى بالتجربة
            </Txt>

            <Txt
              variant="labelSm"
              color={colors.muted}
              style={{ marginTop: 2 }}
            >
              مِهنتي يعرض معلومات المهني ومراجعاته في مكان واحد حتى يكون قرارك أوضح قبل التواصل أو الحجز.
            </Txt>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  content: {
    paddingTop: 0,
    paddingBottom: 36,
  },

  providerCard: {
    ...card,
    marginHorizontal: 14,
    marginTop: 12,
    padding: 14,
    borderRadius: radius.lg,
  },

  providerPressed: {
    opacity: 0.92,
  },

  providerTop: {
    ...row,
    alignItems: 'flex-start',
  },

  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.tint,
  },

  providerAvatarLarge: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  providerAvatarImage: {
    width: '100%',
    height: '100%',
  },

  providerAvatarImageLarge: {
    width: '100%',
    height: '100%',
  },

  providerInfo: {
    flex: 1,
    marginRight: 11,
  },

  providerNameRow: {
    ...row,
    alignItems: 'flex-start',
  },

  verifiedBadge: {
    ...row,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 7,
    marginTop: 1,
  },

  providerStats: {
    ...row,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },

  providerStat: {
    ...row,
    flex: 1,
    justifyContent: 'center',
  },

  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },

  card: {
    ...card,
    marginHorizontal: 14,
    borderRadius: radius.lg,
  },

  summaryCard: {
    marginTop: 12,
    padding: 14,
  },

  summaryTop: {
    ...row,
    alignItems: 'stretch',
  },

  scoreSide: {
    width: 118,
    alignItems: 'flex-start',
  },

  scoreRow: {
    ...row,
    alignItems: 'flex-end',
    marginTop: 1,
  },

  mainScore: {
    fontSize: 42,
    lineHeight: 50,
  },

  distributionSide: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 17,
  },

  ratingBarRow: {
    ...row,
    height: 23,
    alignItems: 'center',
  },

  ratingBarNumber: {
    width: 13,
    textAlign: 'center',
  },

  ratingBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.tintStrong,
    overflow: 'hidden',
    marginHorizontal: 7,
  },

  ratingBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
    alignSelf: 'flex-start',
  },

  ratingBarPercent: {
    width: 36,
    textAlign: 'left',
  },

  summaryTrust: {
    ...row,
    marginTop: 13,
    padding: 10,
    backgroundColor: colors.tint,
    borderRadius: radius.md,
  },

  summaryTrustIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightsCard: {
    marginTop: 12,
    padding: 14,
  },

  sectionHeader: {
    ...row,
    alignItems: 'center',
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  insightItem: {
    width: '48%',
    minHeight: 56,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.tintStrong,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  insightCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewComposer: {
    marginTop: 12,
    padding: 14,
  },

  composerHeader: {
    ...row,
    alignItems: 'center',
  },

  successMessage: {
    ...row,
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.mint,
  },

  successIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  largeStars: {
    ...row,
    justifyContent: 'center',
    marginTop: 9,
  },

  starButton: {
    paddingHorizontal: 6,
  },

  starPressed: {
    transform: [{ scale: 0.95 }],
  },

  composerBody: {
    marginTop: 14,
  },

  composerTags: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 9,
  },

  composerTag: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  composerTagActive: {
    backgroundColor: colors.mint,
    borderColor: colors.secondary,
  },

  commentInput: {
    minHeight: 106,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: fontFamilies['400'],
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  } as object,

  commentBottom: {
    ...row,
    marginTop: 6,
  },

  publishButton: {
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  publishPressed: {
    opacity: 0.86,
  },

  reviewsSectionHeader: {
    ...row,
    marginHorizontal: 14,
    marginTop: 22,
    alignItems: 'flex-end',
  },

  sortToggle: {
    flexDirection: 'row',
    backgroundColor: colors.tintStrong,
    borderRadius: radius.full,
    padding: 3,
  },

  sortButton: {
    minWidth: 52,
    height: 31,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sortButtonActive: {
    backgroundColor: colors.primary,
  },

  filtersContent: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 11,
    gap: 8,
  },

  filterChip: {
    minHeight: 36,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: 12,
  },

  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  reviewCard: {
    ...card,
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 14,
    borderRadius: radius.lg,
  },

  reviewHeader: {
    ...row,
    alignItems: 'flex-start',
  },

  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  reviewerPhoto: {
    width: '100%',
    height: '100%',
  },

  reviewerInfo: {
    flex: 1,
    marginRight: 10,
  },

  reviewerNameRow: {
    ...row,
    alignItems: 'center',
  },

  reviewRatingRow: {
    ...row,
    alignItems: 'center',
    marginTop: 9,
  },

  reviewBody: {
    marginTop: 7,
    lineHeight: 23,
  },

  reviewTags: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 10,
  },

  reviewTag: {
    backgroundColor: colors.tintStrong,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  reviewFooter: {
    ...row,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },

  helpfulButton: {
    ...row,
    alignItems: 'center',
    paddingVertical: 2,
  },

  helpfulPressed: {
    opacity: 0.7,
  },

  reviewVerified: {
    ...row,
    backgroundColor: colors.mintSoft,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  emptyState: {
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 25,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  trustFooter: {
    ...row,
    marginHorizontal: 14,
    marginTop: 4,
    padding: 12,
    backgroundColor: colors.tint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },

  trustFooterIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomSpace: {
    height: 8,
  },
});