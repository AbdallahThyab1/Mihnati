import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleCheck,
  Contact,
  Handshake,
  Info,
  MessageSquare,
  Phone,
  Sparkles,
  Star,
  Store,
  Wallet,
  Wrench,
  Zap,
  ShieldCheck,
  Settings,
} from 'lucide-react-native';
import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';
import { card, colors, fontFamilies, radius, row, shadows } from '../../styles/theme';

const stepLabels: string[] = ['النشاط', 'الخدمات', 'الموقع', 'التأكيد'];
const specialties: string[] = ['تمديدات جديدة', 'صيانة قواطع', 'تركيب إنارة وليدات', 'طوارئ كهربائية 24/7', 'فحص أحمال ومولدات'];
const profilePhoto = 'https://images.unsplash.com/photo-1709381120033-86deda767904?w=300&q=80&fit=crop';

interface FieldCardProps {
  title: string;
  icon: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}

function FieldCard({ title, icon, required = false, children }: FieldCardProps) {
  return (
    <View style={[styles.card, shadows.level1]}>
      <View style={[row, { marginBottom: 12 }]}>
        {icon}
        <Txt variant="h4" style={{ marginRight: 8 }}>
          {title}
          {required ? <Txt variant="h4" color={colors.error}> *</Txt> : null}
        </Txt>
      </View>
      {children}
    </View>
  );
}

export default function JoinScreen() {
  const router = useRouter();
  const [shopName, setShopName] = useState<string>('ورشة النور للتمديدات الكهربائية');
  const [selected, setSelected] = useState<string[]>(['تمديدات جديدة', 'صيانة قواطع', 'طوارئ كهربائية 24/7']);
  const [bio, setBio] = useState<string>(
    'فني كهرباء مرخص ومعتمد بخبرة تزيد عن 9 سنوات في رام الله والبيرة وضواحيها. متخصص بتنفيذ شبكات الكهرباء الحديثة، وصيانة الأعطال المستعصية بأمان ودقة عالية مع ضمان على جميع الأعمال المنفذة.'
  );
  const [phone, setPhone] = useState<string>('059 876 5432');
  const [whatsapp, setWhatsapp] = useState<boolean>(true);
  const [fee, setFee] = useState<string>('30 - 50 شيكل (تخصم في حال الاتفاق على العمل)');

  const toggle = (item: string) => {
    setSelected((current) => (current.includes(item) ? current.filter((x) => x !== item) : [...current, item]));
  };

  const goHome = () => router.replace('/');

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="انضم كحرفي" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {/* Stepper */}
        <View style={styles.stepper}>
          <View style={row}>
            <View style={{ flex: 1 }}>
              <Txt variant="small" color={colors.muted}>
                انضم إلى شبكة مهنتي الحرفية
              </Txt>
              <Txt variant="h2" style={{ fontSize: 21 }}>
                معلومات النشاط الأساسية
              </Txt>
            </View>
            <View style={styles.stepPill}>
              <CircleCheck size={14} color={colors.primary} />
              <Txt variant="labelSm" color={colors.primary} style={{ marginRight: 4 }}>
                خطوة 1 من 4
              </Txt>
            </View>
          </View>
          <View style={[row, { marginTop: 14, alignItems: 'flex-start' }]}>
            {stepLabels.map((label, index) => (
              <View key={label} style={{ flex: 1, alignItems: 'center' }}>
                <View style={[styles.stepBar, index === 0 && { backgroundColor: colors.primary }]} />
                <View style={[styles.stepDot, index === 0 && { backgroundColor: colors.primary }]}>
                  <Txt variant="labelSm" color={index === 0 ? colors.white : colors.muted} align="center">
                    {index + 1}
                  </Txt>
                </View>
                <Txt variant="labelSm" weight="400" color={index === 0 ? colors.primary : colors.muted}>
                  {label}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 12, paddingTop: 14 }}>
          <LinearGradient colors={[colors.primary, '#2D6A4F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promo}>
            <View style={row}>
              <View style={{ flex: 1 }}>
                <Txt variant="h3" color={colors.white}>
                  انضمام مجاني وفرص مستمرة
                </Txt>
                <Txt variant="small" color="#CFE5D9">
                  انضمامك لمهنتي مجاني 100% وبساعد آلاف المواطنين في مدينتك وقريتك يوصلوا لخدماتك ويثقوا بشغلك واحترافيتك بكل سلاسة.
                </Txt>
              </View>
              <View style={styles.promoIcon}>
                <Handshake size={24} color={colors.mint} />
              </View>
            </View>
          </LinearGradient>

          <FieldCard title="اسم المهني أو المحل التجاري" required icon={<Store size={20} color={colors.text} />}>
            <TextInput value={shopName} onChangeText={setShopName} textAlign="right" style={styles.input} />
            <Txt variant="small" color={colors.muted} style={{ marginTop: 10 }}>
              يظهر هذا الاسم بوضوح للزبائن في نتائج البحث وقوائم الحرفيين.
            </Txt>
          </FieldCard>

          <FieldCard title="التصنيف المهني الرئيسي" required icon={<Wrench size={20} color={colors.text} />}>
            <View style={[styles.input, row, { justifyContent: 'space-between' }]}>
              <Txt variant="body" style={{ flex: 1 }}>
                كهرباء وتمديدات منزلية
              </Txt>
              <ChevronDown size={20} color={colors.text} />
            </View>
            <Txt variant="small" color={colors.muted} style={{ marginTop: 12 }}>
              الخدمات التخصصية (اختر ما يناسبك):
            </Txt>
            <View style={styles.wrap}>
              {specialties.map((item) => {
                const on = selected.includes(item);
                return (
                  <Pressable key={item} onPress={() => toggle(item)} style={[styles.spec, on && styles.specOn]}>
                    {on ? <Check size={14} color={colors.white} style={{ marginLeft: 6 }} /> : null}
                    <Txt variant="label" weight="600" color={on ? colors.white : colors.text}>
                      {item}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
          </FieldCard>

          <FieldCard title="نبذة تعريفية بالخبرة والعمل" icon={<Contact size={20} color={colors.text} />}>
            <View style={[row, { marginBottom: 8 }]}>
              <View style={{ flex: 1 }} />
              <View style={[row, styles.smart]}>
                <Sparkles size={11} color={colors.primary} />
                <Txt variant="labelSm" color={colors.primary} style={{ marginRight: 3 }}>
                  اقتراح ذكي
                </Txt>
              </View>
            </View>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              textAlign="right"
              textAlignVertical="top"
              style={[styles.input, { minHeight: 120, paddingTop: 12, lineHeight: 24 }]}
            />
            <View style={[styles.wrap, { marginTop: 12 }]}>
              <View style={[styles.mini, { backgroundColor: colors.mintSoft }]}>
                <Settings size={12} color={colors.success} />
                <Txt variant="labelSm" color={colors.success} style={{ marginRight: 4 }}>
                  دقة بالمواعيد
                </Txt>
              </View>
              <View style={[styles.mini, { backgroundColor: colors.mintSoft }]}>
                <ShieldCheck size={12} color={colors.success} />
                <Txt variant="labelSm" color={colors.success} style={{ marginRight: 4 }}>
                  كفالة مصنعية
                </Txt>
              </View>
              <View style={[styles.mini, { backgroundColor: colors.mintSoft }]}>
                <Zap size={12} color={colors.success} />
                <Txt variant="labelSm" color={colors.success} style={{ marginRight: 4 }}>
                  سرعة استجابة
                </Txt>
              </View>
            </View>
          </FieldCard>

          <FieldCard title="رقم الهاتف للتواصل المباشر" required icon={<Phone size={20} color={colors.text} />}>
            <View style={[styles.input, row]}>
              <Txt variant="label" weight="600" color={colors.text} align="left">
                🇵🇸 +970
              </Txt>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                textAlign="left"
                style={[styles.phoneInput]}
              />
            </View>
            <View style={styles.whatsapp}>
              <View style={styles.waIcon}>
                <MessageSquare size={20} color={colors.white} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 12 }}>
                <Txt variant="label" weight="700">
                  توفر واتساب للمراسلة السريعة
                </Txt>
                <Txt variant="labelSm" weight="400" color={colors.muted}>
                  يسمح للزبائن بإرسال صور وفيديوهات العطل فورا
                </Txt>
              </View>
              <Switch
                value={whatsapp}
                onValueChange={setWhatsapp}
                trackColor={{ true: colors.success, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
          </FieldCard>

          <FieldCard title="كشفية المعاينة وفحص الموقع" icon={<Wallet size={20} color={colors.text} />}>
            <TextInput value={fee} onChangeText={setFee} textAlign="right" style={styles.input} />
            <View style={[row, { marginTop: 10, alignItems: 'flex-start' }]}>
              <Info size={15} color={colors.muted} style={{ marginTop: 3 }} />
              <Txt variant="small" color={colors.muted} style={{ flex: 1, marginRight: 6 }}>
                الشفافية في الكشفية تبني ثقة فورية مع الزبون وتقلل التردد في التواصل.
              </Txt>
            </View>
          </FieldCard>

          {/* Live preview */}
          <View style={[styles.card, shadows.level1]}>
            <View style={[row, { marginBottom: 10 }]}>
              <View style={styles.live}>
                <Txt variant="labelSm" color={colors.primary}>
                  عرض حي
                </Txt>
              </View>
              <Txt variant="h4" style={{ flex: 1, marginRight: 8, fontSize: 15 }}>
                معاينة ظهور بطاقة نشاطك المهني
              </Txt>
            </View>
            <View style={[row, styles.previewCard]}>
              <Image source={{ uri: profilePhoto }} style={styles.previewPhoto} />
              <View style={{ flex: 1, marginRight: 12 }}>
                <View style={row}>
                  <Txt variant="h3" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {shopName.length > 0 ? shopName : 'اسم نشاطك'}
                  </Txt>
                  <BadgeCheck size={16} color={colors.success} style={{ marginRight: 4 }} />
                </View>
                <Txt variant="small" color={colors.muted}>
                  كهرباء وتمديدات منزلية • رام الله
                </Txt>
                <View style={row}>
                  <Star size={13} color={colors.amber} fill={colors.amber} />
                  <Txt variant="small" weight="700" style={{ marginRight: 3 }}>
                    5.0
                  </Txt>
                  <Txt variant="small" color={colors.muted} style={{ marginRight: 4 }}>
                    (نشاط مسجل حديثاً)
                  </Txt>
                </View>
              </View>
            </View>
          </View>

          <Pressable onPress={() => router.push('/search')} style={({ pressed }) => [styles.save, pressed && { opacity: 0.9 }]}>
            <Txt variant="h4" color={colors.white} align="center" style={{ marginRight: 8 }}>
              حفظ ومتابعة إلى الخدمات (2/4)
            </Txt>
            <ArrowRight size={20} color={colors.white} style={{ transform: [{ scaleX: -1 }] }} />
          </Pressable>
          <Pressable onPress={goHome} style={styles.cancel}>
            <Txt variant="label" color={colors.text} align="center">
              إلغاء والعودة للرئيسية
            </Txt>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  stepper: { backgroundColor: colors.tint, padding: 16, paddingBottom: 12 },
  stepPill: {
    ...row,
    backgroundColor: colors.mint,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  stepBar: { height: 4, alignSelf: 'stretch', marginHorizontal: 3, borderRadius: 2, backgroundColor: colors.border },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  promo: { borderRadius: radius.lg, padding: 16, marginBottom: 12 },
  promoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  card: { ...card, padding: 16, marginBottom: 12 },
  input: {
    backgroundColor: colors.tint,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
    fontFamily: fontFamilies['400'],
    fontSize: 14,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  phoneInput: {
    flex: 1,
    marginLeft: 12,
    minHeight: 48,
    fontFamily: fontFamilies['500'],
    fontSize: 15,
    color: colors.text,
    outlineStyle: 'none',
  } as object,
  wrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  spec: {
    ...row,
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.tintStrong,
  },
  specOn: { backgroundColor: colors.primary },
  smart: { backgroundColor: colors.mintSoft, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  mini: { ...row, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  whatsapp: { ...row, backgroundColor: colors.tint, borderRadius: radius.md, padding: 12, marginTop: 12 },
  waIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  live: { backgroundColor: colors.mintSoft, borderRadius: radius.full, paddingHorizontal: 8 },
  previewCard: { backgroundColor: colors.tint, borderRadius: radius.lg, padding: 12 },
  previewPhoto: { width: 64, height: 64, borderRadius: radius.md, backgroundColor: colors.tintStrong },
  save: {
    ...row,
    justifyContent: 'center',
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: 4,
  },
  cancel: {
    height: 48,
    justifyContent: 'center',
    backgroundColor: colors.tintStrong,
    borderRadius: radius.md,
    marginTop: 10,
  },
});
