<script lang="ts">
	import type { DemoYardData } from '$lib/stores/dispatchAnalytics';
	import { AlertTriangle, TrendingUp, TrendingDown, MapPin, Truck, Activity } from 'lucide-svelte';
	import { STATUS_INDICATORS, LABELS } from '$lib/constants';

	export let yard: DemoYardData;
	export let handleDrillDown: (targetLevel: string, id?: string) => void;

	function handleClick() {
		handleDrillDown('yard', yard.id);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'excellent': return 'text-success bg-green-100 text-success-dark dark:bg-green-900/20';
			case 'good': return 'text-info bg-blue-100 text-info-dark dark:bg-blue-900/20';
			case 'attention': return 'text-warning bg-yellow-100 text-warning-dark dark:bg-yellow-900/20';
			case 'critical': return 'text-error bg-red-100 text-error-dark dark:bg-red-900/20';
			default: return 'text-neutral bg-gray-100 text-neutral-dark dark:bg-gray-900/20';
		}
	}

	function formatRevenue(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	$: efficiencyTrend = yard.efficiency >= 90 ? 'up' : 'down';
	$: hasAlerts = yard.alerts.length > 0;
</script>

<button class="yard-card dashboard-card-hover" on:click={handleClick}>
	<div class="card-header">
		<div class="yard-info">
			<h3 class="yard-name">{yard.name}</h3>
			<div class="yard-location">
				<MapPin class="w-4 h-4" />
				{yard.location}
			</div>
		</div>
		
		<div class="status-badge {getStatusColor(yard.status)}">
			{#if hasAlerts}
				<AlertTriangle class="w-4 h-4" />
			{/if}
			{yard.status}
		</div>
	</div>

	<div class="card-metrics">
		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Trucks Active</div>
				<div class="metric-value">
					<Truck class="w-4 h-4" />
					{yard.activeTrucks}/{yard.totalTrucks}
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Today's Hauls</div>
				<div class="metric-value">{yard.todayHauls}</div>
			</div>
		</div>

		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Efficiency</div>
				<div class="metric-value efficiency-metric">
					{#if efficiencyTrend === 'up'}
						<TrendingUp class="w-4 h-4 text-success" />
					{:else}
						<TrendingDown class="w-4 h-4 text-error" />
					{/if}
					<span class="text-highlight">{yard.efficiency.toFixed(1)}%</span>
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Revenue</div>
				<div class="metric-value">{formatRevenue(yard.revenue)}</div>
			</div>
		</div>

		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Volume Loss</div>
				<div class="metric-value">
					<span class="{yard.avgVolumeLoss > 3 ? 'text-error' : yard.avgVolumeLoss > 1.5 ? 'text-warning' : 'text-success'}">
						{yard.avgVolumeLoss.toFixed(1)}%
					</span>
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Loading Bays</div>
				<div class="metric-value">
					<Activity class="w-4 h-4" />
					{yard.activeBays}/{yard.loadingBays}
				</div>
			</div>
		</div>
	</div>

	{#if hasAlerts}
		<div class="card-alerts">
			{#each yard.alerts as alert}
				<div class="alert-item severity-{alert.severity}">
					<AlertTriangle class="w-3 h-3" />
					{alert.summary}
				</div>
			{/each}
		</div>
	{/if}

	<div class="card-footer">
		<span class="click-hint">Click to view yard details</span>
	</div>
</button>

<style>
	.yard-card {
		@apply w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left cursor-pointer;
	}

	.yard-card:hover {
		@apply transform -translate-y-1;
	}

	.card-header {
		@apply flex justify-between items-start mb-4;
	}

	.yard-info {
		@apply flex-1;
	}

	.yard-name {
		@apply text-lg font-semibold text-gray-900 dark:text-white mb-1;
	}

	.yard-location {
		@apply flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300;
	}

	.status-badge {
		@apply flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium;
	}

	.card-metrics {
		@apply space-y-3 mb-4;
	}

	.metric-row {
		@apply flex justify-between gap-4;
	}

	.metric {
		@apply flex-1;
	}

	.metric-label {
		@apply text-xs text-gray-500 dark:text-gray-400 font-medium mb-1;
	}

	.metric-value {
		@apply flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white;
	}

	.efficiency-metric {
		@apply text-base;
	}

	.card-alerts {
		@apply space-y-2 mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800;
	}

	.alert-item {
		@apply flex items-center gap-2 text-xs;
	}

	.alert-item.severity-low {
		@apply text-info text-info-dark;
	}

	.alert-item.severity-medium {
		@apply text-warning text-warning-dark;
	}

	.alert-item.severity-high {
		@apply text-warning text-warning-dark;
	}

	.alert-item.severity-critical {
		@apply text-error text-error-dark;
	}

	.card-footer {
		@apply pt-3 border-t border-gray-100 dark:border-gray-700;
	}

	.click-hint {
		@apply text-xs text-neutral text-neutral-dark;
	}
</style> 