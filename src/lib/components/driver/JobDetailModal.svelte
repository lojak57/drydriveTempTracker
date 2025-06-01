<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		X, MapPin, Clock, Gauge, Phone, AlertCircle, 
		Thermometer, Shield, FileText, User, Truck, CheckCircle, Database, BarChart3 
	} from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let job: any; // ScheduledJob type from parent
	export let isOpen = false;

	// Current location mock - would come from GPS in production
	let currentLocation = {
		lat: 29.7604,
		lng: -95.3698,
		address: 'Houston Dispatch Yard'
	};

	// Calculate distance to pickup location
	function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
		const R = 3959; // Earth's radius in miles
		const dLat = (lat2 - lat1) * (Math.PI / 180);
		const dLng = (lng2 - lng1) * (Math.PI / 180);
		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
			Math.sin(dLng / 2) * Math.sin(dLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	$: distanceToPickup = job ? calculateDistance(
		currentLocation.lat, 
		currentLocation.lng, 
		job.pickupLocation.coordinates.lat, 
		job.pickupLocation.coordinates.lng
	) : 0;

	$: estimatedTravelTime = Math.round((distanceToPickup / 45) * 60); // Assuming 45 mph average

	function closeModal() {
		dispatch('close');
	}

	function startJob() {
		dispatch('start-navigation', { job });
		closeModal();
	}

	function callCustomer() {
		// In production: initiate phone call
		console.log('Calling customer:', job.customerContact.phone);
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}

	function formatDuration(hours: number) {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		return h > 0 ? `${h}h ${m}m` : `${m}m`;
	}

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'urgent': return '#dc2626';
			case 'high': return '#f59e0b';
			case 'normal': return '#3b82f6';
			case 'low': return '#6b7280';
			default: return '#6b7280';
		}
	}

	function getPriorityLabel(priority: string) {
		return priority.charAt(0).toUpperCase() + priority.slice(1);
	}

	function getTimeUntilJob(scheduledTime: Date) {
		const now = new Date();
		const diffMs = scheduledTime.getTime() - now.getTime();
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		
		if (diffMs < 0) return 'Overdue';
		if (diffHours > 0) return `${diffHours}h ${diffMins}m`;
		return `${diffMins}m`;
	}

	function isJobReady() {
		if (!job) return false;
		const now = new Date();
		const timeDiff = job.scheduledTime.getTime() - now.getTime();
		return timeDiff <= (30 * 60 * 1000); // Can start 30 minutes early
	}

	// Prevent scroll when modal is open
	$: if (typeof document !== 'undefined') {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
	}
</script>

{#if isOpen && job}
	<div class="modal-overlay" role="dialog" aria-modal="true">
		<div class="modal-container">
			<!-- Modal Header -->
			<div class="modal-header">
				<div class="header-content">
					<div class="job-title-section">
						<h2 class="job-title">Job Details</h2>
						<div class="job-meta">
							<span class="job-id">Ticket #{job.id}</span>
							<div class="customer-banner">{job.accountName}</div>
							<div class="priority-badge" style="background-color: {getPriorityColor(job.priority)}">
								{getPriorityLabel(job.priority)}
							</div>
						</div>
					</div>
					<button class="close-btn tap-target" on:click={closeModal} aria-label="Close">
						<X size={24} />
					</button>
				</div>
			</div>

			<!-- Modal Content -->
			<div class="modal-content">
				<!-- Job Specifications - FIRST THING DRIVERS SEE -->
				<div class="specifications">
					<h4 class="section-title">Job Specifications</h4>
					<div class="spec-grid">
						<!-- Volume & Level -->
						<div class="spec-item">
							<Gauge size={16} />
							<span class="spec-label">EST Volume</span>
							<span class="spec-value">{job.estimatedBarrels} BBL</span>
						</div>
						<div class="spec-item">
							<BarChart3 size={16} />
							<span class="spec-label">Tank Level</span>
							<span class="spec-value tank-level">{job.tankLevelHeight}</span>
						</div>

						<!-- Load Details -->
						<div class="spec-item">
							<FileText size={16} />
							<span class="spec-label">Product Type</span>
							<span class="spec-value load-type">{job.loadType.charAt(0).toUpperCase() + job.loadType.slice(1)}</span>
						</div>
						<div class="spec-item">
							<Database size={16} />
							<span class="spec-label">Tank Number</span>
							<span class="spec-value">{job.pickupLocation.tankNumber}</span>
						</div>

						<!-- Timing & Distance -->
						<div class="spec-item">
							<Clock size={16} />
							<span class="spec-label">EST Transit Time</span>
							<span class="spec-value">{formatDuration(job.estimatedDuration)}</span>
						</div>
						<div class="spec-item">
							<MapPin size={16} />
							<span class="spec-label">Distance</span>
							<span class="spec-value">{job.distance} miles</span>
						</div>

						<!-- Priority -->
						<div class="spec-item priority">
							<AlertCircle size={16} />
							<span class="spec-label">Priority</span>
							<span class="spec-value priority-level" style="color: {getPriorityColor(job.priority)}">{getPriorityLabel(job.priority)}</span>
						</div>
					</div>

					<!-- Additional Technical Specifications -->
					<div class="tech-specs">
						<h5 class="subsection-title">Technical Details</h5>
						<div class="tech-grid">
							<div class="tech-item">
								<span class="tech-label">API Gravity:</span>
								<span class="tech-value">0.0°</span>
							</div>
							<div class="tech-item">
								<span class="tech-label">Water Cut:</span>
								<span class="tech-value">0.0%</span>
							</div>
							<div class="tech-item">
								<span class="tech-label">Density:</span>
								<span class="tech-value">0.000 g/cm³</span>
							</div>
							<div class="tech-item">
								<span class="tech-label">Pad Name:</span>
								<span class="tech-value">{job.pickupLocation.padName}</span>
							</div>
							<div class="tech-item">
								<span class="tech-label">Rate:</span>
								<span class="tech-value">$0.00</span>
							</div>
							<div class="tech-item">
								<span class="tech-label">Fuel Surcharge:</span>
								<span class="tech-value">$0.00</span>
							</div>
						</div>
					</div>

					<!-- Quick Status Summary -->
					<div class="status-summary">
						<div class="summary-item equipment">
							<Truck size={14} />
							<span>Equipment: Verified & Available</span>
						</div>
						<div class="summary-item documentation">
							<FileText size={14} />
							<span>Documentation: BOL, Manifest, Permits Ready</span>
						</div>
					</div>
				</div>

				<!-- Account Information -->
				<div class="account-section">
					<div class="account-header" style="background-color: {job.accountColor}15; border-color: {job.accountColor}30;">
						<div class="account-indicator" style="background-color: {job.accountColor}"></div>
						<div class="account-details">
							<h3 class="account-name">{job.accountName}</h3>
							<p class="account-type">Energy Company</p>
						</div>
					</div>
				</div>

				<!-- Route Overview -->
				<div class="route-overview">
					<h4 class="section-title">Route Overview</h4>
					
					<!-- Current Location -->
					<div class="location-card current">
						<div class="location-icon current-icon">
							<Truck size={18} />
						</div>
						<div class="location-details">
							<span class="location-name">Current Location</span>
							<span class="location-address">{currentLocation.address}</span>
						</div>
						<div class="location-meta">
							<span class="distance-badge">Start</span>
						</div>
					</div>

					<!-- Travel to Pickup -->
					<div class="route-segment">
						<div class="segment-line"></div>
						<div class="segment-info">
							<span class="segment-distance">{distanceToPickup.toFixed(1)} mi</span>
							<span class="segment-time">{estimatedTravelTime} min</span>
						</div>
					</div>

					<!-- Pickup Location -->
					<div class="location-card pickup">
						<div class="location-icon pickup-icon">
							<MapPin size={18} />
						</div>
						<div class="location-details">
							<span class="location-name">{job.pickupLocation.name}</span>
							<span class="location-subtitle">{job.pickupLocation.padName} • {job.pickupLocation.tankNumber}</span>
							<span class="location-address">{job.pickupLocation.address}</span>
						</div>
						<div class="location-meta">
							<span class="time-badge">{formatTime(job.scheduledTime)}</span>
						</div>
					</div>

					<!-- Transport Segment -->
					<div class="route-segment">
						<div class="segment-line"></div>
						<div class="segment-info">
							<span class="segment-distance">{job.distance} mi</span>
							<span class="segment-time">{formatDuration(job.estimatedDuration)}</span>
						</div>
					</div>

					<!-- Delivery Location -->
					<div class="location-card delivery">
						<div class="location-icon delivery-icon">
							<MapPin size={18} />
						</div>
						<div class="location-details">
							<span class="location-name">{job.deliveryLocation.name}</span>
							<span class="location-address">{job.deliveryLocation.address}</span>
						</div>
						<div class="location-meta">
							<span class="distance-badge">{job.estimatedBarrels} BBL</span>
						</div>
					</div>
				</div>

				<!-- Special Instructions -->
				{#if job.specialInstructions}
					<div class="instructions-section">
						<h4 class="section-title">Special Instructions</h4>
						<div class="instructions-card">
							<AlertCircle size={18} />
							<p class="instructions-text">{job.specialInstructions}</p>
						</div>
					</div>
				{/if}

				<!-- Emergency Contact -->
				<div class="contact-section">
					<h4 class="section-title">Emergency Contact</h4>
					<div class="contact-card">
						<div class="contact-info">
							<User size={18} />
							<div class="contact-details">
								<span class="contact-name">{job.customerContact.name}</span>
								<span class="contact-phone">{job.customerContact.phone}</span>
							</div>
						</div>
						<button class="call-btn tap-target" on:click={callCustomer}>
							<Phone size={16} />
							<span>Call</span>
						</button>
					</div>
				</div>

				<!-- Job Status -->
				<div class="status-section">
					<div class="status-indicator">
						{#if isJobReady()}
							<CheckCircle size={20} class="status-icon ready" />
							<div class="status-text">
								<span class="status-title">Ready to Start</span>
								<span class="status-subtitle">You can begin this job now</span>
							</div>
						{:else}
							<Clock size={20} class="status-icon waiting" />
							<div class="status-text">
								<span class="status-title">Scheduled for {formatTime(job.scheduledTime)}</span>
								<span class="status-subtitle">Starts in {getTimeUntilJob(job.scheduledTime)}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Modal Actions -->
			<div class="modal-actions">
				<button 
					class="start-btn tap-target {isJobReady() ? 'enabled' : 'disabled'}"
					disabled={!isJobReady()}
					on:click={startJob}
				>
					{#if isJobReady()}
						<CheckCircle size={18} />
						<span>Start Job</span>
					{:else}
						<Clock size={18} />
						<span>Not Ready</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		overflow-y: auto;
	}

	.modal-container {
		background: white;
		border-radius: 20px;
		width: 100%;
		max-width: 480px;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	/* Header */
	.modal-header {
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding: 20px;
		flex-shrink: 0;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}

	.job-title-section {
		flex: 1;
		min-width: 0;
	}

	.job-title {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
	}

	.job-meta {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.job-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 14px;
		color: #6b7280;
		font-weight: 600;
	}

	.customer-banner {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
		padding: 4px 8px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.priority-badge {
		color: white;
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.close-btn {
		background: rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 10px;
		color: #6b7280;
		cursor: pointer;
		padding: 8px;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.close-btn:hover {
		background: rgba(0, 0, 0, 0.1);
		color: #374151;
	}

	/* Content */
	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 12px 0;
	}

	/* Account Section */
	.account-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-radius: 12px;
		border: 1px solid;
	}

	.account-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.account-details {
		flex: 1;
		min-width: 0;
	}

	.account-name {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 2px 0;
	}

	.account-type {
		font-size: 13px;
		color: #6b7280;
		margin: 0;
	}

	/* Route Overview */
	.route-overview {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.location-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 12px;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.location-icon {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.current-icon {
		background: linear-gradient(135deg, #8b5cf6, #7c3aed);
	}

	.pickup-icon {
		background: linear-gradient(135deg, #059669, #10b981);
	}

	.delivery-icon {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
	}

	.location-details {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.location-name {
		font-weight: 600;
		color: #1e293b;
		font-size: 14px;
	}

	.location-subtitle {
		font-size: 12px;
		color: #059669;
		font-weight: 500;
	}

	.location-address {
		font-size: 12px;
		color: #6b7280;
		line-height: 1.3;
	}

	.location-meta {
		flex-shrink: 0;
	}

	.time-badge, .distance-badge {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.distance-badge {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
	}

	/* Route Segments */
	.route-segment {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 0 18px;
	}

	.segment-line {
		width: 2px;
		height: 24px;
		background: linear-gradient(to bottom, #d1d5db, #9ca3af);
		border-radius: 1px;
		flex-shrink: 0;
	}

	.segment-info {
		display: flex;
		gap: 8px;
	}

	.segment-distance, .segment-time {
		font-size: 11px;
		color: #6b7280;
		font-weight: 500;
		padding: 2px 6px;
		background: rgba(107, 114, 128, 0.1);
		border-radius: 4px;
	}

	/* Specifications */
	.specifications {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.spec-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.spec-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 10px;
		border: 1px solid rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;
	}

	.spec-item:hover {
		background: rgba(0, 0, 0, 0.04);
		border-color: rgba(0, 0, 0, 0.1);
	}

	.spec-item.hazmat {
		border-color: #fbbf24;
		background: #fffbeb;
	}

	.spec-item.priority {
		border-color: #cbd5e1;
		background: #f8fafc;
	}

	.spec-label {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		flex: 1;
	}

	.spec-value {
		font-size: 13px;
		font-weight: 600;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
		white-space: nowrap;
	}

	.spec-value.tank-level {
		color: #059669;
	}

	.spec-value.load-type {
		color: #3b82f6;
		text-transform: capitalize;
	}

	.spec-value.temp-range {
		color: #f59e0b;
	}

	.spec-value.route-type {
		color: #6b7280;
		text-transform: capitalize;
	}

	.spec-value.hazmat-status {
		color: #d97706;
		font-weight: 700;
	}

	.spec-value.priority-level {
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Technical Specifications */
	.tech-specs {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
	}

	.subsection-title {
		font-size: 14px;
		font-weight: 600;
		color: #475569;
		margin: 0 0 12px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.tech-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	.tech-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: white;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}

	.tech-label {
		font-size: 12px;
		color: #64748b;
		font-weight: 500;
	}

	.tech-value {
		font-size: 12px;
		font-weight: 600;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Status Summary */
	.status-summary {
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		border-radius: 12px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.summary-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 500;
		color: #0369a1;
	}

	.summary-item.ready {
		color: #059669;
	}

	.summary-item.waiting {
		color: #d97706;
	}

	.summary-item.equipment {
		color: #3b82f6;
	}

	.summary-item.documentation {
		color: #6366f1;
	}

	/* Instructions */
	.instructions-card {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
		border-radius: 12px;
	}

	.instructions-card svg {
		color: #f59e0b;
		flex-shrink: 0;
		margin-top: 2px;
	}

	.instructions-text {
		font-size: 14px;
		color: #92400e;
		line-height: 1.5;
		margin: 0;
	}

	/* Contact */
	.contact-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 16px;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 12px;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.contact-info {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}

	.contact-info svg {
		color: #6b7280;
		flex-shrink: 0;
	}

	.contact-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.contact-name {
		font-weight: 600;
		color: #1e293b;
		font-size: 14px;
	}

	.contact-phone {
		font-size: 13px;
		color: #6b7280;
		font-family: 'JetBrains Mono', monospace;
	}

	.call-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: #3b82f6;
		color: white;
		border: 1px solid #3b82f6;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 13px;
		font-weight: 500;
		flex-shrink: 0;
	}

	.call-btn:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	/* Status */
	.status-indicator {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 12px;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.status-icon.ready {
		color: #059669;
	}

	.status-icon.waiting {
		color: #f59e0b;
	}

	.status-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.status-title {
		font-weight: 600;
		color: #1e293b;
		font-size: 14px;
	}

	.status-subtitle {
		font-size: 12px;
		color: #6b7280;
	}

	/* Actions */
	.modal-actions {
		display: flex;
		gap: 12px;
		padding: 20px;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		background: #f8fafc;
		flex-shrink: 0;
	}

	.start-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 16px;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid;
		flex: 1;
	}

	.start-btn.enabled {
		background: linear-gradient(135deg, #059669 0%, #10b981 100%);
		color: white;
		border-color: #059669;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.start-btn.enabled:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
	}

	.start-btn.disabled {
		background: #f3f4f6;
		color: #9ca3af;
		border-color: #d1d5db;
		cursor: not-allowed;
	}

	/* Mobile Responsive */
	@media (max-width: 480px) {
		.modal-container {
			max-height: 95vh;
			border-radius: 16px;
		}

		.modal-header {
			padding: 16px;
		}

		.job-title {
			font-size: 20px;
		}

		.modal-content {
			padding: 16px;
			gap: 20px;
		}

		.spec-grid {
			grid-template-columns: 1fr;
		}

		.modal-actions {
			padding: 16px;
			flex-direction: column;
		}

		.start-btn {
			flex: none;
		}

		.spec-item {
			padding: 10px;
		}

		.spec-label {
			font-size: 11px;
		}

		.spec-value {
			font-size: 12px;
		}

		.tech-item {
			padding: 6px 10px;
		}

		.tech-label,
		.tech-value {
			font-size: 11px;
		}

		.summary-item {
			font-size: 11px;
		}
	}
</style> 