<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import YardAnalyticsTable from '$lib/components/yard/YardAnalyticsTable.svelte';
	import FleetStatusSection from '$lib/components/ui/FleetStatusSection.svelte';
	import BatteryStatusWidget from '$lib/components/ui/BatteryStatusWidget.svelte';
	import TrendCell from '$lib/components/ui/TrendCell.svelte';
	import ClickToExplore from '$lib/components/ui/ClickToExplore.svelte';
	import { formatPercentage, getTrendColor, getPerformanceStatus } from '$lib/utils/formatting.js';
	import { Warehouse, Truck, BarChart3, Shield, TrendingUp, AlertTriangle, Users, Zap } from 'lucide-svelte';

	// Analytics table state
	let showAnalyticsTable = false;
	let activeFleetTab = 'driver-management'; // 'driver-management' | 'fleet-overview' | 'yard-ops'
	let fleetSections = {
		active: false,
		maintenance: false,
		available: false
	};

	// Driver Management Battery Data
	const driverStatusItems = [
		{
			id: 'duty-status',
			label: 'Duty Status',
			value: '18/24',
			status: 'excellent' as const,
			percentage: 75,
			sparklineData: [16, 17, 18, 17, 18, 19, 18],
			location: 'North Yard',
			lastUpdated: '2 min ago'
		},
		{
			id: 'current-location',
			label: 'En Route',
			value: '12',
			status: 'good' as const,
			percentage: 67,
			sparklineData: [10, 11, 12, 11, 13, 12, 12],
			location: 'Various',
			lastUpdated: '30 sec ago'
		},
		{
			id: 'last-load',
			label: 'Load Time Avg',
			value: '42min',
			status: 'warning' as const,
			percentage: 45,
			sparklineData: [38, 40, 42, 45, 44, 42, 43],
			location: 'Loading Bays',
			lastUpdated: '1 min ago'
		}
	];

	// Fleet Status Data
	const fleetData = {
		active: {
			count: 18,
			items: [
				{ id: 'T-001', name: 'T-001', status: 'On Route', extra: 'ETA: 2:15 PM' },
				{ id: 'T-003', name: 'T-003', status: 'Loading', extra: 'Bay #3' },
				{ id: 'T-005', name: 'T-005', status: 'In Transit', extra: '15 min to dest' },
				{ id: 'T-007', name: 'T-007', status: 'Ready', extra: 'Awaiting dispatch' },
				{ id: 'T-009', name: 'T-009', status: 'Active', extra: 'Driver en route' }
			]
		},
		maintenance: {
			count: 3,
			items: [
				{ id: 'T-012', name: 'T-012', status: 'Service', extra: 'Scheduled maintenance' },
				{ id: 'T-018', name: 'T-018', status: 'Inspection', extra: 'DOT inspection due' },
				{ id: 'T-024', name: 'T-024', status: 'Repair', extra: 'Brake system repair' }
			]
		},
		available: {
			count: 3,
			items: [
				{ id: 'T-002', name: 'T-002', status: 'Ready', extra: 'Fueled and inspected' },
				{ id: 'T-016', name: 'T-016', status: 'Standby', extra: 'Driver break' },
				{ id: 'T-021', name: 'T-021', status: 'Ready', extra: 'Available for dispatch' }
			]
		}
	};

	function openAnalyticsTable() {
		showAnalyticsTable = true;
	}

	function closeAnalyticsTable() {
		showAnalyticsTable = false;
	}

	function handleFleetSectionToggle(event: CustomEvent) {
		const { section, expanded } = event.detail;
		const sectionKey = section.toLowerCase().split(' ')[0] as keyof typeof fleetSections;
		fleetSections[sectionKey] = expanded;
	}
</script>

<svelte:head>
	<title>Yard Manager Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="yard-dashboard">
	<!-- Header -->
	<div class="dashboard-header bg-slate-800 text-white">
		<div class="header-content">
			<div class="header-text">
				<h1 class="header-title text-xl font-semibold">Yard Manager Dashboard</h1>
				<p class="header-subtitle text-slate-300">Fleet overview, driver management, and yard operations</p>
			</div>
		</div>
	</div>

	<!-- Top Navigation for Main Sections -->
	<div class="section-nav bg-white rounded-lg border shadow-sm mb-6 p-1">
		<div class="nav-buttons flex gap-1">
			<button 
				class="nav-btn {activeFleetTab === 'driver-management' ? 'active' : ''}"
				on:click={() => activeFleetTab = 'driver-management'}
			>
				<Users size={16} />
				Driver Management
			</button>
			<button 
				class="nav-btn {activeFleetTab === 'fleet-overview' ? 'active' : ''}"
				on:click={() => activeFleetTab = 'fleet-overview'}
			>
				<Truck size={16} />
				Fleet Overview
			</button>
			<button 
				class="nav-btn {activeFleetTab === 'yard-ops' ? 'active' : ''}"
				on:click={() => activeFleetTab = 'yard-ops'}
			>
				<BarChart3 size={16} />
				Yard Operations
			</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="main-content">
		{#if activeFleetTab === 'driver-management'}
			<!-- Driver Management (Moved to Top) -->
			<div class="content-section">
				<div class="section-header mb-6">
					<h2 class="text-lg font-semibold tracking-tight text-slate-800">Driver Management</h2>
					<p class="text-sm text-slate-600">Critical driver KPIs with real-time monitoring</p>
				</div>
				
				<!-- Battery-style Driver Status Widget -->
				<div class="driver-battery-widget mb-6">
					<BatteryStatusWidget 
						items={driverStatusItems}
						viewMode="3-card"
						maxItems={3}
					/>
				</div>

				<!-- Driver Metrics Cards -->
				<div class="driver-metrics grid grid-cols-1 md:grid-cols-2 gap-6">
					<MetricCard 
						title="Active Drivers" 
						value="156" 
						unit="certified" 
						icon={Users}
						status="normal"
						trend="up"
						trendValue="+4 this month"
						color="slate"
					/>
					<MetricCard 
						title="Safety Compliance" 
						value="97.8" 
						unit="%" 
						icon={Shield}
						status="normal"
						trend="up"
						trendValue="+1.2%"
						color="slate"
					/>
				</div>
			</div>

		{:else if activeFleetTab === 'fleet-overview'}
			<!-- Overview Metrics -->
			<div class="overview-metrics grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<MetricCard 
					title="Total Fleet" 
					value="89" 
					unit="trucks" 
					icon={Truck}
					status="normal"
					trend="stable"
					trendValue="0 this week"
					color="slate"
				/>
				<MetricCard 
					title="Active Today" 
					value="67" 
					unit="trucks" 
					icon={Truck}
					status="normal"
					trend="up"
					trendValue="+8 vs yesterday"
					color="slate"
				/>
				<MetricCard 
					title="Maintenance Mode" 
					value="8" 
					unit="trucks" 
					icon={BarChart3}
					status="warning"
					trend="stable"
					trendValue="scheduled"
					color="slate"
				/>
				<MetricCard 
					title="Utilization Rate" 
					value="75.3" 
					unit="%" 
					icon={BarChart3}
					status="normal"
					trend="up"
					trendValue="+3.2%"
					color="slate"
				/>
			</div>

			<!-- Fleet Status with Accordion -->
			<div class="content-section">
				<h2 class="text-lg font-semibold tracking-tight text-slate-800 mb-6">Fleet Status Overview</h2>
				<div class="fleet-status-sections space-y-4">
					<FleetStatusSection 
						title="Active Trucks"
						count={fleetData.active.count}
						status="active"
						expanded={fleetSections.active}
						items={fleetData.active.items}
						on:toggle={handleFleetSectionToggle}
					/>
					<FleetStatusSection 
						title="Maintenance"
						count={fleetData.maintenance.count}
						status="maintenance"
						expanded={fleetSections.maintenance}
						items={fleetData.maintenance.items}
						on:toggle={handleFleetSectionToggle}
					/>
					<FleetStatusSection 
						title="Available"
						count={fleetData.available.count}
						status="available"
						expanded={fleetSections.available}
						items={fleetData.available.items}
						on:toggle={handleFleetSectionToggle}
					/>
				</div>
			</div>

		{:else if activeFleetTab === 'yard-ops'}
			<!-- Enhanced Performance Analytics Section -->
			<div class="content-section performance-analytics-section">
				<div class="section-header mb-6">
					<h2 class="text-lg font-semibold tracking-tight text-slate-800">Performance Analytics</h2>
					<p class="text-sm text-slate-600 tracking-normal">Defend your numbers with complete operational context</p>
				</div>
				
				<!-- Summary Performance Cards -->
				<div class="performance-summary grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div class="perf-card excellent" on:click={openAnalyticsTable}>
						<div class="perf-header">
							<div class="perf-icon">
								<TrendingUp size={24} />
							</div>
							<div class="perf-status text-sm font-semibold tracking-tight">EXCELLENT</div>
						</div>
						<h3 class="text-lg font-semibold tracking-tight text-slate-800">Daily Throughput</h3>
						<div class="perf-value text-2xl font-bold font-mono text-slate-900">2,847 BBL</div>
						<div class="perf-trend">
							<TrendCell value={312} type="absolute" size="sm" />
							<span class="text-slate-600 text-sm font-medium">vs yesterday</span>
						</div>
					</div>

					<div class="perf-card good" on:click={openAnalyticsTable}>
						<div class="perf-header">
							<div class="perf-icon">
								<BarChart3 size={24} />
							</div>
							<div class="perf-status text-sm font-semibold tracking-tight">GOOD</div>
						</div>
						<h3 class="text-lg font-semibold tracking-tight text-slate-800">Barrels per Drive Hour</h3>
						<div class="perf-value text-2xl font-bold font-mono text-slate-900">185.3</div>
						<p class="text-slate-600 text-sm font-medium">Above target efficiency</p>
					</div>

					<div class="perf-card warning" on:click={openAnalyticsTable}>
						<div class="perf-header">
							<div class="perf-icon">
								<AlertTriangle size={24} />
							</div>
							<div class="perf-status text-sm font-semibold tracking-tight">REVIEW</div>
						</div>
						<h3 class="text-lg font-semibold tracking-tight text-slate-800">Load Efficiency Index</h3>
						<div class="perf-value text-2xl font-bold font-mono text-slate-900">4.2</div>
						<p class="text-slate-600 text-sm font-medium">3 trucks in maintenance</p>
					</div>
				</div>

				<!-- Quick Stats with Standardized Fonts -->
				<div class="quick-stats grid grid-cols-2 md:grid-cols-4 gap-6">
					<div class="stat-item">
						<span class="stat-label text-xs uppercase text-slate-500 tracking-wide">Active Trucks</span>
						<span class="stat-value text-lg font-semibold text-slate-800 font-mono">75.3%</span>
					</div>
					<div class="stat-item">
						<span class="stat-label text-xs uppercase text-slate-500 tracking-wide">Drivers En Route</span>
						<span class="stat-value text-lg font-semibold text-slate-800 font-mono">68.2%</span>
					</div>
					<div class="stat-item">
						<span class="stat-label text-xs uppercase text-slate-500 tracking-wide">7-Day Average</span>
						<span class="stat-value text-lg font-semibold text-slate-800 font-mono">2,701 BBL</span>
					</div>
					<div class="stat-item">
						<span class="stat-label text-xs uppercase text-slate-500 tracking-wide">Efficiency Rating</span>
						<div class="stat-value-with-trend flex items-center gap-2">
							<span class="text-lg font-semibold text-slate-800 font-mono">92.3%</span>
							<TrendCell value={2.1} size="sm" />
						</div>
					</div>
				</div>
			</div>

			<!-- Operations Summary -->
			<div class="content-section mt-8">
				<h2 class="text-lg font-semibold tracking-tight text-slate-800 mb-6">Operations Summary</h2>
				<div class="operations-grid grid grid-cols-1 md:grid-cols-2 gap-6">
					<div class="operation-card">
						<h3 class="text-sm font-semibold uppercase text-slate-500 tracking-wide">Loading Efficiency</h3>
						<div class="metric-value font-mono text-slate-900">94.7%</div>
						<div class="trend-container">
							<TrendCell value={2.1} size="sm" />
							<span class="text-slate-600 text-sm">improvement</span>
						</div>
					</div>
					<div class="operation-card">
						<h3 class="text-sm font-semibold uppercase text-slate-500 tracking-wide">Safety Incidents</h3>
						<div class="metric-value font-mono text-slate-900">0</div>
						<p class="text-slate-600 text-sm">247 days incident-free</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Analytics Table Modal -->
	<YardAnalyticsTable 
		visible={showAnalyticsTable} 
		on:close={closeAnalyticsTable}
	/>
</div>

<style>
	.yard-dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e8f5e8 100%);
		padding: 20px;
	}

	.dashboard-header {
		border-radius: 16px;
		padding: 24px 32px;
		margin-bottom: 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-text h1 {
		margin: 0 0 4px 0;
	}

	.header-text p {
		margin: 0;
	}

	.section-nav {
		position: sticky;
		top: 20px;
		z-index: 10;
	}

	.nav-buttons {
		display: flex;
		background: #f8fafc;
		border-radius: 8px;
		padding: 4px;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		color: #64748b;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		flex: 1;
		justify-content: center;
	}

	.nav-btn:hover {
		color: #334155;
		background: rgba(255, 255, 255, 0.5);
	}

	.nav-btn.active {
		color: #1e293b;
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.content-section {
		background: white;
		border-radius: 16px;
		padding: 32px;
		margin-bottom: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.performance-summary {
		margin-bottom: 32px;
	}

	.perf-card {
		background: white;
		border-radius: 16px;
		padding: 24px;
		border: 1px solid #e2e8f0;
		transition: all 0.3s ease;
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.perf-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.perf-card:active {
		transform: translateY(-1px);
		transition: transform 0.1s ease;
	}

	.perf-card.excellent {
		border-left: 4px solid #059669;
		background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
	}

	.perf-card.excellent:hover {
		border-left-color: #10b981;
		box-shadow: 0 12px 35px rgba(5, 150, 105, 0.2);
	}

	.perf-card.good {
		border-left: 4px solid #3b82f6;
		background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
	}

	.perf-card.good:hover {
		border-left-color: #60a5fa;
		box-shadow: 0 12px 35px rgba(59, 130, 246, 0.2);
	}

	.perf-card.warning {
		border-left: 4px solid #f59e0b;
		background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
	}

	.perf-card.warning:hover {
		border-left-color: #fbbf24;
		box-shadow: 0 12px 35px rgba(245, 158, 11, 0.2);
	}

	.perf-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.perf-icon {
		color: #64748b;
	}

	.perf-status {
		font-size: 12px;
		color: #64748b;
		letter-spacing: 0.5px;
	}

	.perf-trend {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
	}

	.perf-value {
		font-size: 28px;
		font-weight: 700;
		margin: 12px 0;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.stat-value-with-trend {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.trend-container {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.operation-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		text-align: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.operation-card .metric-value {
		font-size: 32px;
		font-weight: 700;
		margin: 12px 0 8px 0;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.yard-dashboard {
			padding: 16px;
		}

		.dashboard-header {
			padding: 24px 20px;
			margin-bottom: 20px;
		}

		.header-content {
			flex-direction: column;
			text-align: center;
			gap: 16px;
		}

		.header-icon {
			font-size: 40px;
			width: 60px;
			height: 60px;
		}

		.nav-buttons {
			flex-direction: column;
			gap: 4px;
		}

		.nav-btn {
			justify-content: flex-start;
		}

		.content-section {
			padding: 24px 16px;
		}

		.performance-summary {
			gap: 16px;
		}

		.operation-card .metric-value {
			font-size: 28px;
		}
	}
</style> 