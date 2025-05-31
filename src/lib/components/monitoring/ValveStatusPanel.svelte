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

	.valve-count {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.valve-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 16px;
		padding: 20px;
	}

	.valve-card {
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		padding: 16px;
		transition: all 0.2s ease;
	}

	.valve-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.valve-card.critical {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.05);
	}

	.valve-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.valve-icon-name {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.valve-icon {
		font-size: 18px;
	}

	.valve-name {
		font-size: 14px;
		font-weight: 600;
		color: #0f172a;
	}

	.valve-status-indicator {
		font-size: 16px;
	}

	.valve-details {
		margin-bottom: 12px;
	}

	.status-text {
		font-size: 16px;
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
		margin-bottom: 4px;
	}

	.location-text {
		font-size: 12px;
		color: #64748b;
		font-style: italic;
	}

	.valve-info {
		margin-bottom: 12px;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		margin-bottom: 4px;
	}

	.info-label {
		color: #64748b;
	}

	.info-value {
		color: #374151;
		font-weight: 500;
	}

	.valve-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.toggle-btn {
		padding: 8px 12px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.toggle-btn.open {
		background: #22c55e;
		color: white;
		border-color: #22c55e;
	}

	.toggle-btn.closed {
		background: #ef4444;
		color: white;
		border-color: #ef4444;
	}

	.toggle-btn:disabled {
		background: #f59e0b;
		color: white;
		border-color: #f59e0b;
		cursor: not-allowed;
	}

	.toggle-btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.confirmation-notice {
		font-size: 10px;
		color: #f59e0b;
		text-align: center;
		font-weight: 500;
	}

	.panel-footer {
		background: rgba(248, 250, 252, 0.8);
		border-top: 1px solid rgba(0, 0, 0, 0.05);
		padding: 16px 20px;
	}

	.status-summary {
		display: flex;
		justify-content: center;
		gap: 24px;
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

	/* Mobile responsive */
	@media (max-width: 768px) {
		.valve-grid {
			grid-template-columns: 1fr;
		}

		.panel-header {
			flex-direction: column;
			gap: 8px;
			align-items: flex-start;
		}

		.status-summary {
			justify-content: space-around;
		}
	}
</style> 