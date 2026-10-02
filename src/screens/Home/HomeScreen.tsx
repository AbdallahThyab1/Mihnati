import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowUpLeft, HandHelping, MapPin, Navigation, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import SearchBar from '../../components/SearchBar';
import SectionHeader from '../../components/SectionHeader';
import CategoryIcon from '../../components/CategoryIcon';
import CraftsmanCard from '../../components/CraftsmanCard';
import TrustBanner from '../../components/TrustBanner';
import Txt from '../../components/Txt';
import { categories, craftsmen, getCraftsman, topReviews } from '../../data/mock';
import { card, colors, radius, row, shadows } from '../../styles/theme';

const aiSuggestions: string[] = ['الغسالة بتشتغل بس ما بتعصر', 'بدي كهربجي شاطر قريب', 'تصليح شاشة آيفون'];

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');

  const goToResults = (text: string) => {
    router.push({ pathname: '/results', params: { q: text } });
  };

  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.cityChip}>
            <MapPin size={12} color={colors.primary} />
            <Txt variant="labelSm" color={colors.primary} style={{ marginRight: 4 }}>
              رام الله والبيرة
            </Txt>
          </View>
          <Txt variant="bodyLg" weight="600" color={colors.text} style={{ flex: 1 }}>
            مرحباً بك في مهنتي
          </Txt>
        </View>
        <View style={styles.padded}>
          <Txt variant="h1" style={styles.hero}>
            شو محتاج اليوم؟
          </Txt>
          <Txt variant="body" color={colors.muted}>
            ابحث عن خدمة موثوقة أو احكيلنا شو المشكلة اللي عندك لنساعدك فوراً
          </Txt>
        </View>

        <View style={[styles.padded, { marginTop: 20 }]}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث عن كهربجي، صيانة مكيفات، مصلح غسالات..."
            onSubmit={() => goToResults(query)}
            onFilterPress={() => router.push('/results')}
          />
        </View>

        {/* AI assistant card */}
        <View style={[styles.padded, { marginTop: 18 }]}>
          <LinearGradient
            colors={[colors.primary, '#2D6A4F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.aiCard, shadows.level3]}
          >
            <View style={row}>
              <View style={styles.aiBadge}>
                <Sparkles size={12} color={colors.mint} />
                <Txt variant="labelSm" color={colors.mint} style={{ marginRight: 4 }}>
                  مساعد مهنتي الذكي
                </Txt>
              </View>
              <View style={{ flex: 1 }} />
              <View style={styles.aiBadgeDark}>
                <Txt variant="labelSm" color="#B7D9C7">
                  ذكاء اصطناعي محلي
                </Txt>
              </View>
            </View>
            <Txt variant="h2" color={colors.white} style={{ marginTop: 10 }}>
              احكيلي شو محتاج
            </Txt>
            <Txt variant="body" color="#CFE5D9" style={{ marginTop: 2 }}>
              مش ضروري تعرف اسم المهنة. اوصف المشكلة بالعامية ونحن بنوصلك للشخص الصح في دقايق.
            </Txt>
            <View style={styles.aiChips}>
              {aiSuggestions.map((text) => (
                <Pressable key={text} style={styles.aiChip} onPress={() => router.push('/search')}>
                  <ArrowUpLeft size={13} color="#CFE5D9" />
                  <Txt variant="labelSm" weight="500" color={colors.white} style={{ marginRight: 4 }}>
                    {text}
                  </Txt>
                </Pressable>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Categories */}
        <View style={{ marginTop: 28 }}>
          <SectionHeader title="الخدمات الأكثر طلباً" actionLabel="عرض الكل" onActionPress={() => router.push('/results')} />
          <View style={styles.grid}>
            {categories.map((category) => (
              <Pressable
                key={category.id}
                style={styles.category}
                onPress={() => router.push({ pathname: '/results', params: { q: category.label } })}
              >
                <View style={styles.categoryIcon}>
                  <CategoryIcon icon={category.icon} color={colors.primary} size={24} />
                </View>
                <Txt variant="labelSm" weight="500" align="center" numberOfLines={1}>
                  {category.label}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Nearby */}
        <View style={{ marginTop: 26 }}>
          <SectionHeader
            title="قريب منك في رام الله"
            icon={<Navigation size={20} color={colors.primary} />}
            rightNote={
              <View style={styles.liveChip}>
                <Txt variant="labelSm" color={colors.success}>
                  متاحين الآن
                </Txt>
              </View>
            }
          />
          {craftsmen.slice(0, 3).map((craftsman) => (
            <CraftsmanCard key={craftsman.id} craftsman={craftsman} />
          ))}
        </View>

        {/* Top rated this week */}
        <View style={{ marginTop: 18 }}>
          <SectionHeader title="الأعلى تقييماً هذا الأسبوع" icon={<Trophy size={20} color={colors.amber} />} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topList}
            style={{ transform: [{ scaleX: 1 }] }}
          >
            {topReviews.map((review) => {
              const craftsman = getCraftsman(review.craftsmanId);
              return (
                <Pressable
                  key={review.id}
                  style={[styles.topCard, shadows.level1]}
                  onPress={() => router.push({ pathname: '/profile/[id]', params: { id: craftsman.id } })}
                >
                  <View style={row}>
                    <Image source={{ uri: craftsman.photo }} style={styles.topPhoto} />
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Txt variant="h4" numberOfLines={1}>
                        {craftsman.name}
                      </Txt>
                      <View style={row}>
                        <Star size={12} color={colors.amber} fill={colors.amber} />
                        <Txt variant="small" weight="700" style={{ marginRight: 3 }}>
                          {craftsman.rating.toFixed(1)}
                        </Txt>
                        <Txt variant="small" color={colors.muted} style={{ marginRight: 3 }}>
                          ({craftsman.reviewCount} تقييم)
                        </Txt>
                      </View>
                    </View>
                  </View>
                  <View style={styles.quote}>
                    <Txt variant="small" color={colors.text} style={{ fontStyle: 'italic' }} numberOfLines={3}>
                      "{review.quote}"
                    </Txt>
                    <Txt variant="labelSm" weight="400" color={colors.muted} align="left" style={{ marginTop: 4 }}>
                      - {review.author}
                    </Txt>
                  </View>
                  <View style={[row, { marginTop: 10 }]}>
                    <ShieldCheck size={14} color={colors.success} />
                    <Txt variant="labelSm" color={colors.success} style={{ marginRight: 4, flex: 1 }}>
                      {review.footer}
                    </Txt>
                    <View style={styles.contactBtn}>
                      <Txt variant="labelSm" color={colors.primary}>
                        تواصل
                      </Txt>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={{ marginTop: 22 }}>
          <TrustBanner
            title="ضمان مهنتي لأهالينا"
            text="جميع المهنيين مسجلين بهويات وتحقق رسمي، مع التزام تام بالأسعار المعلنة والشفافية."
            icon={<HandHelping size={24} color={colors.primary} />}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: 40 },
  padded: { paddingHorizontal: 16 },
  greeting: { ...row, paddingHorizontal: 16, paddingTop: 14 },
  cityChip: {
    ...row,
    backgroundColor: colors.tintStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  hero: { fontSize: 28, lineHeight: 40, marginTop: 2 },
  aiCard: { borderRadius: radius.xl, padding: 18 },
  aiBadge: {
    ...row,
    backgroundColor: 'rgba(161,244,200,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  aiBadgeDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  aiChips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  aiChip: {
    ...row,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', paddingHorizontal: 8 },
  category: { width: '20%', alignItems: 'center', paddingHorizontal: 4, marginBottom: 14 },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  liveChip: {
    backgroundColor: colors.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  topList: { paddingHorizontal: 16, gap: 12, flexDirection: 'row-reverse' },
  topCard: { ...card, width: 300, padding: 14 },
  topPhoto: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.tint },
  quote: {
    backgroundColor: colors.tint,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 10,
  },
  contactBtn: {
    backgroundColor: colors.tintStrong,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
});
