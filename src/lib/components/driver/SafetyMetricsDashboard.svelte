<script lang="ts">
	import { Gauge, Zap, Thermometer, Clock } from 'lucide-svelte';

	// Props from parent InTransitView
	export let transitSpeed: number;
	export let maxSpeedAlert: number;
	export let tankPressure: number;
	export let loadTemperature: number;
	export let estimatedArrival: Date;

	// Functions
	function getSpeedStatus() {
		if (transitSpeed > maxSpeedAlert) return 'warning';
		if (transitSpeed > maxSpeedAlert - 5) return 'caution';
		return 'normal';
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}

	function formatTimeRemaining() {
		const now = new Date();
		const diffMs = estimatedArrival.getTime() - now.getTime();
		const hours = Math.floor(diffMs / (1000 * 60 * 60));
		const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	}
</script>

<!-- Safety Dashboard -->
<div class="safety-dashboard">
	<div class="metrics-row">
		<div class="metric-card {getSpeedStatus()}">
			<div class="metric-icon">
				<Gauge size={20} />
			</div>
			<div class="metric-value">{transitSpeed}</div>
			<div class="metric-label">MPH</div>
			<div class="metric-status">Max: {maxSpeedAlert}</div>
		</div>
		
		<div class="metric-card">
			<div class="metric-icon">
				<Zap size={20} />
			</div>
			<div class="metric-value">{tankPressure}</div>
			<div class="metric-label">PSI</div>
			<div class="metric-status">Normal</div>
		</div>
		
		<div class="metric-card">
			<div class="metric-icon">
				<Thermometer size={20} />
			</div>
			<div class="metric-value">{loadTemperature}°</div>
			<div class="metric-label">Load Temp</div>
			<div class="metric-status">Optimal</div>
		</div>
		
		<div class="metric-card active">
			<div class="metric-icon">
				<Clock size={24} />
			</div>
			<div class="metric-value">{formatTimeRemaining()}</div>
			<div class="metric-label">ETA</div>
			<div class="metric-status">{formatTime(estimatedArrival)}</div>
		</div>
	</div>
</div>

<style>
	/* Safety Dashboard - Mobile First */
	.safety-dashboard {
		background: rgba(15, 23, 42, 0.8);
		border: 1px solid rgba(59, 130, 246, 0.1);
		border-radius: 10px;
		padding: 0;
		overflow: hidden;
	}

	.metrics-row {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1px;
		width: 100%;
	}

	.metric-card {
		background: rgba(15, 23, 42, 0.95);
		padding: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		position: relative;
		min-height: 80px;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.metric-card.active {
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	.metric-card.normal {
		border-left: 3px solid #22c55e;
	}

	.metric-card.caution {
		border-left: 3px solid #f59e0b;
		background: rgba(245, 158, 11, 0.05);
	}

	.metric-card.warning {
		border-left: 3px solid #ef4444;
		background: rgba(239, 68, 68, 0.1);
		animation: pulse-warning 2s infinite;
	}

	.metric-icon {
		color: #60a5fa;
		opacity: 0.8;
	}

	.metric-value {
		font-size: 18px;
		font-weight: 700;
		color: white;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1;
	}

	.metric-label {
		font-size: 10px;
		color: #94a3b8;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.metric-status {
		font-size: 9px;
		color: #64748b;
		text-align: center;
		line-height: 1.2;
	}

	.metric-card.warning .metric-status {
		color: #fca5a5;
	}

	.metric-card.caution .metric-status {
		color: #fbbf24;
	}

	@keyframes pulse-warning {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
		}
	}

	/* Tablet adjustments */
	@media (min-width: 768px) {
		.metrics-row {
			grid-template-columns: repeat(4, 1fr);
		}

		.metric-card {
			padding: 16px;
			min-height: 100px;
		}

		.metric-value {
			font-size: 24px;
		}

		.metric-label {
			font-size: 11px;
		}

		.metric-status {
			font-size: 10px;
		}
	}

	/* Desktop optimizations */
	@media (min-width: 1024px) {
		.safety-dashboard {
			border-radius: 12px;
		}

		.metric-card {
			padding: 20px;
			min-height: 110px;
		}

		.metric-value {
			font-size: 28px;
		}
	}
</style> 