<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { MapPin, Clock, Gauge, Truck, AlertCircle, Calendar, Navigation, ChevronRight, Timer, Zap } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Job/Haul data structure
	interface ScheduledJob {
		id: string;
		accountName: string;
		accountLogo?: string;
		accountColor: string;
		pickupLocation: {
			name: string;
			address: string;
			padName: string;
			tankNumber: string;
			coordinates: { lat: number; lng: number };
		};
		deliveryLocation: {
			name: string;
			address: string;
			coordinates: { lat: number; lng: number };
		};
		estimatedBarrels: number;
		tankLevelHeight: string;
		scheduledTime: Date;
		estimatedDuration: number; // hours
		priority: 'urgent' | 'high' | 'normal' | 'low';
		status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
		distance: number; // miles
		routeType: 'highway' | 'rural' | 'city';
		specialInstructions?: string;
		expectedTemperature: { min: number; max: number };
		loadType: 'crude' | 'condensate' | 'refined';
		hazmatRequired: boolean;
		customerContact: {
			name: string;
			phone: string;
		};
	}

	// Mock scheduled jobs for today
	let todaysJobs: ScheduledJob[] = [
		{
			id: 'JOB-001',
			accountName: 'Shell Energy',
			accountColor: '#FFD100',
			pickupLocation: {
				name: 'QRVWX',
				address: 'LAT: 28.970028, LONG: -98.235694',
				padName: 'Eagle Point Pad',
				tankNumber: 'Tank 7-A',
				coordinates: { lat: 28.970028, lng: -98.235694 }
			},
			deliveryLocation: {
				name: 'Falls City Harvest Pipeline',
				address: 'LAT: 28.99683, LONG: -98.03021',
				coordinates: { lat: 28.99683, lng: -98.03021 }
			},
			estimatedBarrels: 185,
			tankLevelHeight: "17' 4\"",
			scheduledTime: new Date(2024, 0, 15, 6, 0), // 6:00 AM
			estimatedDuration: 3.5,
			priority: 'high',
			status: 'scheduled',
			distance: 24.5,
			routeType: 'highway',
			specialInstructions: 'Use east gate entrance. Check tank temp before loading.',
			expectedTemperature: { min: 75, max: 85 },
			loadType: 'crude',
			hazmatRequired: true,
			customerContact: {
				name: 'Mike Rodriguez',
				phone: '(432) 555-0123'
			}
		},
		{
			id: 'JOB-002',
			accountName: 'Devon Energy',
			accountColor: '#0033A0',
			pickupLocation: {
				name: 'Carmody',
				address: 'LAT: 28.84805, LONG: -97.98977',
				padName: 'Thunder Creek Pad',
				tankNumber: 'Tank 12-B',
				coordinates: { lat: 28.84805, lng: -97.98977 }
			},
			deliveryLocation: {
				name: 'Sugarhorn Marathon Facility',
				address: 'LAT: 28.84889, LONG: -97.99120',
				coordinates: { lat: 28.84889, lng: -97.99120 }
			},
			estimatedBarrels: 210,
			tankLevelHeight: "22' 8\"",
			scheduledTime: new Date(2024, 0, 15, 11, 30), // 11:30 AM
			estimatedDuration: 4.2,
			priority: 'urgent',
			status: 'scheduled',
			distance: 89.3,
			routeType: 'highway',
			specialInstructions: 'Priority delivery - customer waiting. Call dispatch if delays.',
			expectedTemperature: { min: 78, max: 88 },
			loadType: 'crude',
			hazmatRequired: true,
			customerContact: {
				name: 'Sarah Chen',
				phone: '(361) 555-0456'
			}
		},
		{
			id: 'JOB-003',
			accountName: 'Shell Energy',
			accountColor: '#0066CC',
			pickupLocation: {
				name: 'Linhart',
				address: 'LAT: 28.93972, LONG: -97.86080',
				padName: 'Mustang Ridge Pad',
				tankNumber: 'Tank 5-C',
				coordinates: { lat: 28.93972, lng: -97.86080 }
			},
			deliveryLocation: {
				name: 'Falls City Harvest Pipeline',
				address: 'LAT: 28.99683, LONG: -98.03021',
				coordinates: { lat: 28.99683, lng: -98.03021 }
			},
			estimatedBarrels: 165,
			tankLevelHeight: "14' 11\"",
			scheduledTime: new Date(2024, 0, 15, 16, 0), // 4:00 PM
			estimatedDuration: 3.8,
			priority: 'normal',
			status: 'scheduled',
			distance: 156.7,
			routeType: 'highway',
			expectedTemperature: { min: 76, max: 82 },
			loadType: 'condensate',
			hazmatRequired: true,
			customerContact: {
				name: 'David Thompson',
				phone: '(713) 555-0789'
			}
		}
	];

	// Driver information - would come from auth store
	let driverInfo = {
		name: 'Mike Johnson',
		id: 'DRV-892',
		truckId: 'TX-TRK-892',
		trailerNumber: 'TX-TRL-445',
		currentLocation: 'Houston Dispatch Yard'
	};

	// Schedule stats
	$: totalJobs = todaysJobs.length;
	$: totalBarrels = todaysJobs.reduce((sum, job) => sum + job.estimatedBarrels, 0);
	$: totalDistance = todaysJobs.reduce((sum, job) => sum + job.distance, 0);
	$: totalHours = todaysJobs.reduce((sum, job) => sum + job.estimatedDuration, 0);
	$: urgentJobs = todaysJobs.filter(job => job.priority === 'urgent').length;

	// Current time tracking
	let currentTime = new Date();
	let timeInterval: number;

	// Update current time every minute
	if (typeof window !== 'undefined') {
		timeInterval = window.setInterval(() => {
			currentTime = new Date();
		}, 60000);
	}

	function selectJob(job: ScheduledJob) {
		dispatch('job-selected', { job });
	}

	function getJobStatusColor(status: ScheduledJob['status']) {
		switch (status) {
			case 'scheduled': return 'bg-gray-100 text-gray-700 border-gray-200';
			case 'in-progress': return 'bg-orange-100 text-orange-700 border-orange-200';
			case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
			default: return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}

	function getPriorityColor(priority: ScheduledJob['priority']) {
		switch (priority) {
			case 'urgent': return 'bg-red-500';
			case 'high': return 'bg-red-400';
			case 'normal': return 'bg-gray-400';
			case 'low': return 'bg-gray-300';
			default: return 'bg-gray-300';
		}
	}

	function getPriorityLabel(priority: ScheduledJob['priority']) {
		return priority.charAt(0).toUpperCase() + priority.slice(1);
	}

	function getPriorityIcon(priority: ScheduledJob['priority']) {
		switch (priority) {
			case 'urgent': return Zap;
			case 'high': return Timer;
			case 'normal': return Clock;
			case 'low': return Clock;
			default: return Clock;
		}
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: '2-digit', 
			minute: '2-digit',
			hour12: true 
		});
	}

	function formatDuration(hours: number) {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		return h > 0 ? `${h}h ${m}m` : `${m}m`;
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

	function isJobSoon(scheduledTime: Date) {
		const now = new Date();
		const diffMs = scheduledTime.getTime() - now.getTime();
		return diffMs > 0 && diffMs < (2 * 60 * 60 * 1000); // 2 hours
	}

	function isJobOverdue(scheduledTime: Date) {
		const now = new Date();
		return scheduledTime.getTime() < now.getTime();
	}
</script>

<div class="driver-schedule mobile-container">
	<!-- Header -->
	<div class="schedule-header mobile-sticky">
		<div class="header-content">
			<div class="driver-info">
				<h1 class="schedule-title">Today's Schedule</h1>
				<div class="driver-details">
					<span class="driver-name">{driverInfo.name}</span>
					<span class="separator">•</span>
					<span class="truck-id">{driverInfo.truckId}</span>
				</div>
				<div class="current-time">
					{currentTime.toLocaleDateString('en-US', { 
						weekday: 'long',
						month: 'short', 
						day: 'numeric' 
					})} • {formatTime(currentTime)}
				</div>
			</div>
			<div class="schedule-stats">
				<div class="stat-item">
					<span class="stat-value">{totalJobs}</span>
					<span class="stat-label">Jobs</span>
				</div>
				<div class="stat-item urgent">
					<span class="stat-value">{urgentJobs}</span>
					<span class="stat-label">Urgent</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="summary-section">
		<div class="summary-cards mobile-grid">
			<div class="summary-card">
				<div class="card-icon barrels">
					<Gauge size={20} />
				</div>
				<div class="card-details">
					<span class="card-value">{totalBarrels.toLocaleString()}</span>
					<span class="card-label">EST. Total Barrels</span>
				</div>
			</div>
			<div class="summary-card">
				<div class="card-icon distance">
					<Navigation size={20} />
				</div>
				<div class="card-details">
					<span class="card-value">{totalDistance.toFixed(0)}</span>
					<span class="card-label">EST. Miles</span>
				</div>
			</div>
			<div class="summary-card">
				<div class="card-icon time">
					<Clock size={20} />
				</div>
				<div class="card-details">
					<span class="card-value">{formatDuration(totalHours)}</span>
					<span class="card-label">Est. Time</span>
				</div>
			</div>
			<div class="summary-card">
				<div class="card-icon truck">
					<Truck size={20} />
				</div>
				<div class="card-details">
					<span class="card-value">{driverInfo.trailerNumber}</span>
					<span class="card-label">Trailer</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Job List -->
	<div class="jobs-section">
		<div class="section-header">
			<h2 class="section-title">Scheduled Jobs</h2>
			<p class="section-subtitle">Tap a job to view details and start</p>
		</div>

		<div class="job-list">
			{#each todaysJobs as job, index}
				<div 
					class="job-card tap-target {isJobOverdue(job.scheduledTime) ? 'overdue' : ''} {isJobSoon(job.scheduledTime) ? 'soon' : ''}"
					on:click={() => selectJob(job)}
					role="button"
					tabindex="0"
				>
					<!-- Priority indicator bar -->
					<div class="priority-bar">
						<div class="priority-indicator {getPriorityColor(job.priority)}"></div>
					</div>

					<!-- Main card content -->
					<div class="card-content">
						<!-- Left section: Time and Barrels -->
						<div class="time-barrels-section">
							<div class="time-display">
								<div class="scheduled-time">{formatTime(job.scheduledTime)}</div>
								<div class="time-status {isJobOverdue(job.scheduledTime) ? 'overdue' : isJobSoon(job.scheduledTime) ? 'soon' : 'normal'}">
									{getTimeUntilJob(job.scheduledTime)}
								</div>
							</div>
							<div class="barrels-display">
								<div class="barrels-value">{job.estimatedBarrels}</div>
								<div class="barrels-label">BBLS</div>
							</div>
						</div>

						<!-- Center section: Route and Account -->
						<div class="route-display">
							<!-- Account and Load Type -->
							<div class="job-header">
								<div class="account-name">{job.accountName}</div>
								<div class="load-type-badge {job.loadType}">
									{job.loadType.toUpperCase()}
								</div>
							</div>

							<!-- Route line -->
							<div class="route-line">
								<!-- Pickup location -->
								<div class="location pickup">
									<div class="location-icon pickup-icon">
										<Gauge size={12} />
									</div>
									<div class="location-text">
										<div class="location-name">{job.pickupLocation.name.split(' ')[0]} {job.pickupLocation.name.split(' ')[1]}...</div>
									</div>
								</div>

								<!-- Route arrow with distance -->
								<div class="route-connector">
									<div class="route-arrow">→</div>
									<div class="distance-info">{job.distance}mi</div>
								</div>

								<!-- Delivery location -->
								<div class="location delivery">
									<div class="location-icon delivery-icon">
										<MapPin size={12} />
									</div>
									<div class="location-text">
										<div class="location-name">{job.deliveryLocation.name.split(' ')[0]} {job.deliveryLocation.name.split(' ')[1]}...</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Right section: Status and Action -->
						<div class="action-section">
							<div class="status-info">
								<div class="priority-label {job.priority}">
									{getPriorityLabel(job.priority)}
								</div>
								<div class="duration-badge">
									<Clock size={12} />
									<span>{formatDuration(job.estimatedDuration)}</span>
								</div>
							</div>
							<div class="view-details-btn">
								<span>View</span>
								<ChevronRight size={14} />
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Quick Actions -->
	<div class="quick-actions">
		<button class="action-btn emergency tap-target">
			<AlertCircle size={20} />
			<span>Emergency Contact</span>
		</button>
		<button class="action-btn dispatch tap-target">
			<MapPin size={20} />
			<span>Call Dispatch</span>
		</button>
		<button class="action-btn navigation tap-target">
			<Navigation size={20} />
			<span>Open Navigation</span>
		</button>
	</div>
</div>

<style>
	/* Global box-sizing for better layout control */
	.driver-schedule *,
	.driver-schedule *::before,
	.driver-schedule *::after {
		box-sizing: border-box;
	}

	.driver-schedule {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e8f5e8 100%);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.mobile-container {
		max-width: 100%;
		margin: 0 auto;
		padding: 0;
	}

	@media (min-width: 768px) {
		.mobile-container {
			max-width: 800px;
			padding: 0 12px;
		}
	}

	/* Header */
	.schedule-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding: 16px;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
	}

	.driver-info {
		flex: 1;
		min-width: 0;
	}

	.schedule-title {
		font-size: 20px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 4px 0;
	}

	.driver-details {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.driver-name {
		font-weight: 600;
		color: #1e293b;
		font-size: 14px;
	}

	.truck-id {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
		color: #1e293b;
		font-size: 14px;
	}

	.separator {
		color: #6b7280;
		font-weight: 300;
	}

	.current-time {
		font-size: 13px;
		color: #6b7280;
	}

	.schedule-stats {
		display: flex;
		gap: 16px;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-value {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
	}

	.stat-label {
		font-size: 11px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-item.urgent .stat-value {
		color: #dc2626;
	}

	/* Summary Cards */
	.summary-section {
		padding: 16px 12px;
	}

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	@media (min-width: 640px) {
		.summary-cards {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.summary-card {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		transition: all 0.2s ease;
	}

	.card-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.card-icon.barrels {
		background: #6b7280;
	}

	.card-icon.distance {
		background: #6b7280;
	}

	.card-icon.time {
		background: #6b7280;
	}

	.card-icon.truck {
		background: #6b7280;
	}

	.card-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.card-value {
		font-size: 16px;
		font-weight: 700;
		color: #1e293b;
	}

	.card-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Jobs Section */
	.jobs-section {
		padding: 0 12px 16px;
	}

	.section-header {
		margin-bottom: 16px;
		padding: 0 4px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 4px 0;
	}

	.section-subtitle {
		font-size: 14px;
		color: #6b7280;
		margin: 0;
	}

	.job-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	/* Job Cards - Clean Design */
	.job-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-left: none;
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 2px;
	}

	.job-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-color: #cbd5e1;
	}

	/* Priority Bar */
	.priority-bar {
		height: 4px;
		background: #f1f5f9;
		position: relative;
	}

	.priority-indicator {
		height: 100%;
		width: 100%;
	}

	.priority-indicator.bg-red-500 {
		background: #dc2626;
	}

	.priority-indicator.bg-red-400 {
		background: #f59e0b;
	}

	.priority-indicator.bg-gray-400 {
		background: #6b7280;
	}

	.priority-indicator.bg-gray-300 {
		background: #f1f5f9;
	}

	/* Card Content - Hard Vertical Spine Alignment */
	.card-content {
		display: grid;
		/* 84 px is just wide enough for "11:30 AM", "OVERDUE", and BBLS */
		grid-template-columns: 84px 1fr 96px; /* left | middle | right */
		column-gap: 24px;
		padding: 20px 16px;
		align-items: center;
		min-height: 100px;
	}

	/* Time and Barrels Section - Hard Left Alignment */
	.time-barrels-section {
		width: 84px;    /* now exact width of track */
		padding: 0;     /* no internal left/right padding */
		text-align: left;   /* numbers start right at grid line */
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8px;
	}

	.time-display {
		display: flex;
		flex-direction: column;
		align-items: flex-start;   /* instead of center */
		gap: 2px;
		width: 100%;
	}

	.scheduled-time {
		text-align: left;
		font-size: 16px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1.2;
		margin: 0;
	}

	.time-status {
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		white-space: nowrap;
		margin: 0;
		align-self: flex-start;
	}

	.time-status.normal {
		background: #f8fafc;
		color: #64748b;
	}

	.time-status.soon {
		background: #fef2f2;
		color: #dc2626;
	}

	.time-status.overdue {
		background: #fef2f2;
		color: #dc2626;
	}

	.barrels-display {
		display: flex;
		flex-direction: column;
		align-items: flex-start;   /* instead of center */
		gap: 1px;
		width: 100%;
	}

	.barrels-value {
		text-align: left;
		font-size: 22px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1;
		margin: 0;
	}

	.barrels-label {
		font-size: 9px;
		color: #64748b;
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		margin: 0;
	}

	/* Route Display - Respects the ruler */
	.route-display {
		min-width: 0;   /* so ellipsis works */
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	/* Job Header Info - Clean Layout */
	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin: 0;
	}

	.account-name {
		min-width: 0;   /* so ellipsis works */
		font-size: 15px;
		font-weight: 700;
		color: #0f172a;
		flex: 1;
		line-height: 1.2;
		margin: 0;
	}

	.load-type-badge {
		font-size: 9px;
		font-weight: 700;
		padding: 3px 6px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		white-space: nowrap;
		flex-shrink: 0;
		margin: 0;
	}

	.load-type-badge.crude {
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
	}

	.load-type-badge.condensate {
		background: #f8fafc;
		color: #64748b;
		border: 1px solid #e2e8f0;
	}

	.load-type-badge.refined {
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
	}

	/* Route Line - Perfect Spacing */
	.route-line {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
	}

	.location {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
	}

	.location-icon {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.pickup-icon {
		background: #6b7280;
	}

	.delivery-icon {
		background: #6b7280;
	}

	.location-text {
		min-width: 0;   /* so ellipsis works */
		display: flex;
		flex-direction: column;
		gap: 1px;
		overflow: hidden;
	}

	.location-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 600;
		color: #0f172a;
		font-size: 13px;
		line-height: 1.2;
	}

	.route-connector {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
		margin: 0 4px;
	}

	.route-arrow {
		font-size: 16px;
		color: #64748b;
		font-weight: bold;
	}

	.distance-info {
		font-size: 9px;
		color: #64748b;
		font-weight: 600;
		font-family: 'JetBrains Mono', monospace;
		background: #f1f5f9;
		padding: 1px 4px;
		border-radius: 3px;
		white-space: nowrap;
	}

	/* Action Section - Fixed Right Alignment */
	.action-section {
		width: 96px;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 8px;
	}

	.status-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		width: 100%;
	}

	.duration-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		color: #64748b;
		font-weight: 500;
		background: #f8fafc;
		padding: 4px 8px;
		border-radius: 4px;
		white-space: nowrap;
		border: 1px solid #e2e8f0;
	}

	/* Priority Label */
	.priority-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		padding: 2px 6px;
		border-radius: 3px;
		align-self: flex-end;
	}

	.priority-label.urgent {
		background: #fef2f2;
		color: #dc2626;
	}

	.priority-label.high {
		background: #fef2f2;
		color: #dc2626;
	}

	.priority-label.normal {
		background: #f8fafc;
		color: #64748b;
	}

	.priority-label.low {
		background: #f8fafc;
		color: #64748b;
	}

	/* View Details Button */
	.view-details-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		color: #3b82f6;
		font-size: 12px;
		font-weight: 600;
		padding: 6px 10px;
		border-radius: 6px;
		background: #f0f9ff;
		border: 1px solid #bfdbfe;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.job-card:hover .view-details-btn {
		background: #dbeafe;
		border-color: #93c5fd;
		transform: translateX(2px);
	}

	/* Quick Actions */
	.quick-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding: 20px 12px;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		position: sticky;
		bottom: 0;
		z-index: 10;
	}

	.action-btn {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 16px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid;
		min-height: 44px;
	}

	.action-btn.emergency {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
		border-color: rgba(239, 68, 68, 0.2);
	}

	.action-btn.dispatch {
		background: rgba(59, 130, 246, 0.1);
		color: #2563eb;
		border-color: rgba(59, 130, 246, 0.2);
	}

	.action-btn.navigation {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
		border-color: rgba(16, 185, 129, 0.2);
	}

	.action-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	/* Mobile Responsive */
	@media (max-width: 640px) {
		.card-content {
			grid-template-columns: auto 1fr;
			grid-template-rows: auto auto;
			gap: 12px;
			padding: 12px;
		}

		.time-barrels-section {
			grid-column: 1;
			grid-row: 1;
		}

		.route-display {
			grid-column: 1 / -1;
			grid-row: 2;
		}

		.action-section {
			grid-column: 2;
			grid-row: 1;
			align-items: flex-end;
		}

		.job-header {
			flex-direction: column;
			gap: 8px;
			align-items: flex-start;
		}

		.route-line {
			grid-template-columns: 1fr auto 1fr;
			gap: 8px;
		}

		.location-name {
			font-size: 12px;
		}

		.barrels-value {
			font-size: 20px;
		}

		.scheduled-time {
			font-size: 14px;
		}

		.time-barrels-section {
			min-width: 75px;
		}

		.action-section {
			min-width: 90px;
		}

		.view-details-btn {
			font-size: 11px;
			padding: 4px 8px;
		}

		.duration-badge {
			font-size: 10px;
			padding: 3px 6px;
		}

		.location-icon {
			width: 20px;
			height: 20px;
		}

		.distance-info {
			font-size: 9px;
		}

		.account-name {
			font-size: 13px;
		}

		.load-type-badge {
			font-size: 8px;
		}

		.priority-label {
			font-size: 9px;
		}
	}
</style> 