<script lang="ts">
	import { Radio, Truck, Users, Clock, MapPin, AlertTriangle, Settings, Phone } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import CollapsibleSection from '$lib/components/ui/CollapsibleSection.svelte';
	import FleetTrackingMap from '$lib/components/dispatch/FleetTrackingMap.svelte';

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

	// Section state management
	let sectionStates: Record<string, boolean> = {
		pendingAssignments: true,  // Always open if pending > 0
		availableDrivers: true,    // Default open 
		activeRoutes: true,        // Default open
		outOfService: false,       // Default collapsed
		fleetStatus: false         // Default collapsed
	};

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
		},
		{ 
			id: 'PA003', 
			route: 'Corpus Christi → Galveston Port', 
			priority: 'high',
			pickupTime: '06:30',
			estimatedDuration: '4.5h'
		}
	];

	// State for driver assignment
	let showAssignmentModal = false;
	let selectedAssignment: Assignment | null = null;
	let selectedDriver = '';

	// Map state
	let showFullscreenMap = false;

	// Reactive statements
	$: pendingCount = pendingAssignments.length;
	$: hasPendingAssignments = pendingCount > 0;
	
	// Auto-open pending assignments if count > 0
	$: if (hasPendingAssignments) {
		sectionStates.pendingAssignments = true;
	}

	// Handle section toggle events
	function handleSectionToggle(event: CustomEvent, sectionKey: string) {
		const { isOpen } = event.detail;
		sectionStates[sectionKey] = isOpen;
	}

	// Initialize map on mount
	onMount(() => {
		// Update pending assignments count
		pendingCount = pendingAssignments.length;
	});

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
	<div class="dispatch-header bg-slate-800 text-white">
		<div class="header-content">
			<div class="header-text">
				<h1 class="header-title text-xl font-semibold">Dispatch Operations Center</h1>
				<p class="header-subtitle text-slate-300">Real-time fleet coordination and route management</p>
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
		<!-- Left Pane: Dispatch Snapshot - Hidden to give map full width -->
		<div class="dispatch-snapshot">
			<!-- 🚨 PENDING ASSIGNMENTS - Moved to Top -->
			<CollapsibleSection 
				title="🚨 Pending Assignments"
				count={pendingCount}
				icon={Clock}
				defaultOpen={sectionStates.pendingAssignments}
				highlight={true}
				flashIf={hasPendingAssignments}
				urgent={true}
				on:toggle={(e) => handleSectionToggle(e, 'pendingAssignments')}
			>
				<div class="assignments-list p-4">
					{#each pendingAssignments as assignment}
						<div class="assignment-item mb-4 p-4 border border-slate-200 rounded-lg last:mb-0">
							<div class="assignment-info mb-2">
								<span class="assignment-route font-semibold text-slate-800 block">{assignment.route}</span>
								<span class="assignment-details text-sm text-slate-600">
									Pickup: {assignment.pickupTime} • Duration: {assignment.estimatedDuration}
								</span>
							</div>
							<div class="assignment-actions flex items-center justify-between">
								<span class="priority-badge {assignment.priority} px-2 py-1 rounded text-xs font-semibold uppercase">
									{assignment.priority}
								</span>
								<button class="assign-btn px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
										on:click={() => openAssignment(assignment)}>
									Assign Driver
								</button>
							</div>
						</div>
					{/each}
				</div>
			</CollapsibleSection>

			<!-- AVAILABLE DRIVERS -->
			<CollapsibleSection 
				title="Available Drivers"
				count={availableDrivers.length}
				icon={Users}
				defaultOpen={sectionStates.availableDrivers}
				on:toggle={(e) => handleSectionToggle(e, 'availableDrivers')}
			>
				<div class="driver-list p-4">
					{#each availableDrivers as driver}
						<div class="driver-item flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0">
							<div class="driver-info">
								<span class="driver-name font-medium text-slate-800 block">{driver.name}</span>
								<span class="driver-location text-sm text-slate-600">{driver.lastLocation}</span>
							</div>
							<div class="driver-hours text-right">
								<span class="hours-remaining font-semibold text-green-600">{driver.hoursRemaining}h</span>
								<span class="hours-label text-xs text-slate-500 block">remaining</span>
							</div>
						</div>
					{/each}
				</div>
			</CollapsibleSection>

			<!-- ACTIVE ROUTES -->
			<CollapsibleSection 
				title="Active Routes"
				count={activeRoutes.length}
				icon={MapPin}
				defaultOpen={sectionStates.activeRoutes}
				on:toggle={(e) => handleSectionToggle(e, 'activeRoutes')}
			>
				<div class="routes-list p-4">
					{#each activeRoutes as route}
						<div class="route-item mb-3 p-3 border border-slate-200 rounded-lg last:mb-0">
							<div class="route-info mb-2">
								<div class="flex items-center justify-between">
									<span class="route-id font-semibold text-slate-800">{route.truck}</span>
									<span class="status-badge {route.status} px-2 py-1 rounded text-xs font-medium">
										{route.currentJob}
									</span>
								</div>
								<span class="driver-name text-sm text-slate-600">{route.driver}</span>
								<span class="route-path text-sm text-slate-700 block">{route.route}</span>
							</div>
							<div class="route-status">
								<span class="eta text-xs text-slate-500">ETA: {route.eta}</span>
							</div>
						</div>
					{/each}
				</div>
			</CollapsibleSection>

			<!-- FLEET STATUS -->
			<CollapsibleSection 
				title="Fleet Status"
				count={truckStatus.total}
				icon={Truck}
				defaultOpen={sectionStates.fleetStatus}
				on:toggle={(e) => handleSectionToggle(e, 'fleetStatus')}
			>
				<div class="truck-status grid grid-cols-3 gap-4 p-4">
					<div class="status-item available text-center p-3 bg-green-50 rounded-lg">
						<span class="status-number text-xl font-bold text-green-600 block">{truckStatus.available}</span>
						<span class="status-label text-sm text-green-700">Available</span>
					</div>
					<div class="status-item maintenance text-center p-3 bg-orange-50 rounded-lg">
						<span class="status-number text-xl font-bold text-orange-600 block">{truckStatus.inMaintenance}</span>
						<span class="status-label text-sm text-orange-700">Maintenance</span>
					</div>
					<div class="status-item total text-center p-3 bg-slate-50 rounded-lg">
						<span class="status-number text-xl font-bold text-slate-600 block">{truckStatus.total}</span>
						<span class="status-label text-sm text-slate-700">Total Fleet</span>
					</div>
				</div>
			</CollapsibleSection>

			<!-- OUT OF SERVICE -->
			<CollapsibleSection 
				title="Out of Service"
				count={unavailableDrivers.length}
				icon={AlertTriangle}
				defaultOpen={sectionStates.outOfService}
				on:toggle={(e) => handleSectionToggle(e, 'outOfService')}
			>
				<div class="unavailable-list p-4">
					{#each unavailableDrivers as driver}
						<div class="unavailable-item flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0">
							<div class="unavailable-info">
								<span class="driver-name font-medium text-slate-800 block">{driver.name}</span>
								<span class="unavailable-reason text-sm text-red-600">{driver.reason}</span>
							</div>
							<div class="return-date text-sm text-slate-500">Returns {driver.returnDate}</div>
						</div>
					{/each}
				</div>
			</CollapsibleSection>

		</div>

		<!-- Right Pane: Interactive Map -->
		<div class="map-container">
			<div class="map-header">
				<h3>Live Fleet Tracking - Full View</h3>
				<div class="map-status">
					<div class="status-indicator">
						<span class="status-dot active"></span>
						<span class="status-text">Real-time Tracking Active</span>
					</div>
				</div>
			</div>
			
			<div class="map-view">
				<FleetTrackingMap 
					bind:showFullscreen={showFullscreenMap}
					autoUpdate={true}
					trackingMode="active"
					on:map-ready={(e: CustomEvent) => console.log('Fleet tracking map ready:', e.detail)}
					on:fullscreen-toggle={(e: CustomEvent) => console.log('Fullscreen toggled:', e.detail)}
				/>
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
		border-radius: 16px;
		margin: 20px;
		padding: 24px 32px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-text h1 {
		margin: 0 0 4px 0;
	}

	.header-text p {
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

	/* Left Pane: Dispatch Snapshot - Hidden to give map full width */
	.dispatch-snapshot {
		display: none; /* Hide sidebar to give map full width */
		width: 400px;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
		max-height: calc(100vh - 140px);
	}

	/* Show dispatch snapshot only on mobile for collapsible access */
	@media (max-width: 1024px) {
		.dispatch-snapshot {
			display: flex; /* Show on mobile for better UX */
			width: 100%;
			max-height: 300px; /* Reduce height on mobile */
		}
	}

	/* Priority Badge Styles */
	.priority-badge.high {
		background: #fecaca;
		color: #dc2626;
		border: 1px solid #fca5a5;
	}
	
	.priority-badge.normal {
		background: #e0e7ff;
		color: #3730a3;
		border: 1px solid #c7d2fe;
	}
	
	.priority-badge.low {
		background: #f3f4f6;
		color: #6b7280;
		border: 1px solid #e5e7eb;
	}

	/* Status Badge Styles */
	.status-badge.en-route {
		background: #dbeafe;
		color: #1e40af;
	}
	
	.status-badge.loading {
		background: #fef3c7;
		color: #d97706;
	}
	
	.status-badge.delivery {
		background: #dcfce7;
		color: #16a34a;
	}
	
	.status-badge.assigned {
		background: #ede9fe;
		color: #7c3aed;
	}

	/* Right Pane: Map Container */
	.map-container {
		flex: 1;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		min-height: calc(100vh - 180px); /* Ensure good height */
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

	.map-status {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.status-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.status-dot.active {
		background-color: #10B981;
	}

	.status-text {
		font-size: 12px;
		color: #64748b;
	}

	.map-view {
		flex: 1;
		position: relative;
		overflow: hidden;
		height: calc(100vh - 240px); /* Give map more breathing room */
		min-height: 500px; /* Minimum height for usability */
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
			gap: 16px;
		}

		.dispatch-snapshot {
			display: flex; /* Show on mobile for better UX */
			width: 100%;
			max-height: 300px; /* Reduce height on mobile */
		}

		.map-container {
			min-height: calc(100vh - 400px); /* Adjust for mobile layout */
		}

		.map-view {
			height: calc(100vh - 460px); /* Adjust for mobile header and controls */
			min-height: 400px;
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

		.map-view {
			height: calc(100vh - 480px); /* Further adjust for smaller screens */
			min-height: 350px;
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