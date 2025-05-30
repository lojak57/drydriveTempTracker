<script lang="ts">
	import { onMount } from 'svelte';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';
	import { drivers, trucks, activeHauls, completedHauls } from '$lib/stores/haulStore';

	// Driver selection and data
	let selectedDriver = $drivers[0];
	let activeTab = 'performance';
	
	const tabs = [
		{ id: 'performance', label: 'Performance', icon: '📊' },
		{ id: 'haul-history', label: 'Haul History', icon: '📋' },
		{ id: 'routes', label: 'Route Analytics', icon: '🗺️' },
		{ id: 'trends', label: 'Trends', icon: '📈' },
		{ id: 'safety', label: 'Safety Record', icon: '🛡️' }
	];

	// Mock driver performance data
	let driverMetrics = {
		safetyScore: 98.5,
		efficiencyRating: 92.1,
		haulsThisMonth: 47,
		fuelEfficiency: 6.8,
		onTimeDelivery: 96.2,
		totalMiles: 12450,
		avgHaulTime: 4.2,
		customerRating: 4.8
	};

	// Mock haul history data
	let haulHistory = Array.from({ length: 25 }, (_, i) => ({
		id: `HAUL-${3000 + i}`,
		date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
		route: `Route ${Math.floor(Math.random() * 10) + 1}`,
		truck: $trucks[Math.floor(Math.random() * $trucks.length)],
		startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000 - Math.random() * 8 * 60 * 60 * 1000),
		endTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000 - Math.random() * 4 * 60 * 60 * 1000),
		volume: 150 + Math.random() * 100,
		efficiency: 85 + Math.random() * 15,
		fuelUsed: 25 + Math.random() * 15,
		distance: 120 + Math.random() * 80,
		onTime: Math.random() > 0.15,
		safetyIncidents: Math.random() > 0.95 ? 1 : 0
	}));

	// Mock route analytics
	let routeAnalytics = [
		{ route: 'Route 1', frequency: 12, avgTime: 3.8, efficiency: 94.2, fuelMPG: 7.1 },
		{ route: 'Route 2', frequency: 8, avgTime: 4.5, efficiency: 91.8, fuelMPG: 6.9 },
		{ route: 'Route 3', frequency: 15, avgTime: 3.2, efficiency: 96.1, fuelMPG: 7.3 },
		{ route: 'Route 4', frequency: 6, avgTime: 5.1, efficiency: 88.5, fuelMPG: 6.5 },
		{ route: 'Route 5', frequency: 10, avgTime: 4.0, efficiency: 93.7, fuelMPG: 7.0 }
	];

	// Mock safety record
	let safetyRecord = {
		daysWithoutIncident: 245,
		totalIncidents: 2,
		lastIncidentDate: new Date(Date.now() - 245 * 24 * 60 * 60 * 1000),
		safetyTrainingCompleted: 8,
		safetyTrainingDue: 1,
		violations: 0,
		commendations: 3
	};

	// Mock trend data
	let trendData = {
		monthlyEfficiency: [89.2, 91.5, 93.1, 92.8, 94.2, 92.1],
		monthlyFuelEfficiency: [6.2, 6.5, 6.8, 6.7, 7.0, 6.8],
		monthlyOnTime: [94.1, 95.8, 96.5, 95.2, 97.1, 96.2],
		monthlySafety: [97.8, 98.2, 98.5, 98.1, 98.7, 98.5]
	};

	function formatDuration(startTime: Date, endTime: Date) {
		const diff = endTime.getTime() - startTime.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${hours}h ${minutes}m`;
	}

	function getEfficiencyColor(efficiency: number) {
		if (efficiency >= 95) return 'text-emerald-600';
		if (efficiency >= 90) return 'text-blue-600';
		if (efficiency >= 85) return 'text-amber-600';
		return 'text-red-600';
	}

	function getRouteEfficiencyBadge(efficiency: number) {
		if (efficiency >= 95) return 'bg-emerald-100 text-emerald-700';
		if (efficiency >= 90) return 'bg-blue-100 text-blue-700';
		if (efficiency >= 85) return 'bg-amber-100 text-amber-700';
		return 'bg-red-100 text-red-700';
	}
</script>

<div class="drivers-dashboard">
	<div class="page-header mb-6">
		<h1 class="text-3xl font-bold tracking-tight text-oil-black mb-2">Driver Dashboard</h1>
		<p class="text-oil-gray">Personal performance tracking and analytics</p>
	</div>

	<!-- Driver Selection -->
	<div class="driver-selection mb-6">
		<div class="glass-card p-4">
			<div class="flex items-center gap-4">
				<div class="driver-avatar">
					<div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
						{selectedDriver.name.split(' ').map(n => n[0]).join('')}
					</div>
				</div>
				<div class="driver-info flex-1">
					<h2 class="text-xl font-semibold text-oil-black">{selectedDriver.name}</h2>
					<p class="text-oil-gray">Driver ID: {selectedDriver.id}</p>
					<p class="text-oil-gray text-sm">Experience: {selectedDriver.experience} years</p>
				</div>
				<div class="driver-selector">
					<select 
						bind:value={selectedDriver} 
						class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-oil-black"
					>
						{#each $drivers as driver}
							<option value={driver}>{driver.name}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Key Performance Metrics -->
	<div class="metrics-grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		<MetricCard 
			title="Safety Score" 
			value={driverMetrics.safetyScore} 
			unit="%" 
			icon="🛡️" 
			status="normal"
			trend="up"
			trendValue="+0.3%"
			color="emerald"
		/>
		<MetricCard 
			title="Efficiency Rating" 
			value={driverMetrics.efficiencyRating} 
			unit="%" 
			icon="⚡" 
			status="normal"
			trend="up"
			trendValue="+2.7%"
			color="blue"
		/>
		<MetricCard 
			title="Hauls This Month" 
			value={driverMetrics.haulsThisMonth} 
			unit="" 
			icon="🚛" 
			status="normal"
			trend="up"
			trendValue="+5"
			color="orange"
		/>
		<MetricCard 
			title="Fuel Efficiency" 
			value={driverMetrics.fuelEfficiency} 
			unit="MPG" 
			icon="⛽" 
			status="normal"
			trend="up"
			trendValue="+0.2"
			color="emerald"
		/>
	</div>

	<!-- Tabbed Content -->
	<div class="glass-card p-6">
		<!-- Tab Navigation -->
		<div class="tab-navigation mb-6">
			<div class="flex flex-wrap gap-2">
				{#each tabs as tab}
					<button
						class="tab-button {activeTab === tab.id ? 'active' : ''}"
						on:click={() => activeTab = tab.id}
					>
						<span class="tab-icon">{tab.icon}</span>
						<span class="tab-label">{tab.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Tab Content -->
		<div class="tab-content">
			{#if activeTab === 'performance'}
				<div class="performance-view">
					<div class="view-header mb-6">
						<h3 class="text-xl font-semibold text-oil-black">Performance Overview</h3>
						<p class="text-oil-gray">Current month performance metrics and comparisons</p>
					</div>
					
					<!-- Performance Charts -->
					<div class="performance-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						<div class="chart-container">
							<RealtimeChart 
								title="Daily Efficiency Trends"
								color="#7CB342"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Fuel Consumption Analysis"
								color="#558B2F"
								height={300}
								unit=" MPG"
								animated={true}
							/>
						</div>
					</div>
					
					<!-- Additional Performance Metrics -->
					<div class="performance-metrics grid grid-cols-2 lg:grid-cols-4 gap-4">
						<MetricCard 
							title="On-Time Delivery" 
							value={driverMetrics.onTimeDelivery} 
							unit="%" 
							icon="⏰" 
							status="normal"
							trend="up"
							trendValue="+1.5%"
							color="emerald"
						/>
						<MetricCard 
							title="Total Miles" 
							value={driverMetrics.totalMiles.toLocaleString()} 
							unit="" 
							icon="🛣️" 
							status="normal"
							trend="up"
							trendValue="+850"
							color="blue"
						/>
						<MetricCard 
							title="Avg Haul Time" 
							value={driverMetrics.avgHaulTime} 
							unit="hrs" 
							icon="⏱️" 
							status="normal"
							trend="down"
							trendValue="-0.3hrs"
							color="emerald"
						/>
						<MetricCard 
							title="Customer Rating" 
							value={driverMetrics.customerRating} 
							unit="/5" 
							icon="⭐" 
							status="normal"
							trend="up"
							trendValue="+0.1"
							color="orange"
						/>
					</div>
				</div>

			{:else if activeTab === 'haul-history'}
				<div class="haul-history-view">
					<div class="view-header mb-4">
						<h3 class="text-xl font-semibold text-oil-black">Haul History</h3>
						<p class="text-oil-gray">Recent haul completions and performance details</p>
					</div>
					
					<div class="haul-table">
						<div class="table-header grid grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg mb-2">
							<span class="font-medium text-oil-black">Haul ID</span>
							<span class="font-medium text-oil-black">Date</span>
							<span class="font-medium text-oil-black">Route</span>
							<span class="font-medium text-oil-black">Duration</span>
							<span class="font-medium text-oil-black">Efficiency</span>
							<span class="font-medium text-oil-black">Fuel Used</span>
							<span class="font-medium text-oil-black">Status</span>
						</div>
						
						{#each haulHistory.slice(0, 15) as haul}
							<div class="table-row grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
								<span class="text-oil-black font-medium">{haul.id}</span>
								<span class="text-oil-gray">{haul.date.toLocaleDateString()}</span>
								<span class="text-oil-gray">{haul.route}</span>
								<span class="text-oil-black">{formatDuration(haul.startTime, haul.endTime)}</span>
								<span class="{getEfficiencyColor(haul.efficiency)} font-medium">{haul.efficiency.toFixed(1)}%</span>
								<span class="text-oil-gray">{haul.fuelUsed.toFixed(1)} gal</span>
								<span class="status-badge {haul.onTime ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded text-xs">
									{haul.onTime ? 'On Time' : 'Delayed'}
								</span>
							</div>
						{/each}
					</div>
				</div>

			{:else if activeTab === 'routes'}
				<div class="routes-view">
					<div class="view-header mb-4">
						<h3 class="text-xl font-semibold text-oil-black">Route Analytics</h3>
						<p class="text-oil-gray">Performance breakdown by route and optimization insights</p>
					</div>
					
					<div class="route-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
						<div class="chart-container">
							<RealtimeChart 
								title="Route Efficiency Comparison"
								color="#9CCC65"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Fuel Efficiency by Route"
								color="#CDDC39"
								height={300}
								unit=" MPG"
								animated={true}
							/>
						</div>
					</div>
					
					<div class="route-table">
						<div class="table-header grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg mb-2">
							<span class="font-medium text-oil-black">Route</span>
							<span class="font-medium text-oil-black">Frequency</span>
							<span class="font-medium text-oil-black">Avg Time</span>
							<span class="font-medium text-oil-black">Efficiency</span>
							<span class="font-medium text-oil-black">Fuel MPG</span>
						</div>
						
						{#each routeAnalytics as route}
							<div class="table-row grid grid-cols-5 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
								<span class="text-oil-black font-medium">{route.route}</span>
								<span class="text-oil-gray">{route.frequency} hauls</span>
								<span class="text-oil-gray">{route.avgTime}hrs</span>
								<span class="status-badge {getRouteEfficiencyBadge(route.efficiency)} px-2 py-1 rounded text-xs">
									{route.efficiency.toFixed(1)}%
								</span>
								<span class="text-oil-black">{route.fuelMPG} MPG</span>
							</div>
						{/each}
					</div>
				</div>

			{:else if activeTab === 'trends'}
				<div class="trends-view">
					<div class="view-header mb-6">
						<h3 class="text-xl font-semibold text-oil-black">Performance Trends</h3>
						<p class="text-oil-gray">6-month performance trend analysis</p>
					</div>
					
					<div class="trends-charts grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div class="chart-container">
							<RealtimeChart 
								title="Monthly Efficiency Trends"
								color="#4CAF50"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Safety Score Trends"
								color="#558B2F"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Fuel Efficiency Trends"
								color="#7CB342"
								height={300}
								unit=" MPG"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="On-Time Delivery Trends"
								color="#9CCC65"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
					</div>
				</div>

			{:else if activeTab === 'safety'}
				<div class="safety-view">
					<div class="view-header mb-6">
						<h3 class="text-xl font-semibold text-oil-black">Safety Record</h3>
						<p class="text-oil-gray">Safety performance and training status</p>
					</div>
					
					<div class="safety-metrics grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<div class="safety-card glass-card p-4 text-center">
							<div class="text-3xl text-emerald-600 mb-2">🛡️</div>
							<div class="metric-display text-2xl text-emerald-600 mb-1">{safetyRecord.daysWithoutIncident}</div>
							<div class="text-oil-gray text-sm">Days Without Incident</div>
						</div>
						
						<div class="safety-card glass-card p-4 text-center">
							<div class="text-3xl text-blue-600 mb-2">📚</div>
							<div class="metric-display text-2xl text-blue-600 mb-1">{safetyRecord.safetyTrainingCompleted}</div>
							<div class="text-oil-gray text-sm">Training Completed</div>
						</div>
						
						<div class="safety-card glass-card p-4 text-center">
							<div class="text-3xl text-orange-600 mb-2">⚠️</div>
							<div class="metric-display text-2xl text-orange-600 mb-1">{safetyRecord.violations}</div>
							<div class="text-oil-gray text-sm">Violations</div>
						</div>
						
						<div class="safety-card glass-card p-4 text-center">
							<div class="text-3xl text-emerald-600 mb-2">🏆</div>
							<div class="metric-display text-2xl text-emerald-600 mb-1">{safetyRecord.commendations}</div>
							<div class="text-oil-gray text-sm">Commendations</div>
						</div>
					</div>
					
					<div class="safety-details grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div class="glass-card p-6">
							<h4 class="text-lg font-semibold text-oil-black mb-4">Incident History</h4>
							<div class="space-y-3">
								<div class="flex justify-between">
									<span class="text-oil-gray">Total Incidents:</span>
									<span class="text-oil-black font-medium">{safetyRecord.totalIncidents}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-oil-gray">Last Incident:</span>
									<span class="text-oil-black font-medium">{safetyRecord.lastIncidentDate.toLocaleDateString()}</span>
								</div>
								<div class="flex justify-between">
									<span class="text-oil-gray">Safety Score:</span>
									<span class="text-emerald-600 font-medium">{driverMetrics.safetyScore}%</span>
								</div>
							</div>
						</div>
						
						<div class="glass-card p-6">
							<h4 class="text-lg font-semibold text-oil-black mb-4">Training Status</h4>
							<div class="space-y-3">
								<div class="flex justify-between">
									<span class="text-oil-gray">Completed:</span>
									<span class="text-emerald-600 font-medium">{safetyRecord.safetyTrainingCompleted} modules</span>
								</div>
								<div class="flex justify-between">
									<span class="text-oil-gray">Due:</span>
									<span class="text-amber-600 font-medium">{safetyRecord.safetyTrainingDue} module</span>
								</div>
								<div class="flex justify-between">
									<span class="text-oil-gray">Compliance:</span>
									<span class="text-emerald-600 font-medium">89%</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.drivers-dashboard {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
	}

	.driver-selection {
		margin-bottom: 2rem;
	}

	.driver-avatar {
		flex-shrink: 0;
	}

	.tab-navigation {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.tab-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: transparent;
		border: none;
		border-radius: 12px 12px 0 0;
		color: #6b7280;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border-bottom: 2px solid transparent;
	}

	.tab-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #1a1a1a;
	}

	.tab-button.active {
		background: rgba(124, 179, 66, 0.1);
		color: #7CB342;
		border-bottom-color: #7CB342;
	}

	.tab-icon {
		font-size: 16px;
	}

	.view-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.table-header {
		font-size: 14px;
	}

	.table-row {
		font-size: 14px;
		transition: all 0.2s ease;
	}

	.status-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.safety-card {
		transition: all 0.2s ease;
	}

	.safety-card:hover {
		transform: translateY(-2px);
	}

	.metric-display {
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		font-weight: 700;
	}

	@media (max-width: 768px) {
		.drivers-dashboard {
			padding: 1rem;
		}

		.metrics-grid {
			grid-template-columns: 1fr;
		}

		.performance-charts, .route-charts, .trends-charts {
			grid-template-columns: 1fr;
		}

		.safety-metrics {
			grid-template-columns: repeat(2, 1fr);
		}

		.table-header, .table-row {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.tab-button {
			padding: 8px 12px;
			font-size: 14px;
		}
	}
</style> 