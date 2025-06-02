<script lang="ts">
	import TruckStatusDisplay from './TruckStatusDisplay.svelte';
	import OptimizationPanel from './OptimizationPanel.svelte';
	import { fleetStats, calibrationConfig } from '$lib/stores/calibrationData';
	import { createEventDispatcher } from 'svelte';
	import { Info } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	let selectedView: 'overview' | 'fleet' | 'optimization' = 'overview';
	let truckViewMode: 'table' | 'grid' = 'table';
	let filterStatus: 'all' | 'good' | 'warning' | 'critical' = 'all';
	let activeTab: 'overview' | 'calibrations' | 'alerts' = 'overview';

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
				<h1 class="main-title">Coriolis Calibration Status</h1>
				<p class="subtitle">AI-powered fleet monitoring • Data-driven calibration recommendations</p>
			</div>
			
			<div class="header-stats">
				<div class="stat-item">
					<span class="stat-value">{$fleetStats.total}</span>
					<span class="stat-label">Total Trucks</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{$fleetStats.calibrationsAvoided}</span>
					<span class="stat-label">Calibrations Skipped This Month</span>
					<div class="tooltip-container">
						<Info size={14} class="info-icon" />
						<div class="tooltip">Scheduled calibrations that were bypassed or postponed</div>
					</div>
				</div>
				<div class="stat-item">
					<span class="stat-value">{statusDistribution.good.toFixed(0)}%</span>
					<span class="stat-label">
						Fleet Health
						<div class="tooltip-container">
							<Info size={14} class="info-icon" />
							<div class="tooltip">Fleet Health is calculated using calibration consistency, calibration recency, and load deviation thresholds.</div>
						</div>
					</span>
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
				<!-- Fleet Health Overview - Resized and centered -->
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

				<!-- Tabbed Content Section -->
				<div class="tabbed-section">
					<div class="tabs-header">
						<button 
							class="tab-btn" 
							class:active={activeTab === 'overview'}
							on:click={() => activeTab = 'overview'}
						>
							Overview
						</button>
						<button 
							class="tab-btn" 
							class:active={activeTab === 'calibrations'}
							on:click={() => activeTab = 'calibrations'}
						>
							Calibration History
						</button>
						<button 
							class="tab-btn" 
							class:active={activeTab === 'alerts'}
							on:click={() => activeTab = 'alerts'}
						>
							Calibration Alerts
						</button>
					</div>

					<div class="tab-content">
						{#if activeTab === 'overview'}
							<div class="tab-panel">
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
						{:else if activeTab === 'calibrations'}
							<div class="tab-panel">
								<div class="history-content">
									<h4>Recent Calibration Activity</h4>
									<div class="activity-list">
										<div class="activity-item">
											<div class="activity-icon">✅</div>
											<div class="activity-content">
												<div class="activity-title">PLN-027 Calibrated</div>
												<div class="activity-time">2 days ago</div>
											</div>
										</div>
										<div class="activity-item">
											<div class="activity-icon">✅</div>
											<div class="activity-content">
												<div class="activity-title">PLN-156 Calibrated</div>
												<div class="activity-time">5 days ago</div>
											</div>
										</div>
										<div class="activity-item">
											<div class="activity-icon">⏸️</div>
											<div class="activity-content">
												<div class="activity-title">PLN-089 Calibration Skipped</div>
												<div class="activity-time">1 week ago</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						{:else if activeTab === 'alerts'}
							<div class="tab-panel">
								<div class="alerts-content">
									<h4>Active Calibration Alerts</h4>
									<div class="alert-list">
										{#if $fleetStats.critical > 0}
											<div class="alert-item critical">
												<div class="alert-icon">🔴</div>
												<div class="alert-content">
													<div class="alert-title">{$fleetStats.critical} Critical Trucks</div>
													<div class="alert-description">Immediate calibration required</div>
												</div>
											</div>
										{/if}
										{#if $fleetStats.warning > 0}
											<div class="alert-item warning">
												<div class="alert-icon">⚠️</div>
												<div class="alert-content">
													<div class="alert-title">{$fleetStats.warning} Trucks Need Attention</div>
													<div class="alert-description">Schedule calibration within 7 days</div>
												</div>
											</div>
										{/if}
									</div>
								</div>
							</div>
						{/if}
					</div>
				</div>

				<!-- System Intelligence -->
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
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
		color: #e2e8f0;
	}

	.recommender-header {
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
		color: #e2e8f0;
		margin: 0 0 8px 0;
	}

	.subtitle {
		font-size: 16px;
		color: #94a3b8;
		margin: 0;
	}

	.header-stats {
		display: flex;
		gap: 24px;
	}

	.stat-item {
		text-align: center;
		padding: 12px 16px;
		background: rgba(30, 41, 59, 0.8);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
	}

	.stat-value {
		display: block;
		font-size: 24px;
		font-weight: 700;
		color: #e2e8f0;
		font-family: 'JetBrains Mono', monospace;
	}

	.stat-label {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		font-size: 11px;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 2px;
	}

	.tooltip-container {
		position: relative;
		display: inline-block;
	}

	.info-icon {
		color: #64748b;
		cursor: pointer;
	}

	.info-icon:hover {
		color: #94a3b8;
	}

	.tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(15, 23, 42, 0.95);
		color: #e2e8f0;
		padding: 8px 12px;
		border-radius: 6px;
		font-size: 12px;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s;
		border: 1px solid rgba(255, 255, 255, 0.1);
		z-index: 1000;
		margin-bottom: 8px;
	}

	.tooltip-container:hover .tooltip {
		opacity: 1;
	}

	.nav-tabs {
		display: flex;
		gap: 4px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.nav-tab {
		padding: 12px 20px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(30, 41, 59, 0.8);
		color: #94a3b8;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 8px 8px 0 0;
		font-size: 14px;
	}

	.nav-tab:hover {
		background: rgba(51, 65, 85, 0.9);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.nav-tab.active {
		background: rgba(51, 65, 85, 0.95);
		color: #e2e8f0;
		border-bottom-color: rgba(51, 65, 85, 0.95);
		box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
	}

	.content-area {
		max-width: 1400px;
		margin: 0 auto;
		padding: 24px;
	}

	.overview-layout {
		display: grid;
		grid-template-columns: 480px 1fr;
		grid-template-rows: auto auto;
		gap: 24px;
	}

	.health-overview {
		background: rgba(30, 41, 59, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 16px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
		max-width: 480px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: #e2e8f0;
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
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.2s ease;
		background: rgba(51, 65, 85, 0.3);
	}

	.health-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
		color: #e2e8f0;
		font-family: 'JetBrains Mono', monospace;
	}

	.health-label {
		font-size: 14px;
		font-weight: 500;
		color: #cbd5e1;
		margin-top: 2px;
	}

	.health-percentage {
		font-size: 12px;
		color: #94a3b8;
		font-weight: 600;
	}

	.health-description {
		font-size: 11px;
		color: #64748b;
		text-align: right;
		line-height: 1.3;
	}

	.tabbed-section {
		background: rgba(30, 41, 59, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	.tabs-header {
		display: flex;
		background: rgba(15, 23, 42, 0.5);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.tab-btn {
		flex: 1;
		padding: 12px 16px;
		background: transparent;
		border: none;
		color: #94a3b8;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border-bottom: 2px solid transparent;
	}

	.tab-btn:hover {
		background: rgba(51, 65, 85, 0.3);
		color: #cbd5e1;
	}

	.tab-btn.active {
		color: #e2e8f0;
		border-bottom-color: #3b82f6;
		background: rgba(51, 65, 85, 0.5);
	}

	.tab-content {
		padding: 20px;
	}

	.tab-panel {
		min-height: 200px;
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
		background: rgba(51, 65, 85, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.action-card:hover {
		background: rgba(71, 85, 105, 0.4);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.action-icon {
		font-size: 20px;
		min-width: 40px;
		text-align: center;
	}

	.action-title {
		font-size: 14px;
		font-weight: 600;
		color: #e2e8f0;
		margin-bottom: 4px;
	}

	.action-description {
		font-size: 12px;
		color: #94a3b8;
		line-height: 1.3;
	}

	.history-content, .alerts-content {
		color: #e2e8f0;
	}

	.history-content h4, .alerts-content h4 {
		color: #e2e8f0;
		margin-bottom: 16px;
	}

	.activity-list, .alert-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.alert-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.alert-item.critical {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
	}

	.alert-item.warning {
		background: rgba(245, 158, 11, 0.1);
		border-color: rgba(245, 158, 11, 0.3);
	}

	.alert-title {
		font-weight: 600;
		color: #e2e8f0;
	}

	.alert-description {
		font-size: 12px;
		color: #94a3b8;
	}

	.recent-activity {
		grid-column: 1 / -1;
		background: rgba(30, 41, 59, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	.activity-item {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		padding: 16px;
		background: rgba(51, 65, 85, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		margin-bottom: 12px;
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
		color: #e2e8f0;
		margin-bottom: 4px;
	}

	.activity-description {
		font-size: 13px;
		color: #94a3b8;
		line-height: 1.4;
		margin-bottom: 4px;
	}

	.activity-time {
		font-size: 11px;
		color: #64748b;
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

		.health-overview {
			max-width: 100%;
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
			flex-wrap: wrap;
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