import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Handshake, Info, MessageSquarePlus, Send, ShieldCheck, Star, ThumbsUp, CircleCheck, Medal } from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';
import TrustBanner from '../../components/TrustBanner';
import { getCraftsman, ratingBars, Review, reviewQualityTags, reviews as seedReviews } from '../../data/mock';
import { card, colors, fontFamilies, radius, row, shadows } from '../../styles/theme';

const ratingWords: string[] = ['', 'سيئ (1 من 5)', 'مقبول (2 من 5)', 'جيد (3 من 5)', 'جيد جداً (4 من 5)', 'ممتاز (5 من 5)'];

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <View style={row}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          color={colors.amber}
          fill={value >= n - 0.25 ? colors.amber : 'transparent'}
          style={{ marginLeft: 2 }}
        />
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const craftsman = getCraftsman(typeof id === 'string' ? id : 'c1');

  const [list, setList] = useState<Review[]>(seedReviews);
  const [myRating, setMyRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['سعر منصف']);
  const [comment, setComment] = useState<string>('');
  const [sort, setSort] = useState<'new' | 'top'>('new');
  const [liked, setLiked] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));
  };

  const publish = () => {
    if (myRating === 0) return;
    const review: Review = {
      id: `mine-${list.length}`,
      author: 'أنت',
      meta: 'رام الله • تقييم جديد',
      initial: 'أ',
      rating: myRating,
      text: comment.trim().length > 0 ? comment : 'تجربة ممتازة، أنصح بالتعامل معه.',
      tags: selectedTags,
      helpful: 0,
      time: 'الآن',
      note: 'قيد التحقق',
    };
    setList([review, ...list]);
    setMyRating(0);
    setComment('');
  };

  const shown = sort === 'top' ? [...list].sort((a, b) => b.rating - a.rating) : list;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="التقييمات" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Craftsman header */}
        <View style={[styles.card, row, { marginTop: 12 }]}>
          <Image source={{ uri: craftsman.photo }} style={styles.headPhoto} />
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={row}>
              <Txt variant="h3" style={{ fontSize: 18 }}>
                {craftsman.name}
              </Txt>
              <BadgeCheck size={16} color={colors.success} style={{ marginRight: 4 }} />
            </View>
            <Txt variant="small" color={colors.muted} numberOfLines={1}>
              {craftsman.specialty} • رام الله
            </Txt>
          </View>
          <View style={styles.trusted}>
            <Medal size={12} color={colors.primary} />
            <Txt variant="labelSm" color={colors.primary} style={{ marginRight: 3 }}>
              موثّق
            </Txt>
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={row}>
            <View style={{ alignItems: 'flex-start' }}>
              <View style={[row, { alignItems: 'flex-end' }]}>
                <Txt variant="small" color={colors.muted} style={{ marginLeft: 6 }}>
                  من 5.0
                </Txt>
                <Txt variant="h1" style={{ fontSize: 38, lineHeight: 48 }}>
                  {craftsman.rating.toFixed(1)}
                </Txt>
              </View>
              <Stars value={5} size={16} />
              <Txt variant="labelSm" weight="400" color={colors.muted} style={{ marginTop: 4 }}>
                بناءً على {craftsman.reviewCount} تقييم موثق
              </Txt>
            </View>
            <View style={{ flex: 1, marginRight: 18 }}>
              {ratingBars.map((bar) => (
                <View key={bar.stars} style={[row, { marginVertical: 2 }]}>
                  <Txt variant="labelSm" weight="500" style={{ width: 16 }} align="center">
                    {bar.stars}
                  </Txt>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${bar.percent}%` }]} />
                  </View>
                  <Txt variant="labelSm" weight="400" color={colors.muted} style={{ width: 32 }} align="left">
                    {bar.percent}%
                  </Txt>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.verifyNote}>
            <ShieldCheck size={18} color={colors.primary} />
            <Txt variant="small" color={colors.muted} style={{ flex: 1, marginRight: 8 }}>
              جميع التقييمات من زبائن حقيقيين قاموا بطلب الخدمة والتواصل مع الفني عبر منصة مهنتي.
            </Txt>
          </View>
        </View>

        {/* Add review */}
        <View style={[styles.card, { marginTop: 12 }, shadows.level1]}>
          <View style={row}>
            <Txt variant="h3" style={{ flex: 1, fontSize: 19 }}>
              أضف تقييمك وتجربتك
            </Txt>
            <View style={styles.addIcon}>
              <MessageSquarePlus size={18} color={colors.success} />
            </View>
          </View>
          <Txt variant="small" color={colors.muted} align="center" style={{ marginTop: 12 }}>
            انقر لتقييم جودة الخدمة
          </Txt>
          <View style={[row, { justifyContent: 'center', marginTop: 6 }]}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setMyRating(n)} hitSlop={6} style={{ marginHorizontal: 8 }}>
                <Star size={38} color={colors.amber} fill={myRating >= n ? colors.amber : 'transparent'} />
              </Pressable>
            ))}
          </View>
          <Txt variant="label" color={colors.success} align="center" style={{ marginTop: 6 }}>
            {myRating > 0 ? ratingWords[myRating] : 'ممتاز (5 من 5)'}
          </Txt>

          <Txt variant="label" style={{ marginTop: 14 }}>
            أبرز ما ميّز الخدمة:
          </Txt>
          <View style={styles.tagsWrap}>
            {reviewQualityTags.map((tag) => {
              const on = selectedTags.includes(tag);
              return (
                <Pressable key={tag} onPress={() => toggleTag(tag)} style={[styles.qTag, on && styles.qTagOn]}>
                  <Txt variant="label" weight="500" color={colors.primary}>
                    {tag}
                  </Txt>
                </Pressable>
              );
            })}
          </View>

          <Txt variant="label" style={{ marginTop: 14 }}>
            تفاصيل تجربتك:
          </Txt>
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={300}
            textAlign="right"
            textAlignVertical="top"
            placeholder="شاركنا تجربتك: كيف كان التزام المواعيد، الإتقان، وسعر الخدمة؟"
            placeholderTextColor={colors.muted}
            style={styles.comment}
          />
          <View style={[row, { marginTop: 6 }]}>
            <Txt variant="labelSm" weight="400" color={colors.muted} style={{ flex: 1 }}>
              رأيك يساعد أبناء مجتمعنا على اتخاذ القرار الأمثل
            </Txt>
            <Txt variant="labelSm" weight="400" color={colors.muted}>
              {comment.length}/300
            </Txt>
          </View>

          <Pressable
            onPress={publish}
            style={({ pressed }) => [styles.publish, myRating === 0 && { opacity: 0.55 }, pressed && { opacity: 0.85 }]}
          >
            <Txt variant="h4" color={colors.white} align="center" style={{ marginRight: 8 }}>
              نشر التقييم
            </Txt>
            <Send size={18} color={colors.white} style={{ transform: [{ scaleX: -1 }] }} />
          </Pressable>
        </View>

        {/* Reviews list */}
        <View style={styles.listHead}>
          <View style={styles.sortToggle}>
            <Pressable style={[styles.sortItem, sort === 'top' && styles.sortItemOn]} onPress={() => setSort('top')}>
              <Txt variant="labelSm" color={sort === 'top' ? colors.white : colors.text}>
                الأعلى تقييماً
              </Txt>
            </Pressable>
            <Pressable style={[styles.sortItem, sort === 'new' && styles.sortItemOn]} onPress={() => setSort('new')}>
              <Txt variant="labelSm" color={sort === 'new' ? colors.white : colors.text}>
                الأحدث
              </Txt>
            </Pressable>
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.countPill}>
            <Txt variant="labelSm" color={colors.muted}>
              {craftsman.reviewCount}
            </Txt>
          </View>
          <Txt variant="h3" style={{ marginRight: 8, fontSize: 19 }}>
            آراء العملاء
          </Txt>
        </View>

        {shown.map((review) => {
          const isLiked = liked.includes(review.id);
          return (
            <View key={review.id} style={[styles.review, shadows.level1]}>
              <View style={row}>
                {review.photo ? (
                  <Image source={{ uri: review.photo }} style={styles.reviewPhoto} />
                ) : (
                  <View style={[styles.reviewPhoto, styles.initial]}>
                    <Txt variant="h3" color={colors.primary} align="center">
                      {review.initial}
                    </Txt>
                  </View>
                )}
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={row}>
                    <Txt variant="h4" style={{ fontSize: 15 }}>
                      {review.author}
                    </Txt>
                    <CircleCheck size={14} color={colors.success} style={{ marginRight: 4 }} />
                  </View>
                  <Txt variant="labelSm" weight="400" color={colors.muted} numberOfLines={1}>
                    {review.meta}
                  </Txt>
                </View>
                <Txt variant="labelSm" weight="400" color={colors.muted}>
                  {review.time}
                </Txt>
              </View>
              <View style={[row, { marginTop: 8 }]}>
                <Stars value={review.rating} />
                <Txt variant="label" weight="700" style={{ marginRight: 6 }}>
                  {review.rating.toFixed(1)}
                </Txt>
              </View>
              <Txt variant="body" style={{ marginTop: 6 }}>
                {review.text}
              </Txt>
              <View style={[row, { marginTop: 10, gap: 8, justifyContent: 'flex-start' }]}>
                {review.tags.map((tag) => (
                  <View key={tag} style={styles.reviewTag}>
                    <CircleCheck size={12} color={colors.primary} />
                    <Txt variant="labelSm" weight="500" color={colors.primary} style={{ marginRight: 4 }}>
                      {tag}
                    </Txt>
                  </View>
                ))}
              </View>
              <View style={[row, styles.reviewFoot]}>
                <Pressable
                  style={row}
                  onPress={() =>
                    setLiked((current) => (current.includes(review.id) ? current.filter((x) => x !== review.id) : [...current, review.id]))
                  }
                >
                  <ThumbsUp size={16} color={isLiked ? colors.success : colors.muted} fill={isLiked ? colors.mint : 'transparent'} />
                  <Txt variant="labelSm" weight="500" color={isLiked ? colors.success : colors.muted} style={{ marginHorizontal: 4 }}>
                    مفيد ({review.helpful + (isLiked ? 1 : 0)})
                  </Txt>
                </Pressable>
                <View style={{ flex: 1 }} />
                <Txt variant="labelSm" weight="400" color={colors.muted}>
                  {review.note}
                </Txt>
              </View>
            </View>
          );
        })}

        <View style={{ marginTop: 14 }}>
          <TrustBanner
            title="عهد الجودة والشفافية"
            text="في مهنتي، كل حرف وكل نجمة تمثل حماية لأرزاق الحرفيين وثقة لأهلنا في بيوتهم. نسعى لبناء مجتمع يعتمد على الإتقان والإخلاص."
            icon={<Handshake size={24} color={colors.primary} />}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  card: { ...card, marginHorizontal: 14, padding: 14, borderRadius: radius.lg },
  headPhoto: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.tint },
  trusted: {
    ...row,
    backgroundColor: colors.mint,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  barTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.tintStrong, marginHorizontal: 6, overflow: 'hidden', flexDirection: 'row-reverse' },
  barFill: { height: 7, borderRadius: 4, backgroundColor: colors.primaryLight },
  verifyNote: { ...row, backgroundColor: colors.tint, borderRadius: radius.md, padding: 10, marginTop: 12 },
  addIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  qTag: {
    backgroundColor: colors.tintStrong,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  qTagOn: { backgroundColor: colors.mint, borderColor: colors.secondary },
  comment: {
    minHeight: 100,
    marginTop: 8,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.md,
    padding: 12,
    fontFamily: fontFamilies['400'],
    fontSize: 14,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  publish: {
    ...row,
    justifyContent: 'center',
    height: 52,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    marginTop: 14,
  },
  listHead: { ...row, paddingHorizontal: 14, marginTop: 20, marginBottom: 10 },
  sortToggle: { flexDirection: 'row', backgroundColor: colors.tintStrong, borderRadius: radius.full, padding: 3 },
  sortItem: { paddingHorizontal: 12, height: 30, borderRadius: radius.full, justifyContent: 'center' },
  sortItemOn: { backgroundColor: colors.primary },
  countPill: { backgroundColor: colors.tintStrong, borderRadius: radius.full, paddingHorizontal: 10 },
  review: { ...card, marginHorizontal: 14, padding: 14, marginBottom: 12 },
  reviewPhoto: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tint },
  initial: { backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  reviewTag: {
    ...row,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  reviewFoot: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
