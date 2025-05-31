<script lang="ts">
	import TruckStatusDisplay from './TruckStatusDisplay.svelte';
	import OptimizationPanel from './OptimizationPanel.svelte';
	import { fleetStats, calibrationConfig } from '$lib/stores/calibrationData';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let selectedView: 'overview' | 'fleet' | 'optimization' = 'overview';
	let truckViewMode: 'table' | 'grid' = 'table';
	let filterStatus: 'all' | 'good' | 'warning' | 'critical' = 'all';

	// Status distribution for overview
	$: statusDistribution = {
		good: ($fleetStats.good / $fleetStats.total) * 100,
		warning: ($fleetStats.warning / $fleetStats.total) * 100,
		critical: ($fleetStats.critical / $fleetStats.total) * 100
	};

	function handleScheduleCalibration(event: CustomEvent) {
		const { truckIds } = event.detail;
		console.log('Scheduling calibration for trucks:', truckIds);
		// In a real app, this would trigger the calibration scheduling system
		dispatch('schedule-calibration', { truckIds });
	}

	function handleViewTruckDetails(event: CustomEvent) {
		const { truck } = event.detail;
		console.log('Viewing details for truck:', truck.id);
		dispatch('view-truck-details', { truck });
	}
</script>

<div class="recommender-container">
	<!-- Header Section -->
	<div class="recommender-header">
		<div class="header-content">
			<div class="title-section">
				<h1 class="main-title">Smart Calibration Recommender</h1>
				<p class="subtitle">AI-powered fleet monitoring • Data-driven calibration recommendations</p>
			</div>
			
			<div class="header-stats">
				<div class="stat-item">
					<span class="stat-value">{$fleetStats.total}</span>
					<span class="stat-label">Total Trucks</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{$fleetStats.calibrationsAvoided}</span>
					<span class="stat-label">Avoided This Month</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{statusDistribution.good.toFixed(0)}%</span>
					<span class="stat-label">Fleet Health</span>
				</div>
			</div>
		</div>

		<!-- Navigation Tabs -->
		<div class="nav-tabs">
			<button 
				class="nav-tab" 
				class:active={selectedView === 'overview'}
				on:click={() => selectedView = 'overview'}
			>
				📊 Overview
			</button>
			<button 
				class="nav-tab" 
				class:active={selectedView === 'fleet'}
				on:click={() => selectedView = 'fleet'}
			>
				🚛 Fleet Status
			</button>
			<button 
				class="nav-tab" 
				class:active={selectedView === 'optimization'}
				on:click={() => selectedView = 'optimization'}
			>
				🧠 Optimization
			</button>
		</div>
	</div>

	<!-- Main Content -->
	<div class="content-area">
		{#if selectedView === 'overview'}
			<div class="overview-layout">
				<!-- Fleet Health Overview -->
				<div class="health-overview">
					<h3 class="section-title">Fleet Consistency Overview</h3>
					
					<div class="health-grid">
						<div class="health-card good">
							<div class="health-icon">✅</div>
							<div class="health-content">
								<div class="health-count">{$fleetStats.good}</div>
								<div class="health-label">Good Status</div>
								<div class="health-percentage">{statusDistribution.good.toFixed(1)}%</div>
							</div>
							<div class="health-description">
								Within ±0.1% tolerance range
							</div>
						</div>
						
						<div class="health-card warning">
							<div class="health-icon">⚠️</div>
							<div class="health-content">
								<div class="health-count">{$fleetStats.warning}</div>
								<div class="health-label">Needs Calibration</div>
								<div class="health-percentage">{statusDistribution.warning.toFixed(1)}%</div>
							</div>
							<div class="health-description">
								±0.25% - ±0.5% range
							</div>
						</div>
						
						<div class="health-card critical">
							<div class="health-icon">🔴</div>
							<div class="health-content">
								<div class="health-count">{$fleetStats.critical}</div>
								<div class="health-label">Critical</div>
								<div class="health-percentage">{statusDistribution.critical.toFixed(1)}%</div>
							</div>
							<div class="health-description">
								Greater than ±0.5% outlier
							</div>
						</div>
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="quick-actions">
					<h3 class="section-title">Quick Actions</h3>
					
					<div class="actions-grid">
						<button class="action-card" on:click={() => selectedView = 'fleet'}>
							<div class="action-icon">📋</div>
							<div class="action-title">View Fleet Details</div>
							<div class="action-description">See individual truck status and metrics</div>
						</button>
						
						<button class="action-card" on:click={() => filterStatus = 'critical'}>
							<div class="action-icon">🚨</div>
							<div class="action-title">Critical Trucks</div>
							<div class="action-description">View {$fleetStats.critical} trucks needing immediate attention</div>
						</button>
						
						<button class="action-card" on:click={() => selectedView = 'optimization'}>
							<div class="action-icon">📈</div>
							<div class="action-title">View Savings</div>
							<div class="action-description">See optimization impact and recommendations</div>
						</button>
					</div>
				</div>

				<!-- Recent Activity -->
				<div class="recent-activity">
					<h3 class="section-title">System Intelligence</h3>
					
					<div class="activity-list">
						<div class="activity-item">
							<div class="activity-icon">🔍</div>
							<div class="activity-content">
								<div class="activity-title">Pattern Detection Active</div>
								<div class="activity-description">
									Continuously analyzing {$fleetStats.total} trucks across {Math.floor($fleetStats.total / 25)} terminals
								</div>
								<div class="activity-time">Real-time monitoring</div>
							</div>
						</div>
						
						<div class="activity-item">
							<div class="activity-icon">📊</div>
							<div class="activity-content">
								<div class="activity-title">Load Comparison Algorithm</div>
								<div class="activity-description">
									Triangulating load-to-offload deltas for accuracy verification
								</div>
								<div class="activity-time">Updated every load</div>
							</div>
						</div>
						
						<div class="activity-item">
							<div class="activity-icon">💡</div>
							<div class="activity-content">
								<div class="activity-title">Smart Recommendations</div>
								<div class="activity-description">
									{$fleetStats.calibrationsAvoided} unnecessary calibrations avoided this month
								</div>
								<div class="activity-time">40% cost reduction</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if selectedView === 'fleet'}
			<div class="fleet-layout">
				<TruckStatusDisplay 
					bind:viewMode={truckViewMode}
					bind:filterStatus={filterStatus}
					on:schedule-calibration={handleScheduleCalibration}
					on:view-details={handleViewTruckDetails}
				/>
			</div>
		{/if}

		{#if selectedView === 'optimization'}
			<div class="optimization-layout">
				<OptimizationPanel />
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="recommender-footer">
		<div class="footer-content">
			<div class="tech-info">
				<span class="tech-label">⚡ Powered by:</span>
				<span>Real-time load monitoring • Pattern recognition AI • Terminal data integration</span>
			</div>
			<div class="confidence-score">
				<span class="confidence-label">System Confidence:</span>
				<div class="confidence-bar">
					<div class="confidence-fill" style="width: 94%"></div>
				</div>
				<span class="confidence-value">94%</span>
			</div>
		</div>
	</div>
</div>

<style>
	.recommender-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	}

	.recommender-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		max-width: 1400px;
		margin-left: auto;
		margin-right: auto;
	}

	.title-section {
		flex: 1;
	}

	.main-title {
		font-size: 32px;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 8px 0;
		background: linear-gradient(135deg, #059669, #047857);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.header-stats {
		display: flex;
		gap: 24px;
	}

	.stat-item {
		text-align: center;
		padding: 12px 16px;
		background: rgba(248, 250, 252, 0.8);
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.stat-value {
		display: block;
		font-size: 24px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	.stat-label {
		display: block;
		font-size: 11px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 2px;
	}

	.nav-tabs {
		display: flex;
		gap: 4px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.nav-tab {
		padding: 12px 20px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background: rgba(255, 255, 255, 0.8);
		color: #64748b;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 8px 8px 0 0;
		font-size: 14px;
	}

	.nav-tab:hover {
		background: rgba(255, 255, 255, 0.9);
		border-color: rgba(0, 0, 0, 0.15);
	}

	.nav-tab.active {
		background: white;
		color: #059669;
		border-bottom-color: white;
		box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
	}

	.content-area {
		max-width: 1400px;
		margin: 0 auto;
		padding: 24px;
	}

	.overview-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto;
		gap: 24px;
	}

	.health-overview {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: #0f172a;
		margin: 0 0 16px 0;
	}

	.health-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.health-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;
	}

	.health-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.health-card.good {
		background: rgba(34, 197, 94, 0.05);
		border-color: rgba(34, 197, 94, 0.2);
	}

	.health-card.warning {
		background: rgba(245, 158, 11, 0.05);
		border-color: rgba(245, 158, 11, 0.2);
	}

	.health-card.critical {
		background: rgba(239, 68, 68, 0.05);
		border-color: rgba(239, 68, 68, 0.2);
	}

	.health-icon {
		font-size: 24px;
	}

	.health-content {
		flex: 1;
	}

	.health-count {
		font-size: 24px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	.health-label {
		font-size: 14px;
		font-weight: 500;
		color: #475569;
		margin-top: 2px;
	}

	.health-percentage {
		font-size: 12px;
		color: #64748b;
		font-weight: 600;
	}

	.health-description {
		font-size: 11px;
		color: #94a3b8;
		text-align: right;
		line-height: 1.3;
	}

	.quick-actions {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.actions-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 16px;
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.action-card:hover {
		background: rgba(255, 255, 255, 0.9);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.action-icon {
		font-size: 20px;
		min-width: 40px;
		text-align: center;
	}

	.action-title {
		font-size: 14px;
		font-weight: 600;
		color: #0f172a;
		margin-bottom: 4px;
	}

	.action-description {
		font-size: 12px;
		color: #64748b;
		line-height: 1.3;
	}

	.recent-activity {
		grid-column: 1 / -1;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.activity-item {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 16px;
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
	}

	.activity-icon {
		font-size: 20px;
		min-width: 40px;
		text-align: center;
		margin-top: 2px;
	}

	.activity-title {
		font-size: 14px;
		font-weight: 600;
		color: #0f172a;
		margin-bottom: 4px;
	}

	.activity-description {
		font-size: 13px;
		color: #64748b;
		line-height: 1.4;
		margin-bottom: 4px;
	}

	.activity-time {
		font-size: 11px;
		color: #94a3b8;
		font-weight: 500;
	}

	.fleet-layout,
	.optimization-layout {
		width: 100%;
	}

	.recommender-footer {
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(20px);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 16px 24px;
		margin-top: 24px;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1400px;
		margin: 0 auto;
	}

	.tech-info {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #e2e8f0;
		font-size: 13px;
	}

	.tech-label {
		font-weight: 600;
	}

	.confidence-score {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #e2e8f0;
		font-size: 13px;
	}

	.confidence-label {
		font-weight: 500;
	}

	.confidence-bar {
		width: 100px;
		height: 6px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		overflow: hidden;
	}

	.confidence-fill {
		height: 100%;
		background: linear-gradient(90deg, #22c55e, #16a34a);
		transition: width 0.3s ease;
	}

	.confidence-value {
		font-weight: 600;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Mobile responsive */
	@media (max-width: 1024px) {
		.overview-layout {
			grid-template-columns: 1fr;
			grid-template-rows: auto;
		}

		.recent-activity {
			grid-column: 1;
		}
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: 16px;
			align-items: flex-start;
		}

		.header-stats {
			align-self: stretch;
			justify-content: space-between;
		}

		.nav-tabs {
			flex-direction: column;
		}

		.footer-content {
			flex-direction: column;
			gap: 12px;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.main-title {
			font-size: 24px;
		}

		.header-stats {
			flex-direction: column;
			gap: 8px;
		}

		.activity-item {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style> 