import React, { useMemo, useState } from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { LinearGradient } from 'expo-linear-gradient';

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  Contact,
  Handshake,
  Info,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Wallet,
  Wrench,
  X,
  Zap,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';

import {
  card,
  colors,
  fontFamilies,
  radius,
  row,
  shadows,
} from '../../styles/theme';

/* =========================================================
   TYPES
========================================================= */

type Step = 1 | 2 | 3 | 4;

type CategoryOption = {
  id: string;
  label: string;
};

type FieldCardProps = {
  title: string;
  icon: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
};

/* =========================================================
   CONSTANTS
========================================================= */

const stepLabels = [
  'النشاط',
  'الخدمات',
  'الموقع',
  'التأكيد',
];

const categories: CategoryOption[] = [
  {
    id: 'electric',
    label: 'كهرباء',
  },
  {
    id: 'appliances',
    label: 'صيانة أجهزة',
  },
  {
    id: 'cars',
    label: 'سيارات',
  },
  {
    id: 'tech',
    label: 'هواتف وتقنية',
  },
  {
    id: 'plumbing',
    label: 'سباكة ومياه',
  },
  {
    id: 'paint',
    label: 'دهان وديكور',
  },
  {
    id: 'ac',
    label: 'تكييف وتبريد',
  },
  {
    id: 'carpentry',
    label: 'نجارة وأثاث',
  },
  {
    id: 'cleaning',
    label: 'تنظيف منزلي',
  },
  {
    id: 'moving',
    label: 'نقل وعفش',
  },
];

const specialtiesByCategory: Record<
  string,
  string[]
> = {
  electric: [
    'تمديدات جديدة',
    'صيانة قواطع',
    'تركيب إنارة وليدات',
    'طوارئ كهربائية 24/7',
    'فحص أحمال ومولدات',
  ],

  appliances: [
    'صيانة غسالات',
    'صيانة جلايات',
    'صيانة نشافات',
    'إصلاح كروت إلكترونية',
    'قطع غيار',
  ],

  cars: [
    'فحص كمبيوتر',
    'صيانة محركات',
    'كهرباء سيارات',
    'تبديل زيوت وفلاتر',
    'فرامل وعفشة',
  ],

  tech: [
    'صيانة هواتف',
    'تبديل شاشات',
    'بطاريات',
    'سوفتوير',
    'إكسسوارات',
  ],

  plumbing: [
    'صيانة تسريبات',
    'تمديدات مياه',
    'سخانات',
    'صرف صحي',
    'مضخات مياه',
  ],

  paint: [
    'دهان داخلي',
    'دهان خارجي',
    'ديكورات',
    'ورق جدران',
    'ترميم وتشطيبات',
  ],

  ac: [
    'تركيب سبليت',
    'تنظيف مكيفات',
    'تعبئة غاز',
    'صيانة تكييف مركزي',
    'أعطال كهربائية',
  ],

  carpentry: [
    'غرف نوم',
    'مطابخ',
    'خزائن',
    'أبواب',
    'تصليح أثاث',
  ],

  cleaning: [
    'تنظيف منازل',
    'تنظيف مكاتب',
    'تنظيف بعد التشطيب',
    'تنظيف سجاد',
    'تنظيف واجهات',
  ],

  moving: [
    'نقل عفش',
    'فك وتركيب',
    'نقل مكاتب',
    'تغليف أثاث',
    'نقل داخل المدينة',
  ],
};

const areas = [
  'رام الله',
  'البيرة',
  'بيتونيا',
  'الماصيون',
  'الطيرة',
  'عين منجد',
  'حي الإرسال',
];

const workingHoursOptions = [
  '08:00 ص - 06:00 م',
  '09:00 ص - 07:00 م',
  '10:00 ص - 08:00 م',
  '08:00 ص - 08:00 م',
];

const profilePhoto =
  'https://images.unsplash.com/photo-1709381120033-86deda767904?w=400&q=80&fit=crop';

/* =========================================================
   FIELD CARD
========================================================= */

function FieldCard({
  title,
  icon,
  required = false,
  children,
}: FieldCardProps) {
  return (
    <View
      style={[
        styles.card,
        shadows.level1,
      ]}
    >
      <View
        style={[
          styles.cardHeading,
        ]}
      >
        {icon}

        <Txt
          variant="h4"
          style={styles.cardHeadingText}
        >
          {title}

          {required ? (
            <Txt
              variant="h4"
              color={colors.error}
            >
              {' '}
              *
            </Txt>
          ) : null}
        </Txt>
      </View>

      {children}
    </View>
  );
}

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function JoinScreen() {
  const router = useRouter();

  const [step, setStep] =
    useState<Step>(1);

  const [shopName, setShopName] =
    useState(
      'ورشة النور للتمديدات الكهربائية',
    );

  const [bio, setBio] =
    useState(
      'فني كهرباء مرخص ومعتمد بخبرة تزيد عن 9 سنوات في رام الله والبيرة وضواحيها. متخصص بتنفيذ شبكات الكهرباء الحديثة وصيانة الأعطال بأمان ودقة عالية.',
    );

  const [phone, setPhone] =
    useState('059 876 5432');

  const [category, setCategory] =
    useState('electric');

  const [selectedSpecialties, setSelectedSpecialties] =
    useState<string[]>([
      'تمديدات جديدة',
      'صيانة قواطع',
      'طوارئ كهربائية 24/7',
    ]);

  const [whatsapp, setWhatsapp] =
    useState(true);

  const [fee, setFee] =
    useState(
      '30 - 50 شيكل',
    );

  const [area, setArea] =
    useState('الماصيون');

  const [workingHours, setWorkingHours] =
    useState(
      '08:00 ص - 08:00 م',
    );

  const [homeVisits, setHomeVisits] =
    useState(true);

  const [agreed, setAgreed] =
    useState(false);

  /* =======================================================
     DERIVED
  ======================================================= */

  const categoryLabel = useMemo(() => {
    return (
      categories.find(
        (item) => item.id === category,
      )?.label ?? 'اختر التصنيف'
    );
  }, [category]);

  const specialtyOptions = useMemo(
    () =>
      specialtiesByCategory[
      category
      ] ?? [],
    [category],
  );

  /* =======================================================
     CATEGORY CHANGE
  ======================================================= */

  const changeCategory = (
    nextCategory: string,
  ) => {
    setCategory(nextCategory);

    const options =
      specialtiesByCategory[
      nextCategory
      ] ?? [];

    setSelectedSpecialties(
      options.slice(0, 2),
    );
  };

  /* =======================================================
     TOGGLE SPECIALTY
  ======================================================= */

  const toggleSpecialty = (
    value: string,
  ) => {
    setSelectedSpecialties(
      (current) =>
        current.includes(value)
          ? current.filter(
            (item) =>
              item !== value,
          )
          : [
            ...current,
            value,
          ],
    );
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateStep =
    (
      currentStep: Step,
    ) => {
      if (
        currentStep === 1 &&
        !shopName.trim()
      ) {
        Alert.alert(
          'بيانات ناقصة',
          'اكتب اسم المهني أو المحل أولاً.',
        );

        return false;
      }

      if (
        currentStep === 1 &&
        phone.trim().length <
        7
      ) {
        Alert.alert(
          'رقم الهاتف',
          'أدخل رقم هاتف صالح للتواصل.',
        );

        return false;
      }

      if (
        currentStep === 2 &&
        !category
      ) {
        Alert.alert(
          'التصنيف',
          'اختر التصنيف المهني الرئيسي.',
        );

        return false;
      }

      if (
        currentStep === 2 &&
        selectedSpecialties.length ===
        0
      ) {
        Alert.alert(
          'الخدمات',
          'اختر خدمة واحدة على الأقل.',
        );

        return false;
      }

      if (
        currentStep === 3 &&
        !area
      ) {
        Alert.alert(
          'الموقع',
          'اختر المنطقة التي تعمل فيها.',
        );

        return false;
      }

      if (
        currentStep === 4 &&
        !agreed
      ) {
        Alert.alert(
          'التأكيد',
          'يرجى تأكيد صحة البيانات قبل المتابعة.',
        );

        return false;
      }

      return true;
    };

  /* =======================================================
     NEXT / PREVIOUS
  ======================================================= */

  const nextStep = () => {
    if (!validateStep(step)) {
      return;
    }

    if (step < 4) {
      setStep(
        (current) =>
          (current +
            1) as Step,
      );
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(
        (current) =>
          (current -
            1) as Step,
      );
    }
  };

  /* =======================================================
     FINAL SUBMIT
  ======================================================= */

  const finish = () => {
    if (!validateStep(4)) {
      return;
    }

    Alert.alert(
      'تم تجهيز ملفك 🎉',
      'بيانات النشاط أصبحت جاهزة للعرض في تجربة مهنتي الحالية. عند ربط قاعدة البيانات لاحقاً سيتم حفظها وإرسالها للمراجعة.',
      [
        {
          text: 'العودة للرئيسية',
          onPress: () =>
            router.replace('/'),
        },
      ],
    );
  };

  /* =======================================================
     STEP TITLE
  ======================================================= */

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'معلومات النشاط الأساسية';

      case 2:
        return 'الخدمات والتخصصات';

      case 3:
        return 'الموقع وساعات العمل';

      case 4:
        return 'راجع بيانات نشاطك';

      default:
        return '';
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScreenHeader
        title="انضم كحرفي"
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
            STEPPER
        ================================================= */}

        <View
          style={
            styles.stepper
          }
        >
          <View
            style={
              styles.stepperTop
            }
          >
            <View
              style={
                styles.stepperTitleWrap
              }
            >
              <Txt
                variant="small"
                color={
                  colors.muted
                }
              >
                انضم إلى شبكة مهنتي
              </Txt>

              <Txt
                variant="h2"
                style={
                  styles.stepTitle
                }
              >
                {getStepTitle()}
              </Txt>
            </View>

            <View
              style={
                styles.stepPill
              }
            >
              <CircleCheck
                size={14}
                color={
                  colors.primary
                }
              />

              <Txt
                variant="labelSm"
                color={
                  colors.primary
                }
                style={
                  styles.stepPillText
                }
              >
                خطوة {step} من 4
              </Txt>
            </View>
          </View>

          <View
            style={
              styles.stepperRow
            }
          >
            {stepLabels.map(
              (
                label,
                index,
              ) => {
                const number =
                  index + 1;

                const active =
                  number === step;

                const completed =
                  number < step;

                return (
                  <View
                    key={label}
                    style={
                      styles.stepItem
                    }
                  >
                    <View
                      style={[
                        styles.stepBar,
                        number <=
                        step &&
                        styles.stepBarActive,
                      ]}
                    />

                    <View
                      style={[
                        styles.stepDot,
                        (active ||
                          completed) &&
                        styles.stepDotActive,
                      ]}
                    >
                      {completed ? (
                        <Check
                          size={
                            13
                          }
                          color={
                            colors.white
                          }
                        />
                      ) : (
                        <Txt
                          variant="labelSm"
                          color={
                            active
                              ? colors.white
                              : colors.muted
                          }
                          align="center"
                        >
                          {
                            number
                          }
                        </Txt>
                      )}
                    </View>

                    <Txt
                      variant="labelSm"
                      weight={
                        active
                          ? '600'
                          : '400'
                      }
                      color={
                        active
                          ? colors.primary
                          : colors.muted
                      }
                    >
                      {label}
                    </Txt>
                  </View>
                );
              },
            )}
          </View>
        </View>

        <View
          style={
            styles.body
          }
        >
          {/* =================================================
              PROMO
          ================================================= */}

          <LinearGradient
            colors={[
              colors.primary,
              '#2D6A4F',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={
              styles.promo
            }
          >
            <View
              style={
                styles.promoContent
              }
            >
              <View
                style={
                  styles.promoText
                }
              >
                <Txt
                  variant="h3"
                  color={
                    colors.white
                  }
                >
                  انضمام مجاني وفرص مستمرة
                </Txt>

                <Txt
                  variant="small"
                  color="#CFE5D9"
                  style={
                    styles.promoDescription
                  }
                >
                  أنشئ ملفك المهني ليتمكن الزبائن من العثور عليك والثقة بخدماتك.
                </Txt>
              </View>

              <View
                style={
                  styles.promoIcon
                }
              >
                <Handshake
                  size={24}
                  color={
                    colors.mint
                  }
                />
              </View>
            </View>
          </LinearGradient>

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <>
              <FieldCard
                title="اسم المهني أو المحل التجاري"
                required
                icon={
                  <Store
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <TextInput
                  value={
                    shopName
                  }
                  onChangeText={
                    setShopName
                  }
                  textAlign="right"
                  placeholder="مثال: ورشة النور للكهرباء"
                  placeholderTextColor={
                    colors.muted
                  }
                  style={
                    styles.input
                  }
                />

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                  style={
                    styles.helper
                  }
                >
                  يظهر هذا الاسم للزبائن في نتائج البحث والخريطة والملف المهني.
                </Txt>
              </FieldCard>

              <FieldCard
                title="نبذة تعريفية"
                icon={
                  <Contact
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <TextInput
                  value={
                    bio
                  }
                  onChangeText={
                    setBio
                  }
                  multiline
                  textAlign="right"
                  textAlignVertical="top"
                  placeholder="عرّف الزبائن بخبرتك وطبيعة عملك..."
                  placeholderTextColor={
                    colors.muted
                  }
                  style={[
                    styles.input,
                    styles.bioInput,
                  ]}
                />

                <View
                  style={
                    styles.smartSuggestion
                  }
                >
                  <Sparkles
                    size={12}
                    color={
                      colors.primary
                    }
                  />

                  <Txt
                    variant="labelSm"
                    color={
                      colors.primary
                    }
                    style={
                      styles.smartText
                    }
                  >
                    اقتراح ذكي: اذكر الخبرة والمناطق التي تخدمها ونوع الأعمال التي تتقنها.
                  </Txt>
                </View>
              </FieldCard>

              <FieldCard
                title="رقم الهاتف"
                required
                icon={
                  <Phone
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <View
                  style={
                    styles.phoneField
                  }
                >
                  <Txt
                    variant="label"
                    weight="700"
                    color={
                      colors.text
                    }
                  >
                    🇵🇸 +970
                  </Txt>

                  <TextInput
                    value={
                      phone
                    }
                    onChangeText={
                      setPhone
                    }
                    keyboardType="phone-pad"
                    textAlign="left"
                    placeholder="59 000 0000"
                    placeholderTextColor={
                      colors.muted
                    }
                    style={
                      styles.phoneInput
                    }
                  />
                </View>
              </FieldCard>
            </>
          )}

          {/* =================================================
              STEP 2
          ================================================= */}

          {step === 2 && (
            <>
              <FieldCard
                title="التصنيف المهني الرئيسي"
                required
                icon={
                  <Wrench
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.categoryScroll
                  }
                >
                  {categories.map(
                    (
                      item,
                    ) => {
                      const active =
                        item.id ===
                        category;

                      return (
                        <Pressable
                          key={
                            item.id
                          }
                          style={[
                            styles.categoryChip,
                            active &&
                            styles.categoryChipActive,
                          ]}
                          onPress={() =>
                            changeCategory(
                              item.id,
                            )
                          }
                        >
                          {active && (
                            <Check
                              size={
                                14
                              }
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="labelSm"
                            weight="700"
                            color={
                              active
                                ? colors.white
                                : colors.text
                            }
                          >
                            {
                              item.label
                            }
                          </Txt>
                        </Pressable>
                      );
                    },
                  )}
                </ScrollView>

                <View
                  style={
                    styles.selectedCategory
                  }
                >
                  <BriefcaseBusiness
                    size={17}
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
                      styles.selectedCategoryText
                    }
                  >
                    التصنيف المختار:
                  </Txt>

                  <Txt
                    variant="labelSm"
                    color={
                      colors.primary
                    }
                  >
                    {
                      categoryLabel
                    }
                  </Txt>
                </View>
              </FieldCard>

              <FieldCard
                title="الخدمات التي تقدمها"
                required
                icon={
                  <Zap
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                >
                  اختر كل الخدمات التي تريد ظهورها للزبائن.
                </Txt>

                <View
                  style={
                    styles.wrap
                  }
                >
                  {specialtyOptions.map(
                    (
                      item,
                    ) => {
                      const active =
                        selectedSpecialties.includes(
                          item,
                        );

                      return (
                        <Pressable
                          key={
                            item
                          }
                          onPress={() =>
                            toggleSpecialty(
                              item,
                            )
                          }
                          style={[
                            styles.specialty,
                            active &&
                            styles.specialtyActive,
                          ]}
                        >
                          {active && (
                            <Check
                              size={
                                14
                              }
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="label"
                            weight="600"
                            color={
                              active
                                ? colors.white
                                : colors.text
                            }
                          >
                            {
                              item
                            }
                          </Txt>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              </FieldCard>

              <FieldCard
                title="التواصل وشفافية الأسعار"
                icon={
                  <Wallet
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <View
                  style={
                    styles.optionRow
                  }
                >
                  <View
                    style={
                      styles.optionIcon
                    }
                  >
                    <MessageSquare
                      size={
                        18
                      }
                      color={
                        colors.white
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.optionContent
                    }
                  >
                    <Txt
                      variant="label"
                      weight="700"
                    >
                      واتساب متاح
                    </Txt>

                    <Txt
                      variant="labelSm"
                      color={
                        colors.muted
                      }
                    >
                      الزبون يستطيع إرسال صور أو فيديوهات للعطل.
                    </Txt>
                  </View>

                  <Switch
                    value={
                      whatsapp
                    }
                    onValueChange={
                      setWhatsapp
                    }
                    trackColor={{
                      true: colors.success,
                      false: colors.border,
                    }}
                    thumbColor={
                      colors.white
                    }
                  />
                </View>

                <TextInput
                  value={
                    fee
                  }
                  onChangeText={
                    setFee
                  }
                  textAlign="right"
                  placeholder="مثال: 30 - 50 شيكل"
                  placeholderTextColor={
                    colors.muted
                  }
                  style={[
                    styles.input,
                    styles.feeInput,
                  ]}
                />

                <View
                  style={
                    styles.infoRow
                  }
                >
                  <Info
                    size={15}
                    color={
                      colors.muted
                    }
                  />

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                    style={
                      styles.infoText
                    }
                  >
                    اذكر الكشفية بشكل تقريبي وواضح لبناء الثقة مع العميل.
                  </Txt>
                </View>
              </FieldCard>
            </>
          )}

          {/* =================================================
              STEP 3
          ================================================= */}

          {step === 3 && (
            <>
              <FieldCard
                title="منطقة العمل"
                required
                icon={
                  <MapPin
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                >
                  حدد المناطق التي تخدم فيها عادةً.
                </Txt>

                <View
                  style={
                    styles.wrap
                  }
                >
                  {areas.map(
                    (
                      item,
                    ) => {
                      const active =
                        area ===
                        item;

                      return (
                        <Pressable
                          key={
                            item
                          }
                          onPress={() =>
                            setArea(
                              item,
                            )
                          }
                          style={[
                            styles.areaChip,
                            active &&
                            styles.areaChipActive,
                          ]}
                        >
                          {active && (
                            <Check
                              size={
                                14
                              }
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="label"
                            weight="600"
                            color={
                              active
                                ? colors.white
                                : colors.text
                            }
                          >
                            {
                              item
                            }
                          </Txt>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              </FieldCard>

              <FieldCard
                title="ساعات العمل"
                icon={
                  <Clock3
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                >
                  اختر الساعات التي يظهر فيها نشاطك كمفتوح.
                </Txt>

                <View
                  style={
                    styles.wrap
                  }
                >
                  {workingHoursOptions.map(
                    (
                      item,
                    ) => {
                      const active =
                        workingHours ===
                        item;

                      return (
                        <Pressable
                          key={
                            item
                          }
                          onPress={() =>
                            setWorkingHours(
                              item,
                            )
                          }
                          style={[
                            styles.areaChip,
                            active &&
                            styles.areaChipActive,
                          ]}
                        >
                          {active && (
                            <Check
                              size={
                                14
                              }
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="label"
                            weight="600"
                            color={
                              active
                                ? colors.white
                                : colors.text
                            }
                          >
                            {
                              item
                            }
                          </Txt>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              </FieldCard>

              <FieldCard
                title="خدمات إضافية"
                icon={
                  <Navigation
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <View
                  style={
                    styles.optionRow
                  }
                >
                  <View
                    style={
                      styles.optionIconSoft
                    }
                  >
                    <Navigation
                      size={
                        18
                      }
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.optionContent
                    }
                  >
                    <Txt
                      variant="label"
                      weight="700"
                    >
                      زيارات منزلية
                    </Txt>

                    <Txt
                      variant="labelSm"
                      color={
                        colors.muted
                      }
                    >
                      يمكن للزبائن طلب خدمتك في الموقع.
                    </Txt>
                  </View>

                  <Switch
                    value={
                      homeVisits
                    }
                    onValueChange={
                      setHomeVisits
                    }
                    trackColor={{
                      true: colors.success,
                      false: colors.border,
                    }}
                    thumbColor={
                      colors.white
                    }
                  />
                </View>
              </FieldCard>

              <View
                style={
                  styles.locationTrust
                }
              >
                <View
                  style={
                    styles.locationTrustIcon
                  }
                >
                  <ShieldCheck
                    size={
                      19
                    }
                    color={
                      colors.success
                    }
                  />
                </View>

                <View
                  style={
                    styles.locationTrustContent
                  }
                >
                  <Txt
                    variant="label"
                    weight="700"
                  >
                    موقعك يحسن نتائج البحث
                  </Txt>

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                  >
                    سيتم استخدام منطقة العمل لإظهار نشاطك للمستخدمين الأقرب إليك.
                  </Txt>
                </View>
              </View>
            </>
          )}

          {/* =================================================
              STEP 4
          ================================================= */}

          {step === 4 && (
            <>
              <FieldCard
                title="معاينة الملف المهني"
                icon={
                  <BadgeCheck
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <View
                  style={
                    styles.previewCard
                  }
                >
                  <View
                    style={
                      styles.previewTop
                    }
                  >
                    <View
                      style={
                        styles.previewImageWrap
                      }
                    >
                      <View
                        style={
                          styles.previewVerified
                        }
                      >
                        <BadgeCheck
                          size={
                            14
                          }
                          color={
                            colors.white
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.previewImage
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.previewInfo
                      }
                    >
                      <View
                        style={
                          styles.previewNameRow
                        }
                      >
                        <Txt
                          variant="h3"
                          numberOfLines={
                            1
                          }
                          style={
                            styles.previewName
                          }
                        >
                          {
                            shopName ||
                            'اسم نشاطك'
                          }
                        </Txt>

                        <CheckCircle2
                          size={
                            17
                          }
                          color={
                            colors.success
                          }
                        />
                      </View>

                      <Txt
                        variant="small"
                        color={
                          colors.muted
                        }
                      >
                        {
                          categoryLabel
                        }{' '}
                        •{' '}
                        {
                          area
                        }
                      </Txt>

                      <View
                        style={
                          styles.previewRating
                        }
                      >
                        <Star
                          size={
                            13
                          }
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
                            styles.previewRatingValue
                          }
                        >
                          نشاط جديد
                        </Txt>

                        <Txt
                          variant="small"
                          color={
                            colors.muted
                          }
                        >
                          • بدون تقييمات بعد
                        </Txt>
                      </View>
                    </View>
                  </View>

                  <View
                    style={
                      styles.previewDivider
                    }
                  />

                  <View
                    style={
                      styles.previewTags
                    }
                  >
                    {selectedSpecialties
                      .slice(
                        0,
                        4,
                      )
                      .map(
                        (
                          item,
                        ) => (
                          <View
                            key={
                              item
                            }
                            style={
                              styles.previewTag
                            }
                          >
                            <Txt
                              variant="labelSm"
                              color={
                                colors.primary
                              }
                            >
                              {
                                item
                              }
                            </Txt>
                          </View>
                        ),
                      )}
                  </View>

                  <View
                    style={
                      styles.previewMeta
                    }
                  >
                    <View
                      style={
                        styles.previewMetaItem
                      }
                    >
                      <Clock3
                        size={
                          14
                        }
                        color={
                          colors.success
                        }
                      />

                      <Txt
                        variant="labelSm"
                        color={
                          colors.success
                        }
                      >
                        متاح غالباً
                      </Txt>
                    </View>

                    <View
                      style={
                        styles.previewMetaItem
                      }
                    >
                      <MapPin
                        size={
                          14
                        }
                        color={
                          colors.muted
                        }
                      />

                      <Txt
                        variant="labelSm"
                        color={
                          colors.muted
                        }
                      >
                        {
                          area
                        }
                      </Txt>
                    </View>

                    <View
                      style={
                        styles.previewMetaItem
                      }
                    >
                      <Wallet
                        size={
                          14
                        }
                        color={
                          colors.muted
                        }
                      />

                      <Txt
                        variant="labelSm"
                        color={
                          colors.muted
                        }
                      >
                        {
                          fee
                        }
                      </Txt>
                    </View>
                  </View>
                </View>
              </FieldCard>

              <FieldCard
                title="ملخص بيانات النشاط"
                icon={
                  <BriefcaseBusiness
                    size={20}
                    color={
                      colors.text
                    }
                  />
                }
              >
                <View
                  style={
                    styles.summary
                  }
                >
                  <SummaryRow
                    label="النشاط"
                    value={
                      shopName ||
                      'غير محدد'
                    }
                  />

                  <SummaryRow
                    label="التصنيف"
                    value={
                      categoryLabel
                    }
                  />

                  <SummaryRow
                    label="الخدمات"
                    value={`${selectedSpecialties.length} خدمات مختارة`}
                  />

                  <SummaryRow
                    label="الموقع"
                    value={
                      area
                    }
                  />

                  <SummaryRow
                    label="ساعات العمل"
                    value={
                      workingHours
                    }
                  />

                  <SummaryRow
                    label="واتساب"
                    value={
                      whatsapp
                        ? 'متاح'
                        : 'غير متاح'
                    }
                  />

                  <SummaryRow
                    label="زيارات منزلية"
                    value={
                      homeVisits
                        ? 'متاحة'
                        : 'غير متاحة'
                    }
                  />
                </View>
              </FieldCard>

              <Pressable
                style={
                  styles.confirmRow
                }
                onPress={() =>
                  setAgreed(
                    (current) =>
                      !current,
                  )
                }
              >
                <View
                  style={[
                    styles.checkbox,
                    agreed &&
                    styles.checkboxActive,
                  ]}
                >
                  {agreed && (
                    <Check
                      size={
                        14
                      }
                      color={
                        colors.white
                      }
                    />
                  )}
                </View>

                <Txt
                  variant="small"
                  color={
                    colors.text
                  }
                  style={
                    styles.confirmText
                  }
                >
                  أؤكد أن المعلومات التي أدخلتها صحيحة ومناسبة للعرض في ملف مهنتي.
                </Txt>
              </Pressable>
            </>
          )}
        </View>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <View
          style={
            styles.navigation
          }
        >
          {step > 1 ? (
            <Pressable
              style={
                styles.backButton
              }
              onPress={
                previousStep
              }
            >
              <ArrowRight
                size={19}
                color={
                  colors.primary
                }
              />

              <Txt
                variant="label"
                weight="700"
                color={
                  colors.primary
                }
                style={
                  styles.backText
                }
              >
                السابق
              </Txt>
            </Pressable>
          ) : (
            <Pressable
              style={
                styles.cancelButton
              }
              onPress={() =>
                router.replace(
                  '/',
                )
              }
            >
              <X
                size={17}
                color={
                  colors.muted
                }
              />

              <Txt
                variant="label"
                color={
                  colors.muted
                }
                style={
                  styles.backText
                }
              >
                إلغاء
              </Txt>
            </Pressable>
          )}

          {step < 4 ? (
            <Pressable
              style={
                styles.nextButton
              }
              onPress={
                nextStep
              }
            >
              <Txt
                variant="h4"
                color={
                  colors.white
                }
              >
                متابعة
              </Txt>

              <ArrowLeft
                size={20}
                color={
                  colors.white
                }
              />
            </Pressable>
          ) : (
            <Pressable
              style={[
                styles.nextButton,
                !agreed &&
                styles.nextButtonDisabled,
              ]}
              onPress={
                finish
              }
            >
              <Txt
                variant="h4"
                color={
                  colors.white
                }
              >
                تأكيد وإكمال
              </Txt>

              <CircleCheck
                size={20}
                color={
                  colors.white
                }
              />
            </Pressable>
          )}
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <View
          style={
            styles.footer
          }
        >
          <ShieldCheck
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
              styles.footerText
            }
          >
            بياناتك تُستخدم لبناء ملفك المهني وعرض خدماتك للمستخدمين.
          </Txt>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.summaryRow
      }
    >
      <Txt
        variant="small"
        color={
          colors.muted
        }
      >
        {label}
      </Txt>

      <Txt
        variant="labelSm"
        weight="600"
        style={
          styles.summaryValue
        }
        numberOfLines={2}
      >
        {value}
      </Txt>
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
      paddingBottom:
        34,
    },

    /* =====================================================
       STEPPER
    ===================================================== */

    stepper: {
      backgroundColor:
        colors.tint,

      padding:
        16,

      paddingBottom:
        13,

      borderBottomWidth:
        1,

      borderBottomColor:
        colors.border,
    },

    stepperTop: {
      ...row,

      alignItems:
        'center',
    },

    stepperTitleWrap: {
      flex:
        1,
    },

    stepTitle: {
      fontSize:
        21,

      marginTop:
        2,
    },

    stepPill: {
      ...row,

      backgroundColor:
        colors.mint,

      borderRadius:
        radius.full,

      paddingHorizontal:
        10,

      paddingVertical:
        5,
    },

    stepPillText: {
      marginRight:
        4,
    },

    stepperRow: {
      flexDirection:
        'row-reverse',

      marginTop:
        15,

      alignItems:
        'flex-start',
    },

    stepItem: {
      flex:
        1,

      alignItems:
        'center',
    },

    stepBar: {
      height:
        4,

      alignSelf:
        'stretch',

      marginHorizontal:
        3,

      borderRadius:
        2,

      backgroundColor:
        colors.border,
    },

    stepBarActive: {
      backgroundColor:
        colors.primary,
    },

    stepDot: {
      width:
        27,

      height:
        27,

      borderRadius:
        14,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        8,
    },

    stepDotActive: {
      backgroundColor:
        colors.primary,
    },

    /* =====================================================
       BODY
    ===================================================== */

    body: {
      paddingHorizontal:
        12,

      paddingTop:
        14,
    },

    /* =====================================================
       PROMO
    ===================================================== */

    promo: {
      borderRadius:
        radius.lg,

      padding:
        16,

      marginBottom:
        12,
    },

    promoContent: {
      ...row,

      alignItems:
        'center',
    },

    promoText: {
      flex:
        1,
    },

    promoDescription: {
      marginTop:
        5,

      lineHeight:
        20,
    },

    promoIcon: {
      width:
        50,

      height:
        50,

      borderRadius:
        25,

      backgroundColor:
        'rgba(255,255,255,0.10)',

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        12,
    },

    /* =====================================================
       CARDS
    ===================================================== */

    card: {
      ...card,

      padding:
        16,

      marginBottom:
        12,
    },

    cardHeading: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      marginBottom:
        12,
    },

    cardHeadingText: {
      marginRight:
        8,
    },

    /* =====================================================
       INPUT
    ===================================================== */

    input: {
      backgroundColor:
        colors.tint,

      borderRadius:
        radius.md,

      paddingHorizontal:
        14,

      minHeight:
        48,

      fontFamily:
        fontFamilies['400'],

      fontSize:
        14,

      color:
        colors.text,
    } as object,

    bioInput: {
      minHeight:
        125,

      paddingTop:
        12,

      lineHeight:
        24,
    },

    feeInput: {
      marginTop:
        12,
    },

    helper: {
      marginTop:
        9,

      lineHeight:
        19,
    },

    /* =====================================================
       SMART SUGGESTION
    ===================================================== */

    smartSuggestion: {
      flexDirection:
        'row-reverse',

      alignItems:
        'flex-start',

      backgroundColor:
        colors.mintSoft,

      borderRadius:
        radius.md,

      padding:
        9,

      marginTop:
        10,
    },

    smartText: {
      flex:
        1,

      marginRight:
        5,

      lineHeight:
        18,
    },

    /* =====================================================
       PHONE
    ===================================================== */

    phoneField: {
      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        colors.tint,

      borderRadius:
        radius.md,

      minHeight:
        48,

      paddingHorizontal:
        14,
    },

    phoneInput: {
      flex:
        1,

      marginLeft:
        12,

      minHeight:
        48,

      fontFamily:
        fontFamilies['500'],

      fontSize:
        15,

      color:
        colors.text,

      textAlign:
        'left',
    } as object,

    /* =====================================================
       CATEGORIES
    ===================================================== */

    categoryScroll: {
      gap:
        8,

      paddingBottom:
        3,
    },

    categoryChip: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      height:
        40,

      paddingHorizontal:
        14,

      borderRadius:
        radius.full,

      backgroundColor:
        colors.tintStrong,

      borderWidth:
        1,

      borderColor:
        colors.border,

      gap:
        5,
    },

    categoryChipActive: {
      backgroundColor:
        colors.primary,

      borderColor:
        colors.primary,
    },

    selectedCategory: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      alignSelf:
        'flex-start',

      backgroundColor:
        colors.mintSoft,

      borderRadius:
        radius.full,

      marginTop:
        12,

      paddingHorizontal:
        10,

      paddingVertical:
        6,
    },

    selectedCategoryText: {
      marginHorizontal:
        4,
    },

    /* =====================================================
       SPECIALTIES
    ===================================================== */

    wrap: {
      flexDirection:
        'row-reverse',

      flexWrap:
        'wrap',

      gap:
        8,

      marginTop:
        11,
    },

    specialty: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      minHeight:
        38,

      paddingHorizontal:
        13,

      borderRadius:
        radius.full,

      backgroundColor:
        colors.tintStrong,

      gap:
        6,
    },

    specialtyActive: {
      backgroundColor:
        colors.primary,
    },

    /* =====================================================
       OPTIONS
    ===================================================== */

    optionRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.tint,

      borderRadius:
        radius.md,

      padding:
        12,
    },

    optionIcon: {
      width:
        40,

      height:
        40,

      borderRadius:
        12,

      backgroundColor:
        colors.success,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    optionIconSoft: {
      width:
        40,

      height:
        40,

      borderRadius:
        12,

      backgroundColor:
        colors.mintSoft,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    optionContent: {
      flex:
        1,

      marginHorizontal:
        12,
    },

    /* =====================================================
       INFO
    ===================================================== */

    infoRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'flex-start',

      marginTop:
        10,
    },

    infoText: {
      flex:
        1,

      marginRight:
        6,

      lineHeight:
        19,
    },

    /* =====================================================
       AREA
    ===================================================== */

    areaChip: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      minHeight:
        38,

      paddingHorizontal:
        13,

      borderRadius:
        radius.full,

      backgroundColor:
        colors.tintStrong,

      gap:
        5,
    },

    areaChipActive: {
      backgroundColor:
        colors.primary,
    },

    /* =====================================================
       LOCATION TRUST
    ===================================================== */

    locationTrust: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.mintSoft,

      borderRadius:
        radius.lg,

      padding:
        13,

      marginBottom:
        12,
    },

    locationTrustIcon: {
      width:
        40,

      height:
        40,

      borderRadius:
        12,

      backgroundColor:
        colors.white,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    locationTrustContent: {
      flex:
        1,

      marginRight:
        10,
    },

    /* =====================================================
       PREVIEW
    ===================================================== */

    previewCard: {
      backgroundColor:
        colors.tint,

      borderRadius:
        radius.lg,

      padding:
        13,
    },

    previewTop: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',
    },

    previewImageWrap: {
      position:
        'relative',

      width:
        67,

      height:
        67,
    },

    previewImage: {
      width:
        67,

      height:
        67,

      borderRadius:
        18,

      backgroundColor:
        colors.tintStrong,

      backgroundImage:
        `url(${profilePhoto})`,
    } as object,

    previewVerified: {
      position:
        'absolute',

      zIndex:
        5,

      right:
        -3,

      top:
        -4,

      width:
        22,

      height:
        22,

      borderRadius:
        11,

      backgroundColor:
        colors.success,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    previewInfo: {
      flex:
        1,

      marginRight:
        11,

      minWidth:
        0,
    },

    previewNameRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',
    },

    previewName: {
      flex:
        1,

      fontSize:
        18,

      marginLeft:
        4,
    },

    previewRating: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      marginTop:
        5,

      gap:
        4,
    },

    previewRatingValue: {
      marginHorizontal:
        1,
    },

    previewDivider: {
      height:
        1,

      backgroundColor:
        colors.border,

      marginVertical:
        12,
    },

    previewTags: {
      flexDirection:
        'row-reverse',

      flexWrap:
        'wrap',

      gap:
        6,
    },

    previewTag: {
      backgroundColor:
        colors.mintSoft,

      borderRadius:
        radius.full,

      paddingHorizontal:
        9,

      paddingVertical:
        5,
    },

    previewMeta: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      marginTop:
        11,

      gap:
        12,
    },

    previewMetaItem: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      gap:
        4,
    },

    /* =====================================================
       SUMMARY
    ===================================================== */

    summary: {
      gap:
        1,
    },

    summaryRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      minHeight:
        40,

      borderBottomWidth:
        1,

      borderBottomColor:
        colors.border,
    },

    summaryValue: {
      flex:
        1,

      textAlign:
        'left',

      marginRight:
        15,
    },

    /* =====================================================
       CONFIRM
    ===================================================== */

    confirmRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'flex-start',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.lg,

      borderWidth:
        1,

      borderColor:
        colors.border,

      padding:
        13,

      marginBottom:
        12,
    },

    checkbox: {
      width:
        23,

      height:
        23,

      borderRadius:
        7,

      borderWidth:
        1.5,

      borderColor:
        colors.border,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        colors.white,
    },

    checkboxActive: {
      backgroundColor:
        colors.primary,

      borderColor:
        colors.primary,
    },

    confirmText: {
      flex:
        1,

      marginRight:
        9,

      lineHeight:
        20,
    },

    /* =====================================================
       NAVIGATION
    ===================================================== */

    navigation: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      paddingHorizontal:
        12,

      marginTop:
        3,

      gap:
        10,
    },

    nextButton: {
      flex:
        1,

      minHeight:
        54,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.primary,

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,
    },

    nextButtonDisabled: {
      opacity:
        0.65,
    },

    backButton: {
      minHeight:
        54,

      paddingHorizontal:
        16,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.mintSoft,

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    cancelButton: {
      minHeight:
        54,

      paddingHorizontal:
        16,

      borderRadius:
        radius.md,

      backgroundColor:
        colors.tintStrong,

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    backText: {
      marginRight:
        5,
    },

    /* =====================================================
       FOOTER
    ===================================================== */

    footer: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        18,

      marginTop:
        17,
    },

    footerText: {
      marginRight:
        5,

      textAlign:
        'center',

      lineHeight:
        19,
    },
  });