import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  Briefcase,
  ChevronLeft,
  CircleHelp,
  Edit3,
  ExternalLink,
  Hammer,
  History,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  Wrench,
  X,
} from 'lucide-react-native';

import AppHeader from '../../components/AppHeader';
import AuthModal from '../../components/AuthModal';
import Txt from '../../components/Txt';
import { useAuth } from '../../context/AuthContext';
import { getBookings } from '../../services/bookingsService';
import { getSavedCraftsmen } from '../../services/craftsmenService';
import { card, colors, radius, row, shadows } from '../../styles/theme';

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, isLoggedIn, isProfessional, signOut, updateProfile, refreshProfile } =
    useAuth();

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [trustModalVisible, setTrustModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // Profile Edit fields
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Live stats
  const [savedCount, setSavedCount] = useState<number>(0);
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserData = async () => {
    if (!user) {
      setSavedCount(0);
      setBookingsCount(0);
      return;
    }
    try {
      const [savedList, bookingsList] = await Promise.all([
        getSavedCraftsmen(user.id),
        getBookings({ customerId: user.id }),
      ]);
      setSavedCount(savedList.length);
      setBookingsCount(bookingsList.length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshProfile(), loadUserData()]);
    setRefreshing(false);
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthInitialMode(mode);
    setAuthModalVisible(true);
  };

  const handleOpenEditProfile = () => {
    setFullNameInput(profile?.full_name || '');
    setPhoneInput(profile?.phone || '');
    setCityInput(profile?.city || 'رام الله والبيرة');
    setEditProfileVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!fullNameInput.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال الاسم الكامل.');
      return;
    }
    setSavingProfile(true);
    const res = await updateProfile({
      full_name: fullNameInput.trim(),
      phone: phoneInput.trim() || null,
      city: cityInput.trim() || 'رام الله والبيرة',
    });
    setSavingProfile(false);
    if (res.error) {
      Alert.alert('خطأ', res.error);
    } else {
      setEditProfileVisible(false);
      Alert.alert('تم بنجاح', 'تم تحديث بيانات ملفك الشخصي.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من رغبتك في تسجيل الخروج من مهنتي؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل خروج',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          Alert.alert('تم تسجيل الخروج', 'نراك قريباً في مهنتي.');
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* =========================================================
            HEADER IDENTITY
        ========================================================= */}
        <View style={styles.topHeader}>
          <Txt variant="h2" weight="700" color={colors.primary}>
            حسابي في مِهنتي
          </Txt>
          <Txt variant="body" color={colors.muted} style={{ marginTop: 2 }}>
            إدارة الحساب، الحجوزات، والخدمات المسجلة
          </Txt>
        </View>

        {/* =========================================================
            USER CARD (AUTHENTICATED VS GUEST)
        ========================================================= */}
        {isLoggedIn ? (
          <View style={[card, shadows.level2, styles.profileCard]}>
            <View style={[row, { alignItems: 'flex-start', justifyContent: 'space-between' }]}>
              <View style={[row, { gap: 14, flex: 1 }]}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  <Txt variant="h2" weight="700" color={colors.white}>
                    {profile?.full_name ? profile.full_name.trim().charAt(0) : 'م'}
                  </Txt>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <View style={[row, { gap: 8, flexWrap: 'wrap' }]}>
                    <Txt variant="h3" weight="700" color={colors.text}>
                      {profile?.full_name || 'مستخدم مهنتي'}
                    </Txt>
                    <View
                      style={[
                        styles.roleBadge,
                        isProfessional ? styles.roleBadgePro : styles.roleBadgeCustomer,
                      ]}
                    >
                      <Txt
                        variant="labelSm"
                        weight="600"
                        color={isProfessional ? colors.primaryLight : colors.primary}
                      >
                        {isProfessional ? 'مهني معتمد' : 'زبون'}
                      </Txt>
                    </View>
                  </View>

                  {user?.email ? (
                    <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                      {user.email}
                    </Txt>
                  ) : null}

                  <View style={[row, { gap: 6, marginTop: 6 }]}>
                    <MapPin size={14} color={colors.muted} />
                    <Txt variant="small" color={colors.muted}>
                      {profile?.city || 'رام الله والبيرة'}
                    </Txt>
                    {profile?.phone ? (
                      <>
                        <Txt variant="small" color={colors.border}>
                          •
                        </Txt>
                        <Phone size={14} color={colors.muted} />
                        <Txt variant="small" color={colors.muted}>
                          {profile.phone}
                        </Txt>
                      </>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Edit button */}
              <Pressable
                onPress={handleOpenEditProfile}
                style={({ pressed }) => [styles.editIconBtn, pressed && { opacity: 0.8 }]}
                accessibilityRole="button"
                accessibilityLabel="تعديل الملف الشخصي"
              >
                <Edit3 size={18} color={colors.primary} />
              </Pressable>
            </View>

            {/* Quick stats counter */}
            <View style={[row, styles.statsRow]}>
              <Pressable
                style={styles.statBox}
                onPress={() => router.push('/bookings')}
              >
                <Txt variant="h3" weight="700" color={colors.primary}>
                  {bookingsCount}
                </Txt>
                <Txt variant="labelSm" color={colors.muted}>
                  طلبات وحجوزات
                </Txt>
              </Pressable>

              <View style={styles.statDivider} />

              <Pressable
                style={styles.statBox}
                onPress={() => {
                  if (savedCount === 0) {
                    Alert.alert(
                      'الحرفيون المحفوظون',
                      'لا يوجد لديك حرفيون محفوظون حالياً. تصفح الحرفيين واضغط على أيقونة الحفظ لتجدهم هنا.',
                      [{ text: 'تصفح الآن', onPress: () => router.push('/results') }, { text: 'حسناً' }]
                    );
                  } else {
                    router.push({ pathname: '/results', params: { saved: '1' } });
                  }
                }}
              >
                <Txt variant="h3" weight="700" color={colors.primary}>
                  {savedCount}
                </Txt>
                <Txt variant="labelSm" color={colors.muted}>
                  حرفيون محفوظون
                </Txt>
              </Pressable>

              <View style={styles.statDivider} />

              <Pressable
                style={styles.statBox}
                onPress={() => router.push('/services')}
              >
                <Wrench size={20} color={colors.primary} />
                <Txt variant="labelSm" color={colors.muted} style={{ marginTop: 2 }}>
                  خدماتي المنزلية
                </Txt>
              </Pressable>
            </View>
          </View>
        ) : (
          /* GUEST HERO CARD */
          <View style={[card, shadows.level2, styles.guestCard]}>
            <View style={[row, { gap: 12, alignItems: 'flex-start' }]}>
              <View style={styles.guestIconWrap}>
                <Sparkles size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="h3" weight="700" color={colors.primary}>
                  أهلاً بك في مِهنتي!
                </Txt>
                <Txt variant="body" color={colors.muted} style={{ marginTop: 4, lineHeight: 22 }}>
                  سجّل دخولك الآن لتتمكن من حجز الخدمات، حفظ الحرفيين المفضلين، وإدارة صيانة منزلك
                  بأمان وسهولة.
                </Txt>
              </View>
            </View>

            <View style={[row, { gap: 10, marginTop: 16 }]}>
              <Pressable
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={() => handleOpenAuth('login')}
              >
                <View style={[row, { justifyContent: 'center', gap: 8 }]}>
                  <LogIn size={18} color={colors.white} />
                  <Txt variant="label" weight="600" color={colors.white}>
                    تسجيل الدخول
                  </Txt>
                </View>
              </Pressable>

              <Pressable
                style={[styles.outlineBtn, { flex: 1 }]}
                onPress={() => handleOpenAuth('signup')}
              >
                <View style={[row, { justifyContent: 'center', gap: 8 }]}>
                  <UserPlus size={18} color={colors.primary} />
                  <Txt variant="label" weight="600" color={colors.primary}>
                    حساب جديد
                  </Txt>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {/* =========================================================
            PRO BANNER (CALL TO JOIN AS CRAFTSMAN)
        ========================================================= */}
        {!isProfessional ? (
          <Pressable
            style={[card, shadows.level1, styles.joinBanner]}
            onPress={() => router.push('/join')}
          >
            <View style={[row, { justifyContent: 'space-between' }]}>
              <View style={[row, { gap: 12, flex: 1 }]}>
                <View style={styles.joinIconWrap}>
                  <Hammer size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="h4" weight="700" color={colors.primary}>
                    هل أنت فني أو صاحب مهنة؟
                  </Txt>
                  <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                    سجّل في مهنتي مجاناً واستقبل طلبات الصيانة من زبائن منطقتك
                  </Txt>
                </View>
              </View>
              <ChevronLeft size={20} color={colors.muted} />
            </View>
          </Pressable>
        ) : null}

        {/* =========================================================
            MENU ACTIONS
        ========================================================= */}
        <View style={styles.sectionHeader}>
          <Txt variant="h4" weight="700" color={colors.text}>
            الخدمات والإعدادات
          </Txt>
        </View>

        <View style={[card, shadows.level1, styles.menuGroup]}>
          {/* 1. Bookings */}
          <Pressable
            style={[row, styles.menuItem]}
            onPress={() => router.push('/bookings')}
          >
            <View style={[row, { gap: 12, flex: 1 }]}>
              <View style={styles.menuIconWrap}>
                <History size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyLg" weight="600" color={colors.text}>
                  سجل الحجوزات والطلبات
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  متابعة حالة المواعيد والفنيين
                </Txt>
              </View>
            </View>
            <ChevronLeft size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.divider} />

          {/* 2. My Services */}
          <Pressable
            style={[row, styles.menuItem]}
            onPress={() => router.push('/services')}
          >
            <View style={[row, { gap: 12, flex: 1 }]}>
              <View style={styles.menuIconWrap}>
                <Wrench size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyLg" weight="600" color={colors.text}>
                  خدماتي وأجهزتي المنزلية
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  تتبع الصيانة الدورية وتنبيهات الأجهزة
                </Txt>
              </View>
            </View>
            <ChevronLeft size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.divider} />

          {/* 3. Saved Craftsmen */}
          <Pressable
            style={[row, styles.menuItem]}
            onPress={() => {
              if (savedCount === 0) {
                Alert.alert(
                  'الحرفيون المحفوظون',
                  'لم تقم بحفظ أي حرفي بعد. استكشف الحرفيين واضغط على زر الحفظ لتجدهم هنا.',
                  [{ text: 'استكشاف', onPress: () => router.push('/results') }, { text: 'إغلاق' }]
                );
              } else {
                router.push({ pathname: '/results', params: { saved: '1' } });
              }
            }}
          >
            <View style={[row, { gap: 12, flex: 1 }]}>
              <View style={styles.menuIconWrap}>
                <Bookmark size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyLg" weight="600" color={colors.text}>
                  الحرفيون المحفوظون
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  قائمتك المفضلة للوصول السريع
                </Txt>
              </View>
            </View>
            {savedCount > 0 ? (
              <View style={styles.badgePill}>
                <Txt variant="labelSm" color={colors.primary} weight="700">
                  {savedCount}
                </Txt>
              </View>
            ) : null}
            <ChevronLeft size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.divider} />

          {/* 4. Map */}
          <Pressable
            style={[row, styles.menuItem]}
            onPress={() => router.push('/map')}
          >
            <View style={[row, { gap: 12, flex: 1 }]}>
              <View style={styles.menuIconWrap}>
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyLg" weight="600" color={colors.text}>
                  خريطة الحرفيين القريبين
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  استكشف الفنيين المتاحين حول موقعك
                </Txt>
              </View>
            </View>
            <ChevronLeft size={18} color={colors.muted} />
          </Pressable>
        </View>

        {/* =========================================================
            TRUST & SUPPORT GROUP
        ========================================================= */}
        <View style={styles.sectionHeader}>
          <Txt variant="h4" weight="700" color={colors.text}>
            الأمان والدعم
          </Txt>
        </View>

        <View style={[card, shadows.level1, styles.menuGroup]}>
          {/* Trust & Guarantee */}
          <Pressable
            style={[row, styles.menuItem]}
            onPress={() => setTrustModalVisible(true)}
          >
            <View style={[row, { gap: 12, flex: 1 }]}>
              <View style={styles.menuIconWrap}>
                <ShieldCheck size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyLg" weight="600" color={colors.text}>
                  ضمان مهنتي وسياسة الأمان
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  كفالة الخدمة، الشفافية، ومعايير الفحص
                </Txt>
              </View>
            </View>
            <ChevronLeft size={18} color={colors.muted} />
          </Pressable>

          <View style={styles.divider} />

          {/* Help & Support */}
          <Pressable
            style={[row, styles.menuItem]}
            onPress={() => setHelpModalVisible(true)}
          >
            <View style={[row, { gap: 12, flex: 1 }]}>
              <View style={styles.menuIconWrap}>
                <CircleHelp size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodyLg" weight="600" color={colors.text}>
                  المساعدة وتواصل معنا
                </Txt>
                <Txt variant="small" color={colors.muted}>
                  مركز الدعم والأسئلة الشائعة
                </Txt>
              </View>
            </View>
            <ChevronLeft size={18} color={colors.muted} />
          </Pressable>

          {isLoggedIn ? (
            <>
              <View style={styles.divider} />
              {/* Logout Button */}
              <Pressable
                style={[row, styles.menuItem]}
                onPress={handleSignOut}
              >
                <View style={[row, { gap: 12, flex: 1 }]}>
                  <View style={[styles.menuIconWrap, { backgroundColor: colors.errorSoft }]}>
                    <LogOut size={20} color={colors.error} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyLg" weight="600" color={colors.error}>
                      تسجيل الخروج
                    </Txt>
                    <Txt variant="small" color={colors.muted}>
                      إنهاء الجلسة الحالية من هذا الجهاز
                    </Txt>
                  </View>
                </View>
              </Pressable>
            </>
          ) : null}
        </View>

        {/* Footer info */}
        <View style={styles.footer}>
          <Txt variant="small" color={colors.muted} style={{ textAlign: 'center' }}>
            تطبيق مِهنتي — فلسطين 🇵🇸
          </Txt>
          <Txt variant="small" color={colors.muted} style={{ textAlign: 'center', marginTop: 2 }}>
            الإصدار 1.2.0 • المنصة الوطنية لخدمات الصيانة المعتمدة
          </Txt>
        </View>
      </ScrollView>

      {/* =========================================================
          AUTH MODAL
      ========================================================= */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
        initialMode={authInitialMode}
        onSuccess={() => {
          loadUserData();
        }}
      />

      {/* =========================================================
          EDIT PROFILE MODAL
      ========================================================= */}
      <Modal
        visible={editProfileVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.level3]}>
            <View style={[row, styles.modalHeader]}>
              <Pressable
                onPress={() => setEditProfileVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.muted} />
              </Pressable>
              <Txt variant="h3" weight="700" color={colors.primary}>
                تعديل الملف الشخصي
              </Txt>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
              {/* Full Name */}
              <View style={styles.fieldWrap}>
                <Txt variant="small" weight="600" color={colors.text} style={styles.fieldLabel}>
                  الاسم الكامل
                </Txt>
                <TextInput
                  style={styles.textInput}
                  value={fullNameInput}
                  onChangeText={setFullNameInput}
                  placeholder="اسمك الكامل"
                  placeholderTextColor={colors.muted}
                  textAlign="right"
                />
              </View>

              {/* Phone */}
              <View style={styles.fieldWrap}>
                <Txt variant="small" weight="600" color={colors.text} style={styles.fieldLabel}>
                  رقم الهاتف
                </Txt>
                <TextInput
                  style={styles.textInput}
                  value={phoneInput}
                  onChangeText={setPhoneInput}
                  placeholder="059xxxxxxx"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>

              {/* City */}
              <View style={styles.fieldWrap}>
                <Txt variant="small" weight="600" color={colors.text} style={styles.fieldLabel}>
                  المدينة / المنطقة
                </Txt>
                <TextInput
                  style={styles.textInput}
                  value={cityInput}
                  onChangeText={setCityInput}
                  placeholder="مثال: رام الله والبيرة"
                  placeholderTextColor={colors.muted}
                  textAlign="right"
                />
              </View>

              <Pressable
                style={[styles.primaryBtn, savingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={savingProfile}
              >
                {savingProfile ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Txt variant="label" weight="600" color={colors.white}>
                    حفظ التغييرات
                  </Txt>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================
          TRUST MODAL
      ========================================================= */}
      <Modal
        visible={trustModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setTrustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.level3]}>
            <View style={[row, styles.modalHeader]}>
              <Pressable
                onPress={() => setTrustModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.muted} />
              </Pressable>
              <Txt variant="h3" weight="700" color={colors.primary}>
                الأمان وضمان مهنتي
              </Txt>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18 }}>
              <View style={[row, { gap: 12, marginBottom: 14 }]}>
                <View style={styles.trustIconCircle}>
                  <ShieldCheck size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="h4" weight="700" color={colors.primary}>
                    ضمان خدمة يصل إلى 30 يوماً
                  </Txt>
                  <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                    أي خدمة تتم عبر فنيي مهنتي المعتمدين مشمولة بضمان الجودة وقطع الغيار الأصلية.
                  </Txt>
                </View>
              </View>

              <View style={[row, { gap: 12, marginBottom: 14 }]}>
                <View style={styles.trustIconCircle}>
                  <UserCheck size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="h4" weight="700" color={colors.primary}>
                    تحقق مهني وهويّة موثقة
                  </Txt>
                  <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                    يتم التحقق من مهارات الفنيين، وتفاصيل عملهم، وخبراتهم الميدانية لضمان راحة بالك.
                  </Txt>
                </View>
              </View>

              <View style={[row, { gap: 12, marginBottom: 18 }]}>
                <View style={styles.trustIconCircle}>
                  <Wrench size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="h4" weight="700" color={colors.primary}>
                    شفافية تامة في التسعير
                  </Txt>
                  <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                    تحديد سعر الكشفية قبل الزيارة، وخصمها من قيمة التصليح عند إتمام الصيانة.
                  </Txt>
                </View>
              </View>

              <Pressable
                style={styles.primaryBtn}
                onPress={() => setTrustModalVisible(false)}
              >
                <Txt variant="label" weight="600" color={colors.white}>
                  فهمت ذلك، شكراً
                </Txt>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =========================================================
          HELP MODAL
      ========================================================= */}
      <Modal
        visible={helpModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, shadows.level3]}>
            <View style={[row, styles.modalHeader]}>
              <Pressable
                onPress={() => setHelpModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color={colors.muted} />
              </Pressable>
              <Txt variant="h3" weight="700" color={colors.primary}>
                المساعدة والدعم الفني
              </Txt>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18 }}>
              <Txt variant="body" color={colors.text} style={{ lineHeight: 24 }}>
                فريق دعم منصة مهنتي متواجد دائماً لمساعدتك في كل ما يتعلق بالطلبات، حجز الفنيين، أو
                تسجيل نشاطك المهني في فلسطين.
              </Txt>

              <View style={[card, { padding: 14, marginVertical: 14, backgroundColor: colors.tint }]}>
                <Txt variant="label" color={colors.primary} weight="700">
                  قنوات التواصل المباشرة:
                </Txt>
                <Txt variant="small" color={colors.text} style={{ marginTop: 4 }}>
                  • البريد الإلكتروني: support@mihnati.ps
                </Txt>
                <Txt variant="small" color={colors.text} style={{ marginTop: 2 }}>
                  • الهاتف / واتساب: +970 59 876 5432
                </Txt>
                <Txt variant="small" color={colors.muted} style={{ marginTop: 2 }}>
                  • ساعات العمل: يومياً من 08:00 صباحاً حتى 09:00 مساءً
                </Txt>
              </View>

              <Pressable
                style={styles.primaryBtn}
                onPress={() => setHelpModalVisible(false)}
              >
                <Txt variant="label" weight="600" color={colors.white}>
                  إغلاق
                </Txt>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topHeader: {
    paddingVertical: 14,
  },
  profileCard: {
    padding: 16,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  roleBadgeCustomer: {
    backgroundColor: colors.tint,
  },
  roleBadgePro: {
    backgroundColor: colors.mintSoft,
  },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  guestCard: {
    padding: 18,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  guestIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBanner: {
    padding: 14,
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  joinIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
  },
  menuGroup: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  menuItem: {
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  badgePill: {
    backgroundColor: colors.tint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  footer: {
    marginTop: 10,
    paddingVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-between',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    marginBottom: 6,
    textAlign: 'right',
  },
  textInput: {
    height: 48,
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Cairo_500Medium',
    color: colors.text,
  },
  trustIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
