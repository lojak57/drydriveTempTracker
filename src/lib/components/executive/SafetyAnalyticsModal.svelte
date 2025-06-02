<script lang="ts">
	import { Shield, AlertTriangle, CheckCircle, TrendingUp, Users, Truck, Clock, Award } from 'lucide-svelte';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';
	import IncidentDetailModal from './IncidentDetailModal.svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let isOpen = false;
	
	const dispatch = createEventDispatcher();
	
	// Safety metrics data
	const safetyBreakdown = {
		incidents: {
			total: 3,
			minor: 2,
			major: 1,
			critical: 0,
			lastIncident: 23
		},
		training: {
			completed: 189,
			total: 195,
			percentage: 96.9,
			upcoming: 6
		},
		inspections: {
			passed: 247,
			total: 250,
			percentage: 98.8,
			failed: 3
		},
		compliance: {
			dot: 98.2,
			osha: 97.5,
			environmental: 99.1,
			internal: 96.3
		}
	};

	// Regional safety scores
	const regionalSafety = [
		{ region: 'North Texas Hub', score: 97.8, incidents: 0, trend: 'up' },
		{ region: 'Oklahoma Central', score: 96.2, incidents: 1, trend: 'stable' },
		{ region: 'Louisiana East', score: 98.1, incidents: 0, trend: 'up' },
		{ region: 'Kansas West', score: 94.9, incidents: 2, trend: 'down' }
	];

	// Incident detail modal state
	let showIncidentModal = false;
	let selectedIncidentType = 'minor';

	function closeModal() {
		isOpen = false;
		dispatch('close');
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	}

	function openIncidentDetails(type: string) {
		selectedIncidentType = type;
		showIncidentModal = true;
	}
</script>

{#if isOpen}
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div class="modal-container">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-left">
					<div class="header-icon">
						<Shield size={32} />
					</div>
					<div class="header-text">
						<h1 class="text-xl font-semibold">Safety Analytics Deep Dive</h1>
						<p class="text-sm">Comprehensive breakdown of your 96.8% safety score</p>
					</div>
				</div>
				<button class="close-btn" on:click={closeModal}>×</button>
			</div>

			<!-- Content -->
			<div class="modal-content">
				<!-- Overall Safety Score -->
				<div class="score-header">
					<div class="main-score">
						<div class="score-circle">
							<div class="score-value font-mono text-4xl font-bold">96.8<span class="score-unit text-lg opacity-80">%</span></div>
							<div class="score-label text-xs opacity-90">Overall Safety Score</div>
						</div>
						<div class="score-trend">
							<TrendingUp size={20} />
							<span class="text-green-600 font-semibold text-sm">+1.2% vs last month</span>
						</div>
					</div>
					<div class="score-composition">
						<h3 class="text-lg font-semibold text-slate-800 mb-5">Score Composition</h3>
						<div class="composition-breakdown">
							<div class="composition-item">
								<span class="component-name text-sm text-slate-600 font-medium">Incident Rate (40%)</span>
								<div class="component-bar">
									<div class="component-fill" style="width: 94.5%"></div>
								</div>
								<span class="component-score text-sm font-mono font-semibold text-slate-800">94.5%</span>
							</div>
							<div class="composition-item">
								<span class="component-name text-sm text-slate-600 font-medium">Training Compliance (25%)</span>
								<div class="component-bar">
									<div class="component-fill" style="width: 96.9%"></div>
								</div>
								<span class="component-score text-sm font-mono font-semibold text-slate-800">96.9%</span>
							</div>
							<div class="composition-item">
								<span class="component-name text-sm text-slate-600 font-medium">Vehicle Inspections (20%)</span>
								<div class="component-bar">
									<div class="component-fill" style="width: 98.8%"></div>
								</div>
								<span class="component-score text-sm font-mono font-semibold text-slate-800">98.8%</span>
							</div>
							<div class="composition-item">
								<span class="component-name text-sm text-slate-600 font-medium">Regulatory Compliance (15%)</span>
								<div class="component-bar">
									<div class="component-fill" style="width: 97.7%"></div>
								</div>
								<span class="component-score text-sm font-mono font-semibold text-slate-800">97.7%</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Key Metrics Grid -->
				<div class="metrics-section">
					<h2 class="text-xl font-semibold text-slate-800 mb-6">Key Safety Metrics</h2>
					<div class="metrics-grid chart-card-container">
						<MetricCard 
							title="Days Without Incident" 
							value="23" 
							unit="days" 
							icon={Award}
							status="normal"
							trend="up"
							trendValue="Current streak"
							color="emerald"
						/>
						<MetricCard 
							title="Training Completion" 
							value="96.9" 
							unit="%" 
							icon={Users}
							status="normal"
							trend="up"
							trendValue="+2.1%"
							color="blue"
						/>
						<MetricCard 
							title="Vehicle Inspections" 
							value="98.8" 
							unit="%" 
							icon={CheckCircle}
							status="normal"
							trend="up"
							trendValue="+0.8%"
							color="emerald"
						/>
						<MetricCard 
							title="Incident Response Time" 
							value="4.2" 
							unit="min avg" 
							icon={Clock}
							status="normal"
							trend="down"
							trendValue="-15%"
							color="blue"
						/>
					</div>
				</div>

				<!-- Incident Analysis -->
				<div class="incidents-section">
					<h2 class="text-xl font-semibold text-slate-800 mb-6">Incident Analysis (Last 90 Days)</h2>
					<div class="incidents-overview">
						<div class="incident-summary">
							<div class="incident-card minor" on:click={() => openIncidentDetails('minor')}>
								<div class="incident-count font-mono text-3xl font-bold text-amber-600">2</div>
								<div class="incident-type text-base font-semibold text-slate-800">Minor Incidents</div>
								<div class="incident-desc text-sm text-slate-600">Equipment scratches, minor delays</div>
							</div>
							<div class="incident-card major" on:click={() => openIncidentDetails('major')}>
								<div class="incident-count font-mono text-3xl font-bold text-red-500">1</div>
								<div class="incident-type text-base font-semibold text-slate-800">Major Incident</div>
								<div class="incident-desc text-sm text-slate-600">Vehicle breakdown requiring tow</div>
							</div>
							<div class="incident-card critical" on:click={() => openIncidentDetails('critical')}>
								<div class="incident-count font-mono text-3xl font-bold text-green-600">0</div>
								<div class="incident-type text-base font-semibold text-slate-800">Critical Incidents</div>
								<div class="incident-desc text-sm text-slate-600">No safety-related injuries</div>
							</div>
						</div>
						<div class="incident-chart chart-card">
							<RealtimeChart 
								title="Incident Trends (12 Months)"
								color="#EF4444"
								height={300}
								unit="incidents"
								animated={true}
							/>
						</div>
					</div>
				</div>

				<!-- Regional Safety Performance -->
				<div class="regional-section">
					<h2 class="text-xl font-semibold text-slate-800 mb-6">Regional Safety Performance</h2>
					<div class="regional-grid chart-card-container">
						{#each regionalSafety as region}
							<div class="regional-card chart-card">
								<div class="regional-header">
									<h3 class="text-base font-semibold text-slate-800">{region.region}</h3>
									<div class="regional-score font-mono text-lg font-bold {region.score >= 97 ? 'text-green-600' : region.score >= 95 ? 'text-amber-600' : 'text-red-500'}">
										{region.score}%
									</div>
								</div>
								<div class="regional-details">
									<div class="detail-item">
										<span class="detail-label text-sm text-slate-600">Incidents (90 days)</span>
										<span class="detail-value text-sm font-mono font-semibold {region.incidents === 0 ? 'text-green-600' : region.incidents <= 1 ? 'text-amber-600' : 'text-red-500'}">{region.incidents}</span>
									</div>
									<div class="detail-item">
										<span class="detail-label text-sm text-slate-600">Trend</span>
										<span class="detail-value text-sm font-semibold {region.trend === 'up' ? 'text-green-600' : region.trend === 'down' ? 'text-red-500' : 'text-slate-700'}">
											{#if region.trend === 'up'}↗️ Improving
											{:else if region.trend === 'down'}↘️ Needs attention
											{:else}→ Stable{/if}
										</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Compliance Dashboard -->
				<div class="compliance-section">
					<h2 class="text-xl font-semibold text-slate-800 mb-6">Regulatory Compliance</h2>
					<div class="compliance-grid chart-card-container">
						<div class="compliance-item chart-card">
							<div class="compliance-header">
								<span class="compliance-name text-base font-semibold text-slate-800">DOT Compliance</span>
								<span class="compliance-score text-lg font-mono font-bold {safetyBreakdown.compliance.dot >= 98 ? 'text-green-600' : safetyBreakdown.compliance.dot >= 95 ? 'text-amber-600' : 'text-red-500'}">{safetyBreakdown.compliance.dot}%</span>
							</div>
							<div class="compliance-bar">
								<div class="compliance-fill" style="width: {safetyBreakdown.compliance.dot}%"></div>
							</div>
						</div>
						<div class="compliance-item chart-card">
							<div class="compliance-header">
								<span class="compliance-name text-base font-semibold text-slate-800">OSHA Standards</span>
								<span class="compliance-score text-lg font-mono font-bold {safetyBreakdown.compliance.osha >= 98 ? 'text-green-600' : safetyBreakdown.compliance.osha >= 95 ? 'text-amber-600' : 'text-red-500'}">{safetyBreakdown.compliance.osha}%</span>
							</div>
							<div class="compliance-bar">
								<div class="compliance-fill" style="width: {safetyBreakdown.compliance.osha}%"></div>
							</div>
						</div>
						<div class="compliance-item chart-card">
							<div class="compliance-header">
								<span class="compliance-name text-base font-semibold text-slate-800">Environmental</span>
								<span class="compliance-score text-lg font-mono font-bold {safetyBreakdown.compliance.environmental >= 98 ? 'text-green-600' : safetyBreakdown.compliance.environmental >= 95 ? 'text-amber-600' : 'text-red-500'}">{safetyBreakdown.compliance.environmental}%</span>
							</div>
							<div class="compliance-bar">
								<div class="compliance-fill" style="width: {safetyBreakdown.compliance.environmental}%"></div>
							</div>
						</div>
						<div class="compliance-item chart-card">
							<div class="compliance-header">
								<span class="compliance-name text-base font-semibold text-slate-800">Internal Policies</span>
								<span class="compliance-score text-lg font-mono font-bold {safetyBreakdown.compliance.internal >= 98 ? 'text-green-600' : safetyBreakdown.compliance.internal >= 95 ? 'text-amber-600' : 'text-red-500'}">{safetyBreakdown.compliance.internal}%</span>
							</div>
							<div class="compliance-bar">
								<div class="compliance-fill" style="width: {safetyBreakdown.compliance.internal}%"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Incident Detail Modal -->
<IncidentDetailModal 
	isOpen={showIncidentModal} 
	incidentType={selectedIncidentType}
	on:close={() => showIncidentModal = false}
/>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal-container {
		background: white;
		border-radius: 24px;
		max-width: 1200px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
		display: flex;
		flex-direction: column;
		font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px 32px;
		background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
		color: white;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.header-icon {
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-text h1 {
		margin: 0 0 4px 0;
		color: white;
	}

	.header-text p {
		margin: 0;
		opacity: 0.9;
		color: white;
	}

	.close-btn {
		width: 40px;
		height: 40px;
		border: none;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border-radius: 8px;
		font-size: 24px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 32px;
	}

	/* Global Chart Card System */
	.chart-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: all 0.2s ease;
	}

	.chart-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}

	.chart-card-container {
		display: grid;
		gap: 20px;
	}

	/* Score Header */
	.score-header {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 40px;
		margin-bottom: 40px;
		padding: 32px;
		background: linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%);
		border-radius: 20px;
		border: 1px solid #e2e8f0;
	}

	.main-score {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.score-circle {
		width: 180px;
		height: 180px;
		border-radius: 50%;
		background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		position: relative;
	}

	.score-trend {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		font-size: 14px;
	}

	.composition-breakdown {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.composition-item {
		display: grid;
		grid-template-columns: 1fr 150px 60px;
		align-items: center;
		gap: 12px;
	}

	.component-bar {
		height: 8px;
		background: #f1f5f9;
		border-radius: 4px;
		overflow: hidden;
	}

	.component-fill {
		height: 100%;
		background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
		transition: width 0.3s ease;
	}

	/* Sections */
	.metrics-section,
	.incidents-section,
	.regional-section,
	.compliance-section {
		margin-bottom: 40px;
	}

	.metrics-grid {
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	}

	/* Incidents */
	.incidents-overview {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 32px;
		align-items: start;
	}

	.incident-summary {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.incident-card {
		padding: 20px;
		border-radius: 12px;
		border-left: 4px solid;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
		background: white;
		border: 1px solid #e2e8f0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.incident-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	.incident-card:active {
		transform: translateY(0);
	}

	.incident-card::after {
		content: "Click for details →";
		position: absolute;
		bottom: 8px;
		right: 12px;
		font-size: 10px;
		color: #64748b;
		opacity: 0;
		transition: opacity 0.2s ease;
		font-weight: 500;
	}

	.incident-card:hover::after {
		opacity: 1;
	}

	.incident-card.minor {
		border-left-color: #f59e0b;
	}

	.incident-card.major {
		border-left-color: #ef4444;
	}

	.incident-card.critical {
		border-left-color: #10b981;
	}

	/* Regional */
	.regional-grid {
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	.regional-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.regional-header h3 {
		margin: 0;
	}

	.regional-details {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	/* Compliance */
	.compliance-grid {
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}

	.compliance-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.compliance-bar {
		height: 12px;
		background: #f1f5f9;
		border-radius: 6px;
		overflow: hidden;
	}

	.compliance-fill {
		height: 100%;
		background: linear-gradient(135deg, #10B981 0%, #3B82F6 100%);
		border-radius: 6px;
		transition: width 0.3s ease;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.modal-backdrop {
			padding: 10px;
		}

		.modal-header {
			padding: 20px;
		}

		.modal-content {
			padding: 20px;
		}

		.score-header {
			grid-template-columns: 1fr;
			gap: 24px;
			padding: 20px;
		}

		.incidents-overview {
			grid-template-columns: 1fr;
		}

		.metrics-grid,
		.regional-grid,
		.compliance-grid {
			grid-template-columns: 1fr;
		}

		.chart-card-container {
			gap: 16px;
		}

		.chart-card {
			padding: 16px;
		}
	}

	@media (max-width: 640px) {
		.composition-item {
			grid-template-columns: 1fr 80px 50px;
			gap: 8px;
		}

		.score-circle {
			width: 140px;
			height: 140px;
		}
	}
</style> 