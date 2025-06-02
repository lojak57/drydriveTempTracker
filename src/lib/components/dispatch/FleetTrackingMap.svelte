<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import { Truck, MapPin, Navigation, RotateCcw, Maximize2 } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Fleet tracking interfaces
	interface FleetAsset {
		id: string;
		driver: string;
		lat: number;
		lng: number;
		status: 'loading' | 'transit' | 'delivery' | 'available' | 'maintenance';
		currentJob: string;
		eta: string;
		route?: {
			origin: { lat: number; lng: number; name: string };
			destination: { lat: number; lng: number; name: string };
		};
		speed: number;
		bearing: number;
		lastUpdate: Date;
	}

	interface TrackingBounds {
		north: number;
		south: number;
		east: number;
		west: number;
	}

	// Component exports
	export let showFullscreen = false;
	export let autoUpdate = true;
	export let trackingMode: 'all' | 'active' | 'custom' = 'active';

	// Map and tracking state
	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map | null = null;
	let markers: Record<string, maplibregl.Marker> = {};
	let routeLines: Record<string, any> = {};
	let updateInterval: number;
	let isMapLoaded = false;

	// Fleet data
	let fleetAssets: FleetAsset[] = [
		{
			id: 'T-156',
			driver: 'Carlos Martinez',
			lat: 29.7604,
			lng: -95.3698,
			status: 'transit',
			currentJob: 'Pickup at Eagle Ford',
			eta: '14:30',
			route: {
				origin: { lat: 29.7604, lng: -95.3698, name: 'Eagle Ford Shale' },
				destination: { lat: 29.6844, lng: -95.1544, name: 'Port Arthur Refinery' }
			},
			speed: 65,
			bearing: 45,
			lastUpdate: new Date()
		},
		{
			id: 'T-203',
			driver: 'Amanda Johnson',
			lat: 31.8457,
			lng: -102.3676,
			status: 'loading',
			currentJob: 'Loading at Permian Basin',
			eta: '16:45',
			route: {
				origin: { lat: 31.8457, lng: -102.3676, name: 'Permian Basin' },
				destination: { lat: 29.7589, lng: -95.3677, name: 'Houston Ship Channel' }
			},
			speed: 0,
			bearing: 0,
			lastUpdate: new Date()
		},
		{
			id: 'T-089',
			driver: 'Tony Valdez',
			lat: 30.2672,
			lng: -97.7431,
			status: 'delivery',
			currentJob: 'Delivery to Cushing Hub',
			eta: '12:15',
			route: {
				origin: { lat: 30.2672, lng: -97.7431, name: 'Austin Hub' },
				destination: { lat: 35.9848, lng: -96.7678, name: 'Cushing Terminal' }
			},
			speed: 58,
			bearing: 15,
			lastUpdate: new Date()
		},
		{
			id: 'T-234',
			driver: 'Rachel Foster',
			lat: 32.7767,
			lng: -96.7970,
			status: 'transit',
			currentJob: 'En route to pickup',
			eta: '15:20',
			route: {
				origin: { lat: 32.7767, lng: -96.7970, name: 'Dallas Hub' },
				destination: { lat: 29.3013, lng: -94.7977, name: 'Beaumont Terminal' }
			},
			speed: 72,
			bearing: 180,
			lastUpdate: new Date()
		},
		{
			id: 'T-167',
			driver: 'Mark Stevens',
			lat: 29.3013,
			lng: -94.7977,
			status: 'available',
			currentJob: 'Awaiting dispatch',
			eta: '—',
			speed: 0,
			bearing: 0,
			lastUpdate: new Date()
		},
		{
			id: 'T-401',
			driver: 'Jessica Kim',
			lat: 26.2034,
			lng: -98.2300,
			status: 'maintenance',
			currentJob: 'Scheduled maintenance',
			eta: '09:00 Tomorrow',
			speed: 0,
			bearing: 0,
			lastUpdate: new Date()
		}
	];

	// Filtered assets based on tracking mode
	$: filteredAssets = getFilteredAssets(fleetAssets, trackingMode);

	function getFilteredAssets(assets: FleetAsset[], mode: string): FleetAsset[] {
		switch (mode) {
			case 'active':
				return assets.filter(asset => ['loading', 'transit', 'delivery'].includes(asset.status));
			case 'all':
				return assets;
			default:
				return assets;
		}
	}

	// Status color mapping
	function getStatusColor(status: string): string {
		switch (status) {
			case 'loading': return '#f59e0b';      // amber
			case 'transit': return '#3b82f6';      // blue  
			case 'delivery': return '#10b981';     // emerald
			case 'available': return '#6b7280';    // gray
			case 'maintenance': return '#ef4444';  // red
			default: return '#6b7280';
		}
	}

	// Status icon mapping
	function getStatusIcon(status: string): string {
		switch (status) {
			case 'loading': return '⏳';
			case 'transit': return '🚛';
			case 'delivery': return '📦';
			case 'available': return '✅';
			case 'maintenance': return '🔧';
			default: return '❓';
		}
	}

	onMount(() => {
		initializeMap();
		if (autoUpdate) {
			startRealtimeTracking();
		}
	});

	onDestroy(() => {
		stopRealtimeTracking();
		if (map) {
			map.remove();
		}
	});

	function initializeMap() {
		if (!mapContainer) return;

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
			center: [-97.0, 31.0], // Texas center
			zoom: 6,
			pitch: 0,
			bearing: 0,
			attributionControl: false
		});

		// Add navigation controls
		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		// Add fullscreen control
		map.addControl(new maplibregl.FullscreenControl(), 'top-right');

		map.on('load', () => {
			isMapLoaded = true;
			addFleetAssetsToMap();
			fitMapToFleet();
			dispatch('map-ready', { map });
		});

		map.on('error', (e) => {
			console.error('Map error:', e);
		});
	}

	function addFleetAssetsToMap() {
		if (!map || !isMapLoaded) return;

		// Clear existing markers
		Object.values(markers).forEach(marker => marker.remove());
		markers = {};

		// Clear existing routes
		Object.keys(routeLines).forEach(routeId => {
			if (map?.getSource(routeId)) {
				map.removeLayer(routeId);
				map.removeSource(routeId);
			}
		});
		routeLines = {};

		// Add markers and routes for each asset
		filteredAssets.forEach(asset => {
			addAssetMarker(asset);
			if (asset.route && asset.status !== 'available' && asset.status !== 'maintenance') {
				addAssetRoute(asset);
			}
		});
	}

	function addAssetMarker(asset: FleetAsset) {
		if (!map) return;

		// Create custom marker element
		const el = document.createElement('div');
		el.className = 'fleet-marker';
		el.innerHTML = `
			<div class="marker-container" style="transform: rotate(${asset.bearing}deg)">
				<div class="marker-icon" style="background-color: ${getStatusColor(asset.status)}">
					${getStatusIcon(asset.status)}
				</div>
				<div class="marker-label">${asset.id}</div>
			</div>
		`;

		// Create popup content
		const popupContent = `
			<div class="fleet-popup">
				<div class="popup-header">
					<strong>${asset.id}</strong>
					<span class="status-badge" style="background-color: ${getStatusColor(asset.status)}40; color: ${getStatusColor(asset.status)}">
						${asset.status.toUpperCase()}
					</span>
				</div>
				<div class="popup-content">
					<div class="popup-row">
						<span class="label">Driver:</span>
						<span class="value">${asset.driver}</span>
					</div>
					<div class="popup-row">
						<span class="label">Current Job:</span>
						<span class="value">${asset.currentJob}</span>
					</div>
					<div class="popup-row">
						<span class="label">ETA:</span>
						<span class="value">${asset.eta}</span>
					</div>
					<div class="popup-row">
						<span class="label">Speed:</span>
						<span class="value">${asset.speed} mph</span>
					</div>
					<div class="popup-row">
						<span class="label">Last Update:</span>
						<span class="value">${asset.lastUpdate.toLocaleTimeString()}</span>
					</div>
				</div>
			</div>
		`;

		const popup = new maplibregl.Popup({
			offset: 25,
			closeButton: true,
			closeOnClick: false
		}).setHTML(popupContent);

		const marker = new maplibregl.Marker({ element: el })
			.setLngLat([asset.lng, asset.lat])
			.setPopup(popup)
			.addTo(map);

		markers[asset.id] = marker;
	}

	function addAssetRoute(asset: FleetAsset) {
		if (!map || !asset.route) return;

		const routeId = `route-${asset.id}`;
		const coordinates = [
			[asset.route.origin.lng, asset.route.origin.lat],
			[asset.lng, asset.lat], // Current position
			[asset.route.destination.lng, asset.route.destination.lat]
		];

		// Add route source
		map.addSource(routeId, {
			'type': 'geojson',
			'data': {
				'type': 'Feature',
				'properties': {
					'truckId': asset.id,
					'status': asset.status
				},
				'geometry': {
					'type': 'LineString',
					'coordinates': coordinates
				}
			}
		});

		// Add route layer
		map.addLayer({
			'id': routeId,
			'type': 'line',
			'source': routeId,
			'layout': {
				'line-join': 'round',
				'line-cap': 'round'
			},
			'paint': {
				'line-color': getStatusColor(asset.status),
				'line-width': 3,
				'line-opacity': 0.7
			}
		});

		routeLines[routeId] = true;
	}

	function fitMapToFleet() {
		if (!map || filteredAssets.length === 0) return;

		const bounds = new maplibregl.LngLatBounds();
		filteredAssets.forEach(asset => {
			bounds.extend([asset.lng, asset.lat]);
			// Include route destinations in bounds
			if (asset.route) {
				bounds.extend([asset.route.destination.lng, asset.route.destination.lat]);
			}
		});

		map.fitBounds(bounds, {
			padding: 50,
			maxZoom: 12
		});
	}

	function startRealtimeTracking() {
		updateInterval = setInterval(() => {
			updateFleetPositions();
		}, 10000); // Update every 10 seconds
	}

	function stopRealtimeTracking() {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	}

	function updateFleetPositions() {
		// Simulate position updates for active assets
		fleetAssets = fleetAssets.map(asset => {
			if (asset.status === 'transit' || asset.status === 'delivery') {
				// Simulate movement along route
				const speedInDegrees = asset.speed * 0.000278; // Rough conversion
				const deltaLat = Math.cos(asset.bearing * Math.PI / 180) * speedInDegrees * 0.1;
				const deltaLng = Math.sin(asset.bearing * Math.PI / 180) * speedInDegrees * 0.1;
				
				return {
					...asset,
					lat: asset.lat + deltaLat + (Math.random() - 0.5) * 0.001,
					lng: asset.lng + deltaLng + (Math.random() - 0.5) * 0.001,
					speed: asset.speed + (Math.random() - 0.5) * 5,
					lastUpdate: new Date()
				};
			}
			return asset;
		});

		// Update markers on map
		if (isMapLoaded) {
			addFleetAssetsToMap();
		}
	}

	function handleTrackingModeChange(mode: 'all' | 'active' | 'custom') {
		trackingMode = mode;
		if (isMapLoaded) {
			addFleetAssetsToMap();
			fitMapToFleet();
		}
	}

	function recenterMap() {
		fitMapToFleet();
	}

	function toggleFullscreen() {
		showFullscreen = !showFullscreen;
		dispatch('fullscreen-toggle', { fullscreen: showFullscreen });
	}
</script>

<div class="fleet-map-container" class:fullscreen={showFullscreen}>
	<!-- Map Controls -->
	<div class="map-controls">
		<div class="control-group">
			<button 
				class="control-btn" 
				class:active={trackingMode === 'active'}
				on:click={() => handleTrackingModeChange('active')}
				title="Track Active Assets"
			>
				<Truck size={16} />
				Active ({filteredAssets.filter(a => ['loading', 'transit', 'delivery'].includes(a.status)).length})
			</button>
			<button 
				class="control-btn" 
				class:active={trackingMode === 'all'}
				on:click={() => handleTrackingModeChange('all')}
				title="Track All Assets"
			>
				<MapPin size={16} />
				All ({fleetAssets.length})
			</button>
		</div>
		
		<div class="control-group">
			<button class="control-btn" on:click={recenterMap} title="Recenter Map">
				<Navigation size={16} />
			</button>
			<button class="control-btn" on:click={toggleFullscreen} title="Toggle Fullscreen">
				<Maximize2 size={16} />
			</button>
		</div>
	</div>

	<!-- Fleet Status Legend -->
	<div class="map-legend">
		<div class="legend-item">
			<span class="legend-dot" style="background-color: #3b82f6"></span>
			<span class="legend-label">Transit</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background-color: #f59e0b"></span>
			<span class="legend-label">Loading</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background-color: #10b981"></span>
			<span class="legend-label">Delivery</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background-color: #6b7280"></span>
			<span class="legend-label">Available</span>
		</div>
		<div class="legend-item">
			<span class="legend-dot" style="background-color: #ef4444"></span>
			<span class="legend-label">Maintenance</span>
		</div>
	</div>

	<!-- Map Container -->
	<div class="map-content" bind:this={mapContainer}></div>

	<!-- Fleet Summary -->
	<div class="fleet-summary">
		<div class="summary-stats">
			<div class="stat-item">
				<span class="stat-value">{filteredAssets.filter(a => a.status === 'transit').length}</span>
				<span class="stat-label">En Route</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{filteredAssets.filter(a => a.status === 'loading').length}</span>
				<span class="stat-label">Loading</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{filteredAssets.filter(a => a.status === 'delivery').length}</span>
				<span class="stat-label">Delivery</span>
			</div>
		</div>
		<div class="update-indicator">
			<span class="update-dot" class:active={autoUpdate}></span>
			<span class="update-label">Live Tracking</span>
		</div>
	</div>
</div>

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.fleet-map-container {
		position: relative;
		width: 100%;
		height: 400px;
		background: #1e293b;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.fleet-map-container.fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100vh;
		z-index: 9999;
		border-radius: 0;
	}

	.map-content {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.map-controls {
		position: absolute;
		top: 16px;
		left: 16px;
		z-index: 1000;
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.control-group {
		display: flex;
		gap: 4px;
		background: rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(8px);
		border-radius: 8px;
		padding: 4px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: transparent;
		border: none;
		color: #cbd5e1;
		font-size: 12px;
		font-weight: 500;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.control-btn:hover {
		background: rgba(51, 65, 85, 0.8);
		color: #e2e8f0;
	}

	.control-btn.active {
		background: #3b82f6;
		color: white;
	}

	.map-legend {
		position: absolute;
		top: 16px;
		right: 16px;
		z-index: 1000;
		background: rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(8px);
		border-radius: 8px;
		padding: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 120px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-label {
		font-size: 11px;
		color: #cbd5e1;
		font-weight: 500;
	}

	.fleet-summary {
		position: absolute;
		bottom: 16px;
		left: 16px;
		right: 16px;
		z-index: 1000;
		background: rgba(15, 23, 42, 0.9);
		backdrop-filter: blur(8px);
		border-radius: 8px;
		padding: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.summary-stats {
		display: flex;
		gap: 24px;
	}

	.stat-item {
		text-align: center;
	}

	.stat-value {
		display: block;
		font-size: 18px;
		font-weight: 700;
		color: #e2e8f0;
		font-family: 'JetBrains Mono', monospace;
	}

	.stat-label {
		display: block;
		font-size: 10px;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 2px;
	}

	.update-indicator {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.update-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #6b7280;
		transition: all 0.3s ease;
	}

	.update-dot.active {
		background: #10b981;
		animation: pulse 2s infinite;
	}

	.update-label {
		font-size: 11px;
		color: #94a3b8;
		font-weight: 500;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* Custom marker styles */
	:global(.fleet-marker) {
		cursor: pointer;
	}

	:global(.marker-container) {
		display: flex;
		flex-direction: column;
		align-items: center;
		transition: transform 0.3s ease;
	}

	:global(.marker-icon) {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		border: 3px solid white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: all 0.2s ease;
	}

	:global(.marker-icon:hover) {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	:global(.marker-label) {
		background: rgba(15, 23, 42, 0.9);
		color: white;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		margin-top: 4px;
		white-space: nowrap;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	/* Popup styles */
	:global(.fleet-popup) {
		font-family: system-ui, -apple-system, sans-serif;
		min-width: 220px;
	}

	:global(.popup-header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		padding-bottom: 8px;
		border-bottom: 1px solid #e5e7eb;
	}

	:global(.popup-header strong) {
		font-weight: 700;
		color: #1f2937;
	}

	:global(.status-badge) {
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	:global(.popup-content) {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	:global(.popup-row) {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	:global(.popup-row .label) {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
	}

	:global(.popup-row .value) {
		font-size: 12px;
		color: #1f2937;
		font-weight: 600;
		text-align: right;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.map-controls {
			flex-direction: column;
			align-items: stretch;
		}

		.control-group {
			flex-direction: column;
		}

		.map-legend {
			position: static;
			margin: 8px;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
		}

		.fleet-summary {
			flex-direction: column;
			gap: 12px;
			align-items: stretch;
		}

		.summary-stats {
			justify-content: space-around;
		}
	}
</style> 