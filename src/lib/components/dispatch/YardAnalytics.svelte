<script lang="ts">
	import { currentYardData, trucksForCurrentYard, viewMode } from '$lib/stores/dispatchAnalytics';
	import DemoTruckCard from './DemoTruckCard.svelte';
	import { Truck, TrendingUp, TrendingDown, AlertTriangle, Activity, MapPin } from 'lucide-svelte';

	$: yardData = $currentYardData;
	$: trucks = $trucksForCurrentYard;

	function formatRevenue(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

{#if yardData}
	<div class="yard-analytics">
		<div class="analytics-header">
			<h1 class="page-title">{yardData.name}</h1>
			<p class="page-subtitle">
				<MapPin class="w-4 h-4 inline" />
				{yardData.location} • {yardData.region}
			</p>
		</div>

		<!-- Yard KPI Dashboard -->
		<div class="kpi-grid">
			<div class="kpi-card primary">
				<div class="kpi-icon">
					<Truck class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{yardData.activeTrucks}/{yardData.totalTrucks}</div>
					<div class="kpi-label">Active Trucks</div>
					<div class="kpi-sub">{((yardData.activeTrucks / yardData.totalTrucks) * 100).toFixed(0)}% utilization</div>
				</div>
			</div>

			<div class="kpi-card {yardData.efficiency >= 92 ? 'success' : 'warning'}">
				<div class="kpi-icon">
					{#if yardData.efficiency >= 92}
						<TrendingUp class="w-6 h-6" />
					{:else}
						<TrendingDown class="w-6 h-6" />
					{/if}
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{yardData.efficiency.toFixed(1)}%</div>
					<div class="kpi-label">Yard Efficiency</div>
					<div class="kpi-sub">Target: 92.5%</div>
				</div>
			</div>

			<div class="kpi-card success">
				<div class="kpi-icon">
					<Activity class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{yardData.todayHauls}</div>
					<div class="kpi-label">Today's Hauls</div>
					<div class="kpi-sub">{yardData.weekHauls} this week</div>
				</div>
			</div>

			<div class="kpi-card info">
				<div class="kpi-icon">
					<Activity class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{yardData.activeBays}/{yardData.loadingBays}</div>
					<div class="kpi-label">Loading Bays</div>
					<div class="kpi-sub">Active/Total</div>
				</div>
			</div>
		</div>

		<!-- Yard Alerts -->
		{#if yardData.alerts.length > 0}
			<div class="insights-banner">
				<div class="insight-icon">
					<AlertTriangle class="w-5 h-5" />
				</div>
				<div class="insight-content">
					<div class="insight-title">Yard Alert</div>
					{#each yardData.alerts as alert}
						<div class="insight-text">{alert.summary}</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Analytics Charts -->
		{#if $viewMode === 'analytics'}
			<div class="analytics-section">
				<h2 class="section-title">Yard Performance Analytics</h2>
				
				<div class="charts-grid">
					<div class="chart-placeholder">
						<div class="chart-header">
							<h3>Truck Efficiency Comparison</h3>
							<span class="chart-period">Current Week</span>
						</div>
						<div class="chart-body">
							<div class="chart-mock">
								📊 T-212: 98.7% | T-198: 92.4% | T-205: 76.2% (⚠️ problem)
							</div>
						</div>
					</div>

					<div class="chart-placeholder">
						<div class="chart-header">
							<h3>Loading Bay Utilization</h3>
							<span class="chart-period">24 Hours</span>
						</div>
						<div class="chart-body">
							<div class="chart-mock">
								⏱️ Bay 1-4: Active | Bay 5-6: Standby | Avg load time: 45min
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Truck Cards -->
		{#if $viewMode === 'cards' || $viewMode === 'analytics'}
			<div class="trucks-section">
				<h2 class="section-title">
					Truck Fleet
					<span class="section-subtitle">Click any truck to drill down</span>
				</h2>
				
				<div class="trucks-grid">
					{#each trucks as truck (truck.id)}
						<DemoTruckCard {truck} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="no-data">
		<p>No yard data available</p>
	</div>
{/if}

<style>
	.yard-analytics {
		@apply p-6 space-y-6 overflow-y-auto h-full;
	}

	.analytics-header {
		@apply mb-6;
	}

	.page-title {
		@apply text-2xl font-bold text-gray-900 dark:text-white mb-2;
	}

	.page-subtitle {
		@apply text-lg text-gray-600 dark:text-gray-300 flex items-center gap-2;
	}

	.kpi-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6;
	}

	.kpi-card {
		@apply bg-white dark:bg-gray-800 rounded-lg border p-4 flex items-center gap-4;
	}

	.kpi-card.primary {
		@apply border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10;
	}

	.kpi-card.success {
		@apply border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10;
	}

	.kpi-card.warning {
		@apply border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10;
	}

	.kpi-card.info {
		@apply border-gray-200 dark:border-gray-700;
	}

	.kpi-icon {
		@apply flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-700;
	}

	.kpi-content {
		@apply flex-1;
	}

	.kpi-value {
		@apply text-xl font-bold text-gray-900 dark:text-white;
	}

	.kpi-label {
		@apply text-sm font-medium text-gray-600 dark:text-gray-300;
	}

	.kpi-sub {
		@apply text-xs text-gray-500 dark:text-gray-400;
	}

	.insights-banner {
		@apply flex items-center gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg;
	}

	.insight-icon {
		@apply flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400;
	}

	.insight-content {
		@apply flex-1;
	}

	.insight-title {
		@apply font-semibold text-gray-900 dark:text-white mb-1;
	}

	.insight-text {
		@apply text-sm text-gray-600 dark:text-gray-300;
	}

	.analytics-section {
		@apply space-y-4;
	}

	.section-title {
		@apply text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3;
	}

	.section-subtitle {
		@apply text-sm font-normal text-gray-500 dark:text-gray-400;
	}

	.charts-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 gap-6;
	}

	.chart-placeholder {
		@apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden;
	}

	.chart-header {
		@apply flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50;
	}

	.chart-header h3 {
		@apply font-semibold text-gray-900 dark:text-white;
	}

	.chart-period {
		@apply text-sm text-gray-500 dark:text-gray-400;
	}

	.chart-body {
		@apply p-6;
	}

	.chart-mock {
		@apply text-center py-8 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600;
	}

	.trucks-section {
		@apply space-y-4;
	}

	.trucks-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4;
	}

	.no-data {
		@apply p-6 text-center text-gray-500 dark:text-gray-400;
	}
</style> 