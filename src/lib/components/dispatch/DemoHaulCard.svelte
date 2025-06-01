<script lang="ts">
	import type { DemoHaulData } from '$lib/stores/dispatchAnalytics';
	import { dispatchAnalytics } from '$lib/stores/dispatchAnalytics';
	import { AlertTriangle, MapPin, DollarSign, Thermometer, Droplets, Clock } from 'lucide-svelte';
	import { format, formatDistanceToNow } from 'date-fns';

	export let haul: DemoHaulData;

	function handleClick() {
		dispatchAnalytics.drillDown('haul', haul.id);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
			case 'in-progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
			case 'scheduled': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
			default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
		}
	}

	function formatVolume(volume: number) {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1
		}).format(volume);
	}

	function formatRevenue(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	$: hasAlerts = haul.alerts.length > 0;
	$: isProblemHaul = haul.volumeLossPercent > 3 || haul.efficiency < 80 || hasAlerts;
	$: timeAgo = haul.endTime ? formatDistanceToNow(haul.endTime, { addSuffix: true }) : 
	           haul.status === 'in-progress' ? 'In progress' : 
	           formatDistanceToNow(haul.startTime, { addSuffix: true });
	$: duration = haul.duration ? `${Math.floor(haul.duration / 60)}h ${haul.duration % 60}m` : '';
</script>

<button class="haul-card" on:click={handleClick} class:problem={isProblemHaul}>
	<div class="card-header">
		<div class="haul-info">
			<h3 class="haul-id">{haul.id}</h3>
			<div class="route-info">
				<MapPin class="w-4 h-4" />
				<span class="route-text">{haul.origin} → {haul.destination}</span>
			</div>
			<div class="customer-info">
				{haul.customer}
			</div>
		</div>
		
		<div class="status-badge {getStatusColor(haul.status)}">
			{#if hasAlerts}
				<AlertTriangle class="w-4 h-4" />
			{/if}
			{haul.status.replace('-', ' ')}
		</div>
	</div>

	<div class="card-metrics">
		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Volume Loaded</div>
				<div class="metric-value">
					<Droplets class="w-4 h-4" />
					{formatVolume(haul.onloadVolume)} bbl
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Volume Delivered</div>
				<div class="metric-value">
					{formatVolume(haul.offloadVolume)} bbl
				</div>
			</div>
		</div>

		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Volume Loss</div>
				<div class="metric-value loss-metric" 
				     class:text-red-600={haul.volumeLossPercent > 3} 
				     class:dark:text-red-400={haul.volumeLossPercent > 3}
				     class:text-yellow-600={haul.volumeLossPercent > 2 && haul.volumeLossPercent <= 3}
				     class:dark:text-yellow-400={haul.volumeLossPercent > 2 && haul.volumeLossPercent <= 3}>
					{haul.volumeLossPercent.toFixed(1)}%
					<span class="loss-amount">({formatVolume(haul.volumeLoss)} bbl)</span>
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Efficiency</div>
				<div class="metric-value efficiency-metric"
				     class:text-green-600={haul.efficiency >= 95}
				     class:dark:text-green-400={haul.efficiency >= 95}
				     class:text-blue-600={haul.efficiency >= 85 && haul.efficiency < 95}
				     class:dark:text-blue-400={haul.efficiency >= 85 && haul.efficiency < 95}
				     class:text-yellow-600={haul.efficiency >= 75 && haul.efficiency < 85}
				     class:dark:text-yellow-400={haul.efficiency >= 75 && haul.efficiency < 85}
				     class:text-red-600={haul.efficiency < 75}
				     class:dark:text-red-400={haul.efficiency < 75}>
					{haul.efficiency.toFixed(1)}%
				</div>
			</div>
		</div>

		<div class="metric-row">
			<div class="metric">
				<div class="metric-label">Temperature</div>
				<div class="metric-value temp-metric">
					<Thermometer class="w-4 h-4" />
					{haul.avgTemp.toFixed(1)}°F
					{#if Math.abs(haul.maxTemp - haul.minTemp) > 30}
						<span class="temp-variance text-red-500 dark:text-red-400">
							(±{Math.abs(haul.maxTemp - haul.minTemp).toFixed(0)}°F)
						</span>
					{/if}
				</div>
			</div>
			
			<div class="metric">
				<div class="metric-label">Revenue</div>
				<div class="metric-value">
					<DollarSign class="w-4 h-4" />
					{formatRevenue(haul.revenue)}
				</div>
			</div>
		</div>

		<div class="timing-info">
			<div class="timing-item">
				<Clock class="w-4 h-4" />
				<span class="timing-label">Duration:</span>
				<span class="timing-value">{duration}</span>
			</div>
			
			<div class="timing-item">
				<span class="timing-label">{haul.status === 'completed' ? 'Completed:' : 'Started:'}</span>
				<span class="timing-value">{timeAgo}</span>
			</div>

			<div class="timing-item">
				<span class="timing-label">Distance:</span>
				<span class="timing-value">{haul.distance} miles</span>
			</div>
		</div>
	</div>

	{#if hasAlerts}
		<div class="card-alerts">
			{#each haul.alerts as alert}
				<div class="alert-item severity-{alert.severity}">
					<AlertTriangle class="w-3 h-3" />
					{alert.summary}
				</div>
			{/each}
		</div>
	{/if}

	<div class="card-footer">
		<span class="click-hint">Click to view haul details</span>
	</div>
</button>

<style>
	.haul-card {
		@apply w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-left cursor-pointer;
	}

	.haul-card:hover {
		@apply transform -translate-y-1;
	}

	.haul-card.problem {
		@apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/5;
	}

	.haul-card.problem:hover {
		@apply border-red-300 dark:border-red-600;
	}

	.card-header {
		@apply flex justify-between items-start mb-4;
	}

	.haul-info {
		@apply flex-1;
	}

	.haul-id {
		@apply text-lg font-bold text-gray-900 dark:text-white mb-1;
	}

	.route-info {
		@apply flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-1;
	}

	.route-text {
		@apply font-medium;
	}

	.customer-info {
		@apply text-sm font-medium text-blue-600 dark:text-blue-400;
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

	.loss-metric {
		@apply text-base font-bold;
	}

	.loss-amount {
		@apply text-xs font-normal text-gray-500 dark:text-gray-400;
	}

	.efficiency-metric {
		@apply text-base font-bold;
	}

	.temp-metric {
		@apply flex items-center gap-1;
	}

	.temp-variance {
		@apply text-xs font-normal;
	}

	.timing-info {
		@apply space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700;
	}

	.timing-item {
		@apply flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300;
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