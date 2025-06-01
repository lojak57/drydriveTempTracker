<script lang="ts">
	import PreTripInspection from '$lib/components/driver/PreTripInspection.svelte';
	import DriverSchedule from '$lib/components/driver/DriverSchedule.svelte';
	import JobDetailModal from '$lib/components/driver/JobDetailModal.svelte';
	import JobMapView from '$lib/components/driver/JobMapView.svelte';
	import InTransitView from '$lib/components/driver/InTransitView.svelte';
	import QuickNavBar from '$lib/components/ui/QuickNavBar.svelte';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import SmartCalChart from '$lib/components/charts/SmartCalChart.svelte';
	import ROIJustificationCard from '$lib/components/dashboard/ROIJustificationCard.svelte';
	import { Truck, BarChart3, Shield, CheckCircle, Clock, Zap, Package, Trophy, BookOpen, Search } from 'lucide-svelte';

	// Driver workflow state
	let selectedJob: any = null;
	let showJobModal = false;
	let inspectionCompleted = false;
	let activeSection = 'overview';
	
	// Job flow states
	let currentView = 'dashboard'; // 'dashboard' | 'job-map' | 'in-transit'
	let activeJob: any = null;

	// Navigation handling
	function handleNavigation(event: CustomEvent) {
		const section = event.detail.section;
		activeSection = section;
		
		// Scroll to section
		setTimeout(() => {
			const element = document.getElementById(section);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	}

	function handleJobSelected(event: CustomEvent) {
		selectedJob = event.detail.job;
		showJobModal = true;
	}

	function handleJobStart(event: CustomEvent) {
		const { job } = event.detail;
		console.log('🚀 Starting job:', job.id, '| Account:', job.accountName);
		console.log('📍 Route:', job.pickupLocation.name, '→', job.deliveryLocation.name);
		
		// Set active job and transition to map view
		activeJob = job;
		currentView = 'job-map';
		showJobModal = false;
	}

	function handleExitMap() {
		currentView = 'dashboard';
		activeJob = null;
	}

	function handleStartTransit(event: CustomEvent) {
		const { job } = event.detail;
		console.log('🚚 Starting transit for job:', job.id);
		// Transition from map view to in-transit view
		currentView = 'in-transit';
		activeJob = job;
	}

	function handleTransitComplete() {
		currentView = 'dashboard';
		activeJob = null;
		// TODO: Update job status, show completion modal, etc.
	}

	function handleInspectionComplete(event: CustomEvent) {
		const inspectionData = event.detail.inspectionData;
		inspectionCompleted = true;
		console.log('Inspection completed:', inspectionData);
		activeSection = 'schedule';
		
		// Scroll to schedule after completion
		setTimeout(() => {
			const scheduleElement = document.getElementById('schedule');
			if (scheduleElement) {
				scheduleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	}

	function goToSection(section: string) {
		activeSection = section;
		setTimeout(() => {
			const element = document.getElementById(section);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	}
</script>

<svelte:head>
	<title>Driver Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="driver-dashboard">
	<!-- Show dashboard sections only when in dashboard view -->
	{#if currentView === 'dashboard'}
		<!-- Quick Navigation Bar -->
		<QuickNavBar 
			activeSection={activeSection} 
			on:navigate={handleNavigation}
		/>

		<!-- Header -->
		<div class="dashboard-header">
			<div class="header-content">
				<div class="header-icon">
					<Truck size={32} />
				</div>
				<div class="header-text">
					<h1 class="header-title">Driver Dashboard</h1>
					<p class="header-subtitle">Schedule, pre-trip inspection, and job management</p>
				</div>
			</div>
		</div>

		<!-- Overview Section -->
		<section id="overview" class="dashboard-section">
			<div class="section-header">
				<h1 class="section-title">Driver Dashboard</h1>
				<p class="section-subtitle">Complete your daily workflow and manage hauls</p>
			</div>

			<div class="section-content">
				<!-- Overview Cards -->
				<div class="overview-cards">
					<div class="overview-card pretrip" on:click={() => goToSection('pretrip')}>
						<div class="card-header">
							<div class="card-icon">
								<BarChart3 size={24} />
							</div>
							<div class="card-status status-pending">PENDING</div>
						</div>
						<h3>Pre-Trip Inspection</h3>
						<p>Complete your daily safety inspection</p>
					</div>

					<div class="overview-card" on:click={() => goToSection('schedule')}>
						<div class="card-icon">📅</div>
						<div class="card-content">
							<h3>Schedule & Routes</h3>
							<p>View today's hauls and routes</p>
							<span class="card-status active">5 Jobs Today</span>
						</div>
					</div>

					<div class="overview-card" on:click={() => goToSection('performance')}>
						<div class="card-icon">📊</div>
						<div class="card-content">
							<h3>Performance</h3>
							<p>Track your metrics and stats</p>
							<span class="card-status good">94.2% Efficiency</span>
						</div>
					</div>

					<div class="overview-card safety" on:click={() => goToSection('safety')}>
						<div class="card-header">
							<div class="card-icon">
								<Shield size={24} />
							</div>
							<div class="card-status status-good">96.8%</div>
						</div>
						<h3>Safety Score</h3>
						<p>Your current safety rating</p>
					</div>
				</div>

				<!-- Quick Metrics -->
				<div class="quick-metrics">
					<MetricCard 
						title="Today's Progress" 
						value="3/5" 
						unit="hauls" 
						icon={Truck}
						status="normal"
						trend="up"
						trendValue="+1"
						color="blue"
					/>
					<MetricCard 
						title="Current Status" 
						value="Available" 
						unit="" 
						icon={CheckCircle}
						status="normal"
						trend="stable"
						trendValue="Ready"
						color="emerald"
					/>
					<MetricCard 
						title="Next Haul" 
						value="2:30 PM" 
						unit="" 
						icon={Clock}
						status="normal"
						trend="stable"
						trendValue="Scheduled"
						color="orange"
					/>
				</div>
			</div>
		</section>

		<!-- Pre-Trip Section -->
		<section id="pretrip" class="dashboard-section">
			<div class="section-header">
				<h2 class="section-title">Pre-Trip Inspection</h2>
				<button class="back-btn" on:click={() => goToSection('overview')}>
					← Back to Overview
				</button>
			</div>

			<div class="section-content">
				<PreTripInspection on:inspection-complete={handleInspectionComplete} />
			</div>
		</section>

		<!-- Schedule Section -->
		<section id="schedule" class="dashboard-section">
			<div class="section-header">
				<h2 class="section-title">Schedule & Routes</h2>
				<button class="back-btn" on:click={() => goToSection('overview')}>
					← Back to Overview
				</button>
			</div>

			<div class="section-content">
				<DriverSchedule on:job-selected={handleJobSelected} />
			</div>
		</section>

		<!-- Performance Section -->
		<section id="performance" class="dashboard-section">
			<div class="section-header">
				<h2 class="section-title">Performance Analytics</h2>
				<button class="back-btn" on:click={() => goToSection('overview')}>
					← Back to Overview
				</button>
			</div>

			<div class="section-content">
				<div class="performance-metrics">
					<MetricCard 
						title="Safety Compliance" 
						value="96.8" 
						unit="%" 
						icon={Shield}
						status="normal"
						trend="up"
						trendValue="+2.1%"
						color="emerald"
					/>
					<MetricCard 
						title="Efficiency Rating" 
						value="94.2" 
						unit="%" 
						icon={Zap}
						status="normal"
						trend="up"
						trendValue="+3.1%"
						color="blue"
					/>
					<MetricCard 
						title="Hauls This Week" 
						value="23" 
						unit="" 
						icon={Package}
						status="normal"
						trend="up"
						trendValue="+2"
						color="orange"
					/>
					<MetricCard 
						title="On-Time Delivery" 
						value="96.8" 
						unit="%" 
						icon={Clock}
						status="normal"
						trend="stable"
						trendValue="+0.5%"
						color="emerald"
					/>
				</div>

				<!-- Smart Cal Chart -->
				<div class="chart-section">
					<h3>Smart Calibration Overview</h3>
					<SmartCalChart size="medium" showLabels={true} />
				</div>

				<!-- ROI Justification -->
				<div class="roi-section">
					<ROIJustificationCard />
				</div>
			</div>
		</section>

		<!-- Safety Section -->
		<section id="safety" class="dashboard-section">
			<div class="section-header">
				<h2 class="section-title">Safety Record</h2>
				<button class="back-btn" on:click={() => goToSection('overview')}>
					← Back to Overview
				</button>
			</div>

			<div class="section-content">
				<div class="safety-metrics">
					<MetricCard 
						title="Days Without Incident" 
						value="247" 
						unit="days" 
						icon={Trophy}
						status="normal"
						trend="up"
						trendValue="+1"
						color="emerald"
					/>
					<MetricCard 
						title="Safety Training" 
						value="100" 
						unit="%" 
						icon={BookOpen}
						status="normal"
						trend="stable"
						trendValue="Current"
						color="blue"
					/>
					<MetricCard 
						title="Vehicle Inspections" 
						value="23/23" 
						unit="" 
						icon={Search}
						status="normal"
						trend="stable"
						trendValue="Perfect"
						color="emerald"
					/>
				</div>
			</div>
		</section>
	{/if}

	<!-- Job Map View -->
	{#if currentView === 'job-map' && activeJob}
		<JobMapView 
			job={activeJob}
			on:exit-map={handleExitMap}
			on:start-transit={handleStartTransit}
		/>
	{/if}

	<!-- In-Transit View -->
	{#if currentView === 'in-transit' && activeJob}
		<InTransitView 
			job={activeJob}
			on:transit-complete={handleTransitComplete}
			on:back-to-map={() => currentView = 'job-map'}
		/>
	{/if}
</div>

<!-- Job Detail Modal -->
{#if showJobModal && selectedJob}
	<JobDetailModal 
		job={selectedJob}
		isOpen={showJobModal}
		on:close={() => showJobModal = false}
		on:start-navigation={handleJobStart}
	/>
{/if}

<style>
	.driver-dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9f0 50%, #e8f5e8 100%);
		padding-bottom: 80px;
	}

	.dashboard-section {
		margin-bottom: 40px;
	}

	.section-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		padding: 24px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 80px;
		z-index: 10;
	}

	.section-title {
		font-size: 28px;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.section-subtitle {
		font-size: 16px;
		color: #64748b;
		margin: 4px 0 0 0;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: rgba(148, 163, 184, 0.1);
		color: #475569;
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 10px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background: rgba(148, 163, 184, 0.2);
		transform: translateX(-2px);
	}

	.section-content {
		padding: 32px 24px;
	}

	/* Overview Cards */
	.overview-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-bottom: 32px;
	}

	.overview-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.overview-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
		border-color: #3b82f6;
	}

	.card-icon {
		font-size: 48px;
		margin-bottom: 16px;
	}

	.card-content h3 {
		font-size: 20px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
	}

	.card-content p {
		font-size: 14px;
		color: #64748b;
		margin: 0 0 12px 0;
		line-height: 1.5;
	}

	.card-status {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.card-status.pending {
		background: #fef3c7;
		color: #d97706;
	}

	.card-status.completed {
		background: #d1fae5;
		color: #059669;
	}

	.card-status.active {
		background: #dbeafe;
		color: #2563eb;
	}

	.card-status.good {
		background: #d1fae5;
		color: #059669;
	}

	.card-status.excellent {
		background: #dcfce7;
		color: #16a34a;
	}

	/* Metrics Grids */
	.quick-metrics,
	.performance-metrics,
	.safety-metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 24px;
		margin-bottom: 32px;
	}

	/* Chart and ROI Sections */
	.chart-section,
	.roi-section {
		margin-bottom: 32px;
	}

	.chart-section h3 {
		font-size: 20px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 20px 0;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.section-header {
			padding: 20px 16px;
			flex-direction: column;
			gap: 12px;
			align-items: flex-start;
			top: 70px;
		}

		.section-title {
			font-size: 24px;
		}

		.back-btn {
			align-self: flex-end;
			padding: 10px 16px;
			font-size: 13px;
		}

		.section-content {
			padding: 24px 16px;
		}

		.overview-cards {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.overview-card {
			padding: 20px;
		}

		.card-icon {
			font-size: 40px;
			margin-bottom: 12px;
		}

		.card-content h3 {
			font-size: 18px;
		}

		.quick-metrics,
		.performance-metrics,
		.safety-metrics {
			grid-template-columns: 1fr;
			gap: 16px;
		}
	}

	@media (max-width: 640px) {
		.overview-cards {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}

		.overview-card {
			padding: 16px;
		}

		.card-icon {
			font-size: 32px;
			margin-bottom: 8px;
		}

		.card-content h3 {
			font-size: 16px;
			margin-bottom: 4px;
		}

		.card-content p {
			font-size: 13px;
			margin-bottom: 8px;
		}

		.card-status {
			font-size: 10px;
			padding: 3px 8px;
		}
	}
</style> 