import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BadgeCheck,
  ImagePlus,
  Info,
  Lightbulb,
  MapPin,
  MessageSquare,
  Mic,
  Rocket,
  ScanFace,
  Sparkles,
  ThumbsUp,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import Txt from './../../components/Txt';
import HScroll from '../../components/HScroll';
import { aiExamples, aiSteps } from '../../data/mock';
import { card, colors, fontFamilies, radius, row, shadows } from '../../styles/theme';

const initialText = 'الغسالة عندي بتشتغل مي وبتسحب مي، بس لما توصل مرحلة التنشيف بتعصر وطالعة صوت غريب، بدي حدا ثقة يفحصها ويصلحها قريب مني برام الله';

export default function AiSearchScreen() {
  const router = useRouter();
  const [text, setText] = useState<string>(initialText);
  const [recording, setRecording] = useState<boolean>(false);

  const submit = () => {
    router.push({ pathname: '/results', params: { q: text, ai: '1' } });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Assistant intro */}
        <View style={[styles.intro]}>
          <View style={styles.sparkCircle}>
            <Sparkles size={26} color={colors.primary} />
            <View style={styles.liveDot} />
          </View>
          <View style={{ flex: 1, marginRight: 14 }}>
            <Txt variant="h2" style={{ fontSize: 22 }}>
              احكيلنا شو محتاج
            </Txt>
            <View style={row}>
              <View style={styles.statusDot} />
              <Txt variant="small" color={colors.success} style={{ marginRight: 5 }}>
                مساعد مهنتي الذكي متصل ومستعد للمساعدة
              </Txt>
            </View>
          </View>
          <View style={styles.country}>
            <ShieldCheck size={14} color={colors.muted} />
            <Txt variant="labelSm" color={colors.muted} style={{ marginHorizontal: 4 }}>
              فلسطين
            </Txt>
          </View>
        </View>

        {/* Dark explainer */}
        <View style={[styles.dark, shadows.level2]}>
          <View style={row}>
            <Txt variant="h4" color={colors.white} style={{ flex: 1 }}>
              احكي براحتك وبلهجتك العامية
            </Txt>
            <View style={styles.chatCircle}>
              <MessageSquare size={20} color={colors.mint} />
            </View>
          </View>
          <Txt variant="body" color="#D2E6DB" style={{ marginTop: 6, paddingLeft: 56 }}>
            مش لازم تعرف اسم الخدمة الرسمية أو المصطلحات الفنية! احكيلنا المشكلة بطريقتك وعاميتك، وذكاء مهنتي رح يحل المشكلة ويلاقي أنسب المهنيين والمحلات القريبة منك في فلسطين.
          </Txt>
        </View>

        {/* Input card */}
        <View style={[styles.inputCard, shadows.level1]}>
          <View style={styles.locationRow}>
            <MapPin size={18} color={colors.primary} />
            <Txt variant="label" weight="500" style={{ flex: 1, marginRight: 8 }}>
              الموقع: الماصيون، رام الله (ضمن 5 كم)
            </Txt>
            <Pressable>
              <Txt variant="label" color={colors.primary}>
                تغيير
              </Txt>
            </Pressable>
          </View>

          <View style={styles.textBox}>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              maxLength={300}
              textAlign="right"
              textAlignVertical="top"
              placeholder="اكتب مشكلتك هنا..."
              placeholderTextColor={colors.muted}
              style={styles.textInput}
            />
            <View style={styles.insight}>
              <ScanFace size={18} color={colors.success} />
              <Txt variant="labelSm" weight="500" color={colors.success} style={{ flex: 1, marginRight: 6 }}>
                رصد الذكاء: صيانة أجهزة كهربائية منزلية • رام الله
              </Txt>
              <Txt variant="labelSm" weight="400" color={colors.muted}>
                {text.length} حرف
              </Txt>
            </View>
          </View>

          <View style={[row, { marginTop: 12, gap: 10 }]}>
            <Pressable
              style={[styles.actionPill, recording && { backgroundColor: colors.mint }]}
              onPress={() => setRecording((value) => !value)}
            >
              <Mic size={18} color={colors.primary} />
              <Txt variant="label" color={colors.primary} style={{ marginRight: 6 }}>
                {recording ? 'جاري التسجيل...' : 'تسجيل صوتي'}
              </Txt>
            </Pressable>
            <Pressable style={styles.actionPill}>
              <ImagePlus size={18} color={colors.primary} />
              <Txt variant="label" color={colors.primary} style={{ marginRight: 6 }}>
                إرفاق صورة للعطل
              </Txt>
            </Pressable>
          </View>

          <Pressable onPress={submit} style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
            <Txt variant="h3" color={colors.white} align="center" style={{ marginRight: 8 }}>
              ابحث بالذكاء الاصطناعي
            </Txt>
            <Sparkles size={22} color={colors.mint} />
            <Rocket size={20} color={colors.amber} style={{ marginRight: 8 }} />
          </Pressable>
        </View>

        {/* Examples */}
        <View style={styles.exampleHead}>
          <Lightbulb size={22} color={colors.success} />
          <Txt variant="h4" style={{ flex: 1, marginRight: 8, fontSize: 17 }}>
            أمثلة شائعة من أهل البلد
          </Txt>
          <Txt variant="small" color={colors.muted}>
            اضغط للتجربة
          </Txt>
        </View>
        <HScroll contentStyle={{ paddingBottom: 4 }}>
          {aiExamples.map((example) => (
            <Pressable key={example.id} onPress={() => setText(example.text)} style={styles.example}>
              <Zap size={16} color={colors.amber} fill={colors.amber} />
              <Txt variant="label" weight="500" style={{ marginRight: 8 }}>
                {example.text}
              </Txt>
            </Pressable>
          ))}
        </HScroll>

        {/* How it works */}
        <View style={styles.how}>
          <View style={[row, { marginBottom: 12 }]}>
            <View style={styles.infoCircle}>
              <Info size={22} color={colors.white} />
            </View>
            <Txt variant="h2" style={{ flex: 1, marginRight: 10, fontSize: 21 }}>
              كيف بيشتغل الذكاء في مهنتي؟
            </Txt>
          </View>
          {aiSteps.map((step, index) => (
            <View key={step.id} style={styles.step}>
              <View style={styles.stepNumber}>
                <Txt variant="h3" color={colors.primary} align="center">
                  {['١', '٢', '٣'][index]}
                </Txt>
              </View>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Txt variant="h4">{step.title}</Txt>
                <Txt variant="small" color={colors.muted}>
                  {step.text}
                </Txt>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footerRow}>
          <View style={row}>
            <BadgeCheck size={18} color={colors.muted} />
            <Txt variant="small" color={colors.muted} style={{ marginHorizontal: 6 }}>
              مهنيون موثوقون بالهوية
            </Txt>
          </View>
          <View style={row}>
            <ThumbsUp size={18} color={colors.muted} />
            <Txt variant="small" color={colors.muted} style={{ marginHorizontal: 6 }}>
              تقييمات مجتمعية حقيقية
            </Txt>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, paddingBottom: 40 },
  intro: { ...row, backgroundColor: colors.tintStrong, borderRadius: radius.lg, padding: 14 },
  sparkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.tintStrong,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  country: {
    ...row,
    backgroundColor: colors.tint,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    position: 'absolute',
    left: 14,
    top: 14,
    display: 'none',
  },
  dark: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: 16, marginTop: 14 },
  chatCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 24,
  },
  inputCard: { ...card, padding: 14, marginTop: 14, borderRadius: radius.xl },
  locationRow: {
    ...row,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  textBox: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
    padding: 12,
  },
  textInput: {
    minHeight: 110,
    fontFamily: fontFamilies['500'],
    fontSize: 16,
    lineHeight: 28,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  insight: {
    ...row,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  actionPill: {
    ...row,
    flex: 1,
    justifyContent: 'center',
    height: 46,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.full,
  },
  cta: {
    ...row,
    justifyContent: 'center',
    height: 58,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: 14,
  },
  exampleHead: { ...row, marginTop: 24, marginBottom: 12 },
  example: {
    ...row,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    height: 46,
  },
  how: { backgroundColor: colors.tintStrong, borderRadius: radius.lg, padding: 14, marginTop: 24 },
  infoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  step: {
    ...row,
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: { ...row, justifyContent: 'center', gap: 20, marginTop: 24 },
});
