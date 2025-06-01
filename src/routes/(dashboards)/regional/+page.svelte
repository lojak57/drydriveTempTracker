<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';

	// Regional management state
	let activeView = 'overview';
	let selectedYard = null;

	const regionalViews = [
		{ id: 'overview', label: 'Regional Overview', icon: '🌍' },
		{ id: 'yards', label: 'Yard Management', icon: '🏭' },
		{ id: 'analytics', label: 'Performance Analytics', icon: '📊' },
		{ id: 'strategic', label: 'Strategic Planning', icon: '🎯' }
	];

	const yards = [
		{ id: 'yard-1', name: 'North Texas Hub', active: 24, total: 28, efficiency: 94.2, status: 'optimal' },
		{ id: 'yard-2', name: 'Oklahoma Central', active: 18, total: 22, efficiency: 91.8, status: 'good' },
		{ id: 'yard-3', name: 'Louisiana East', active: 31, total: 35, efficiency: 96.1, status: 'optimal' },
		{ id: 'yard-4', name: 'Kansas West', active: 15, total: 19, efficiency: 87.3, status: 'attention' }
	];
</script>

<svelte:head>
	<title>Regional Manager Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="regional-dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<div class="header-icon">🧭</div>
			<div class="header-text">
				<h1>Regional Manager Dashboard</h1>
				<p>Multi-yard oversight and regional performance analytics</p>
			</div>
		</div>
	</div>

	<!-- Navigation Tabs -->
	<div class="tab-navigation">
		{#each regionalViews as view}
			<button 
				class="tab-btn {activeView === view.id ? 'active' : ''}"
				on:click={() => activeView = view.id}
			>
				<span class="tab-icon">{view.icon}</span>
				<span class="tab-label">{view.label}</span>
			</button>
		{/each}
	</div>

	<!-- Tab Content -->
	<div class="tab-content">
		{#if activeView === 'overview'}
			<div class="overview-section">
				<!-- Regional Metrics -->
				<div class="regional-metrics">
					<MetricCard 
						title="Total Regional Fleet" 
						value="104" 
						unit="trucks" 
						icon="🚛" 
						status="normal"
						trend="up"
						trendValue="+8"
						color="blue"
					/>
					<MetricCard 
						title="Regional Revenue" 
						value="$1.8M" 
						unit="monthly" 
						icon="💰" 
						status="normal"
						trend="up"
						trendValue="+12.4%"
						color="emerald"
					/>
					<MetricCard 
						title="Avg Yard Efficiency" 
						value="92.4" 
						unit="%" 
						icon="⚡" 
						status="normal"
						trend="up"
						trendValue="+2.1%"
						color="orange"
					/>
					<MetricCard 
						title="Regional Safety Score" 
						value="95.7" 
						unit="%" 
						icon="🛡️" 
						status="normal"
						trend="stable"
						trendValue="+0.3%"
						color="emerald"
					/>
				</div>

				<!-- Charts -->
				<div class="charts-section">
					<div class="chart-container">
						<RealtimeChart 
							title="Regional Performance Trends"
							color="#10B981"
							height={350}
							unit="%"
							animated={true}
						/>
					</div>
					<div class="chart-container">
						<RealtimeChart 
							title="Cross-Yard Fleet Utilization"
							color="#3B82F6"
							height={350}
							unit="trucks"
							animated={true}
						/>
					</div>
				</div>
			</div>

		{:else if activeView === 'yards'}
			<div class="yards-section">
				<div class="yards-header">
					<h2>Yard Management Overview</h2>
					<p>Monitor and manage all yards in your region</p>
				</div>

				<div class="yards-grid">
					{#each yards as yard}
						<div class="yard-card {yard.status}" on:click={() => selectedYard = yard}>
							<div class="yard-header">
								<h3>{yard.name}</h3>
								<div class="yard-status {yard.status}">
									{#if yard.status === 'optimal'}🟢
									{:else if yard.status === 'good'}🟡
									{:else}🔴{/if}
								</div>
							</div>
							
							<div class="yard-metrics">
								<div class="metric">
									<span class="metric-label">Active</span>
									<span class="metric-value">{yard.active}/{yard.total}</span>
								</div>
								<div class="metric">
									<span class="metric-label">Efficiency</span>
									<span class="metric-value">{yard.efficiency}%</span>
								</div>
							</div>

							<div class="yard-progress">
								<div class="progress-bar">
									<div class="progress-fill" style="width: {(yard.active / yard.total) * 100}%"></div>
								</div>
								<span class="progress-text">{Math.round((yard.active / yard.total) * 100)}% Utilization</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

		{:else if activeView === 'analytics'}
			<div class="analytics-section">
				<div class="analytics-header">
					<h2>Performance Analytics</h2>
					<p>Deep dive into regional operational metrics</p>
				</div>

				<div class="analytics-metrics">
					<MetricCard 
						title="Cross-Yard Efficiency" 
						value="92.4" 
						unit="%" 
						icon="⚡" 
						status="normal"
						trend="up"
						trendValue="+3.2%"
						color="blue"
					/>
					<MetricCard 
						title="Resource Optimization" 
						value="87.8" 
						unit="%" 
						icon="🔧" 
						status="normal"
						trend="up"
						trendValue="+1.5%"
						color="emerald"
					/>
					<MetricCard 
						title="Regional Market Share" 
						value="42.1" 
						unit="%" 
						icon="📈" 
						status="normal"
						trend="up"
						trendValue="+2.8%"
						color="orange"
					/>
				</div>

				<div class="analytics-charts">
					<div class="chart-container">
						<RealtimeChart 
							title="Yard Performance Comparison"
							color="#F59E0B"
							height={400}
							unit="%"
							animated={true}
						/>
					</div>
				</div>
			</div>

		{:else if activeView === 'strategic'}
			<div class="strategic-section">
				<div class="strategic-header">
					<h2>Strategic Planning</h2>
					<p>Long-term regional growth and optimization planning</p>
				</div>

				<div class="strategic-metrics">
					<MetricCard 
						title="Growth Trajectory" 
						value="34.7" 
						unit="%" 
						icon="📈" 
						status="normal"
						trend="up"
						trendValue="+8.2%"
						color="emerald"
					/>
					<MetricCard 
						title="Market Expansion" 
						value="3" 
						unit="new areas" 
						icon="🌟" 
						status="normal"
						trend="up"
						trendValue="+1"
						color="blue"
					/>
					<MetricCard 
						title="Investment ROI" 
						value="167" 
						unit="%" 
						icon="💎" 
						status="normal"
						trend="up"
						trendValue="+23%"
						color="orange"
					/>
				</div>

				<div class="strategic-planning">
					<div class="planning-card">
						<h3>Q2 Expansion Plan</h3>
						<p>New Mexico territory acquisition</p>
						<div class="planning-status">In Progress</div>
					</div>
					<div class="planning-card">
						<h3>Fleet Modernization</h3>
						<p>Smart sensor integration across all yards</p>
						<div class="planning-status">Planning</div>
					</div>
					<div class="planning-card">
						<h3>Efficiency Initiative</h3>
						<p>Cross-yard resource optimization program</p>
						<div class="planning-status">Active</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.regional-dashboard {
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
		background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
		border-radius: 20px;
		color: white;
		box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
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

	.tab-navigation {
		display: flex;
		gap: 12px;
		margin-bottom: 32px;
		overflow-x: auto;
		padding: 4px;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 16px 24px;
		background: rgba(255, 255, 255, 0.8);
		border: 2px solid transparent;
		border-radius: 12px;
		color: #64748b;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		white-space: nowrap;
	}

	.tab-btn:hover {
		background: rgba(255, 255, 255, 0.95);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
		color: #1e293b;
	}

	.tab-btn.active {
		background: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
		color: white;
		border-color: #8B5CF6;
		box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
	}

	.tab-icon {
		font-size: 18px;
	}

	.tab-label {
		font-size: 14px;
	}

	.tab-content {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		padding: 32px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	/* Metrics Grids */
	.regional-metrics,
	.analytics-metrics,
	.strategic-metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-bottom: 40px;
	}

	/* Charts */
	.charts-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 32px;
	}

	.analytics-charts {
		display: grid;
		grid-template-columns: 1fr;
		gap: 32px;
	}

	.chart-container {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	/* Yards Management */
	.yards-header,
	.analytics-header,
	.strategic-header {
		margin-bottom: 32px;
	}

	.yards-header h2,
	.analytics-header h2,
	.strategic-header h2 {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
	}

	.yards-header p,
	.analytics-header p,
	.strategic-header p {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.yards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
	}

	.yard-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.yard-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}

	.yard-card.optimal {
		border-left: 4px solid #10B981;
	}

	.yard-card.good {
		border-left: 4px solid #F59E0B;
	}

	.yard-card.attention {
		border-left: 4px solid #EF4444;
	}

	.yard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.yard-header h3 {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
	}

	.yard-status {
		font-size: 16px;
	}

	.yard-metrics {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.metric {
		text-align: center;
	}

	.metric-label {
		display: block;
		font-size: 12px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 4px;
	}

	.metric-value {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
	}

	.yard-progress {
		margin-top: 16px;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: #f1f5f9;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
		transition: width 0.3s ease;
	}

	.progress-text {
		font-size: 12px;
		color: #64748b;
		font-weight: 500;
	}

	/* Strategic Planning */
	.strategic-planning {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}

	.planning-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.planning-card h3 {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
	}

	.planning-card p {
		font-size: 14px;
		color: #64748b;
		margin: 0 0 16px 0;
	}

	.planning-status {
		display: inline-block;
		padding: 6px 12px;
		background: #dbeafe;
		color: #2563eb;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.regional-dashboard {
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

		.tab-btn {
			padding: 12px 16px;
			gap: 8px;
		}

		.tab-icon {
			font-size: 16px;
		}

		.tab-label {
			font-size: 13px;
		}

		.tab-content {
			padding: 24px 16px;
		}

		.regional-metrics,
		.analytics-metrics,
		.strategic-metrics {
			grid-template-columns: 1fr;
			gap: 16px;
			margin-bottom: 32px;
		}

		.charts-section,
		.analytics-charts {
			grid-template-columns: 1fr;
			gap: 24px;
		}

		.yards-grid,
		.strategic-planning {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.chart-container {
			padding: 16px;
		}
	}

	@media (max-width: 640px) {
		.tab-navigation {
			gap: 8px;
		}

		.tab-btn {
			padding: 10px 12px;
			gap: 6px;
		}

		.tab-label {
			display: none;
		}

		.tab-icon {
			font-size: 18px;
		}

		.yard-metrics {
			flex-direction: column;
			gap: 12px;
		}
	}
</style> 