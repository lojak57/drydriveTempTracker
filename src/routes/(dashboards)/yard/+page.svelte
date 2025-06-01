<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import { Warehouse, Truck, BarChart3, Shield } from 'lucide-svelte';
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
					<h3>Daily Throughput</h3>
					<div class="metric-value">2,847 BBL</div>
					<p>+312 BBL vs yesterday</p>
				</div>
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