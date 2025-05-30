<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		X, MapPin, Clock, Navigation, Phone, AlertCircle, 
		Gauge, Thermometer, Truck, CheckCircle, ArrowLeft, BarChart3 
	} from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let job: any; // Job details from parent

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
			</div>
		</div>
	</div>

	<!-- Right Panel - Map -->
	<div class="map-panel">
		<div class="map-container">
			<!-- Mock Google Maps Interface -->
			<div class="map-header">
				<div class="route-info">
					<span class="route-distance">{job.distance} miles</span>
					<span class="route-time">{Math.round(job.estimatedDuration * 60)} min</span>
				</div>
				<div class="map-controls">
					<button class="map-btn tap-target">
						<Navigation size={16} />
					</button>
				</div>
			</div>
			
			<div class="map-mockup">
				<!-- Mock map background -->
				<div class="map-background">
					<div class="route-line"></div>
					<div class="location-marker start" style="top: 70%; left: 20%;">
						<div class="marker-dot"></div>
						<span class="marker-label">Current Location</span>
					</div>
					<div class="location-marker pickup" style="top: 40%; left: 60%;">
						<div class="marker-dot pickup-marker"></div>
						<span class="marker-label">Pickup: {job.pickupLocation.name}</span>
					</div>
					<div class="location-marker delivery" style="top: 20%; left: 80%;">
						<div class="marker-dot delivery-marker"></div>
						<span class="marker-label">Delivery: {job.deliveryLocation.name}</span>
					</div>
				</div>
				
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

	.map-btn {
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 6px;
		color: #3b82f6;
		padding: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.map-mockup {
		flex: 1;
		position: relative;
		background: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), 
		            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), 
		            linear-gradient(45deg, transparent 75%, #e5e7eb 75%), 
		            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
		background-size: 20px 20px;
		background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
		background-color: #f3f4f6;
	}

	.map-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			radial-gradient(circle at 30% 60%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
			linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
	}

	.route-line {
		position: absolute;
		top: 70%;
		left: 20%;
		width: 65%;
		height: 2px;
		background: linear-gradient(45deg, #059669 0%, #3b82f6 100%);
		transform: rotate(-25deg);
		transform-origin: left center;
		border-radius: 1px;
	}

	.location-marker {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.marker-dot {
		width: 12px;
		height: 12px;
		background: #1e293b;
		border: 2px solid white;
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.pickup-marker {
		background: #059669;
	}

	.delivery-marker {
		background: #3b82f6;
	}

	.marker-label {
		font-size: 10px;
		font-weight: 500;
		color: #374151;
		background: rgba(255, 255, 255, 0.9);
		padding: 2px 6px;
		border-radius: 4px;
		white-space: nowrap;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.nav-overlay {
		position: absolute;
		top: 20px;
		left: 20px;
		right: 20px;
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
	}
</style> 