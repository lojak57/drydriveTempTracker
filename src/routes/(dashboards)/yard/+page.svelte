<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import YardAnalyticsTable from '$lib/components/yard/YardAnalyticsTable.svelte';
	import { Warehouse, Truck, BarChart3, Shield, TrendingUp, AlertTriangle } from 'lucide-svelte';

	// Analytics table state
	let showAnalyticsTable = false;

	function openAnalyticsTable() {
		showAnalyticsTable = true;
	}

	function closeAnalyticsTable() {
		showAnalyticsTable = false;
	}
</script>

<svelte:head>
	<title>Yard Manager Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="yard-dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<div class="header-icon">
				<Warehouse size={32} />
			</div>
			<div class="header-text">
				<h1 class="header-title">Yard Manager Dashboard</h1>
				<p class="header-subtitle">Fleet overview, driver management, and yard operations</p>
			</div>
		</div>
	</div>

	<!-- Overview Metrics -->
	<div class="overview-metrics">
		<MetricCard 
			title="Total Fleet" 
			value="89" 
			unit="trucks" 
			icon={Truck}
			status="normal"
			trend="stable"
			trendValue="0 this week"
			color="blue"
		/>
		<MetricCard 
			title="Active Today" 
			value="67" 
			unit="trucks" 
			icon={Truck}
			status="normal"
			trend="up"
			trendValue="+8 vs yesterday"
			color="emerald"
		/>
		<MetricCard 
			title="Maintenance Mode" 
			value="8" 
			unit="trucks" 
			icon={BarChart3}
			status="warning"
			trend="stable"
			trendValue="scheduled"
			color="orange"
		/>
		<MetricCard 
			title="Utilization Rate" 
			value="75.3" 
			unit="%" 
			icon={BarChart3}
			status="normal"
			trend="up"
			trendValue="+3.2%"
			color="blue"
		/>
	</div>

	<!-- Main Content -->
	<div class="main-content">
		<!-- Enhanced Performance Analytics Section -->
		<div class="content-section performance-analytics-section">
			<div class="section-header">
				<h2>Performance Analytics</h2>
				<p>Defend your numbers with complete operational context</p>
			</div>
			
			<!-- Summary Performance Cards -->
			<div class="performance-summary">
				<div class="perf-card excellent" on:click={openAnalyticsTable}>
					<div class="perf-header">
						<div class="perf-icon">
							<TrendingUp size={24} />
						</div>
						<div class="perf-status">EXCELLENT</div>
					</div>
					<h3>Daily Throughput</h3>
					<div class="perf-value">2,847 BBL</div>
					<p>+312 BBL vs yesterday</p>
					<div class="click-hint">Click to analyze trends</div>
				</div>

				<div class="perf-card good" on:click={openAnalyticsTable}>
					<div class="perf-header">
						<div class="perf-icon">
							<BarChart3 size={24} />
						</div>
						<div class="perf-status">GOOD</div>
					</div>
					<h3>Barrels per Drive Hour</h3>
					<div class="perf-value">185.3</div>
					<p>Above target efficiency</p>
					<div class="click-hint">Click for details</div>
				</div>

				<div class="perf-card warning" on:click={openAnalyticsTable}>
					<div class="perf-header">
						<div class="perf-icon">
							<AlertTriangle size={24} />
						</div>
						<div class="perf-status">REVIEW</div>
					</div>
					<h3>Load Efficiency Index</h3>
					<div class="perf-value">4.2</div>
					<p>3 trucks in maintenance</p>
					<div class="click-hint">View full story</div>
				</div>
			</div>

			<!-- Quick Stats -->
			<div class="quick-stats">
				<div class="stat-item">
					<span class="stat-label">Active Trucks</span>
					<span class="stat-value">75.3%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Drivers En Route</span>
					<span class="stat-value">68.2%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">7-Day Average</span>
					<span class="stat-value">2,701 BBL</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Efficiency Rating</span>
					<span class="stat-value">92.3%</span>
				</div>
			</div>
		</div>

		<!-- Fleet Status -->
		<div class="content-section">
			<h2>Fleet Status Overview</h2>
			<div class="fleet-status-grid">
				<div class="status-category active">
					<h3>Active (18)</h3>
					<div class="status-list">
						<div class="truck-item">T-001 - On Route</div>
						<div class="truck-item">T-003 - Loading</div>
						<div class="truck-item">T-005 - In Transit</div>
						<div class="truck-item">T-007 - Offloading</div>
						<div class="truck-item">T-009 - Available</div>
						<div class="truck-item">+13 more...</div>
					</div>
				</div>

				<div class="status-category maintenance">
					<h3>Maintenance (3)</h3>
					<div class="status-list">
						<div class="truck-item">T-012 - Service</div>
						<div class="truck-item">T-018 - Inspection</div>
						<div class="truck-item">T-024 - Repair</div>
					</div>
				</div>

				<div class="status-category available">
					<h3>Available (3)</h3>
					<div class="status-list">
						<div class="truck-item">T-002 - Ready</div>
						<div class="truck-item">T-016 - Standby</div>
						<div class="truck-item">T-021 - Parked</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Driver Overview -->
		<div class="content-section">
			<h2>Driver Management</h2>
			<div class="driver-overview">
				<div class="driver-metrics">
					<MetricCard 
						title="Active Drivers" 
						value="156" 
						unit="certified" 
						icon={Truck}
						status="normal"
						trend="up"
						trendValue="+4 this month"
						color="emerald"
					/>
					<MetricCard 
						title="Safety Compliance" 
						value="97.8" 
						unit="%" 
						icon={Shield}
						status="normal"
						trend="up"
						trendValue="+1.2%"
						color="emerald"
					/>
				</div>
			</div>
		</div>

		<!-- Operations Summary -->
		<div class="content-section">
			<h2>Yard Operations</h2>
			<div class="operations-grid">
				<div class="operation-card">
					<h3>Loading Efficiency</h3>
					<div class="metric-value">94.7%</div>
					<p>+2.1% improvement</p>
				</div>
				<div class="operation-card">
					<h3>Safety Incidents</h3>
					<div class="metric-value">0</div>
					<p>247 days incident-free</p>
				</div>
			</div>
		</div>
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
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		padding: 32px;
		margin-bottom: 24px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.header-icon {
		font-size: 48px;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
		border-radius: 20px;
		color: white;
		box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
	}

	.header-text h1 {
		font-size: 32px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.header-text p {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.overview-metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-bottom: 32px;
	}

	.main-content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}

	.content-section {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		padding: 32px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.content-section h2 {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 24px 0;
	}

	/* Enhanced Performance Analytics Section */
	.performance-analytics-section {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
		border: 2px solid rgba(5, 150, 105, 0.1);
		position: relative;
		overflow: hidden;
	}

	.performance-analytics-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%);
	}

	.section-header {
		margin-bottom: 32px;
	}

	.section-header h2 {
		margin-bottom: 8px;
	}

	.section-header p {
		color: #64748b;
		font-size: 16px;
		margin: 0;
		font-style: italic;
	}

	.performance-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-bottom: 32px;
	}

	.perf-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.perf-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
	}

	.perf-card.excellent::before {
		background: linear-gradient(90deg, #059669 0%, #10b981 100%);
	}

	.perf-card.good::before {
		background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
	}

	.perf-card.warning::before {
		background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
	}

	.perf-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
		border-color: rgba(5, 150, 105, 0.3);
	}

	.perf-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.perf-icon {
		padding: 8px;
		border-radius: 8px;
		color: white;
	}

	.perf-card.excellent .perf-icon {
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
	}

	.perf-card.good .perf-icon {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
	}

	.perf-card.warning .perf-icon {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	}

	.perf-status {
		font-size: 12px;
		font-weight: 700;
		padding: 4px 8px;
		border-radius: 6px;
		letter-spacing: 0.5px;
	}

	.perf-card.excellent .perf-status {
		background: rgba(5, 150, 105, 0.1);
		color: #059669;
	}

	.perf-card.good .perf-status {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
	}

	.perf-card.warning .perf-status {
		background: rgba(245, 158, 11, 0.1);
		color: #f59e0b;
	}

	.perf-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: #64748b;
		margin: 0 0 12px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.perf-value {
		font-size: 32px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
		font-family: 'JetBrains Mono', monospace;
	}

	.perf-card p {
		font-size: 14px;
		color: #059669;
		margin: 0 0 16px 0;
		font-weight: 500;
	}

	.click-hint {
		font-size: 12px;
		color: #64748b;
		font-style: italic;
		text-align: center;
		padding: 8px;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 6px;
		margin-top: 8px;
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
		padding: 24px;
		background: rgba(248, 250, 252, 0.5);
		border-radius: 12px;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.stat-label {
		font-size: 13px;
		color: #64748b;
		font-weight: 500;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-value {
		font-size: 20px;
		font-weight: 700;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Existing styles */
	.fleet-status-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 24px;
	}

	.status-category {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.status-category h3 {
		font-size: 18px;
		font-weight: 700;
		margin: 0 0 16px 0;
		padding-bottom: 12px;
		border-bottom: 2px solid;
	}

	.status-category.active h3 {
		color: #059669;
		border-color: #059669;
	}

	.status-category.maintenance h3 {
		color: #d97706;
		border-color: #d97706;
	}

	.status-category.available h3 {
		color: #64748b;
		border-color: #64748b;
	}

	.status-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.truck-item {
		padding: 8px 12px;
		background: #f8fafc;
		border-radius: 8px;
		font-size: 14px;
		color: #475569;
		border-left: 3px solid #e2e8f0;
	}

	.status-category.active .truck-item {
		border-left-color: #059669;
		background: #ecfdf5;
	}

	.status-category.maintenance .truck-item {
		border-left-color: #d97706;
		background: #fffbeb;
	}

	.status-category.available .truck-item {
		border-left-color: #64748b;
		background: #f1f5f9;
	}

	.driver-metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 24px;
	}

	.operations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 24px;
	}

	.operation-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		text-align: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.operation-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: #64748b;
		margin: 0 0 12px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.operation-card .metric-value {
		font-size: 32px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
		font-family: 'JetBrains Mono', monospace;
	}

	.operation-card p {
		font-size: 14px;
		color: #059669;
		margin: 0;
		font-weight: 500;
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

		.header-text h1 {
			font-size: 28px;
		}

		.header-text p {
			font-size: 14px;
		}

		.overview-metrics {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.content-section {
			padding: 24px 16px;
		}

		.performance-summary {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.quick-stats {
			grid-template-columns: repeat(2, 1fr);
			gap: 16px;
		}

		.fleet-status-grid {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.driver-metrics,
		.operations-grid {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.operation-card .metric-value {
			font-size: 28px;
		}
	}
</style> 