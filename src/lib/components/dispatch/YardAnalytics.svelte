<script lang="ts">
	import { currentYardData, trucksForCurrentYard, viewMode, dispatchAnalytics } from '$lib/stores/dispatchAnalytics';
	import DemoTruckCard from './DemoTruckCard.svelte';
	import DemoYardCard from './DemoYardCard.svelte';
	import { Truck, TrendingUp, TrendingDown, AlertTriangle, Activity, MapPin } from 'lucide-svelte';

	// Drill-down handler prop
	export let handleDrillDown: (targetLevel: string, id?: string) => void;

	$: yardData = $currentYardData;
	$: trucks = $trucksForCurrentYard;
	$: allYards = $dispatchAnalytics.demoYards;
	$: allTrucks = $dispatchAnalytics.demoTrucks;

	// Show all yards when no specific yard is selected
	$: showingAllYards = !yardData;

	function formatRevenue(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}
</script>

{#if showingAllYards}
	<!-- Show aggregated yard data -->
	<div class="yards-overview">
		<div class="analytics-header">
			<h1 class="page-title">All Yards Overview</h1>
			<p class="page-subtitle">
				<MapPin class="w-4 h-4 inline" />
				Fleet-wide yard performance and metrics
			</p>
		</div>

		<!-- Aggregated KPI Dashboard -->
		<div class="kpi-grid">
			<div class="kpi-card primary">
				<div class="kpi-icon">
					<Truck class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{allTrucks.length}</div>
					<div class="kpi-label">Total Trucks</div>
					<div class="kpi-sub">Across {allYards.length} yards</div>
				</div>
			</div>

			<div class="kpi-card success">
				<div class="kpi-icon">
					<Activity class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{allYards.reduce((sum, y) => sum + y.todayHauls, 0)}</div>
					<div class="kpi-label">Today's Hauls</div>
					<div class="kpi-sub">{allYards.reduce((sum, y) => sum + y.weekHauls, 0)} this week</div>
				</div>
			</div>

			<div class="kpi-card {(allYards.reduce((sum, y) => sum + y.efficiency, 0) / allYards.length) >= 92 ? 'success' : 'warning'}">
				<div class="kpi-icon">
					<TrendingUp class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{((allYards.reduce((sum, y) => sum + y.efficiency, 0) / allYards.length)).toFixed(1)}%</div>
					<div class="kpi-label">Avg Efficiency</div>
					<div class="kpi-sub">Target: 92.5%</div>
				</div>
			</div>

			<div class="kpi-card info">
				<div class="kpi-icon">
					<Activity class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{formatRevenue(allYards.reduce((sum, y) => sum + y.revenue, 0))}</div>
					<div class="kpi-label">Total Revenue</div>
					<div class="kpi-sub">All yards combined</div>
				</div>
			</div>
		</div>

		<!-- Yard Cards -->
		<div class="yards-section">
			<h2 class="section-title">
				Individual Yard Performance
				<span class="section-subtitle">Click any yard to drill down</span>
			</h2>
			
			<div class="yards-grid">
				{#each allYards as yard (yard.id)}
					<DemoYardCard {yard} {handleDrillDown} />
				{/each}
			</div>
		</div>
	</div>
{:else if yardData}
	<!-- Show specific yard data (existing code) -->
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
						<DemoTruckCard {truck} {handleDrillDown} />
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
	.yard-analytics, .yards-overview {
		@apply flex flex-col gap-6 p-6 h-full overflow-y-auto;
	}

	.analytics-header {
		@apply text-center space-y-2;
	}

	.page-title {
		@apply text-3xl font-bold text-gray-900 dark:text-white;
	}

	.page-subtitle {
		@apply text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2;
	}

	.kpi-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
	}

	.kpi-card {
		@apply bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow;
	}

	.kpi-card.primary {
		@apply border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20;
	}

	.kpi-card.success {
		@apply border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20;
	}

	.kpi-card.warning {
		@apply border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20;
	}

	.kpi-card.info {
		@apply border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20;
	}

	.kpi-card.neutral {
		@apply border-gray-200 dark:border-gray-700;
	}

	.kpi-icon {
		@apply flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 mb-4;
	}

	.kpi-content {
		@apply space-y-1;
	}

	.kpi-value {
		@apply text-2xl font-bold text-gray-900 dark:text-white;
	}

	.kpi-label {
		@apply text-sm font-medium text-gray-600 dark:text-gray-300;
	}

	.kpi-sub {
		@apply text-xs text-gray-500 dark:text-gray-400;
	}

	.insights-banner {
		@apply flex items-start gap-4 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl;
	}

	.insight-icon {
		@apply flex items-center justify-center w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 rounded-lg flex-shrink-0;
	}

	.insight-content {
		@apply space-y-1;
	}

	.insight-title {
		@apply font-semibold text-yellow-800 dark:text-yellow-300;
	}

	.insight-text {
		@apply text-sm text-yellow-700 dark:text-yellow-400;
	}

	.section-title {
		@apply flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white mb-4;
	}

	.section-subtitle {
		@apply text-sm text-gray-500 dark:text-gray-400;
	}

	.yards-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 gap-6;
	}

	.trucks-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
	}

	.charts-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 gap-6;
	}

	.chart-placeholder {
		@apply bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700;
	}

	.chart-header {
		@apply flex items-center justify-between mb-4;
	}

	.chart-header h3 {
		@apply text-lg font-semibold text-gray-900 dark:text-white;
	}

	.chart-period {
		@apply text-sm text-gray-500 dark:text-gray-400;
	}

	.chart-body {
		@apply h-48 flex items-center justify-center;
	}

	.chart-mock {
		@apply text-center text-gray-600 dark:text-gray-400 p-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg;
	}

	.yard-section {
		@apply space-y-4;
	}

	.yard-header {
		@apply flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white;
	}

	.truck-count {
		@apply text-sm text-gray-500 dark:text-gray-400 font-normal;
	}

	.no-data {
		@apply flex items-center justify-center h-full text-gray-500 dark:text-gray-400;
	}
</style> 