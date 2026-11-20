import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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
  WebView,
  WebViewMessageEvent,
} from 'react-native-webview';

import * as Location from 'expo-location';

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Crosshair,
  MapPinned,
  Navigation,
  Star,
  X,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import Txt from '../../components/Txt';

import {
  categories,
  craftsmen as fallbackCraftsmen,
  Craftsman,
} from '../../data/mock';
import { getCraftsmen } from '../../services/craftsmenService';

import {
  colors,
  radius,
  shadows,
} from '../../styles/theme';

import {
  buildMapHtml,
  type MapCraftsman,
} from './mapHtml';

/* =========================================================
   DEFAULT MAP LOCATION
========================================================= */

const RAMALLAH = {
  latitude: 31.9073,
  longitude: 35.2034,
};

const DEFAULT_ZOOM = 13;

/* =========================================================
   ROUTE PARAMS
========================================================= */

type MapParams = {
  id?: string | string[];
  category?: string | string[];
};

const getParam = (
  value?: string | string[],
): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/* =========================================================
   SCREEN
========================================================= */

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<MapParams>();
  const webViewRef = useRef<WebView>(null);

  const initialId = getParam(params.id);
  const initialCategory = getParam(params.category);

  const [webViewReady, setWebViewReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);

  const [selectedId, setSelectedId] =
    useState<string | null>(initialId ?? null);

  const [activeCategory, setActiveCategory] =
    useState<string | null>(initialCategory ?? null);

  const [searchQuery, setSearchQuery] = useState('');

  const [craftsmenList, setCraftsmenList] =
    useState<Craftsman[]>(fallbackCraftsmen);

  useEffect(() => {
    getCraftsmen().then(setCraftsmenList);
  }, []);

  const [locationPermission, setLocationPermission] =
    useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /* ---------- Selected provider ---------- */
  const selectedCraftsman = useMemo(
    () =>
      craftsmenList.find((item) => item.id === selectedId) ??
      null,
    [selectedId, craftsmenList],
  );

  /* ---------- Visible providers (RN mirror) ---------- */
  const visibleCraftsmen = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return craftsmenList.filter((item) => {
      if (
        activeCategory &&
        !item.categoryIds.includes(activeCategory)
      ) {
        return false;
      }
      if (q.length > 0) {
        return item.name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, searchQuery, craftsmenList]);

  /* ---------- Map HTML ---------- */
  const mapHtml = useMemo(
    () =>
      buildMapHtml({
        providers: craftsmenList.map<MapCraftsman>((c) => ({
          id: c.id,
          name: c.name,
          latitude: c.latitude,
          longitude: c.longitude,
          isOpen: c.isOpen,
          categoryIds: c.categoryIds,
        })),
        categories: categories.map((c) => ({
          id: c.id,
          label: c.label,
        })),
        defaultCenter: RAMALLAH,
        defaultZoom: DEFAULT_ZOOM,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ---------- Send payload to WebView ---------- */
  const sendToMap = (
    payload: Record<string, unknown>,
    force = false,
  ) => {
    if (!webViewRef.current) return;
    if (!webViewReady && !force) return;

    const payloadJson = JSON.stringify(payload);
    webViewRef.current.injectJavaScript(`
      if (typeof handleNativeMessage === 'function') {
        handleNativeMessage(${JSON.stringify(payloadJson)});
      }
      true;
    `);
  };

  /* ---------- Sync filters to map ---------- */
  useEffect(() => {
    if (!mapReady) return;
    sendToMap({
      type: 'applyFilters',
      categoryId: activeCategory,
      query: searchQuery,
    });
  }, [activeCategory, searchQuery, mapReady]);

  /* ---------- Sync user location to map ---------- */
  useEffect(() => {
    if (!mapReady || !userLocation) return;
    sendToMap({
      type: 'setUserLocation',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    });
  }, [mapReady, userLocation]);

  /* ---------- Initial focus ---------- */
  useEffect(() => {
    if (!mapReady) return;
    if (initialId) {
      sendToMap({
        type: 'focusProvider',
        id: initialId,
      });
    }
  }, [mapReady, initialId]);

  /* ---------- Request location on mount ---------- */
  useEffect(() => {
    let mounted = true;

    const requestLocation = async () => {
      try {
        const permission =
          await Location.requestForegroundPermissionsAsync();
        if (!mounted) return;

        const granted = permission.status === 'granted';
        setLocationPermission(granted);
        if (!granted) return;

        const current =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        if (!mounted) return;

        setUserLocation({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
      } catch {
        if (mounted) setLocationPermission(false);
      }
    };

    void requestLocation();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------- WebView callbacks ---------- */
  const handleWebViewLoad = () => {
    setWebViewReady(true);
  };

  const handleMapMessage = (
    event: WebViewMessageEvent,
  ) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'mapReady') {
        setMapReady(true);
        setTileError(false);
        return;
      }
      if (data.type === 'tileError') {
        setTileError(true);
        return;
      }
      if (data.type === 'providerSelected') {
        setSelectedId(data.id);
        return;
      }
      if (
        data.type === 'deselected' ||
        data.type === 'reset'
      ) {
        setSelectedId(null);
      }
    } catch {
      // ignore
    }
  };

  /* ---------- Filters ---------- */
  const selectCategory = (
    categoryId: string | null,
  ) => {
    setSelectedId(null);
    setActiveCategory(categoryId);
  };

  const resetMap = () => {
    setSelectedId(null);
    setActiveCategory(null);
    setSearchQuery('');
    sendToMap({ type: 'resetView' });
  };

  /* ---------- Center on user ---------- */
  const centerOnUser = async () => {
    try {
      if (!locationPermission) {
        const permission =
          await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          Alert.alert(
            'الوصول إلى الموقع',
            'اسمح لمهنتي بالوصول إلى موقعك حتى نحدد الخدمات القريبة منك.',
          );
          return;
        }
        setLocationPermission(true);
      }

      const current =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const location = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setUserLocation(location);
      setSelectedId(null);

      sendToMap({
        type: 'centerOnUser',
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch {
      Alert.alert(
        'تعذر تحديد الموقع',
        'حاول مرة أخرى.',
      );
    }
  };

  /* ---------- Directions ---------- */
  const openDirections = (craftsman: Craftsman) => {
    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${craftsman.latitude},${craftsman.longitude}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        'تعذر فتح الاتجاهات',
        'تأكد من وجود تطبيق خرائط على جهازك.',
      );
    });
  };

  /* ---------- Profile ---------- */
  const openProfile = (craftsman: Craftsman) => {
    router.push({
      pathname: '/profile/[id]',
      params: { id: craftsman.id },
    });
  };

  /* ---------- Category count ---------- */
  const getCategoryCount = (categoryId: string) => {
    return craftsmenList.filter((item) =>
      item.categoryIds.includes(categoryId),
    ).length;
  };

  /* =======================================================
     WEB FALLBACK
  ======================================================= */

  if (Platform.OS === 'web') {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="الخريطة" />

        <View style={styles.webFallback}>
          <View style={styles.webIcon}>
            <MapPinned size={32} color={colors.primary} />
          </View>

          <Txt
            variant="h3"
            align="center"
            style={styles.webTitle}
          >
            الخريطة متاحة على الهاتف
          </Txt>

          <Txt
            variant="body"
            color={colors.muted}
            align="center"
            style={styles.webDescription}
          >
            افتح مهنتي على Android لمشاهدة الخريطة
            التفاعلية والخدمات القريبة منك.
          </Txt>
        </View>
      </View>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View style={styles.screen}>
      <ScreenHeader title="الخريطة" />

      <View style={styles.mapArea}>
        {/* =============================================
            MAP
        ============================================= */}
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          setBuiltInZoomControls={false}
          setDisplayZoomControls={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          onLoadEnd={handleWebViewLoad}
          onMessage={handleMapMessage}
          style={styles.map}
        />

        {/* =============================================
            MAP LOADING
        ============================================= */}
        {!mapReady && (
          <View
            style={styles.loadingOverlay}
            pointerEvents="none"
          >
            <View style={styles.loadingCard}>
              <View style={styles.loadingIcon}>
                <MapPinned
                  size={20}
                  color={colors.primary}
                />
              </View>

              <View style={styles.loadingTextWrap}>
                <Txt variant="label" weight="700">
                  تجهيز الخريطة
                </Txt>
                <Txt
                  variant="small"
                  color={colors.muted}
                >
                  نبحث عن الخدمات حولك
                </Txt>
              </View>

              <ActivityIndicator
                size="small"
                color={colors.primary}
              />
            </View>
          </View>
        )}

        {/* =============================================
            TILE ERROR BANNER
        ============================================= */}
        {tileError && (
          <View
            style={[styles.tileErrorBanner, shadows.level2]}
            pointerEvents="none"
          >
            <Txt variant="small" color={colors.muted}>
              تعذّر تحميل الخريطة. تحقق من اتصالك.
            </Txt>
          </View>
        )}

        {/* =============================================
            TOP OVERLAY (search + filters)
        ============================================= */}
        <View
          style={styles.topOverlay}
          pointerEvents="box-none"
        >
          {/* Search */}
          <View style={[styles.searchBox, shadows.level2]}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث عن مقدم خدمة بالاسم..."
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              textAlign="right"
              returnKeyType="search"
              autoCorrect={false}
            />

            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                accessibilityRole="button"
                accessibilityLabel="مسح البحث"
                hitSlop={8}
                style={styles.searchClear}
              >
                <X size={14} color={colors.muted} />
              </Pressable>
            )}
          </View>

          {/* Top row: location + results */}
          <View style={styles.topRow}>
            <View
              style={[
                styles.locationBadge,
                shadows.level2,
              ]}
            >
              <View
                style={[
                  styles.locationIndicator,
                  userLocation &&
                    styles.locationIndicatorActive,
                ]}
              />

              <View style={styles.locationContent}>
                <Txt
                  variant="labelSm"
                  weight="700"
                  color={colors.primary}
                  numberOfLines={1}
                >
                  {userLocation
                    ? 'موقعك الحالي'
                    : 'رام الله والبيرة'}
                </Txt>

                <Txt
                  variant="small"
                  color={colors.muted}
                  numberOfLines={1}
                >
                  {activeCategory
                    ? 'عرض نتائج التصنيف المختار'
                    : 'الخدمات حولك'}
                </Txt>
              </View>
            </View>

            <View
              style={[styles.resultPill, shadows.level2]}
            >
              <View style={styles.resultDot} />
              <Txt
                variant="labelSm"
                weight="700"
                color={colors.text}
              >
                {visibleCraftsmen.length}
              </Txt>
              <Txt
                variant="small"
                color={colors.muted}
                style={styles.resultLabel}
              >
                مزود خدمة
              </Txt>
            </View>
          </View>

          {/* Category chips */}
          <View style={styles.categoryWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContent}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.categoryChip,
                  !activeCategory && styles.categoryChipActive,
                  pressed && styles.categoryChipPressed,
                ]}
                onPress={resetMap}
                accessibilityRole="button"
                accessibilityLabel="عرض جميع الخدمات"
              >
                <Txt
                  variant="labelSm"
                  weight="700"
                  color={
                    !activeCategory
                      ? colors.white
                      : colors.text
                  }
                >
                  الكل
                </Txt>

                <View
                  style={[
                    styles.categoryCount,
                    !activeCategory &&
                      styles.categoryCountActive,
                  ]}
                >
                  <Txt
                    variant="labelSm"
                    weight="700"
                    color={
                      !activeCategory
                        ? colors.primary
                        : colors.muted
                    }
                  >
                    {craftsmenList.length}
                  </Txt>
                </View>
              </Pressable>

              {categories.map((category) => {
                const count = getCategoryCount(
                  category.id,
                );
                if (count === 0) return null;

                const active =
                  activeCategory === category.id;

                return (
                  <Pressable
                    key={category.id}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      active &&
                        styles.categoryChipActive,
                      pressed &&
                        styles.categoryChipPressed,
                    ]}
                    onPress={() =>
                      selectCategory(category.id)
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`تصفية ${category.label}`}
                  >
                    <Txt
                      variant="labelSm"
                      weight="700"
                      color={
                        active
                          ? colors.white
                          : colors.text
                      }
                    >
                      {category.label}
                    </Txt>

                    <View
                      style={[
                        styles.categoryCount,
                        active &&
                          styles.categoryCountActive,
                      ]}
                    >
                      <Txt
                        variant="labelSm"
                        weight="700"
                        color={
                          active
                            ? colors.primary
                            : colors.muted
                        }
                      >
                        {count}
                      </Txt>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* =============================================
            MAP CONTROLS
        ============================================= */}
        <View style={[styles.mapControls, shadows.level2]}>
          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              pressed && styles.controlButtonPressed,
            ]}
            onPress={centerOnUser}
            accessibilityRole="button"
            accessibilityLabel="تحديد موقعي"
          >
            <Crosshair
              size={21}
              color={colors.primary}
            />
          </Pressable>

          <View style={styles.controlDivider} />

          <Pressable
            style={({ pressed }) => [
              styles.controlButton,
              pressed && styles.controlButtonPressed,
            ]}
            onPress={resetMap}
            accessibilityRole="button"
            accessibilityLabel="إظهار جميع مقدمي الخدمة"
          >
            <MapPinned
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {/* =============================================
            MAP HINT
        ============================================= */}
        {!selectedCraftsman && (
          <View
            style={[styles.infoPill, shadows.level1]}
            pointerEvents="none"
          >
            <View style={styles.infoIcon}>
              <Navigation
                size={14}
                color={colors.primary}
              />
            </View>

            <Txt
              variant="labelSm"
              weight="600"
              color={colors.muted}
              style={styles.infoText}
            >
              اضغط على أي نقطة لمعرفة التفاصيل
            </Txt>
          </View>
        )}

        {/* =============================================
            SELECTED PROVIDER
        ============================================= */}
        {selectedCraftsman && (
          <View style={[styles.selectedCard, shadows.level3]}>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={() => {
                setSelectedId(null);
                sendToMap({ type: 'resetView' });
              }}
              accessibilityRole="button"
              accessibilityLabel="إغلاق معلومات مقدم الخدمة"
            >
              <X size={17} color={colors.muted} />
            </Pressable>

            <View style={styles.selectedTop}>
              <Image
                source={{ uri: selectedCraftsman.photo }}
                style={styles.avatar}
              />

              <View style={styles.selectedInfo}>
                <View style={styles.nameRow}>
                  <Txt
                    variant="h4"
                    style={styles.name}
                    numberOfLines={1}
                  >
                    {selectedCraftsman.name}
                  </Txt>

                  {selectedCraftsman.verified && (
                    <CheckCircle2
                      size={16}
                      color={colors.success}
                    />
                  )}
                </View>

                <Txt
                  variant="small"
                  color={colors.muted}
                  numberOfLines={1}
                  style={styles.specialty}
                >
                  {selectedCraftsman.specialty}
                </Txt>

                <View style={styles.ratingRow}>
                  <Star
                    size={14}
                    color={colors.amber}
                    fill={colors.amber}
                  />

                  <Txt
                    variant="labelSm"
                    weight="700"
                    style={styles.ratingValue}
                  >
                    {selectedCraftsman.rating.toFixed(1)}
                  </Txt>

                  <Txt
                    variant="small"
                    color={colors.muted}
                  >
                    ({selectedCraftsman.reviewCount}{' '}
                    تقييم)
                  </Txt>

                  <View style={styles.cardDivider} />

                  <Txt
                    variant="small"
                    color={colors.muted}
                  >
                    {selectedCraftsman.distanceKm.toFixed(1)} كم
                  </Txt>
                </View>
              </View>
            </View>

            <View style={styles.selectedMetaRow}>
              <View style={styles.metaItem}>
                <View
                  style={[
                    styles.statusIndicator,
                    selectedCraftsman.isOpen &&
                      styles.statusIndicatorOpen,
                  ]}
                />

                <Txt
                  variant="labelSm"
                  weight="600"
                  color={
                    selectedCraftsman.isOpen
                      ? colors.success
                      : colors.muted
                  }
                >
                  {selectedCraftsman.isOpen
                    ? 'مفتوح الآن'
                    : 'مغلق حالياً'}
                </Txt>
              </View>

              <View style={styles.metaDivider} />

              <Clock3 size={14} color={colors.muted} />

              <Txt
                variant="small"
                color={colors.muted}
                style={styles.metaText}
                numberOfLines={1}
              >
                {selectedCraftsman.workingHours}
              </Txt>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryAction,
                  pressed && styles.primaryActionPressed,
                ]}
                onPress={() => openProfile(selectedCraftsman)}
                accessibilityRole="button"
                accessibilityLabel="عرض الملف المهني"
              >
                <Txt
                  variant="label"
                  weight="700"
                  color={colors.white}
                >
                  عرض الملف
                </Txt>

                <ArrowUpRight
                  size={17}
                  color={colors.white}
                />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryAction,
                  pressed &&
                    styles.secondaryActionPressed,
                ]}
                onPress={() =>
                  openDirections(selectedCraftsman)
                }
                accessibilityRole="button"
                accessibilityLabel="فتح الاتجاهات"
              >
                <Navigation
                  size={16}
                  color={colors.primary}
                />

                <Txt
                  variant="label"
                  weight="700"
                  color={colors.primary}
                >
                  الاتجاهات
                </Txt>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  mapArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },

  map: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  /* ===============================================
     LOADING
  =============================================== */

  loadingOverlay: {
    ...(StyleSheet.absoluteFill as any),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
    zIndex: 30,
  },

  loadingCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 30,
    ...shadows.level2,
  },

  loadingIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingTextWrap: {
    flex: 1,
    marginHorizontal: 10,
  },

  /* ===============================================
     TILE ERROR
  =============================================== */

  tileErrorBanner: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: '#F4E3B5',
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 40,
  },

  /* ===============================================
     TOP
  =============================================== */

  topOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
  },

  searchBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 2,
    marginBottom: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 6,
    textAlign: 'right',
  },

  searchClear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.canvas,
    marginLeft: 6,
  },

  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  locationBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    maxWidth: '78%',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  locationIndicator: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginLeft: 9,
  },

  locationIndicatorActive: {
    backgroundColor: colors.success,
  },

  locationContent: {
    flexShrink: 1,
  },

  resultPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  resultDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginLeft: 7,
  },

  resultLabel: {
    marginRight: 3,
  },

  /* ===============================================
     FILTERS
  =============================================== */

  categoryWrapper: {
    marginTop: 10,
  },

  categoryContent: {
    flexDirection: 'row-reverse',
    gap: 7,
    paddingHorizontal: 1,
  },

  categoryChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryChipPressed: {
    opacity: 0.82,
  },

  categoryCount: {
    minWidth: 20,
    height: 20,
    marginRight: 7,
    borderRadius: 10,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryCountActive: {
    backgroundColor: colors.white,
  },

  /* ===============================================
     MAP CONTROLS
  =============================================== */

  mapControls: {
    position: 'absolute',
    right: 12,
    top: 180,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },

  controlButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlButtonPressed: {
    backgroundColor: colors.tint,
  },

  controlDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },

  /* ===============================================
     HINT
  =============================================== */

  infoPill: {
    position: 'absolute',
    bottom: 17,
    alignSelf: 'center',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoText: {
    marginRight: 7,
  },

  /* ===============================================
     SELECTED PROVIDER
  =============================================== */

  selectedCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 14,
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonPressed: {
    backgroundColor: colors.tint,
  },

  selectedTop: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    paddingRight: 34,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.tintStrong,
  },

  selectedInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  nameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingRight: 0,
  },

  name: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 5,
  },

  specialty: {
    marginTop: 2,
  },

  ratingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 6,
  },

  ratingValue: {
    marginHorizontal: 4,
  },

  cardDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.border,
    marginHorizontal: 7,
  },

  selectedMetaRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  metaItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginLeft: 6,
  },

  statusIndicatorOpen: {
    backgroundColor: colors.success,
  },

  metaDivider: {
    width: 1,
    height: 15,
    backgroundColor: colors.border,
    marginHorizontal: 9,
  },

  metaText: {
    marginRight: 5,
    flexShrink: 1,
  },

  actionsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 12,
  },

  primaryAction: {
    flex: 1,
    minHeight: 45,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  primaryActionPressed: {
    opacity: 0.88,
  },

  secondaryAction: {
    flex: 0.78,
    minHeight: 45,
    borderRadius: radius.md,
    backgroundColor: colors.tintStrong,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  secondaryActionPressed: {
    backgroundColor: colors.tint,
  },

  /* ===============================================
     WEB FALLBACK
  =============================================== */

  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: colors.canvas,
  },

  webIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.tintStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  webTitle: {
    marginBottom: 8,
  },

  webDescription: {
    textAlign: 'center',
    lineHeight: 22,
  },
});