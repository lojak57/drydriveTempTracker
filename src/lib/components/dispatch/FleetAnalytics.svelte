<script lang="ts">
	import { dispatchAnalytics, viewMode, yardsForCurrentLevel } from '$lib/stores/dispatchAnalytics';
	import DemoYardCard from './DemoYardCard.svelte';
	import { BarChart3, Truck, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Users, Building2 } from 'lucide-svelte';

	// Drill-down handler prop
	export let handleDrillDown: (targetLevel: string, id?: string) => void;

	$: ({ demoFleet } = $dispatchAnalytics);
	$: yards = $yardsForCurrentLevel;

	function formatRevenue(amount: number) {
		if (amount >= 1000000) {
			return '$' + (amount / 1000000).toFixed(1) + 'M';
		}
		if (amount >= 1000) {
			return '$' + (amount / 1000).toFixed(0) + 'K';
		}
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatLargeNumber(num: number) {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		}
		if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	}

	// Demo insight for narrative
	$: fleetInsight = "Fleet efficiency is 3.2% below target. Permian Basin yard showing efficiency issues with Truck T-205 underperforming significantly.";
</script>

<div class="fleet-analytics">
	<div class="analytics-header">
		<h1 class="page-title">Fleet Overview</h1>
		<p class="page-subtitle">247 trucks across 6 operational yards generating comprehensive fleet intelligence</p>
	</div>

	<!-- Fleet KPI Dashboard -->
	<div class="kpi-grid">
		<div class="kpi-card primary dashboard-card-hover">
			<div class="kpi-icon">
				<Truck class="w-6 h-6" />
			</div>
			<div class="kpi-content">
				<div class="kpi-value">{demoFleet.totalTrucks}</div>
				<div class="kpi-label">Total Trucks</div>
				<div class="kpi-sub">{demoFleet.totalDrivers} drivers assigned</div>
			</div>
		</div>

		<div class="kpi-card success dashboard-card-hover">
			<div class="kpi-icon">
				<DollarSign class="w-6 h-6" />
			</div>
			<div class="kpi-content">
				<div class="kpi-value">{formatRevenue(demoFleet.monthlyRevenue)}</div>
				<div class="kpi-label">Monthly Revenue</div>
				<div class="kpi-sub">{formatLargeNumber(demoFleet.monthHauls)} hauls completed</div>
			</div>
		</div>

		<div class="kpi-card {demoFleet.efficiency >= 92 ? 'success' : 'warning'} dashboard-card-hover">
			<div class="kpi-icon">
				{#if demoFleet.efficiency >= 92}
					<TrendingUp class="w-6 h-6" />
				{:else}
					<TrendingDown class="w-6 h-6" />
				{/if}
			</div>
			<div class="kpi-content">
				<div class="kpi-value">{demoFleet.efficiency.toFixed(1)}%</div>
				<div class="kpi-label">Fleet Efficiency</div>
				<div class="kpi-sub">Target: 92.5%</div>
			</div>
		</div>

		<div class="kpi-card {demoFleet.avgVolumeLoss <= 2.0 ? 'success' : 'danger'} dashboard-card-hover">
			<div class="kpi-icon">
				<BarChart3 class="w-6 h-6" />
			</div>
			<div class="kpi-content">
				<div class="kpi-value">{demoFleet.avgVolumeLoss.toFixed(1)}%</div>
				<div class="kpi-label">Avg Volume Loss</div>
				<div class="kpi-sub">Target: ≤2.0%</div>
			</div>
		</div>

		<div class="kpi-card info dashboard-card-hover">
			<div class="kpi-icon">
				<Building2 class="w-6 h-6" />
			</div>
			<div class="kpi-content">
				<div class="kpi-value">{demoFleet.totalYards}</div>
				<div class="kpi-label">Active Yards</div>
				<div class="kpi-sub">{demoFleet.todayHauls} hauls today</div>
			</div>
		</div>

		<div class="kpi-card {demoFleet.safetyScore >= 95 ? 'success' : 'warning'} dashboard-card-hover">
			<div class="kpi-icon">
				<Users class="w-6 h-6" />
			</div>
			<div class="kpi-content">
				<div class="kpi-value">{demoFleet.safetyScore.toFixed(1)}%</div>
				<div class="kpi-label">Safety Score</div>
				<div class="kpi-sub">Industry leading</div>
			</div>
		</div>
	</div>

	<!-- Fleet Insights Banner -->
	{#if demoFleet.alerts.length > 0}
		<div class="insights-banner">
			<div class="insight-icon">
				<AlertTriangle class="w-5 h-5" />
			</div>
			<div class="insight-content">
				<div class="insight-title">Fleet Intelligence Alert</div>
				<div class="insight-text">{fleetInsight}</div>
			</div>
		</div>
	{/if}

	<!-- View Mode Content -->
	{#if $viewMode === 'analytics'}
		<div class="analytics-section">
			<h2 class="section-title">Performance Analytics</h2>
			
			<!-- Placeholder for charts -->
			<div class="charts-grid">
				<div class="chart-placeholder">
					<div class="chart-header">
						<h3>Fleet Efficiency Trend</h3>
						<span class="chart-period">Last 30 Days</span>
					</div>
					<div class="chart-body">
						<div class="chart-mock">
							📈 Fleet efficiency trending down -3.2% from target
						</div>
					</div>
				</div>

				<div class="chart-placeholder">
					<div class="chart-header">
						<h3>Yard Performance Comparison</h3>
						<span class="chart-period">Current Month</span>
					</div>
					<div class="chart-body">
						<div class="chart-mock">
							📊 Eagle Ford: 94.7% | Permian Basin: 91.2% (⚠️ attention)
						</div>
					</div>
				</div>

				<div class="chart-placeholder">
					<div class="chart-header">
						<h3>Revenue Distribution</h3>
						<span class="chart-period">Monthly</span>
					</div>
					<div class="chart-body">
						<div class="chart-mock">
							💰 $4.2M total | Permian: $847K | Eagle Ford: $723K
						</div>
					</div>
				</div>

				<div class="chart-placeholder">
					<div class="chart-header">
						<h3>Volume Loss Analysis</h3>
						<span class="chart-period">Weekly Trend</span>
					</div>
					<div class="chart-body">
						<div class="chart-mock">
							🔍 2.1% avg loss | Problem trucks: T-205 (4.1%)
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if $viewMode === 'cards' || $viewMode === 'analytics'}
		<div class="yards-section">
			<h2 class="section-title">
				Yard Performance Overview 
				<span class="section-subtitle">Click any yard to drill down</span>
			</h2>
			
			<div class="yards-grid">
				{#each yards as yard (yard.id)}
					<DemoYardCard {yard} {handleDrillDown} />
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.fleet-analytics {
		@apply p-6 space-y-6 overflow-y-auto h-full;
	}

	.analytics-header {
		@apply text-center mb-8;
	}

	.page-title {
		@apply text-3xl font-bold text-gray-900 dark:text-white mb-2;
	}

	.page-subtitle {
		@apply text-lg text-gray-600 dark:text-gray-300;
	}

	.kpi-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6;
	}

	/* Mobile-specific adjustments */
	@media (max-width: 768px) {
		.kpi-grid {
			@apply gap-4;
		}
		
		.kpi-card {
			@apply p-4;
		}
		
		.kpi-value {
			@apply text-2xl;
		}
	}

	/* Large screen adjustments for better layout */
	@media (min-width: 1280px) {
		.kpi-grid {
			@apply grid-cols-3 gap-8;
		}
	}

	@media (min-width: 1536px) {
		.kpi-grid {
			@apply grid-cols-6 gap-6;
		}
		
		.kpi-card {
			@apply p-5;
		}
		
		.kpi-value {
			@apply text-2xl;
		}
		
		.kpi-label {
			@apply text-xs;
		}
		
		.kpi-sub {
			@apply text-xs;
		}
	}

	.kpi-card {
		@apply bg-white dark:bg-gray-800 rounded-xl border p-6 flex flex-col gap-3 min-w-0 shadow-sm hover:shadow-md transition-all duration-200;
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

	.kpi-card.danger {
		@apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10;
	}

	.kpi-card.info {
		@apply border-gray-200 dark:border-gray-700;
	}

	.kpi-icon {
		@apply flex-shrink-0 p-3 rounded-xl bg-white dark:bg-gray-700 self-start;
	}

	.kpi-content {
		@apply flex-1 min-w-0;
	}

	.kpi-value {
		@apply text-3xl font-bold text-gray-900 dark:text-white mb-1 break-words;
	}

	.kpi-label {
		@apply text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1 break-words;
	}

	.kpi-sub {
		@apply text-sm text-gray-500 dark:text-gray-400 break-words;
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

	.yards-section {
		@apply space-y-4;
	}

	.yards-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 gap-6;
	}
</style> 