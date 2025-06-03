<script lang="ts">
	import { valveStatuses, toggleValve, type ValveStatus } from '$lib/stores/truckMonitoringData';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function getValveIcon(valve: ValveStatus): string {
		switch (valve.id) {
			case 'fire-valve': return '🔥';
			case 'belly-valve': return '🛢️';
			case 'vent-valve': return '💨';
			case 'right-load-valve': return '➡️';
			case 'left-load-valve': return '⬅️';
			case 'pressure-relief-vent': return '🔧';
			default: return '⚙️';
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'open': return '#22c55e';
			case 'closed': return '#ef4444';
			case 'unknown': return '#f59e0b';
			default: return '#94a3b8';
		}
	}

	function getStatusIcon(status: string): string {
		switch (status) {
			case 'open': return '🟢';
			case 'closed': return '🔴';
			case 'unknown': return '🟡';
			default: return '⚫';
		}
	}

	function handleValveToggle(valve: ValveStatus) {
		if (valve.requiresConfirmation) {
			const confirmed = confirm(`Toggle ${valve.name}?\nCurrent status: ${valve.status.toUpperCase()}`);
			if (confirmed) {
				toggleValve(valve.id);
				dispatch('valve-toggled', { valve });
			}
		} else {
			toggleValve(valve.id);
			dispatch('valve-toggled', { valve });
		}
	}

	function formatLastUpdated(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${Math.floor(diffHours / 24)}d ago`;
	}
</script>

<div class="valve-panel-container">
	<div class="panel-header">
		<h3 class="panel-title">🎛️ Valve Status Board</h3>
		<div class="valve-count">
			{$valveStatuses.length} valves monitored
		</div>
	</div>

	<div class="valve-grid">
		{#each $valveStatuses as valve (valve.id)}
			<div class="valve-card" class:critical={valve.status === 'unknown'}>
				<div class="valve-header">
					<div class="valve-icon-name">
						<span class="valve-icon">{getValveIcon(valve)}</span>
						<span class="valve-name">{valve.name}</span>
					</div>
					<div class="valve-status-indicator" style="color: {getStatusColor(valve.status)}">
						{getStatusIcon(valve.status)}
					</div>
				</div>
				
				<div class="valve-details">
					<div class="status-text" style="color: {getStatusColor(valve.status)}">
						{valve.status.toUpperCase()}
					</div>
					<div class="location-text">{valve.location}</div>
				</div>

				<div class="valve-info">
					<div class="info-row">
						<span class="info-label">Sensor:</span>
						<span class="info-value">{valve.hassensor ? '✅ Yes' : '❌ No'}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Air Actuated:</span>
						<span class="info-value">{valve.isAirActuated ? '✅ Yes' : '❌ No'}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Last Updated:</span>
						<span class="info-value">{formatLastUpdated(valve.lastUpdated)}</span>
					</div>
				</div>

				<div class="valve-actions">
					<button 
						class="toggle-btn" 
						class:open={valve.status === 'open'}
						class:closed={valve.status === 'closed'}
						on:click={() => handleValveToggle(valve)}
						disabled={valve.status === 'unknown'}
					>
						{#if valve.status === 'unknown'}
							⚠️ Status Unknown
						{:else}
							{valve.status === 'open' ? '🔒 Close Valve' : '🔓 Open Valve'}
						{/if}
					</button>
					
					{#if valve.requiresConfirmation}
						<div class="confirmation-notice">
							⚠️ Requires confirmation
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="panel-footer">
		<div class="status-summary">
			<div class="summary-item">
				<span class="summary-count">{$valveStatuses.filter(v => v.status === 'open').length}</span>
				<span class="summary-label">Open</span>
			</div>
			<div class="summary-item">
				<span class="summary-count">{$valveStatuses.filter(v => v.status === 'closed').length}</span>
				<span class="summary-label">Closed</span>
			</div>
			<div class="summary-item">
				<span class="summary-count">{$valveStatuses.filter(v => v.status === 'unknown').length}</span>
				<span class="summary-label">Unknown</span>
			</div>
		</div>
	</div>
</div>

<style>
	.valve-panel-container {
		background: rgba(255, 255, 255, 0.98);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.panel-header {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		padding: 20px 24px;
		border-bottom: 1px solid rgba(148, 163, 184, 0.2);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.panel-title {
		font-size: 20px;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.valve-count {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
		padding: 6px 12px;
		border-radius: 16px;
		font-size: 13px;
		font-weight: 600;
		border: 1px solid rgba(59, 130, 246, 0.2);
	}

	.valve-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 20px;
		padding: 24px;
	}

	.valve-card {
		background: rgba(248, 250, 252, 0.9);
		border: 1px solid rgba(148, 163, 184, 0.15);
		border-radius: 12px;
		padding: 20px;
		transition: all 0.3s ease;
		backdrop-filter: blur(5px);
	}

	.valve-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		border-color: rgba(148, 163, 184, 0.25);
	}

	.valve-card.critical {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.05);
		box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
	}

	.valve-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(148, 163, 184, 0.1);
	}

	.valve-icon-name {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.valve-icon {
		font-size: 20px;
	}

	.valve-name {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.valve-status-indicator {
		font-size: 18px;
		font-weight: 600;
	}

	.valve-details {
		margin-bottom: 16px;
	}

	.status-text {
		font-size: 16px;
		font-weight: 700;
		margin-bottom: 4px;
		font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
		letter-spacing: 0.5px;
	}

	.location-text {
		font-size: 14px;
		color: #64748b;
		font-weight: 500;
	}

	.valve-info {
		margin-bottom: 20px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
		margin-bottom: 6px;
		font-weight: 500;
	}

	.info-row:last-child {
		margin-bottom: 0;
	}

	.info-label {
		color: #64748b;
	}

	.info-value {
		color: #374151;
		font-weight: 600;
	}

	.valve-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.toggle-btn {
		width: 100%;
		padding: 12px 16px;
		border: 2px solid transparent;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.toggle-btn.open {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		color: white;
		border-color: rgba(220, 38, 38, 0.3);
		box-shadow: 0 4px 16px rgba(220, 38, 38, 0.3);
	}

	.toggle-btn.closed {
		background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
		color: white;
		border-color: rgba(22, 163, 74, 0.3);
		box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3);
	}

	.toggle-btn:disabled {
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
		color: white;
		cursor: not-allowed;
		opacity: 0.7;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.toggle-btn:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	.confirmation-notice {
		background: rgba(245, 158, 11, 0.1);
		color: #d97706;
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		text-align: center;
		border: 1px solid rgba(245, 158, 11, 0.2);
	}

	.panel-footer {
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
		padding: 20px 24px;
		border-top: 1px solid rgba(148, 163, 184, 0.2);
	}

	.status-summary {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		text-align: center;
	}

	.summary-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.summary-count {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
	}

	.summary-label {
		font-size: 12px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.valve-grid {
			grid-template-columns: 1fr;
			padding: 20px;
			gap: 16px;
		}

		.valve-card {
			padding: 16px;
		}

		.panel-header {
			padding: 16px 20px;
		}

		.panel-title {
			font-size: 18px;
		}

		.valve-name {
			font-size: 15px;
		}

		.status-text {
			font-size: 15px;
		}

		.panel-footer {
			padding: 16px 20px;
		}

		.summary-count {
			font-size: 20px;
		}
	}

	@media (max-width: 480px) {
		.valve-grid {
			padding: 16px;
		}

		.valve-card {
			padding: 12px;
		}

		.panel-header {
			padding: 12px 16px;
			flex-direction: column;
			gap: 8px;
			align-items: flex-start;
		}

		.valve-count {
			align-self: stretch;
			text-align: center;
		}
	}
</style> 