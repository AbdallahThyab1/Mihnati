import React, {
    useMemo,
    useState,
} from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import {
    useLocalSearchParams,
    useRouter,
} from 'expo-router';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock3,
    MapPin,
    NotebookPen,
    ShieldCheck,
    UserRound,
    Wrench,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';
import {
    categories,
    getCraftsman,
} from '../../data/mock';
import {
    addBooking,
    type ServiceBooking,
} from '../../data/bookings';
import {
    addMyService,
    addServiceReminder,
} from '../../data/myServices';
import {
    colors,
    radius,
    row,
} from '../../styles/theme';

const timeSlots = [
    '09:00',
    '10:30',
    '12:00',
    '14:00',
    '16:30',
    '18:00',
];

const getParam = (
    value: string | string[] | undefined,
) =>
    Array.isArray(value)
        ? value[0] ?? ''
        : value ?? '';

const formatLocalDate = (
    date: Date,
) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(
        2,
        '0',
    );
    const day = `${date.getDate()}`.padStart(
        2,
        '0',
    );

    return `${year}-${month}-${day}`;
};

const getNextDates = () => {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 1; i <= 7; i += 1) {
        const date = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + i,
            12,
        );

        dates.push(formatLocalDate(date));
    }

    return dates;
};

const getDateParts = (
    value: string,
) => {
    const date = new Date(
        `${value}T12:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return {
            weekday: '',
            day: '',
            month: '',
        };
    }

    const weekday = date.toLocaleDateString(
        'ar',
        {
            weekday: 'short',
        },
    );

    const month = date.toLocaleDateString(
        'ar',
        {
            month: 'short',
        },
    );

    return {
        weekday,
        day: `${date.getDate()}`,
        month,
    };
};

const formatLongDate = (
    value: string,
) => {
    const date = new Date(
        `${value}T12:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const weekday =
        date.toLocaleDateString(
            'ar',
            {
                weekday: 'long',
            },
        );

    const day =
        date.getDate();

    const month =
        date.toLocaleDateString(
            'ar',
            {
                month: 'long',
            },
        );

    const year =
        date.getFullYear();

    return `${weekday}، ${day} ${month} ${year}`;
};

const getServiceTitle = (
    categoryId: string,
) => {
    switch (categoryId) {
        case 'appliances':
            return 'صيانة الأجهزة المنزلية';

        case 'ac':
            return 'صيانة التكييف والتبريد';

        case 'cars':
            return 'صيانة السيارات';

        case 'tech':
            return 'خدمات الهواتف والتقنية';

        case 'plumbing':
            return 'أعمال السباكة والمياه';

        case 'electric':
            return 'أعمال الكهرباء';

        case 'paint':
            return 'الدهان والديكور';

        case 'carpentry':
            return 'النجارة والأثاث';

        case 'cleaning':
            return 'خدمات التنظيف';

        case 'moving':
            return 'خدمات النقل والعفش';

        default:
            return (
                categories.find(
                    (item) =>
                        item.id === categoryId,
                )?.label ?? 'الخدمة'
            );
    }
};

function StepHeader({
    number,
    icon,
    title,
    subtitle,
}: {
    number: string;
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    return (
        <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
                <Txt
                    variant="labelSm"
                    color={colors.white}
                    weight="800"
                >
                    {number}
                </Txt>
            </View>

            <View style={styles.stepIcon}>
                {icon}
            </View>

            <View style={styles.stepText}>
                <Txt
                    variant="h4"
                    style={styles.stepTitle}
                >
                    {title}
                </Txt>

                {subtitle ? (
                    <Txt
                        variant="small"
                        color={colors.muted}
                        style={styles.stepSubtitle}
                    >
                        {subtitle}
                    </Txt>
                ) : null}
            </View>
        </View>
    );
}

function SelectionChip({
    label,
    selected,
    onPress,
}: {
    label: string;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.selectionChip,
                selected &&
                styles.selectionChipSelected,
                pressed &&
                styles.selectionChipPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{
                selected,
            }}
        >
            {selected ? (
                <Check
                    size={15}
                    color={colors.white}
                />
            ) : null}

            <Txt
                variant="labelSm"
                weight="700"
                color={
                    selected
                        ? colors.white
                        : colors.text
                }
            >
                {label}
            </Txt>
        </Pressable>
    );
}

function BookingSuccess({
    booking,
    providerName,
    onViewServices,
    onBackToProfile,
}: {
    booking: ServiceBooking;
    providerName: string;
    onViewServices: () => void;
    onBackToProfile: () => void;
}) {
    return (
        <View style={styles.successScreen}>
            <View style={styles.successIcon}>
                <CheckCircle2
                    size={58}
                    color={colors.success}
                />
            </View>

            <Txt
                variant="h1"
                align="center"
                style={styles.successTitle}
            >
                تم تأكيد الحجز
            </Txt>

            <Txt
                variant="body"
                color={colors.muted}
                align="center"
                style={styles.successDescription}
            >
                موعدك أصبح محفوظًا، وتمت إضافة الخدمة تلقائيًا إلى
                «خدماتي».
            </Txt>

            <View style={styles.successCard}>
                <View style={styles.successRow}>
                    <Txt
                        variant="small"
                        color={colors.muted}
                    >
                        الخدمة
                    </Txt>

                    <Txt
                        variant="label"
                        weight="700"
                        style={styles.successValue}
                    >
                        {booking.serviceTitle}
                    </Txt>
                </View>

                <View style={styles.successDivider} />

                <View style={styles.successRow}>
                    <Txt
                        variant="small"
                        color={colors.muted}
                    >
                        التاريخ
                    </Txt>

                    <Txt
                        variant="label"
                        weight="700"
                        style={styles.successValue}
                    >
                        {formatLongDate(
                            booking.date,
                        )}
                    </Txt>
                </View>

                <View style={styles.successDivider} />

                <View style={styles.successRow}>
                    <Txt
                        variant="small"
                        color={colors.muted}
                    >
                        الوقت
                    </Txt>

                    <Txt
                        variant="label"
                        weight="700"
                        style={styles.successValue}
                    >
                        {booking.time}
                    </Txt>
                </View>

                <View style={styles.successDivider} />

                <View style={styles.successRow}>
                    <Txt
                        variant="small"
                        color={colors.muted}
                    >
                        مقدم الخدمة
                    </Txt>

                    <Txt
                        variant="label"
                        weight="700"
                        numberOfLines={1}
                        style={styles.successValue}
                    >
                        {providerName}
                    </Txt>
                </View>
            </View>

            <View style={styles.successNotice}>
                <ShieldCheck
                    size={20}
                    color={colors.primary}
                />

                <Txt
                    variant="small"
                    color={colors.muted}
                    style={styles.successNoticeText}
                >
                    يمكنك متابعة موعدك والخدمة المرتبطة به من قسم
                    «خدماتي».
                </Txt>
            </View>

            <Pressable
                onPress={onViewServices}
                style={({ pressed }) => [
                    styles.successPrimaryButton,
                    pressed &&
                    styles.buttonPressed,
                ]}
            >
                <Txt
                    variant="label"
                    color={colors.white}
                    weight="800"
                >
                    الانتقال إلى خدماتي
                </Txt>

                <ArrowLeft
                    size={18}
                    color={colors.white}
                />
            </Pressable>

            <Pressable
                onPress={onBackToProfile}
                style={({ pressed }) => [
                    styles.successSecondaryButton,
                    pressed &&
                    styles.secondaryPressed,
                ]}
            >
                <Txt
                    variant="label"
                    color={colors.primary}
                    weight="700"
                >
                    العودة إلى ملف مقدم الخدمة
                </Txt>
            </Pressable>
        </View>
    );
}

export default function BookingScreen() {
    const router = useRouter();

    const params =
        useLocalSearchParams<{
            craftsmanId?:
            | string
            | string[];
            categoryId?:
            | string
            | string[];
        }>();

    const craftsmanId = getParam(
        params.craftsmanId,
    );

    const craftsman = getCraftsman(
        craftsmanId || 'c1',
    );

    const dates = useMemo(
        getNextDates,
        [],
    );

    const providerCategories =
        useMemo(
            () =>
                craftsman.categoryIds
                    .map((id) =>
                        categories.find(
                            (category) =>
                                category.id === id,
                        ),
                    )
                    .filter(
                        (
                            item,
                        ): item is NonNullable<
                            typeof item
                        > => Boolean(item),
                    ),
            [craftsman.categoryIds],
        );

    const requestedCategoryId =
        getParam(params.categoryId);

    const defaultCategory =
        providerCategories.find(
            (item) =>
                item.id ===
                requestedCategoryId,
        ) ??
        providerCategories[0];

    const [
        categoryId,
        setCategoryId,
    ] = useState(
        defaultCategory?.id ??
        craftsman.categoryIds[0] ??
        '',
    );

    const [date, setDate] =
        useState(dates[0]);

    const [time, setTime] =
        useState(timeSlots[1]);

    const [notes, setNotes] =
        useState('');

    const [submitting, setSubmitting] =
        useState(false);

    const [
        confirmedBooking,
        setConfirmedBooking,
    ] = useState<
        ServiceBooking | undefined
    >();

    const categoryLabel =
        categories.find(
            (item) =>
                item.id === categoryId,
        )?.label ?? 'الخدمة';

    const serviceTitle =
        getServiceTitle(categoryId);

    const dateParts =
        dates.map((item) => ({
            value: item,
            ...getDateParts(item),
        }));

    const selectedDateLabel =
        formatLongDate(date);

    const handleConfirm = () => {
        if (submitting) {
            return;
        }

        setSubmitting(true);

        const trimmedNotes =
            notes.trim() || undefined;

        const booking =
            addBooking({
                craftsmanId:
                    craftsman.id,
                categoryId,
                serviceTitle,
                date,
                time,
                notes: trimmedNotes,
            });

        const service =
            addMyService({
                title: serviceTitle,
                categoryId,
                craftsmanId:
                    craftsman.id,
                lastServiceDate:
                    new Date()
                        .toISOString()
                        .slice(0, 10),
                sourceBookingId:
                    booking.id,
                nextBookingDate:
                    booking.date,
                nextBookingTime:
                    booking.time,
                notes: trimmedNotes,
            });

        addServiceReminder({
            serviceId: service.id,
            title: `موعد ${serviceTitle}`,
            date: booking.date,
            type: 'booking',
            notes: `موعد محجوز مع ${craftsman.name}.`,
        });

        setConfirmedBooking(
            booking,
        );

        setSubmitting(false);
    };

    if (confirmedBooking) {
        return (
            <View style={styles.screen}>
                <ScreenHeader title="تم الحجز" />

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.successContent
                    }
                >
                    <BookingSuccess
                        booking={
                            confirmedBooking
                        }
                        providerName={
                            craftsman.name
                        }
                        onViewServices={() =>
                            router.replace(
                                '/services',
                            )
                        }
                        onBackToProfile={() =>
                            router.replace({
                                pathname:
                                    '/profile/[id]',
                                params: {
                                    id: craftsman.id,
                                },
                            })
                        }
                    />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <ScreenHeader title="حجز موعد" />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : undefined
                }
            >
                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.content
                    }
                >
                    <View style={styles.providerCard}>
                        <View style={styles.providerAvatar}>
                            <UserRound
                                size={22}
                                color={colors.primary}
                            />
                        </View>

                        <View
                            style={styles.providerInfo}
                        >
                            <View
                                style={
                                    styles.providerNameRow
                                }
                            >
                                <Txt
                                    variant="h3"
                                    numberOfLines={1}
                                    style={
                                        styles.providerName
                                    }
                                >
                                    {craftsman.name}
                                </Txt>

                                {craftsman.verified ? (
                                    <View
                                        style={
                                            styles.verifiedDot
                                        }
                                    >
                                        <Check
                                            size={10}
                                            color={
                                                colors.white
                                            }
                                        />
                                    </View>
                                ) : null}
                            </View>

                            <Txt
                                variant="small"
                                color={colors.muted}
                                numberOfLines={2}
                                style={
                                    styles.providerSpecialty
                                }
                            >
                                {craftsman.specialty}
                            </Txt>

                            <View
                                style={
                                    styles.providerLocation
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
                                    color={colors.muted}
                                    style={{
                                        marginRight: 4,
                                    }}
                                >
                                    {craftsman.area}
                                </Txt>
                            </View>
                        </View>
                    </View>

                    <View style={styles.progress}>
                        <View
                            style={[
                                styles.progressItem,
                                styles.progressItemActive,
                            ]}
                        >
                            <View
                                style={
                                    styles.progressDot
                                }
                            />
                            <Txt
                                variant="labelSm"
                                color={colors.primary}
                                weight="700"
                            >
                                الخدمة
                            </Txt>
                        </View>

                        <View
                            style={
                                styles.progressLine
                            }
                        />

                        <View style={styles.progressItem}>
                            <View
                                style={
                                    styles.progressDot
                                }
                            />
                            <Txt
                                variant="labelSm"
                                color={colors.muted}
                                weight="600"
                            >
                                الموعد
                            </Txt>
                        </View>

                        <View
                            style={
                                styles.progressLine
                            }
                        />

                        <View style={styles.progressItem}>
                            <View
                                style={
                                    styles.progressDot
                                }
                            />
                            <Txt
                                variant="labelSm"
                                color={colors.muted}
                                weight="600"
                            >
                                التأكيد
                            </Txt>
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <StepHeader
                            number="1"
                            title="اختر الخدمة"
                            subtitle="حدد المجال الذي تحتاجه"
                            icon={
                                <Wrench
                                    size={17}
                                    color={
                                        colors.primary
                                    }
                                />
                            }
                        />

                        <View
                            style={styles.chipsWrap}
                        >
                            {providerCategories.map(
                                (category) => (
                                    <SelectionChip
                                        key={
                                            category.id
                                        }
                                        label={
                                            category.label
                                        }
                                        selected={
                                            category.id ===
                                            categoryId
                                        }
                                        onPress={() =>
                                            setCategoryId(
                                                category.id,
                                            )
                                        }
                                    />
                                ),
                            )}
                        </View>

                        <View
                            style={
                                styles.selectedService
                            }
                        >
                            <View
                                style={
                                    styles.selectedServiceIcon
                                }
                            >
                                <Wrench
                                    size={17}
                                    color={
                                        colors.primary
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.selectedServiceBody
                                }
                            >
                                <Txt
                                    variant="small"
                                    color={colors.muted}
                                >
                                    الخدمة المحددة
                                </Txt>

                                <Txt
                                    variant="label"
                                    weight="800"
                                    style={
                                        styles.selectedServiceTitle
                                    }
                                >
                                    {serviceTitle}
                                </Txt>
                            </View>

                            <Check
                                size={18}
                                color={
                                    colors.success
                                }
                            />
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <StepHeader
                            number="2"
                            title="اختر اليوم"
                            subtitle="المواعيد المتاحة للأيام القادمة"
                            icon={
                                <CalendarDays
                                    size={17}
                                    color={
                                        colors.primary
                                    }
                                />
                            }
                        />

                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.dateScroll
                            }
                        >
                            {dateParts.map(
                                (item, index) => {
                                    const selected =
                                        item.value ===
                                        date;

                                    return (
                                        <Pressable
                                            key={
                                                item.value
                                            }
                                            onPress={() =>
                                                setDate(
                                                    item.value,
                                                )
                                            }
                                            style={({
                                                pressed,
                                            }) => [
                                                    styles.dateCard,
                                                    selected &&
                                                    styles.dateCardSelected,
                                                    pressed &&
                                                    styles.dateCardPressed,
                                                ]}
                                        >
                                            <Txt
                                                variant="labelSm"
                                                color={
                                                    selected
                                                        ? '#DCEBE3'
                                                        : colors.muted
                                                }
                                                weight="600"
                                            >
                                                {index === 0
                                                    ? 'غدًا'
                                                    : item.weekday}
                                            </Txt>

                                            <Txt
                                                variant="h2"
                                                color={
                                                    selected
                                                        ? colors.white
                                                        : colors.text
                                                }
                                                style={
                                                    styles.dateDay
                                                }
                                            >
                                                {
                                                    item.day
                                                }
                                            </Txt>

                                            <Txt
                                                variant="small"
                                                color={
                                                    selected
                                                        ? '#DCEBE3'
                                                        : colors.muted
                                                }
                                            >
                                                {item.month}
                                            </Txt>
                                        </Pressable>
                                    );
                                },
                            )}
                        </ScrollView>

                        <View
                            style={
                                styles.selectedDateBar
                            }
                        >
                            <CalendarDays
                                size={16}
                                color={
                                    colors.primary
                                }
                            />

                            <Txt
                                variant="labelSm"
                                color={colors.primary}
                                weight="700"
                                style={{
                                    marginRight: 6,
                                }}
                            >
                                {selectedDateLabel}
                            </Txt>
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <StepHeader
                            number="3"
                            title="اختر الوقت"
                            subtitle="اختر الوقت الذي يناسبك"
                            icon={
                                <Clock3
                                    size={17}
                                    color={
                                        colors.primary
                                    }
                                />
                            }
                        />

                        <View
                            style={styles.timeGrid}
                        >
                            {timeSlots.map(
                                (slot) => {
                                    const selected =
                                        slot ===
                                        time;

                                    return (
                                        <Pressable
                                            key={slot}
                                            onPress={() =>
                                                setTime(
                                                    slot,
                                                )
                                            }
                                            style={({
                                                pressed,
                                            }) => [
                                                    styles.timeChip,
                                                    selected &&
                                                    styles.timeChipSelected,
                                                    pressed &&
                                                    styles.timeChipPressed,
                                                ]}
                                        >
                                            {selected ? (
                                                <Check
                                                    size={15}
                                                    color={
                                                        colors.white
                                                    }
                                                />
                                            ) : (
                                                <Clock3
                                                    size={15}
                                                    color={
                                                        colors.muted
                                                    }
                                                />
                                            )}

                                            <Txt
                                                variant="label"
                                                weight="700"
                                                color={
                                                    selected
                                                        ? colors.white
                                                        : colors.text
                                                }
                                                style={{
                                                    marginRight: 6,
                                                }}
                                            >
                                                {slot}
                                            </Txt>
                                        </Pressable>
                                    );
                                },
                            )}
                        </View>
                    </View>

                    <View style={styles.sectionCard}>
                        <StepHeader
                            number="4"
                            title="أضف ملاحظة"
                            subtitle="اختياري — أي تفاصيل تساعد مقدم الخدمة"
                            icon={
                                <NotebookPen
                                    size={17}
                                    color={
                                        colors.primary
                                    }
                                />
                            }
                        />

                        <TextInput
                            value={notes}
                            onChangeText={
                                setNotes
                            }
                            placeholder="مثال: الغسالة لا تقوم بالعصر وتصدر صوتًا..."
                            placeholderTextColor={
                                colors.muted
                            }
                            multiline
                            textAlign="right"
                            textAlignVertical="top"
                            maxLength={220}
                            style={
                                styles.notesInput
                            }
                        />

                        <Txt
                            variant="small"
                            color={colors.muted}
                            align="left"
                            style={
                                styles.characterCount
                            }
                        >
                            {notes.length}/220
                        </Txt>
                    </View>

                    <View style={styles.infoBox}>
                        <ShieldCheck
                            size={20}
                            color={colors.primary}
                        />

                        <View
                            style={styles.infoBoxText}
                        >
                            <Txt
                                variant="label"
                                color={colors.primary}
                                weight="800"
                            >
                                حجز واضح بدون تعقيد
                            </Txt>

                            <Txt
                                variant="small"
                                color={colors.muted}
                                style={
                                    styles.infoBoxDescription
                                }
                            >
                                السعر النهائي ووقت تنفيذ الخدمة يتم تأكيدهما مع
                                مقدم الخدمة.
                            </Txt>
                        </View>
                    </View>

                    <View style={styles.summaryCard}>
                        <View
                            style={
                                styles.summaryHeader
                            }
                        >
                            <Txt
                                variant="h4"
                                style={
                                    styles.summaryTitle
                                }
                            >
                                مراجعة الحجز
                            </Txt>

                            <View
                                style={
                                    styles.summaryBadge
                                }
                            >
                                <Txt
                                    variant="labelSm"
                                    color={
                                        colors.primary
                                    }
                                    weight="700"
                                >
                                    {time}
                                </Txt>
                            </View>
                        </View>

                        <View
                            style={styles.summaryRow}
                        >
                            <Txt
                                variant="small"
                                color={colors.muted}
                            >
                                الخدمة
                            </Txt>

                            <Txt
                                variant="label"
                                weight="700"
                                numberOfLines={1}
                                style={
                                    styles.summaryValue
                                }
                            >
                                {serviceTitle}
                            </Txt>
                        </View>

                        <View
                            style={styles.summaryRow}
                        >
                            <Txt
                                variant="small"
                                color={colors.muted}
                            >
                                التاريخ
                            </Txt>

                            <Txt
                                variant="label"
                                weight="700"
                                numberOfLines={1}
                                style={
                                    styles.summaryValue
                                }
                            >
                                {selectedDateLabel}
                            </Txt>
                        </View>

                        <View
                            style={styles.summaryRow}
                        >
                            <Txt
                                variant="small"
                                color={colors.muted}
                            >
                                مقدم الخدمة
                            </Txt>

                            <Txt
                                variant="label"
                                weight="700"
                                numberOfLines={1}
                                style={
                                    styles.summaryValue
                                }
                            >
                                {craftsman.name}
                            </Txt>
                        </View>
                    </View>

                    <Pressable
                        onPress={
                            handleConfirm
                        }
                        disabled={submitting}
                        style={({ pressed }) => [
                            styles.confirmButton,
                            pressed &&
                            styles.buttonPressed,
                            submitting &&
                            styles.confirmButtonDisabled,
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel="تأكيد الحجز"
                    >
                        <View
                            style={
                                styles.confirmIcon
                            }
                        >
                            <Check
                                size={19}
                                color={
                                    colors.primary
                                }
                            />
                        </View>

                        <View
                            style={
                                styles.confirmText
                            }
                        >
                            <Txt
                                variant="label"
                                color={colors.white}
                                weight="800"
                            >
                                {submitting
                                    ? 'جاري تأكيد الحجز...'
                                    : 'تأكيد الحجز'}
                            </Txt>

                            <Txt
                                variant="small"
                                color="#DCEBE3"
                                style={
                                    styles.confirmHint
                                }
                            >
                                سيتم حفظ الخدمة تلقائيًا في خدماتي
                            </Txt>
                        </View>

                        <ArrowLeft
                            size={19}
                            color={colors.white}
                        />
                    </Pressable>

                    <Txt
                        variant="small"
                        color={colors.muted}
                        align="center"
                        style={styles.bottomNote}
                    >
                        الحجز في هذه النسخة التجريبية يتم حفظه محليًا.
                    </Txt>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.canvas,
    },

    flex: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 14,
        paddingTop: 13,
        paddingBottom: 35,
    },

    providerCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        padding: 13,
    },

    providerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 16,
        backgroundColor: colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },

    providerInfo: {
        flex: 1,
        marginRight: 10,
    },

    providerNameRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },

    providerName: {
        flex: 1,
        fontSize: 16,
    },

    verifiedDot: {
        width: 19,
        height: 19,
        borderRadius: 9.5,
        backgroundColor: colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },

    providerSpecialty: {
        marginTop: 2,
        lineHeight: 18,
    },

    providerLocation: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 5,
    },

    progress: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        paddingHorizontal: 6,
    },

    progressItem: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },

    progressItemActive: {
        opacity: 1,
    },

    progressDot: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: colors.border,
        marginLeft: 5,
    },

    progressLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: 7,
    },

    sectionCard: {
        marginTop: 18,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        padding: 13,
    },

    stepHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },

    stepNumber: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    stepIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 7,
    },

    stepText: {
        flex: 1,
        marginRight: 8,
    },

    stepTitle: {
        fontSize: 15,
    },

    stepSubtitle: {
        marginTop: 1,
        lineHeight: 17,
    },

    chipsWrap: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },

    selectionChip: {
        minHeight: 41,
        paddingHorizontal: 13,
        borderRadius: radius.full,
        backgroundColor: colors.canvas,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },

    selectionChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    selectionChipPressed: {
        opacity: 0.8,
    },

    selectedService: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 12,
        padding: 10,
        borderRadius: radius.lg,
        backgroundColor: colors.tintStrong,
    },

    selectedServiceIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    selectedServiceBody: {
        flex: 1,
        marginHorizontal: 9,
    },

    selectedServiceTitle: {
        marginTop: 1,
    },

    dateScroll: {
        paddingTop: 12,
        gap: 8,
    },

    dateCard: {
        width: 67,
        minHeight: 91,
        borderRadius: radius.lg,
        backgroundColor: colors.canvas,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },

    dateCardSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    dateCardPressed: {
        opacity: 0.82,
    },

    dateDay: {
        fontSize: 22,
        marginTop: 4,
        marginBottom: 1,
    },

    selectedDateBar: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 11,
        minHeight: 40,
        borderRadius: radius.md,
        backgroundColor: colors.tintStrong,
    },

    timeGrid: {
        flexDirection: 'row-reverse',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },

    timeChip: {
        width: '31.8%',
        minHeight: 48,
        borderRadius: radius.md,
        backgroundColor: colors.canvas,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
    },

    timeChipSelected: {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
    },

    timeChipPressed: {
        opacity: 0.82,
    },

    notesInput: {
        minHeight: 105,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: colors.canvas,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        color: colors.text,
        fontSize: 13,
        lineHeight: 21,
    },

    characterCount: {
        marginTop: 5,
    },

    infoBox: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        marginTop: 13,
        padding: 12,
        backgroundColor: colors.tintStrong,
        borderRadius: radius.lg,
    },

    infoBoxText: {
        flex: 1,
        marginRight: 9,
    },

    infoBoxDescription: {
        marginTop: 2,
        lineHeight: 18,
    },

    summaryCard: {
        marginTop: 13,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        padding: 13,
    },

    summaryHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 8,
        marginBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    summaryTitle: {
        fontSize: 15,
    },

    summaryBadge: {
        minWidth: 55,
        minHeight: 29,
        paddingHorizontal: 8,
        borderRadius: radius.full,
        backgroundColor: colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 37,
    },

    summaryValue: {
        maxWidth: '68%',
        textAlign: 'right',
    },

    confirmButton: {
        minHeight: 62,
        marginTop: 14,
        paddingHorizontal: 12,
        borderRadius: radius.xl,
        backgroundColor: colors.primary,
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },

    confirmButtonDisabled: {
        opacity: 0.6,
    },

    confirmIcon: {
        width: 39,
        height: 39,
        borderRadius: 13,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    confirmText: {
        flex: 1,
        marginHorizontal: 10,
    },

    confirmHint: {
        marginTop: 1,
        lineHeight: 17,
    },

    buttonPressed: {
        opacity: 0.86,
    },

    bottomNote: {
        marginTop: 11,
        lineHeight: 17,
    },

    successContent: {
        flexGrow: 1,
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 30,
    },

    successScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },

    successIcon: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: '#EEF8F2',
        alignItems: 'center',
        justifyContent: 'center',
    },

    successTitle: {
        marginTop: 17,
        fontSize: 24,
    },

    successDescription: {
        maxWidth: 320,
        marginTop: 6,
        lineHeight: 21,
    },

    successCard: {
        alignSelf: 'stretch',
        marginTop: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.xl,
        paddingHorizontal: 13,
    },

    successRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 49,
    },

    successValue: {
        maxWidth: '70%',
        textAlign: 'right',
    },

    successDivider: {
        height: 1,
        backgroundColor: colors.border,
    },

    successNotice: {
        alignSelf: 'stretch',
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        marginTop: 12,
        padding: 12,
        backgroundColor: colors.tintStrong,
        borderRadius: radius.lg,
    },

    successNoticeText: {
        flex: 1,
        marginRight: 8,
        lineHeight: 19,
    },

    successPrimaryButton: {
        alignSelf: 'stretch',
        minHeight: 53,
        marginTop: 17,
        borderRadius: radius.lg,
        backgroundColor: colors.primary,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },

    successSecondaryButton: {
        alignSelf: 'stretch',
        minHeight: 48,
        marginTop: 8,
        borderRadius: radius.lg,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },

    secondaryPressed: {
        backgroundColor: '#FAFBF9',
    },
});