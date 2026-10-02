import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, CircleHelp, Hammer, History, MapPin, Settings, ShieldCheck, User } from 'lucide-react-native';
import AppHeader from '../../components/AppHeader';
import Txt from '../../components/Txt';
import { card, colors, radius, row, shadows } from '../../styles/theme';

interface MenuItem {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  route?: '/join' | '/results';
}

const items: MenuItem[] = [
  { id: 'join', label: 'انضم كحرفي', hint: 'سجّل نشاطك مجاناً وابدأ باستقبال الزبائن', icon: <Hammer size={20} color={colors.primary} />, route: '/join' },
  { id: 'saved', label: 'الحرفيون المحفوظون', hint: 'قائمتك المفضلة للوصول السريع', icon: <Bookmark size={20} color={colors.primary} />, route: '/results' },
  { id: 'history', label: 'سجل الطلبات', hint: 'تابع الخدمات التي طلبتها سابقاً', icon: <History size={20} color={colors.primary} /> },
  { id: 'location', label: 'موقعي', hint: 'رام الله والبيرة', icon: <MapPin size={20} color={colors.primary} /> },
  { id: 'trust', label: 'الأمان والتحقق', hint: 'كيف نتحقق من هويات المهنيين', icon: <ShieldCheck size={20} color={colors.primary} /> },
  { id: 'settings', label: 'الإعدادات', hint: 'اللغة، الإشعارات والخصوصية', icon: <Settings size={20} color={colors.primary} /> },
  { id: 'help', label: 'المساعدة والدعم', hint: 'نحن هنا لمساعدتك', icon: <CircleHelp size={20} color={colors.primary} /> },
];

export default function AccountScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.profile, shadows.level2]}>
          <View style={styles.avatar}>
            <User size={30} color={colors.white} />
          </View>
          <View style={{ flex: 1, marginRight: 14 }}>
            <Txt variant="h3">أهلاً بك في مهنتي</Txt>
            <Txt variant="small" color="#CFE5D9">
              سجّل دخولك لحفظ الحرفيين ومتابعة طلباتك
            </Txt>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.tint }]}
              onPress={() => (item.route ? router.push(item.route) : undefined)}
            >
              <View style={styles.itemIcon}>{item.icon}</View>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Txt variant="h4" style={{ fontSize: 15 }}>
                  {item.label}
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  {item.hint}
                </Txt>
              </View>
              <ChevronLeft size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, paddingBottom: 40 },
  profile: {
    ...row,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: 18,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    ...card,
    ...row,
    padding: 14,
    marginBottom: 10,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
