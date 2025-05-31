<script lang="ts">
	import { sensorReadings, type SensorReading } from '$lib/stores/truckMonitoringData';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function getSensorIcon(sensor: SensorReading): string {
		switch (sensor.type) {
			case 'pressure': return '📈';
			case 'vacuum': return '📉';
			case 'temperature': return '🌡️';
			default: return '🔧';
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'normal': return '#22c55e';
			case 'warning': return '#f59e0b';
			case 'critical': return '#ef4444';
			default: return '#94a3b8';
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'normal': return 'NORMAL';
			case 'warning': return 'WARNING';
			case 'critical': return 'CRITICAL';
			default: return 'UNKNOWN';
		}
	}

	function formatThreshold(sensor: SensorReading): string {
		if (sensor.type === 'vacuum') {
			return `${sensor.minThreshold}${sensor.unit} to ${sensor.maxThreshold}${sensor.unit}`;
		} else {
			return `Max: ${sensor.maxThreshold}${sensor.unit}`;
		}
	}

	function getThresholdPercentage(sensor: SensorReading): number {
		if (sensor.type === 'vacuum') {
			const range = sensor.maxThreshold - sensor.minThreshold!;
			const position = sensor.currentValue - sensor.minThreshold!;
			return Math.max(0, Math.min(100, (position / range) * 100));
		} else {
			return Math.max(0, Math.min(100, (sensor.currentValue / sensor.maxThreshold) * 100));
		}
	}

	function handleSensorClick(sensor: SensorReading) {
		dispatch('sensor-clicked', { sensor });
	}

	function formatLastUpdated(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSecs = Math.floor(diffMs / 1000);
		
		if (diffSecs < 30) return 'Live';
		if (diffSecs < 60) return `${diffSecs}s ago`;
		const diffMins = Math.floor(diffSecs / 60);
		if (diffMins < 60) return `${diffMins}m ago`;
		return `${Math.floor(diffMins / 60)}h ago`;
	}
</script>

<div class="sensor-panel-container">
	<div class="panel-header">
		<h3 class="panel-title">📊 Pressure Sensor Readout</h3>
		<div class="connection-status">
			<div class="status-dot"></div>
			<span>LOVISVision Live</span>
		</div>
	</div>

	<div class="sensor-grid">
		{#each $sensorReadings as sensor (sensor.id)}
			<div 
				class="sensor-card" 
				class:normal={sensor.status === 'normal'}
				class:warning={sensor.status === 'warning'}
				class:critical={sensor.status === 'critical'}
				on:click={() => handleSensorClick(sensor)}
			>
				<div class="sensor-header">
					<div class="sensor-icon-name">
						<span class="sensor-icon">{getSensorIcon(sensor)}</span>
						<span class="sensor-name">{sensor.name}</span>
					</div>
					<div class="lovis-badge" class:active={sensor.lovisVisionCapture}>
						{sensor.lovisVisionCapture ? '📡 LOVISVision' : '❌ Manual'}
					</div>
				</div>

				<div class="sensor-reading">
					<div class="reading-value" style="color: {getStatusColor(sensor.status)}">
						{sensor.currentValue.toFixed(1)}<span class="unit">{sensor.unit}</span>
					</div>
					<div class="reading-status" style="color: {getStatusColor(sensor.status)}">
						{getStatusText(sensor.status)}
					</div>
				</div>

				<div class="pressure-bar-container">
					<div class="pressure-bar">
						<div 
							class="pressure-fill" 
							style="width: {getThresholdPercentage(sensor)}%; background-color: {getStatusColor(sensor.status)};"
						></div>
						<div class="threshold-markers">
							{#if sensor.type === 'vacuum'}
								<div class="threshold-marker min" style="left: 0%;">
									<span>{sensor.minThreshold}</span>
								</div>
								<div class="threshold-marker max" style="left: 100%;">
									<span>{sensor.maxThreshold}</span>
								</div>
							{:else}
								<div class="threshold-marker max" style="left: 100%;">
									<span>{sensor.maxThreshold}</span>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="sensor-details">
					<div class="detail-row">
						<span class="detail-label">Location:</span>
						<span class="detail-value">{sensor.location}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Range:</span>
						<span class="detail-value">{formatThreshold(sensor)}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">Updated:</span>
						<span class="detail-value">{formatLastUpdated(sensor.lastUpdated)}</span>
					</div>
				</div>

				{#if sensor.status !== 'normal'}
					<div class="alert-notice" style="border-color: {getStatusColor(sensor.status)}; background-color: {getStatusColor(sensor.status)}20;">
						<div class="alert-icon">
							{sensor.status === 'critical' ? '🚨' : '⚠️'}
						</div>
						<div class="alert-text">
							{#if sensor.status === 'critical'}
								Critical threshold exceeded! Immediate attention required.
							{:else}
								Approaching threshold limit. Monitor closely.
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="panel-footer">
		<div class="sensor-summary">
			<div class="summary-item">
				<span class="summary-count">{$sensorReadings.filter(s => s.status === 'normal').length}</span>
				<span class="summary-label">Normal</span>
			</div>
			<div class="summary-item">
				<span class="summary-count">{$sensorReadings.filter(s => s.status === 'warning').length}</span>
				<span class="summary-label">Warning</span>
			</div>
			<div class="summary-item">
				<span class="summary-count">{$sensorReadings.filter(s => s.status === 'critical').length}</span>
				<span class="summary-label">Critical</span>
			</div>
		</div>
		
		<div class="footer-info">
			<span class="info-text">All sensors configured for automatic email alerts</span>
		</div>
	</div>
</div>

<style>
	.sensor-panel-container {
		background: rgba(255, 255, 255, 0.98);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.panel-header {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		padding: 16px 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.panel-title {
		font-size: 18px;
		font-weight: 600;
		color: #0f172a;
		margin: 0;
	}

	.connection-status {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		font-weight: 500;
		color: #16a34a;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #16a34a;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.sensor-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 16px;
		padding: 20px;
	}

	.sensor-card {
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		padding: 16px;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.sensor-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.sensor-card.normal {
		border-left: 4px solid #22c55e;
	}

	.sensor-card.warning {
		border-left: 4px solid #f59e0b;
		background: rgba(245, 158, 11, 0.03);
	}

	.sensor-card.critical {
		border-left: 4px solid #ef4444;
		background: rgba(239, 68, 68, 0.03);
		animation: pulse-border 2s infinite;
	}

	@keyframes pulse-border {
		0%, 100% { border-left-width: 4px; }
		50% { border-left-width: 6px; }
	}

	.sensor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.sensor-icon-name {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sensor-icon {
		font-size: 18px;
	}

	.sensor-name {
		font-size: 14px;
		font-weight: 600;
		color: #0f172a;
	}

	.lovis-badge {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
		padding: 2px 6px;
		border-radius: 8px;
		font-size: 10px;
		font-weight: 600;
	}

	.lovis-badge.active {
		background: rgba(34, 197, 94, 0.1);
		color: #16a34a;
	}

	.sensor-reading {
		text-align: center;
		margin-bottom: 16px;
	}

	.reading-value {
		font-size: 32px;
		font-weight: 800;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1;
	}

	.unit {
		font-size: 18px;
		font-weight: 600;
		margin-left: 4px;
	}

	.reading-status {
		font-size: 12px;
		font-weight: 600;
		margin-top: 4px;
		letter-spacing: 0.5px;
	}

	.pressure-bar-container {
		margin-bottom: 12px;
	}

	.pressure-bar {
		height: 8px;
		background: rgba(0, 0, 0, 0.1);
		border-radius: 4px;
		overflow: hidden;
		position: relative;
		margin-bottom: 8px;
	}

	.pressure-fill {
		height: 100%;
		transition: all 0.3s ease;
		border-radius: 4px;
	}

	.threshold-markers {
		position: relative;
		height: 16px;
	}

	.threshold-marker {
		position: absolute;
		transform: translateX(-50%);
		font-size: 9px;
		color: #64748b;
		font-weight: 600;
		font-family: 'JetBrains Mono', monospace;
	}

	.threshold-marker.min {
		color: #ef4444;
	}

	.threshold-marker.max {
		color: #dc2626;
	}

	.sensor-details {
		margin-bottom: 12px;
	}

	.detail-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		margin-bottom: 4px;
	}

	.detail-label {
		color: #64748b;
	}

	.detail-value {
		color: #374151;
		font-weight: 500;
	}

	.alert-notice {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		border: 1px solid;
		border-radius: 6px;
		font-size: 11px;
	}

	.alert-icon {
		font-size: 14px;
	}

	.alert-text {
		flex: 1;
		line-height: 1.3;
		font-weight: 500;
	}

	.panel-footer {
		background: rgba(248, 250, 252, 0.8);
		border-top: 1px solid rgba(0, 0, 0, 0.05);
		padding: 16px 20px;
	}

	.sensor-summary {
		display: flex;
		justify-content: center;
		gap: 24px;
		margin-bottom: 12px;
	}

	.summary-item {
		text-align: center;
	}

	.summary-count {
		display: block;
		font-size: 18px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	.summary-label {
		display: block;
		font-size: 11px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 2px;
	}

	.footer-info {
		text-align: center;
	}

	.info-text {
		font-size: 10px;
		color: #94a3b8;
		font-style: italic;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.sensor-grid {
			grid-template-columns: 1fr;
		}

		.panel-header {
			flex-direction: column;
			gap: 8px;
			align-items: flex-start;
		}

		.sensor-summary {
			justify-content: space-around;
		}
	}
</style> 