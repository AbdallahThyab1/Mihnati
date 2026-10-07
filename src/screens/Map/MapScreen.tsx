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
   CHECKPOINT MODEL
   ---------------------------------------------------------
   DEMO DATA ONLY

   This structure is intentionally separated from the map
   so it can later be replaced by an API response without
   changing the Leaflet rendering logic.
========================================================= */

type CheckpointStatus =
  | 'open'
  | 'closed';

type Checkpoint = {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  status: CheckpointStatus;
  lastUpdated: string;
  note: string;
};

/* =========================================================
   DEMO CHECKPOINTS

   IMPORTANT:
   These are fictional/demo locations and statuses.
   They are NOT live checkpoint information.
========================================================= */

const mapCheckpoints: Checkpoint[] = [
  {
    id: 'checkpoint-demo-1',
    name: 'حاجز تجريبي 1',
    area: 'شمال رام الله',
    latitude: 31.9558,
    longitude: 35.2048,
    status: 'open',
    lastUpdated: 'بيانات تجريبية',
    note: 'الحالة هنا للتجربة فقط وستصبح من API لاحقًا.',
  },

  {
    id: 'checkpoint-demo-2',
    name: 'حاجز تجريبي 2',
    area: 'شرق رام الله',
    latitude: 31.9196,
    longitude: 35.2461,
    status: 'closed',
    lastUpdated: 'بيانات تجريبية',
    note: 'الحالة هنا للتجربة فقط وستصبح من API لاحقًا.',
  },

  {
    id: 'checkpoint-demo-3',
    name: 'حاجز تجريبي 3',
    area: 'جنوب رام الله',
    latitude: 31.8465,
    longitude: 35.1892,
    status: 'open',
    lastUpdated: 'بيانات تجريبية',
    note: 'الحالة هنا للتجربة فقط وستصبح من API لاحقًا.',
  },

  {
    id: 'checkpoint-demo-4',
    name: 'حاجز تجريبي 4',
    area: 'منطقة نابلس',
    latitude: 32.2155,
    longitude: 35.2618,
    status: 'closed',
    lastUpdated: 'بيانات تجريبية',
    note: 'الحالة هنا للتجربة فقط وستصبح من API لاحقًا.',
  },

  {
    id: 'checkpoint-demo-5',
    name: 'حاجز تجريبي 5',
    area: 'منطقة بيت لحم',
    latitude: 31.7042,
    longitude: 35.2071,
    status: 'open',
    lastUpdated: 'بيانات تجريبية',
    note: 'الحالة هنا للتجربة فقط وستصبح من API لاحقًا.',
  },

  {
    id: 'checkpoint-demo-6',
    name: 'حاجز تجريبي 6',
    area: 'منطقة الخليل',
    latitude: 31.5438,
    longitude: 35.1047,
    status: 'closed',
    lastUpdated: 'بيانات تجريبية',
    note: 'الحالة هنا للتجربة فقط وستصبح من API لاحقًا.',
  },
];

/* =========================================================
   HTML MAP
========================================================= */

function buildMapHtml(
  providers: Craftsman[],
  checkpoints: Checkpoint[],
): string {
  const providersJson =
    JSON.stringify(providers);

  const checkpointsJson =
    JSON.stringify(checkpoints);

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

  background:
    #F8F9F6;

  font-family:
    Arial,
    Helvetica,
    sans-serif;
}

body {

  -webkit-tap-highlight-color:
    transparent;
}

.leaflet-container {

  background:
    #F8F9F6;
}

.leaflet-tile {

  transition:
    opacity 160ms ease;
}

.leaflet-control-attribution {

  font-size:
    9px;

  line-height:
    1;

  background:
    rgba(
      255,
      255,
      255,
      0.90
    ) !important;

  border-radius:
    8px 0 0 0;

  padding:
    4px 7px !important;

  box-shadow:
    0 2px 8px
    rgba(
      0,
      0,
      0,
      0.08
    );
}

.leaflet-control-attribution a {

  color:
    #1B4332;
}

.leaflet-control-zoom {

  display:
    none;
}

/* ===============================================
   PROVIDER MARKER
=============================================== */

.mihnati-marker {

  width:
    42px;

  height:
    42px;

  border-radius:
    50%;

  background:
    #1B4332;

  border:
    3px solid
    #FFFFFF;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  position:
    relative;

  box-sizing:
    border-box;

  box-shadow:
    0 5px 14px
    rgba(
      0,
      0,
      0,
      0.20
    );

  transition:
    width 180ms ease,
    height 180ms ease,
    transform 180ms ease,
    background 180ms ease,
    box-shadow 180ms ease;
}

.mihnati-marker.selected {

  width:
    52px;

  height:
    52px;

  background:
    #40916C;

  box-shadow:
    0 9px 22px
    rgba(
      27,
      67,
      50,
      0.30
    );

  transform:
    translateY(-3px);
}

.marker-icon {

  width:
    20px;

  height:
    20px;

  display:
    block;
}

.marker-ring {

  position:
    absolute;

  inset:
    -7px;

  border:
    2px solid
    rgba(
      64,
      145,
      108,
      0.24
    );

  border-radius:
    50%;
}

.marker-ring::after {

  content:
    "";

  position:
    absolute;

  inset:
    -3px;

  border:
    1px solid
    rgba(
      64,
      145,
      108,
      0.12
    );

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
    2px solid
    #FFFFFF;
}

.status-dot.closed {

  background:
    #6B7280;
}

/* ===============================================
   CHECKPOINT MARKER
   Gate / Barrier Shape
=============================================== */

.checkpoint-marker {

  width:
    48px;

  height:
    56px;

  position:
    relative;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  box-sizing:
    border-box;

  filter:
    drop-shadow(
      0 4px 7px
      rgba(
        0,
        0,
        0,
        0.20
      )
    );

  transition:
    transform 180ms ease;
}

.checkpoint-marker.selected {

  transform:
    translateY(-3px)
    scale(1.08);
}

.checkpoint-frame {

  position:
    absolute;

  left:
    7px;

  right:
    7px;

  top:
    11px;

  bottom:
    7px;

  border:
    3px solid
    #FFFFFF;

  border-bottom:
    4px solid
    #FFFFFF;

  border-radius:
    5px 5px 2px 2px;

  background:
    rgba(
      27,
      67,
      50,
      0.94
    );

  box-sizing:
    border-box;
}

.checkpoint-roof {

  position:
    absolute;

  top:
    3px;

  left:
    4px;

  right:
    4px;

  height:
    12px;

  border-radius:
    5px 5px 2px 2px;

  background:
    #FFFFFF;

  border:
    2px solid
    #1B4332;

  box-sizing:
    border-box;
}

.checkpoint-roof::before,
.checkpoint-roof::after {

  content:
    "";

  position:
    absolute;

  top:
    2px;

  bottom:
    2px;

  width:
    3px;

  background:
    #1B4332;

  border-radius:
    2px;
}

.checkpoint-roof::before {

  left:
    8px;
}

.checkpoint-roof::after {

  right:
    8px;
}

.checkpoint-post-left,
.checkpoint-post-right {

  position:
    absolute;

  top:
    15px;

  bottom:
    5px;

  width:
    7px;

  border:
    2px solid
    #FFFFFF;

  background:
    #1B4332;

  border-radius:
    3px;

  z-index:
    3;

  box-sizing:
    border-box;
}

.checkpoint-post-left {

  left:
    5px;
}

.checkpoint-post-right {

  right:
    5px;
}

.checkpoint-lane {

  position:
    absolute;

  left:
    14px;

  right:
    14px;

  top:
    19px;

  bottom:
    10px;

  background:
    rgba(
      255,
      255,
      255,
      0.92
    );

  border-radius:
    2px;

  box-sizing:
    border-box;

  z-index:
    1;
}

.checkpoint-bar {

  position:
    absolute;

  width:
    27px;

  height:
    6px;

  left:
    10px;

  top:
    25px;

  border-radius:
    4px;

  background:
    #D64545;

  border:
    2px solid
    #FFFFFF;

  box-sizing:
    border-box;

  z-index:
    5;

  transform-origin:
    right center;

  transition:
    transform 180ms ease,
    background 180ms ease;
}

.checkpoint-marker.open
.checkpoint-bar {

  background:
    #2D936C;

  transform:
    rotate(
      -34deg
    );

  top:
    27px;
}

.checkpoint-light {

  position:
    absolute;

  width:
    10px;

  height:
    10px;

  border-radius:
    50%;

  right:
    0px;

  top:
    -2px;

  background:
    #D64545;

  border:
    2px solid
    #FFFFFF;

  box-sizing:
    border-box;

  z-index:
    10;
}

.checkpoint-light.open {

  background:
    #2D936C;
}

.checkpoint-label {

  position:
    absolute;

  left:
    50%;

  top:
    56px;

  transform:
    translateX(-50%);

  white-space:
    nowrap;

  padding:
    3px 6px;

  border-radius:
    7px;

  background:
    rgba(
      255,
      255,
      255,
      0.94
    );

  border:
    1px solid
    rgba(
      229,
      231,
      235,
      0.90
    );

  color:
    #1F2933;

  font-size:
    9px;

  line-height:
    12px;

  font-weight:
    700;

  box-shadow:
    0 2px 7px
    rgba(
      0,
      0,
      0,
      0.10
    );

  pointer-events:
    none;
}

.checkpoint-marker.open
.checkpoint-label {

  color:
    #2D936C;
}

.checkpoint-marker.closed
.checkpoint-label {

  color:
    #D64545;
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
    4px solid
    #FFFFFF;

  box-sizing:
    border-box;

  box-shadow:
    0 0 0 7px
      rgba(
        64,
        145,
        108,
        0.16
      ),

    0 3px 10px
      rgba(
        0,
        0,
        0,
        0.20
      );
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const providers =
  ${providersJson};

const checkpoints =
  ${checkpointsJson};

const defaultCenter =
  ${defaultCenterJson};

let selectedId =
  null;

let selectedCheckpointId =
  null;

let userMarker =
  null;

const markerMap =
  {};

const checkpointMarkerMap =
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
      JSON.stringify(
        payload
      )
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
        false,

      touchZoom:
        true,

      preferCanvas:
        true,
    }
  );

map.setView(
  [
    defaultCenter[1],
    defaultCenter[0],
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
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

    keepBuffer:
      2,

    updateWhenZooming:
      false,

    updateWhenIdle:
      true,
  }
).addTo(
  map
);

/* =====================================================
   CREATE PROVIDER ICON
===================================================== */

function createMarkerIcon(
  provider,
  selected
) {

  const size =
    selected
      ? 52
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
      [
        size / 2,
        size,
      ],
  });
}

/* =====================================================
   CREATE CHECKPOINT ICON
   -----------------------------------------------------
   Gate-shaped marker.
===================================================== */

function createCheckpointIcon(
  checkpoint,
  selected
) {

  const selectedClass =
    selected
      ? 'selected'
      : '';

  const statusClass =
    checkpoint.status === 'open'
      ? 'open'
      : 'closed';

  const statusText =
    checkpoint.status === 'open'
      ? 'مفتوح'
      : 'مغلق';

  const html =
    '<div ' +
      'class="checkpoint-marker ' +
      statusClass +
      ' ' +
      selectedClass +
    '">' +

      '<div class="checkpoint-roof"></div>' +

      '<div class="checkpoint-post-left"></div>' +

      '<div class="checkpoint-post-right"></div>' +

      '<div class="checkpoint-frame"></div>' +

      '<div class="checkpoint-lane"></div>' +

      '<div class="checkpoint-bar"></div>' +

      '<div class="checkpoint-light ' +
        statusClass +
      '"></div>' +

      '<div class="checkpoint-label">' +
        statusText +
      '</div>' +

    '</div>';

  return L.divIcon({

    className:
      '',

    html:
      html,

    iconSize:
      [
        48,
        66,
      ],

    iconAnchor:
      [
        24,
        56,
      ],
  });
}

/* =====================================================
   RESET PROVIDER MARKERS
===================================================== */

function resetProviderIcons() {

  Object.keys(
    markerMap
  ).forEach(
    function(id) {

      const current =
        providers.find(
          function(item) {

            return (
              item.id === id
            );
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
}

/* =====================================================
   RESET CHECKPOINT MARKERS
===================================================== */

function resetCheckpointIcons() {

  Object.keys(
    checkpointMarkerMap
  ).forEach(
    function(id) {

      const checkpoint =
        checkpoints.find(
          function(item) {

            return (
              item.id === id
            );
          }
        );

      if (!checkpoint) {
        return;
      }

      checkpointMarkerMap[id].setIcon(
        createCheckpointIcon(
          checkpoint,
          false
        )
      );
    }
  );
}

/* =====================================================
   SELECT PROVIDER
===================================================== */

function selectProvider(
  provider
) {

  selectedId =
    provider.id;

  selectedCheckpointId =
    null;

  resetCheckpointIcons();

  Object.keys(
    markerMap
  ).forEach(
    function(id) {

      const current =
        providers.find(
          function(item) {

            return (
              item.id === id
            );
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
      provider.longitude,
    ],

    15,

    {
      duration:
        0.70,

      easeLinearity:
        0.2,
    }
  );

  postToReactNative({

    type:
      'providerSelected',

    id:
      provider.id,
  });
}

/* =====================================================
   SELECT CHECKPOINT
===================================================== */

function selectCheckpoint(
  checkpoint
) {

  selectedCheckpointId =
    checkpoint.id;

  selectedId =
    null;

  resetProviderIcons();

  Object.keys(
    checkpointMarkerMap
  ).forEach(
    function(id) {

      const current =
        checkpoints.find(
          function(item) {

            return (
              item.id === id
            );
          }
        );

      if (!current) {
        return;
      }

      checkpointMarkerMap[id].setIcon(
        createCheckpointIcon(
          current,
          id ===
            selectedCheckpointId
        )
      );
    }
  );

  map.flyTo(
    [
      checkpoint.latitude,
      checkpoint.longitude,
    ],

    14.5,

    {
      duration:
        0.70,

      easeLinearity:
        0.2,
    }
  );

  postToReactNative({

    type:
      'checkpointSelected',

    id:
      checkpoint.id,
  });
}

/* =====================================================
   CLEAR SELECTION
===================================================== */

function clearSelection() {

  selectedId =
    null;

  selectedCheckpointId =
    null;

  resetProviderIcons();

  resetCheckpointIcons();

  postToReactNative({

    type:
      'providerDeselected',
  });

  postToReactNative({

    type:
      'checkpointDeselected',
  });
}

/* =====================================================
   ADD PROVIDER MARKERS
===================================================== */

providers.forEach(
  function(provider) {

    const marker =
      L.marker(
        [
          provider.latitude,
          provider.longitude,
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
            false,

          zIndexOffset:
            provider.isOpen
              ? 100
              : 10,
        }
      ).addTo(
        map
      );

    marker.on(
      'click',
      function(event) {

        if (
          event &&
          event.originalEvent
        ) {

          L.DomEvent.stopPropagation(
            event
          );
        }

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
   ADD CHECKPOINT MARKERS
===================================================== */

checkpoints.forEach(
  function(checkpoint) {

    const marker =
      L.marker(
        [
          checkpoint.latitude,
          checkpoint.longitude,
        ],

        {
          icon:
            createCheckpointIcon(
              checkpoint,
              false
            ),

          riseOnHover:
            true,

          keyboard:
            false,

          zIndexOffset:
            400,
        }
      ).addTo(
        map
      );

    marker.on(
      'click',
      function(event) {

        if (
          event &&
          event.originalEvent
        ) {

          L.DomEvent.stopPropagation(
            event
          );
        }

        selectCheckpoint(
          checkpoint
        );
      }
    );

    checkpointMarkerMap[
      checkpoint.id
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
        defaultCenter[0],
      ],

      ${DEFAULT_ZOOM},

      {
        duration:
          0.60,
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
        list[0].longitude,
      ],

      15,

      {
        duration:
          0.60,
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
            item.longitude,
          ];
        }
      )
    );

  map.fitBounds(
    bounds,

    {
      paddingTopLeft:
        [
          30,
          165,
        ],

      paddingBottomRight:
        [
          30,
          145,
        ],

      maxZoom:
        15,

      animate:
        true,

      duration:
        0.70,
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
      longitude,
    ];

  if (!userMarker) {

    const icon =
      L.divIcon({

        className:
          '',

        html:
          '<div class="user-location"></div>',

        iconSize:
          [
            18,
            18,
          ],

        iconAnchor:
          [
            9,
            9,
          ],
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
            1000,
        }
      ).addTo(
        map
      );

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
      longitude,
    ],

    15,

    {
      duration:
        0.70,
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

        return (
          item.id === id
        );
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

  checkpoints.forEach(
    function(checkpoint) {

      const marker =
        checkpointMarkerMap[
          checkpoint.id
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
   -----------------------------------------------------
   IMPORTANT:
   Checkpoint markers always remain visible.
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

  checkpoints.forEach(
    function(checkpoint) {

      const marker =
        checkpointMarkerMap[
          checkpoint.id
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
      typeof rawMessage ===
      'string'
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
  ] = useState<
    string | null
  >(
    initialId ??
    null
  );

  const [
    selectedCheckpointId,
    setSelectedCheckpointId,
  ] = useState<
    string | null
  >(null);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState<
    string | null
  >(
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
     SELECTED CHECKPOINT
  ======================================================= */

  const selectedCheckpoint =
    useMemo(
      () =>
        mapCheckpoints.find(
          (item) =>
            item.id ===
            selectedCheckpointId
        ) ?? null,

      [
        selectedCheckpointId,
      ]
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
     CHECKPOINT STATS
  ======================================================= */

  const checkpointStats =
    useMemo(
      () => {

        const open =
          mapCheckpoints.filter(
            (item) =>
              item.status ===
              'open'
          ).length;

        const closed =
          mapCheckpoints.filter(
            (item) =>
              item.status ===
              'closed'
          ).length;

        return {
          open,
          closed,
        };
      },

      []
    );

  /* =======================================================
     MAP HTML
  ======================================================= */

  const mapHtml =
    useMemo(
      () =>
        buildMapHtml(
          mapProviders,
          mapCheckpoints
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
              await Location
                .requestForegroundPermissionsAsync();

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
              await Location
                .getCurrentPositionAsync(
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
                  current.coords
                    .latitude,

                longitude:
                  current.coords
                    .longitude,
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

        mounted =
          false;
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
    >,
    force = false
  ) => {

    if (
      !webViewRef.current ||
      (
        !webViewReady &&
        !force
      )
    ) {

      return;
    }

    const payloadJson =
      JSON.stringify(
        payload
      );

    const script = `
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

    webViewRef.current.injectJavaScript(
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
              },

              true
            );

            return;
          }

          if (initialCategory) {

            sendToMap(
              {
                type:
                  'filterCategory',

                categoryId:
                  initialCategory,
              },

              true
            );

            return;
          }

          if (userLocation) {

            sendToMap(
              {
                type:
                  'setUserLocation',

                latitude:
                  userLocation.latitude,

                longitude:
                  userLocation.longitude,
              },

              true
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

          setSelectedCheckpointId(
            null
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

          return;
        }

        if (
          data.type ===
          'checkpointSelected'
        ) {

          setSelectedCheckpointId(
            data.id
          );

          setSelectedId(
            null
          );

          return;
        }

        if (
          data.type ===
          'checkpointDeselected'
        ) {

          setSelectedCheckpointId(
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

  const selectCategory = (
    categoryId: string | null
  ) => {

    setSelectedId(
      null
    );

    setSelectedCheckpointId(
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

  const resetMap = () => {

    setSelectedId(
      null
    );

    setSelectedCheckpointId(
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
            await Location
              .requestForegroundPermissionsAsync();

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
          await Location
            .getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.Balanced,
              }
            );

        const location =
        {
          latitude:
            current.coords
              .latitude,

          longitude:
            current.coords
              .longitude,
        };

        setUserLocation(
          location
        );

        setSelectedId(
          null
        );

        setSelectedCheckpointId(
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

  const openDirections = (
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

  const openProfile = (
    craftsman: Craftsman
  ) => {

    router.push(
      {
        pathname:
          '/profile/[id]',

        params: {
          id:
            craftsman.id,
        },
      }
    );
  };

  /* =======================================================
     CATEGORY COUNT
  ======================================================= */

  const getCategoryCount = (
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
              size={
                32
              }
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
            لمشاهدة الخريطة التفاعلية والحواجز.
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
            MAP LOADING
        ================================================= */}

        {!webViewReady && (

          <View
            style={
              styles.loadingOverlay
            }

            pointerEvents="none"
          >

            <View
              style={
                styles.loadingCard
              }
            >

              <View
                style={
                  styles.loadingIcon
                }
              >

                <MapPinned
                  size={
                    20
                  }
                  color={
                    colors.primary
                  }
                />

              </View>

              <View
                style={
                  styles.loadingTextWrap
                }
              >

                <Txt
                  variant="label"
                  weight="700"
                >
                  تجهيز الخريطة
                </Txt>

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                >
                  نبحث عن الخدمات ونقاط العبور
                </Txt>

              </View>

              <ActivityIndicator
                size="small"
                color={
                  colors.primary
                }
              />

            </View>

          </View>
        )}

        {/* =================================================
            TOP INFO
        ================================================= */}

        <View
          style={
            styles.topOverlay
          }

          pointerEvents="box-none"
        >

          <View
            style={
              styles.topRow
            }
          >

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

              <View
                style={
                  styles.locationContent
                }
              >

                <Txt
                  variant="labelSm"
                  weight="700"
                  color={
                    colors.primary
                  }
                  numberOfLines={
                    1
                  }
                >
                  {userLocation
                    ? 'موقعك الحالي'
                    : 'رام الله والبيرة'}
                </Txt>

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                  numberOfLines={
                    1
                  }
                >
                  {activeCategory
                    ? 'عرض نتائج التصنيف المختار'
                    : 'الخدمات والحواجز حولك'}
                </Txt>

              </View>

            </View>

            <View
              style={[
                styles.resultPill,
                shadows.level2,
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
                }
              </Txt>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
                style={
                  styles.resultLabel
                }
              >
                مزود خدمة
              </Txt>

            </View>

          </View>

          {/* =================================================
              CATEGORY FILTERS
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

              <Pressable
                style={({
                  pressed,
                }) => [

                    styles.categoryChip,

                    !activeCategory &&
                    styles.categoryChipActive,

                    pressed &&
                    styles.categoryChipPressed,
                  ]}

                onPress={
                  resetMap
                }

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
                    {
                      craftsmen.length
                    }
                  </Txt>

                </View>

              </Pressable>

              {categories.map(
                (
                  category
                ) => {

                  const count =
                    getCategoryCount(
                      category.id
                    );

                  if (
                    count === 0
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

                      style={({
                        pressed,
                      }) => [

                          styles.categoryChip,

                          active &&
                          styles.categoryChipActive,

                          pressed &&
                          styles.categoryChipPressed,
                        ]}

                      onPress={() =>
                        selectCategory(
                          category.id
                        )
                      }

                      accessibilityRole="button"

                      accessibilityLabel={
                        `تصفية ${category.label}`
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
              )}

            </ScrollView>

          </View>

          {/* =================================================
              CHECKPOINT LEGEND
          ================================================= */}

          <View
            style={[
              styles.checkpointLegend,
              shadows.level1,
            ]}
          >

            <View
              style={
                styles.legendTitleRow
              }
            >

              <View
                style={
                  styles.legendGateIcon
                }
              >
                <View
                  style={
                    styles.legendGateRoof
                  }
                />
                <View
                  style={
                    styles.legendGatePostLeft
                  }
                />
                <View
                  style={
                    styles.legendGatePostRight
                  }
                />
              </View>

              <Txt
                variant="labelSm"
                weight="800"
                color={
                  colors.text
                }
              >
                الحواجز
              </Txt>

            </View>

            <View
              style={
                styles.legendItems
              }
            >

              <View
                style={
                  styles.legendItem
                }
              >

                <View
                  style={[
                    styles.legendDot,
                    styles.legendDotOpen,
                  ]}
                />

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                >
                  مفتوح
                </Txt>

              </View>

              <View
                style={
                  styles.legendItem
                }
              >

                <View
                  style={[
                    styles.legendDot,
                    styles.legendDotClosed,
                  ]}
                />

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                >
                  مغلق
                </Txt>

              </View>

            </View>

          </View>

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
            style={({ pressed }) => [

              styles.controlButton,

              pressed &&
              styles.controlButtonPressed,
            ]}

            onPress={
              centerOnUser
            }

            accessibilityRole="button"

            accessibilityLabel="تحديد موقعي"
          >

            <Crosshair
              size={
                21
              }
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
            style={({ pressed }) => [

              styles.controlButton,

              pressed &&
              styles.controlButtonPressed,
            ]}

            onPress={
              resetMap
            }

            accessibilityRole="button"

            accessibilityLabel="إظهار جميع مقدمي الخدمة"
          >

            <MapPinned
              size={
                20
              }
              color={
                colors.primary
              }
            />

          </Pressable>

        </View>

        {/* =================================================
            CHECKPOINT SUMMARY
        ================================================= */}

        {!selectedCraftsman &&
          !selectedCheckpoint && (

            <View
              style={[
                styles.checkpointSummary,
                shadows.level1,
              ]}
            >

              <View
                style={
                  styles.summaryIcon
                }
              >

                <View
                  style={
                    styles.summaryGate
                  }
                >

                  <View
                    style={
                      styles.summaryGateTop
                    }
                  />

                  <View
                    style={
                      styles.summaryGateLeft
                    }
                  />

                  <View
                    style={
                      styles.summaryGateRight
                    }
                  />

                </View>

              </View>

              <View
                style={
                  styles.summaryContent
                }
              >

                <Txt
                  variant="labelSm"
                  weight="800"
                  color={
                    colors.text
                  }
                >
                  حالة الحواجز
                </Txt>

                <View
                  style={
                    styles.summaryStats
                  }
                >

                  <View
                    style={
                      styles.summaryStat
                    }
                  >

                    <View
                      style={[
                        styles.summaryDot,
                        styles.summaryDotOpen,
                      ]}
                    />

                    <Txt
                      variant="small"
                      color={
                        colors.muted
                      }
                    >
                      {
                        checkpointStats.open
                      }{' '}
                      مفتوح
                    </Txt>

                  </View>

                  <View
                    style={
                      styles.summaryStat
                    }
                  >

                    <View
                      style={[
                        styles.summaryDot,
                        styles.summaryDotClosed,
                      ]}
                    />

                    <Txt
                      variant="small"
                      color={
                        colors.muted
                      }
                    >
                      {
                        checkpointStats.closed
                      }{' '}
                      مغلق
                    </Txt>

                  </View>

                </View>

              </View>

            </View>
          )}

        {/* =================================================
            MAP HINT
        ================================================= */}

        {!selectedCraftsman &&
          !selectedCheckpoint && (

            <View
              style={[
                styles.infoPill,
                shadows.level1,
              ]}

              pointerEvents="none"
            >

              <View
                style={
                  styles.infoIcon
                }
              >

                <Navigation
                  size={
                    14
                  }
                  color={
                    colors.primary
                  }
                />

              </View>

              <Txt
                variant="labelSm"
                weight="600"
                color={
                  colors.muted
                }
                style={
                  styles.infoText
                }
              >
                اضغط على نقطة أو بوابة لمعرفة التفاصيل
              </Txt>

            </View>
          )}

        {/* =================================================
            SELECTED PROVIDER
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
              style={({ pressed }) => [

                styles.closeButton,

                pressed &&
                styles.closeButtonPressed,
              ]}

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

              accessibilityRole="button"

              accessibilityLabel="إغلاق معلومات مقدم الخدمة"
            >

              <X
                size={
                  17
                }
                color={
                  colors.muted
                }
              />

            </Pressable>

            {/* TOP */}

            <View
              style={
                styles.selectedTop
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

                  {selectedCraftsman.verified && (

                    <CheckCircle2
                      size={
                        16
                      }
                      color={
                        colors.success
                      }
                    />

                  )}

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
                    size={
                      14
                    }
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
                    {selectedCraftsman.rating.toFixed(
                      1
                    )}
                  </Txt>

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                  >
                    (
                    {
                      selectedCraftsman.reviewCount
                    }{' '}
                    تقييم
                    )
                  </Txt>

                  <View
                    style={
                      styles.cardDivider
                    }
                  />

                  <Txt
                    variant="small"
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

              <View
                style={
                  styles.metaDivider
                }
              />

              <Clock3
                size={
                  14
                }
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
                  styles.metaText
                }

                numberOfLines={
                  1
                }
              >
                {
                  selectedCraftsman.workingHours
                }
              </Txt>

            </View>

            {/* ACTIONS */}

            <View
              style={
                styles.actionsRow
              }
            >

              <Pressable
                style={({ pressed }) => [

                  styles.primaryAction,

                  pressed &&
                  styles.primaryActionPressed,
                ]}

                onPress={() =>
                  openProfile(
                    selectedCraftsman
                  )
                }

                accessibilityRole="button"

                accessibilityLabel="عرض الملف المهني"
              >

                <Txt
                  variant="label"
                  weight="700"
                  color={
                    colors.white
                  }
                >
                  عرض الملف
                </Txt>

                <ArrowUpRight
                  size={
                    17
                  }
                  color={
                    colors.white
                  }
                />

              </Pressable>

              <Pressable
                style={({ pressed }) => [

                  styles.secondaryAction,

                  pressed &&
                  styles.secondaryActionPressed,
                ]}

                onPress={() =>
                  openDirections(
                    selectedCraftsman
                  )
                }

                accessibilityRole="button"

                accessibilityLabel="فتح الاتجاهات"
              >

                <Navigation
                  size={
                    16
                  }
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
                >
                  الاتجاهات
                </Txt>

              </Pressable>

            </View>

          </View>
        )}

        {/* =================================================
            SELECTED CHECKPOINT
        ================================================= */}

        {selectedCheckpoint && (

          <View
            style={[
              styles.checkpointCard,
              shadows.level3,
            ]}
          >

            {/* CLOSE */}

            <Pressable
              style={({ pressed }) => [

                styles.closeButton,

                pressed &&
                styles.closeButtonPressed,
              ]}

              onPress={() => {

                setSelectedCheckpointId(
                  null
                );

                sendToMap(
                  {
                    type:
                      'resetMap',
                  }
                );
              }}

              accessibilityRole="button"

              accessibilityLabel="إغلاق معلومات الحاجز"
            >

              <X
                size={
                  17
                }
                color={
                  colors.muted
                }
              />

            </Pressable>

            {/* HEADER */}

            <View
              style={
                styles.checkpointCardHeader
              }
            >

              <View
                style={[
                  styles.checkpointCardIcon,

                  selectedCheckpoint.status ===
                    'open'
                    ? styles.checkpointCardIconOpen
                    : styles.checkpointCardIconClosed,
                ]}
              >

                <View
                  style={
                    styles.cardGate
                  }
                >

                  <View
                    style={
                      styles.cardGateTop
                    }
                  />

                  <View
                    style={
                      styles.cardGateLeft
                    }
                  />

                  <View
                    style={
                      styles.cardGateRight
                    }
                  />

                  <View
                    style={[
                      styles.cardGateBar,

                      selectedCheckpoint.status ===
                        'open'
                        ? styles.cardGateBarOpen
                        : styles.cardGateBarClosed,
                    ]}
                  />

                </View>

              </View>

              <View
                style={
                  styles.checkpointCardInfo
                }
              >

                <Txt
                  variant="label"
                  weight="800"
                  color={
                    colors.text
                  }

                  numberOfLines={
                    1
                  }
                >
                  {
                    selectedCheckpoint.name
                  }
                </Txt>

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }

                  style={
                    styles.checkpointCardArea
                  }
                >
                  {
                    selectedCheckpoint.area
                  }
                </Txt>

              </View>

            </View>

            {/* STATUS */}

            <View
              style={
                styles.checkpointStatusBox
              }
            >

              <View
                style={
                  styles.checkpointStatusLeft
                }
              >

                <View
                  style={[
                    styles.checkpointStatusDot,

                    selectedCheckpoint.status ===
                      'open'
                      ? styles.checkpointStatusDotOpen
                      : styles.checkpointStatusDotClosed,
                  ]}
                />

                <Txt
                  variant="label"
                  weight="800"
                  color={
                    selectedCheckpoint.status ===
                      'open'
                      ? colors.success
                      : colors.error
                  }
                >
                  {selectedCheckpoint.status ===
                    'open'
                    ? 'مفتوح'
                    : 'مغلق'}
                </Txt>

              </View>

              <View
                style={
                  styles.checkpointLiveBadge
                }
              >

                <Txt
                  variant="small"
                  color={
                    colors.muted
                  }
                >
                  الحالة الحالية
                </Txt>

              </View>

            </View>

            {/* DETAILS */}

            <View
              style={
                styles.checkpointDetails
              }
            >

              <View
                style={
                  styles.checkpointDetail
                }
              >

                <MapPinned
                  size={
                    15
                  }
                  color={
                    colors.primary
                  }
                />

                <View
                  style={
                    styles.checkpointDetailText
                  }
                >

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                  >
                    المنطقة
                  </Txt>

                  <Txt
                    variant="labelSm"
                    weight="700"
                    color={
                      colors.text
                    }
                  >
                    {
                      selectedCheckpoint.area
                    }
                  </Txt>

                </View>

              </View>

              <View
                style={
                  styles.checkpointDetail
                }
              >

                <Clock3
                  size={
                    15
                  }
                  color={
                    colors.primary
                  }
                />

                <View
                  style={
                    styles.checkpointDetailText
                  }
                >

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                  >
                    آخر تحديث
                  </Txt>

                  <Txt
                    variant="labelSm"
                    weight="700"
                    color={
                      colors.text
                    }
                  >
                    {
                      selectedCheckpoint.lastUpdated
                    }
                  </Txt>

                </View>

              </View>

            </View>

            {/* DISCLAIMER */}

            <View
              style={
                styles.checkpointDemoNotice
              }
            >

              <View
                style={
                  styles.checkpointDemoDot
                }
              />

              <Txt
                variant="small"
                color={
                  colors.muted
                }

                style={
                  styles.checkpointDemoText
                }
              >
                هذه حالة تجريبية في النسخة الحالية. عند ربط الـAPI
                ستظهر حالة الحاجز وتحديثها من المصدر الفعلي.
              </Txt>

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
      flex:
        1,

      backgroundColor:
        colors.canvas,
    },

    mapArea: {
      flex:
        1,

      position:
        'relative',

      overflow:
        'hidden',
    },

    map: {
      flex:
        1,

      backgroundColor:
        colors.canvas,
    },

    /* ===============================================
       LOADING
    =============================================== */

    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        colors.canvas,

      zIndex:
        30,
    },

    loadingCard: {
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
        12,

      marginHorizontal:
        30,

      ...shadows.level2,
    },

    loadingIcon: {
      width:
        40,

      height:
        40,

      borderRadius:
        13,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    loadingTextWrap: {
      flex:
        1,

      marginHorizontal:
        10,
    },

    /* ===============================================
       TOP
    =============================================== */

    topOverlay: {
      position:
        'absolute',

      top:
        12,

      left:
        12,

      right:
        12,

      zIndex:
        10,
    },

    topRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    locationBadge: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      maxWidth:
        '78%',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.xl,

      paddingHorizontal:
        12,

      paddingVertical:
        9,
    },

    locationIndicator: {
      width:
        9,

      height:
        9,

      borderRadius:
        5,

      backgroundColor:
        colors.border,

      marginLeft:
        9,
    },

    locationIndicatorActive: {
      backgroundColor:
        colors.success,
    },

    locationContent: {
      flexShrink:
        1,
    },

    resultPill: {
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
        9,
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

    resultLabel: {
      marginRight:
        3,
    },

    /* ===============================================
       FILTERS
    =============================================== */

    categoryWrapper: {
      marginTop:
        10,
    },

    categoryContent: {
      flexDirection:
        'row-reverse',

      gap:
        7,

      paddingHorizontal:
        1,
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
        12,

      paddingVertical:
        8,

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

    categoryChipPressed: {
      opacity:
        0.82,
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
       CHECKPOINT LEGEND
    =============================================== */

    checkpointLegend: {
      alignSelf:
        'flex-start',

      marginTop:
        9,

      backgroundColor:
        colors.white,

      borderRadius:
        radius.lg,

      paddingHorizontal:
        10,

      paddingVertical:
        8,

      borderWidth:
        1,

      borderColor:
        colors.border,
    },

    legendTitleRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      marginBottom:
        5,
    },

    legendGateIcon: {
      width:
        23,

      height:
        22,

      position:
        'relative',

      marginLeft:
        6,
    },

    legendGateRoof: {
      position:
        'absolute',

      top:
        2,

      left:
        3,

      right:
        3,

      height:
        5,

      borderRadius:
        2,

      backgroundColor:
        colors.primary,
    },

    legendGatePostLeft: {
      position:
        'absolute',

      left:
        4,

      top:
        6,

      bottom:
        1,

      width:
        4,

      borderRadius:
        2,

      backgroundColor:
        colors.primary,
    },

    legendGatePostRight: {
      position:
        'absolute',

      right:
        4,

      top:
        6,

      bottom:
        1,

      width:
        4,

      borderRadius:
        2,

      backgroundColor:
        colors.primary,
    },

    legendItems: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      gap:
        10,
    },

    legendItem: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',
    },

    legendDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      marginLeft:
        4,
    },

    legendDotOpen: {
      backgroundColor:
        colors.success,
    },

    legendDotClosed: {
      backgroundColor:
        colors.error,
    },

    /* ===============================================
       MAP CONTROLS
    =============================================== */

    mapControls: {
      position:
        'absolute',

      right:
        12,

      top:
        133,

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

    controlButtonPressed: {
      backgroundColor:
        colors.tint,
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
       CHECKPOINT SUMMARY
    =============================================== */

    checkpointSummary: {
      position:
        'absolute',

      left:
        12,

      bottom:
        78,

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      backgroundColor:
        colors.white,

      borderRadius:
        radius.xl,

      paddingHorizontal:
        10,

      paddingVertical:
        9,
    },

    summaryIcon: {
      width:
        38,

      height:
        38,

      borderRadius:
        12,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    summaryGate: {
      width:
        19,

      height:
        22,

      position:
        'relative',
    },

    summaryGateTop: {
      position:
        'absolute',

      top:
        1,

      left:
        1,

      right:
        1,

      height:
        5,

      borderRadius:
        2,

      backgroundColor:
        colors.primary,
    },

    summaryGateLeft: {
      position:
        'absolute',

      left:
        2,

      top:
        5,

      bottom:
        1,

      width:
        4,

      borderRadius:
        2,

      backgroundColor:
        colors.primary,
    },

    summaryGateRight: {
      position:
        'absolute',

      right:
        2,

      top:
        5,

      bottom:
        1,

      width:
        4,

      borderRadius:
        2,

      backgroundColor:
        colors.primary,
    },

    summaryContent: {
      marginRight:
        8,
    },

    summaryStats: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      gap:
        9,

      marginTop:
        2,
    },

    summaryStat: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',
    },

    summaryDot: {
      width:
        6,

      height:
        6,

      borderRadius:
        3,

      marginLeft:
        4,
    },

    summaryDotOpen: {
      backgroundColor:
        colors.success,
    },

    summaryDotClosed: {
      backgroundColor:
        colors.error,
    },

    /* ===============================================
       HINT
    =============================================== */

    infoPill: {
      position:
        'absolute',

      bottom:
        17,

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
        11,

      paddingVertical:
        8,
    },

    infoIcon: {
      width:
        28,

      height:
        28,

      borderRadius:
        14,

      backgroundColor:
        colors.tintStrong,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    infoText: {
      marginRight:
        7,
    },

    /* ===============================================
       SELECTED PROVIDER
    =============================================== */

    selectedCard: {
      position:
        'absolute',

      left:
        12,

      right:
        12,

      bottom:
        12,

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
        10,

      right:
        10,

      zIndex:
        20,

      width:
        31,

      height:
        31,

      borderRadius:
        16,

      backgroundColor:
        colors.canvas,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    closeButtonPressed: {
      backgroundColor:
        colors.tint,
    },

    selectedTop: {
      flexDirection:
        'row-reverse',

      alignItems:
        'flex-start',

      paddingRight:
        34,
    },

    avatar: {
      width:
        58,

      height:
        58,

      borderRadius:
        18,

      backgroundColor:
        colors.tintStrong,
    },

    selectedInfo: {
      flex:
        1,

      minWidth:
        0,

      marginRight:
        10,
    },

    nameRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      paddingRight:
        0,
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
        7,
    },

    selectedMetaRow: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      marginTop:
        12,

      paddingTop:
        10,

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

    statusIndicator: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        colors.border,

      marginLeft:
        6,
    },

    statusIndicatorOpen: {
      backgroundColor:
        colors.success,
    },

    metaDivider: {
      width:
        1,

      height:
        15,

      backgroundColor:
        colors.border,

      marginHorizontal:
        9,
    },

    metaText: {
      marginRight:
        5,

      flexShrink:
        1,
    },

    actionsRow: {
      flexDirection:
        'row-reverse',

      gap:
        8,

      marginTop:
        12,
    },

    primaryAction: {
      flex:
        1,

      minHeight:
        45,

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
        6,
    },

    primaryActionPressed: {
      opacity:
        0.88,
    },

    secondaryAction: {
      flex:
        0.78,

      minHeight:
        45,

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

      gap:
        5,
    },

    secondaryActionPressed: {
      backgroundColor:
        colors.tint,
    },

    /* ===============================================
       CHECKPOINT CARD
    =============================================== */

    checkpointCard: {
      position:
        'absolute',

      left:
        12,

      right:
        12,

      bottom:
        12,

      backgroundColor:
        colors.white,

      borderRadius:
        radius.xl,

      padding:
        14,
    },

    checkpointCardHeader: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      paddingRight:
        34,
    },

    checkpointCardIcon: {
      width:
        58,

      height:
        58,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    checkpointCardIconOpen: {
      backgroundColor:
        '#E8F5EE',
    },

    checkpointCardIconClosed: {
      backgroundColor:
        '#FCECEC',
    },

    cardGate: {
      width:
        31,

      height:
        34,

      position:
        'relative',
    },

    cardGateTop: {
      position:
        'absolute',

      top:
        1,

      left:
        1,

      right:
        1,

      height:
        8,

      borderRadius:
        3,

      borderWidth:
        2,

      borderColor:
        colors.primary,
    },

    cardGateLeft: {
      position:
        'absolute',

      left:
        4,

      top:
        7,

      bottom:
        1,

      width:
        6,

      borderRadius:
        3,

      backgroundColor:
        colors.primary,
    },

    cardGateRight: {
      position:
        'absolute',

      right:
        4,

      top:
        7,

      bottom:
        1,

      width:
        6,

      borderRadius:
        3,

      backgroundColor:
        colors.primary,
    },

    cardGateBar: {
      position:
        'absolute',

      left:
        8,

      right:
        8,

      top:
        15,

      height:
        5,

      borderRadius:
        3,
    },

    cardGateBarOpen: {
      backgroundColor:
        colors.success,

      transform:
        [
          {
            rotate:
              '-30deg',
          },
        ],
    },

    cardGateBarClosed: {
      backgroundColor:
        colors.error,
    },

    checkpointCardInfo: {
      flex:
        1,

      marginRight:
        10,

      minWidth:
        0,
    },

    checkpointCardArea: {
      marginTop:
        4,
    },

    checkpointStatusBox: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginTop:
        12,

      paddingTop:
        11,

      paddingBottom:
        11,

      borderTopWidth:
        1,

      borderBottomWidth:
        1,

      borderTopColor:
        colors.border,

      borderBottomColor:
        colors.border,
    },

    checkpointStatusLeft: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',
    },

    checkpointStatusDot: {
      width:
        9,

      height:
        9,

      borderRadius:
        5,

      marginLeft:
        7,
    },

    checkpointStatusDotOpen: {
      backgroundColor:
        colors.success,
    },

    checkpointStatusDotClosed: {
      backgroundColor:
        colors.error,
    },

    checkpointLiveBadge: {
      paddingHorizontal:
        8,

      paddingVertical:
        4,

      borderRadius:
        radius.full,

      backgroundColor:
        colors.canvas,
    },

    checkpointDetails: {
      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      gap:
        9,

      marginTop:
        10,
    },

    checkpointDetail: {
      flex:
        1,

      minHeight:
        53,

      flexDirection:
        'row-reverse',

      alignItems:
        'center',

      paddingHorizontal:
        9,

      borderRadius:
        radius.lg,

      backgroundColor:
        '#FAFBF9',

      borderWidth:
        1,

      borderColor:
        colors.border,
    },

    checkpointDetailText: {
      flex:
        1,

      marginRight:
        7,

      alignItems:
        'flex-end',
    },

    checkpointDemoNotice: {
      flexDirection:
        'row-reverse',

      alignItems:
        'flex-start',

      marginTop:
        10,

      padding:
        9,

      borderRadius:
        radius.lg,

      backgroundColor:
        '#FFF8E8',

      borderWidth:
        1,

      borderColor:
        '#F4E3B5',
    },

    checkpointDemoDot: {
      width:
        7,

      height:
        7,

      borderRadius:
        4,

      backgroundColor:
        colors.rating,

      marginTop:
        5,
    },

    checkpointDemoText: {
      flex:
        1,

      marginRight:
        7,

      lineHeight:
        17,

      textAlign:
        'right',
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