<script lang="ts">
	import { currentHaulData, viewMode } from '$lib/stores/dispatchAnalytics';
	import { MapPin, Clock, Thermometer, Droplets, Gauge, DollarSign, AlertTriangle, User, Truck } from 'lucide-svelte';
	import { format } from 'date-fns';

	$: haulData = $currentHaulData;

	function formatVolume(volume: number) {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(volume);
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(amount);
	}

	function formatDateTime(date: Date) {
		return format(date, 'MMM dd, yyyy • hh:mm:ss a');
	}

	function formatCoordinate(coord: number) {
		return coord.toFixed(6);
	}
</script>

{#if haulData}
	<div class="haul-detail">
		<!-- Header -->
		<div class="detail-header">
			<div class="haul-header-info">
				<h1 class="page-title">Haul {haulData.id}</h1>
				<div class="haul-meta">
					<span class="truck-id">
						<Truck class="w-4 h-4" />
						{haulData.truckId} - {haulData.driverName}
					</span>
					<span class="route">
						<MapPin class="w-4 h-4" />
						{haulData.origin} → {haulData.destination}
					</span>
					<span class="customer">
						Customer: {haulData.customer}
					</span>
				</div>
			</div>
		</div>

		<!-- Critical Alerts (if any) -->
		{#if haulData.alerts.length > 0}
			<div class="critical-alerts">
				<div class="alert-header">
					<AlertTriangle class="w-5 h-5" />
					<h2>Critical Issues Detected</h2>
				</div>
				{#each haulData.alerts as alert}
					<div class="alert-item severity-{alert.severity}">
						<AlertTriangle class="w-4 h-4" />
						<div class="alert-content">
							<div class="alert-type">{alert.type.replace('_', ' ').toUpperCase()}</div>
							<div class="alert-summary">{alert.summary}</div>
							<div class="alert-time">{formatDateTime(alert.timestamp)}</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Summary Analytics (always visible) -->
		<div class="summary-section">
			<h2 class="section-title">Haul Summary</h2>
			<div class="summary-grid">
				<div class="summary-card {haulData.volumeLossPercent > 3 ? 'critical' : haulData.volumeLossPercent > 2 ? 'warning' : 'good'}">
					<div class="summary-icon">
						<Droplets class="w-6 h-6" />
					</div>
					<div class="summary-content">
						<div class="summary-value">{haulData.volumeLossPercent.toFixed(2)}%</div>
						<div class="summary-label">Volume Loss</div>
						<div class="summary-detail">{formatVolume(haulData.volumeLoss)} barrels lost</div>
					</div>
				</div>

				<div class="summary-card {haulData.efficiency >= 95 ? 'good' : haulData.efficiency >= 85 ? 'warning' : 'critical'}">
					<div class="summary-icon">
						<Gauge class="w-6 h-6" />
					</div>
					<div class="summary-content">
						<div class="summary-value">{haulData.efficiency.toFixed(1)}%</div>
						<div class="summary-label">Efficiency</div>
						<div class="summary-detail">{Math.floor(haulData.duration / 60)}h {haulData.duration % 60}m duration</div>
					</div>
				</div>

				<div class="summary-card">
					<div class="summary-icon">
						<Thermometer class="w-6 h-6" />
					</div>
					<div class="summary-content">
						<div class="summary-value">{haulData.avgTemp.toFixed(1)}°F</div>
						<div class="summary-label">Avg Temperature</div>
						<div class="summary-detail">Range: {haulData.minTemp.toFixed(1)}°F - {haulData.maxTemp.toFixed(1)}°F</div>
					</div>
				</div>

				<div class="summary-card">
					<div class="summary-icon">
						<DollarSign class="w-6 h-6" />
					</div>
					<div class="summary-content">
						<div class="summary-value">{formatCurrency(haulData.revenue)}</div>
						<div class="summary-label">Revenue</div>
						<div class="summary-detail">Fuel: {formatCurrency(haulData.fuelCost)}</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Raw Data Mode -->
		{#if $viewMode === 'raw' || $viewMode === 'analytics'}
			<div class="raw-data-section">
				<h2 class="section-title">
					📋 Complete Haul Ticket Data
					<span class="section-subtitle">Every sensor reading, every timestamp, every measurement</span>
				</h2>
				
				<!-- Operational Data -->
				<div class="data-category">
					<h3 class="category-title">
						🚛 Operational Data
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Route Information</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">Haul ID:</span>
									<span class="data-value">{haulData.id}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Origin:</span>
									<span class="data-value">{haulData.origin}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Destination:</span>
									<span class="data-value">{haulData.destination}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Customer:</span>
									<span class="data-value">{haulData.customer}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Distance:</span>
									<span class="data-value">{haulData.distance} miles</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Status:</span>
									<span class="data-value status-{haulData.status}">{haulData.status}</span>
								</div>
							</div>
						</div>

						<div class="data-group">
							<h4 class="group-title">Personnel & Equipment</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">Truck ID:</span>
									<span class="data-value">{haulData.truckId}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Driver ID:</span>
									<span class="data-value">{haulData.driverId}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Driver Name:</span>
									<span class="data-value">{haulData.driverName}</span>
								</div>
							</div>
						</div>

						<div class="data-group">
							<h4 class="group-title">Timing</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">Start Time:</span>
									<span class="data-value">{formatDateTime(haulData.startTime)}</span>
								</div>
								{#if haulData.endTime}
									<div class="data-pair">
										<span class="data-label">End Time:</span>
										<span class="data-value">{formatDateTime(haulData.endTime)}</span>
									</div>
								{/if}
								<div class="data-pair">
									<span class="data-label">Duration:</span>
									<span class="data-value">{Math.floor(haulData.duration / 60)}h {haulData.duration % 60}m</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Volume & Loss Data -->
				<div class="data-category critical-data">
					<h3 class="category-title">
						💧 Volume & Loss Analysis
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Volume Measurements</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">Onload Volume:</span>
									<span class="data-value">{formatVolume(haulData.onloadVolume)} bbl</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Offload Volume:</span>
									<span class="data-value">{formatVolume(haulData.offloadVolume)} bbl</span>
								</div>
								<div class="data-pair critical">
									<span class="data-label">Volume Loss:</span>
									<span class="data-value loss-value">{formatVolume(haulData.volumeLoss)} bbl</span>
								</div>
								<div class="data-pair critical">
									<span class="data-label">Loss Percentage:</span>
									<span class="data-value loss-value">{haulData.volumeLossPercent.toFixed(3)}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Temperature Data -->
				<div class="data-category">
					<h3 class="category-title">
						🌡️ Temperature Monitoring
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Temperature Statistics</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">Average Temp:</span>
									<span class="data-value">{haulData.avgTemp.toFixed(2)}°F</span>
								</div>
								<div class="data-pair {haulData.minTemp < 70 ? 'critical' : ''}">
									<span class="data-label">Minimum Temp:</span>
									<span class="data-value">{haulData.minTemp.toFixed(2)}°F</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Maximum Temp:</span>
									<span class="data-value">{haulData.maxTemp.toFixed(2)}°F</span>
								</div>
								<div class="data-pair {Math.abs(haulData.maxTemp - haulData.minTemp) > 30 ? 'critical' : ''}">
									<span class="data-label">Temperature Variance:</span>
									<span class="data-value">{Math.abs(haulData.maxTemp - haulData.minTemp).toFixed(2)}°F</span>
								</div>
							</div>
						</div>

						<div class="data-group">
							<h4 class="group-title">Temperature Readings Timeline</h4>
							<div class="readings-grid">
								{#each haulData.tempReadings as reading, index}
									<div class="reading-item {reading < 70 ? 'critical-reading' : ''}">
										<span class="reading-index">T{index + 1}:</span>
										<span class="reading-value">{reading.toFixed(1)}°F</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Chemical Analysis -->
				<div class="data-category">
					<h3 class="category-title">
						🔬 Chemical Analysis
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Coriolis Measurements</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">API Gravity:</span>
									<span class="data-value">{haulData.apiGravity.toFixed(2)}°</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Water Cut:</span>
									<span class="data-value">{haulData.waterCut.toFixed(2)}%</span>
								</div>
							</div>
						</div>

						<div class="data-group">
							<h4 class="group-title">Safety Measurements</h4>
							<div class="data-pairs">
								<div class="data-pair {haulData.h2sLevels > 1.0 ? 'critical' : ''}">
									<span class="data-label">H2S Levels:</span>
									<span class="data-value">{haulData.h2sLevels.toFixed(2)} ppm</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Pressure Data -->
				<div class="data-category">
					<h3 class="category-title">
						⚡ Pressure Systems
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Pressure Readings</h4>
							<div class="readings-grid">
								{#each haulData.pressureReadings as reading, index}
									<div class="reading-item">
										<span class="reading-index">P{index + 1}:</span>
										<span class="reading-value">{reading} PSI</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- GPS Tracking -->
				<div class="data-category">
					<h3 class="category-title">
						📍 GPS Tracking Data
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Route Waypoints</h4>
							<div class="gps-trail">
								{#each haulData.gpsTrail as waypoint, index}
									<div class="waypoint-item">
										<div class="waypoint-header">
											<span class="waypoint-index">Waypoint {index + 1}</span>
											<span class="waypoint-time">{formatDateTime(waypoint.timestamp)}</span>
										</div>
										<div class="waypoint-coords">
											<span class="coord">Lat: {formatCoordinate(waypoint.lat)}</span>
											<span class="coord">Lng: {formatCoordinate(waypoint.lng)}</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Financial Data -->
				<div class="data-category">
					<h3 class="category-title">
						💰 Financial Details
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Revenue & Costs</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">Gross Revenue:</span>
									<span class="data-value">{formatCurrency(haulData.revenue)}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Fuel Cost:</span>
									<span class="data-value">{formatCurrency(haulData.fuelCost)}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Net Profit:</span>
									<span class="data-value">{formatCurrency(haulData.revenue - haulData.fuelCost)}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Profit Margin:</span>
									<span class="data-value">{(((haulData.revenue - haulData.fuelCost) / haulData.revenue) * 100).toFixed(2)}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Performance Metrics -->
				<div class="data-category">
					<h3 class="category-title">
						📊 Performance Metrics
					</h3>
					<div class="data-grid">
						<div class="data-group">
							<h4 class="group-title">Calculated Efficiency</h4>
							<div class="data-pairs">
								<div class="data-pair">
									<span class="data-label">Overall Efficiency:</span>
									<span class="data-value efficiency-{haulData.efficiency >= 95 ? 'excellent' : haulData.efficiency >= 85 ? 'good' : haulData.efficiency >= 75 ? 'warning' : 'critical'}">{haulData.efficiency.toFixed(3)}%</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Miles per Hour:</span>
									<span class="data-value">{(haulData.distance / (haulData.duration / 60)).toFixed(2)} mph</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Revenue per Mile:</span>
									<span class="data-value">{formatCurrency(haulData.revenue / haulData.distance)}</span>
								</div>
								<div class="data-pair">
									<span class="data-label">Revenue per Hour:</span>
									<span class="data-value">{formatCurrency(haulData.revenue / (haulData.duration / 60))}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="no-data">
		<p>No haul data available</p>
	</div>
{/if}

<style>
	.haul-detail {
		@apply p-6 space-y-6 overflow-y-auto h-full;
	}

	.detail-header {
		@apply mb-6;
	}

	.page-title {
		@apply text-2xl font-bold text-gray-900 dark:text-white mb-3;
	}

	.haul-meta {
		@apply flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300;
	}

	.truck-id,
	.route,
	.customer {
		@apply flex items-center gap-2;
	}

	.critical-alerts {
		@apply bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3;
	}

	.alert-header {
		@apply flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold;
	}

	.alert-item {
		@apply flex items-start gap-3 p-3 bg-white dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700;
	}

	.alert-content {
		@apply flex-1;
	}

	.alert-type {
		@apply text-xs font-mono text-red-600 dark:text-red-400 mb-1;
	}

	.alert-summary {
		@apply text-sm font-medium text-gray-900 dark:text-white;
	}

	.alert-time {
		@apply text-xs text-gray-500 dark:text-gray-400 font-mono;
	}

	.summary-section {
		@apply space-y-4;
	}

	.section-title {
		@apply text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3;
	}

	.section-subtitle {
		@apply text-sm font-normal text-gray-500 dark:text-gray-400;
	}

	.summary-grid {
		@apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4;
	}

	.summary-card {
		@apply bg-white dark:bg-gray-800 border rounded-lg p-4 flex items-center gap-4;
	}

	.summary-card.good {
		@apply border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10;
	}

	.summary-card.warning {
		@apply border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10;
	}

	.summary-card.critical {
		@apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10;
	}

	.summary-icon {
		@apply flex-shrink-0 p-2 rounded-lg bg-white dark:bg-gray-700;
	}

	.summary-content {
		@apply flex-1;
	}

	.summary-value {
		@apply text-xl font-bold text-gray-900 dark:text-white;
	}

	.summary-label {
		@apply text-sm font-medium text-gray-600 dark:text-gray-300;
	}

	.summary-detail {
		@apply text-xs text-gray-500 dark:text-gray-400;
	}

	.raw-data-section {
		@apply space-y-6;
	}

	.data-category {
		@apply bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden;
	}

	.data-category.critical-data {
		@apply border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/5;
	}

	.category-title {
		@apply text-lg font-semibold text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700;
	}

	.data-grid {
		@apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-4;
	}

	.data-group {
		@apply space-y-3;
	}

	.group-title {
		@apply text-sm font-semibold text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-600;
	}

	.data-pairs {
		@apply space-y-2;
	}

	.data-pair {
		@apply flex justify-between items-center py-1;
	}

	.data-pair.critical {
		@apply bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded;
	}

	.data-label {
		@apply text-sm text-gray-600 dark:text-gray-400 font-medium;
	}

	.data-value {
		@apply text-sm text-gray-900 dark:text-white font-mono;
	}

	.data-value.loss-value {
		@apply text-red-600 dark:text-red-400 font-bold;
	}

	.status-completed {
		@apply text-green-600 dark:text-green-400;
	}

	.status-in-progress {
		@apply text-blue-600 dark:text-blue-400;
	}

	.efficiency-excellent {
		@apply text-green-600 dark:text-green-400;
	}

	.efficiency-good {
		@apply text-blue-600 dark:text-blue-400;
	}

	.efficiency-warning {
		@apply text-yellow-600 dark:text-yellow-400;
	}

	.efficiency-critical {
		@apply text-red-600 dark:text-red-400;
	}

	.readings-grid {
		@apply grid grid-cols-2 sm:grid-cols-3 gap-2;
	}

	.reading-item {
		@apply flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs;
	}

	.reading-item.critical-reading {
		@apply bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300;
	}

	.reading-index {
		@apply font-medium;
	}

	.reading-value {
		@apply font-mono;
	}

	.gps-trail {
		@apply space-y-3;
	}

	.waypoint-item {
		@apply p-3 bg-gray-50 dark:bg-gray-700 rounded;
	}

	.waypoint-header {
		@apply flex justify-between items-center mb-2;
	}

	.waypoint-index {
		@apply text-sm font-medium text-gray-900 dark:text-white;
	}

	.waypoint-time {
		@apply text-xs text-gray-500 dark:text-gray-400 font-mono;
	}

	.waypoint-coords {
		@apply flex gap-4 text-xs font-mono text-gray-600 dark:text-gray-300;
	}

	.no-data {
		@apply p-6 text-center text-gray-500 dark:text-gray-400;
	}
</style> 