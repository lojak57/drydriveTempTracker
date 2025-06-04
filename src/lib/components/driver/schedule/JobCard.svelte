<script lang="ts">
	import { MapPin, Clock, Gauge, ChevronRight, Timer, Zap } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// Job interface
	interface ScheduledJob {
		id: string;
		accountName: string;
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
		estimatedDuration: number;
		priority: 'urgent' | 'high' | 'normal' | 'low';
		status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
		distance: number;
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

	// Props
	export let job: ScheduledJob;
	export let index: number;
	export let isHighlighted: boolean = false;

	// DEBUG: Log highlighting status
	$: if (isHighlighted) {
		console.log('🟡 JobCard highlighted:', job.id, 'index:', index);
	}

	// Utility functions
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

	function selectJob() {
		dispatch('job-selected', { job });
	}
</script>

<div 
	class="job-card tap-target {isJobOverdue(job.scheduledTime) ? 'overdue' : ''} {isJobSoon(job.scheduledTime) ? 'soon' : ''} {isHighlighted ? 'highlighted' : ''}"
	on:click={selectJob}
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

<style>
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

	/* Highlighted job card with yellow background */
	.job-card.highlighted {
		background: linear-gradient(135deg, #fef3c7 0%, #fde047 80%);
		border: 2px solid #f59e0b;
		box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
		transform: translateY(-2px);
		border-left: 6px solid #f59e0b !important;
	}

	.job-card.highlighted:hover {
		background: linear-gradient(135deg, #fde047 0%, #facc15 100%);
		border-color: #d97706;
		box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
		transform: translateY(-3px);
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
		grid-template-columns: 84px 1fr 96px;
		column-gap: 24px;
		padding: 20px 16px;
		align-items: center;
		min-height: 100px;
	}

	/* Time and Barrels Section - Hard Left Alignment */
	.time-barrels-section {
		width: 84px;
		padding: 0;
		text-align: left;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 8px;
	}

	.time-display {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
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
		align-items: flex-start;
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

	/* Route Display */
	.route-display {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	/* Job Header Info */
	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin: 0;
	}

	.account-name {
		min-width: 0;
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
		background: #f1f5f9;
		color: #475569;
		border: 1px solid #e2e8f0;
	}

	/* Route Line */
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
		background: #6b7280;
	}

	.location-text {
		min-width: 0;
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

	/* Action Section */
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

	/* Tap targets */
	.tap-target {
		min-height: 44px;
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
			min-width: 75px;
		}

		.route-display {
			grid-column: 1 / -1;
			grid-row: 2;
		}

		.action-section {
			grid-column: 2;
			grid-row: 1;
			align-items: flex-end;
			min-width: 90px;
		}

		.job-header {
			flex-direction: column;
			gap: 8px;
			align-items: flex-start;
		}

		.route-line {
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