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
				name: 'Permian Basin Facility',
				address: '2847 County Road 140, Midland, TX 79706',
				padName: 'Eagle Point Pad',
				tankNumber: 'Tank 7-A',
				coordinates: { lat: 31.9974, lng: -102.0779 }
			},
			deliveryLocation: {
				name: 'Midland Refinery Terminal',
				address: '1200 Industrial Blvd, Midland, TX 79701',
				coordinates: { lat: 32.0268, lng: -102.1038 }
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
			accountName: 'ExxonMobil',
			accountColor: '#0033A0',
			pickupLocation: {
				name: 'Eagle Ford Shale Site',
				address: '15th County Road 200, Karnes City, TX 78118',
				padName: 'Thunder Creek Pad',
				tankNumber: 'Tank 12-B',
				coordinates: { lat: 28.8851, lng: -97.9003 }
			},
			deliveryLocation: {
				name: 'Corpus Christi Terminal',
				address: '5500 Harbor Bridge, Corpus Christi, TX 78407',
				coordinates: { lat: 27.7936, lng: -97.3916 }
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
			accountName: 'Chevron',
			accountColor: '#0066CC',
			pickupLocation: {
				name: 'Bakken Formation Site',
				address: '890 Ranch Road 1431, Gonzales, TX 78629',
				padName: 'Mustang Ridge Pad',
				tankNumber: 'Tank 5-C',
				coordinates: { lat: 29.5016, lng: -97.4522 }
			},
			deliveryLocation: {
				name: 'Houston Ship Channel',
				address: '7300 Clinton Dr, Houston, TX 77020',
				coordinates: { lat: 29.7342, lng: -95.2791 }
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
			case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'in-progress': return 'bg-orange-100 text-orange-700 border-orange-200';
			case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'delayed': return 'bg-red-100 text-red-700 border-red-200';
			default: return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}

	function getPriorityColor(priority: ScheduledJob['priority']) {
		switch (priority) {
			case 'urgent': return 'bg-red-500';
			case 'high': return 'bg-orange-500';
			case 'normal': return 'bg-blue-500';
			case 'low': return 'bg-gray-500';
			default: return 'bg-gray-500';
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
					<span class="card-label">Total Barrels</span>
				</div>
			</div>
			<div class="summary-card">
				<div class="card-icon distance">
					<Navigation size={20} />
				</div>
				<div class="card-details">
					<span class="card-value">{totalDistance.toFixed(0)}</span>
					<span class="card-label">Miles</span>
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
					<!-- Job Header -->
					<div class="job-header">
						<div class="time-priority">
							<div class="scheduled-time">{formatTime(job.scheduledTime)}</div>
							<div class="priority-badge {getPriorityColor(job.priority)}">
								<svelte:component this={getPriorityIcon(job.priority)} size={10} />
							</div>
						</div>
						<div class="job-meta">
							<div class="account-badge" style="background-color: {job.accountColor}">
								<span class="account-name">{job.accountName}</span>
							</div>
							<div class="barrels-info">
								<span class="barrels-value">{job.estimatedBarrels}</span>
								<span class="barrels-label">bbls</span>
							</div>
						</div>
					</div>

					<!-- Route Information -->
					<div class="route-section">
						<div class="route-flow">
							<div class="location-point pickup">
								<div class="location-icon">
									<Gauge size={14} />
								</div>
								<div class="location-info">
									<span class="location-name">{job.pickupLocation.name}</span>
									<span class="tank-number">{job.pickupLocation.tankNumber}</span>
								</div>
							</div>
							
							<div class="route-arrow">
								<div class="arrow-line"></div>
								<div class="distance-badge">{job.distance}mi</div>
								<Navigation size={12} />
							</div>
							
							<div class="location-point delivery">
								<div class="location-icon">
									<MapPin size={14} />
								</div>
								<div class="location-info">
									<span class="location-name">{job.deliveryLocation.name}</span>
								</div>
							</div>
						</div>
					</div>

					<!-- Job Footer -->
					<div class="job-footer">
						<div class="duration-info">
							<Clock size={12} />
							<span>{formatDuration(job.estimatedDuration)}</span>
						</div>
						<div class="status-indicator {getJobStatusColor(job.status)}">
							{job.status.replace('-', ' ').toUpperCase()}
						</div>
						<div class="tap-indicator">
							<span>View Details</span>
							<ChevronRight size={14} />
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
			max-width: 768px;
			padding: 0 16px;
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
		color: #059669;
		font-size: 14px;
	}

	.truck-id {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
		color: #3b82f6;
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
		padding: 16px;
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
		background: linear-gradient(135deg, #f59e0b, #f97316);
	}

	.card-icon.distance {
		background: linear-gradient(135deg, #3b82f6, #2563eb);
	}

	.card-icon.time {
		background: linear-gradient(135deg, #059669, #10b981);
	}

	.card-icon.truck {
		background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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
		padding: 0 16px 16px;
	}

	.section-header {
		margin-bottom: 16px;
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

	/* Job Cards */
	.job-card {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 8px;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.job-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-color: rgba(0, 0, 0, 0.2);
	}

	.job-card.overdue {
		border-left: 4px solid #dc2626;
	}

	.job-card.soon {
		border-left: 4px solid #f59e0b;
	}

	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 16px 16px 12px;
		background: rgba(0, 0, 0, 0.02);
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		gap: 12px;
	}

	.time-priority {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
	}

	.scheduled-time {
		font-size: 16px;
		font-weight: 700;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
	}

	.priority-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		color: #374151;
		background: rgba(0, 0, 0, 0.06);
		border: 1px solid rgba(0, 0, 0, 0.12);
		font-size: 9px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.priority-badge.bg-red-500 {
		border-color: rgba(220, 38, 38, 0.3);
		color: #dc2626;
	}

	.priority-badge.bg-orange-500 {
		border-color: rgba(245, 158, 11, 0.3);
		color: #f59e0b;
	}

	.priority-badge.bg-blue-500 {
		color: #374151;
	}

	.priority-badge.bg-gray-500 {
		color: #374151;
	}

	.job-meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 6px;
	}

	.account-badge {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 4px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		background: rgba(0, 0, 0, 0.02);
		flex: 1;
		min-width: 0;
	}

	.account-name {
		font-weight: 600;
		color: #1e293b;
		font-size: 14px;
		truncate: true;
	}

	.barrels-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.barrels-value {
		font-size: 16px;
		font-weight: 700;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
	}

	.barrels-label {
		font-size: 11px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Route Section */
	.route-section {
		padding: 16px;
		background: rgba(0, 0, 0, 0.01);
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	.route-flow {
		display: flex;
		align-items: flex-start;
		gap: 12px;
	}

	.location-point {
		display: flex;
		align-items: flex-start;
		gap: 8px;
	}

	.location-icon {
		width: 28px;
		height: 28px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.08);
		color: #6b7280;
		flex-shrink: 0;
		border: 1px solid rgba(0, 0, 0, 0.12);
	}

	.location-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		flex: 1;
	}

	.location-name {
		font-weight: 700;
		color: #1e293b;
		font-size: 14px;
		line-height: 1.2;
	}

	.tank-number {
		font-size: 11px;
		color: #6b7280;
		font-weight: 600;
		background: rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(0, 0, 0, 0.12);
		padding: 2px 6px;
		border-radius: 3px;
		display: inline-block;
		width: fit-content;
		font-family: 'JetBrains Mono', monospace;
	}

	.route-arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		margin: 0 8px;
		position: relative;
	}

	.arrow-line {
		width: 2px;
		height: 20px;
		background: #d1d5db;
		border-radius: 1px;
	}

	.distance-badge {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 10px;
		color: #6b7280;
		font-weight: 600;
		padding: 3px 6px;
		background: rgba(0, 0, 0, 0.03);
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 3px;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Job Footer */
	.job-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: rgba(0, 0, 0, 0.02);
	}

	.duration-info {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 600;
		font-family: 'JetBrains Mono', monospace;
		color: #6b7280;
	}

	.status-indicator {
		font-size: 9px;
		font-weight: 700;
		padding: 4px 8px;
		border-radius: 3px;
		border: 1px solid rgba(0, 0, 0, 0.12);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: rgba(0, 0, 0, 0.04);
		color: #6b7280;
	}

	.tap-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
		color: #1e293b;
		background: rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(0, 0, 0, 0.12);
		padding: 6px 10px;
		border-radius: 4px;
		font-size: 11px;
		font-weight: 600;
		transition: all 0.2s ease;
	}

	.tap-indicator:hover {
		background: rgba(0, 0, 0, 0.08);
		border-color: rgba(0, 0, 0, 0.2);
	}

	/* Quick Actions */
	.quick-actions {
		padding: 16px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 16px 12px;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 12px;
		font-weight: 500;
		color: #374151;
	}

	.action-btn:hover {
		transform: translateY(-1px);
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.action-btn.emergency {
		color: #dc2626;
	}

	.action-btn.emergency:hover {
		background: rgba(254, 242, 242, 0.95);
		border-color: rgba(220, 38, 38, 0.2);
	}

	.action-btn.dispatch {
		color: #3b82f6;
	}

	.action-btn.dispatch:hover {
		background: rgba(239, 246, 255, 0.95);
		border-color: rgba(59, 130, 246, 0.2);
	}

	.action-btn.navigation {
		color: #059669;
	}

	.action-btn.navigation:hover {
		background: rgba(240, 253, 244, 0.95);
		border-color: rgba(5, 150, 105, 0.2);
	}

	/* Mobile Responsive */
	@media (max-width: 480px) {
		.schedule-header {
			padding: 12px;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.schedule-stats {
			align-self: flex-end;
			gap: 12px;
		}

		.schedule-title {
			font-size: 18px;
		}

		.route-flow {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.route-arrow {
			flex-direction: row;
			margin: 4px 0;
		}

		.arrow-line {
			width: 20px;
			height: 2px;
		}

		.location-name {
			font-size: 13px;
		}

		.barrels-value {
			font-size: 14px;
		}

		.job-header {
			padding: 12px;
		}

		.route-section {
			padding: 12px;
		}

		.job-footer {
			padding: 10px 12px;
		}
	}

	@media (max-width: 640px) {
		.scheduled-time {
			font-size: 16px !important;
		}
		
		.barrels-value {
			font-size: 18px !important;
		}
		
		.location-name {
			font-size: 15px !important;
		}
	}

	/* Critical info - larger fonts for mobile */
	.scheduled-time, .barrels-value {
		font-size: 14px;
		font-weight: 700;
		color: #1e293b;
	}

	@media (max-width: 640px) {
		.scheduled-time, .barrels-value {
			font-size: 16px !important;
		}
		
		.location-name {
			font-size: 15px !important;
			font-weight: 800 !important;
		}
	}
</style> 