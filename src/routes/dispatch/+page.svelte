<script lang="ts">
	import { onMount } from 'svelte';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';
	import { activeHauls, completedHauls, drivers, trucks } from '$lib/stores/haulStore';

	// Tab management
	let activeTab = 'active-hauls';
	const tabs = [
		{ id: 'active-hauls', label: 'Active Hauls', icon: '🚛', count: $activeHauls.length },
		{ id: 'completed', label: 'Completed', icon: '✅', count: $completedHauls.length },
		{ id: 'fleet-tracking', label: 'Fleet Tracking', icon: '📍', count: $trucks.length },
		{ id: 'scheduling', label: 'Scheduling', icon: '📅', count: 12 },
		{ id: 'analytics', label: 'Analytics', icon: '📊', count: null }
	];

	// Mock data for dispatch operations
	let dispatchMetrics = {
		activeHauls: $activeHauls.length,
		onTimeDelivery: 96.3,
		fleetEfficiency: 89.7,
		costPerMile: 2.34,
		avgTurnaroundTime: 2.8,
		fuelEfficiency: 6.2,
		routeOptimization: 94.1,
		driverUtilization: 87.5
	};

	// Mock active hauls with enhanced data
	let enhancedActiveHauls = $activeHauls.map(haul => ({
		...haul,
		estimatedArrival: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000),
		currentLocation: `Mile ${Math.floor(Math.random() * 200)} on Route ${Math.floor(Math.random() * 10) + 1}`,
		fuelLevel: 65 + Math.random() * 30,
		speed: 45 + Math.random() * 20,
		nextStop: ['Pump Station A', 'Refinery B', 'Terminal C', 'Storage D'][Math.floor(Math.random() * 4)]
	}));

	// Mock completed hauls for today
	let todayCompletedHauls = Array.from({ length: 15 }, (_, i) => ({
		id: `HAUL-${1000 + i}`,
		driver: $drivers[i % $drivers.length],
		truck: $trucks[i % $trucks.length],
		route: `Route ${Math.floor(Math.random() * 10) + 1}`,
		completedAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
		volume: 150 + Math.random() * 100,
		efficiency: 85 + Math.random() * 15,
		onTime: Math.random() > 0.1,
		fuelUsed: 25 + Math.random() * 15
	}));

	// Mock fleet tracking data
	let fleetData = $trucks.map(truck => ({
		...truck,
		currentDriver: $drivers[Math.floor(Math.random() * $drivers.length)],
		location: `Mile ${Math.floor(Math.random() * 200)} on Route ${Math.floor(Math.random() * 10) + 1}`,
		status: ['Active', 'Idle', 'Maintenance', 'Refueling'][Math.floor(Math.random() * 4)],
		fuelLevel: 30 + Math.random() * 70,
		lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
		mileage: 45000 + Math.random() * 50000,
		efficiency: 85 + Math.random() * 15
	}));

	// Mock scheduling data
	let scheduledHauls = Array.from({ length: 12 }, (_, i) => ({
		id: `SCHED-${2000 + i}`,
		scheduledTime: new Date(Date.now() + (i + 1) * 2 * 60 * 60 * 1000),
		driver: $drivers[i % $drivers.length],
		truck: $trucks[i % $trucks.length],
		route: `Route ${Math.floor(Math.random() * 10) + 1}`,
		priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
		estimatedDuration: 3 + Math.random() * 4,
		volume: 150 + Math.random() * 100
	}));

	function getStatusColor(status: string) {
		switch (status.toLowerCase()) {
			case 'active': return 'bg-emerald-100 text-emerald-700';
			case 'idle': return 'bg-amber-100 text-amber-700';
			case 'maintenance': return 'bg-red-100 text-red-700';
			case 'refueling': return 'bg-blue-100 text-blue-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}

	function getPriorityColor(priority: string) {
		switch (priority.toLowerCase()) {
			case 'high': return 'bg-red-100 text-red-700';
			case 'medium': return 'bg-amber-100 text-amber-700';
			case 'low': return 'bg-emerald-100 text-emerald-700';
			default: return 'bg-gray-100 text-gray-700';
		}
	}

	function formatDuration(hours: number) {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		return `${h}h ${m}m`;
	}
</script>

<div class="dispatch-center">
	<div class="page-header mb-6">
		<h1 class="text-3xl font-bold tracking-tight text-oil-black mb-2">Dispatch Center</h1>
		<p class="text-oil-gray">Real-time fleet coordination and scheduling optimization</p>
	</div>

	<!-- Key Metrics Dashboard -->
	<div class="metrics-grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		<MetricCard 
			title="Active Hauls" 
			value={dispatchMetrics.activeHauls} 
			unit="" 
			icon="🚛" 
			status="normal"
			trend="up"
			trendValue="+3"
			color="blue"
		/>
		<MetricCard 
			title="On-Time Delivery" 
			value={dispatchMetrics.onTimeDelivery} 
			unit="%" 
			icon="⏰" 
			status="normal"
			trend="up"
			trendValue="+1.2%"
			color="emerald"
		/>
		<MetricCard 
			title="Fleet Efficiency" 
			value={dispatchMetrics.fleetEfficiency} 
			unit="%" 
			icon="📊" 
			status="normal"
			trend="up"
			trendValue="+3.1%"
			color="orange"
		/>
		<MetricCard 
			title="Cost Per Mile" 
			value={`$${dispatchMetrics.costPerMile}`} 
			unit="" 
			icon="💰" 
			status="normal"
			trend="down"
			trendValue="-$0.12"
			color="emerald"
		/>
	</div>

	<!-- Real-time Performance Charts -->
	<div class="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
		<div class="chart-container">
			<RealtimeChart 
				title="Fleet Utilization Rate"
				color="#7CB342"
				height={250}
				unit="%"
				animated={true}
			/>
		</div>
		<div class="chart-container">
			<RealtimeChart 
				title="On-Time Delivery Performance"
				color="#558B2F"
				height={250}
				unit="%"
				animated={true}
			/>
		</div>
	</div>

	<!-- Tabbed Data Views -->
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
						{#if tab.count !== null}
							<span class="tab-count">{tab.count}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<!-- Tab Content -->
		<div class="tab-content">
			{#if activeTab === 'active-hauls'}
				<div class="active-hauls-view">
					<div class="view-header mb-4">
						<h3 class="text-xl font-semibold text-oil-black">Active Hauls</h3>
						<p class="text-oil-gray">Real-time monitoring of ongoing operations</p>
					</div>
					
					<div class="hauls-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
						{#each enhancedActiveHauls as haul}
							<div class="haul-card glass-card p-4">
								<div class="haul-header flex justify-between items-start mb-3">
									<div>
										<h4 class="font-semibold text-oil-black">{haul.id}</h4>
										<p class="text-sm text-oil-gray">{$drivers.find(d => d.id === haul.driverId)?.name || 'Unknown Driver'}</p>
									</div>
									<span class="status-badge bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
										{haul.status}
									</span>
								</div>
								
								<div class="haul-details space-y-2">
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">Location:</span>
										<span class="text-oil-black text-sm font-medium">{haul.currentLocation}</span>
									</div>
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">Speed:</span>
										<span class="text-oil-black text-sm font-medium">{haul.speed.toFixed(0)} mph</span>
									</div>
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">Fuel:</span>
										<span class="text-oil-black text-sm font-medium">{haul.fuelLevel.toFixed(0)}%</span>
									</div>
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">ETA:</span>
										<span class="text-oil-black text-sm font-medium">{haul.estimatedArrival.toLocaleTimeString()}</span>
									</div>
								</div>
								
								<div class="haul-actions mt-4 flex gap-2">
									<button class="btn-sm bg-blue-500 text-white px-3 py-1 rounded-lg text-xs">Track</button>
									<button class="btn-sm bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs">Contact</button>
								</div>
							</div>
						{/each}
					</div>
				</div>

			{:else if activeTab === 'completed'}
				<div class="completed-hauls-view">
					<div class="view-header mb-4">
						<h3 class="text-xl font-semibold text-oil-black">Completed Hauls Today</h3>
						<p class="text-oil-gray">Performance summary and analytics</p>
					</div>
					
					<div class="completed-table">
						<div class="table-header grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg mb-2">
							<span class="font-medium text-oil-black">Haul ID</span>
							<span class="font-medium text-oil-black">Driver</span>
							<span class="font-medium text-oil-black">Route</span>
							<span class="font-medium text-oil-black">Completed</span>
							<span class="font-medium text-oil-black">Efficiency</span>
							<span class="font-medium text-oil-black">Status</span>
						</div>
						
						{#each todayCompletedHauls as haul}
							<div class="table-row grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
								<span class="text-oil-black font-medium">{haul.id}</span>
								<span class="text-oil-gray">{haul.driver.name}</span>
								<span class="text-oil-gray">{haul.route}</span>
								<span class="text-oil-gray text-sm">{haul.completedAt.toLocaleTimeString()}</span>
								<span class="text-oil-black font-medium">{haul.efficiency.toFixed(1)}%</span>
								<span class="status-badge {haul.onTime ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded text-xs">
									{haul.onTime ? 'On Time' : 'Delayed'}
								</span>
							</div>
						{/each}
					</div>
				</div>

			{:else if activeTab === 'fleet-tracking'}
				<div class="fleet-tracking-view">
					<div class="view-header mb-4">
						<h3 class="text-xl font-semibold text-oil-black">Fleet Tracking</h3>
						<p class="text-oil-gray">Real-time vehicle monitoring and status</p>
					</div>
					
					<div class="fleet-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
						{#each fleetData as truck}
							<div class="truck-card glass-card p-4">
								<div class="truck-header flex justify-between items-start mb-3">
									<div>
										<h4 class="font-semibold text-oil-black">{truck.id}</h4>
										<p class="text-sm text-oil-gray">{truck.currentDriver.name}</p>
									</div>
									<span class="status-badge {getStatusColor(truck.status)} px-2 py-1 rounded-lg text-xs font-medium">
										{truck.status}
									</span>
								</div>
								
								<div class="truck-details space-y-2">
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">Location:</span>
										<span class="text-oil-black text-sm font-medium">{truck.location}</span>
									</div>
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">Fuel Level:</span>
										<span class="text-oil-black text-sm font-medium">{truck.fuelLevel.toFixed(0)}%</span>
									</div>
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">Mileage:</span>
										<span class="text-oil-black text-sm font-medium">{truck.mileage.toLocaleString()} mi</span>
									</div>
									<div class="detail-row flex justify-between">
										<span class="text-oil-gray text-sm">Efficiency:</span>
										<span class="text-oil-black text-sm font-medium">{truck.efficiency.toFixed(1)}%</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

			{:else if activeTab === 'scheduling'}
				<div class="scheduling-view">
					<div class="view-header mb-4">
						<h3 class="text-xl font-semibold text-oil-black">Upcoming Scheduled Hauls</h3>
						<p class="text-oil-gray">Planned operations and resource allocation</p>
					</div>
					
					<div class="schedule-table">
						<div class="table-header grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg mb-2">
							<span class="font-medium text-oil-black">Scheduled Time</span>
							<span class="font-medium text-oil-black">Driver</span>
							<span class="font-medium text-oil-black">Truck</span>
							<span class="font-medium text-oil-black">Route</span>
							<span class="font-medium text-oil-black">Duration</span>
							<span class="font-medium text-oil-black">Priority</span>
						</div>
						
						{#each scheduledHauls as haul}
							<div class="table-row grid grid-cols-6 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
								<span class="text-oil-black font-medium">{haul.scheduledTime.toLocaleTimeString()}</span>
								<span class="text-oil-gray">{haul.driver.name}</span>
								<span class="text-oil-gray">{haul.truck.id}</span>
								<span class="text-oil-gray">{haul.route}</span>
								<span class="text-oil-black">{formatDuration(haul.estimatedDuration)}</span>
								<span class="status-badge {getPriorityColor(haul.priority)} px-2 py-1 rounded text-xs">
									{haul.priority}
								</span>
							</div>
						{/each}
					</div>
				</div>

			{:else if activeTab === 'analytics'}
				<div class="analytics-view">
					<div class="view-header mb-6">
						<h3 class="text-xl font-semibold text-oil-black">Dispatch Analytics</h3>
						<p class="text-oil-gray">Performance insights and optimization opportunities</p>
					</div>
					
					<div class="analytics-grid grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div class="chart-container">
							<RealtimeChart 
								title="Route Optimization Efficiency"
								color="#9CCC65"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Driver Utilization Rates"
								color="#CDDC39"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Fuel Efficiency Trends"
								color="#4CAF50"
								height={300}
								unit=" MPG"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Turnaround Time Analysis"
								color="#558B2F"
								height={300}
								unit=" hrs"
								animated={true}
							/>
						</div>
					</div>
					
					<!-- Additional Analytics Metrics -->
					<div class="analytics-metrics grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
						<MetricCard 
							title="Avg Turnaround" 
							value={dispatchMetrics.avgTurnaroundTime} 
							unit="hrs" 
							icon="⏱️" 
							status="normal"
							trend="down"
							trendValue="-0.3hrs"
							color="emerald"
						/>
						<MetricCard 
							title="Fuel Efficiency" 
							value={dispatchMetrics.fuelEfficiency} 
							unit="MPG" 
							icon="⛽" 
							status="normal"
							trend="up"
							trendValue="+0.4"
							color="blue"
						/>
						<MetricCard 
							title="Route Optimization" 
							value={dispatchMetrics.routeOptimization} 
							unit="%" 
							icon="🗺️" 
							status="normal"
							trend="up"
							trendValue="+2.1%"
							color="orange"
						/>
						<MetricCard 
							title="Driver Utilization" 
							value={dispatchMetrics.driverUtilization} 
							unit="%" 
							icon="👨‍💼" 
							status="normal"
							trend="stable"
							trendValue="+0.5%"
							color="purple"
						/>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.dispatch-center {
		padding: 2rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	.page-header {
		text-align: center;
	}

	.metrics-grid {
		margin-bottom: 2rem;
	}

	.charts-grid {
		margin-bottom: 2rem;
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

	.tab-count {
		background: rgba(124, 179, 66, 0.2);
		color: #558B2F;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.tab-button.active .tab-count {
		background: #7CB342;
		color: white;
	}

	.view-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.haul-card, .truck-card {
		transition: all 0.2s ease;
	}

	.haul-card:hover, .truck-card:hover {
		transform: translateY(-2px);
	}

	.status-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.btn-sm {
		font-size: 12px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.btn-sm:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.table-header {
		font-size: 14px;
	}

	.table-row {
		font-size: 14px;
		transition: all 0.2s ease;
	}

	.detail-row {
		font-size: 13px;
	}

	@media (max-width: 768px) {
		.dispatch-center {
			padding: 1rem;
		}

		.metrics-grid {
			grid-template-columns: 1fr;
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}

		.hauls-grid, .fleet-grid {
			grid-template-columns: 1fr;
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