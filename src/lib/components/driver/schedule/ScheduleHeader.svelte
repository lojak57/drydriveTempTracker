<script lang="ts">
	// Props from parent DriverSchedule
	export let driverInfo: any;
	export let currentTime: Date;
	export let totalJobs: number;
	export let urgentJobs: number;

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: '2-digit', 
			minute: '2-digit',
			hour12: true 
		});
	}
</script>

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

<style>
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
</style> 