<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import { 
		X, MapPin, Clock, Navigation, Phone, AlertCircle, 
		Gauge, Thermometer, Truck, CheckCircle, ArrowLeft, BarChart3 
	} from 'lucide-svelte';
	import maplibregl from 'maplibre-gl';

	const dispatch = createEventDispatcher();

	export let job: any; // Job details from parent

	// Map container and instance
	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map;

	// Mock current location and progress
	let currentStep = 'driving-to-pickup'; // 'driving-to-pickup' | 'at-pickup' | 'loading' | 'driving-to-delivery' | 'at-delivery' | 'unloading' | 'completed'
	let currentLocation = {
		lat: 29.7604,
		lng: -95.3698,
		address: 'Current Location: I-45 North'
	};
	
	let estimatedArrival = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes from now
	let currentSpeed = 62; // mph
	let distanceRemaining = 18.3; // miles

	// Mock step progress
	const jobSteps = [
		{ id: 'driving-to-pickup', label: 'Drive to Pickup', status: 'active', eta: '6:45 AM' },
		{ id: 'at-pickup', label: 'Arrive at Pickup', status: 'pending', eta: '6:45 AM' },
		{ id: 'loading', label: 'Load Tank', status: 'pending', eta: '7:15 AM' },
		{ id: 'driving-to-delivery', label: 'Drive to Delivery', status: 'pending', eta: '7:30 AM' },
		{ id: 'at-delivery', label: 'Arrive at Delivery', status: 'pending', eta: '11:00 AM' },
		{ id: 'unloading', label: 'Unload Tank', status: 'pending', eta: '11:30 AM' },
		{ id: 'completed', label: 'Job Complete', status: 'pending', eta: '12:00 PM' }
	];

	// Map initialization
	onMount(() => {
		if (mapContainer && job) {
			// Initialize map with light styling suitable for oil field operations
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
				zoom: 10,
				attributionControl: false
			});

			// Add navigation controls
			map.addControl(new maplibregl.NavigationControl(), 'top-right');

			// Add markers and route when map loads
			map.on('load', () => {
				addMarkersAndRoute();
			});
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});

	function addMarkersAndRoute() {
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
				<span style="font-size: 12px; color: #666;">${currentLocation.address}</span>
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

		// Current to pickup route (active)
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

		// Fit map to show all points with padding
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

	function exitMapView() {
		dispatch('exit-map');
	}

	function callDispatch() {
		console.log('Calling dispatch...');
	}

	function callEmergency() {
		console.log('Calling emergency contact:', job.customerContact.phone);
	}

	function reportIssue() {
		console.log('Reporting issue...');
	}

	function nextStep() {
		// Mock step progression
		const currentIndex = jobSteps.findIndex(step => step.id === currentStep);
		if (currentIndex < jobSteps.length - 1) {
			currentStep = jobSteps[currentIndex + 1].id;
		}
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}

	function openNavigation() {
		// In production: open native navigation app
		const destination = `${job.pickupLocation.coordinates.lat},${job.pickupLocation.coordinates.lng}`;
		const url = `https://maps.apple.com/?daddr=${destination}`;
		window.open(url, '_blank');
	}
</script>

<div class="map-view-container">
	<!-- Left Panel - Job Information -->
	<div class="job-info-panel">
		<!-- Header -->
		<div class="panel-header">
			<button class="back-btn tap-target" on:click={exitMapView}>
				<ArrowLeft size={20} />
				<span>Back to Schedule</span>
			</button>
			<div class="job-id">#{job.id}</div>
		</div>

		<!-- Current Status -->
		<div class="status-section">
			<h3 class="section-title">Current Status</h3>
			<div class="status-cards">
				<div class="status-card">
					<div class="status-icon speed">
						<Truck size={20} />
					</div>
					<div class="status-details">
						<span class="status-value">{currentSpeed} MPH</span>
						<span class="status-label">Current Speed</span>
					</div>
				</div>
				<div class="status-card">
					<div class="status-icon distance">
						<MapPin size={20} />
					</div>
					<div class="status-details">
						<span class="status-value">{distanceRemaining} mi</span>
						<span class="status-label">Distance Remaining</span>
					</div>
				</div>
				<div class="status-card">
					<div class="status-icon eta">
						<Clock size={20} />
					</div>
					<div class="status-details">
						<span class="status-value">{formatTime(estimatedArrival)}</span>
						<span class="status-label">Estimated Arrival</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Job Progress -->
		<div class="progress-section">
			<h3 class="section-title">Job Progress</h3>
			<div class="step-list">
				{#each jobSteps as step}
					<div class="step-item {step.id === currentStep ? 'active' : step.status}">
						<div class="step-indicator">
							{#if step.status === 'completed'}
								<CheckCircle size={16} />
							{:else if step.id === currentStep}
								<div class="active-dot"></div>
							{:else}
								<div class="pending-dot"></div>
							{/if}
						</div>
						<div class="step-details">
							<span class="step-label">{step.label}</span>
							<span class="step-eta">ETA: {step.eta}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Load Information -->
		<div class="load-section">
			<h3 class="section-title">Load Details</h3>
			<div class="load-info">
				<div class="load-item">
					<Gauge size={16} />
					<span class="load-label">Volume:</span>
					<span class="load-value">{job.estimatedBarrels} BBL</span>
				</div>
				<div class="load-item">
					<BarChart3 size={16} />
					<span class="load-label">Tank Level:</span>
					<span class="load-value">{job.tankLevelHeight || "17' 4\""}</span>
				</div>
				<div class="load-item">
					<MapPin size={16} />
					<span class="load-label">Tank:</span>
					<span class="load-value">{job.pickupLocation.tankNumber}</span>
				</div>
			</div>
		</div>

		<!-- Special Instructions -->
		{#if job.specialInstructions}
			<div class="instructions-section">
				<h3 class="section-title">Special Instructions</h3>
				<div class="instructions-card">
					<AlertCircle size={16} />
					<p>{job.specialInstructions}</p>
				</div>
			</div>
		{/if}

		<!-- Quick Actions -->
		<div class="actions-section">
			<h3 class="section-title">Quick Actions</h3>
			<div class="action-buttons">
				<button class="action-btn dispatch tap-target" on:click={callDispatch}>
					<Phone size={16} />
					<span>Call Dispatch</span>
				</button>
				<button class="action-btn customer tap-target" on:click={callEmergency}>
					<Phone size={16} />
					<span>Emergency Contact</span>
				</button>
				<button class="action-btn issue tap-target" on:click={reportIssue}>
					<AlertCircle size={16} />
					<span>Report Issue</span>
				</button>
				<button class="action-btn next tap-target" on:click={nextStep}>
					<CheckCircle size={16} />
					<span>Next Step</span>
				</button>
				<button class="action-btn transit tap-target" on:click={() => dispatch('start-transit', { job })}>
					<Truck size={16} />
					<span>Start Transit</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Right Panel - Interactive Map -->
	<div class="map-panel">
		<div class="map-container">
			<!-- Map Header with Navigation Controls -->
			<div class="map-header">
				<div class="route-info">
					<span class="route-distance">{job.distance} miles</span>
					<span class="route-time">{Math.round(job.estimatedDuration * 60)} min</span>
				</div>
				<div class="map-controls">
					<button class="map-btn tap-target" on:click={openNavigation} title="Open in Navigation App">
						<Navigation size={16} />
						<span class="btn-text">Navigate</span>
					</button>
				</div>
			</div>
			
			<!-- MapLibre GL Container -->
			<div class="map-gl-container" bind:this={mapContainer}></div>

			<!-- Navigation overlay -->
			<div class="nav-overlay">
				<div class="next-turn">
					<Navigation size={24} />
					<div class="turn-info">
						<span class="turn-distance">In 2.3 miles</span>
						<span class="turn-instruction">Continue on I-45 North</span>
					</div>
				</div>
			</div>

			<!-- Bottom route summary -->
			<div class="route-summary">
				<div class="route-step">
					<MapPin size={14} />
					<span>Current → Pickup</span>
					<span class="step-distance">{distanceRemaining} mi</span>
				</div>
				<div class="route-step">
					<MapPin size={14} />
					<span>Pickup → Delivery</span>
					<span class="step-distance">{job.distance} mi</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map-view-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #1a1a1a;
		display: flex;
		z-index: 2000;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	/* Left Panel - Job Info */
	.job-info-panel {
		width: 50%;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9f0 50%, #e8f5e8 100%);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.panel-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		padding: 16px 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 8px;
		color: #3b82f6;
		padding: 8px 12px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background: rgba(59, 130, 246, 0.2);
		transform: translateY(-1px);
	}

	.job-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 14px;
		color: #6b7280;
		font-weight: 600;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 12px 0;
	}

	/* Progress Section */
	.progress-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.step-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.step-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.step-item.active {
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	.step-item.completed {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.step-indicator {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.active-dot {
		width: 12px;
		height: 12px;
		background: #10b981;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	.pending-dot {
		width: 8px;
		height: 8px;
		background: #d1d5db;
		border-radius: 50%;
	}

	.step-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.step-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.step-eta {
		font-size: 12px;
		color: #6b7280;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Status Section */
	.status-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.status-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.status-card {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		text-align: center;
	}

	.status-icon {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
	}

	.status-icon.speed {
		background: linear-gradient(135deg, #059669, #10b981);
	}

	.status-icon.distance {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
	}

	.status-icon.eta {
		background: linear-gradient(135deg, #f59e0b, #f97316);
	}

	.status-value {
		font-size: 14px;
		font-weight: 700;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
	}

	.status-label {
		font-size: 11px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Load Section */
	.load-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.load-info {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.load-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 6px;
	}

	.load-item svg {
		color: #6b7280;
		flex-shrink: 0;
	}

	.load-label {
		font-size: 13px;
		color: #6b7280;
		min-width: 80px;
	}

	.load-value {
		font-size: 13px;
		font-weight: 600;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Instructions Section */
	.instructions-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.instructions-card {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		padding: 12px;
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: 8px;
	}

	.instructions-card svg {
		color: #f59e0b;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.instructions-card p {
		margin: 0;
		font-size: 13px;
		color: #92400e;
		line-height: 1.4;
	}

	/* Actions Section */
	.actions-section {
		padding: 20px;
		margin-top: auto;
	}

	.action-buttons {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-btn.dispatch {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.2);
		color: #dc2626;
	}

	.action-btn.customer {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.action-btn.issue {
		background: rgba(245, 158, 11, 0.1);
		border-color: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
	}

	.action-btn.next {
		background: rgba(16, 185, 129, 0.1);
		border-color: rgba(16, 185, 129, 0.2);
		color: #059669;
	}

	.action-btn.transit {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
	}

	.action-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	/* Right Panel - Map */
	.map-panel {
		width: 50%;
		background: #1a1a1a;
		position: relative;
	}

	.map-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.map-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		padding: 16px 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.route-info {
		display: flex;
		gap: 16px;
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
	}

	.route-distance {
		color: #059669;
	}

	.route-time {
		color: #3b82f6;
	}

	.map-controls {
		display: flex;
		gap: 8px;
	}

	.map-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 6px;
		color: #3b82f6;
		padding: 8px 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 13px;
		font-weight: 500;
	}

	.map-btn:hover {
		background: rgba(59, 130, 246, 0.2);
		transform: translateY(-1px);
	}

	.btn-text {
		font-size: 13px;
	}

	/* MapLibre GL Container */
	.map-gl-container {
		flex: 1;
		position: relative;
		min-height: 0;
	}

	/* Navigation overlay */
	.nav-overlay {
		position: absolute;
		top: 20px;
		left: 20px;
		right: 20px;
		z-index: 5;
		pointer-events: none;
	}

	.next-turn {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		pointer-events: auto;
	}

	.next-turn svg {
		color: #3b82f6;
		flex-shrink: 0;
	}

	.turn-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.turn-distance {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
	}

	.turn-instruction {
		font-size: 14px;
		font-weight: 600;
		color: #1e293b;
	}

	.route-summary {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		padding: 16px 20px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.route-step {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: #6b7280;
		margin-bottom: 4px;
	}

	.route-step:last-child {
		margin-bottom: 0;
	}

	.step-distance {
		margin-left: auto;
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
		color: #3b82f6;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.1);
			opacity: 0.8;
		}
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.map-view-container {
			flex-direction: column;
		}

		.job-info-panel,
		.map-panel {
			width: 100%;
			height: 50vh;
		}

		.status-cards {
			grid-template-columns: 1fr;
		}

		.action-buttons {
			grid-template-columns: 1fr;
		}

		.map-btn .btn-text {
			display: none;
		}
	}

	/* MapLibre GL Popup Customization */
	:global(.maplibregl-popup-content) {
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(0, 0, 0, 0.1);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	:global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip) {
		border-top-color: #ffffff;
	}

	:global(.maplibregl-popup-anchor-top .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-top-left .maplibregl-popup-tip),
	:global(.maplibregl-popup-anchor-top-right .maplibregl-popup-tip) {
		border-bottom-color: #ffffff;
	}

	:global(.maplibregl-ctrl-group) {
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	:global(.maplibregl-ctrl-group button) {
		border-radius: 4px;
	}
</style> 