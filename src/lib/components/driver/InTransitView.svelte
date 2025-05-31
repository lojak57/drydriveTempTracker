<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { 
		ArrowLeft, MapPin, Clock, Navigation, Phone, AlertCircle, 
		Gauge, Truck, Shield, Zap, Thermometer
	} from 'lucide-svelte';
	import maplibregl from 'maplibre-gl';

	const dispatch = createEventDispatcher();

	export let job: any; // Job details from parent

	// Map container and instance
	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;

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
	let lastSpeedCheck = Date.now();
	let maxSpeedAlert = 65; // Speed limit for hazmat transport

	// Map initialization for in-transit view
	onMount(() => {
		if (mapContainer && job) {
			// Initialize map with focused view on current route
			map = new maplibregl.Map({
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
				zoom: 12,
				attributionControl: false
			});

			// Add navigation controls
			map.addControl(new maplibregl.NavigationControl(), 'top-right');

			// Add route and markers when map loads
			map.on('load', () => {
				addInTransitRoute();
			});
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});

	function addInTransitRoute() {
		if (!map || !job) return;

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

		// Center map on route
		const bounds = new maplibregl.LngLatBounds();
		bounds.extend([currentLocation.lng, currentLocation.lat]);
		bounds.extend([job.deliveryLocation.coordinates.lng, job.deliveryLocation.coordinates.lat]);

		map.fitBounds(bounds, {
			padding: 80,
			maxZoom: 10
		});
	}

	function exitTransitView() {
		dispatch('exit-transit');
	}

	function callEmergency() {
		console.log('Emergency call initiated');
	}

	function callDispatch() {
		console.log('Calling dispatch for transit support');
	}

	function reportSafetyIssue() {
		console.log('Reporting safety issue during transit');
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}

	function formatTimeRemaining() {
		const now = new Date();
		const diffMs = estimatedArrival.getTime() - now.getTime();
		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	}

	function getSpeedStatus() {
		if (transitSpeed > maxSpeedAlert) return 'warning';
		if (transitSpeed > maxSpeedAlert - 5) return 'caution';
		return 'normal';
	}
</script>

<div class="transit-view-container">
	<!-- Header -->
	<div class="transit-header">
		<button class="back-btn tap-target" on:click={exitTransitView}>
			<ArrowLeft size={20} />
			<span>Exit Transit</span>
		</button>
		<div class="transit-title">
			<span class="transit-status">IN TRANSIT</span>
			<span class="job-id">#{job.id}</span>
		</div>
		<div class="safety-indicator {alertLevel}">
			<Shield size={18} />
		</div>
	</div>

	<!-- Safety Dashboard -->
	<div class="safety-dashboard">
		<div class="metrics-row">
			<div class="metric-card {getSpeedStatus()}">
				<div class="metric-icon">
					<Gauge size={20} />
				</div>
				<div class="metric-value">{transitSpeed}</div>
				<div class="metric-label">MPH</div>
				<div class="metric-status">Max: {maxSpeedAlert}</div>
			</div>
			
			<div class="metric-card">
				<div class="metric-icon">
					<Zap size={20} />
				</div>
				<div class="metric-value">{tankPressure}</div>
				<div class="metric-label">PSI</div>
				<div class="metric-status">Normal</div>
			</div>
			
			<div class="metric-card">
				<div class="metric-icon">
					<Thermometer size={20} />
				</div>
				<div class="metric-value">{loadTemperature}°</div>
				<div class="metric-label">Load Temp</div>
				<div class="metric-status">Optimal</div>
			</div>
			
			<div class="metric-card active">
				<div class="metric-icon">
					<Clock size={24} />
				</div>
				<div class="metric-value">{formatTimeRemaining()}</div>
				<div class="metric-label">ETA</div>
				<div class="metric-status">{formatTime(estimatedArrival)}</div>
			</div>
		</div>
	</div>

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

	<!-- Emergency Actions -->
	<div class="emergency-actions">
		<button class="emergency-btn dispatch tap-target" on:click={callDispatch}>
			<span>Dispatch</span>
		</button>
		<button class="emergency-btn safety tap-target" on:click={reportSafetyIssue}>
			<span>Safety Alert</span>
		</button>
		<button class="emergency-btn emergency tap-target" on:click={callEmergency}>
			<span>Emergency</span>
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

	/* Header */
	.transit-header {
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(20px);
		padding: 12px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 10px;
		position: relative;
		z-index: 100;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 8px;
		color: #60a5fa;
		padding: 10px 12px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
	}

	.back-btn:hover {
		background: rgba(59, 130, 246, 0.2);
	}

	.transit-title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.transit-status {
		font-size: 16px;
		font-weight: 700;
		color: #3b82f6;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.job-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #64748b;
	}

	.safety-indicator {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.safety-indicator.normal {
		background: rgba(34, 197, 94, 0.2);
		border: 2px solid #22c55e;
		color: #22c55e;
	}

	.safety-indicator.caution {
		background: rgba(245, 158, 11, 0.2);
		border: 2px solid #f59e0b;
		color: #f59e0b;
	}

	.safety-indicator.warning {
		background: rgba(239, 68, 68, 0.2);
		border: 2px solid #ef4444;
		color: #ef4444;
		animation: pulse-warning 2s infinite;
	}

	/* Safety Dashboard - Mobile First */
	.safety-dashboard {
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(59, 130, 246, 0.1);
		border-radius: 10px;
		padding: 0;
		overflow: hidden;
	}

	.metrics-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1px;
		width: 100%;
		padding: 0;
		margin: 0;
	}

	.metric-card {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 60px;
		padding: 8px 6px;
		background: rgba(30, 41, 59, 0.6);
		color: white;
		text-align: center;
		transition: all 0.2s ease;
		position: relative;
	}

	.metric-card:nth-child(1) {
		border-top-left-radius: 10px;
	}

	.metric-card:nth-child(2) {
		border-top-right-radius: 10px;
	}

	.metric-card:nth-child(3) {
		border-bottom-left-radius: 10px;
	}

	.metric-card:nth-child(4) {
		border-bottom-right-radius: 10px;
	}

	.metric-card.active {
		background: rgba(16, 185, 129, 0.15);
		border: 1px solid rgba(16, 185, 129, 0.3);
	}

	.metric-card .metric-value {
		font-size: 18px;
		font-weight: 700;
		color: white;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1.1;
		margin: 2px 0;
	}

	.metric-card.active .metric-value {
		font-size: 20px;
		font-weight: 800;
		color: #10b981;
	}

	.metric-icon {
		margin-bottom: 2px;
		color: #60a5fa;
		display: flex;
		justify-content: center;
		flex-shrink: 0;
	}

	.metric-card.active .metric-icon {
		color: #10b981;
	}

	.metric-label {
		font-size: 9px;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		margin: 1px 0;
		font-weight: 500;
		line-height: 1;
	}

	.metric-card.active .metric-label {
		color: #6ee7b7;
	}

	.metric-status {
		font-size: 8px;
		color: #64748b;
		font-family: 'JetBrains Mono', monospace;
		margin-top: 1px;
		line-height: 1;
	}

	.metric-card.active .metric-status {
		color: #6ee7b7;
		font-weight: 600;
	}

	/* Speed Warning States */
	.metric-card.warning {
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.metric-card.warning .metric-value,
	.metric-card.warning .metric-icon {
		color: #ef4444;
	}

	.metric-card.caution {
		background: rgba(245, 158, 11, 0.15);
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.metric-card.caution .metric-value,
	.metric-card.caution .metric-icon {
		color: #f59e0b;
	}

	/* Map Section - Mobile First */
	.map-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
		min-height: 250px;
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid rgba(59, 130, 246, 0.1);
	}

	.map-header {
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(20px);
		padding: 10px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(59, 130, 246, 0.1);
		z-index: 10;
	}

	.destination-info {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
	}

	.destination-info svg {
		color: #10b981;
	}

	.destination-name {
		font-weight: 700;
		color: white;
		font-size: 14px;
	}

	.distance-remaining {
		color: #60a5fa;
		font-family: 'JetBrains Mono', monospace;
		font-weight: 700;
		font-size: 12px;
		background: rgba(59, 130, 246, 0.1);
		padding: 3px 6px;
		border-radius: 4px;
		border: 1px solid rgba(59, 130, 246, 0.2);
	}

	.nav-btn {
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 6px;
		color: #60a5fa;
		padding: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
		min-width: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.nav-btn:hover {
		background: rgba(59, 130, 246, 0.2);
	}

	.map-container {
		flex: 1;
		position: relative;
		width: 100%;
		height: 100%;
		filter: brightness(1.1) contrast(1.05) saturate(1.1);
	}

	/* Mobile-First Navigation Banner */
	.next-step-banner {
		position: absolute;
		bottom: 15px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 5;
		pointer-events: none;
		max-width: calc(100% - 20px);
	}

	.next-step-content {
		background: linear-gradient(to right, #10b981, #34d399);
		color: #0f172a;
		border: 1px solid rgba(16, 185, 129, 0.4);
		border-radius: 8px;
		padding: 8px 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(6px);
		pointer-events: auto;
	}

	.next-step-icon {
		font-size: 16px;
		flex-shrink: 0;
		opacity: 1;
	}

	.next-step-text {
		font-size: 13px;
		font-weight: 600;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Mobile-First Emergency Actions */
	.emergency-actions {
		background: rgba(15, 23, 42, 0.85);
		backdrop-filter: blur(20px);
		padding: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0;
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 10px;
		overflow: hidden;
		height: 55px;
	}

	.emergency-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 6px;
		border-right: 1px solid rgba(255, 255, 255, 0.08);
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		min-height: 44px;
	}

	.emergency-btn:last-child {
		border-right: none;
	}

	.emergency-btn.dispatch {
		background: rgba(59, 130, 246, 0.15);
		border: 1px solid rgba(59, 130, 246, 0.3);
		color: #93c5fd;
	}

	.emergency-btn.dispatch:hover {
		background: rgba(59, 130, 246, 0.25);
		color: #dbeafe;
	}

	.emergency-btn.safety {
		background: rgba(245, 158, 11, 0.15);
		border: 1px solid rgba(245, 158, 11, 0.3);
		color: #fcd34d;
	}

	.emergency-btn.safety:hover {
		background: rgba(245, 158, 11, 0.25);
		color: #fef3c7;
	}

	.emergency-btn.emergency {
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		color: #fca5a5;
	}

	.emergency-btn.emergency:hover {
		background: rgba(239, 68, 68, 0.25);
		color: #fecaca;
	}

	.emergency-btn:hover {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Add emojis for better visual recognition */
	.emergency-btn.dispatch::before {
		content: "📞";
		margin-right: 4px;
		font-size: 12px;
		opacity: 0.8;
	}

	.emergency-btn.safety::before {
		content: "⚠️";
		margin-right: 4px;
		font-size: 12px;
		opacity: 0.8;
	}

	.emergency-btn.emergency::before {
		content: "🚨";
		margin-right: 4px;
		font-size: 12px;
		opacity: 0.8;
	}

	/* Animations */
	@keyframes pulse-warning {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
		}
		70% {
			box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
		}
	}

	/* Mobile Portrait (Default - 320px+) */
	/* All styles above are mobile-first */

	/* Mobile Specific Optimizations (up to 479px) */
	@media (max-width: 479px) {
		.metric-card {
			padding: 10px 6px;
			min-height: 65px;
			font-size: 14px;
		}
		
		.metric-card .metric-value {
			font-size: 16px;
		}

		.metric-card.active .metric-value {
			font-size: 18px;
		}
		
		.next-step-content {
			font-size: 12px;
			padding: 8px 14px;
		}

		.emergency-btn {
			padding: 10px 4px;
			font-size: 11px;
		}

		.emergency-btn::before {
			font-size: 10px;
			margin-right: 3px;
		}
	}

	/* Mobile Landscape / Small Tablet (480px+) */
	@media (min-width: 480px) {
		.transit-view-container {
			padding: 10px;
			gap: 8px;
		}

		.transit-header {
			padding: 14px 18px;
		}

		.transit-status {
			font-size: 18px;
		}

		.job-id {
			font-size: 12px;
		}

		.metric-card {
			min-height: 65px;
			padding: 10px 8px;
		}

		.metric-card .metric-value {
			font-size: 20px;
		}

		.metric-card.active .metric-value {
			font-size: 22px;
		}

		.metric-label {
			font-size: 10px;
		}

		.metric-status {
			font-size: 9px;
		}

		.map-section {
			min-height: 300px;
		}

		.map-header {
			padding: 12px 18px;
		}

		.destination-name {
			font-size: 15px;
		}

		.distance-remaining {
			font-size: 13px;
		}

		.next-step-text {
			font-size: 14px;
		}

		.emergency-actions {
			height: 60px;
		}

		.emergency-btn {
			font-size: 13px;
			padding: 12px 8px;
		}
	}

	/* Tablet Portrait / Half Desktop (768px+) */
	@media (min-width: 768px) {
		.transit-view-container {
			padding: 12px;
			gap: 10px;
		}

		.transit-header {
			padding: 16px 20px;
		}

		.back-btn {
			padding: 12px 14px;
			font-size: 15px;
		}

		.transit-status {
			font-size: 20px;
			letter-spacing: 1.2px;
		}

		.safety-indicator {
			width: 44px;
			height: 44px;
			border-radius: 22px;
		}

		/* Fix metrics row - restore flexbox layout */
		.metrics-row {
			display: flex;
			justify-content: space-between;
			align-items: stretch;
			flex-wrap: nowrap;
			gap: 12px;
			margin: 16px 0;
			padding: 0;
		}

		.metric-card {
			flex: 1 1 0;
			min-height: 85px;
			padding: 16px 12px;
			border-radius: 12px;
			background: rgba(30, 41, 59, 0.6);
			backdrop-filter: blur(10px);
			border: 1px solid rgba(59, 130, 246, 0.1);
			color: white;
			text-align: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			box-sizing: border-box;
			transition: all 0.2s ease;
		}

		/* Reset grid-specific styling */
		.metric-card:nth-child(1),
		.metric-card:nth-child(2),
		.metric-card:nth-child(3),
		.metric-card:nth-child(4) {
			border-radius: 12px;
		}

		.metric-card .metric-value {
			font-size: 22px;
			margin: 4px 0;
		}

		.metric-card.active {
			background: rgba(16, 185, 129, 0.1);
			border: 1px solid rgba(16, 185, 129, 0.3);
		}

		.metric-card.active .metric-value {
			font-size: 24px;
			color: #10b981;
		}

		.metric-icon {
			margin-bottom: 4px;
		}

		.metric-label {
			font-size: 10px;
			margin: 2px 0;
		}

		.metric-status {
			font-size: 9px;
			margin-top: 2px;
		}

		.map-section {
			min-height: 350px;
			max-height: 450px;
		}

		.destination-info {
			font-size: 15px;
		}

		.destination-name {
			font-size: 16px;
		}

		.distance-remaining {
			font-size: 14px;
			padding: 4px 8px;
		}

		/* Improve navigation banner */
		.next-step-banner {
			bottom: 24px;
		}

		.next-step-content {
			padding: 12px 20px;
			border-radius: 12px;
			font-size: 16px;
			white-space: nowrap;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		}

		.next-step-text {
			font-size: 15px;
		}

		/* Fix emergency actions for better touch targets */
		.emergency-actions {
			height: 70px;
			margin-top: 16px;
			border-radius: 12px;
		}

		.emergency-btn {
			font-size: 15px;
			font-weight: 700;
			padding: 16px 12px;
		}

		.emergency-btn::before {
			font-size: 14px;
			margin-right: 6px;
		}
	}

	/* iPad Landscape / Desktop (1024px+) */
	@media (min-width: 1024px) {
		.transit-view-container {
			padding: 14px;
			gap: 12px;
		}

		.transit-header {
			border-radius: 12px;
		}

		.transit-status {
			font-size: 22px;
			letter-spacing: 1.5px;
		}

		.safety-indicator {
			width: 48px;
			height: 48px;
			border-radius: 24px;
		}

		.safety-dashboard {
			border-radius: 12px;
		}

		/* Enhanced metrics for iPad */
		.metrics-row {
			margin: 20px 0;
			gap: 16px;
		}

		.metric-card {
			min-height: 90px;
			padding: 18px 14px;
			border-radius: 12px;
		}

		.metric-card .metric-value {
			font-size: 24px;
			margin: 6px 0;
		}

		.metric-card.active .metric-value {
			font-size: 26px;
		}

		.metric-label {
			font-size: 11px;
			margin: 3px 0;
		}

		.metric-status {
			font-size: 10px;
			margin-top: 3px;
		}

		/* Balanced map for iPad */
		.map-section {
			min-height: 400px;
			max-height: 500px;
			border-radius: 12px;
		}

		/* Professional navigation banner */
		.next-step-content {
			border-radius: 12px;
			padding: 14px 24px;
			font-size: 16px;
		}

		.next-step-icon {
			font-size: 18px;
		}

		.next-step-text {
			font-size: 16px;
		}

		/* Premium emergency actions */
		.emergency-actions {
			height: 75px;
			border-radius: 12px;
			margin-top: 20px;
		}

		.emergency-btn {
			font-size: 16px;
			font-weight: 700;
			padding: 18px 14px;
		}

		.emergency-btn::before {
			font-size: 16px;
			margin-right: 8px;
		}
	}

	/* Large Desktop (1440px+) */
	@media (min-width: 1440px) {
		.transit-view-container {
			padding: 16px;
			gap: 14px;
		}

		.map-section {
			min-height: 500px;
			max-height: 600px;
		}

		.metric-card {
			min-height: 90px;
		}

		.metric-card .metric-value {
			font-size: 26px;
		}

		.metric-card.active .metric-value {
			font-size: 28px;
		}

		.emergency-actions {
			height: 75px;
		}
	}

	/* Full Screen / 4K Constraints (1920px+) */
	@media (min-width: 1920px) {
		.transit-view-container {
			max-width: 1400px;
			margin: 0 auto;
			padding: 20px;
			gap: 16px;
		}

		.transit-header {
			max-width: 100%;
			padding: 18px 24px;
		}

		.safety-dashboard {
			max-width: 100%;
		}

		.metrics-row {
			max-width: 100%;
			gap: 20px;
			margin: 24px 0;
		}

		.metric-card {
			max-width: 300px;
			min-height: 95px;
			padding: 20px 16px;
		}

		.metric-card .metric-value {
			font-size: 28px;
		}

		.metric-card.active .metric-value {
			font-size: 30px;
		}

		.map-section {
			max-width: 100%;
			min-height: 550px;
			max-height: 650px;
		}

		.emergency-actions {
			max-width: 100%;
			height: 80px;
		}

		.emergency-btn {
			font-size: 17px;
			padding: 20px 16px;
		}
	}

	/* Ultra-wide / 4K+ Constraints (2560px+) */
	@media (min-width: 2560px) {
		.transit-view-container {
			max-width: 1600px;
			padding: 24px;
		}

		.metrics-row {
			gap: 24px;
			margin: 28px 0;
		}

		.metric-card {
			max-width: 350px;
			min-height: 100px;
		}

		.map-section {
			min-height: 600px;
			max-height: 700px;
		}
	}

	/* MapLibre GL Customization for Dark Theme */
	:global(.maplibregl-popup-content) {
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(59, 130, 246, 0.3);
		color: white;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	:global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
		border-top-color: rgba(15, 23, 42, 0.95);
	}

	:global(.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
		border-bottom-color: rgba(15, 23, 42, 0.95);
	}

	:global(.maplibregl-ctrl-group) {
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 8px;
	}

	:global(.maplibregl-ctrl-group button) {
		background: rgba(15, 23, 42, 0.6);
		color: #60a5fa;
		border-radius: 4px;
	}

	:global(.maplibregl-ctrl-group button:hover) {
		background: rgba(59, 130, 246, 0.2);
	}
</style> 