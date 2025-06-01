<script lang="ts">
	import { Gauge, Clock, MapPin, BarChart3 } from 'lucide-svelte';
	import { jobTrackingStore } from './stores/jobTracking.js';

	export let job: any;

	$: trackingState = $jobTrackingStore;

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}
</script>

<div class="metrics-section">
	<h3 class="section-title">Live Metrics</h3>
	
	<div class="metrics-grid">
		<div class="metric-card speed">
			<div class="metric-icon">
				<Gauge size={20} />
			</div>
			<div class="metric-content">
				<span class="metric-value">{trackingState.currentSpeed}</span>
				<span class="metric-unit">mph</span>
				<span class="metric-label">Current Speed</span>
			</div>
		</div>

		<div class="metric-card distance">
			<div class="metric-icon">
				<MapPin size={20} />
			</div>
			<div class="metric-content">
				<span class="metric-value">{trackingState.distanceRemaining}</span>
				<span class="metric-unit">mi</span>
				<span class="metric-label">Distance Remaining</span>
			</div>
		</div>

		<div class="metric-card eta">
			<div class="metric-icon">
				<Clock size={20} />
			</div>
			<div class="metric-content">
				<span class="metric-value">{formatTime(trackingState.estimatedArrival)}</span>
				<span class="metric-unit"></span>
				<span class="metric-label">ETA to Pickup</span>
			</div>
		</div>

		<div class="metric-card total-distance">
			<div class="metric-icon">
				<BarChart3 size={20} />
			</div>
			<div class="metric-content">
				<span class="metric-value">{job.distance}</span>
				<span class="metric-unit">mi</span>
				<span class="metric-label">Total Route</span>
			</div>
		</div>
	</div>

	<!-- Route Summary -->
	<div class="route-summary-card">
		<div class="route-info">
			<div class="route-badge primary">
				<span class="route-distance">{job.distance} miles</span>
				<span class="route-separator">•</span>
				<span class="route-time">{Math.round(job.estimatedDuration * 60)} min</span>
			</div>
			<div class="route-status">
				<span class="status-label">Route to Pickup</span>
				<span class="eta-info">ETA: {formatTime(trackingState.estimatedArrival)}</span>
			</div>
		</div>
	</div>
</div>

<style>
	.metrics-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 16px 0;
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}

	.metric-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: white;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		transition: all 0.2s ease;
	}

	.metric-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.metric-card.speed {
		border-color: #8b5cf6;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.02) 100%);
	}

	.metric-card.distance {
		border-color: #3b82f6;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%);
	}

	.metric-card.eta {
		border-color: #059669;
		background: linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(4, 120, 87, 0.02) 100%);
	}

	.metric-card.total-distance {
		border-color: #f59e0b;
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%);
	}

	.metric-icon {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.speed .metric-icon {
		background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
		color: white;
	}

	.distance .metric-icon {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
	}

	.eta .metric-icon {
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
		color: white;
	}

	.total-distance .metric-icon {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		color: white;
	}

	.metric-content {
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 2px;
	}

	.metric-value {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
		line-height: 1;
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
	}

	.metric-unit {
		font-size: 12px;
		font-weight: 600;
		color: #64748b;
		opacity: 0.8;
	}

	.metric-label {
		font-size: 11px;
		font-weight: 500;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.route-summary-card {
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 12px;
		padding: 16px;
	}

	.route-info {
		display: flex;
		flex-direction: column;
		gap: 8px;
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
</style> 