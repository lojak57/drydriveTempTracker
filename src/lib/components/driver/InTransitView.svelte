<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { MapPin, Navigation } from 'lucide-svelte';
	import maplibregl from 'maplibre-gl';
	import InTransitHeader from './InTransitHeader.svelte';
	import SafetyMetricsDashboard from './SafetyMetricsDashboard.svelte';
	import EmergencyActionPanel from './EmergencyActionPanel.svelte';

	const dispatch = createEventDispatcher();

	export let job: any; // Job details from parent

	// Map container and instance
	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;
	let mapInitialized = false;
	let boundsTimeout: number;

	// Current location and transit state
	let currentLocation = {
		lat: 29.8000,  // Slightly further along the route
		lng: -95.4000,
		address: 'US-290 West - In Transit'
	};
	
	let transitSpeed = 58; // mph
	let distanceToDelivery = 142.7; // miles remaining
	let estimatedArrival = new Date(Date.now() + 150 * 60 * 1000); // 2.5 hours
	let tankPressure = 145; // PSI
	let loadTemperature = 78; // F

	// Safety alerts and status
	let alertLevel = 'normal'; // 'normal' | 'caution' | 'warning'
	let maxSpeedAlert = 65; // Speed limit for hazmat transport

	// Map initialization for in-transit view - STABILIZED
	onMount(() => {
		// Prevent multiple initializations
		if (mapInitialized || !mapContainer || !job) {
			return;
		}

		// Small delay to ensure container is ready
		setTimeout(() => {
			initializeMapSafely();
		}, 200);
	});

	function initializeMapSafely() {
		if (mapInitialized || !mapContainer) return;

		try {
			// Initialize map with stable view
			map = new maplibregl.Map({
				container: mapContainer,
				style: {
					"version": 8,
					"sources": {
						"carto-light": {
							"type": "raster",
							"tiles": [
								"https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
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
				zoom: 10, // Start with stable zoom level
				attributionControl: false
			});

			// Mark as initialized immediately
			mapInitialized = true;

			// Add navigation controls
			map.addControl(new maplibregl.NavigationControl(), 'top-right');

			// Wait for map to fully load before adding route
			map.on('load', () => {
				// Debounced route addition to prevent multiple bounds calculations
				clearTimeout(boundsTimeout);
				boundsTimeout = setTimeout(() => {
					addInTransitRouteStable();
				}, 300);
			});

			// Prevent zoom animation conflicts
			map.on('zoomstart', () => {
				clearTimeout(boundsTimeout);
			});

		} catch (error) {
			console.error('Map initialization error:', error);
			mapInitialized = false;
		}
	}

	function addInTransitRouteStable() {
		if (!map || !job || !mapInitialized) return;

		try {
			// Current location marker (moving truck)
			const currentMarker = new maplibregl.Marker({
				color: '#3b82f6',
				scale: 1.3
			})
			.setLngLat([currentLocation.lng, currentLocation.lat])
			.setPopup(new maplibregl.Popup().setHTML(`
				<div style="text-align: center; padding: 8px;">
					<strong style="color: #3b82f6;">In Transit</strong><br>
					<span style="font-size: 12px; color: #666;">${currentLocation.address}</span><br>
					<span style="font-size: 11px; color: #999;">${transitSpeed} mph</span>
				</div>
			`))
			.addTo(map);

			// Delivery location marker
			const deliveryMarker = new maplibregl.Marker({
				color: '#059669',
				scale: 1.1
			})
			.setLngLat([job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat])
			.setPopup(new maplibregl.Popup().setHTML(`
				<div style="text-align: center; padding: 8px;">
					<strong style="color: #059669;">Destination</strong><br>
					<span style="font-size: 12px; color: #666;">${job.deliveryLocation.name}</span><br>
					<span style="font-size: 11px; color: #999;">${distanceToDelivery} mi remaining</span>
				</div>
			`))
			.addTo(map);

			// Route line to delivery
			map.addSource('transit-route', {
				'type': 'geojson',
				'data': {
					'type': 'Feature',
					'properties': {},
					'geometry': {
						'type': 'LineString',
						'coordinates': [
							[currentLocation.lng, currentLocation.lat],
							[job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat]
						]
					}
				}
			});

			map.addLayer({
				'id': 'active-transit-route',
				'type': 'line',
				'source': 'transit-route',
				'layout': {
					'line-join': 'round',
					'line-cap': 'round'
				},
				'paint': {
					'line-color': '#3b82f6',
					'line-width': 5,
					'line-opacity': 0.8
				}
			});

			// STABLE bounds calculation - prevent erratic zooming
			const bounds = new maplibregl.LngLatBounds();
			bounds.extend([currentLocation.lng, currentLocation.lat]);
			bounds.extend([job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat]);

			// Use gentle, stable bounds fitting
			map.fitBounds(bounds, {
				padding: 60,
				maxZoom: 11,
				duration: 1000, // Smooth transition
				essential: true // Don't interrupt for other animations
			});

		} catch (error) {
			console.error('Error adding route:', error);
		}
	}

	onDestroy(() => {
		// Clean up properly
		clearTimeout(boundsTimeout);
		if (map && mapInitialized) {
			map.remove();
			mapInitialized = false;
		}
	});

	// Event handlers for child components
	function handleExitTransit() {
		dispatch('exit-transit');
	}

	function handleEndTransit() {
		dispatch('transit-complete');
	}

	function handleEmergencyCall() {
		console.log('Emergency call initiated from panel');
	}

	function handleDispatchCall() {
		console.log('Dispatch call initiated from panel');
	}

	function handleSafetyReport() {
		console.log('Safety report initiated from panel');
	}
</script>

<div class="transit-view-container">
	<!-- Header Component -->
	<InTransitHeader 
		{job} 
		{alertLevel} 
		on:exit-transit={handleExitTransit}
	/>

	<!-- Safety Metrics Dashboard Component -->
	<SafetyMetricsDashboard 
		{transitSpeed}
		{maxSpeedAlert}
		{tankPressure}
		{loadTemperature}
		{estimatedArrival}
	/>

	<!-- Map Display -->
	<div class="map-section">
		<div class="map-header">
			<div class="destination-info">
				<MapPin size={16} />
				<span class="destination-name">{job.deliveryLocation.name}</span>
				<span class="distance-remaining">{distanceToDelivery} mi</span>
			</div>
			<div class="map-controls">
				<button class="nav-btn tap-target" title="Open Navigation">
					<Navigation size={16} />
				</button>
			</div>
		</div>
		
		<div class="map-container" bind:this={mapContainer}></div>
		
		<!-- Sticky Next Step Banner -->
		<div class="next-step-banner">
			<div class="next-step-content">
				<span class="next-step-icon">🧭</span>
				<span class="next-step-text">In 5.4 mi — Exit Loop 250 toward US-87 South</span>
			</div>
		</div>
	</div>

	<!-- Emergency Action Panel Component -->
	<EmergencyActionPanel 
		on:emergency-call={handleEmergencyCall}
		on:dispatch-call={handleDispatchCall}
		on:safety-report={handleSafetyReport}
	/>

	<!-- End Transit Button -->
	<div class="end-transit-section">
		<button class="end-transit-btn" on:click={handleEndTransit}>
			🎯 Arrive at Delivery Site
		</button>
	</div>
</div>

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.transit-view-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #0f172a;
		display: flex;
		flex-direction: column;
		z-index: 2000;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		color: white;
		padding: 8px;
		box-sizing: border-box;
		gap: 6px;
	}

	/* Map Section */
	.map-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(59, 130, 246, 0.1);
		border-radius: 10px;
		overflow: hidden;
		position: relative;
	}

	.map-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 16px;
		background: rgba(15, 23, 42, 0.95);
		border-bottom: 1px solid rgba(59, 130, 246, 0.1);
		z-index: 10;
	}

	.destination-info {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #60a5fa;
	}

	.destination-name {
		font-weight: 600;
		font-size: 14px;
	}

	.distance-remaining {
		font-size: 12px;
		color: #94a3b8;
		font-family: 'JetBrains Mono', monospace;
	}

	.map-controls {
		display: flex;
		gap: 8px;
	}

	.nav-btn {
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 6px;
		color: #60a5fa;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 36px;
		min-width: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-btn:hover {
		background: rgba(59, 130, 246, 0.2);
	}

	.map-container {
		flex: 1;
		width: 100%;
		position: relative;
	}

	.next-step-banner {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		padding: 12px 16px;
		z-index: 10;
	}

	.next-step-content {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 14px;
		font-weight: 600;
	}

	.next-step-icon {
		font-size: 16px;
	}

	/* Tap targets for better mobile usability */
	.tap-target {
		min-height: 44px;
		min-width: 44px;
	}

	/* End Transit Section */
	.end-transit-section {
		padding: 16px;
		background: rgba(15, 23, 42, 0.95);
		border-radius: 12px;
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.end-transit-btn {
		width: 100%;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		color: white;
		border: none;
		padding: 20px 32px;
		border-radius: 12px;
		font-size: 18px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.3s ease;
		text-transform: uppercase;
		letter-spacing: 1px;
		box-shadow: 0 8px 20px rgba(34, 197, 94, 0.3);
		min-height: 64px;
	}

	.end-transit-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 30px rgba(34, 197, 94, 0.4);
		background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
	}

	.end-transit-btn:active {
		transform: translateY(0px);
		box-shadow: 0 6px 15px rgba(34, 197, 94, 0.3);
	}

	/* Tablet and desktop adjustments */
	@media (min-width: 768px) {
		.transit-view-container {
			padding: 12px;
			gap: 8px;
		}

		.map-section {
			border-radius: 12px;
		}

		.map-header {
			padding: 16px 20px;
		}

		.destination-name {
			font-size: 15px;
		}

		.distance-remaining {
			font-size: 13px;
		}

		.next-step-banner {
			padding: 16px 20px;
		}

		.next-step-content {
			font-size: 15px;
		}
	}

	@media (min-width: 1024px) {
		.transit-view-container {
			padding: 16px;
			gap: 12px;
		}

		.map-header {
			padding: 20px 24px;
		}
	}
</style> 