import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
    CalendarClock,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock3,
    MapPin,
    NotebookPen,
    Search,
    UserRound,
    X,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';
import {
    getBookings,
    subscribeBookings,
    updateBooking,
    type ServiceBooking,
} from '../../data/bookings';
import {
    getMyServices,
    type MyService,
} from '../../data/myServices';
import { getCraftsman } from '../../data/mock';
import {
    colors,
    radius,
    row,
} from '../../styles/theme';

type BookingFilter =
    | 'upcoming'
    | 'completed'
    | 'cancelled';

const monthNames = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
];

const getTodayTimestamp = () => {
    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        12,
    ).getTime();
};

const getBookingTimestamp = (
    booking: ServiceBooking,
) => {
    const date = new Date(
        `${booking.date}T${booking.time || '12:00'}:00`,
    );

    return Number.isNaN(date.getTime())
        ? 0
        : date.getTime();
};

const isUpcomingDate = (
    booking: ServiceBooking,
) => {
    return (
        getBookingTimestamp(booking) >=
        getTodayTimestamp()
    );
};

const formatDate = (
    value: string,
) => {
    const date = new Date(
        `${value}T12:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const formatShortDate = (
    value: string,
) => {
    const date = new Date(
        `${value}T12:00:00`,
    );

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return `${date.getDate()}/${date.getMonth() + 1}`;
};

const getRelativeDate = (
    value: string,
) => {
    const target = new Date(
        `${value}T12:00:00`,
    );

    const today = new Date();

    const targetStart = new Date(
        target.getFullYear(),
        target.getMonth(),
        target.getDate(),
        12,
    );

    const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        12,
    );

    const diff = Math.round(
        (targetStart.getTime() -
            todayStart.getTime()) /
        86400000,
    );

    if (diff === 0) {
        return 'اليوم';
    }

    if (diff === 1) {
        return 'غدًا';
    }

    if (diff === -1) {
        return 'أمس';
    }

    if (diff > 1) {
        return `بعد ${diff} أيام`;
    }

    return `منذ ${Math.abs(diff)} أيام`;
};

const statusLabel = (
    status: ServiceBooking['status'],
) => {
    switch (status) {
        case 'confirmed':
            return 'مؤكد';

        case 'completed':
            return 'مكتمل';

        case 'cancelled':
            return 'ملغي';

        default:
            return status;
    }
};

const statusColor = (
    status: ServiceBooking['status'],
) => {
    switch (status) {
        case 'confirmed':
            return colors.primary;

        case 'completed':
            return colors.success;

        case 'cancelled':
            return colors.error;

        default:
            return colors.muted;
    }
};

const getFilterLabel = (
    filter: BookingFilter,
) => {
    switch (filter) {
        case 'completed':
            return 'مكتملة';

        case 'cancelled':
            return 'ملغاة';

        default:
            return 'القادمة';
    }
};

function FilterChip({
    label,
    count,
    selected,
    onPress,
}: {
    label: string;
    count: number;
    selected: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.filterChip,
                selected &&
                styles.filterChipSelected,
                pressed &&
                styles.filterPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{
                selected,
            }}
        >
            <Txt
                variant="labelSm"
                color={
                    selected
                        ? colors.white
                        : colors.text
                }
                weight="700"
            >
                {label}
            </Txt>

            <View
                style={[
                    styles.filterCount,
                    selected &&
                    styles.filterCountSelected,
                ]}
            >
                <Txt
                    variant="labelSm"
                    color={
                        selected
                            ? colors.primary
                            : colors.muted
                    }
                    weight="700"
                >
                    {count}
                </Txt>
            </View>
        </Pressable>
    );
}

function BookingCard({
    booking,
    linkedService,
    featured,
    onPress,
}: {
    booking: ServiceBooking;
    linkedService?: MyService;
    featured?: boolean;
    onPress: () => void;
}) {
    const provider = getCraftsman(
        booking.craftsmanId,
    );

    const color =
        statusColor(booking.status);

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.bookingCard,
                featured &&
                styles.bookingCardFeatured,
                pressed &&
                styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`عرض حجز ${booking.serviceTitle}`}
        >
            {featured ? (
                <View style={styles.featuredAccent} />
            ) : null}

            <View style={styles.bookingHeader}>
                <View style={styles.bookingIcon}>
                    {booking.status ===
                        'completed' ? (
                        <CheckCircle2
                            size={20}
                            color={colors.success}
                        />
                    ) : (
                        <CalendarClock
                            size={20}
                            color={color}
                        />
                    )}
                </View>

                <View
                    style={styles.bookingIdentity}
                >
                    <View
                        style={styles.bookingTitleRow}
                    >
                        <Txt
                            variant="h3"
                            numberOfLines={1}
                            style={styles.bookingTitle}
                        >
                            {booking.serviceTitle}
                        </Txt>

                        <View
                            style={[
                                styles.statusPill,
                                {
                                    backgroundColor:
                                        booking.status ===
                                            'cancelled'
                                            ? '#FFF1F1'
                                            : booking.status ===
                                                'completed'
                                                ? '#EEF8F2'
                                                : colors.tintStrong,
                                },
                            ]}
                        >
                            <Txt
                                variant="labelSm"
                                color={color}
                                weight="700"
                            >
                                {statusLabel(
                                    booking.status,
                                )}
                            </Txt>
                        </View>
                    </View>

                    <Txt
                        variant="small"
                        color={colors.muted}
                        numberOfLines={1}
                        style={styles.bookingProvider}
                    >
                        {provider.name}
                    </Txt>
                </View>

                <ChevronLeft
                    size={19}
                    color={colors.muted}
                />
            </View>

            {featured ? (
                <View style={styles.featuredDate}>
                    <View style={styles.featuredDateIcon}>
                        <CalendarClock
                            size={18}
                            color={colors.primary}
                        />
                    </View>

                    <View
                        style={styles.featuredDateBody}
                    >
                        <Txt
                            variant="labelSm"
                            color={colors.primary}
                            weight="700"
                        >
                            {getRelativeDate(
                                booking.date,
                            )}
                        </Txt>

                        <Txt
                            variant="h4"
                            style={styles.featuredDateTitle}
                        >
                            {formatDate(
                                booking.date,
                            )}
                        </Txt>

                        <Txt
                            variant="small"
                            color={colors.muted}
                        >
                            الساعة {booking.time}
                        </Txt>
                    </View>

                    <View
                        style={styles.confirmedBadge}
                    >
                        <Check
                            size={13}
                            color={colors.success}
                        />

                        <Txt
                            variant="labelSm"
                            color={colors.success}
                            weight="700"
                            style={{
                                marginRight: 4,
                            }}
                        >
                            موعد مؤكد
                        </Txt>
                    </View>
                </View>
            ) : (
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <CalendarClock
                            size={14}
                            color={colors.muted}
                        />

                        <Txt
                            variant="labelSm"
                            color={colors.muted}
                            style={styles.metaText}
                        >
                            {formatShortDate(
                                booking.date,
                            )}
                        </Txt>
                    </View>

                    <View style={styles.metaDivider} />

                    <View style={styles.metaItem}>
                        <Clock3
                            size={14}
                            color={colors.muted}
                        />

                        <Txt
                            variant="labelSm"
                            color={colors.muted}
                            style={styles.metaText}
                        >
                            {booking.time}
                        </Txt>
                    </View>

                    <View style={styles.metaDivider} />

                    <View style={styles.metaItem}>
                        <MapPin
                            size={14}
                            color={colors.muted}
                        />

                        <Txt
                            variant="labelSm"
                            color={colors.muted}
                            numberOfLines={1}
                            style={styles.metaText}
                        >
                            {provider.area}
                        </Txt>
                    </View>
                </View>
            )}

            {featured ? (
                <View style={styles.featuredMeta}>
                    <View style={styles.metaItem}>
                        <MapPin
                            size={14}
                            color={colors.muted}
                        />

                        <Txt
                            variant="labelSm"
                            color={colors.muted}
                            style={styles.metaText}
                        >
                            {provider.area}
                        </Txt>
                    </View>

                    <View style={styles.metaDivider} />

                    <Txt
                        variant="small"
                        color={colors.muted}
                    >
                        اضغط لعرض التفاصيل
                    </Txt>
                </View>
            ) : null}

            <View style={styles.bookingFooter}>
                {linkedService ? (
                    <View style={styles.serviceLink}>
                        <WrenchMini />

                        <Txt
                            variant="labelSm"
                            color={colors.primary}
                            weight="700"
                            style={{
                                marginRight: 5,
                            }}
                        >
                            محفوظ في خدماتي
                        </Txt>
                    </View>
                ) : (
                    <View style={styles.serviceLinkPlaceholder}>
                        <Txt
                            variant="small"
                            color={colors.muted}
                        >
                            تفاصيل الحجز
                        </Txt>
                    </View>
                )}

                <Txt
                    variant="labelSm"
                    color={colors.muted}
                >
                    عرض التفاصيل
                </Txt>
            </View>
        </Pressable>
    );
}

function WrenchMini() {
    return (
        <View style={styles.wrenchMini}>
            <View style={styles.wrenchMiniBody} />
        </View>
    );
}

function EmptyState({
    filter,
    onExplore,
}: {
    filter: BookingFilter;
    onExplore: () => void;
}) {
    const isUpcoming =
        filter === 'upcoming';

    return (
        <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
                {isUpcoming ? (
                    <Search
                        size={25}
                        color={colors.primary}
                    />
                ) : (
                    <CalendarClock
                        size={25}
                        color={colors.primary}
                    />
                )}
            </View>

            <Txt
                variant="h3"
                align="center"
                style={styles.emptyTitle}
            >
                {isUpcoming
                    ? 'لا توجد حجوزات قادمة'
                    : `لا توجد حجوزات ${getFilterLabel(
                        filter,
                    )}`}
            </Txt>

            <Txt
                variant="body"
                color={colors.muted}
                align="center"
                style={styles.emptyDescription}
            >
                {isUpcoming
                    ? 'اكتشف مقدم الخدمة المناسب واحجز موعدك، وسيظهر هنا مباشرة.'
                    : 'ستظهر الحجوزات هنا بعد تغيّر حالتها.'}
            </Txt>

            {isUpcoming ? (
                <Pressable
                    onPress={onExplore}
                    style={({ pressed }) => [
                        styles.emptyButton,
                        pressed &&
                        styles.buttonPressed,
                    ]}
                >
                    <Search
                        size={17}
                        color={colors.white}
                    />

                    <Txt
                        variant="label"
                        color={colors.white}
                        weight="800"
                        style={{
                            marginHorizontal: 8,
                        }}
                    >
                        استكشاف الخدمات
                    </Txt>

                    <ChevronLeft
                        size={17}
                        color={colors.white}
                    />
                </Pressable>
            ) : null}
        </View>
    );
}

function DetailRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
                {icon}
            </View>

            <View style={styles.detailBody}>
                <Txt
                    variant="small"
                    color={colors.muted}
                >
                    {label}
                </Txt>

                <Txt
                    variant="label"
                    weight="700"
                    numberOfLines={2}
                    style={styles.detailValue}
                >
                    {value}
                </Txt>
            </View>
        </View>
    );
}

export default function BookingsScreen() {
    const router = useRouter();

    const [bookings, setBookings] =
        useState<ServiceBooking[]>(
            getBookings(),
        );

    const [services, setServices] =
        useState<MyService[]>(
            getMyServices(),
        );

    const [
        filter,
        setFilter,
    ] = useState<BookingFilter>(
        'upcoming',
    );

    const [
        selectedBooking,
        setSelectedBooking,
    ] = useState<
        ServiceBooking | undefined
    >();

    useEffect(() => {
        const syncBookings = () => {
            setBookings(getBookings());
        };

        const syncServices = () => {
            setServices(getMyServices());
        };

        const unsubscribeBookings =
            subscribeBookings(
                syncBookings,
            );

        const unsubscribeServices =
            subscribeBookings(
                syncServices,
            );

        return () => {
            unsubscribeBookings();
            unsubscribeServices();
        };
    }, []);

    const linkedServices =
        useMemo(
            () =>
                new Map(
                    services
                        .filter(
                            (service) =>
                                Boolean(
                                    service.sourceBookingId,
                                ),
                        )
                        .map((service) => [
                            service.sourceBookingId!,
                            service,
                        ]),
                ),
            [services],
        );

    const counts = useMemo(() => {
        const completed =
            bookings.filter(
                (booking) =>
                    booking.status ===
                    'completed',
            ).length;

        const cancelled =
            bookings.filter(
                (booking) =>
                    booking.status ===
                    'cancelled',
            ).length;

        const upcoming =
            bookings.filter(
                (booking) =>
                    booking.status ===
                    'confirmed' &&
                    isUpcomingDate(booking),
            ).length;

        return {
            upcoming,
            completed,
            cancelled,
        };
    }, [bookings]);

    const filteredBookings =
        useMemo(() => {
            const filtered =
                bookings.filter(
                    (booking) => {
                        if (
                            filter ===
                            'upcoming'
                        ) {
                            return (
                                booking.status ===
                                'confirmed' &&
                                isUpcomingDate(
                                    booking,
                                )
                            );
                        }

                        return (
                            booking.status ===
                            filter
                        );
                    },
                );

            if (
                filter ===
                'upcoming'
            ) {
                return filtered.sort(
                    (a, b) =>
                        getBookingTimestamp(
                            a,
                        ) -
                        getBookingTimestamp(
                            b,
                        ),
                );
            }

            return filtered.sort(
                (a, b) =>
                    getBookingTimestamp(
                        b,
                    ) -
                    getBookingTimestamp(
                        a,
                    ),
            );
        }, [bookings, filter]);

    const featuredBooking =
        filter === 'upcoming'
            ? filteredBookings[0]
            : undefined;

    const remainingBookings =
        featuredBooking
            ? filteredBookings.slice(1)
            : filteredBookings;

    const openBooking =
        (booking: ServiceBooking) => {
            setSelectedBooking(
                booking,
            );
        };

    const closeBooking =
        () => {
            setSelectedBooking(
                undefined,
            );
        };

    const openLinkedService =
        (booking: ServiceBooking) => {
            const service =
                linkedServices.get(
                    booking.id,
                );

            closeBooking();

            if (service) {
                router.push({
                    pathname:
                        '/services/[id]',
                    params: {
                        id: service.id,
                    },
                });

                return;
            }

            router.push('/services');
        };

    const cancelSelectedBooking =
        () => {
            if (
                !selectedBooking ||
                selectedBooking.status !==
                'confirmed'
            ) {
                return;
            }

            updateBooking(
                selectedBooking.id,
                {
                    status: 'cancelled',
                },
            );

            closeBooking();
        };

    return (
        <View style={styles.screen}>
            <ScreenHeader title="حجوزاتي" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={
                    styles.content
                }
            >
                <View style={styles.intro}>
                    <View style={styles.introIcon}>
                        <CalendarClock
                            size={23}
                            color={
                                colors.primary
                            }
                        />
                    </View>

                    <View style={styles.introText}>
                        <Txt
                            variant="h2"
                            style={styles.introTitle}
                        >
                            حجوزاتك في مكان واحد
                        </Txt>

                        <Txt
                            variant="body"
                            color={colors.muted}
                            style={styles.introDescription}
                        >
                            تابع مواعيدك القادمة وراجع الحجوزات السابقة بسهولة.
                        </Txt>
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryItem}>
                        <Txt
                            variant="h2"
                            style={styles.summaryValue}
                        >
                            {counts.upcoming}
                        </Txt>

                        <Txt
                            variant="small"
                            color={colors.muted}
                        >
                            قادمة
                        </Txt>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryItem}>
                        <Txt
                            variant="h2"
                            style={styles.summaryValue}
                        >
                            {counts.completed}
                        </Txt>

                        <Txt
                            variant="small"
                            color={colors.muted}
                        >
                            مكتملة
                        </Txt>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryItem}>
                        <Txt
                            variant="h2"
                            style={styles.summaryValue}
                        >
                            {counts.cancelled}
                        </Txt>

                        <Txt
                            variant="small"
                            color={colors.muted}
                        >
                            ملغاة
                        </Txt>
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.filters
                    }
                >
                    <FilterChip
                        label="القادمة"
                        count={counts.upcoming}
                        selected={
                            filter ===
                            'upcoming'
                        }
                        onPress={() =>
                            setFilter(
                                'upcoming',
                            )
                        }
                    />

                    <FilterChip
                        label="المكتملة"
                        count={counts.completed}
                        selected={
                            filter ===
                            'completed'
                        }
                        onPress={() =>
                            setFilter(
                                'completed',
                            )
                        }
                    />

                    <FilterChip
                        label="الملغاة"
                        count={counts.cancelled}
                        selected={
                            filter ===
                            'cancelled'
                        }
                        onPress={() =>
                            setFilter(
                                'cancelled',
                            )
                        }
                    />
                </ScrollView>

                <View style={styles.sectionHeader}>
                    <View style={styles.sectionText}>
                        <Txt
                            variant="h3"
                            style={
                                styles.sectionTitle
                            }
                        >
                            {getFilterLabel(
                                filter,
                            )}
                        </Txt>

                        <Txt
                            variant="small"
                            color={colors.muted}
                            style={
                                styles.sectionSubtitle
                            }
                        >
                            {filteredBookings.length ===
                                0
                                ? 'لا توجد عناصر للعرض'
                                : `${filteredBookings.length} ${filteredBookings.length ===
                                    1
                                    ? 'حجز'
                                    : 'حجوزات'
                                }`}
                        </Txt>
                    </View>
                </View>

                {filteredBookings.length ===
                    0 ? (
                    <EmptyState
                        filter={filter}
                        onExplore={() =>
                            router.push(
                                '/services/explore',
                            )
                        }
                    />
                ) : (
                    <>
                        {featuredBooking ? (
                            <BookingCard
                                booking={
                                    featuredBooking
                                }
                                linkedService={
                                    linkedServices.get(
                                        featuredBooking.id,
                                    )
                                }
                                featured
                                onPress={() =>
                                    openBooking(
                                        featuredBooking,
                                    )
                                }
                            />
                        ) : null}

                        {remainingBookings.length >
                            0 ? (
                            <View
                                style={
                                    styles.list
                                }
                            >
                                {remainingBookings.map(
                                    (booking) => (
                                        <BookingCard
                                            key={
                                                booking.id
                                            }
                                            booking={
                                                booking
                                            }
                                            linkedService={
                                                linkedServices.get(
                                                    booking.id,
                                                )
                                            }
                                            onPress={() =>
                                                openBooking(
                                                    booking,
                                                )
                                            }
                                        />
                                    ),
                                )}
                            </View>
                        ) : null}
                    </>
                )}

                {filter ===
                    'upcoming' &&
                    filteredBookings.length >
                    0 ? (
                    <Pressable
                        onPress={() =>
                            router.push(
                                '/services/explore',
                            )
                        }
                        style={({ pressed }) => [
                            styles.exploreBar,
                            pressed &&
                            styles.buttonPressed,
                        ]}
                    >
                        <View
                            style={
                                styles.exploreBarIcon
                            }
                        >
                            <Search
                                size={18}
                                color={
                                    colors.primary
                                }
                            />
                        </View>

                        <View
                            style={
                                styles.exploreBarBody
                            }
                        >
                            <Txt
                                variant="label"
                                color={colors.white}
                                weight="800"
                            >
                                تحتاج خدمة أخرى؟
                            </Txt>

                            <Txt
                                variant="small"
                                color="#DCEBE3"
                                style={
                                    styles.exploreBarHint
                                }
                            >
                                استكشف الخدمات واحجز موعدًا جديدًا
                            </Txt>
                        </View>

                        <ChevronLeft
                            size={18}
                            color={colors.white}
                        />
                    </Pressable>
                ) : null}

                <Txt
                    variant="small"
                    color={colors.muted}
                    align="center"
                    style={
                        styles.bottomNote
                    }
                >
                    الحجوزات في هذه النسخة التجريبية محفوظة محليًا.
                </Txt>
            </ScrollView>

            <Modal
                visible={Boolean(
                    selectedBooking,
                )}
                transparent
                animationType="slide"
                onRequestClose={
                    closeBooking
                }
            >
                {selectedBooking ? (
                    <View
                        style={
                            styles.modalBackdrop
                        }
                    >
                        <View
                            style={
                                styles.modalCard
                            }
                        >
                            <View
                                style={
                                    styles.modalHeader
                                }
                            >
                                <View
                                    style={
                                        styles.modalHeaderText
                                    }
                                >
                                    <Txt
                                        variant="h3"
                                        style={
                                            styles.modalTitle
                                        }
                                    >
                                        تفاصيل الحجز
                                    </Txt>

                                    <Txt
                                        variant="small"
                                        color={colors.muted}
                                        style={
                                            styles.modalSubtitle
                                        }
                                    >
                                        {statusLabel(
                                            selectedBooking.status,
                                        )}
                                    </Txt>
                                </View>

                                <Pressable
                                    onPress={
                                        closeBooking
                                    }
                                    style={({ pressed }) => [
                                        styles.closeButton,
                                        pressed &&
                                        styles.closePressed,
                                    ]}
                                    accessibilityLabel="إغلاق"
                                >
                                    <X
                                        size={18}
                                        color={
                                            colors.text
                                        }
                                    />
                                </Pressable>
                            </View>

                            <View
                                style={
                                    styles.modalServiceHeader
                                }
                            >
                                <View
                                    style={
                                        styles.modalServiceIcon
                                    }
                                >
                                    <CalendarClock
                                        size={21}
                                        color={
                                            colors.primary
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.modalServiceText
                                    }
                                >
                                    <Txt
                                        variant="h3"
                                        numberOfLines={2}
                                    >
                                        {
                                            selectedBooking.serviceTitle
                                        }
                                    </Txt>

                                    <Txt
                                        variant="small"
                                        color={colors.muted}
                                        style={
                                            styles.modalProvider
                                        }
                                    >
                                        {
                                            getCraftsman(
                                                selectedBooking.craftsmanId,
                                            ).name
                                        }
                                    </Txt>
                                </View>
                            </View>

                            <View
                                style={
                                    styles.detailsCard
                                }
                            >
                                <DetailRow
                                    icon={
                                        <CalendarClock
                                            size={17}
                                            color={
                                                colors.primary
                                            }
                                        />
                                    }
                                    label="التاريخ"
                                    value={formatDate(
                                        selectedBooking.date,
                                    )}
                                />

                                <View
                                    style={
                                        styles.detailDivider
                                    }
                                />

                                <DetailRow
                                    icon={
                                        <Clock3
                                            size={17}
                                            color={
                                                colors.primary
                                            }
                                        />
                                    }
                                    label="الوقت"
                                    value={
                                        selectedBooking.time
                                    }
                                />

                                <View
                                    style={
                                        styles.detailDivider
                                    }
                                />

                                <DetailRow
                                    icon={
                                        <MapPin
                                            size={17}
                                            color={
                                                colors.primary
                                            }
                                        />
                                    }
                                    label="الموقع"
                                    value={
                                        getCraftsman(
                                            selectedBooking.craftsmanId,
                                        ).area
                                    }
                                />
                            </View>

                            {selectedBooking.notes ? (
                                <View
                                    style={
                                        styles.noteCard
                                    }
                                >
                                    <NotebookPen
                                        size={17}
                                        color={
                                            colors.primary
                                        }
                                    />

                                    <Txt
                                        variant="small"
                                        color={colors.text}
                                        style={
                                            styles.noteText
                                        }
                                    >
                                        {
                                            selectedBooking.notes
                                        }
                                    </Txt>
                                </View>
                            ) : null}

                            {linkedServices.has(
                                selectedBooking.id,
                            ) ? (
                                <Pressable
                                    onPress={() =>
                                        openLinkedService(
                                            selectedBooking,
                                        )
                                    }
                                    style={({ pressed }) => [
                                        styles.serviceButton,
                                        pressed &&
                                        styles.secondaryPressed,
                                    ]}
                                >
                                    <View
                                        style={
                                            styles.serviceButtonIcon
                                        }
                                    >
                                        <WrenchMini />
                                    </View>

                                    <View
                                        style={
                                            styles.serviceButtonBody
                                        }
                                    >
                                        <Txt
                                            variant="label"
                                            color={colors.text}
                                            weight="700"
                                        >
                                            فتح الخدمة في خدماتي
                                        </Txt>

                                        <Txt
                                            variant="small"
                                            color={colors.muted}
                                            style={
                                                styles.serviceButtonHint
                                            }
                                        >
                                            تابع التذكيرات والتفاصيل المرتبطة بالحجز.
                                        </Txt>
                                    </View>

                                    <ChevronLeft
                                        size={18}
                                        color={
                                            colors.muted
                                        }
                                    />
                                </Pressable>
                            ) : null}

                            {selectedBooking.status ===
                                'confirmed' ? (
                                <Pressable
                                    onPress={
                                        cancelSelectedBooking
                                    }
                                    style={({ pressed }) => [
                                        styles.cancelButton,
                                        pressed &&
                                        styles.cancelPressed,
                                    ]}
                                >
                                    <Txt
                                        variant="labelSm"
                                        color={
                                            colors.error
                                        }
                                        weight="700"
                                    >
                                        إلغاء الحجز
                                    </Txt>
                                </Pressable>
                            ) : null}

                            <Pressable
                                onPress={
                                    closeBooking
                                }
                                style={({ pressed }) => [
                                    styles.doneButton,
                                    pressed &&
                                    styles.buttonPressed,
                                ]}
                            >
                                <Txt
                                    variant="label"
                                    color={colors.white}
                                    weight="800"
                                >
                                    إغلاق
                                </Txt>
                            </Pressable>
                        </View>
                    </View>
                ) : null}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor:
            colors.canvas,
    },

    content: {
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 38,
    },

    intro: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },

    introIcon: {
        width: 49,
        height: 49,
        borderRadius: 16,
        backgroundColor:
            colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },

    introText: {
        flex: 1,
        marginHorizontal: 11,
    },

    introTitle: {
        fontSize: 20,
    },

    introDescription: {
        marginTop: 3,
        lineHeight: 20,
    },

    summaryCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 15,
        paddingVertical: 11,
        paddingHorizontal: 7,
        backgroundColor:
            colors.white,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor:
            colors.border,
    },

    summaryItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryValue: {
        fontSize: 18,
        lineHeight: 24,
    },

    summaryDivider: {
        width: 1,
        height: 30,
        backgroundColor:
            colors.border,
    },

    filters: {
        flexDirection:
            'row-reverse',
        gap: 8,
        paddingVertical: 14,
    },

    filterChip: {
        minHeight: 42,
        paddingHorizontal: 11,
        borderRadius:
            radius.full,
        backgroundColor:
            colors.white,
        borderWidth: 1,
        borderColor:
            colors.border,
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        gap: 7,
    },

    filterChipSelected: {
        backgroundColor:
            colors.primary,
        borderColor:
            colors.primary,
    },

    filterCount: {
        minWidth: 23,
        height: 23,
        paddingHorizontal: 5,
        borderRadius: 12,
        backgroundColor:
            colors.canvas,
        alignItems: 'center',
        justifyContent: 'center',
    },

    filterCountSelected: {
        backgroundColor:
            colors.white,
    },

    filterPressed: {
        opacity: 0.82,
    },

    sectionHeader: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        marginBottom: 10,
    },

    sectionText: {
        flex: 1,
    },

    sectionTitle: {
        fontSize: 18,
    },

    sectionSubtitle: {
        marginTop: 2,
    },

    bookingCard: {
        backgroundColor:
            colors.white,
        borderRadius:
            radius.xl,
        borderWidth: 1,
        borderColor:
            colors.border,
        padding: 13,
        marginBottom: 10,
        overflow: 'hidden',
    },

    bookingCardFeatured: {
        borderColor:
            '#CFE2D7',
        paddingTop: 14,
    },

    featuredAccent: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 4,
        backgroundColor:
            colors.primary,
    },

    bookingHeader: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
    },

    bookingIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor:
            colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },

    bookingIdentity: {
        flex: 1,
        marginHorizontal: 9,
    },

    bookingTitleRow: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
    },

    bookingTitle: {
        flex: 1,
        fontSize: 15,
    },

    bookingProvider: {
        marginTop: 3,
    },

    statusPill: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius:
            radius.full,
        marginRight: 7,
    },

    featuredDate: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        marginTop: 12,
        padding: 10,
        backgroundColor:
            colors.tintStrong,
        borderRadius:
            radius.lg,
    },

    featuredDateIcon: {
        width: 39,
        height: 39,
        borderRadius: 12,
        backgroundColor:
            colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    featuredDateBody: {
        flex: 1,
        marginHorizontal: 9,
    },

    featuredDateTitle: {
        marginTop: 1,
        fontSize: 15,
    },

    confirmedBadge: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius:
            radius.full,
        backgroundColor:
            colors.white,
    },

    featuredMeta: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        justifyContent:
            'space-between',
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor:
            colors.border,
    },

    metaRow: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 11,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor:
            colors.border,
        gap: 7,
    },

    metaItem: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        minWidth: 0,
    },

    metaText: {
        marginRight: 4,
    },

    metaDivider: {
        width: 1,
        height: 15,
        backgroundColor:
            colors.border,
        marginHorizontal: 2,
    },

    bookingFooter: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        justifyContent:
            'space-between',
        marginTop: 10,
        paddingTop: 9,
        borderTopWidth: 1,
        borderTopColor:
            colors.border,
    },

    serviceLink: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
    },

    serviceLinkPlaceholder: {
        flex: 1,
    },

    wrenchMini: {
        width: 16,
        height: 16,
        borderRadius: 5,
        backgroundColor:
            colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },

    wrenchMiniBody: {
        width: 7,
        height: 7,
        borderRadius: 2,
        borderWidth: 1.5,
        borderColor:
            colors.primary,
        transform: [
            {
                rotate: '45deg',
            },
        ],
    },

    list: {
        marginTop: 2,
    },

    cardPressed: {
        opacity: 0.83,
        transform: [
            {
                scale: 0.995,
            },
        ],
    },

    emptyCard: {
        backgroundColor:
            colors.white,
        borderRadius:
            radius.xl,
        borderWidth: 1,
        borderColor:
            colors.border,
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 27,
    },

    emptyIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor:
            colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyTitle: {
        marginTop: 12,
        fontSize: 17,
    },

    emptyDescription: {
        marginTop: 6,
        lineHeight: 21,
    },

    emptyButton: {
        minHeight: 46,
        marginTop: 16,
        paddingHorizontal: 15,
        borderRadius:
            radius.md,
        backgroundColor:
            colors.primary,
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
    },

    exploreBar: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        minHeight: 62,
        marginTop: 4,
        paddingHorizontal: 12,
        borderRadius:
            radius.xl,
        backgroundColor:
            colors.primary,
    },

    exploreBarIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor:
            colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    exploreBarBody: {
        flex: 1,
        marginHorizontal: 9,
    },

    exploreBarHint: {
        marginTop: 1,
        lineHeight: 17,
    },

    bottomNote: {
        marginTop: 13,
        lineHeight: 17,
    },

    buttonPressed: {
        opacity: 0.86,
    },

    modalBackdrop: {
        flex: 1,
        backgroundColor:
            'rgba(15,23,42,0.40)',
        justifyContent:
            'flex-end',
    },

    modalCard: {
        backgroundColor:
            colors.white,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingHorizontal: 17,
        paddingTop: 17,
        paddingBottom: 28,
    },

    modalHeader: {
        flexDirection:
            'row-reverse',
        alignItems: 'flex-start',
        justifyContent:
            'space-between',
    },

    modalHeaderText: {
        flex: 1,
    },

    modalTitle: {
        fontSize: 19,
    },

    modalSubtitle: {
        marginTop: 2,
    },

    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor:
            colors.canvas,
        alignItems: 'center',
        justifyContent: 'center',
    },

    closePressed: {
        opacity: 0.65,
    },

    modalServiceHeader: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        marginTop: 16,
        padding: 11,
        backgroundColor:
            colors.tintStrong,
        borderRadius:
            radius.lg,
    },

    modalServiceIcon: {
        width: 43,
        height: 43,
        borderRadius: 13,
        backgroundColor:
            colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    modalServiceText: {
        flex: 1,
        marginRight: 9,
    },

    modalProvider: {
        marginTop: 2,
    },

    detailsCard: {
        marginTop: 12,
        backgroundColor:
            colors.canvas,
        borderRadius:
            radius.lg,
        paddingHorizontal: 11,
    },

    detailRow: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        minHeight: 61,
    },

    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor:
            colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    detailBody: {
        flex: 1,
        marginRight: 9,
    },

    detailValue: {
        marginTop: 2,
    },

    detailDivider: {
        height: 1,
        backgroundColor:
            colors.border,
    },

    noteCard: {
        flexDirection:
            'row-reverse',
        alignItems: 'flex-start',
        marginTop: 10,
        padding: 11,
        backgroundColor:
            '#FAFBF9',
        borderRadius:
            radius.lg,
        borderWidth: 1,
        borderColor:
            colors.border,
    },

    noteText: {
        flex: 1,
        marginRight: 8,
        lineHeight: 19,
    },

    serviceButton: {
        flexDirection:
            'row-reverse',
        alignItems: 'center',
        marginTop: 10,
        padding: 11,
        backgroundColor:
            colors.white,
        borderRadius:
            radius.lg,
        borderWidth: 1,
        borderColor:
            colors.border,
    },

    serviceButtonIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor:
            colors.tintStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },

    serviceButtonBody: {
        flex: 1,
        marginHorizontal: 9,
    },

    serviceButtonHint: {
        marginTop: 2,
        lineHeight: 17,
    },

    secondaryPressed: {
        opacity: 0.72,
    },

    cancelButton: {
        minHeight: 44,
        marginTop: 11,
        borderRadius:
            radius.md,
        backgroundColor:
            '#FFF7F7',
        borderWidth: 1,
        borderColor:
            '#F2D7D7',
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelPressed: {
        backgroundColor:
            '#FFF0F0',
    },

    doneButton: {
        minHeight: 51,
        marginTop: 9,
        borderRadius:
            radius.lg,
        backgroundColor:
            colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
});