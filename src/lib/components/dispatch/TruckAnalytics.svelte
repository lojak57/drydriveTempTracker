<script lang="ts">
	import { currentTruckData, haulsForCurrentTruck, viewMode, dispatchAnalytics } from '$lib/stores/dispatchAnalytics';
	import DemoHaulCard from './DemoHaulCard.svelte';
	import DemoTruckCard from './DemoTruckCard.svelte';
	import { 
		Truck, 
		Activity, 
		TrendingUp, 
		TrendingDown, 
		AlertTriangle, 
		Clock, 
		Fuel,
		Target,
		MapPin,
		Wrench
	} from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';

	// Drill-down handler prop
	export let handleDrillDown: (targetLevel: string, id?: string) => void;

	$: truckData = $currentTruckData;
	$: hauls = $haulsForCurrentTruck;
	$: allTrucks = $dispatchAnalytics.demoTrucks;
	$: allHauls = $dispatchAnalytics.demoHauls;
	$: allYards = $dispatchAnalytics.demoYards;

	// Show all trucks when no specific truck is selected
	$: showingAllTrucks = !truckData;

	// Group trucks by yard for better organization
	$: trucksByYard = allYards.map(yard => ({
		yard,
		trucks: allTrucks.filter(truck => truck.yardId === yard.id)
	}));

	function formatLastSeen(date: Date | null) {
		if (!date) return 'Unknown';
		return formatDistanceToNow(date, { addSuffix: true });
	}

	function getTruckStatus(truck: any) {
		switch (truck.currentStatus) {
			case 'active': return { label: 'Active', class: 'success' };
			case 'loading': return { label: 'Loading', class: 'warning' };
			case 'transit': return { label: 'In Transit', class: 'info' };
			case 'maintenance': return { label: 'Maintenance', class: 'error' };
			case 'available': return { label: 'Available', class: 'neutral' };
			default: return { label: 'Unknown', class: 'neutral' };
		}
	}
</script>

{#if showingAllTrucks}
	<!-- Show aggregated truck data -->
	<div class="trucks-overview">
		<div class="analytics-header">
			<h1 class="page-title">All Trucks Overview</h1>
			<p class="page-subtitle">
				<Truck class="w-4 h-4 inline" />
				Fleet-wide truck performance and metrics
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
					<div class="kpi-sub">{allTrucks.filter(t => t.currentStatus === 'active' || t.currentStatus === 'loading' || t.currentStatus === 'transit').length} active</div>
				</div>
			</div>

			<div class="kpi-card success">
				<div class="kpi-icon">
					<Activity class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{allHauls.length}</div>
					<div class="kpi-label">Total Hauls</div>
					<div class="kpi-sub">{allTrucks.reduce((sum, t) => sum + t.todayHauls, 0)} today</div>
				</div>
			</div>

			<div class="kpi-card {(allTrucks.reduce((sum, t) => sum + t.efficiency, 0) / allTrucks.length) >= 92 ? 'success' : 'warning'}">
				<div class="kpi-icon">
					<TrendingUp class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{((allTrucks.reduce((sum, t) => sum + t.efficiency, 0) / allTrucks.length)).toFixed(1)}%</div>
					<div class="kpi-label">Avg Efficiency</div>
					<div class="kpi-sub">Target: 92.5%</div>
				</div>
			</div>

			<div class="kpi-card {(allTrucks.reduce((sum, t) => sum + t.avgVolumeLoss, 0) / allTrucks.length) <= 2.0 ? 'success' : 'warning'}">
				<div class="kpi-icon">
					<Target class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{((allTrucks.reduce((sum, t) => sum + t.avgVolumeLoss, 0) / allTrucks.length)).toFixed(1)}%</div>
					<div class="kpi-label">Avg Volume Loss</div>
					<div class="kpi-sub">Target: ≤2.0%</div>
				</div>
			</div>

			<div class="kpi-card info">
				<div class="kpi-icon">
					<Wrench class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{allTrucks.filter(t => t.currentStatus === 'maintenance').length}</div>
					<div class="kpi-label">In Maintenance</div>
					<div class="kpi-sub">{((allTrucks.filter(t => t.currentStatus === 'maintenance').length / allTrucks.length) * 100).toFixed(0)}% of fleet</div>
				</div>
			</div>

			<div class="kpi-card neutral">
				<div class="kpi-icon">
					<Fuel class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{((allTrucks.reduce((sum, t) => sum + t.fuelEfficiency, 0) / allTrucks.length)).toFixed(1)}</div>
					<div class="kpi-label">Avg Fuel MPG</div>
					<div class="kpi-sub">Fleet average</div>
				</div>
			</div>
		</div>

		<!-- Problem Trucks Alert -->
		{#if allTrucks.some(t => t.efficiency < 85 || t.avgVolumeLoss > 3.0 || t.alerts.length > 0)}
			<div class="insights-banner">
				<div class="insight-icon">
					<AlertTriangle class="w-5 h-5" />
				</div>
				<div class="insight-content">
					<div class="insight-title">Fleet Alerts</div>
					<div class="insight-text">
						{allTrucks.filter(t => t.efficiency < 85).length} trucks below efficiency threshold, 
						{allTrucks.filter(t => t.avgVolumeLoss > 3.0).length} with high volume loss, 
						{allTrucks.reduce((sum, t) => sum + t.alerts.length, 0)} total active alerts
					</div>
				</div>
			</div>
		{/if}

		<!-- Trucks by Yard -->
		<div class="trucks-section">
			<h2 class="section-title">
				Trucks by Yard
				<span class="section-subtitle">Click any truck to drill down</span>
			</h2>
			
			{#each trucksByYard as { yard, trucks } (yard.id)}
				{#if trucks.length > 0}
					<div class="yard-section">
						<h3 class="yard-header">
							<MapPin class="w-4 h-4" />
							{yard.name}
							<span class="truck-count">({trucks.length} trucks)</span>
						</h3>
						
						<div class="trucks-grid">
							{#each trucks as truck (truck.id)}
								<DemoTruckCard {truck} {handleDrillDown} />
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
{:else if truckData}
	<!-- Show specific truck data (existing code) -->
	<div class="truck-analytics">
		<div class="analytics-header">
			<h1 class="page-title">Truck {truckData.id}</h1>
			<p class="page-subtitle">
				<Truck class="w-4 h-4 inline" />
				{truckData.model} ({truckData.year}) • Driver: {truckData.driverName}
			</p>
		</div>

		<!-- Truck KPI Dashboard -->
		<div class="kpi-grid">
			<div class="kpi-card {getTruckStatus(truckData).class}">
				<div class="kpi-icon">
					<Activity class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{getTruckStatus(truckData).label}</div>
					<div class="kpi-label">Current Status</div>
					<div class="kpi-sub">Last seen {formatLastSeen(truckData.lastHaulTime)}</div>
				</div>
			</div>

			<div class="kpi-card {truckData.efficiency >= 92 ? 'success' : 'warning'}">
				<div class="kpi-icon">
					{#if truckData.efficiency >= 92}
						<TrendingUp class="w-6 h-6" />
					{:else}
						<TrendingDown class="w-6 h-6" />
					{/if}
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{truckData.efficiency.toFixed(1)}%</div>
					<div class="kpi-label">Efficiency</div>
					<div class="kpi-sub">Target: 92.5%</div>
				</div>
			</div>

			<div class="kpi-card success">
				<div class="kpi-icon">
					<Activity class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{truckData.todayHauls}</div>
					<div class="kpi-label">Today's Hauls</div>
					<div class="kpi-sub">{truckData.weekHauls} this week</div>
				</div>
			</div>

			<div class="kpi-card {truckData.avgVolumeLoss <= 2.0 ? 'success' : 'warning'}">
				<div class="kpi-icon">
					<Target class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{truckData.avgVolumeLoss.toFixed(1)}%</div>
					<div class="kpi-label">Avg Volume Loss</div>
					<div class="kpi-sub">Target: ≤2.0%</div>
				</div>
			</div>

			<div class="kpi-card info">
				<div class="kpi-icon">
					<Fuel class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{truckData.fuelEfficiency}</div>
					<div class="kpi-label">Fuel Efficiency</div>
					<div class="kpi-sub">MPG</div>
				</div>
			</div>

			<div class="kpi-card neutral">
				<div class="kpi-icon">
					<Clock class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{(truckData.mileage).toLocaleString()}</div>
					<div class="kpi-label">Total Mileage</div>
					<div class="kpi-sub">Miles driven</div>
				</div>
			</div>
		</div>

		<!-- Truck Alerts -->
		{#if truckData.alerts.length > 0}
			<div class="insights-banner">
				<div class="insight-icon">
					<AlertTriangle class="w-5 h-5" />
				</div>
				<div class="insight-content">
					<div class="insight-title">Truck Alerts</div>
					{#each truckData.alerts as alert}
						<div class="insight-text">{alert.summary}</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Analytics Charts -->
		{#if $viewMode === 'analytics'}
			<div class="analytics-section">
				<h2 class="section-title">Truck Performance Analytics</h2>
				
				<div class="charts-grid">
					<div class="chart-placeholder">
						<div class="chart-header">
							<h3>Efficiency Trend</h3>
							<span class="chart-period">Last 7 Days</span>
						</div>
						<div class="chart-body">
							<div class="chart-mock">
								📈 Daily efficiency: Mon 94% → Tue 91% → Wed 89% → Today {truckData.efficiency}%
							</div>
						</div>
					</div>

					<div class="chart-placeholder">
						<div class="chart-header">
							<h3>Volume Loss Analysis</h3>
							<span class="chart-period">Recent Hauls</span>
						</div>
						<div class="chart-body">
							<div class="chart-mock">
								🔍 Loss pattern: {hauls.map(h => h.volumeLossPercent.toFixed(1) + '%').join(' → ')}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Haul History -->
		{#if $viewMode === 'cards' || $viewMode === 'analytics'}
			<div class="hauls-section">
				<h2 class="section-title">
					Recent Hauls
					<span class="section-subtitle">Click any haul to drill down</span>
				</h2>
				
				<div class="hauls-grid">
					{#each hauls.slice(0, 6) as haul (haul.id)}
						<DemoHaulCard {haul} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="no-data">
		<p>No truck data available</p>
	</div>
{/if}

<style>
	.truck-analytics, .trucks-overview {
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
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4;
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

	.kpi-card.error {
		@apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20;
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

	.yard-section {
		@apply space-y-4 mb-8;
	}

	.yard-header {
		@apply flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700;
	}

	.truck-count {
		@apply text-sm text-gray-500 dark:text-gray-400 font-normal;
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

	.hauls-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
	}

	.no-data {
		@apply flex items-center justify-center h-full text-gray-500 dark:text-gray-400;
	}
</style> 