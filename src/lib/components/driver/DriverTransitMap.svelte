<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import maplibregl from 'maplibre-gl';

  const dispatch = createEventDispatcher();

  // Props
  export let currentLocation: { lat: number; lng: number; address?: string };
  export let destination: { lat: number; lng: number; name: string; address: string };
  export let origin: { lat: number; lng: number; name: string } | null = null;
  export let transitType: 'pickup' | 'delivery' = 'pickup';

  // Map state
  let mapContainer: HTMLDivElement;
  let map: maplibregl.Map | null = null;
  let isMapLoaded = false;
  let currentMarker: maplibregl.Marker | null = null;
  let destinationMarker: maplibregl.Marker | null = null;
  let originMarker: maplibregl.Marker | null = null;

  onMount(() => {
    initializeMap();
  });

  onDestroy(() => {
    cleanup();
  });

  function cleanup() {
    if (currentMarker) currentMarker.remove();
    if (destinationMarker) destinationMarker.remove();
    if (originMarker) originMarker.remove();
    if (map) {
      map.remove();
      map = null;
    }
  }

  function initializeMap() {
    if (!mapContainer || !currentLocation || !destination) return;

    console.log('🗺️ Initializing DriverTransitMap for:', transitType);
    console.log('📍 Current Location:', currentLocation);
    console.log('🎯 Destination:', destination);
    console.log('🏁 Origin:', origin);

    map = new maplibregl.Map({
      container: mapContainer,
      style: {
        "version": 8,
        "sources": {
          "satellite": {
            "type": "raster",
            "tiles": [
              "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            ],
            "tileSize": 256,
            "attribution": "© Google"
          },
          "hybrid": {
            "type": "raster",
            "tiles": [
              "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            ],
            "tileSize": 256,
            "attribution": "© Google"
          }
        },
        "layers": [
          {
            "id": "satellite-layer",
            "type": "raster",
            "source": "satellite",
            "minzoom": 0,
            "maxzoom": 22
          },
          {
            "id": "hybrid-layer", 
            "type": "raster",
            "source": "hybrid",
            "minzoom": 10,
            "maxzoom": 22,
            "layout": {
              "visibility": "visible"
            }
          }
        ]
      },
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 10,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      isMapLoaded = true;
      addMarkersAndRoute();
      fitMapToRoute();
      dispatch('map-ready', { map });
    });

    map.on('error', (e) => {
      console.error('DriverTransitMap error:', e);
      dispatch('map-error', { error: e });
    });
  }

  function addMarkersAndRoute() {
    if (!map || !isMapLoaded) return;

    // Clear existing markers
    if (currentMarker) currentMarker.remove();
    if (destinationMarker) destinationMarker.remove();
    if (originMarker) originMarker.remove();

    // Current position marker (truck)
    const currentEl = document.createElement('div');
    currentEl.innerHTML = `
      <div class="current-marker">
        <div class="truck-icon">🚛</div>
        <div class="marker-label">Current</div>
      </div>
    `;
    currentEl.className = 'custom-marker';

    currentMarker = new maplibregl.Marker({ element: currentEl })
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(map);

    // Destination marker
    const destEl = document.createElement('div');
    destEl.innerHTML = `
      <div class="destination-marker">
        <div class="dest-icon">${transitType === 'pickup' ? '⚡' : '📦'}</div>
        <div class="marker-label">${transitType === 'pickup' ? 'Pickup' : 'Delivery'}</div>
      </div>
    `;
    destEl.className = 'custom-marker';

    destinationMarker = new maplibregl.Marker({ element: destEl })
      .setLngLat([destination.lng, destination.lat])
      .addTo(map);

    // Origin marker (if provided, for delivery view)
    if (origin) {
      const originEl = document.createElement('div');
      originEl.innerHTML = `
        <div class="origin-marker">
          <div class="origin-icon">🏁</div>
          <div class="marker-label">Origin</div>
        </div>
      `;
      originEl.className = 'custom-marker';

      originMarker = new maplibregl.Marker({ element: originEl })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map);
    }

    // Add route line
    addRoute();
  }

  function addRoute() {
    if (!map || !isMapLoaded) return;

    // Remove existing route
    if (map.getSource('driver-route')) {
      map.removeLayer('driver-route');
      map.removeSource('driver-route');
    }

    // Create route coordinates
    const coordinates: [number, number][] = [
      [currentLocation.lng, currentLocation.lat],
      [destination.lng, destination.lat]
    ];

    // Add origin if this is delivery (showing pickup -> current -> delivery)
    if (origin && transitType === 'delivery') {
      coordinates.unshift([origin.lng, origin.lat]);
    }

    // Add route source
    map.addSource('driver-route', {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      }
    });

    // Add route layer
    map.addLayer({
      'id': 'driver-route',
      'type': 'line',
      'source': 'driver-route',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': transitType === 'pickup' ? '#10b981' : '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
  }

  function fitMapToRoute() {
    if (!map || !currentLocation || !destination) return;

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([currentLocation.lng, currentLocation.lat]);
    bounds.extend([destination.lng, destination.lat]);
    
    if (origin) {
      bounds.extend([origin.lng, origin.lat]);
    }

    map.fitBounds(bounds, {
      padding: 60,
      maxZoom: 12,
      duration: 1000
    });
  }

  // Reactive updates when location changes
  $: if (map && isMapLoaded && currentLocation) {
    updateCurrentPosition();
  }

  function updateCurrentPosition() {
    if (!currentMarker || !map) return;
    
    currentMarker.setLngLat([currentLocation.lng, currentLocation.lat]);
    
    // Update route
    addRoute();
  }
</script>

<div class="driver-transit-map">
  <div class="map-container" bind:this={mapContainer}></div>
</div>

<style>
  @import 'maplibre-gl/dist/maplibre-gl.css';

  .driver-transit-map {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
  }

  .map-container {
    width: 100%;
    height: 100%;
    min-height: 300px;
  }

  /* Custom marker styles */
  :global(.custom-marker) {
    cursor: pointer;
  }

  :global(.current-marker) {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(16, 185, 129, 0.9);
    border-radius: 12px;
    padding: 8px;
    border: 2px solid #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  :global(.destination-marker) {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(59, 130, 246, 0.9);
    border-radius: 12px;
    padding: 8px;
    border: 2px solid #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  :global(.origin-marker) {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(107, 114, 128, 0.9);
    border-radius: 12px;
    padding: 8px;
    border: 2px solid #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  :global(.truck-icon),
  :global(.dest-icon),
  :global(.origin-icon) {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  :global(.marker-label) {
    font-size: 0.75rem;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    white-space: nowrap;
  }

  /* MapLibre GL overrides */
  :global(.maplibregl-ctrl-top-right) {
    top: 10px;
    right: 10px;
  }

  :global(.maplibregl-ctrl-group) {
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
</style> 