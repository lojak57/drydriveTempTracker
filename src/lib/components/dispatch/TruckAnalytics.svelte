<script lang="ts">
	import { currentTruckData, haulsForCurrentTruck, viewMode } from '$lib/stores/dispatchAnalytics';
	import DemoHaulCard from './DemoHaulCard.svelte';
	import { Truck, User, TrendingUp, TrendingDown, AlertTriangle, Gauge, Droplets, Clock } from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';

	$: truckData = $currentTruckData;
	$: hauls = $haulsForCurrentTruck;

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
</script>

{#if truckData}
	<div class="truck-analytics">
		<div class="analytics-header">
			<div class="truck-header-info">
				<h1 class="page-title">{truckData.id}</h1>
				<div class="truck-details">
					<span class="truck-model">
						<Truck class="w-4 h-4" />
						{truckData.model} ({truckData.year})
					</span>
					<span class="driver-name">
						<User class="w-4 h-4" />
						{truckData.driverName}
					</span>
					<span class="status-badge {getStatusColor(truckData.currentStatus)}">
						{truckData.currentStatus}
					</span>
				</div>
			</div>
		</div>

		<!-- Truck KPI Dashboard -->
		<div class="kpi-grid">
			<div class="kpi-card {truckData.efficiency >= 85 ? 'success' : 'danger'}">
				<div class="kpi-icon">
					{#if truckData.efficiency >= 85}
						<TrendingUp class="w-6 h-6" />
					{:else}
						<TrendingDown class="w-6 h-6" />
					{/if}
				</div>
				<div class="kpi-content">
					<div class="kpi-value {getEfficiencyColor(truckData.efficiency)}">{truckData.efficiency.toFixed(1)}%</div>
					<div class="kpi-label">Efficiency</div>
					<div class="kpi-sub">Target: 85%+</div>
				</div>
			</div>

			<div class="kpi-card {truckData.avgVolumeLoss <= 3.0 ? 'success' : 'danger'}">
				<div class="kpi-icon">
					<Droplets class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value {truckData.avgVolumeLoss > 3.0 ? 'text-red-600 dark:text-red-400' : ''}">{truckData.avgVolumeLoss.toFixed(1)}%</div>
					<div class="kpi-label">Avg Volume Loss</div>
					<div class="kpi-sub">Target: ≤3.0%</div>
				</div>
			</div>

			<div class="kpi-card primary">
				<div class="kpi-icon">
					<Clock class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{truckData.todayHauls}</div>
					<div class="kpi-label">Today's Hauls</div>
					<div class="kpi-sub">{truckData.weekHauls} this week</div>
				</div>
			</div>

			<div class="kpi-card info">
				<div class="kpi-icon">
					<Gauge class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{truckData.fuelEfficiency.toFixed(1)}</div>
					<div class="kpi-label">Fuel MPG</div>
					<div class="kpi-sub">{truckData.mileage.toLocaleString()} miles</div>
				</div>
			</div>

			<div class="kpi-card success">
				<div class="kpi-icon">
					<User class="w-6 h-6" />
				</div>
				<div class="kpi-content">
					<div class="kpi-value">{truckData.safetyScore.toFixed(1)}%</div>
					<div class="kpi-label">Safety Score</div>
					<div class="kpi-sub">Excellent</div>
				</div>
			</div>
		</div>

		<!-- Truck Status Info -->
		<div class="status-info">
			<div class="status-item">
				<span class="status-label">Last Haul:</span>
				<span class="status-value">
					{truckData.lastHaulTime ? formatDistanceToNow(truckData.lastHaulTime, { addSuffix: true }) : 'No recent hauls'}
				</span>
			</div>
			
			{#if truckData.nextScheduled}
				<div class="status-item">
					<span class="status-label">Next Scheduled:</span>
					<span class="status-value">
						{formatDistanceToNow(truckData.nextScheduled, { addSuffix: true })}
					</span>
				</div>
			{/if}

			<div class="status-item">
				<span class="status-label">Next Maintenance:</span>
				<span class="status-value">
					{formatDistanceToNow(truckData.nextMaintenance, { addSuffix: true })}
				</span>
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
						<div class="insight-text severity-{alert.severity}">{alert.summary}</div>
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
							<h3>Recent Performance Trend</h3>
							<span class="chart-period">Last 7 Days</span>
						</div>
						<div class="chart-body">
							<div class="chart-mock">
								📉 Efficiency declining: 98% → 76% (22% drop)
							</div>
						</div>
					</div>

					<div class="chart-placeholder">
						<div class="chart-header">
							<h3>Volume Loss Pattern</h3>
							<span class="chart-period">Recent Hauls</span>
						</div>
						<div class="chart-body">
							<div class="chart-mock">
								🔴 Latest: 4.8% loss | Trend: Increasing | Alert triggered
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Haul Cards -->
		{#if $viewMode === 'cards' || $viewMode === 'analytics'}
			<div class="hauls-section">
				<h2 class="section-title">
					Recent Hauls
					<span class="section-subtitle">Click any haul to view raw data</span>
				</h2>
				
				{#if hauls.length > 0}
					<div class="hauls-grid">
						{#each hauls as haul (haul.id)}
							<DemoHaulCard {haul} />
						{/each}
					</div>
				{:else}
					<div class="no-hauls">
						<p>No hauls found for this truck</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{:else}
	<div class="no-data">
		<p>No truck data available</p>
	</div>
{/if}

<style>
	.truck-analytics {
		@apply p-6 space-y-6 overflow-y-auto h-full;
	}

	.analytics-header {
		@apply mb-6;
	}

	.truck-header-info {
		@apply space-y-3;
	}

	.page-title {
		@apply text-2xl font-bold text-gray-900 dark:text-white;
	}

	.truck-details {
		@apply flex flex-wrap items-center gap-4;
	}

	.truck-model,
	.driver-name {
		@apply flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300;
	}

	.status-badge {
		@apply flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium capitalize;
	}

	.kpi-grid {
		@apply grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6;
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

	.kpi-card.danger {
		@apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10;
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

	.status-info {
		@apply flex flex-wrap gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg;
	}

	.status-item {
		@apply flex items-center gap-2;
	}

	.status-label {
		@apply text-sm font-medium text-gray-600 dark:text-gray-300;
	}

	.status-value {
		@apply text-sm text-gray-900 dark:text-white font-mono;
	}

	.insights-banner {
		@apply flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg;
	}

	.insight-icon {
		@apply flex-shrink-0 p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400;
	}

	.insight-content {
		@apply flex-1;
	}

	.insight-title {
		@apply font-semibold text-gray-900 dark:text-white mb-2;
	}

	.insight-text {
		@apply text-sm text-gray-600 dark:text-gray-300 mb-1;
	}

	.insight-text.severity-high {
		@apply text-red-600 dark:text-red-400 font-medium;
	}

	.insight-text.severity-medium {
		@apply text-yellow-600 dark:text-yellow-400;
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

	.hauls-section {
		@apply space-y-4;
	}

	.hauls-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 gap-4;
	}

	.no-hauls,
	.no-data {
		@apply p-6 text-center text-gray-500 dark:text-gray-400;
	}
</style> 