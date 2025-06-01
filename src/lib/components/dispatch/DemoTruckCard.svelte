<script lang="ts">
	import type { DemoTruckData } from '$lib/stores/dispatchAnalytics';
	import { dispatchAnalytics } from '$lib/stores/dispatchAnalytics';
	import { AlertTriangle, TrendingUp, TrendingDown, Truck, User, Clock, Wrench } from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';

	export let truck: DemoTruckData;

	function handleClick() {
		dispatchAnalytics.drillDown('truck', truck.id);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'active': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
			case 'loading': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
			case 'transit': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
			case 'maintenance': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
			case 'available': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
			default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
		}
	}

	function getEfficiencyColor(efficiency: number) {
		if (efficiency >= 95) return 'text-green-600 dark:text-green-400';
		if (efficiency >= 85) return 'text-blue-600 dark:text-blue-400';
		if (efficiency >= 75) return 'text-yellow-600 dark:text-yellow-400';
		return 'text-red-600 dark:text-red-400';
	}

	$: efficiencyTrend = truck.efficiency >= 90 ? 'up' : 'down';
	$: hasAlerts = truck.alerts.length > 0;
	$: efficiencyColor = getEfficiencyColor(truck.efficiency);
	$: lastHaulText = truck.lastHaulTime ? formatDistanceToNow(truck.lastHaulTime, { addSuffix: true }) : 'No recent hauls';
	$: nextScheduledText = truck.nextScheduled ? formatDistanceToNow(truck.nextScheduled, { addSuffix: true }) : 'Not scheduled';
</script>

<button class="truck-card" on:click={handleClick} class:problem={truck.efficiency < 80}>
	<div class="card-header">
		<div class="truck-info">
			<h3 class="truck-id">{truck.id}</h3>
			<div class="truck-model">
				<Truck class="w-4 h-4" />
				{truck.model} ({truck.year})
			</div>
			<div class="driver-info">
				<User class="w-4 h-4" />
				{truck.driverName}
			</div>
		</div>
		
		<div class="status-badge {getStatusColor(truck.currentStatus)}">
			{#if hasAlerts}
				<AlertTriangle class="w-4 h-4" />
			{/if}
			{truck.currentStatus}
		</div>
	</div>

	<div class="card-metrics">
		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Today's Hauls</div>
				<div class="metric-value">{truck.todayHauls}</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Week Total</div>
				<div class="metric-value">{truck.weekHauls}</div>
			</div>
		</div>

		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Efficiency</div>
				<div class="metric-value efficiency-metric {efficiencyColor}">
					{#if efficiencyTrend === 'up'}
						<TrendingUp class="w-4 h-4" />
					{:else}
						<TrendingDown class="w-4 h-4" />
					{/if}
					{truck.efficiency.toFixed(1)}%
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Avg Volume Loss</div>
				<div class="metric-value" class:text-red-600={truck.avgVolumeLoss > 3} class:dark:text-red-400={truck.avgVolumeLoss > 3}>
					{truck.avgVolumeLoss.toFixed(1)}%
				</div>
			</div>
		</div>

		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Safety Score</div>
				<div class="metric-value">
					{truck.safetyScore.toFixed(1)}%
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Fuel Efficiency</div>
				<div class="metric-value">
					{truck.fuelEfficiency.toFixed(1)} MPG
				</div>
			</div>
		</div>

		<div class="timing-info">
			<div class="timing-item">
				<Clock class="w-4 h-4" />
				<span class="timing-label">Last haul:</span>
				<span class="timing-value">{lastHaulText}</span>
			</div>
			
			{#if truck.nextScheduled}
				<div class="timing-item">
					<Clock class="w-4 h-4" />
					<span class="timing-label">Next haul:</span>
					<span class="timing-value">{nextScheduledText}</span>
				</div>
			{/if}

			{#if truck.currentStatus === 'maintenance'}
				<div class="timing-item maintenance">
					<Wrench class="w-4 h-4" />
					<span class="timing-label">Maintenance:</span>
					<span class="timing-value">In progress</span>
				</div>
			{/if}
		</div>
	</div>

	{#if hasAlerts}
		<div class="card-alerts">
			{#each truck.alerts as alert}
				<div class="alert-item severity-{alert.severity}">
					<AlertTriangle class="w-3 h-3" />
					{alert.summary}
				</div>
			{/each}
		</div>
	{/if}

	<div class="card-footer">
		<span class="click-hint">Click to view truck details</span>
	</div>
</button>

<style>
	.truck-card {
		@apply w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left cursor-pointer;
	}

	.truck-card:hover {
		@apply transform -translate-y-1;
	}

	.truck-card.problem {
		@apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/5;
	}

	.truck-card.problem:hover {
		@apply border-red-300 dark:border-red-600;
	}

	.card-header {
		@apply flex justify-between items-start mb-4;
	}

	.truck-info {
		@apply flex-1;
	}

	.truck-id {
		@apply text-lg font-bold text-gray-900 dark:text-white mb-1;
	}

	.truck-model {
		@apply flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-1;
	}

	.driver-info {
		@apply flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300;
	}

	.status-badge {
		@apply flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize;
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
		@apply text-base font-bold;
	}

	.timing-info {
		@apply space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700;
	}

	.timing-item {
		@apply flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300;
	}

	.timing-item.maintenance {
		@apply text-red-600 dark:text-red-400;
	}

	.timing-label {
		@apply font-medium;
	}

	.timing-value {
		@apply font-mono;
	}

	.card-alerts {
		@apply space-y-2 mb-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800;
	}

	.alert-item {
		@apply flex items-center gap-2 text-xs;
	}

	.alert-item.severity-low {
		@apply text-blue-600 dark:text-blue-400;
	}

	.alert-item.severity-medium {
		@apply text-yellow-600 dark:text-yellow-400;
	}

	.alert-item.severity-high {
		@apply text-orange-600 dark:text-orange-400;
	}

	.alert-item.severity-critical {
		@apply text-red-600 dark:text-red-400;
	}

	.card-footer {
		@apply pt-3 border-t border-gray-100 dark:border-gray-700;
	}

	.click-hint {
		@apply text-xs text-gray-400 dark:text-gray-500;
	}
</style> 