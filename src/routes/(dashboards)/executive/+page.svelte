<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';

	// Executive metrics
	let activeTab = 'overview';

	const executiveTabs = [
		{ id: 'overview', label: 'Executive Overview', icon: '📊' },
		{ id: 'financial', label: 'Financial Performance', icon: '💰' },
		{ id: 'operations', label: 'Operations Summary', icon: '🏭' },
		{ id: 'strategic', label: 'Strategic Metrics', icon: '🎯' }
	];
</script>

<svelte:head>
	<title>Executive Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="executive-dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<div class="header-icon">📈</div>
			<div class="header-text">
				<h1>Executive Dashboard</h1>
				<p>Strategic overview, KPIs, and financial performance</p>
			</div>
		</div>
	</div>

	<!-- Navigation Tabs -->
	<div class="tab-navigation">
		{#each executiveTabs as tab}
			<button 
				class="tab-btn {activeTab === tab.id ? 'active' : ''}"
				on:click={() => activeTab = tab.id}
			>
				<span class="tab-icon">{tab.icon}</span>
				<span class="tab-label">{tab.label}</span>
			</button>
		{/each}
	</div>

	<!-- Tab Content -->
	<div class="tab-content">
		{#if activeTab === 'overview'}
			<div class="overview-section">
				<!-- Hero Metrics -->
				<div class="hero-metrics">
					<MetricCard 
						title="Monthly Revenue" 
						value="$4.2M" 
						unit="" 
						icon="💰" 
						status="normal"
						trend="up"
						trendValue="+15.3%"
						color="emerald"
					/>
					<MetricCard 
						title="Operating Margin" 
						value="23.8" 
						unit="%" 
						icon="📈" 
						status="normal"
						trend="up"
						trendValue="+2.1%"
						color="blue"
					/>
					<MetricCard 
						title="Active Fleet" 
						value="247" 
						unit="trucks" 
						icon="🚛" 
						status="normal"
						trend="up"
						trendValue="+12"
						color="orange"
					/>
					<MetricCard 
						title="Safety Score" 
						value="96.8" 
						unit="%" 
						icon="🛡️" 
						status="normal"
						trend="up"
						trendValue="+1.2%"
						color="emerald"
					/>
				</div>

				<!-- Charts -->
				<div class="charts-section">
					<div class="chart-container">
						<RealtimeChart 
							title="Company Performance Overview"
							color="#10B981"
							height={400}
							unit="$M"
							animated={true}
						/>
					</div>
					<div class="chart-container">
						<RealtimeChart 
							title="Regional Revenue Distribution"
							color="#3B82F6"
							height={400}
							unit="%"
							animated={true}
						/>
					</div>
				</div>
			</div>

		{:else if activeTab === 'financial'}
			<div class="financial-section">
				<div class="financial-metrics">
					<MetricCard 
						title="Monthly Revenue" 
						value="$4.2M" 
						unit="" 
						icon="💰" 
						status="normal"
						trend="up"
						trendValue="+15.3%"
						color="emerald"
					/>
					<MetricCard 
						title="Operating Margin" 
						value="23.8" 
						unit="%" 
						icon="📈" 
						status="normal"
						trend="up"
						trendValue="+2.1%"
						color="blue"
					/>
					<MetricCard 
						title="EBITDA" 
						value="$1.8M" 
						unit="" 
						icon="💎" 
						status="normal"
						trend="up"
						trendValue="+18.7%"
						color="orange"
					/>
				</div>

				<div class="financial-charts">
					<div class="chart-container">
						<RealtimeChart 
							title="Revenue Trends (12 Months)"
							color="#10B981"
							height={400}
							unit="$M"
							animated={true}
						/>
					</div>
					<div class="chart-container">
						<RealtimeChart 
							title="Cost Analysis & Margins"
							color="#3B82F6"
							height={400}
							unit="%"
							animated={true}
						/>
					</div>
				</div>
			</div>

		{:else if activeTab === 'operations'}
			<div class="operations-section">
				<div class="operations-metrics">
					<MetricCard 
						title="Total Fleet" 
						value="247" 
						unit="trucks" 
						icon="🚛" 
						status="normal"
						trend="up"
						trendValue="+12"
						color="blue"
					/>
					<MetricCard 
						title="Active Drivers" 
						value="189" 
						unit="" 
						icon="👨‍💼" 
						status="normal"
						trend="stable"
						trendValue="+3"
						color="emerald"
					/>
					<MetricCard 
						title="Daily Hauls" 
						value="156" 
						unit="" 
						icon="📦" 
						status="normal"
						trend="up"
						trendValue="+8"
						color="orange"
					/>
					<MetricCard 
						title="System Uptime" 
						value="99.2" 
						unit="%" 
						icon="⚡" 
						status="normal"
						trend="stable"
						trendValue="+0.1%"
						color="emerald"
					/>
				</div>
			</div>

		{:else if activeTab === 'strategic'}
			<div class="strategic-section">
				<div class="strategic-metrics">
					<MetricCard 
						title="Market Share" 
						value="34.2" 
						unit="%" 
						icon="🎯" 
						status="normal"
						trend="up"
						trendValue="+2.8%"
						color="blue"
					/>
					<MetricCard 
						title="Customer Retention" 
						value="94.7" 
						unit="%" 
						icon="🤝" 
						status="normal"
						trend="up"
						trendValue="+1.2%"
						color="emerald"
					/>
					<MetricCard 
						title="Growth Rate" 
						value="28.5" 
						unit="%" 
						icon="📈" 
						status="normal"
						trend="up"
						trendValue="+5.3%"
						color="orange"
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.executive-dashboard {
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
		background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
		border-radius: 20px;
		color: white;
		box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
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
		background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
		color: white;
		border-color: #10B981;
		box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
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
	.hero-metrics,
	.financial-metrics,
	.operations-metrics,
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

	.financial-charts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 32px;
	}

	.chart-container {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.executive-dashboard {
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

		.hero-metrics,
		.financial-metrics,
		.operations-metrics,
		.strategic-metrics {
			grid-template-columns: 1fr;
			gap: 16px;
			margin-bottom: 32px;
		}

		.charts-section,
		.financial-charts {
			grid-template-columns: 1fr;
			gap: 24px;
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
	}
</style> 