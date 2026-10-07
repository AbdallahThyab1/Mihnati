import React from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Bookmark,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Hammer,
  History,
  MapPin,
  MapPinned,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react-native';

import AppHeader from '../../components/AppHeader';
import Txt from '../../components/Txt';

import {
  card,
  colors,
  radius,
  row,
  shadows,
} from '../../styles/theme';

interface MenuItem {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  badge?: string;
}

const items: MenuItem[] = [
  {
    id: 'join',
    label: 'انضم كحرفي',
    hint: 'سجّل نشاطك مجاناً وابدأ باستقبال الزبائن',
    icon: (
      <Hammer
        size={20}
        color={colors.primary}
      />
    ),
  },

  {
    id: 'saved',
    label: 'الحرفيون المحفوظون',
    hint: 'قائمتك المفضلة للوصول السريع',
    icon: (
      <Bookmark
        size={20}
        color={colors.primary}
      />
    ),
    badge: '0',
  },

  {
    id: 'history',
    label: 'سجل الطلبات',
    hint: 'تابع الخدمات التي طلبتها سابقاً',
    icon: (
      <History
        size={20}
        color={colors.primary}
      />
    ),
  },

  {
    id: 'location',
    label: 'موقعي',
    hint: 'استخدم موقعك لإيجاد الخدمات القريبة',
    icon: (
      <MapPin
        size={20}
        color={colors.primary}
      />
    ),
  },

  {
    id: 'trust',
    label: 'الأمان والتحقق',
    hint: 'اعرف كيف نعمل على بناء الثقة في مهنتي',
    icon: (
      <ShieldCheck
        size={20}
        color={colors.primary}
      />
    ),
  },

  {
    id: 'settings',
    label: 'الإعدادات',
    hint: 'اللغة، الإشعارات والخصوصية',
    icon: (
      <Settings
        size={20}
        color={colors.primary}
      />
    ),
  },

  {
    id: 'help',
    label: 'المساعدة والدعم',
    hint: 'تواصل معنا أو احصل على المساعدة',
    icon: (
      <CircleHelp
        size={20}
        color={colors.primary}
      />
    ),
  },
];

export default function AccountScreen() {
  const router = useRouter();

  const handleItemPress = (
    id: string,
  ) => {
    switch (id) {
      case 'join':
        router.push('/join');
        break;

      case 'saved':
        Alert.alert(
          'الحرفيون المحفوظون',
          'لا يوجد لديك حرفيون محفوظون حالياً. ابحث عن مزود خدمة واحفظه للوصول إليه بسرعة لاحقاً.',
          [
            {
              text: 'استكشاف الخدمات',
              onPress: () =>
                router.push('/results'),
            },
            {
              text: 'إغلاق',
              style: 'cancel',
            },
          ],
        );
        break;

      case 'history':
        Alert.alert(
          'سجل الطلبات',
          'لا توجد طلبات سابقة حتى الآن.',
          [
            {
              text: 'البحث عن خدمة',
              onPress: () =>
                router.push('/results'),
            },
            {
              text: 'إغلاق',
              style: 'cancel',
            },
          ],
        );
        break;

      case 'location':
        router.push('/map');
        break;

      case 'trust':
        Alert.alert(
          'الأمان والتحقق',
          'في مهنتي نهدف إلى بناء الثقة من خلال معلومات واضحة عن المهني، التقييمات، الموقع، الخدمات، وساعات العمل. سيتم تطوير نظام التحقق الكامل مع ربط قاعدة البيانات.',
        );
        break;

      case 'settings':
        Alert.alert(
          'الإعدادات',
          'إعدادات الحساب والإشعارات والخصوصية ستكون متاحة بالكامل مع إضافة نظام الحسابات.',
        );
        break;

      case 'help':
        Alert.alert(
          'المساعدة والدعم',
          'يسعدنا مساعدتك. يمكنك التواصل مع فريق مهنتي عند توفر قناة الدعم الرسمية.',
          [
            {
              text: 'إغلاق',
              style: 'cancel',
            },
          ],
        );
        break;

      default:
        break;
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* =================================================
            ACCOUNT HEADER
        ================================================= */}

        <View
          style={[
            styles.profileCard,
            shadows.level2,
          ]}
        >
          <View
            style={styles.profileTop}
          >
            <View
              style={styles.avatar}
            >
              <User
                size={30}
                color={colors.white}
              />
            </View>

            <View
              style={
                styles.profileInfo
              }
            >
              <Txt
                variant="h3"
                style={
                  styles.profileTitle
                }
              >
                أهلاً بك في مهنتي
              </Txt>

              <Txt
                variant="small"
                color="#D7E9DF"
                style={
                  styles.profileDescription
                }
              >
                أنت تستخدم مهنتي كمستخدم زائر
              </Txt>
            </View>
          </View>

          <View
            style={
              styles.accountStatus
            }
          >
            <View
              style={
                styles.statusDot
              }
            />

            <Txt
              variant="labelSm"
              weight="600"
              color="#E6F5EC"
            >
              الاستكشاف متاح بدون تسجيل
            </Txt>
          </View>
        </View>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <View
          style={styles.quickSection}
        >
          <Txt
            variant="h4"
            style={
              styles.sectionTitle
            }
          >
            اختصارات سريعة
          </Txt>

          <View
            style={
              styles.quickActions
            }
          >
            <Pressable
              style={
                styles.quickCard
              }
              onPress={() =>
                router.push('/map')
              }
            >
              <View
                style={
                  styles.quickIcon
                }
              >
                <MapPinned
                  size={21}
                  color={
                    colors.primary
                  }
                />
              </View>

              <Txt
                variant="labelSm"
                weight="700"
              >
                استكشف الخريطة
              </Txt>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
              >
                الخدمات القريبة
              </Txt>
            </Pressable>

            <Pressable
              style={
                styles.quickCard
              }
              onPress={() =>
                router.push('/results')
              }
            >
              <View
                style={
                  styles.quickIcon
                }
              >
                <Sparkles
                  size={21}
                  color={
                    colors.primary
                  }
                />
              </View>

              <Txt
                variant="labelSm"
                weight="700"
              >
                اكتشف خدمة
              </Txt>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
              >
                ابحث أو استخدم AI
              </Txt>
            </Pressable>
          </View>
        </View>

        {/* =================================================
            JOIN AS PROVIDER
        ================================================= */}

        <Pressable
          style={[
            styles.providerBanner,
            shadows.level1,
          ]}
          onPress={() =>
            router.push('/join')
          }
        >
          <View
            style={
              styles.providerIcon
            }
          >
            <UserPlus
              size={22}
              color={colors.white}
            />
          </View>

          <View
            style={
              styles.providerText
            }
          >
            <Txt
              variant="h4"
              color={colors.white}
            >
              عندك مهنة أو نشاط؟
            </Txt>

            <Txt
              variant="small"
              color="#D7E9DF"
              style={
                styles.providerHint
              }
            >
              انضم إلى مهنتي وخلّي الزبائن يلاقوك بسهولة.
            </Txt>
          </View>

          <ArrowLeft
            size={21}
            color={colors.white}
          />
        </Pressable>

        {/* =================================================
            MENU
        ================================================= */}

        <View
          style={styles.menuSection}
        >
          <Txt
            variant="h4"
            style={
              styles.sectionTitle
            }
          >
            الحساب
          </Txt>

          <View>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.item,
                  pressed &&
                  styles.itemPressed,
                ]}
                onPress={() =>
                  handleItemPress(
                    item.id,
                  )
                }
              >
                <View
                  style={
                    styles.itemIcon
                  }
                >
                  {item.icon}
                </View>

                <View
                  style={
                    styles.itemContent
                  }
                >
                  <View
                    style={
                      styles.itemTitleRow
                    }
                  >
                    <Txt
                      variant="h4"
                      style={
                        styles.itemTitle
                      }
                    >
                      {item.label}
                    </Txt>

                    {item.badge && (
                      <View
                        style={
                          styles.badge
                        }
                      >
                        <Txt
                          variant="labelSm"
                          weight="700"
                          color={
                            colors.primary
                          }
                        >
                          {item.badge}
                        </Txt>
                      </View>
                    )}
                  </View>

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                    numberOfLines={
                      2
                    }
                  >
                    {item.hint}
                  </Txt>
                </View>

                <ChevronLeft
                  size={20}
                  color={
                    colors.muted
                  }
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* =================================================
            APP INFO
        ================================================= */}

        <View
          style={
            styles.appInfoCard
          }
        >
          <View
            style={
              styles.appInfoIcon
            }
          >
            <Clock3
              size={17}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.appInfoContent
            }
          >
            <Txt
              variant="labelSm"
              weight="700"
            >
              مهنتي
            </Txt>

            <Txt
              variant="small"
              color={
                colors.muted
              }
            >
              اكتشف الخدمة المناسبة لك بالقرب منك
            </Txt>
          </View>

          <Txt
            variant="labelSm"
            color={
              colors.muted
            }
          >
            v1.0.0
          </Txt>
        </View>

        <Txt
          variant="small"
          color={
            colors.muted
          }
          align="center"
          style={
            styles.footer
          }
        >
          مهنتي — engineered connections
          {'\n'}
          that turn local skills into impact.
        </Txt>
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
      padding:
        16,

      paddingBottom:
        36,
    },

    /* =====================================================
       PROFILE
    ===================================================== */

    profileCard: {
      backgroundColor:
        colors.primary,

      borderRadius:
        radius.xl,

      padding:
        18,
    },

    profileTop: {
      ...row,

      alignItems:
        'center',
    },

    avatar: {
      width:
        62,

      height:
        62,

      borderRadius:
        31,

      backgroundColor:
        'rgba(255,255,255,0.14)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    profileInfo: {
      flex:
        1,

      marginRight:
        14,
    },

    profileTitle: {
      color:
        colors.white,

      marginBottom:
        4,
    },

    profileDescription: {
      lineHeight:
        20,
    },

    accountStatus: {
      flexDirection:
        'row',

      alignItems:
        'center',

      alignSelf:
        'flex-start',

      marginTop:
        14,

      paddingHorizontal:
        11,

      paddingVertical:
        7,

      borderRadius:
        radius.full,

      backgroundColor:
        'rgba(255,255,255,0.10)',
    },

    statusDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        colors.success,

      marginRight:
        7,
    },

    /* =====================================================
       SECTION
    ===================================================== */

    quickSection: {
      marginTop:
        22,
    },

    menuSection: {
      marginTop:
        22,
    },

    sectionTitle: {
      marginBottom:
        11,
    },

    /* =====================================================
       QUICK ACTIONS
    ===================================================== */

    quickActions: {
      flexDirection:
        'row',

      gap:
        10,
    },

    quickCard: {
      flex:
        1,

      backgroundColor:
        colors.white,

      borderRadius:
        radius.lg,

      padding:
        14,

      borderWidth:
        1,

      borderColor:
        colors.border,
    },

    quickIcon: {
      width:
        40,

      height:
        40,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        9,
    },

    /* =====================================================
       PROVIDER BANNER
    ===================================================== */

    providerBanner: {
      marginTop:
        14,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        colors.secondary,

      borderRadius:
        radius.xl,

      padding:
        15,
    },

    providerIcon: {
      width:
        44,

      height:
        44,

      borderRadius:
        14,

      backgroundColor:
        'rgba(255,255,255,0.14)',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    providerText: {
      flex:
        1,

      marginHorizontal:
        12,
    },

    providerHint: {
      marginTop:
        3,

      lineHeight:
        19,
    },

    /* =====================================================
       MENU
    ===================================================== */

    item: {
      ...card,
      ...row,

      alignItems:
        'center',

      padding:
        13,

      marginBottom:
        9,
    },

    itemPressed: {
      backgroundColor:
        colors.tint,
    },

    itemIcon: {
      width:
        43,

      height:
        43,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    itemContent: {
      flex:
        1,

      marginHorizontal:
        12,

      minWidth:
        0,
    },

    itemTitleRow: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    itemTitle: {
      fontSize:
        15,

      flex:
        0,
    },

    badge: {
      minWidth:
        22,

      height:
        22,

      borderRadius:
        11,

      marginLeft:
        7,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        6,
    },

    /* =====================================================
       APP INFO
    ===================================================== */

    appInfoCard: {
      marginTop:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.lg,

      padding:
        12,

      borderWidth:
        1,

      borderColor:
        colors.border,
    },

    appInfoIcon: {
      width:
        36,

      height:
        36,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    appInfoContent: {
      flex:
        1,

      marginHorizontal:
        10,
    },

    footer: {
      marginTop:
        22,

      lineHeight:
        19,
    },
  });