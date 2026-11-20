/* =========================================================
   Mihnati – Leaflet map HTML builder
   ---------------------------------------------------------
   Extracted from MapScreen to keep the screen readable.
   No external app imports; self-contained HTML/CSS/JS.
========================================================= */

export type MapCraftsman = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isOpen: boolean;
  categoryIds: string[];
};

export type MapCategory = {
  id: string;
  label: string;
};

export type BuildMapHtmlOptions = {
  providers: MapCraftsman[];
  categories: MapCategory[];
  defaultCenter: { latitude: number; longitude: number };
  defaultZoom: number;
};

/* =========================================================
   CATEGORY PALETTE
   ---------------------------------------------------------
   Deterministic colors per category index. Keeps markers
   distinguishable without hard-coding specific categories.
========================================================= */

const CATEGORY_PALETTE = [
  '#1B4332',
  '#2D6A4F',
  '#40916C',
  '#52796F',
  '#8B5E34',
  '#9C6644',
  '#7F5539',
  '#3A5A40',
];

function categoryColor(
  categoryId: string | undefined,
  categories: MapCategory[],
): string {
  if (!categoryId) {
    return CATEGORY_PALETTE[0];
  }
  const index = categories.findIndex(
    (c) => c.id === categoryId,
  );
  if (index < 0) {
    return CATEGORY_PALETTE[0];
  }
  return CATEGORY_PALETTE[
    index % CATEGORY_PALETTE.length
  ];
}

/* =========================================================
   HTML BUILDER
========================================================= */

export function buildMapHtml(
  options: BuildMapHtmlOptions,
): string {
  const {
    providers,
    categories,
    defaultCenter,
    defaultZoom,
  } = options;

  const providersWithColor = providers.map((p) => ({
    ...p,
    color: categoryColor(p.categoryIds[0], categories),
  }));

  const providersJson = JSON.stringify(
    providersWithColor,
  );
  const defaultCenterJson = JSON.stringify([
    defaultCenter.longitude,
    defaultCenter.latitude,
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
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
  />

  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    crossorigin=""
  ></script>
  <script
    src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
  ></script>

  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #F8F9F6;
      font-family: Arial, Helvetica, sans-serif;
    }
    body { -webkit-tap-highlight-color: transparent; }
    .leaflet-container { background: #F8F9F6; }
    .leaflet-tile { transition: opacity 160ms ease; }

    .leaflet-control-attribution {
      font-size: 9px;
      line-height: 1;
      background: rgba(255,255,255,0.9) !important;
      border-radius: 8px 0 0 0;
      padding: 4px 7px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .leaflet-control-attribution a { color: #1B4332; }

    /* ---- Styled zoom control ---- */
    .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      border-radius: 12px !important;
      overflow: hidden;
    }
    .leaflet-control-zoom a {
      width: 38px !important;
      height: 38px !important;
      line-height: 38px !important;
      font-size: 20px !important;
      color: #1B4332 !important;
      background: #FFFFFF !important;
      border-bottom: 1px solid #E5E7EB !important;
    }
    .leaflet-control-zoom a:last-child {
      border-bottom: none !important;
    }

    /* ---- Clustering ---- */
    .mihnati-cluster {
      background: #1B4332;
      color: #FFFFFF;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 13px;
      box-shadow: 0 5px 14px rgba(0,0,0,0.22);
    }

    /* ---- Provider marker ---- */
    .mihnati-marker {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-sizing: border-box;
      box-shadow: 0 5px 14px rgba(0,0,0,0.20);
      transition:
        width 180ms ease,
        height 180ms ease,
        transform 180ms ease,
        box-shadow 180ms ease;
    }
    .mihnati-marker.selected {
      width: 52px;
      height: 52px;
      transform: translateY(-3px);
      box-shadow: 0 9px 22px rgba(27,67,50,0.30);
    }
    .marker-icon {
      width: 19px;
      height: 19px;
      display: block;
    }
    .status-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      right: -2px;
      top: -2px;
      border-radius: 50%;
      background: #2D936C;
      border: 2px solid #FFFFFF;
    }
    .status-dot.closed { background: #6B7280; }

    /* ---- User location ---- */
    .user-location {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #40916C;
      border: 4px solid #FFFFFF;
      box-sizing: border-box;
      box-shadow:
        0 0 0 7px rgba(64,145,108,0.16),
        0 3px 10px rgba(0,0,0,0.20);
    }

    /* ---- Tile error overlay ---- */
    .tile-error-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(248,249,246,0.94);
      color: #1F2933;
      font-size: 13px;
      font-weight: 700;
      z-index: 1000;
      text-align: center;
      padding: 24px;
      line-height: 20px;
      pointer-events: none;
    }
    .tile-error-overlay[hidden] { display: none; }
  </style>
</head>

<body>
  <div id="map"></div>
  <div id="tile-error" class="tile-error-overlay" hidden>
    تعذّر تحميل الخريطة. تحقق من اتصالك بالإنترنت.
  </div>

  <script>
    /* ===============================================
       INJECTED DATA
    =============================================== */
    const providers = ${providersJson};
    const defaultCenter = ${defaultCenterJson};

    /* ===============================================
       STATE
    =============================================== */
    let selectedProviderId = null;
    let userMarker = null;
    const providerMarkers = {};
    const filters = { categoryId: null, query: '' };

    /* ===============================================
       POST TO REACT NATIVE
    =============================================== */
    function postRN(payload) {
      if (
        window.ReactNativeWebView &&
        window.ReactNativeWebView.postMessage
      ) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify(payload),
        );
      }
    }

    /* ===============================================
       MAP
    =============================================== */
    const map = L.map('map', {
      zoomControl: false,
      minZoom: 10,
      maxZoom: 19,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      touchZoom: true,
      preferCanvas: true,
    });

    map.setView(
      [defaultCenter[1], defaultCenter[0]],
      ${defaultZoom},
    );

    L.control.zoom({ position: 'topright' }).addTo(map);

    /* ===============================================
       TILES + ERROR HANDLING
    =============================================== */
    const tileLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        keepBuffer: 2,
        updateWhenIdle: true,
      },
    ).addTo(map);

    const tileErrorEl =
      document.getElementById('tile-error');

    tileLayer.on('tileerror', function () {
      if (tileErrorEl) tileErrorEl.hidden = false;
      postRN({ type: 'tileError' });
    });
    tileLayer.on('load', function () {
      if (tileErrorEl) tileErrorEl.hidden = true;
    });

    /* ===============================================
       CLUSTER GROUP
    =============================================== */
    const placesGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 48,
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          html:
            '<div class="mihnati-cluster">' +
            cluster.getChildCount() +
            '</div>',
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
      },
    });
    map.addLayer(placesGroup);

    /* ===============================================
       PROVIDER MARKER
    =============================================== */
    function createProviderIcon(provider, selected) {
      const size = selected ? 52 : 40;
      const statusClass = provider.isOpen ? '' : 'closed';
      const color = provider.color || '#1B4332';
      const ring = selected
        ? '<div style="position:absolute;inset:-7px;border:2px solid ' +
          color +
          '40;border-radius:50%;"></div>'
        : '';

      const html =
        '<div class="mihnati-marker ' +
        (selected ? 'selected' : '') +
        '" style="width:' +
        size +
        'px;height:' +
        size +
        'px;background:' +
        color +
        ';">' +
        ring +
        '<svg class="marker-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="3" y="7" width="18" height="13" rx="2" stroke="white" stroke-width="2"/>' +
        '<path d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7" stroke="white" stroke-width="2"/>' +
        '<path d="M3 12H21" stroke="white" stroke-width="2"/>' +
        '</svg>' +
        '<div class="status-dot ' +
        statusClass +
        '"></div>' +
        '</div>';

      return L.divIcon({
        className: '',
        html,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
      });
    }

    /* ===============================================
       FILTERS
    =============================================== */
    function providerMatchesFilter(provider) {
      if (
        filters.categoryId &&
        !provider.categoryIds.includes(filters.categoryId)
      ) {
        return false;
      }
      if (filters.query && filters.query.trim().length > 0) {
        const q = filters.query.trim().toLowerCase();
        if (!provider.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    }

    /* ===============================================
       RENDER MARKERS
    =============================================== */
    function renderProviderMarkers() {
      placesGroup.clearLayers();
      Object.keys(providerMarkers).forEach(
        (k) => delete providerMarkers[k],
      );

      providers.forEach(function (provider) {
        if (!providerMatchesFilter(provider)) return;

        const marker = L.marker(
          [provider.latitude, provider.longitude],
          {
            icon: createProviderIcon(provider, false),
            keyboard: false,
            zIndexOffset: provider.isOpen ? 100 : 10,
          },
        );

        marker.on('click', function (event) {
          if (event && event.originalEvent) {
            L.DomEvent.stopPropagation(event);
          }
          selectProvider(provider);
        });

        providerMarkers[provider.id] = marker;
        placesGroup.addLayer(marker);
      });
    }

    /* ===============================================
       SELECT
    =============================================== */
    function selectProvider(provider) {
      selectedProviderId = provider.id;

      Object.keys(providerMarkers).forEach(function (id) {
        const current = providers.find(
          (item) => item.id === id,
        );
        if (!current) return;
        providerMarkers[id].setIcon(
          createProviderIcon(
            current,
            id === selectedProviderId,
          ),
        );
      });

      map.flyTo(
        [provider.latitude, provider.longitude],
        15,
        { duration: 0.7 },
      );

      postRN({ type: 'providerSelected', id: provider.id });
    }

    function clearSelection() {
      selectedProviderId = null;

      Object.keys(providerMarkers).forEach(function (id) {
        const current = providers.find(
          (item) => item.id === id,
        );
        if (!current) return;
        providerMarkers[id].setIcon(
          createProviderIcon(current, false),
        );
      });

      postRN({ type: 'deselected' });
    }

    map.on('click', clearSelection);

    /* ===============================================
       FIT / RESET
    =============================================== */
    function fitVisibleProviders() {
      const visible = providers.filter(providerMatchesFilter);
      if (visible.length === 0) {
        map.flyTo(
          [defaultCenter[1], defaultCenter[0]],
          ${defaultZoom},
          { duration: 0.6 },
        );
        return;
      }
      if (visible.length === 1) {
        map.flyTo(
          [visible[0].latitude, visible[0].longitude],
          15,
          { duration: 0.6 },
        );
        return;
      }
      const bounds = L.latLngBounds(
        visible.map((p) => [p.latitude, p.longitude]),
      );
      map.fitBounds(bounds, {
        paddingTopLeft: [30, 165],
        paddingBottomRight: [30, 145],
        maxZoom: 15,
        animate: true,
        duration: 0.7,
      });
    }

    function resetView() {
      clearSelection();
      renderProviderMarkers();
      fitVisibleProviders();
      postRN({ type: 'reset' });
    }

    /* ===============================================
       USER LOCATION
    =============================================== */
    function setUserLocation(lat, lng) {
      const coords = [lat, lng];
      if (!userMarker) {
        userMarker = L.marker(coords, {
          icon: L.divIcon({
            className: '',
            html: '<div class="user-location"></div>',
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
          interactive: false,
          zIndexOffset: 1000,
        }).addTo(map);
      } else {
        userMarker.setLatLng(coords);
      }
    }

    function centerOnUser(lat, lng) {
      setUserLocation(lat, lng);
      map.flyTo([lat, lng], 15, { duration: 0.7 });
    }

    /* ===============================================
       MESSAGE HANDLER (from RN)
    =============================================== */
    function handleNativeMessage(raw) {
      try {
        const data =
          typeof raw === 'string' ? JSON.parse(raw) : raw;

        if (data.type === 'focusProvider') {
          const p = providers.find((x) => x.id === data.id);
          if (p) selectProvider(p);
          return;
        }
        if (data.type === 'resetView') {
          resetView();
          return;
        }
        if (data.type === 'applyFilters') {
          filters.categoryId = data.categoryId || null;
          filters.query = data.query || '';
          clearSelection();
          renderProviderMarkers();
          fitVisibleProviders();
          return;
        }
        if (data.type === 'setUserLocation') {
          setUserLocation(data.latitude, data.longitude);
          return;
        }
        if (data.type === 'centerOnUser') {
          centerOnUser(data.latitude, data.longitude);
          return;
        }
      } catch (e) {
        console.log('Map message error:', e);
      }
    }

    window.addEventListener('message', (e) =>
      handleNativeMessage(e.data),
    );
    document.addEventListener('message', (e) =>
      handleNativeMessage(e.data),
    );

    /* ===============================================
       INITIAL RENDER
    =============================================== */
    renderProviderMarkers();
    fitVisibleProviders();

    setTimeout(function () {
      postRN({ type: 'mapReady' });
    }, 400);
  </script>
</body>
</html>
`;
}