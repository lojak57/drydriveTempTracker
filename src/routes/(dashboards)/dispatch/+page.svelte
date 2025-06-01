<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import DispatchHub from '$lib/components/dispatch/DispatchHub.svelte';
	import { Radio, Truck, BarChart3, Target } from 'lucide-svelte';

	let showAnalytics = false;
</script>

<svelte:head>
	<title>Dispatch Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="dispatch-dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<div class="header-icon">
				<Radio size={32} />
			</div>
			<div class="header-text">
				<h1 class="header-title">Dispatch Dashboard</h1>
				<p class="header-subtitle">Route planning, fleet status, and active hauls</p>
			</div>
		</div>
	</div>

	<!-- Overview Metrics -->
	<div class="metrics-grid">
		<MetricCard 
			title="Active Hauls" 
			value="23" 
			unit="in transit" 
			icon={Truck}
			status="normal"
			trend="up"
			trendValue="+5"
			color="blue"
		/>
		<MetricCard 
			title="Pending Dispatch" 
			value="12" 
			unit="queued" 
			icon={BarChart3}
			status="warning"
			trend="stable"
			trendValue="+2"
			color="orange"
		/>
		<MetricCard 
			title="Fleet Utilization" 
			value="87.3" 
			unit="%" 
			icon={Target}
			status="normal"
			trend="up"
			trendValue="+4.1%"
			color="emerald"
		/>
		<MetricCard 
			title="ETA Accuracy" 
			value="94.2" 
			unit="%" 
			icon={BarChart3}
			status="normal"
			trend="up"
			trendValue="+2.8%"
			color="blue"
		/>
	</div>

	<!-- Analytics Toggle -->
	<div class="analytics-access">
		<button 
			class="analytics-btn {showAnalytics ? 'analytics-active' : ''}"
			on:click={() => showAnalytics = !showAnalytics}
		>
			<span class="analytics-icon">🔥</span>
			<span class="analytics-label">
				{showAnalytics ? 'Close God View Analytics' : 'Open God View Analytics'}
			</span>
		</button>
	</div>

	<!-- Analytics View -->
	{#if showAnalytics}
		<div class="analytics-container">
			<div class="analytics-header">
				<h2>God View Analytics</h2>
				<p>Hierarchical fleet intelligence: Fleet → Yard → Truck → Haul Tickets</p>
			</div>
			
			<div class="analytics-content">
				<DispatchHub />
			</div>
		</div>
	{:else}
		<!-- Standard Dispatch View -->
		<div class="standard-dispatch">
			<div class="dispatch-section">
				<h2>Active Haul Management</h2>
				<p>Real-time monitoring and control of active hauls</p>
				
				<div class="haul-summary">
					<div class="summary-card">
						<h3>In Transit</h3>
						<div class="count">23</div>
						<p>Currently en route</p>
					</div>
					<div class="summary-card">
						<h3>Loading</h3>
						<div class="count">8</div>
						<p>At origin sites</p>
					</div>
					<div class="summary-card">
						<h3>Offloading</h3>
						<div class="count">12</div>
						<p>At destination</p>
					</div>
					<div class="summary-card">
						<h3>Available</h3>
						<div class="count">4</div>
						<p>Ready for dispatch</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.dispatch-dashboard {
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
		background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
		border-radius: 20px;
		color: white;
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
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

	.analytics-access {
		display: flex;
		justify-content: center;
		margin-bottom: 32px;
	}

	.analytics-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 32px;
		background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
	}

	.analytics-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
	}

	.analytics-btn.analytics-active {
		background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
		box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
	}

	.analytics-icon {
		font-size: 20px;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	.analytics-container {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.analytics-header {
		padding: 24px;
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
		color: white;
		text-align: center;
	}

	.analytics-header h2 {
		margin: 0 0 8px 0;
		font-size: 24px;
		font-weight: 700;
	}

	.analytics-header p {
		margin: 0;
		opacity: 0.9;
		font-size: 14px;
	}

	.analytics-content {
		padding: 24px;
	}

	.standard-dispatch {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		padding: 32px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.dispatch-section h2 {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
	}

	.dispatch-section p {
		font-size: 16px;
		color: #64748b;
		margin: 0 0 24px 0;
	}

	.haul-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 24px;
	}

	.summary-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		text-align: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}

	.summary-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}

	.summary-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: #64748b;
		margin: 0 0 12px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.summary-card .count {
		font-size: 36px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
		font-family: 'JetBrains Mono', monospace;
	}

	.summary-card p {
		font-size: 14px;
		color: #94a3b8;
		margin: 0;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.dispatch-dashboard {
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

		.analytics-btn {
			padding: 14px 24px;
			font-size: 14px;
		}

		.standard-dispatch {
			padding: 24px 16px;
		}

		.haul-summary {
			grid-template-columns: repeat(2, 1fr);
			gap: 16px;
		}

		.summary-card {
			padding: 20px;
		}

		.summary-card .count {
			font-size: 28px;
		}
	}

	@media (max-width: 480px) {
		.haul-summary {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.summary-card {
			padding: 16px;
		}
	}
</style> 