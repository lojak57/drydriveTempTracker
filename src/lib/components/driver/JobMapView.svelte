<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		X, Phone, AlertCircle, Navigation, ArrowLeft, 
		Gauge, BarChart3, MapPin, Truck
	} from 'lucide-svelte';
	
	// Import refactored components
	import MapRenderer from './job-map/MapRenderer.svelte';
	import JobStepsProgress from './job-map/JobStepsProgress.svelte';
	import JobMetrics from './job-map/JobMetrics.svelte';
	import { mapStore } from './job-map/stores/mapState';
	import { jobTrackingStore } from './job-map/stores/jobTracking';

	const dispatch = createEventDispatcher();

	export let job: any; // Job details from parent

	$: currentLocation = $mapStore.currentLocation;
	$: trackingState = $jobTrackingStore;

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

	function openNavigation() {
		const url = `https://maps.google.com/maps?daddr=${job.pickupLocation.coordinates.lat},${job.pickupLocation.coordinates.lng}`;
		window.open(url, '_blank');
	}

	function handleStepCompleted(event: CustomEvent) {
		dispatch('step-completed', event.detail);
	}

	function handleMapLoaded(event: CustomEvent) {
		dispatch('map-loaded', event.detail);
	}

	function handleMapError(event: CustomEvent) {
		dispatch('map-error', event.detail);
	}
</script>

<div class="map-view-container">
	<!-- Left Panel - Job Info -->
	<div class="job-info-panel">
		<!-- Header -->
		<div class="panel-header">
			<button class="back-btn tap-target" on:click={exitMapView}>
				<ArrowLeft size={16} />
				<span>Back to Dashboard</span>
			</button>
			<span class="job-id">Job #{job.id}</span>
		</div>

		<!-- Job Progress -->
		<JobStepsProgress 
			on:step-completed={handleStepCompleted}
		/>

		<!-- Live Metrics -->
		<JobMetrics {job} />

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
					<div class="route-badge primary">
						<span class="route-distance">{job.distance} miles</span>
						<span class="route-separator">•</span>
						<span class="route-time">{Math.round(job.estimatedDuration * 60)} min</span>
					</div>
					<div class="route-status">
						<span class="status-label">Route to Pickup</span>
						<span class="eta-info">ETA: {trackingState.estimatedArrival.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
					</div>
				</div>
				<div class="map-controls">
					<button class="map-btn tap-target" on:click={openNavigation} title="Open in Navigation App">
						<Navigation size={16} />
						<span class="btn-text">Navigate</span>
					</button>
				</div>
			</div>
			
			<!-- Map Renderer Component -->
			<MapRenderer 
				{job} 
				{currentLocation}
				on:map-loaded={handleMapLoaded}
				on:map-error={handleMapError}
			/>

			<!-- Enhanced Navigation overlay -->
			<div class="nav-overlay">
				<div class="next-turn">
					<div class="turn-icon">
						<Navigation size={20} />
					</div>
					<div class="turn-info">
						<span class="turn-distance">In 2.3 miles</span>
						<span class="turn-instruction">Continue on I-45 North toward Pickup</span>
					</div>
					<div class="turn-status">
						<span class="current-road">Currently on US-290 West</span>
					</div>
				</div>
			</div>

			<!-- Enhanced Bottom route summary -->
			<div class="route-summary">
				<div class="summary-header">
					<h4>Route Summary</h4>
					<span class="total-time">{Math.round((job.estimatedDuration + (trackingState.distanceRemaining / 45)) * 60)} min total</span>
				</div>
				<div class="route-steps">
					<div class="route-step active">
						<div class="step-indicator current"></div>
						<span class="step-label">Current → Pickup</span>
						<span class="step-distance">{trackingState.distanceRemaining} mi</span>
					</div>
					<div class="route-step planned">
						<div class="step-indicator planned"></div>
						<span class="step-label">Pickup → Delivery</span>
						<span class="step-distance">{job.distance} mi</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
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

	/* Load Section */
	.load-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.load-info {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.load-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
		background: white;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.load-item :global(svg) {
		color: #3b82f6;
	}

	.load-label {
		font-size: 14px;
		color: #64748b;
		font-weight: 500;
	}

	.load-value {
		font-size: 14px;
		color: #1e293b;
		font-weight: 600;
		margin-left: auto;
	}

	/* Instructions Section */
	.instructions-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.instructions-card {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: 12px;
	}

	.instructions-card :global(svg) {
		color: #f59e0b;
		margin-top: 2px;
		flex-shrink: 0;
	}

	.instructions-card p {
		margin: 0;
		font-size: 14px;
		color: #1e293b;
		line-height: 1.5;
	}

	/* Actions Section */
	.actions-section {
		padding: 20px;
		margin-top: auto;
	}

	.action-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px;
		border: none;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-btn.dispatch {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
	}

	.action-btn.customer {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
		color: white;
	}

	.action-btn.issue {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
	}

	.action-btn.transit {
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
		color: white;
		grid-column: 1 / -1;
	}

	.action-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	/* Right Panel - Map */
	.map-panel {
		width: 50%;
		position: relative;
		background: #1a1a1a;
	}

	.map-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.map-header {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		padding: 16px 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 1000;
	}

	.route-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.route-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 600;
	}

	.route-badge.primary {
		color: #3b82f6;
	}

	.route-separator {
		color: #cbd5e1;
	}

	.route-status {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;
	}

	.status-label {
		color: #64748b;
		font-weight: 500;
	}

	.eta-info {
		color: #3b82f6;
		font-weight: 600;
	}

	.map-controls {
		display: flex;
		gap: 8px;
	}

	.map-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.map-btn:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	/* Navigation Overlay */
	.nav-overlay {
		position: absolute;
		top: 80px;
		left: 20px;
		right: 20px;
		z-index: 1000;
	}

	.next-turn {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 12px;
		padding: 16px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.turn-icon {
		width: 40px;
		height: 40px;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.turn-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.turn-distance {
		font-size: 12px;
		color: #3b82f6;
		font-weight: 600;
	}

	.turn-instruction {
		font-size: 14px;
		color: #1e293b;
		font-weight: 600;
		line-height: 1.2;
	}

	.turn-status {
		font-size: 11px;
		color: #64748b;
		font-weight: 500;
	}

	.current-road {
		font-style: italic;
	}

	/* Route Summary */
	.route-summary {
		position: absolute;
		bottom: 20px;
		left: 20px;
		right: 20px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 12px;
		padding: 16px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		z-index: 1000;
	}

	.summary-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.summary-header h4 {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: #1e293b;
	}

	.total-time {
		font-size: 12px;
		color: #3b82f6;
		font-weight: 600;
	}

	.route-steps {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.route-step {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
	}

	.step-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.step-indicator.current {
		background: #059669;
	}

	.step-indicator.planned {
		background: #3b82f6;
	}

	.step-label {
		flex: 1;
		color: #64748b;
		font-weight: 500;
	}

	.step-distance {
		color: #1e293b;
		font-weight: 600;
	}

	.route-step.active .step-label,
	.route-step.active .step-distance {
		color: #059669;
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

		.action-buttons {
			grid-template-columns: 1fr;
		}

		.action-btn.transit {
			grid-column: 1;
		}
	}
</style> 