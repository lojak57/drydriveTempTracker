<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';
	import SafetyAnalyticsModal from '$lib/components/executive/SafetyAnalyticsModal.svelte';
	import ChartDebugControls from '$lib/components/debug/ChartDebugControls.svelte';
	import { BarChart3, DollarSign, Building2, Target, TrendingUp, Truck, Shield } from 'lucide-svelte';

	// Executive metrics
	let activeTab = 'overview';
	let showSafetyModal = false;
	
	// Chart debug controls
	let showDebugControls = false;
	let chartPadding = {
		paddingLeft: 15,
		paddingRight: 15,
		paddingTop: 15,
		paddingBottom: 50
	};

	const tabs = [
		{ id: 'overview', label: 'Executive Overview', icon: BarChart3 },
		{ id: 'financial', label: 'Financial Performance', icon: DollarSign },
		{ id: 'operations', label: 'Operations Summary', icon: Building2 },
		{ id: 'strategic', label: 'Strategic Metrics', icon: Target }
	];

	function handleSafetyClick() {
		showSafetyModal = true;
	}
	
	function handlePaddingUpdate(event: CustomEvent) {
		chartPadding = event.detail;
	}
	
	function handleDebugClose() {
		showDebugControls = false;
	}
	
	// Toggle debug controls with keyboard shortcut
	function handleKeydown(event: KeyboardEvent) {
		if (event.ctrlKey && event.shiftKey && event.code === 'KeyD') {
			event.preventDefault();
			showDebugControls = !showDebugControls;
		}
	}
</script>

<svelte:head>
	<title>Executive Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="executive-dashboard">
	<!-- Header -->
	<div class="dashboard-header bg-slate-800 text-white">
		<div class="header-content">
			<div class="header-text">
				<h1 class="header-title text-xl font-semibold">Executive Dashboard</h1>
				<p class="header-subtitle text-slate-300">Strategic insights for PAA leadership</p>
			</div>
			<div class="header-actions">
				<button class="action-button outline" type="button">
					<BarChart3 size={16} />
					<span>Export Report</span>
				</button>
				<button class="action-button outline" type="button">
					<TrendingUp size={16} />
					<span>Refresh Data</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Navigation Tabs -->
	<div class="nav-tabs">
		{#each tabs as tab}
			<button 
				class="nav-tab" 
				class:active={activeTab === tab.id}
				on:click={() => activeTab = tab.id}
			>
				<svelte:component this={tab.icon} size={16} />
				<span>{tab.label}</span>
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
						value="$101.3M" 
						unit="" 
						icon={DollarSign}
						status="normal"
						trend="up"
						trendValue="+6.4%"
						color="emerald"
					/>
					<MetricCard 
						title="EBITDA Margin" 
						value="9.2" 
						unit="%" 
						icon={TrendingUp}
						status="normal"
						trend="down"
						trendValue="-1.5%"
						color="blue"
					/>
					<MetricCard 
						title="Active Fleet" 
						value="745/865" 
						unit="trucks (86%)" 
						icon={Truck}
						status="normal"
						trend="up"
						trendValue="+50 trucks"
						color="orange"
					/>
					<MetricCard 
						title="Safety Score" 
						value="98.8" 
						unit="%" 
						icon={Shield}
						status="normal"
						trend="down"
						trendValue="-0.1%"
						color="emerald"
						clickable={true}
						onClick={handleSafetyClick}
					/>
				</div>

				<!-- Charts -->
				<div class="charts-section">
					<div class="chart-container">
						<RealtimeChart 
							title="Company Performance Overview (Adjusted EBITDA)"
							color="#10B981"
							height={450}
							unit="$M"
							animated={true}
							paddingLeft={chartPadding.paddingLeft}
							paddingRight={chartPadding.paddingRight}
							paddingTop={chartPadding.paddingTop}
							paddingBottom={chartPadding.paddingBottom}
						/>
					</div>
					<div class="chart-container">
						<RealtimeChart 
							title="Regional Revenue Distribution"
							color="#3B82F6"
							height={450}
							unit="%"
							animated={true}
							paddingLeft={chartPadding.paddingLeft}
							paddingRight={chartPadding.paddingRight}
							paddingTop={chartPadding.paddingTop}
							paddingBottom={chartPadding.paddingBottom}
						/>
					</div>
				</div>
			</div>

		{:else if activeTab === 'financial'}
			<div class="financial-section">
				<div class="financial-metrics">
					<MetricCard 
						title="Quarterly Revenue" 
						value="$303.9M" 
						unit="" 
						icon={DollarSign}
						status="normal"
						trend="up"
						trendValue="+6.4%"
						color="emerald"
					/>
					<MetricCard 
						title="Cost per Barrel Reduction Potential" 
						value="$7.50 → $7.00" 
						unit="" 
						icon={TrendingUp}
						status="normal"
						trend="up"
						trendValue="+0.8% EBITDA"
						color="blue"
					/>
					<MetricCard 
						title="Leverage Ratio" 
						value="3.3x" 
						unit="" 
						icon={Target}
						status="normal"
						trend="stable"
						trendValue="Within target"
						color="emerald"
					/>
				</div>

				<div class="financial-charts">
					<div class="chart-container">
						<RealtimeChart 
							title="Revenue Trends (12 Months)"
							color="#10B981"
							height={450}
							unit="$M"
							animated={true}
							paddingLeft={chartPadding.paddingLeft}
							paddingRight={chartPadding.paddingRight}
							paddingTop={chartPadding.paddingTop}
							paddingBottom={chartPadding.paddingBottom}
						/>
					</div>
					<div class="chart-container">
						<RealtimeChart 
							title="Cost Analysis & Margins"
							color="#3B82F6"
							height={450}
							unit="$"
							animated={true}
							paddingLeft={chartPadding.paddingLeft}
							paddingRight={chartPadding.paddingRight}
							paddingTop={chartPadding.paddingTop}
							paddingBottom={chartPadding.paddingBottom}
						/>
					</div>
				</div>
			</div>

		{:else if activeTab === 'operations'}
			<div class="operations-section">
				<div class="operations-metrics">
					<MetricCard 
						title="Fleet Utilization" 
						value="86" 
						unit="%" 
						icon={Truck}
						status="normal"
						trend="down"
						trendValue="-1%"
						color="orange"
					/>
					<MetricCard 
						title="Volume Transported" 
						value="14.3M" 
						unit="BBL monthly" 
						icon={BarChart3}
						status="normal"
						trend="up"
						trendValue="+6.7%"
						color="blue"
					/>
					<MetricCard 
						title="DryDrive Impact: Temperature Compliance" 
						value="98" 
						unit="%" 
						icon={Shield}
						status="normal"
						trend="up"
						trendValue="+0.5%"
						color="emerald"
					/>
				</div>
			</div>

		{:else if activeTab === 'strategic'}
			<div class="strategic-section">
				<div class="strategic-metrics">
					<MetricCard 
						title="Post-Acquisition Integration Efficiency" 
						value="85" 
						unit="%" 
						icon={Target}
						status="normal"
						trend="down"
						trendValue="-2%"
						color="orange"
					/>
					<MetricCard 
						title="ESG Progress: Emissions Reduction" 
						value="1.3" 
						unit="t CO2e/1,000 BBL" 
						icon={TrendingUp}
						status="normal"
						trend="up"
						trendValue="On track for 6%"
						color="emerald"
					/>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Safety Analytics Modal -->
{#if showSafetyModal}
	<SafetyAnalyticsModal 
		isOpen={showSafetyModal} 
		on:close={() => showSafetyModal = false} 
	/>
{/if}

<style>
	.executive-dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f0f9ff 100%);
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
		gap: 20px;
		flex-wrap: wrap;
	}

	.header-text h1 {
		margin: 0 0 4px 0;
	}

	.header-text p {
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}

	.action-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.action-button:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
		color: white;
	}

	.nav-tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		overflow-x: auto;
		padding: 4px;
	}

	.nav-tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: transparent;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		color: #64748b;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.nav-tab:hover {
		background: rgba(248, 250, 252, 0.8);
		border-color: #cbd5e1;
		color: #1e293b;
	}

	.nav-tab.active {
		background: #1e293b;
		color: white;
		border-color: #1e293b;
	}

	.tab-icon {
		font-size: 18px;
	}

	.tab-label {
		font-size: 14px;
	}

	.tab-content {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	/* Metrics Grids */
	.hero-metrics,
	.financial-metrics,
	.operations-metrics,
	.strategic-metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
		margin-bottom: 32px;
	}

	/* Ensure equal card sizing */
	.operations-metrics {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		margin-bottom: 32px;
	}

	/* Force consistent card heights across all metric containers */
	.hero-metrics > :global(*),
	.financial-metrics > :global(*),
	.operations-metrics > :global(*),
	.strategic-metrics > :global(*) {
		min-height: 140px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	/* Special styling for hero metrics to ensure proper alignment */
	.hero-metrics {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
		margin-bottom: 32px;
	}

	.hero-metrics > :global(*) {
		flex: 1;
		min-width: 280px;
		max-width: 300px;
		min-height: 140px;
	}

	/* Charts */
	.charts-section {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: flex-start;
	}

	.financial-charts {
		display: flex;
		flex-wrap: wrap;
		gap: 24px;
		align-items: flex-start;
	}

	.chart-container {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		flex: 1;
		min-width: 500px;
		vertical-align: top;
	}

	/* Mobile Responsiveness */
	@media (max-width: 1024px) {
		.operations-metrics {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		}
	}

	@media (max-width: 768px) {
		.executive-dashboard {
			padding: 16px;
		}

		.dashboard-header {
			padding: 16px;
			margin-bottom: 16px;
		}

		.header-content {
			flex-direction: column;
			align-items: stretch;
			gap: 16px;
		}

		.header-left {
			flex-direction: column;
			text-align: center;
			gap: 12px;
		}

		.header-actions {
			flex-direction: column;
			gap: 8px;
		}

		.action-button {
			justify-content: center;
			width: 100%;
		}

		.header-icon {
			width: 48px;
			height: 48px;
			font-size: 24px;
			align-self: center;
		}

		.header-text h1 {
			font-size: 20px;
		}

		.header-text p {
			font-size: 13px;
		}

		.nav-tab {
			padding: 10px 14px;
			gap: 6px;
			font-size: 13px;
		}

		.tab-content {
			padding: 16px;
		}

		.hero-metrics,
		.financial-metrics,
		.operations-metrics,
		.strategic-metrics {
			grid-template-columns: 1fr;
			gap: 16px;
			margin-bottom: 24px;
		}

		/* Override operations metrics for mobile */
		.operations-metrics {
			grid-template-columns: 1fr;
		}

		.charts-section,
		.financial-charts {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.chart-container {
			padding: 16px;
		}
	}

	@media (max-width: 640px) {
		.nav-tabs {
			gap: 8px;
		}

		.nav-tab {
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

	.action-button.outline:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.6);
		transform: translateY(-1px);
	}

	.action-button.active {
		background: #10b981;
		border-color: #10b981;
		color: white;
	}

	.action-button.active:hover {
		background: #059669;
		border-color: #059669;
	}
</style> 