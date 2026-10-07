import React, {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  Image,
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

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
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
    <View style={styles.card}>
      <View style={styles.cardHeading}>
        <View style={styles.cardIcon}>
          {icon}
        </View>

        <Txt
          variant="h4"
          style={
            styles.cardHeadingText
          }
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
    useState('30 - 50 شيكل');

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
     HELPERS
  ======================================================= */

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'معلومات النشاط';

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

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'أدخل المعلومات الأساسية التي سيشاهدها الزبائن.';

      case 2:
        return 'اختر المجال والخدمات التي تقدمها.';

      case 3:
        return 'حدد منطقة عملك وأوقات تواجدك.';

      case 4:
        return 'تأكد من المعلومات قبل إكمال الملف.';

      default:
        return '';
    }
  };

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

  const validateStep = (
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
      phone.trim().length < 7
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
          (current + 1) as Step,
      );
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(
        (current) =>
          (current - 1) as Step,
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

        <View style={styles.stepper}>
          <View style={styles.stepperTop}>
            <View
              style={
                styles.stepperTitleWrap
              }
            >
              <Txt
                variant="small"
                color={colors.muted}
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

              <Txt
                variant="small"
                color={colors.muted}
                style={
                  styles.stepDescription
                }
                numberOfLines={2}
              >
                {getStepDescription()}
              </Txt>
            </View>

            <View
              style={styles.stepPill}
            >
              <Txt
                variant="labelSm"
                weight="700"
                color={colors.primary}
              >
                {step}/4
              </Txt>
            </View>
          </View>

          <View
            style={styles.stepperRow}
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
                        number <= step &&
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
                          size={13}
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
                        >
                          {number}
                        </Txt>
                      )}
                    </View>

                    <Txt
                      variant="labelSm"
                      weight={
                        active
                          ? '700'
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

        <View style={styles.body}>
          {/* =================================================
              PROMO
          ================================================= */}

          {step === 1 && (
            <View
              style={styles.promo}
            >
              <View
                style={styles.promoIcon}
              >
                <Handshake
                  size={22}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={styles.promoText}
              >
                <Txt
                  variant="h4"
                  color={colors.text}
                >
                  انضم مجاناً
                </Txt>

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                  style={
                    styles.promoDescription
                  }
                >
                  أنشئ ملفك ليتمكن الزبائن من العثور عليك.
                </Txt>
              </View>
            </View>
          )}

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <>
              <FieldCard
                title="اسم المهني أو المحل"
                required
                icon={
                  <Store
                    size={18}
                    color={
                      colors.primary
                    }
                  />
                }
              >
                <TextInput
                  value={shopName}
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
                  هذا الاسم سيظهر في نتائج البحث والملف المهني.
                </Txt>
              </FieldCard>

              <FieldCard
                title="نبذة تعريفية"
                icon={
                  <Contact
                    size={18}
                    color={
                      colors.primary
                    }
                  />
                }
              >
                <TextInput
                  value={bio}
                  onChangeText={
                    setBio
                  }
                  multiline
                  textAlign="right"
                  textAlignVertical="top"
                  placeholder="اكتب نبذة قصيرة عن خبرتك وطبيعة عملك..."
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
                    size={13}
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
                    اذكر الخبرة والمناطق التي تخدمها ونوع الأعمال التي تتقنها.
                  </Txt>
                </View>
              </FieldCard>

              <FieldCard
                title="رقم الهاتف"
                required
                icon={
                  <Phone
                    size={18}
                    color={
                      colors.primary
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
                  >
                    🇵🇸 +970
                  </Txt>

                  <TextInput
                    value={phone}
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
                title="التصنيف الرئيسي"
                required
                icon={
                  <Wrench
                    size={18}
                    color={
                      colors.primary
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
                  اختر المجال الأساسي لنشاطك.
                </Txt>

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
                    (item) => {
                      const active =
                        item.id ===
                        category;

                      return (
                        <Pressable
                          key={item.id}
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
                              size={13}
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="labelSm"
                            weight="600"
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
                    size={15}
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
                    {categoryLabel}
                  </Txt>
                </View>
              </FieldCard>

              <FieldCard
                title="الخدمات التي تقدمها"
                required
                icon={
                  <Zap
                    size={18}
                    color={
                      colors.primary
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
                  اختر خدمة واحدة أو أكثر.
                </Txt>

                <View
                  style={styles.wrap}
                >
                  {specialtyOptions.map(
                    (item) => {
                      const active =
                        selectedSpecialties.includes(
                          item,
                        );

                      return (
                        <Pressable
                          key={item}
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
                              size={13}
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="labelSm"
                            weight="600"
                            color={
                              active
                                ? colors.white
                                : colors.text
                            }
                          >
                            {item}
                          </Txt>
                        </Pressable>
                      );
                    },
                  )}
                </View>
              </FieldCard>

              <FieldCard
                title="التواصل والأسعار"
                icon={
                  <Wallet
                    size={18}
                    color={
                      colors.primary
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
                      size={17}
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
                      variant="small"
                      color={
                        colors.muted
                      }
                    >
                      يسمح للزبون بالتواصل وإرسال صور عند الحاجة.
                    </Txt>
                  </View>

                  <Switch
                    value={whatsapp}
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
                  value={fee}
                  onChangeText={
                    setFee
                  }
                  textAlign="right"
                  placeholder="السعر التقريبي: 30 - 50 شيكل"
                  placeholderTextColor={
                    colors.muted
                  }
                  style={[
                    styles.input,
                    styles.feeInput,
                  ]}
                />

                <View
                  style={styles.infoRow}
                >
                  <Info
                    size={14}
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
                    السعر التقريبي يساعد العميل على فهم نطاق الخدمة.
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
                    size={18}
                    color={
                      colors.primary
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
                  أين تقدم خدماتك؟
                </Txt>

                <View
                  style={styles.wrap}
                >
                  {areas.map(
                    (item) => {
                      const active =
                        area === item;

                      return (
                        <Pressable
                          key={item}
                          onPress={() =>
                            setArea(item)
                          }
                          style={[
                            styles.areaChip,
                            active &&
                              styles.areaChipActive,
                          ]}
                        >
                          {active && (
                            <Check
                              size={13}
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="labelSm"
                            weight="600"
                            color={
                              active
                                ? colors.white
                                : colors.text
                            }
                          >
                            {item}
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
                    size={18}
                    color={
                      colors.primary
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
                  style={styles.wrap}
                >
                  {workingHoursOptions.map(
                    (item) => {
                      const active =
                        workingHours ===
                        item;

                      return (
                        <Pressable
                          key={item}
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
                              size={13}
                              color={
                                colors.white
                              }
                            />
                          )}

                          <Txt
                            variant="labelSm"
                            weight="600"
                            color={
                              active
                                ? colors.white
                                : colors.text
                            }
                          >
                            {item}
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
                    size={18}
                    color={
                      colors.primary
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
                      size={17}
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
                      variant="small"
                      color={
                        colors.muted
                      }
                    >
                      يمكن للزبون طلب الخدمة في موقعه.
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
                    size={18}
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
                    موقعك مهم
                  </Txt>

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                    style={
                      styles.locationTrustText
                    }
                  >
                    منطقة العمل تساعد المستخدمين على العثور عليك بالقرب منهم.
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
                title="معاينة الملف"
                icon={
                  <BadgeCheck
                    size={18}
                    color={
                      colors.primary
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
                      <Image
                        source={{
                          uri: profilePhoto,
                        }}
                        style={
                          styles.previewImage
                        }
                      />

                      <View
                        style={
                          styles.previewNewBadge
                        }
                      >
                        <Sparkles
                          size={12}
                          color={
                            colors.white
                          }
                        />
                      </View>
                    </View>

                    <View
                      style={
                        styles.previewInfo
                      }
                    >
                      <Txt
                        variant="h3"
                        numberOfLines={2}
                        style={
                          styles.previewName
                        }
                      >
                        {
                          shopName ||
                          'اسم نشاطك'
                        }
                      </Txt>

                      <Txt
                        variant="small"
                        color={
                          colors.muted
                        }
                        style={
                          styles.previewSubtitle
                        }
                      >
                        {
                          categoryLabel
                        }{' '}
                        •{' '}
                        {area}
                      </Txt>

                      <View
                        style={
                          styles.previewRating
                        }
                      >
                        <Star
                          size={13}
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
                        >
                          نشاط جديد
                        </Txt>

                        <Txt
                          variant="small"
                          color={
                            colors.muted
                          }
                        >
                          بدون تقييمات بعد
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
                      .slice(0, 4)
                      .map(
                        (item) => (
                          <View
                            key={item}
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
                              {item}
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
                        size={14}
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
                        {workingHours}
                      </Txt>
                    </View>

                    <View
                      style={
                        styles.previewMetaItem
                      }
                    >
                      <MapPin
                        size={14}
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
                        {area}
                      </Txt>
                    </View>

                    <View
                      style={
                        styles.previewMetaItem
                      }
                    >
                      <Wallet
                        size={14}
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
                        {fee ||
                          'السعر حسب الخدمة'}
                      </Txt>
                    </View>
                  </View>
                </View>
              </FieldCard>

              <FieldCard
                title="ملخص النشاط"
                icon={
                  <BriefcaseBusiness
                    size={18}
                    color={
                      colors.primary
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
                    value={area}
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
                style={({ pressed }) => [
                  styles.confirmRow,
                  pressed &&
                    styles.confirmRowPressed,
                ]}
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
                      size={14}
                      color={
                        colors.white
                      }
                    />
                  )}
                </View>

                <Txt
                  variant="small"
                  color={colors.text}
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
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.backButtonPressed,
              ]}
              onPress={
                previousStep
              }
              accessibilityRole="button"
              accessibilityLabel="الخطوة السابقة"
            >
              <ArrowRight
                size={18}
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
              style={({ pressed }) => [
                styles.cancelButton,
                pressed &&
                  styles.cancelButtonPressed,
              ]}
              onPress={() =>
                router.replace('/')
              }
              accessibilityRole="button"
              accessibilityLabel="إلغاء"
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
              style={({ pressed }) => [
                styles.nextButton,
                pressed &&
                  styles.nextButtonPressed,
              ]}
              onPress={
                nextStep
              }
              accessibilityRole="button"
              accessibilityLabel="متابعة"
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
                size={19}
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
              onPress={finish}
              accessibilityRole="button"
              accessibilityLabel="تأكيد وإكمال"
              accessibilityState={{
                disabled: !agreed,
              }}
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
          style={styles.footer}
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
      paddingBottom: 30,
    },

    /* =====================================================
       STEPPER
    ===================================================== */

    stepper: {
      backgroundColor:
        colors.tint,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    stepperTop: {
      ...row,
      alignItems: 'flex-start',
    },

    stepperTitleWrap: {
      flex: 1,
      minWidth: 0,
    },

    stepTitle: {
      fontSize: 21,
      lineHeight: 29,
      marginTop: 2,
    },

    stepDescription: {
      marginTop: 2,
      lineHeight: 19,
    },

    stepPill: {
      minWidth: 42,
      height: 34,
      borderRadius:
        radius.full,
      backgroundColor:
        colors.mintSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 9,
      marginRight: 10,
    },

    stepperRow: {
      flexDirection:
        'row-reverse',
      alignItems:
        'flex-start',
      marginTop: 13,
    },

    stepItem: {
      flex: 1,
      alignItems: 'center',
    },

    stepBar: {
      height: 3,
      alignSelf:
        'stretch',
      marginHorizontal: 3,
      borderRadius: 2,
      backgroundColor:
        colors.border,
    },

    stepBarActive: {
      backgroundColor:
        colors.primary,
    },

    stepDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor:
        colors.tintStrong,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 7,
      marginBottom: 3,
    },

    stepDotActive: {
      backgroundColor:
        colors.primary,
    },

    /* =====================================================
       BODY
    ===================================================== */

    body: {
      paddingHorizontal: 12,
      paddingTop: 13,
    },

    /* =====================================================
       PROMO
    ===================================================== */

    promo: {
      ...card,
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      padding: 12,
      marginBottom: 10,
    },

    promoIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor:
        colors.tintStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },

    promoText: {
      flex: 1,
      marginRight: 10,
    },

    promoDescription: {
      marginTop: 2,
      lineHeight: 18,
    },

    /* =====================================================
       CARDS
    ===================================================== */

    card: {
      ...card,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        colors.border,
      shadowOpacity: 0,
      elevation: 0,
    },

    cardHeading: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      marginBottom: 11,
    },

    cardIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor:
        colors.tintStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cardHeadingText: {
      marginRight: 8,
    },

    /* =====================================================
       INPUTS
    ===================================================== */

    input: {
      backgroundColor:
        colors.tint,
      borderRadius:
        radius.md,
      paddingHorizontal: 13,
      minHeight: 48,
      fontFamily:
        fontFamilies['400'],
      fontSize: 14,
      color:
        colors.text,
    } as object,

    bioInput: {
      minHeight: 112,
      paddingTop: 11,
      lineHeight: 23,
    },

    helper: {
      marginTop: 8,
      lineHeight: 18,
    },

    feeInput: {
      marginTop: 10,
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
      padding: 8,
      marginTop: 9,
    },

    smartText: {
      flex: 1,
      marginRight: 5,
      lineHeight: 18,
    },

    /* =====================================================
       PHONE
    ===================================================== */

    phoneField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        colors.tint,
      borderRadius:
        radius.md,
      minHeight: 48,
      paddingHorizontal: 13,
    },

    phoneInput: {
      flex: 1,
      marginLeft: 11,
      minHeight: 48,
      fontFamily:
        fontFamilies['500'],
      fontSize: 15,
      color:
        colors.text,
      textAlign:
        'left',
    } as object,

    /* =====================================================
       CATEGORY
    ===================================================== */

    categoryScroll: {
      gap: 7,
      paddingTop: 10,
      paddingBottom: 3,
    },

    categoryChip: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      height: 38,
      paddingHorizontal: 12,
      borderRadius:
        radius.full,
      backgroundColor:
        colors.tintStrong,
      borderWidth: 1,
      borderColor:
        colors.border,
      gap: 5,
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
      alignItems: 'center',
      alignSelf:
        'flex-start',
      backgroundColor:
        colors.mintSoft,
      borderRadius:
        radius.full,
      marginTop: 10,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },

    selectedCategoryText: {
      marginRight: 5,
    },

    /* =====================================================
       TAGS
    ===================================================== */

    wrap: {
      flexDirection:
        'row-reverse',
      flexWrap: 'wrap',
      gap: 7,
      marginTop: 10,
    },

    specialty: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      minHeight: 37,
      paddingHorizontal: 12,
      borderRadius:
        radius.full,
      backgroundColor:
        colors.tintStrong,
      gap: 5,
    },

    specialtyActive: {
      backgroundColor:
        colors.primary,
    },

    areaChip: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      minHeight: 37,
      paddingHorizontal: 12,
      borderRadius:
        radius.full,
      backgroundColor:
        colors.tintStrong,
      gap: 5,
    },

    areaChipActive: {
      backgroundColor:
        colors.primary,
    },

    /* =====================================================
       OPTIONS
    ===================================================== */

    optionRow: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      backgroundColor:
        colors.tint,
      borderRadius:
        radius.md,
      padding: 10,
    },

    optionIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        colors.success,
      alignItems: 'center',
      justifyContent: 'center',
    },

    optionIconSoft: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        colors.mintSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    optionContent: {
      flex: 1,
      marginHorizontal: 10,
    },

    /* =====================================================
       INFO
    ===================================================== */

    infoRow: {
      flexDirection:
        'row-reverse',
      alignItems:
        'flex-start',
      marginTop: 9,
    },

    infoText: {
      flex: 1,
      marginRight: 5,
      lineHeight: 18,
    },

    /* =====================================================
       LOCATION NOTE
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
      padding: 11,
      marginBottom: 10,
    },

    locationTrustIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },

    locationTrustContent: {
      flex: 1,
      marginRight: 9,
    },

    locationTrustText: {
      marginTop: 1,
      lineHeight: 18,
    },

    /* =====================================================
       PREVIEW
    ===================================================== */

    previewCard: {
      backgroundColor:
        colors.tint,
      borderRadius:
        radius.lg,
      padding: 12,
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
      width: 66,
      height: 66,
    },

    previewImage: {
      width: 66,
      height: 66,
      borderRadius: 17,
      backgroundColor:
        colors.tintStrong,
    },

    previewNewBadge: {
      position:
        'absolute',
      top: -3,
      right: -3,
      width: 21,
      height: 21,
      borderRadius: 11,
      backgroundColor:
        colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    previewInfo: {
      flex: 1,
      minWidth: 0,
      marginRight: 10,
    },

    previewName: {
      fontSize: 18,
      lineHeight: 25,
    },

    previewSubtitle: {
      marginTop: 2,
    },

    previewRating: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      gap: 5,
      marginTop: 5,
    },

    previewDivider: {
      height: 1,
      backgroundColor:
        colors.border,
      marginVertical: 11,
    },

    previewTags: {
      flexDirection:
        'row-reverse',
      flexWrap: 'wrap',
      gap: 6,
    },

    previewTag: {
      backgroundColor:
        colors.mintSoft,
      borderRadius:
        radius.full,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    previewMeta: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 10,
    },

    previewMetaItem: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      gap: 4,
    },

    /* =====================================================
       SUMMARY
    ===================================================== */

    summary: {
      gap: 1,
    },

    summaryRow: {
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      minHeight: 39,
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border,
    },

    summaryValue: {
      flex: 1,
      textAlign: 'left',
      marginRight: 14,
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
      borderWidth: 1,
      borderColor:
        colors.border,
      padding: 12,
      marginBottom: 10,
    },

    confirmRowPressed: {
      backgroundColor:
        colors.tint,
    },

    checkbox: {
      width: 23,
      height: 23,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor:
        colors.border,
      alignItems: 'center',
      justifyContent: 'center',
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
      flex: 1,
      marginRight: 9,
      lineHeight: 20,
    },

    /* =====================================================
       NAVIGATION
    ===================================================== */

    navigation: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      paddingHorizontal: 12,
      marginTop: 2,
      gap: 9,
    },

    nextButton: {
      flex: 1,
      minHeight: 52,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.primary,
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
    },

    nextButtonPressed: {
      opacity: 0.88,
    },

    nextButtonDisabled: {
      opacity: 0.5,
    },

    backButton: {
      minHeight: 52,
      paddingHorizontal: 15,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.mintSoft,
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    backButtonPressed: {
      backgroundColor:
        colors.tintStrong,
    },

    cancelButton: {
      minHeight: 52,
      paddingHorizontal: 15,
      borderRadius:
        radius.md,
      backgroundColor:
        colors.tintStrong,
      flexDirection:
        'row-reverse',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    cancelButtonPressed: {
      opacity: 0.75,
    },

    backText: {
      marginRight: 5,
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
      paddingHorizontal: 18,
      marginTop: 15,
    },

    footerText: {
      flex: 1,
      marginRight: 5,
      textAlign: 'center',
      lineHeight: 18,
    },
  });