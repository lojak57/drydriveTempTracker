<script lang="ts">
	import FleetSizeControl from './FleetSizeControl.svelte';
	import CostVisualizationTable from './CostVisualizationTable.svelte';
	import { costBreakdown, calibrationConfig } from '$lib/stores/calibrationData';
	import { onMount } from 'svelte';

	let darkMode = false;
	let showOptimizationDetails = false;

	onMount(() => {
		// Check for saved theme preference
		const savedTheme = localStorage.getItem('calibration-theme');
		if (savedTheme === 'dark') {
			darkMode = true;
		}
	});

	function toggleDarkMode() {
		darkMode = !darkMode;
		localStorage.setItem('calibration-theme', darkMode ? 'dark' : 'light');
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Calculate ROI metrics
	$: roiMetrics = {
		monthlyROI: ($costBreakdown.monthlySavings / $costBreakdown.monthlyTotal) * 100,
		annualROI: ($costBreakdown.annualSavings / $costBreakdown.annualTotal) * 100,
		paybackMonths: 2, // Assuming 2 months implementation time
		breakEvenAmount: $costBreakdown.monthlySavings * 2
	};

	// Key statistics for demo
	$: keyStats = {
		totalFleet: $calibrationConfig.fleetSize,
		currentAnnualCost: $costBreakdown.annualTotal,
		optimizedAnnualCost: $costBreakdown.optimizedAnnual,
		annualSavings: $costBreakdown.annualSavings,
		monthlySavings: $costBreakdown.monthlySavings,
		avgSavingsPerTruck: $costBreakdown.annualSavings / $calibrationConfig.fleetSize
	};
</script>

<div class="visualizer-container" class:dark={darkMode}>
	<!-- Header Section -->
	<div class="visualizer-header">
		<div class="header-content">
			<div class="title-section">
				<h1 class="main-title">Coriolis Calibration Cost Visualizer</h1>
				<p class="subtitle">Calculate the true cost of monthly calibrations across your fleet</p>
			</div>
			<div class="header-controls">
				<button 
					class="theme-toggle"
					on:click={toggleDarkMode}
					aria-label="Toggle dark mode"
				>
					{#if darkMode}
						<span class="icon">☀️</span>
						Light Mode
					{:else}
						<span class="icon">🌙</span>
						Dark Mode
					{/if}
				</button>
			</div>
		</div>
		
		<!-- Key Metrics Bar -->
		<div class="metrics-bar">
			<div class="metric-item">
				<span class="metric-label">Fleet Size</span>
				<span class="metric-value">{keyStats.totalFleet.toLocaleString()}</span>
			</div>
			<div class="metric-item">
				<span class="metric-label">Current Annual Cost</span>
				<span class="metric-value cost">{formatCurrency(keyStats.currentAnnualCost)}</span>
			</div>
			<div class="metric-item highlight">
				<span class="metric-label">Annual Savings</span>
				<span class="metric-value savings">{formatCurrency(keyStats.annualSavings)}</span>
			</div>
			<div class="metric-item">
				<span class="metric-label">ROI</span>
				<span class="metric-value roi">{roiMetrics.annualROI.toFixed(1)}%</span>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="content-grid">
		<!-- Fleet Configuration -->
		<div class="config-section">
			<FleetSizeControl />
			
			<!-- Optimization Details Toggle -->
			<div class="optimization-info">
				<button 
					class="details-toggle"
					on:click={() => showOptimizationDetails = !showOptimizationDetails}
				>
					<span class="toggle-icon" class:rotated={showOptimizationDetails}>▶</span>
					How VeriHaul Optimization Works
				</button>
				
				{#if showOptimizationDetails}
					<div class="optimization-details">
						<div class="detail-grid">
							<div class="detail-card">
								<h4>🔍 Load Monitoring</h4>
								<p>Every Coriolis reading is logged and compared across the fleet</p>
							</div>
							<div class="detail-card">
								<h4>📊 Pattern Recognition</h4>
								<p>AI identifies drift patterns and outliers vs. terminal readings</p>
							</div>
							<div class="detail-card">
								<h4>🎯 Targeted Calibration</h4>
								<p>Only recommend calibration when actual drift is detected</p>
							</div>
							<div class="detail-card">
								<h4>💰 Cost Savings</h4>
								<p>Reduce unnecessary calibrations by 40% while maintaining accuracy</p>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Cost Visualization -->
		<div class="visualization-section">
			<CostVisualizationTable />
		</div>
	</div>

	<!-- Bottom Insights -->
	<div class="insights-section">
		<div class="insight-cards">
			<div class="insight-card primary">
				<div class="insight-icon">💡</div>
				<div class="insight-content">
					<h3>Smart Insight</h3>
					<p>Your fleet could save <strong>{formatCurrency(keyStats.monthlySavings)}/month</strong> with data-driven calibrations</p>
				</div>
			</div>
			
			<div class="insight-card secondary">
				<div class="insight-icon">⚡</div>
				<div class="insight-content">
					<h3>Quick ROI</h3>
					<p>Implementation pays for itself in <strong>{roiMetrics.paybackMonths} months</strong> with ongoing savings</p>
				</div>
			</div>
			
			<div class="insight-card tertiary">
				<div class="insight-icon">🎯</div>
				<div class="insight-content">
					<h3>Per-Truck Impact</h3>
					<p>Average savings of <strong>{formatCurrency(keyStats.avgSavingsPerTruck)}/truck/year</strong> with VeriHaul</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Demo Footer -->
	<div class="demo-footer">
		<div class="footer-content">
			<div class="demo-info">
				<span class="demo-label">🚛 Demo Configuration:</span>
				<span>Plains All American - {keyStats.totalFleet} Truck Fleet</span>
			</div>
			<div class="contact-info">
				<span>Learn more about VeriHaul optimization</span>
				<button class="contact-btn">Contact Sales</button>
			</div>
		</div>
	</div>
</div>

<style>
	.visualizer-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		transition: all 0.3s ease;
	}

	.visualizer-container.dark {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		color: #f1f5f9;
	}

	.visualizer-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding: 24px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.dark .visualizer-header {
		background: rgba(15, 23, 42, 0.95);
		border-bottom-color: rgba(255, 255, 255, 0.1);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
	}

	.title-section {
		flex: 1;
	}

	.main-title {
		font-size: 32px;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 8px 0;
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.dark .main-title {
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.dark .subtitle {
		color: #94a3b8;
	}

	.header-controls {
		display: flex;
		gap: 12px;
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.8);
		color: #475569;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dark .theme-toggle {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.1);
		color: #e2e8f0;
	}

	.theme-toggle:hover {
		background: rgba(255, 255, 255, 1);
		border-color: rgba(0, 0, 0, 0.2);
		transform: translateY(-1px);
	}

	.dark .theme-toggle:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.metrics-bar {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		padding: 20px;
		background: rgba(248, 250, 252, 0.8);
		border-radius: 12px;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.dark .metrics-bar {
		background: rgba(30, 41, 59, 0.8);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.metric-item {
		text-align: center;
		padding: 12px;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.metric-item:hover {
		background: rgba(255, 255, 255, 0.8);
		transform: translateY(-2px);
	}

	.dark .metric-item:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.metric-item.highlight {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.dark .metric-item.highlight {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.3);
	}

	.metric-label {
		display: block;
		font-size: 12px;
		font-weight: 500;
		color: #64748b;
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.dark .metric-label {
		color: #94a3b8;
	}

	.metric-value {
		display: block;
		font-size: 20px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	.dark .metric-value {
		color: #f1f5f9;
	}

	.metric-value.cost {
		color: #dc2626;
	}

	.metric-value.savings {
		color: #16a34a;
	}

	.metric-value.roi {
		color: #3b82f6;
	}

	.content-grid {
		display: grid;
		grid-template-columns: 350px 1fr;
		gap: 24px;
		padding: 24px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.config-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.optimization-info {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.dark .optimization-info {
		background: rgba(30, 41, 59, 0.95);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.details-toggle {
		width: 100%;
		padding: 16px 20px;
		display: flex;
		align-items: center;
		gap: 12px;
		background: transparent;
		border: none;
		color: #475569;
		font-weight: 500;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dark .details-toggle {
		color: #e2e8f0;
	}

	.details-toggle:hover {
		background: rgba(59, 130, 246, 0.05);
	}

	.toggle-icon {
		transition: transform 0.2s ease;
		color: #3b82f6;
	}

	.toggle-icon.rotated {
		transform: rotate(90deg);
	}

	.optimization-details {
		padding: 0 20px 20px 20px;
		border-top: 1px solid rgba(0, 0, 0, 0.05);
	}

	.dark .optimization-details {
		border-top-color: rgba(255, 255, 255, 0.1);
	}

	.detail-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.detail-card {
		padding: 12px;
		background: rgba(248, 250, 252, 0.8);
		border-radius: 6px;
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.dark .detail-card {
		background: rgba(51, 65, 85, 0.5);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.detail-card h4 {
		font-size: 13px;
		font-weight: 600;
		margin: 0 0 4px 0;
		color: #334155;
	}

	.dark .detail-card h4 {
		color: #f1f5f9;
	}

	.detail-card p {
		font-size: 12px;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	.dark .detail-card p {
		color: #94a3b8;
	}

	.insights-section {
		padding: 24px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.insight-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	.insight-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;
	}

	.dark .insight-card {
		background: rgba(30, 41, 59, 0.95);
		border-color: rgba(255, 255, 255, 0.1);
	}

	.insight-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.insight-icon {
		font-size: 24px;
		min-width: 40px;
		text-align: center;
	}

	.insight-content h3 {
		font-size: 16px;
		font-weight: 600;
		color: #0f172a;
		margin: 0 0 4px 0;
	}

	.dark .insight-content h3 {
		color: #f1f5f9;
	}

	.insight-content p {
		font-size: 14px;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	.dark .insight-content p {
		color: #94a3b8;
	}

	.demo-footer {
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(20px);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 20px 24px;
		margin-top: 24px;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1400px;
		margin: 0 auto;
	}

	.demo-info {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #e2e8f0;
		font-size: 14px;
	}

	.demo-label {
		font-weight: 600;
	}

	.contact-info {
		display: flex;
		align-items: center;
		gap: 16px;
		color: #94a3b8;
		font-size: 14px;
	}

	.contact-btn {
		padding: 8px 16px;
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.contact-btn:hover {
		background: linear-gradient(135deg, #2563eb, #1e40af);
		transform: translateY(-1px);
	}

	/* Mobile responsive */
	@media (max-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.config-section {
			order: 2;
		}

		.visualization-section {
			order: 1;
		}

		.detail-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.header-content {
			flex-direction: column;
			gap: 16px;
			align-items: flex-start;
		}

		.metrics-bar {
			grid-template-columns: repeat(2, 1fr);
		}

		.insight-cards {
			grid-template-columns: 1fr;
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

		.metrics-bar {
			grid-template-columns: 1fr;
		}

		.insight-card {
			flex-direction: column;
			text-align: center;
		}
	}
</style> 