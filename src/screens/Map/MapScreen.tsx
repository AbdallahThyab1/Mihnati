import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
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
  BriefcaseBusiness,
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
  craftsmen,
  Craftsman,
} from '../../data/mock';

import {
  colors,
  radius,
  shadows,
} from '../../styles/theme';

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
): string | undefined => {
  return Array.isArray(value)
    ? value[0]
    : value;
};

/* =========================================================
   MAP PROVIDERS
   IMPORTANT:
   These come DIRECTLY from craftsmen.
   No duplicate map data.
========================================================= */

const mapProviders = craftsmen;

/* =========================================================
   HTML MAP
========================================================= */

function buildMapHtml(
  providers: Craftsman[],
): string {
  const providersJson =
    JSON.stringify(providers);

  const defaultCenterJson =
    JSON.stringify([
      RAMALLAH.longitude,
      RAMALLAH.latitude,
    ]);

  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  crossorigin=""
/>

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
  crossorigin=""
></script>

<style>

html,
body,
#map {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;

  background: #F8F9F6;

  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

.leaflet-container {
  background: #F8F9F6;
}

.leaflet-control-attribution {
  font-size: 9px;

  background:
    rgba(255, 255, 255, 0.90) !important;

  border-radius:
    6px 0 0 0;

  padding:
    3px 6px !important;
}

.leaflet-control-attribution a {
  color: #1B4332;
}

.leaflet-control-zoom {
  display: none;
}

/* ===============================================
   PROVIDER MARKER
=============================================== */

.mihnati-marker {
  width: 42px;
  height: 42px;

  border-radius: 50%;

  background: #1B4332;

  border:
    3px solid #FFFFFF;

  display: flex;

  align-items:
    center;

  justify-content:
    center;

  position:
    relative;

  box-shadow:
    0 4px 12px
    rgba(0, 0, 0, 0.22);

  transition:
    all 180ms ease;
}

.mihnati-marker.selected {
  width: 50px;
  height: 50px;

  background: #40916C;

  box-shadow:
    0 8px 20px
    rgba(64, 145, 108, 0.40);

  transform:
    translateY(-3px);
}

.marker-icon {
  width: 20px;
  height: 20px;

  display:
    block;
}

.marker-ring {
  position:
    absolute;

  inset:
    -5px;

  border:
    2px solid
    rgba(64, 145, 108, 0.30);

  border-radius:
    50%;
}

.status-dot {
  position:
    absolute;

  width:
    11px;

  height:
    11px;

  right:
    -2px;

  top:
    -2px;

  border-radius:
    50%;

  background:
    #2D936C;

  border:
    2px solid #FFFFFF;
}

.status-dot.closed {
  background:
    #6B7280;
}

/* ===============================================
   USER LOCATION
=============================================== */

.user-location {
  width:
    18px;

  height:
    18px;

  border-radius:
    50%;

  background:
    #40916C;

  border:
    4px solid #FFFFFF;

  box-shadow:
    0 0 0 8px
      rgba(64, 145, 108, 0.18),

    0 3px 10px
      rgba(0, 0, 0, 0.20);
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const providers =
  ${providersJson};

const defaultCenter =
  ${defaultCenterJson};

let selectedId =
  null;

let userMarker =
  null;

const markerMap =
  {};

/* =====================================================
   SEND MESSAGE TO REACT NATIVE
===================================================== */

function postToReactNative(
  payload
) {

  if (
    window.ReactNativeWebView &&
    window.ReactNativeWebView.postMessage
  ) {

    window.ReactNativeWebView.postMessage(
      JSON.stringify(payload)
    );
  }
}

/* =====================================================
   INITIALIZE MAP
===================================================== */

const map =
  L.map(
    'map',
    {
      zoomControl:
        false,

      attributionControl:
        true,

      minZoom:
        10,

      maxZoom:
        19,

      zoomSnap:
        0.5,

      zoomDelta:
        0.5,

      tap:
        true,

      dragging:
        true,

      scrollWheelZoom:
        false,

      doubleClickZoom:
        true,

      boxZoom:
        true,

      keyboard:
        false
    }
  );

map.setView(
  [
    defaultCenter[1],
    defaultCenter[0]
  ],

  ${DEFAULT_ZOOM}
);

/* =====================================================
   OPENSTREETMAP TILES
===================================================== */

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom:
      19,

    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(map);

/* =====================================================
   CREATE PROVIDER ICON
===================================================== */

function createMarkerIcon(
  provider,
  selected
) {

  const size =
    selected
      ? 50
      : 42;

  const selectedClass =
    selected
      ? 'selected'
      : '';

  const selectedRing =
    selected
      ? '<div class="marker-ring"></div>'
      : '';

  const statusClass =
    provider.isOpen
      ? ''
      : 'closed';

  const html =
    '<div ' +
      'class="mihnati-marker ' +
      selectedClass +
      '" ' +
      'style="width:' +
      size +
      'px;height:' +
      size +
      'px;"' +
    '>' +

      selectedRing +

      '<svg ' +
        'class="marker-icon" ' +
        'width="20" ' +
        'height="20" ' +
        'viewBox="0 0 24 24" ' +
        'fill="none" ' +
        'xmlns="http://www.w3.org/2000/svg"' +
      '>' +

        '<rect ' +
          'x="3" ' +
          'y="7" ' +
          'width="18" ' +
          'height="13" ' +
          'rx="2" ' +
          'stroke="white" ' +
          'stroke-width="2"' +
        '/>' +

        '<path ' +
          'd="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7" ' +
          'stroke="white" ' +
          'stroke-width="2"' +
        '/>' +

        '<path ' +
          'd="M3 12H21" ' +
          'stroke="white" ' +
          'stroke-width="2"' +
        '/>' +

      '</svg>' +

      '<div ' +
        'class="status-dot ' +
        statusClass +
        '"' +
      '></div>' +

    '</div>';

  return L.divIcon({
    className:
      '',

    html:
      html,

    iconSize:
      [size, size],

    iconAnchor:
      [size / 2, size],
  });
}

/* =====================================================
   SELECT PROVIDER
===================================================== */

function selectProvider(
  provider
) {

  selectedId =
    provider.id;

  Object.keys(
    markerMap
  ).forEach(
    function(id) {

      const current =
        providers.find(
          function(item) {
            return item.id === id;
          }
        );

      if (!current) {
        return;
      }

      markerMap[id].setIcon(
        createMarkerIcon(
          current,
          id === selectedId
        )
      );
    }
  );

  map.flyTo(
    [
      provider.latitude,
      provider.longitude
    ],

    15,

    {
      duration:
        0.70
    }
  );

  postToReactNative({
    type:
      'providerSelected',

    id:
      provider.id
  });
}

/* =====================================================
   CLEAR SELECTION
===================================================== */

function clearSelection() {

  selectedId =
    null;

  Object.keys(
    markerMap
  ).forEach(
    function(id) {

      const current =
        providers.find(
          function(item) {
            return item.id === id;
          }
        );

      if (!current) {
        return;
      }

      markerMap[id].setIcon(
        createMarkerIcon(
          current,
          false
        )
      );
    }
  );

  postToReactNative({
    type:
      'providerDeselected'
  });
}

/* =====================================================
   ADD ALL PROVIDER MARKERS
===================================================== */

providers.forEach(
  function(provider) {

    const marker =
      L.marker(
        [
          provider.latitude,
          provider.longitude
        ],

        {
          icon:
            createMarkerIcon(
              provider,
              false
            ),

          riseOnHover:
            true,

          keyboard:
            false
        }
      ).addTo(map);

    marker.on(
      'click',

      function() {
        selectProvider(
          provider
        );
      }
    );

    markerMap[
      provider.id
    ] =
      marker;
  }
);

/* =====================================================
   MAP CLICK
===================================================== */

map.on(
  'click',

  function() {
    clearSelection();
  }
);

/* =====================================================
   FIT PROVIDERS
===================================================== */

function fitProviders(
  list
) {

  if (
    !list ||
    list.length === 0
  ) {

    map.flyTo(
      [
        defaultCenter[1],
        defaultCenter[0]
      ],

      ${DEFAULT_ZOOM},

      {
        duration:
          0.60
      }
    );

    return;
  }

  if (
    list.length === 1
  ) {

    map.flyTo(
      [
        list[0].latitude,
        list[0].longitude
      ],

      15,

      {
        duration:
          0.60
      }
    );

    return;
  }

  const bounds =
    L.latLngBounds(
      list.map(
        function(item) {
          return [
            item.latitude,
            item.longitude
          ];
        }
      )
    );

  map.fitBounds(
    bounds,

    {
      paddingTopLeft:
        [35, 155],

      paddingBottomRight:
        [35, 120],

      maxZoom:
        15,

      animate:
        true,

      duration:
        0.70
    }
  );
}

/* =====================================================
   USER LOCATION
===================================================== */

function setUserLocation(
  latitude,
  longitude
) {

  const coords =
    [
      latitude,
      longitude
    ];

  if (!userMarker) {

    const icon =
      L.divIcon({
        className:
          '',

        html:
          '<div class="user-location"></div>',

        iconSize:
          [18, 18],

        iconAnchor:
          [9, 9]
      });

    userMarker =
      L.marker(
        coords,

        {
          icon:
            icon,

          interactive:
            false,

          zIndexOffset:
            1000
        }
      ).addTo(map);

  } else {

    userMarker.setLatLng(
      coords
    );
  }
}

/* =====================================================
   CENTER USER
===================================================== */

function centerOnUser(
  latitude,
  longitude
) {

  setUserLocation(
    latitude,
    longitude
  );

  map.flyTo(
    [
      latitude,
      longitude
    ],

    15,

    {
      duration:
        0.70
    }
  );
}

/* =====================================================
   FOCUS PROVIDER
===================================================== */

function focusProvider(
  id
) {

  const provider =
    providers.find(
      function(item) {
        return item.id === id;
      }
    );

  if (!provider) {
    return;
  }

  selectProvider(
    provider
  );
}

/* =====================================================
   RESET MAP
===================================================== */

function resetMap() {

  clearSelection();

  providers.forEach(
    function(provider) {

      const marker =
        markerMap[
          provider.id
        ];

      if (
        marker &&
        !map.hasLayer(
          marker
        )
      ) {

        marker.addTo(
          map
        );
      }
    }
  );

  fitProviders(
    providers
  );
}

/* =====================================================
   FILTER CATEGORY
===================================================== */

function filterCategory(
  categoryId
) {

  clearSelection();

  if (!categoryId) {

    resetMap();

    return;
  }

  const visible =
    providers.filter(
      function(provider) {

        return provider
          .categoryIds
          .includes(
            categoryId
          );
      }
    );

  providers.forEach(
    function(provider) {

      const marker =
        markerMap[
          provider.id
        ];

      if (!marker) {
        return;
      }

      const isVisible =
        provider
          .categoryIds
          .includes(
            categoryId
          );

      if (isVisible) {

        if (
          !map.hasLayer(
            marker
          )
        ) {

          marker.addTo(
            map
          );
        }

      } else {

        if (
          map.hasLayer(
            marker
          )
        ) {

          map.removeLayer(
            marker
          );
        }
      }
    }
  );

  fitProviders(
    visible
  );
}

/* =====================================================
   NATIVE MESSAGE HANDLER
===================================================== */

function handleNativeMessage(
  rawMessage
) {

  try {

    const data =
      typeof rawMessage === 'string'
        ? JSON.parse(
            rawMessage
          )
        : rawMessage;

    if (
      data.type ===
      'focusProvider'
    ) {

      focusProvider(
        data.id
      );

      return;
    }

    if (
      data.type ===
      'resetMap'
    ) {

      resetMap();

      return;
    }

    if (
      data.type ===
      'filterCategory'
    ) {

      filterCategory(
        data.categoryId ||
          null
      );

      return;
    }

    if (
      data.type ===
      'setUserLocation'
    ) {

      setUserLocation(
        data.latitude,
        data.longitude
      );

      return;
    }

    if (
      data.type ===
      'centerOnUser'
    ) {

      centerOnUser(
        data.latitude,
        data.longitude
      );

      return;
    }

  } catch (error) {

    console.log(
      'Map message error:',
      error
    );
  }
}

/* =====================================================
   WEBVIEW MESSAGE LISTENERS
===================================================== */

window.addEventListener(
  'message',

  function(event) {

    handleNativeMessage(
      event.data
    );
  }
);

document.addEventListener(
  'message',

  function(event) {

    handleNativeMessage(
      event.data
    );
  }
);

/* =====================================================
   INITIAL FIT
===================================================== */

setTimeout(
  function() {

    fitProviders(
      providers
    );

  },

  500
);

</script>

</body>
</html>
`;
}

/* =========================================================
   SCREEN
========================================================= */

export default function MapScreen() {

  const router =
    useRouter();

  const params =
    useLocalSearchParams<MapParams>();

  const webViewRef =
    useRef<WebView>(null);

  const [
    webViewReady,
    setWebViewReady,
  ] = useState(false);

  const initialId =
    getParam(
      params.id
    );

  const initialCategory =
    getParam(
      params.category
    );

  const [
    selectedId,
    setSelectedId,
  ] = useState<string | null>(
    initialId ??
    null
  );

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<string | null>(
    initialCategory ??
    null
  );

  const [
    locationPermission,
    setLocationPermission,
  ] = useState(false);

  const [
    userLocation,
    setUserLocation,
  ] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  /* =======================================================
     SELECTED PROVIDER
  ======================================================= */

  const selectedCraftsman =
    useMemo(
      () =>
        craftsmen.find(
          (item) =>
            item.id ===
            selectedId
        ) ?? null,

      [selectedId]
    );

  /* =======================================================
     VISIBLE PROVIDERS
  ======================================================= */

  const visibleCraftsmen =
    useMemo(
      () => {

        if (!activeCategory) {
          return craftsmen;
        }

        return craftsmen.filter(
          (item) =>
            item.categoryIds
              .includes(
                activeCategory
              )
        );
      },

      [activeCategory]
    );

  /* =======================================================
     MAP HTML
  ======================================================= */

  const mapHtml =
    useMemo(
      () =>
        buildMapHtml(
          mapProviders
        ),

      []
    );

  /* =======================================================
     REQUEST LOCATION
  ======================================================= */

  useEffect(
    () => {

      let mounted =
        true;

      const requestLocation =
        async () => {

          try {

            const permission =
              await Location.requestForegroundPermissionsAsync();

            if (!mounted) {
              return;
            }

            const granted =
              permission.status ===
              'granted';

            setLocationPermission(
              granted
            );

            if (!granted) {
              return;
            }

            const current =
              await Location.getCurrentPositionAsync(
                {
                  accuracy:
                    Location.Accuracy.Balanced,
                }
              );

            if (!mounted) {
              return;
            }

            setUserLocation(
              {
                latitude:
                  current.coords.latitude,

                longitude:
                  current.coords.longitude,
              }
            );

          } catch {

            if (mounted) {

              setLocationPermission(
                false
              );
            }
          }
        };

      void requestLocation();

      return () => {
        mounted = false;
      };

    },

    []
  );

  /* =======================================================
     SEND DATA TO WEBVIEW
  ======================================================= */

  const sendToMap = (
    payload: Record<
      string,
      string | number | null
    >
  ) => {

    if (
      !webViewReady
    ) {
      return;
    }

    const payloadJson =
      JSON.stringify(
        payload
      );

    const script =
      `
        if (
          typeof handleNativeMessage ===
          'function'
        ) {

          handleNativeMessage(
            ${JSON.stringify(
        payloadJson
      )}
          );

        }

        true;
      `;

    webViewRef.current?.injectJavaScript(
      script
    );
  };

  /* =======================================================
     WEBVIEW LOADED
  ======================================================= */

  const handleWebViewLoad =
    () => {

      setWebViewReady(
        true
      );

      setTimeout(
        () => {

          if (initialId) {

            sendToMap(
              {
                type:
                  'focusProvider',

                id:
                  initialId,
              }
            );

            return;
          }

          if (
            initialCategory
          ) {

            sendToMap(
              {
                type:
                  'filterCategory',

                categoryId:
                  initialCategory,
              }
            );

            return;
          }

          if (
            userLocation
          ) {

            sendToMap(
              {
                type:
                  'setUserLocation',

                latitude:
                  userLocation.latitude,

                longitude:
                  userLocation.longitude,
              }
            );
          }

        },

        250
      );
    };

  /* =======================================================
     MAP MESSAGE
  ======================================================= */

  const handleMapMessage =
    (
      event: WebViewMessageEvent
    ) => {

      try {

        const data =
          JSON.parse(
            event.nativeEvent
              .data
          );

        if (
          data.type ===
          'providerSelected'
        ) {

          setSelectedId(
            data.id
          );

          return;
        }

        if (
          data.type ===
          'providerDeselected'
        ) {

          setSelectedId(
            null
          );
        }

      } catch {
        // Ignore invalid messages.
      }
    };

  /* =======================================================
     CATEGORY
  ======================================================= */

  const selectCategory =
    (
      categoryId: string | null
    ) => {

      setSelectedId(
        null
      );

      setActiveCategory(
        categoryId
      );

      sendToMap(
        {
          type:
            'filterCategory',

          categoryId,
        }
      );
    };

  /* =======================================================
     RESET
  ======================================================= */

  const resetMap =
    () => {

      setSelectedId(
        null
      );

      setActiveCategory(
        null
      );

      sendToMap(
        {
          type:
            'resetMap',
        }
      );
    };

  /* =======================================================
     CENTER ON USER
  ======================================================= */

  const centerOnUser =
    async () => {

      try {

        if (
          !locationPermission
        ) {

          const permission =
            await Location.requestForegroundPermissionsAsync();

          if (
            permission.status !==
            'granted'
          ) {

            Alert.alert(
              'الوصول إلى الموقع',

              'اسمح لمهنتي بالوصول إلى موقعك حتى نحدد الخدمات القريبة منك.'
            );

            return;
          }

          setLocationPermission(
            true
          );
        }

        const current =
          await Location.getCurrentPositionAsync(
            {
              accuracy:
                Location.Accuracy.Balanced,
            }
          );

        const location =
        {
          latitude:
            current.coords.latitude,

          longitude:
            current.coords.longitude,
        };

        setUserLocation(
          location
        );

        setSelectedId(
          null
        );

        sendToMap(
          {
            type:
              'centerOnUser',

            latitude:
              location.latitude,

            longitude:
              location.longitude,
          }
        );

      } catch {

        Alert.alert(
          'تعذر تحديد الموقع',
          'حاول مرة أخرى.'
        );
      }
    };

  /* =======================================================
     UPDATE USER LOCATION
  ======================================================= */

  useEffect(
    () => {

      if (
        !webViewReady ||
        !userLocation
      ) {
        return;
      }

      sendToMap(
        {
          type:
            'setUserLocation',

          latitude:
            userLocation.latitude,

          longitude:
            userLocation.longitude,
        }
      );

    },

    [
      webViewReady,
      userLocation,
    ]
  );

  /* =======================================================
     DIRECTIONS
  ======================================================= */

  const openDirections =
    (
      craftsman: Craftsman
    ) => {

      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${craftsman.latitude},${craftsman.longitude}`;

      Linking.openURL(
        url
      ).catch(
        () => {

          Alert.alert(
            'تعذر فتح الاتجاهات',

            'تأكد من وجود تطبيق خرائط على جهازك.'
          );
        }
      );
    };

  /* =======================================================
     PROFILE
  ======================================================= */

  const openProfile =
    (
      craftsman: Craftsman
    ) => {

      router.push(
        {
          pathname:
            '/profile/[id]',

          params:
          {
            id:
              craftsman.id,
          },
        }
      );
    };

  /* =======================================================
     CATEGORY COUNT
  ======================================================= */

  const getCategoryCount =
    (
      categoryId: string
    ) => {

      return craftsmen.filter(
        (
          item
        ) =>
          item.categoryIds
            .includes(
              categoryId
            )
      ).length;
    };

  /* =======================================================
     WEB FALLBACK
  ======================================================= */

  if (
    Platform.OS ===
    'web'
  ) {

    return (
      <View
        style={
          styles.screen
        }
      >

        <ScreenHeader
          title="الخريطة"
        />

        <View
          style={
            styles.webFallback
          }
        >

          <View
            style={
              styles.webIcon
            }
          >

            <MapPinned
              size={32}
              color={
                colors.primary
              }
            />

          </View>

          <Txt
            variant="h3"
            align="center"
            style={
              styles.webTitle
            }
          >
            الخريطة متاحة على الهاتف
          </Txt>

          <Txt
            variant="body"
            color={
              colors.muted
            }
            align="center"
            style={
              styles.webDescription
            }
          >
            افتح مهنتي على Android
            لمشاهدة الخريطة التفاعلية.
          </Txt>

        </View>

      </View>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View
      style={
        styles.screen
      }
    >

      <ScreenHeader
        title="الخريطة"
      />

      <View
        style={
          styles.mapArea
        }
      >

        {/* =================================================
            MAP
        ================================================= */}

        <WebView
          ref={
            webViewRef
          }

          source={{
            html:
              mapHtml,
          }}

          originWhitelist={[
            '*',
          ]}

          javaScriptEnabled
          domStorageEnabled

          scrollEnabled={
            false
          }

          bounces={
            false
          }

          setBuiltInZoomControls={
            false
          }

          setDisplayZoomControls={
            false
          }

          showsVerticalScrollIndicator={
            false
          }

          showsHorizontalScrollIndicator={
            false
          }

          onLoadEnd={
            handleWebViewLoad
          }

          onMessage={
            handleMapMessage
          }

          style={
            styles.map
          }
        />

        {/* =================================================
            LOCATION BADGE
        ================================================= */}

        <View
          style={[
            styles.topOverlay,
            shadows.level2,
          ]}
        >

          <View
            style={
              styles.locationBadge
            }
          >

            <View
              style={
                styles.locationDot
              }
            />

            <View>

              <Txt
                variant="labelSm"
                weight="700"
                color={
                  colors.primary
                }
              >
                رام الله والبيرة
              </Txt>

              <Txt
                variant="labelSm"
                color={
                  colors.muted
                }
              >
                استكشف الخدمات القريبة
              </Txt>

            </View>

          </View>

        </View>

        {/* =================================================
            CATEGORIES
        ================================================= */}

        <View
          style={
            styles.categoryWrapper
          }
        >

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }

            contentContainerStyle={
              styles.categoryContent
            }
          >

            {/* ALL */}

            <Pressable
              style={[
                styles.categoryChip,

                !activeCategory &&
                styles.categoryChipActive,
              ]}

              onPress={
                resetMap
              }
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
                  {
                    craftsmen.length
                  }
                </Txt>

              </View>

            </Pressable>

            {/* CATEGORIES */}

            {
              categories
                .map(
                  (
                    category
                  ) => {

                    const count =
                      getCategoryCount(
                        category.id
                      );

                    if (
                      count ===
                      0
                    ) {
                      return null;
                    }

                    const active =
                      activeCategory ===
                      category.id;

                    return (
                      <Pressable
                        key={
                          category.id
                        }

                        style={[
                          styles.categoryChip,

                          active &&
                          styles.categoryChipActive,
                        ]}

                        onPress={() =>
                          selectCategory(
                            category.id
                          )
                        }
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
                          {
                            category.label
                          }
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
                            {
                              count
                            }
                          </Txt>

                        </View>

                      </Pressable>
                    );
                  }
                )
            }

          </ScrollView>

        </View>

        {/* =================================================
            MAP CONTROLS
        ================================================= */}

        <View
          style={[
            styles.mapControls,
            shadows.level2,
          ]}
        >

          <Pressable
            style={
              styles.controlButton
            }

            onPress={
              centerOnUser
            }
          >

            <Crosshair
              size={21}
              color={
                colors.primary
              }
            />

          </Pressable>

          <View
            style={
              styles.controlDivider
            }
          />

          <Pressable
            style={
              styles.controlButton
            }

            onPress={
              resetMap
            }
          >

            <MapPinned
              size={20}
              color={
                colors.primary
              }
            />

          </Pressable>

        </View>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        <View
          style={[
            styles.resultPill,
            shadows.level1,
          ]}
        >

          <View
            style={
              styles.resultDot
            }
          />

          <Txt
            variant="labelSm"
            weight="700"
            color={
              colors.text
            }
          >
            {
              visibleCraftsmen.length
            }{' '}
            مزود خدمة
          </Txt>

        </View>

        {/* =================================================
            HINT
        ================================================= */}

        {!selectedCraftsman && (
          <View
            style={[
              styles.infoPill,
              shadows.level1,
            ]}
          >

            <Navigation
              size={15}
              color={
                colors.primary
              }
            />

            <Txt
              variant="labelSm"
              color={
                colors.muted
              }

              style={
                styles.infoText
              }
            >
              اضغط على أي مزود لعرض التفاصيل
            </Txt>

          </View>
        )}

        {/* =================================================
            SELECTED PROVIDER CARD
        ================================================= */}

        {selectedCraftsman && (

          <View
            style={[
              styles.selectedCard,
              shadows.level3,
            ]}
          >

            {/* CLOSE */}

            <Pressable
              style={
                styles.closeButton
              }

              onPress={() => {

                setSelectedId(
                  null
                );

                sendToMap(
                  {
                    type:
                      'resetMap',
                  }
                );

              }}
            >

              <X
                size={17}
                color={
                  colors.muted
                }
              />

            </Pressable>

            {/* TOP */}

            <View
              style={
                styles.cardTopRow
              }
            >

              <Image
                source={{
                  uri:
                    selectedCraftsman.photo,
                }}

                style={
                  styles.avatar
                }
              />

              <View
                style={
                  styles.selectedInfo
                }
              >

                <View
                  style={
                    styles.nameRow
                  }
                >

                  <Txt
                    variant="h4"
                    style={
                      styles.name
                    }

                    numberOfLines={
                      1
                    }
                  >
                    {
                      selectedCraftsman.name
                    }
                  </Txt>

                  {
                    selectedCraftsman.verified && (
                      <CheckCircle2
                        size={16}
                        color={
                          colors.success
                        }
                      />
                    )
                  }

                </View>

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }

                  numberOfLines={
                    1
                  }

                  style={
                    styles.specialty
                  }
                >
                  {
                    selectedCraftsman.specialty
                  }
                </Txt>

                <View
                  style={
                    styles.ratingRow
                  }
                >

                  <Star
                    size={14}
                    color={
                      colors.amber
                    }
                    fill={
                      colors.amber
                    }
                  />

                  <Txt
                    variant="labelSm"
                    weight="700"
                    style={
                      styles.ratingValue
                    }
                  >
                    {
                      selectedCraftsman.rating.toFixed(
                        1
                      )
                    }
                  </Txt>

                  <Txt
                    variant="labelSm"
                    color={
                      colors.muted
                    }
                  >
                    (
                    {
                      selectedCraftsman.reviewCount
                    }
                    )
                  </Txt>

                  <View
                    style={
                      styles.cardDivider
                    }
                  />

                  <Txt
                    variant="labelSm"
                    color={
                      colors.muted
                    }
                  >
                    {
                      selectedCraftsman.distanceKm.toFixed(
                        1
                      )
                    }{' '}
                    كم
                  </Txt>

                </View>

              </View>

              <Pressable
                style={
                  styles.arrowButton
                }

                onPress={() =>
                  openProfile(
                    selectedCraftsman
                  )
                }
              >

                <ArrowUpRight
                  size={19}
                  color={
                    colors.primary
                  }
                />

              </Pressable>

            </View>

            {/* META */}

            <View
              style={
                styles.selectedMetaRow
              }
            >

              <View
                style={
                  styles.metaItem
                }
              >

                <Clock3
                  size={14}
                  color={
                    selectedCraftsman.isOpen
                      ? colors.success
                      : colors.muted
                  }
                />

                <Txt
                  variant="labelSm"
                  weight="600"
                  color={
                    selectedCraftsman.isOpen
                      ? colors.success
                      : colors.muted
                  }

                  style={
                    styles.metaText
                  }
                >
                  {
                    selectedCraftsman.isOpen
                      ? 'مفتوح الآن'
                      : 'مغلق حالياً'
                  }
                </Txt>

              </View>

              <Txt
                variant="labelSm"
                color={
                  colors.muted
                }
              >
                {
                  selectedCraftsman.workingHours
                }
              </Txt>

              <View
                style={
                  styles.metaSpacer
                }
              />

              <Pressable
                style={
                  styles.directionButton
                }

                onPress={() =>
                  openDirections(
                    selectedCraftsman
                  )
                }
              >

                <Navigation
                  size={15}
                  color={
                    colors.primary
                  }
                />

                <Txt
                  variant="labelSm"
                  color={
                    colors.primary
                  }
                  weight="700"

                  style={
                    styles.directionText
                  }
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

const styles =
  StyleSheet.create({

    screen: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    mapArea: {
      flex: 1,
      position:
        'relative',
      overflow:
        'hidden',
    },

    map: {
      flex: 1,
      backgroundColor:
        colors.canvas,
    },

    /* ===============================================
       LOCATION
    =============================================== */

    topOverlay: {
      position:
        'absolute',

      top:
        12,

      left:
        14,

      right:
        14,
    },

    locationBadge: {
      alignSelf:
        'flex-start',

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.xl,

      paddingHorizontal:
        14,

      paddingVertical:
        10,
    },

    locationDot: {
      width:
        9,

      height:
        9,

      borderRadius:
        5,

      backgroundColor:
        colors.success,

      marginLeft:
        9,
    },

    /* ===============================================
       CATEGORIES
    =============================================== */

    categoryWrapper: {
      position:
        'absolute',

      top:
        72,

      left:
        0,

      right:
        0,
    },

    categoryContent: {
      flexDirection:
        'row-reverse',

      paddingHorizontal:
        13,

      gap:
        8,
    },

    categoryChip: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.full,

      paddingHorizontal:
        13,

      paddingVertical:
        9,

      borderWidth:
        1,

      borderColor:
        colors.border,
    },

    categoryChipActive: {
      backgroundColor:
        colors.primary,

      borderColor:
        colors.primary,
    },

    categoryCount: {
      minWidth:
        20,

      height:
        20,

      marginRight:
        7,

      borderRadius:
        10,

      backgroundColor:
        colors.canvas,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    categoryCountActive: {
      backgroundColor:
        colors.white,
    },

    /* ===============================================
       MAP CONTROLS
    =============================================== */

    mapControls: {
      position:
        'absolute',

      right:
        14,

      top:
        132,

      backgroundColor:
        colors.white,

      borderRadius:
        radius.lg,

      overflow:
        'hidden',
    },

    controlButton: {
      width:
        46,

      height:
        46,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    controlDivider: {
      height:
        1,

      backgroundColor:
        colors.border,

      marginHorizontal:
        8,
    },

    /* ===============================================
       RESULT
    =============================================== */

    resultPill: {
      position:
        'absolute',

      left:
        14,

      top:
        132,

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.full,

      paddingHorizontal:
        11,

      paddingVertical:
        8,
    },

    resultDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        colors.success,

      marginLeft:
        7,
    },

    /* ===============================================
       INFO
    =============================================== */

    infoPill: {
      position:
        'absolute',

      bottom:
        18,

      alignSelf:
        'center',

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.full,

      paddingHorizontal:
        13,

      paddingVertical:
        8,
    },

    infoText: {
      marginRight:
        7,
    },

    /* ===============================================
       SELECTED CARD
    =============================================== */

    selectedCard: {
      position:
        'absolute',

      left:
        12,

      right:
        12,

      bottom:
        14,

      backgroundColor:
        colors.white,

      borderRadius:
        radius.xl,

      padding:
        14,
    },

    closeButton: {
      position:
        'absolute',

      top:
        9,

      right:
        9,

      zIndex:
        20,

      width:
        30,

      height:
        30,

      borderRadius:
        15,

      backgroundColor:
        colors.canvas,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    cardTopRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'flex-start',
    },

    avatar: {
      width:
        56,

      height:
        56,

      borderRadius:
        18,

      backgroundColor:
        colors.tintStrong,
    },

    selectedInfo: {
      flex:
        1,

      marginHorizontal:
        10,

      minWidth:
        0,
    },

    nameRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',
    },

    name: {
      flex:
        1,

      textAlign:
        'right',

      marginLeft:
        5,
    },

    specialty: {
      marginTop:
        2,
    },

    ratingRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      marginTop:
        6,
    },

    ratingValue: {
      marginHorizontal:
        4,
    },

    cardDivider: {
      width:
        1,

      height:
        14,

      backgroundColor:
        colors.border,

      marginHorizontal:
        8,
    },

    arrowButton: {
      width:
        40,

      height:
        40,

      borderRadius:
        20,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    selectedMetaRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      marginTop:
        13,

      paddingTop:
        11,

      borderTopWidth:
        1,

      borderTopColor:
        colors.border,
    },

    metaItem: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',
    },

    metaText: {
      marginRight:
        5,
    },

    metaSpacer: {
      flex:
        1,
    },

    directionButton: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.tintStrong,

      borderRadius:
        radius.md,

      paddingHorizontal:
        11,

      paddingVertical:
        8,
    },

    directionText: {
      marginRight:
        5,
    },

    /* ===============================================
       WEB FALLBACK
    =============================================== */

    webFallback: {
      flex:
        1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        40,

      backgroundColor:
        colors.canvas,
    },

    webIcon: {
      width:
        76,

      height:
        76,

      borderRadius:
        38,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        18,
    },

    webTitle: {
      marginBottom:
        8,
    },

    webDescription: {
      textAlign:
        'center',

      lineHeight:
        22,
    },

  });