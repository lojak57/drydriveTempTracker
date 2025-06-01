<script lang="ts">
	import { Radio, Truck, Users, Clock, MapPin, AlertTriangle, Settings, Phone } from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';
	import maplibregl from 'maplibre-gl';

	// TypeScript interfaces
	interface Driver {
		id: string;
		name: string;
		hoursRemaining: number;
		status: string;
		lastLocation: string;
	}

	interface UnavailableDriver {
		id: string;
		name: string;
		reason: string;
		returnDate: string;
	}

	interface Route {
		id: string;
		driver: string;
		truck: string;
		route: string;
		status: string;
		eta: string;
		currentJob: string;
	}

	interface MapTruck {
		id: string;
		driver: string;
		lat: number;
		lng: number;
		currentJob: string;
		eta: string;
		status: string;
	}

	interface Assignment {
		id: string;
		route: string;
		priority: string;
		pickupTime: string;
		estimatedDuration: string;
	}

	// Mock data for dispatch operations
	let availableDrivers: Driver[] = [
		{ id: 'D001', name: 'Mike Rodriguez', hoursRemaining: 8.5, status: 'available', lastLocation: 'Houston Yard' },
		{ id: 'D002', name: 'Sarah Chen', hoursRemaining: 6.2, status: 'available', lastLocation: 'Dallas Hub' },
		{ id: 'D003', name: 'James Wilson', hoursRemaining: 4.8, status: 'available', lastLocation: 'Austin Terminal' },
		{ id: 'D004', name: 'Maria Garcia', hoursRemaining: 7.1, status: 'available', lastLocation: 'San Antonio Base' }
	];

	let unavailableDrivers: UnavailableDriver[] = [
		{ id: 'D005', name: 'David Thompson', reason: 'Sick Leave', returnDate: '2024-01-18' },
		{ id: 'D006', name: 'Lisa Brown', reason: 'Vacation', returnDate: '2024-01-22' },
		{ id: 'D007', name: 'Robert Kim', reason: 'Hours Exhausted', returnDate: '2024-01-16' }
	];

	let truckStatus = {
		available: 23,
		inMaintenance: 4,
		total: 27
	};

	let activeRoutes: Route[] = [
		{ 
			id: 'R001', 
			driver: 'Carlos Martinez', 
			truck: 'T-156', 
			route: 'Eagle Ford → Port Arthur',
			status: 'en-route',
			eta: '14:30',
			currentJob: 'Pickup'
		},
		{ 
			id: 'R002', 
			driver: 'Amanda Johnson', 
			truck: 'T-203', 
			route: 'Permian Basin → Houston Ship Channel',
			status: 'loading',
			eta: '16:45',
			currentJob: 'Loading'
		},
		{ 
			id: 'R003', 
			driver: 'Tony Valdez', 
			truck: 'T-089', 
			route: 'Bakken → Cushing Hub',
			status: 'delivery',
			eta: '12:15',
			currentJob: 'Delivery'
		}
	];

	let mapTrucks: MapTruck[] = [
		{ 
			id: 'T-156', 
			driver: 'Carlos Martinez', 
			lat: 29.7604, 
			lng: -95.3698, 
			currentJob: 'Pickup at Eagle Ford',
			eta: '14:30',
			status: 'en-route'
		},
		{ 
			id: 'T-203', 
			driver: 'Amanda Johnson', 
			lat: 29.4241, 
			lng: -98.4936, 
			currentJob: 'Loading at Permian Basin',
			eta: '16:45',
			status: 'loading'
		},
		{ 
			id: 'T-089', 
			driver: 'Tony Valdez', 
			lat: 30.2672, 
			lng: -97.7431, 
			currentJob: 'Delivery to Cushing Hub',
			eta: '12:15',
			status: 'delivery'
		},
		{ 
			id: 'T-234', 
			driver: 'Rachel Foster', 
			lat: 32.7767, 
			lng: -96.7970, 
			currentJob: 'En route to pickup',
			eta: '15:20',
			status: 'en-route'
		},
		{ 
			id: 'T-167', 
			driver: 'Mark Stevens', 
			lat: 29.3013, 
			lng: -94.7977, 
			currentJob: 'Offloading at destination',
			eta: '13:45',
			status: 'delivery'
		}
	];

	let pendingAssignments: Assignment[] = [
		{ 
			id: 'PA001', 
			route: 'Midland → Beaumont Refinery', 
			priority: 'high',
			pickupTime: '08:00',
			estimatedDuration: '6.5h'
		},
		{ 
			id: 'PA002', 
			route: 'Odessa → Louisiana Terminal', 
			priority: 'normal',
			pickupTime: '10:30',
			estimatedDuration: '5.2h'
		}
	];

	// State for driver assignment
	let showAssignmentModal = false;
	let selectedAssignment: Assignment | null = null;
	let selectedDriver = '';

	// Map state
	let mapContainer: HTMLDivElement;
	let map: maplibregl.Map | null = null;
	let hoveredTruck: MapTruck | null = null;

	// Initialize map on mount
	onMount(() => {
		if (mapContainer) {
			initializeMap();
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});

	function initializeMap() {
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
			center: [-97.7431, 30.2672], // Center on Texas
			zoom: 6,
			attributionControl: false
		});

		// Add navigation controls
		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		// Add truck markers when map loads
		map.on('load', () => {
			addTruckMarkers();
		});
	}

	function addTruckMarkers() {
		if (!map) return;

		mapTrucks.forEach((truck) => {
			// Create a custom marker element
			const markerElement = document.createElement('div');
			markerElement.className = 'truck-marker-element';
			markerElement.style.cssText = `
				width: 24px;
				height: 24px;
				border-radius: 50%;
				background-color: ${getStatusColor(truck.status)};
				border: 2px solid white;
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				color: white;
				font-size: 12px;
				font-weight: bold;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
				transition: all 0.2s ease;
			`;
			markerElement.innerHTML = '🚛';

			// Create marker with popup
			const marker = new maplibregl.Marker({
				element: markerElement
			})
			.setLngLat([truck.lng, truck.lat])
			.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
				<div style="text-align: center; padding: 12px; min-width: 180px;">
					<div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
						<strong style="color: #1e293b;">${truck.id}</strong>
						<span style="color: #64748b; font-size: 12px;">${truck.driver}</span>
					</div>
					<div style="margin-bottom: 6px; color: #475569; font-size: 13px;">${truck.currentJob}</div>
					<div style="color: #059669; font-weight: 600; font-size: 12px;">ETA: ${truck.eta}</div>
				</div>
			`))
			.addTo(map!);

			// Add hover effects
			markerElement.addEventListener('mouseenter', () => {
				markerElement.style.transform = 'scale(1.2)';
				hoveredTruck = truck;
			});

			markerElement.addEventListener('mouseleave', () => {
				markerElement.style.transform = 'scale(1)';
				hoveredTruck = null;
			});
		});

		// Fit map to show all trucks
		if (mapTrucks.length > 0) {
			const bounds = new maplibregl.LngLatBounds();
			mapTrucks.forEach(truck => {
				bounds.extend([truck.lng, truck.lat]);
			});
			
			map.fitBounds(bounds, {
				padding: 50,
				maxZoom: 10
			});
		}
	}

	function openAssignment(assignment: Assignment) {
		selectedAssignment = assignment;
		showAssignmentModal = true;
	}

	function assignDriver() {
		if (selectedDriver && selectedAssignment) {
			// Remove from pending
			pendingAssignments = pendingAssignments.filter(p => p.id !== selectedAssignment!.id);
			
			// Find driver and update status
			const driver = availableDrivers.find(d => d.id === selectedDriver);
			if (driver) {
				// Add to active routes
				activeRoutes = [...activeRoutes, {
					id: 'R' + (Date.now().toString().slice(-3)),
					driver: driver.name,
					truck: 'T-' + Math.floor(Math.random() * 999).toString().padStart(3, '0'),
					route: selectedAssignment.route,
					status: 'assigned',
					eta: 'TBD',
					currentJob: 'Assigned'
				}];

				// Remove from available drivers
				availableDrivers = availableDrivers.filter(d => d.id !== selectedDriver);
			}
		}
		
		showAssignmentModal = false;
		selectedAssignment = null;
		selectedDriver = '';
	}

	function cancelAssignment() {
		showAssignmentModal = false;
		selectedAssignment = null;
		selectedDriver = '';
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'en-route': return '#3B82F6';
			case 'loading': return '#F59E0B';
			case 'delivery': return '#10B981';
			case 'assigned': return '#8B5CF6';
			default: return '#6B7280';
		}
	}
</script>

<svelte:head>
	<title>Dispatch Center - Oil Field Temp Tracker</title>
</svelte:head>

<div class="dispatch-center">
	<!-- Header -->
	<div class="dispatch-header">
		<div class="header-content">
			<div class="header-icon">
				<Radio size={28} />
			</div>
			<div class="header-text">
				<h1>Dispatch Operations Center</h1>
				<p>Real-time fleet coordination and route management</p>
			</div>
			<div class="header-actions">
				<button class="emergency-btn">
					<Phone size={16} />
					Emergency Contact
				</button>
			</div>
		</div>
	</div>

	<!-- Main Content: Two-Pane Layout -->
	<div class="dispatch-layout">
		<!-- Left Pane: Dispatch Snapshot -->
		<div class="dispatch-snapshot">
			<!-- Available Drivers -->
			<div class="snapshot-card">
				<div class="card-header">
					<div class="card-title">
						<Users size={20} />
						Available Drivers
					</div>
					<div class="driver-count">{availableDrivers.length}</div>
				</div>
				<div class="driver-list">
					{#each availableDrivers as driver}
						<div class="driver-item">
							<div class="driver-info">
								<span class="driver-name">{driver.name}</span>
								<span class="driver-location">{driver.lastLocation}</span>
							</div>
							<div class="driver-hours">
								<span class="hours-remaining">{driver.hoursRemaining}h</span>
								<span class="hours-label">remaining</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Unavailable Drivers -->
			<div class="snapshot-card">
				<div class="card-header">
					<div class="card-title">
						<AlertTriangle size={20} />
						Out of Service
					</div>
					<div class="driver-count unavailable">{unavailableDrivers.length}</div>
				</div>
				<div class="unavailable-list">
					{#each unavailableDrivers as driver}
						<div class="unavailable-item">
							<div class="unavailable-info">
								<span class="driver-name">{driver.name}</span>
								<span class="unavailable-reason">{driver.reason}</span>
							</div>
							<div class="return-date">Returns {driver.returnDate}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Truck Status -->
			<div class="snapshot-card">
				<div class="card-header">
					<div class="card-title">
						<Truck size={20} />
						Fleet Status
					</div>
				</div>
				<div class="truck-status">
					<div class="status-item available">
						<span class="status-number">{truckStatus.available}</span>
						<span class="status-label">Available</span>
					</div>
					<div class="status-item maintenance">
						<span class="status-number">{truckStatus.inMaintenance}</span>
						<span class="status-label">Maintenance</span>
					</div>
					<div class="status-item total">
						<span class="status-number">{truckStatus.total}</span>
						<span class="status-label">Total Fleet</span>
					</div>
				</div>
			</div>

			<!-- Active Routes -->
			<div class="snapshot-card">
				<div class="card-header">
					<div class="card-title">
						<MapPin size={20} />
						Active Routes
					</div>
					<div class="route-count">{activeRoutes.length}</div>
				</div>
				<div class="routes-list">
					{#each activeRoutes as route}
						<div class="route-item">
							<div class="route-info">
								<span class="route-id">{route.truck}</span>
								<span class="driver-name">{route.driver}</span>
								<span class="route-path">{route.route}</span>
							</div>
							<div class="route-status">
								<span class="status-badge {route.status}">{route.currentJob}</span>
								<span class="eta">ETA: {route.eta}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Pending Assignments -->
			<div class="snapshot-card">
				<div class="card-header">
					<div class="card-title">
						<Clock size={20} />
						Pending Assignments
					</div>
					<div class="assignment-count">{pendingAssignments.length}</div>
				</div>
				<div class="assignments-list">
					{#each pendingAssignments as assignment}
						<div class="assignment-item">
							<div class="assignment-info">
								<span class="assignment-route">{assignment.route}</span>
								<span class="assignment-details">
									Pickup: {assignment.pickupTime} • Duration: {assignment.estimatedDuration}
								</span>
							</div>
							<div class="assignment-actions">
								<span class="priority-badge {assignment.priority}">{assignment.priority.toUpperCase()}</span>
								<button class="assign-btn" on:click={() => openAssignment(assignment)}>
									Assign Driver
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Right Pane: Interactive Map -->
		<div class="map-container">
			<div class="map-header">
				<h3>Live Fleet Tracking</h3>
				<div class="map-legend">
					<div class="legend-item">
						<div class="legend-dot en-route"></div>
						<span>En Route</span>
					</div>
					<div class="legend-item">
						<div class="legend-dot loading"></div>
						<span>Loading</span>
					</div>
					<div class="legend-item">
						<div class="legend-dot delivery"></div>
						<span>Delivery</span>
					</div>
				</div>
			</div>
			
			<div class="map-view">
				<!-- MapLibre GL Container -->
				<div class="map-gl-container" bind:this={mapContainer}></div>
			</div>
		</div>
	</div>

	<!-- Driver Assignment Modal -->
	{#if showAssignmentModal}
		<div class="modal-overlay" on:click={cancelAssignment}>
			<div class="assignment-modal" on:click|stopPropagation>
				<div class="modal-header">
					<h3>Assign Driver to Route</h3>
					<button class="close-btn" on:click={cancelAssignment}>×</button>
				</div>
				
				<div class="modal-content">
					<div class="assignment-details">
						<h4>Route Details</h4>
						<p><strong>Route:</strong> {selectedAssignment?.route}</p>
						<p><strong>Pickup Time:</strong> {selectedAssignment?.pickupTime}</p>
						<p><strong>Duration:</strong> {selectedAssignment?.estimatedDuration}</p>
						<p><strong>Priority:</strong> <span class="priority-badge {selectedAssignment?.priority}">{selectedAssignment?.priority.toUpperCase()}</span></p>
					</div>
					
					<div class="driver-selection">
						<h4>Select Available Driver</h4>
						<div class="driver-options">
							{#each availableDrivers as driver}
								<label class="driver-option">
									<input type="radio" bind:group={selectedDriver} value={driver.id} />
									<div class="driver-card">
										<span class="driver-name">{driver.name}</span>
										<span class="driver-hours">{driver.hoursRemaining}h remaining</span>
										<span class="driver-location">{driver.lastLocation}</span>
									</div>
								</label>
							{/each}
						</div>
					</div>
				</div>
				
				<div class="modal-actions">
					<button class="cancel-btn" on:click={cancelAssignment}>Cancel</button>
					<button class="confirm-btn" on:click={assignDriver} disabled={!selectedDriver}>
						Assign Driver
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.dispatch-center {
		min-height: 100vh;
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
		display: flex;
		flex-direction: column;
	}

	.dispatch-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		margin: 20px;
		padding: 24px 32px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-icon {
		padding: 12px;
		background: linear-gradient(135deg, #475569 0%, #334155 100%);
		border-radius: 12px;
		color: white;
		margin-right: 16px;
	}

	.header-text h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 4px 0;
	}

	.header-text p {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.emergency-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.emergency-btn:hover {
		background: #dc2626;
		transform: translateY(-1px);
	}

	.dispatch-layout {
		display: flex;
		flex: 1;
		gap: 20px;
		padding: 0 20px 20px 20px;
		overflow: hidden;
	}

	/* Left Pane: Dispatch Snapshot */
	.dispatch-snapshot {
		width: 400px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
		max-height: calc(100vh - 140px);
	}

	.snapshot-card {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid #e2e8f0;
	}

	.card-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		color: #1e293b;
	}

	.driver-count, .route-count, .assignment-count {
		background: #475569;
		color: white;
		padding: 4px 12px;
		border-radius: 12px;
		font-weight: 600;
		font-size: 14px;
	}

	.driver-count.unavailable {
		background: #ef4444;
	}

	/* Driver Lists */
	.driver-list, .unavailable-list, .routes-list, .assignments-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.driver-item, .unavailable-item, .route-item, .assignment-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px;
		background: #f8fafc;
		border-radius: 8px;
		border-left: 3px solid #475569;
	}

	.driver-name {
		font-weight: 600;
		color: #1e293b;
		display: block;
	}

	.driver-location, .unavailable-reason {
		font-size: 12px;
		color: #64748b;
	}

	.hours-remaining {
		font-weight: 700;
		color: #059669;
	}

	.hours-label {
		font-size: 12px;
		color: #64748b;
	}

	.return-date {
		font-size: 12px;
		color: #ef4444;
		font-weight: 500;
	}

	/* Truck Status */
	.truck-status {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 16px;
	}

	.status-item {
		text-align: center;
		padding: 16px 8px;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.status-item.available {
		background: #f0fdf4;
		border-color: #bbf7d0;
	}

	.status-item.maintenance {
		background: #fefce8;
		border-color: #fde047;
	}

	.status-item.total {
		background: #f1f5f9;
		border-color: #cbd5e1;
	}

	.status-number {
		display: block;
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
	}

	.status-label {
		font-size: 12px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Route Items */
	.route-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.route-id {
		font-weight: 700;
		color: #1e293b;
		font-size: 14px;
	}

	.route-path {
		font-size: 12px;
		color: #64748b;
	}

	.route-status {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
	}

	.status-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.en-route {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.status-badge.loading {
		background: #fef3c7;
		color: #d97706;
	}

	.status-badge.delivery {
		background: #d1fae5;
		color: #059669;
	}

	.status-badge.assigned {
		background: #ede9fe;
		color: #7c3aed;
	}

	.eta {
		font-size: 12px;
		color: #64748b;
		font-weight: 500;
	}

	/* Assignment Items */
	.assignment-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.assignment-route {
		font-weight: 600;
		color: #1e293b;
	}

	.assignment-details {
		font-size: 12px;
		color: #64748b;
	}

	.assignment-actions {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
	}

	.priority-badge {
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.priority-badge.high {
		background: #fecaca;
		color: #dc2626;
	}

	.priority-badge.normal {
		background: #e5e7eb;
		color: #374151;
	}

	.assign-btn {
		padding: 6px 12px;
		background: #475569;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.assign-btn:hover {
		background: #334155;
		transform: translateY(-1px);
	}

	/* Right Pane: Map */
	.map-container {
		flex: 1;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.map-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		border-bottom: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	.map-header h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.map-legend {
		display: flex;
		gap: 16px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: #64748b;
	}

	.legend-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.legend-dot.en-route {
		background: #3B82F6;
	}

	.legend-dot.loading {
		background: #F59E0B;
	}

	.legend-dot.delivery {
		background: #10B981;
	}

	.map-view {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.map-gl-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #f5f5f5;
	}

	/* MapLibre GL Popup Styling */
	:global(.maplibregl-popup) {
		max-width: 200px;
	}

	:global(.maplibregl-popup-content) {
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 0;
	}

	:global(.maplibregl-marker) {
		cursor: pointer;
	}

	/* Assignment Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.assignment-modal {
		background: white;
		border-radius: 16px;
		width: 90%;
		max-width: 600px;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24px;
		border-bottom: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	.modal-header h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #64748b;
		padding: 4px;
	}

	.modal-content {
		padding: 24px;
		max-height: 60vh;
		overflow-y: auto;
	}

	.assignment-details, .driver-selection {
		margin-bottom: 24px;
	}

	.assignment-details h4, .driver-selection h4 {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 12px 0;
	}

	.assignment-details p {
		margin: 8px 0;
		color: #64748b;
	}

	.driver-options {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.driver-option {
		display: block;
		cursor: pointer;
	}

	.driver-option input {
		display: none;
	}

	.driver-card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.driver-option:has(input:checked) .driver-card {
		border-color: #475569;
		background: #f8fafc;
	}

	.driver-card:hover {
		border-color: #94a3b8;
	}

	.driver-hours, .driver-location {
		font-size: 12px;
		color: #64748b;
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
		padding: 24px;
		border-top: 1px solid #e2e8f0;
		background: #f8fafc;
	}

	.cancel-btn, .confirm-btn {
		padding: 12px 24px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-btn {
		background: #f1f5f9;
		color: #64748b;
		border: 1px solid #e2e8f0;
	}

	.confirm-btn {
		background: #475569;
		color: white;
		border: none;
	}

	.confirm-btn:disabled {
		background: #94a3b8;
		cursor: not-allowed;
	}

	.confirm-btn:not(:disabled):hover {
		background: #334155;
		transform: translateY(-1px);
	}

	/* Mobile Responsiveness */
	@media (max-width: 1024px) {
		.dispatch-layout {
			flex-direction: column;
		}

		.dispatch-snapshot {
			width: 100%;
			max-height: 400px;
		}

		.truck-status {
			grid-template-columns: 1fr 1fr;
		}

		.header-content {
			flex-direction: column;
			gap: 16px;
			text-align: center;
		}
	}

	@media (max-width: 768px) {
		.dispatch-center {
			padding: 0;
		}

		.dispatch-header {
			margin: 12px;
			padding: 20px;
		}

		.header-text h1 {
			font-size: 24px;
		}

		.dispatch-layout {
			padding: 0 12px 12px 12px;
		}

		.snapshot-card {
			padding: 16px;
		}

		.assignment-modal {
			width: 95%;
			margin: 20px;
		}

		.modal-content {
			padding: 16px;
		}

		.truck-status {
			grid-template-columns: 1fr;
		}
	}
</style> 