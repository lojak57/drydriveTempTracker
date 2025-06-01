<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { mapStore } from './stores/mapState.js';
	import maplibregl from 'maplibre-gl';

	const dispatch = createEventDispatcher();

	export let job: any;
	export let currentLocation: { lat: number; lng: number; address?: string };

	let mapContainer: HTMLDivElement;

	onMount(() => {
		if (mapContainer && job) {
			initializeMap();
		}
	});

	onDestroy(() => {
		mapStore.destroy();
	});

	function initializeMap() {
		mapStore.setLoading(true);

		// Initialize map with light styling suitable for oil field operations
		const map = new maplibregl.Map({
			container: mapContainer,
			style: {
				"version": 8,
				"sources": {
					"carto-light": {
						"type": "raster",
						"tiles": [
							"https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
							"https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
							"https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
						],
						"tileSize": 256,
						"attribution": "© CartoDB © OpenStreetMap contributors"
					}
				},
				"layers": [
					{
						"id": "carto-light-layer",
						"type": "raster",
						"source": "carto-light",
						"minzoom": 0,
						"maxzoom": 22
					}
				]
			},
			center: [currentLocation.lng, currentLocation.lat],
			zoom: 10,
			attributionControl: false
		});

		// Add navigation controls
		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		// Store map instance
		mapStore.setMap(map);

		// Add markers and route when map loads
		map.on('load', () => {
			addMarkersAndRoute(map);
			dispatch('map-loaded', { map });
		});

		// Handle map errors
		map.on('error', (e) => {
			console.error('Map error:', e);
			dispatch('map-error', { error: e });
		});
	}

	function addMarkersAndRoute(map: maplibregl.Map) {
		if (!map || !job) return;

		// Current location marker (truck)
		const currentMarker = new maplibregl.Marker({
			color: '#8b5cf6',
			scale: 1.2
		})
		.setLngLat([currentLocation.lng, currentLocation.lat])
		.setPopup(new maplibregl.Popup().setHTML(`
			<div style="text-align: center; padding: 8px;">
				<strong style="color: #8b5cf6;">Current Location</strong><br>
				<span style="font-size: 12px; color: #666;">${currentLocation.address || 'Current Position'}</span>
			</div>
		`))
		.addTo(map);

		// Pickup location marker
		const pickupMarker = new maplibregl.Marker({
			color: '#059669',
			scale: 1.0
		})
		.setLngLat([job.pickupLocation.coordinates.lng, job.pickupLocation.coordinates.lat])
		.setPopup(new maplibregl.Popup().setHTML(`
			<div style="text-align: center; padding: 8px;">
				<strong style="color: #059669;">Pickup Location</strong><br>
				<span style="font-size: 12px; color: #666;">${job.pickupLocation.name}</span><br>
				<span style="font-size: 11px; color: #999;">${job.pickupLocation.tankNumber}</span>
			</div>
		`))
		.addTo(map);

		// Delivery location marker
		const deliveryMarker = new maplibregl.Marker({
			color: '#3b82f6',
			scale: 1.0
		})
		.setLngLat([job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat])
		.setPopup(new maplibregl.Popup().setHTML(`
			<div style="text-align: center; padding: 8px;">
				<strong style="color: #3b82f6;">Delivery Location</strong><br>
				<span style="font-size: 12px; color: #666;">${job.deliveryLocation.name}</span>
			</div>
		`))
		.addTo(map);

		// Add route lines
		addRouteLines(map);

		// Fit map to show all points with padding
		fitMapToBounds(map);
	}

	function addRouteLines(map: maplibregl.Map) {
		// Current to pickup route (active)
		map.addSource('route', {
			'type': 'geojson',
			'data': {
				'type': 'Feature',
				'properties': {},
				'geometry': {
					'type': 'LineString',
					'coordinates': [
						[currentLocation.lng, currentLocation.lat],
						[job.pickupLocation.coordinates.lng, job.pickupLocation.coordinates.lat],
						[job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat]
					]
				}
			}
		});

		map.addLayer({
			'id': 'active-route',
			'type': 'line',
			'source': 'route',
			'layout': {
				'line-join': 'round',
				'line-cap': 'round'
			},
			'paint': {
				'line-color': '#059669',
				'line-width': 4,
				'line-opacity': 0.8
			}
		});

		// Pickup to delivery route (planned)
		map.addSource('planned-route', {
			'type': 'geojson',
			'data': {
				'type': 'Feature',
				'properties': {},
				'geometry': {
					'type': 'LineString',
					'coordinates': [
						[job.pickupLocation.coordinates.lng, job.pickupLocation.coordinates.lat],
						[job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat]
					]
				}
			}
		});

		map.addLayer({
			'id': 'planned-route',
			'type': 'line',
			'source': 'planned-route',
			'layout': {
				'line-join': 'round',
				'line-cap': 'round'
			},
			'paint': {
				'line-color': '#3b82f6',
				'line-width': 3,
				'line-opacity': 0.6,
				'line-dasharray': [2, 2]
			}
		});
	}

	function fitMapToBounds(map: maplibregl.Map) {
		const coordinates: [number, number][] = [
			[currentLocation.lng, currentLocation.lat],
			[job.pickupLocation.coordinates.lng, job.pickupLocation.coordinates.lat],
			[job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat]
		];

		const bounds = new maplibregl.LngLatBounds();
		coordinates.forEach(coord => bounds.extend(coord));

		map.fitBounds(bounds, {
			padding: 50,
			maxZoom: 12
		});
	}
</script>

<!-- MapLibre GL Container -->
<div class="map-gl-container" bind:this={mapContainer}></div>

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';
	
	.map-gl-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #f5f5f5;
	}

	.map-gl-container :global(.maplibregl-popup) {
		max-width: 200px;
	}

	.map-gl-container :global(.maplibregl-popup-content) {
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.map-gl-container :global(.maplibregl-marker) {
		cursor: pointer;
	}
</style> 