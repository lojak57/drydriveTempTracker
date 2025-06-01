<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RoleMetricCard from '$lib/components/ui/RoleMetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';
	import GaugeChart from '$lib/components/charts/GaugeChart.svelte';
	import DryDriveLogo from '$lib/components/ui/DryDriveLogo.svelte';
	import HaulCard from '$lib/components/dashboard/HaulCard.svelte';
	import RoleSelector from '$lib/components/shared/RoleSelector.svelte';
	import PreTripInspection from '$lib/components/driver/PreTripInspection.svelte';
	import DriverSchedule from '$lib/components/driver/DriverSchedule.svelte';
	import JobDetailModal from '$lib/components/driver/JobDetailModal.svelte';
	import JobMapView from '$lib/components/driver/JobMapView.svelte';
	import InTransitView from '$lib/components/driver/InTransitView.svelte';
	import QuickNavBar from '$lib/components/ui/QuickNavBar.svelte';
	import SmartCalChart from '$lib/components/charts/SmartCalChart.svelte';
	import ROIJustificationCard from '$lib/components/dashboard/ROIJustificationCard.svelte';
	import StartFromPreTrip from '$lib/components/driver/StartFromPreTrip.svelte';
	import DispatchHub from '$lib/components/dispatch/DispatchHub.svelte';
	import { activeHauls, completedHauls, scadaStatus, drivers, trucks } from '$lib/stores/haulStore';
	import { selectedRole, isRoleView, type RoleId } from '$lib/stores/roleStore';
	import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-svelte';

	// Enhanced real-time metrics
	let currentTemp = 76.3;
	let ambientTemp = 98.7;
	let systemPressure = 154.2;
	let flowRate = 3.0;
	
	// New Coriolis metrics
	let netVolume = 172.5;
	let apiGravity = 42.1;
	let waterCut = 0.8;
	let massFlowRate = 3.2;
	
	// Safety & Pressure metrics
	let h2sLevels = 0.5;
	let tankerPressure = 145.2;
	let gasDetectionStatus: 'normal' | 'warning' | 'critical' = 'normal';
	let pumpRpm = 1750;
	
	// System Health metrics
	let scadaStatusValue = 'online';
	let dryDriveTemp = 185.3;
	let networkHealth = 98.7;
	let activeAlerts = 0;
	
	let updateInterval: number;
	let currentDate = new Date(1735064220000); // Static timestamp for SSR consistency

	// Role-based navigation state
	let executiveTab = 'overview';
	let driverTab = 'pre-trip';
	let dispatchTab = 'active-hauls';
	let yardTab = 'truck-overview';
	let regionalTab = 'yards-overview';

	// Quick nav state
	let activeNavSection = 'pretrip';
	let afterPreTripSubmit = false;

	const executiveTabs = [
		{ id: 'overview', label: 'Executive Overview', icon: '📊' },
		{ id: 'financial', label: 'Financial Performance', icon: '💰' },
		{ id: 'operations', label: 'Operations Summary', icon: '🏭' },
		{ id: 'strategic', label: 'Strategic Metrics', icon: '🎯' }
	];

	const driverTabs = [
		{ id: 'pre-trip', label: 'Pre-Trip Inspection', icon: '✅' },
		{ id: 'schedule', label: 'Schedule & Routes', icon: '📅' },
		{ id: 'performance', label: 'My Performance', icon: '📊' },
		{ id: 'safety', label: 'Safety Record', icon: '🛡️' },
		{ id: 'earnings', label: 'Earnings & Bonuses', icon: '💰' }
	];

	const dispatchTabs = [
		{ id: 'active-hauls', label: 'Active Hauls', icon: '🚛' },
		{ id: 'scheduling', label: 'Route Planning', icon: '📅' },
		{ id: 'fleet-status', label: 'Fleet Status', icon: '📊' },
		{ id: 'alerts', label: 'Alerts & Issues', icon: '🚨' }
	];

	const yardTabs = [
		{ id: 'truck-overview', label: 'Fleet Overview', icon: '🚛' },
		{ id: 'truck-individual', label: 'Individual Trucks', icon: '🔧' },
		{ id: 'driver-overview', label: 'Driver Overview', icon: '👥' },
		{ id: 'driver-individual', label: 'Individual Drivers', icon: '👨‍💼' },
		{ id: 'yard-operations', label: 'Yard Operations', icon: '🏭' },
		{ id: 'maintenance', label: 'Maintenance', icon: '⚙️' }
	];

	const regionalTabs = [
		{ id: 'yards-overview', label: 'Yards Overview', icon: '🏭' },
		{ id: 'fleet-regional', label: 'Regional Fleet', icon: '🚛' },
		{ id: 'driver-regional', label: 'Regional Drivers', icon: '👥' },
		{ id: 'performance', label: 'Performance Analytics', icon: '📊' },
		{ id: 'financial', label: 'Financial Overview', icon: '💰' },
		{ id: 'strategic', label: 'Strategic Planning', icon: '🎯' }
	];

	// Enhanced real-time SCADA simulation
	onMount(() => {
		// Update to current time once mounted
		currentDate = new Date();
		
		updateInterval = setInterval(() => {
			// Core Operations (Row 1)
			currentTemp = 70 + Math.random() * 15; // 70-85°F
			ambientTemp = 85 + Math.random() * 20; // 85-105°F
			systemPressure = 140 + Math.random() * 25; // 140-165 PSI
			flowRate = 2.5 + Math.random() * 1.0; // 2.5-3.5 bbl/min
			
			// Coriolis Measurements (Row 2)
			netVolume = 150 + Math.random() * 30; // 150-180 BBL
			apiGravity = 35 + Math.random() * 10; // 35-45° API
			waterCut = 0.1 + Math.random() * 1.9; // 0.1-2.0%
			massFlowRate = 2.8 + Math.random() * 1.4; // 2.8-4.2 BBL/min
			
			// Safety & Pressure (Row 3)
			h2sLevels = Math.random() * 2.0; // 0-2.0 PPM
			tankerPressure = 140 + Math.random() * 20; // 140-160 PSI
			gasDetectionStatus = h2sLevels > 1.5 ? 'warning' : 'normal';
			pumpRpm = 1650 + Math.random() * 200; // 1650-1850 RPM
			
			// System Health (Row 4)
			dryDriveTemp = 175 + Math.random() * 25; // 175-200°F
			networkHealth = 95 + Math.random() * 5; // 95-100%
			activeAlerts = Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0;
			
			// Update current date for real-time calculations
			currentDate = new Date();
		}, 4000);
	});

	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	});

	// Derived metrics
	$: totalActiveVolume = $activeHauls.reduce((sum, haul) => sum + haul.initialVolume, 0);
	$: totalExpectedLoss = $activeHauls.reduce((sum, haul) => sum + haul.expectedLoss, 0);
	$: completedToday = browser ? $completedHauls.filter(haul => {
		const haulDate = haul.endTime || haul.startTime;
		return haulDate.toDateString() === currentDate.toDateString();
	}).length : 0;
	
	$: haulsByStatus = $activeHauls.reduce((counts, haul) => {
		counts[haul.status] = (counts[haul.status] || 0) + 1;
		return counts;
	}, {} as Record<string, number>);

	// Driver workflow state
	let selectedJob: any = null;
	let showJobModal = false;
	let showMapView = false;
	let showTransitView = false;
	let inspectionCompleted = false;

	function handleJobSelected(event: CustomEvent) {
		selectedJob = event.detail.job;
		showJobModal = true;
	}

	function handleJobStart(event: CustomEvent) {
		selectedJob = event.detail.job;
		showJobModal = false;
		showMapView = true;
	}

	function handleDirectNavigation(event: CustomEvent) {
		selectedJob = event.detail.job;
		showJobModal = false;
		showTransitView = true; // Go directly to navigation screen
	}

	function handleInspectionComplete(event: CustomEvent) {
		const inspectionData = event.detail.inspectionData;
		inspectionCompleted = true;
		console.log('Inspection completed:', inspectionData);
		// Switch to schedule tab after inspection
		driverTab = 'schedule';
		// Trigger post-submit scroll
		afterPreTripSubmit = true;
		activeNavSection = 'schedule';
		
		// Ensure scroll to top of schedule section
		setTimeout(() => {
			const scheduleElement = document.getElementById('schedule');
			if (scheduleElement) {
				scheduleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	}

	function handleExitMap() {
		showMapView = false;
		selectedJob = null;
	}

	function handleStartTransit(event: CustomEvent) {
		selectedJob = event.detail.job;
		showMapView = false;
		showTransitView = true;
	}

	function handleExitTransit() {
		showTransitView = false;
		selectedJob = null;
	}

	function handleNavigation(event: CustomEvent) {
		const section = event.detail.section;
		activeNavSection = section;
		
		// Map quick nav to driver tabs
		const navToTabMap: Record<string, string> = {
			'pretrip': 'pre-trip',
			'schedule': 'schedule',
			'routes': 'schedule', // Routes shown in schedule tab
			'performance': 'performance'
		};
		
		const mappedTab = navToTabMap[section];
		if (mappedTab) {
			driverTab = mappedTab;
		}
	}
</script>

<!-- Dashboard Top Anchor for Post-Submit Scroll -->
<div id="dashboard-top"></div>

<!-- Post-Submit Scroll Handler -->
<StartFromPreTrip {afterPreTripSubmit} targetSection="dashboard-top" />

<!-- Header -->
<div class="text-center mb-4 sm:mb-6 mobile-sticky px-4">
	<div class="flex justify-center mb-2 sm:mb-3">
		<DryDriveLogo size={$isRoleView ? 140 : 180} />
	</div>
	<h1 class="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-oil-black mb-2 px-2">Oil Transport Operations Center</h1>
	<p class="text-xs sm:text-sm text-oil-gray px-2">Real-time operations monitoring and fleet management platform</p>
</div>

<!-- Role Selector -->
<div class="flex justify-center mb-4 sm:mb-6 lg:mb-8 px-4">
	<RoleSelector />
</div>

<!-- Role-Based Dashboard Content -->
{#if $isRoleView}
	<!-- Role-Specific Header -->
	<div class="glass-card p-4 sm:p-6 mb-6 sm:mb-8 text-center" style="border-color: {$selectedRole.colorScheme.primary};">
		<div class="flex items-center justify-center gap-4 mb-4">
			<span class="text-4xl">{$selectedRole.icon}</span>
			<div>
				<h2 class="text-2xl sm:text-3xl font-bold" style="color: {$selectedRole.colorScheme.primary};">{$selectedRole.name} Dashboard</h2>
				<p class="text-sm sm:text-base text-oil-gray">{$selectedRole.description}</p>
			</div>
		</div>
		<div class="focus-banner" style="background: linear-gradient(135deg, {$selectedRole.colorScheme.primary}15 0%, {$selectedRole.colorScheme.secondary}10 100%); border-color: {$selectedRole.colorScheme.primary}30;">
			<span class="font-semibold" style="color: {$selectedRole.colorScheme.primary};">Focus:</span>
			<span class="text-oil-black">{$selectedRole.focus}</span>
		</div>
	</div>

	<!-- Role-Specific Content -->
	{#if $selectedRole.id === 'executive'}
		<!-- Executive Dashboard with Navigation -->
		<div class="executive-dashboard">
			<!-- Executive Navigation -->
			<div class="role-navigation mb-4 sm:mb-6">
				<div class="nav-tabs mobile-grid">
					{#each executiveTabs as tab}
						<button 
							class="nav-tab tap-target {executiveTab === tab.id ? 'active' : ''}"
							style="--primary-color: {$selectedRole.colorScheme.primary}"
							on:click={() => executiveTab = tab.id}
						>
							<span class="tab-icon">{tab.icon}</span>
							<span class="tab-label">{tab.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Executive Tab Content -->
			{#if executiveTab === 'overview'}
				<div class="tab-content">
					<div class="mobile-grid">
						{#each $selectedRole.layout.heroMetrics as metricId}
							{@const metric = $selectedRole.metrics.find(m => m.id === metricId)}
							{#if metric}
								<RoleMetricCard {metric} colorScheme={$selectedRole.colorScheme} />
							{/if}
						{/each}
					</div>
					<div class="charts-grid">
						<div class="chart-container">
							<RealtimeChart 
								title="Company Performance Overview"
								color={$selectedRole.colorScheme.primary}
								height={400}
								unit="$M"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Regional Revenue Distribution"
								color={$selectedRole.colorScheme.secondary}
								height={400}
								unit="%"
								animated={true}
							/>
						</div>
					</div>
				</div>
			{:else if executiveTab === 'financial'}
				<div class="tab-content">
					<div class="financial-metrics grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
					<div class="financial-charts grid grid-cols-1 lg:grid-cols-2 gap-6">
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
			{:else if executiveTab === 'operations'}
				<div class="tab-content">
					<div class="operations-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
			{:else if executiveTab === 'strategic'}
				<div class="tab-content">
					<div class="strategic-metrics grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

	{:else if $selectedRole.id === 'driver'}
		<!-- Driver Dashboard with Navigation -->
		<div class="driver-dashboard">
			<!-- Quick Navigation Bar (Sticky) -->
			<QuickNavBar 
				activeSection={activeNavSection} 
				on:navigate={handleNavigation}
			/>

			<!-- Driver Dashboard Content Container with proper scrolling -->
			<div class="driver-content-container">
				<!-- Pre-Trip Section -->
				<section id="pretrip" class="driver-section" class:section-visible={driverTab === 'pre-trip'}>
					<div class="section-header">
						<h2 class="section-title">Pre-Trip Inspection</h2>
						<button class="back-to-overview-btn" on:click={() => { driverTab = 'overview'; activeNavSection = 'overview'; }}>
							← Back to Overview
						</button>
					</div>
					<div class="tab-content scrollable-content">
						<PreTripInspection on:inspection-complete={handleInspectionComplete} />
					</div>
				</section>
				
				<!-- Schedule Section -->
				<section id="schedule" class="driver-section" class:section-visible={driverTab === 'schedule'}>
					<div class="section-header">
						<h2 class="section-title">Schedule & Routes</h2>
						<button class="back-to-overview-btn" on:click={() => { driverTab = 'overview'; activeNavSection = 'overview'; }}>
							← Back to Overview
						</button>
					</div>
					<div class="tab-content scrollable-content">
						<DriverSchedule on:job-selected={handleJobSelected} />
					</div>
				</section>
				
				<!-- Routes Section (redirect to schedule) -->
				<section id="routes" class="driver-section" class:section-visible={activeNavSection === 'routes' && driverTab === 'schedule'}>
					<div class="section-header">
						<h2 class="section-title">Routes</h2>
						<button class="back-to-overview-btn" on:click={() => { driverTab = 'overview'; activeNavSection = 'overview'; }}>
							← Back to Overview
						</button>
					</div>
					<div class="tab-content scrollable-content">
						<!-- Routes are part of schedule view -->
						<div class="routes-redirect">
							<p>Routes are displayed in the Schedule section.</p>
							<button class="schedule-redirect-btn" on:click={() => { driverTab = 'schedule'; activeNavSection = 'schedule'; }}>
								View Schedule
							</button>
						</div>
					</div>
				</section>
				
				<!-- Performance Section -->
				<section id="performance" class="driver-section" class:section-visible={driverTab === 'performance'}>
					<div class="section-header">
						<h2 class="section-title">My Performance</h2>
						<button class="back-to-overview-btn" on:click={() => { driverTab = 'overview'; activeNavSection = 'overview'; }}>
							← Back to Overview
						</button>
					</div>
					<div class="tab-content scrollable-content">
						<div class="driver-metrics grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
							<MetricCard 
								title="Safety Score" 
								value="98.5" 
								unit="%" 
								icon="🛡️" 
								status="normal"
								trend="up"
								trendValue="+1.2%"
								color="emerald"
							/>
							<MetricCard 
								title="Efficiency Rating" 
								value="94.2" 
								unit="%" 
								icon="⚡" 
								status="normal"
								trend="up"
								trendValue="+3.1%"
								color="blue"
							/>
							<MetricCard 
								title="Hauls This Week" 
								value="23" 
								unit="" 
								icon="📦" 
								status="normal"
								trend="up"
								trendValue="+2"
								color="orange"
							/>
							<MetricCard 
								title="On-Time Delivery" 
								value="96.8" 
								unit="%" 
								icon="⏰" 
								status="normal"
								trend="stable"
								trendValue="+0.5%"
								color="emerald"
							/>
						</div>
						
						<!-- Smart Cal Chart with new consistency breakdown -->
						<div class="mb-8">
							<h3 class="text-lg font-semibold mb-4">Smart Calibration Overview</h3>
							<SmartCalChart size="medium" showLabels={true} />
						</div>
						
						<!-- ROI Justification Card -->
						<div class="mb-8">
							<ROIJustificationCard />
						</div>
					</div>
				</section>

				<!-- Driver Overview Section (default) -->
				<section id="overview" class="driver-section" class:section-visible={driverTab === 'overview' || (!driverTab)}>
					<div class="section-header">
						<h2 class="section-title">Driver Dashboard Overview</h2>
					</div>
					<div class="tab-content scrollable-content">
						<div class="overview-cards grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<div class="overview-card" on:click={() => { driverTab = 'pre-trip'; activeNavSection = 'pretrip'; }}>
								<div class="card-icon">✅</div>
								<div class="card-content">
									<h3>Pre-Trip Inspection</h3>
									<p>Complete your daily inspection</p>
								</div>
							</div>
							<div class="overview-card" on:click={() => { driverTab = 'schedule'; activeNavSection = 'schedule'; }}>
								<div class="card-icon">📅</div>
								<div class="card-content">
									<h3>Schedule & Routes</h3>
									<p>View today's hauls and routes</p>
								</div>
							</div>
							<div class="overview-card" on:click={() => { driverTab = 'performance'; activeNavSection = 'performance'; }}>
								<div class="card-icon">📊</div>
								<div class="card-content">
									<h3>Performance</h3>
									<p>Track your metrics and stats</p>
								</div>
							</div>
							<div class="overview-card" on:click={() => { driverTab = 'safety'; activeNavSection = 'safety'; }}>
								<div class="card-icon">🛡️</div>
								<div class="card-content">
									<h3>Safety Record</h3>
									<p>View safety stats and training</p>
								</div>
							</div>
						</div>

						<!-- Additional quick metrics on overview -->
						<div class="quick-metrics grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<MetricCard 
								title="Today's Progress" 
								value="3/5" 
								unit="hauls" 
								icon="🚛" 
								status="normal"
								trend="up"
								trendValue="+1"
								color="blue"
							/>
							<MetricCard 
								title="Current Status" 
								value="Available" 
								unit="" 
								icon="✅" 
								status="normal"
								trend="stable"
								trendValue="Ready"
								color="emerald"
							/>
							<MetricCard 
								title="Next Haul" 
								value="2:30 PM" 
								unit="" 
								icon="⏰" 
								status="normal"
								trend="stable"
								trendValue="Scheduled"
								color="orange"
							/>
						</div>
					</div>
				</section>

				<!-- Additional driver tabs content -->
				{#if driverTab === 'safety'}
					<section id="safety" class="driver-section section-visible">
						<div class="section-header">
							<h2 class="section-title">Safety Record</h2>
							<button class="back-to-overview-btn" on:click={() => { driverTab = 'overview'; activeNavSection = 'overview'; }}>
								← Back to Overview
							</button>
						</div>
						<div class="tab-content scrollable-content">
							<div class="safety-metrics grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
								<MetricCard 
									title="Days Without Incident" 
									value="247" 
									unit="days" 
									icon="🏆" 
									status="normal"
									trend="up"
									trendValue="+1"
									color="emerald"
								/>
								<MetricCard 
									title="Safety Training" 
									value="100" 
									unit="%" 
									icon="📚" 
									status="normal"
									trend="stable"
									trendValue="Current"
									color="blue"
								/>
								<MetricCard 
									title="Vehicle Inspections" 
									value="23/23" 
									unit="" 
									icon="🔍" 
									status="normal"
									trend="stable"
									trendValue="Perfect"
									color="emerald"
								/>
							</div>
						</div>
					</section>
				{:else if driverTab === 'earnings'}
					<section id="earnings" class="driver-section section-visible">
						<div class="section-header">
							<h2 class="section-title">Earnings & Bonuses</h2>
							<button class="back-to-overview-btn" on:click={() => { driverTab = 'overview'; activeNavSection = 'overview'; }}>
								← Back to Overview
							</button>
						</div>
						<div class="tab-content scrollable-content">
							<div class="earnings-metrics grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
								<MetricCard 
									title="This Week" 
									value="$2,847" 
									unit="" 
									icon="💰" 
									status="normal"
									trend="up"
									trendValue="+$312"
									color="emerald"
								/>
								<MetricCard 
									title="Safety Bonus" 
									value="$500" 
									unit="" 
									icon="🏆" 
									status="normal"
									trend="stable"
									trendValue="Earned"
									color="blue"
								/>
								<MetricCard 
									title="Efficiency Bonus" 
									value="$275" 
									unit="" 
									icon="⚡" 
									status="normal"
									trend="up"
									trendValue="+$75"
									color="orange"
								/>
							</div>
						</div>
					</section>
				{/if}
			</div>
		</div>

	{:else if $selectedRole.id === 'dispatch'}
		<!-- Dispatch Overview Header -->
		<div class="dispatch-header">
			<div class="overview-cards grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<MetricCard 
					title="Active Hauls" 
					value="47" 
					unit="" 
					icon="🚛" 
					status="normal"
					trend="up"
					trendValue="+3"
					color="blue"
				/>
				<MetricCard 
					title="Pending Dispatch" 
					value="12" 
					unit="" 
					icon="⏳" 
					status="warning"
					trend="up"
					trendValue="+2"
					color="orange"
				/>
				<MetricCard 
					title="Fleet Utilization" 
					value="89.2" 
					unit="%" 
					icon="📊" 
					status="normal"
					trend="up"
					trendValue="+1.3%"
					color="green"
				/>
				<MetricCard 
					title="Avg ETA Accuracy" 
					value="94.7" 
					unit="%" 
					icon="🎯" 
					status="normal"
					trend="up"
					trendValue="+0.8%"
					color="purple"
				/>
			</div>
		</div>
		
		<!-- God View Analytics Access -->
		<div class="analytics-access mb-6">
			<button 
				class="analytics-btn {dispatchTab === 'analytics' ? 'analytics-active' : ''}"
				style="--primary-color: {$selectedRole.colorScheme.primary}"
				on:click={() => dispatchTab = dispatchTab === 'analytics' ? 'active-hauls' : 'analytics'}
			>
				<span class="analytics-icon">🔥</span>
				<span class="analytics-label">
					{dispatchTab === 'analytics' ? 'Close God View Analytics' : 'Open God View Analytics'}
				</span>
			</button>
		</div>

		<!-- Analytics View -->
		{#if dispatchTab === 'analytics'}
			<div class="analytics-container mb-8">
				<div class="analytics-header mb-6">
					<h2>God View Analytics</h2>
					<p>Hierarchical fleet intelligence: Fleet → Yard → Truck → Haul Tickets</p>
				</div>
				
				<!-- Full DispatchHub Analytics -->
				{#await import('$lib/components/dispatch/DispatchHub.svelte') then module}
					<svelte:component this={module.default} />
				{:catch error}
					<div class="error-state">
						<p>Error loading analytics: {error.message}</p>
						<p>Please refresh the page to try again.</p>
					</div>
				{/await}
			</div>
		{/if}
		
		<!-- Wrap Active Haul Ticket in conditional -->
		{#if dispatchTab !== 'analytics'} 		<!-- Active Haul Ticket -->
		<div class="haul-ticket-section mb-6 sm:mb-8">
			<div class="section-header">
				<h2>Dispatch Haul Management</h2>
				<div class="haul-controls">
					<button class="haul-nav-btn tap-target">
						<ChevronLeft size={16} />
						<span class="mobile-hide">Previous</span>
						<span class="mobile-show">Prev</span>
					</button>
					<span class="haul-counter">1 of 47</span>
					<button class="haul-nav-btn tap-target">
						<span class="mobile-hide">Next</span>
						<span class="mobile-show">Next</span>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
			
			<div class="haul-ticket-container">
				<div class="ticket-header">
					<div class="ticket-info">
						<h3>Haul #HL-2024-001547</h3>
						<span class="ticket-status in-transit">IN TRANSIT</span>
						<small>Driver: Mike Johnson</small>
					</div>
					<div class="ticket-time">
						<span>Started: 8:30 AM</span>
						<span>ETA: 4:15 PM</span>
						<span>Progress: 67%</span>
					</div>
				</div>
				
				<div class="ticket-content">
					<!-- Route Information -->
					<div class="ticket-section">
						<h4>Route & Status</h4>
						<div class="route-info">
							<div class="location">
								<strong>From:</strong> Permian Basin Site A<br>
								<small>Contact: John Smith - (432) 555-0123</small>
							</div>
							<div class="route-arrow">→</div>
							<div class="location">
								<strong>To:</strong> Houston Refinery Terminal<br>
								<small>Contact: Maria Rodriguez - (713) 555-0456</small>
							</div>
						</div>
					</div>
					
					<!-- Volume & Temperature -->
					<div class="ticket-metrics">
						<div class="metric-item">
							<label>Loaded Volume</label>
							<span class="metric-value">27,722.1 BBL</span>
						</div>
						<div class="metric-item">
							<label>Current Temp</label>
							<span class="metric-value">82.1°F</span>
						</div>
						<div class="metric-item">
							<label>Expected Loss</label>
							<span class="metric-value">19.2 BBL</span>
						</div>
						<div class="metric-item">
							<label>Current Location</label>
							<span class="metric-value">Austin, TX</span>
						</div>
					</div>
					
					<!-- Coriolis & Financial -->
					<div class="ticket-section">
						<h4>Measurements & Billing</h4>
						<div class="measurement-financial">
							<div class="measurement-data">
								<span><strong>Onload Meter:</strong> COR-PB-001</span>
								<span><strong>Gross Volume:</strong> 27,845.6 BBL</span>
								<span><strong>Net Volume:</strong> 27,722.1 BBL</span>
							</div>
							<div class="financial-data">
								<span><strong>Rate:</strong> $485.50</span>
								<span><strong>Fuel Surcharge:</strong> $23.75</span>
								<span><strong>Total:</strong> $509.25</span>
							</div>
						</div>
					</div>
					
					<!-- Documentation -->
					<div class="ticket-section">
						<h4>Documentation</h4>
						<div class="document-status">
							<div class="doc-item completed">
								<CheckCircle size={14} />
								<span>BOL-2024-001547</span>
							</div>
							<div class="doc-item completed">
								<CheckCircle size={14} />
								<span>MAN-2024-001547</span>
							</div>
							<div class="doc-item completed">
								<CheckCircle size={14} />
								<span>PERM-TX-2024-0456</span>
							</div>
						</div>
					</div>
				</div>
				
				<div class="ticket-actions">
					<button class="action-btn primary tap-target">Reassign Driver</button>
					<button class="action-btn secondary tap-target">View Full Details</button>
					<button class="action-btn secondary tap-target">Contact Driver</button>
					<button class="action-btn danger tap-target">Emergency Stop</button>
				</div>
			</div>
		</div>
		{/if}

	{:else if $selectedRole.id === 'yard-manager'}
		<!-- Yard Manager Dashboard with Navigation -->
		<div class="yard-manager-dashboard">
			<!-- Yard Manager Navigation -->
			<div class="role-navigation mb-6">
				<div class="nav-tabs">
					{#each yardTabs as tab}
						<button 
							class="nav-tab {yardTab === tab.id ? 'active' : ''}"
							style="--primary-color: {$selectedRole.colorScheme.primary}"
							on:click={() => yardTab = tab.id}
						>
							<span class="tab-icon">{tab.icon}</span>
							<span class="tab-label">{tab.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Yard Manager Tab Content -->
			{#if yardTab === 'truck-overview'}
				<div class="tab-content">
					<div class="fleet-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<MetricCard 
							title="Total Fleet" 
							value="24" 
							unit="trucks" 
							icon="🚛" 
							status="normal"
							trend="stable"
							trendValue="+2"
							color="blue"
						/>
						<MetricCard 
							title="Active Today" 
							value="18" 
							unit="" 
							icon="✅" 
							status="normal"
							trend="up"
							trendValue="+3"
							color="emerald"
						/>
						<MetricCard 
							title="In Maintenance" 
							value="3" 
							unit="" 
							icon="🔧" 
							status="warning"
							trend="down"
							trendValue="-1"
							color="amber"
						/>
						<MetricCard 
							title="Utilization Rate" 
							value="87.5" 
							unit="%" 
							icon="📊" 
							status="normal"
							trend="up"
							trendValue="+4.2%"
							color="emerald"
						/>
					</div>

					<!-- Fleet Performance Charts -->
					<div class="fleet-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
						<div class="chart-container">
							<RealtimeChart 
								title="Fleet Utilization Trends"
								color="#7CB342"
								height={400}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Fuel Efficiency by Truck"
								color="#558B2F"
								height={400}
								unit=" MPG"
								animated={true}
							/>
						</div>
					</div>

					<!-- Fleet Status Breakdown -->
					<div class="fleet-status glass-card p-6">
						<h3 class="text-xl font-bold mb-4">Fleet Status Breakdown</h3>
						<div class="status-grid grid grid-cols-1 md:grid-cols-3 gap-6">
							<div class="status-category">
								<h4 class="font-semibold text-emerald-600 mb-3">Active (18)</h4>
								<div class="truck-list space-y-2">
									{#each $trucks.slice(0, 6) as truck}
										<div class="truck-item flex justify-between items-center p-2 bg-emerald-50 rounded">
											<span class="font-medium">{truck.id}</span>
											<span class="text-sm text-emerald-600">On Route</span>
										</div>
									{/each}
								</div>
							</div>
							<div class="status-category">
								<h4 class="font-semibold text-amber-600 mb-3">Maintenance (3)</h4>
								<div class="truck-list space-y-2">
									{#each $trucks.slice(6, 9) as truck}
										<div class="truck-item flex justify-between items-center p-2 bg-amber-50 rounded">
											<span class="font-medium">{truck.id}</span>
											<span class="text-sm text-amber-600">Service</span>
										</div>
									{/each}
								</div>
							</div>
							<div class="status-category">
								<h4 class="font-semibold text-gray-600 mb-3">Available (3)</h4>
								<div class="truck-list space-y-2">
									{#each $trucks.slice(9, 12) as truck}
										<div class="truck-item flex justify-between items-center p-2 bg-gray-50 rounded">
											<span class="font-medium">{truck.id}</span>
											<span class="text-sm text-gray-600">Ready</span>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>

			{:else if yardTab === 'truck-individual'}
				<div class="tab-content">
					<div class="individual-trucks">
						<div class="trucks-header flex justify-between items-center mb-6">
							<h3 class="text-xl font-bold">Individual Truck Management</h3>
							<div class="truck-filters flex gap-4">
								<select class="filter-select">
									<option>All Trucks</option>
									<option>Active</option>
									<option>Maintenance</option>
									<option>Available</option>
								</select>
								<select class="filter-select">
									<option>Sort by ID</option>
									<option>Sort by Efficiency</option>
									<option>Sort by Mileage</option>
									<option>Sort by Last Service</option>
								</select>
							</div>
						</div>

						<div class="trucks-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
							{#each $trucks.slice(0, 12) as truck, index}
								<div class="truck-detail-card glass-card p-6">
									<div class="truck-header flex justify-between items-start mb-4">
										<div>
											<h4 class="text-lg font-bold text-oil-black">{truck.id}</h4>
											<p class="text-sm text-oil-gray">{truck.model} ({truck.year})</p>
										</div>
										<span class="status-badge status-{index < 6 ? 'active' : index < 9 ? 'maintenance' : 'available'}">
											{index < 6 ? 'Active' : index < 9 ? 'Maintenance' : 'Available'}
										</span>
									</div>

									<div class="truck-metrics grid grid-cols-2 gap-4 mb-4">
										<div class="metric-item">
											<span class="metric-label">Capacity</span>
											<span class="metric-value">{truck.capacity.toLocaleString()} gal</span>
										</div>
										<div class="metric-item">
											<span class="metric-label">Efficiency</span>
											<span class="metric-value">{truck.averageEfficiency.toFixed(1)}%</span>
										</div>
										<div class="metric-item">
											<span class="metric-label">Mileage</span>
											<span class="metric-value">{(45000 + Math.random() * 50000).toLocaleString()} mi</span>
										</div>
										<div class="metric-item">
											<span class="metric-label">Fuel Level</span>
											<span class="metric-value">{(65 + Math.random() * 30).toFixed(0)}%</span>
										</div>
									</div>

									<div class="truck-details space-y-2 mb-4">
										<div class="detail-row flex justify-between">
											<span class="text-oil-gray text-sm">Current Driver:</span>
											<span class="text-oil-black text-sm font-medium">
												{index < 6 ? $drivers[index % $drivers.length].name : 'Unassigned'}
											</span>
										</div>
										<div class="detail-row flex justify-between">
											<span class="text-oil-gray text-sm">Last Service:</span>
											<span class="text-oil-black text-sm font-medium">{Math.floor(Math.random() * 30) + 1} days ago</span>
										</div>
										<div class="detail-row flex justify-between">
											<span class="text-oil-gray text-sm">Next Service:</span>
											<span class="text-oil-black text-sm font-medium">{Math.floor(Math.random() * 45) + 15} days</span>
										</div>
									</div>

									<div class="truck-actions flex gap-2">
										<button class="btn-sm bg-blue-500 text-white px-3 py-1 rounded-lg text-xs">Track</button>
										<button class="btn-sm bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs">Assign</button>
										<button class="btn-sm bg-amber-500 text-white px-3 py-1 rounded-lg text-xs">Service</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

			{:else if yardTab === 'driver-overview'}
				<div class="tab-content">
					<div class="driver-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<MetricCard 
							title="Total Drivers" 
							value="28" 
							unit="" 
							icon="👥" 
							status="normal"
							trend="up"
							trendValue="+2"
							color="blue"
						/>
						<MetricCard 
							title="Active Today" 
							value="22" 
							unit="" 
							icon="🚛" 
							status="normal"
							trend="up"
							trendValue="+4"
							color="emerald"
						/>
						<MetricCard 
							title="Avg Safety Score" 
							value="96.8" 
							unit="%" 
							icon="🛡️" 
							status="normal"
							trend="up"
							trendValue="+1.2%"
							color="emerald"
						/>
						<MetricCard 
							title="Avg Efficiency" 
							value="94.3" 
							unit="%" 
							icon="⚡" 
							status="normal"
							trend="up"
							trendValue="+2.1%"
							color="blue"
						/>
					</div>

					<!-- Driver Performance Charts -->
					<div class="driver-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
						<div class="chart-container">
							<RealtimeChart 
								title="Driver Safety Scores Distribution"
								color="#10B981"
								height={400}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Driver Efficiency Trends"
								color="#3B82F6"
								height={400}
								unit="%"
								animated={true}
							/>
						</div>
					</div>
					
					<!-- Active Haul Ticket -->
					<div class="haul-ticket-section mb-8">
						<div class="section-header">
							<h2>Current Haul Ticket</h2>
							<div class="haul-controls">
								<button class="haul-nav-btn">
									<ChevronLeft size={16} />
									Previous
								</button>
								<span class="haul-counter">1 of 3</span>
								<button class="haul-nav-btn">
									Next
									<ChevronRight size={16} />
								</button>
							</div>
						</div>
						
						<div class="haul-ticket-container">
							<div class="ticket-header">
								<div class="ticket-info">
									<h3>Haul #HL-2024-001547</h3>
									<span class="ticket-status in-transit">IN TRANSIT</span>
								</div>
								<div class="ticket-time">
									<span>Started: 8:30 AM</span>
									<span>ETA: 4:15 PM</span>
								</div>
							</div>
							
							<div class="ticket-content">
								<!-- Route Information -->
								<div class="ticket-section">
									<h4>Route</h4>
									<div class="route-info">
										<div class="location">
											<strong>From:</strong> Permian Basin Site A<br>
											<small>1247 County Road 1250, Midland, TX</small>
										</div>
										<div class="route-arrow">→</div>
										<div class="location">
											<strong>To:</strong> Houston Refinery Terminal<br>
											<small>8901 Ship Channel Blvd, Houston, TX</small>
										</div>
									</div>
								</div>
								
								<!-- Volume & Temperature -->
								<div class="ticket-metrics">
									<div class="metric-item">
										<label>Loaded Volume</label>
										<span class="metric-value">27,722.1 BBL</span>
									</div>
									<div class="metric-item">
										<label>Current Temp</label>
										<span class="metric-value">82.1°F</span>
									</div>
									<div class="metric-item">
										<label>Expected Loss</label>
										<span class="metric-value">19.2 BBL</span>
									</div>
									<div class="metric-item">
										<label>H₂S Level</label>
										<span class="metric-value safe">0.8 PPM</span>
									</div>
								</div>
								
								<!-- Product Info -->
								<div class="ticket-section">
									<h4>Product</h4>
									<div class="product-details">
										<span><strong>Type:</strong> Crude Oil (WTI Sweet)</span>
										<span><strong>API Gravity:</strong> 38.5°</span>
										<span><strong>Density:</strong> 0.864 g/cm³</span>
									</div>
								</div>
								
								<!-- Equipment -->
								<div class="ticket-section">
									<h4>Equipment</h4>
									<div class="equipment-details">
										<div class="equipment-item">
											<span><strong>Truck:</strong> Unit 892 (TX-TRK-892)</span>
											<span><strong>Trailer:</strong> Trailer 445 (TX-TRL-445)</span>
										</div>
									</div>
								</div>
								
								<!-- Safety Status -->
								<div class="ticket-section">
									<h4>Safety Status</h4>
									<div class="safety-indicators">
										<div class="safety-item completed">
											<CheckCircle size={16} />
											<span>Pre-trip Inspection</span>
										</div>
										<div class="safety-item completed">
											<CheckCircle size={16} />
											<span>Gas Detection</span>
										</div>
										<div class="safety-item completed">
											<CheckCircle size={16} />
											<span>Documentation</span>
										</div>
									</div>
								</div>
							</div>
							
							<div class="ticket-actions">
								<button class="action-btn primary">Update Status</button>
								<button class="action-btn secondary">View Full Details</button>
								<button class="action-btn secondary">Report Issue</button>
							</div>
						</div>
					</div>
				</div>

			{:else if yardTab === 'driver-individual'}
				<div class="tab-content">
					<div class="individual-drivers">
						<div class="drivers-header flex justify-between items-center mb-6">
							<h3 class="text-xl font-bold">Individual Driver Management</h3>
							<div class="driver-filters flex gap-4">
								<select class="filter-select">
									<option>All Drivers</option>
									<option>Active</option>
									<option>Off Duty</option>
									<option>On Break</option>
								</select>
								<select class="filter-select">
									<option>Sort by Name</option>
									<option>Sort by Safety Score</option>
									<option>Sort by Efficiency</option>
									<option>Sort by Experience</option>
								</select>
							</div>
						</div>

						<div class="drivers-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
							{#each $drivers.slice(0, 12) as driver, index}
								<div class="driver-detail-card glass-card p-6">
									<div class="driver-header flex justify-between items-start mb-4">
										<div>
											<h4 class="text-lg font-bold text-oil-black">{driver.name}</h4>
											<p class="text-sm text-oil-gray">{driver.experience} years experience</p>
										</div>
										<span class="status-badge status-{index < 8 ? 'active' : 'available'}">
											{index < 8 ? 'Active' : 'Available'}
										</span>
									</div>

									<div class="driver-metrics grid grid-cols-2 gap-4 mb-4">
										<div class="metric-item">
											<span class="metric-label">Safety Score</span>
											<span class="metric-value">{(95 + Math.random() * 5).toFixed(1)}%</span>
										</div>
										<div class="metric-item">
											<span class="metric-label">Efficiency</span>
											<span class="metric-value">{driver.averageEfficiency.toFixed(1)}%</span>
										</div>
										<div class="metric-item">
											<span class="metric-label">Total Hauls</span>
											<span class="metric-value">{driver.totalHauls.toLocaleString()}</span>
										</div>
										<div class="metric-item">
											<span class="metric-label">This Week</span>
											<span class="metric-value">{Math.floor(Math.random() * 15) + 10}</span>
										</div>
									</div>

									<div class="driver-details space-y-2 mb-4">
										<div class="detail-row flex justify-between">
											<span class="text-oil-gray text-sm">Current Truck:</span>
											<span class="text-oil-black text-sm font-medium">
												{index < 8 ? $trucks[index % $trucks.length].id : 'Unassigned'}
											</span>
										</div>
										<div class="detail-row flex justify-between">
											<span class="text-oil-gray text-sm">Hours Today:</span>
											<span class="text-oil-black text-sm font-medium">{(Math.random() * 8 + 2).toFixed(1)} hrs</span>
										</div>
										<div class="detail-row flex justify-between">
											<span class="text-oil-gray text-sm">Last Training:</span>
											<span class="text-oil-black text-sm font-medium">{Math.floor(Math.random() * 90) + 1} days ago</span>
										</div>
									</div>

									<div class="driver-actions flex gap-2">
										<button class="btn-sm bg-blue-500 text-white px-3 py-1 rounded-lg text-xs">Schedule</button>
										<button class="btn-sm bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs">Assign</button>
										<button class="btn-sm bg-purple-500 text-white px-3 py-1 rounded-lg text-xs">Training</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

			{:else if yardTab === 'yard-operations'}
				<div class="tab-content">
					<div class="yard-operations-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<MetricCard 
							title="Daily Throughput" 
							value="2,847" 
							unit="BBL" 
							icon="🛢️" 
							status="normal"
							trend="up"
							trendValue="+312"
							color="orange"
						/>
						<MetricCard 
							title="Fleet Usage Rate" 
							value="87.5" 
							unit="%" 
							icon="🚛" 
							status="normal"
							trend="up"
							trendValue="+2.1%"
							color="emerald"
						/>
						<MetricCard 
							title="Loading Efficiency" 
							value="94.7" 
							unit="%" 
							icon="📊" 
							status="normal"
							trend="up"
							trendValue="+2.1%"
							color="blue"
						/>
						<MetricCard 
							title="Safety Incidents" 
							value="0" 
							unit="today" 
							icon="🛡️" 
							status="normal"
							trend="stable"
							trendValue="247 days"
							color="emerald"
						/>
					</div>

					<!-- Yard Operations Details -->
					<div class="operations-details grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div class="loading-bays glass-card p-6">
							<h3 class="text-xl font-bold mb-4">Loading Bay Status</h3>
							<div class="bays-grid grid grid-cols-2 gap-4">
								{#each Array(6) as _, index}
									<div class="bay-status p-4 rounded-lg {index < 4 ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-100 border-gray-300'} border">
										<div class="flex justify-between items-center">
											<span class="font-semibold">Bay {index + 1}</span>
											<span class="text-sm {index < 4 ? 'text-emerald-600' : 'text-gray-600'}">
												{index < 4 ? 'Loading' : 'Available'}
											</span>
										</div>
										{#if index < 4}
											<div class="mt-2 text-sm text-emerald-700">
												Truck: T-{200 + index}<br>
												Progress: {75 + Math.random() * 20}%
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>

						<div class="yard-schedule glass-card p-6">
							<h3 class="text-xl font-bold mb-4">Today's Schedule</h3>
							<div class="schedule-timeline space-y-3">
								{#each [
									{ time: '06:00', event: 'Shift Start - 8 drivers', status: 'completed' },
									{ time: '08:30', event: 'Peak Loading Period', status: 'in-progress' },
									{ time: '12:00', event: 'Lunch Break Rotation', status: 'scheduled' },
									{ time: '14:00', event: 'Maintenance Window', status: 'scheduled' },
									{ time: '18:00', event: 'Evening Shift Handover', status: 'scheduled' }
								] as item}
									<div class="timeline-item flex items-center gap-4">
										<div class="time-badge-small">
											<span class="font-mono text-xs">{item.time}</span>
										</div>
										<div class="flex-1">
											<p class="font-medium text-sm">{item.event}</p>
										</div>
										<span class="status-badge-small status-{item.status}">
											{item.status.replace('-', ' ')}
										</span>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

			{:else if yardTab === 'maintenance'}
				<div class="tab-content">
					<div class="maintenance-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<MetricCard 
							title="Scheduled Today" 
							value="3" 
							unit="trucks" 
							icon="🔧" 
							status="normal"
							trend="stable"
							trendValue="On Track"
							color="blue"
						/>
						<MetricCard 
							title="Overdue Services" 
							value="1" 
							unit="" 
							icon="⚠️" 
							status="warning"
							trend="down"
							trendValue="-2"
							color="amber"
						/>
						<MetricCard 
							title="Parts Inventory" 
							value="94" 
							unit="%" 
							icon="📦" 
							status="normal"
							trend="stable"
							trendValue="+2%"
							color="emerald"
						/>
						<MetricCard 
							title="Avg Downtime" 
							value="4.2" 
							unit="hrs" 
							icon="⏱️" 
							status="normal"
							trend="down"
							trendValue="-0.8"
							color="emerald"
						/>
					</div>

					<!-- Maintenance Schedule -->
					<div class="maintenance-details grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div class="maintenance-schedule glass-card p-6">
							<h3 class="text-xl font-bold mb-4">Maintenance Schedule</h3>
							<div class="schedule-list space-y-4">
								{#each [
									{ truck: 'T-205', type: 'Oil Change', scheduled: '09:00', duration: '2 hrs', status: 'in-progress' },
									{ truck: 'T-212', type: 'Brake Inspection', scheduled: '11:00', duration: '3 hrs', status: 'scheduled' },
									{ truck: 'T-198', type: 'Annual DOT', scheduled: '14:00', duration: '4 hrs', status: 'scheduled' },
									{ truck: 'T-223', type: 'Tire Rotation', scheduled: '16:00', duration: '1 hr', status: 'scheduled' }
								] as maintenance}
									<div class="maintenance-item p-4 bg-white/50 rounded-lg border">
										<div class="flex justify-between items-start mb-2">
											<div>
												<h4 class="font-semibold">{maintenance.truck}</h4>
												<p class="text-sm text-oil-gray">{maintenance.type}</p>
											</div>
											<span class="status-badge status-{maintenance.status}">
												{maintenance.status.replace('-', ' ')}
											</span>
										</div>
										<div class="maintenance-details grid grid-cols-2 gap-4 text-sm">
											<div>
												<span class="text-oil-gray">Scheduled:</span>
												<span class="font-medium">{maintenance.scheduled}</span>
											</div>
											<div>
												<span class="text-oil-gray">Duration:</span>
												<span class="font-medium">{maintenance.duration}</span>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<div class="parts-inventory glass-card p-6">
							<h3 class="text-xl font-bold mb-4">Parts Inventory</h3>
							<div class="inventory-list space-y-3">
								{#each [
									{ part: 'Engine Oil (5W-30)', stock: 24, min: 10, status: 'good' },
									{ part: 'Brake Pads', stock: 8, min: 6, status: 'good' },
									{ part: 'Air Filters', stock: 3, min: 5, status: 'low' },
									{ part: 'Hydraulic Fluid', stock: 15, min: 8, status: 'good' },
									{ part: 'Tires (Commercial)', stock: 12, min: 8, status: 'good' }
								] as item}
									<div class="inventory-item flex justify-between items-center p-3 bg-white/50 rounded-lg">
										<div>
											<h4 class="font-medium">{item.part}</h4>
											<p class="text-sm text-oil-gray">Min: {item.min} units</p>
										</div>
										<div class="text-right">
											<span class="font-bold {item.status === 'low' ? 'text-amber-600' : 'text-emerald-600'}">
												{item.stock}
											</span>
											<span class="text-sm text-oil-gray">units</span>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

	{:else if $selectedRole.id === 'regional-manager'}
		<!-- Regional Manager Dashboard with Navigation -->
		<div class="regional-manager-dashboard">
			<!-- Regional Manager Navigation -->
			<div class="role-navigation mb-6">
				<div class="nav-tabs">
					{#each regionalTabs as tab}
						<button 
							class="nav-tab {regionalTab === tab.id ? 'active' : ''}"
							style="--primary-color: {$selectedRole.colorScheme.primary}"
							on:click={() => regionalTab = tab.id}
						>
							<span class="tab-icon">{tab.icon}</span>
							<span class="tab-label">{tab.label}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Regional Manager Tab Content -->
			{#if regionalTab === 'yards-overview'}
				<div class="tab-content">
					<div class="regional-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<MetricCard 
							title="Total Yards" 
							value="12" 
							unit="" 
							icon="🏭" 
							status="normal"
							trend="up"
							trendValue="+1"
							color="blue"
						/>
						<MetricCard 
							title="Regional Efficiency" 
							value="91.8" 
							unit="%" 
							icon="📊" 
							status="normal"
							trend="up"
							trendValue="+3.2%"
							color="emerald"
						/>
						<MetricCard 
							title="Daily Volume" 
							value="34.2K" 
							unit="BBL" 
							icon="🛢️" 
							status="normal"
							trend="up"
							trendValue="+2.1K"
							color="orange"
						/>
						<MetricCard 
							title="Monthly Revenue" 
							value="$4.8M" 
							unit="" 
							icon="💰" 
							status="normal"
							trend="up"
							trendValue="+12.5%"
							color="emerald"
						/>
					</div>

					<!-- Yard Performance Rankings -->
					<div class="yard-rankings glass-card p-6 mb-8">
						<h3 class="text-xl font-bold mb-4">Yard Performance Rankings</h3>
						<div class="rankings-table">
							<div class="table-header grid grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg mb-2">
								<span class="font-medium text-oil-black">Rank</span>
								<span class="font-medium text-oil-black">Yard</span>
								<span class="font-medium text-oil-black">Efficiency</span>
								<span class="font-medium text-oil-black">Revenue</span>
								<span class="font-medium text-oil-black">Fleet Size</span>
								<span class="font-medium text-oil-black">Drivers</span>
								<span class="font-medium text-oil-black">Trend</span>
							</div>
							{#each [
								{ rank: 1, name: 'Permian Basin', efficiency: 94.2, revenue: '$485K', fleet: 24, drivers: 28, trend: 'up' },
								{ rank: 2, name: 'Eagle Ford', efficiency: 92.8, revenue: '$467K', fleet: 22, drivers: 26, trend: 'up' },
								{ rank: 3, name: 'Bakken North', efficiency: 91.5, revenue: '$423K', fleet: 19, drivers: 23, trend: 'stable' },
								{ rank: 4, name: 'Marcellus', efficiency: 90.1, revenue: '$398K', fleet: 16, drivers: 20, trend: 'down' },
								{ rank: 5, name: 'Haynesville', efficiency: 89.7, revenue: '$376K', fleet: 15, drivers: 18, trend: 'up' },
								{ rank: 6, name: 'Barnett', efficiency: 88.9, revenue: '$354K', fleet: 18, drivers: 22, trend: 'stable' }
							] as yard}
								<div class="table-row grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
									<span class="text-oil-black font-bold">#{yard.rank}</span>
									<span class="text-oil-black font-medium">{yard.name}</span>
									<span class="text-emerald-600 font-medium">{yard.efficiency}%</span>
									<span class="text-oil-black">{yard.revenue}</span>
									<span class="text-oil-gray">{yard.fleet} trucks</span>
									<span class="text-oil-gray">{yard.drivers} drivers</span>
									<span class="trend-indicator {yard.trend === 'up' ? 'text-emerald-600' : yard.trend === 'down' ? 'text-red-600' : 'text-gray-600'}">
										{yard.trend === 'up' ? '↗️' : yard.trend === 'down' ? '↘️' : '➡️'}
									</span>
								</div>
							{/each}
						</div>
					</div>

					<!-- Regional Performance Charts -->
					<div class="regional-charts grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div class="chart-container">
							<RealtimeChart 
								title="Cross-Yard Efficiency Comparison"
								color="#4CAF50"
								height={400}
								unit="%"
								animated={true}
							/>
						</div>
						<div class="chart-container">
							<RealtimeChart 
								title="Regional Revenue Trends"
								color="#9CCC65"
								height={400}
								unit="$K"
								animated={true}
							/>
						</div>
					</div>
				</div>

			{:else if regionalTab === 'fleet-regional'}
				<div class="tab-content">
					<div class="regional-fleet-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<MetricCard 
							title="Total Fleet" 
							value="247" 
							unit="trucks" 
							icon="🚛" 
							status="normal"
							trend="up"
							trendValue="+15"
							color="blue"
						/>
						<MetricCard 
							title="Active Today" 
							value="189" 
							unit="" 
							icon="✅" 
							status="normal"
							trend="up"
							trendValue="+12"
							color="emerald"
						/>
						<MetricCard 
							title="Avg Utilization" 
							value="87.3" 
							unit="%" 
							icon="📊" 
							status="normal"
							trend="up"
							trendValue="+4.2%"
							color="emerald"
						/>
						<MetricCard 
							title="Maintenance Rate" 
							value="8.9" 
							unit="%" 
							icon="🔧" 
							status="normal"
							trend="down"
							trendValue="-1.2%"
							color="emerald"
						/>
					</div>

					<!-- Fleet Distribution by Yard -->
					<div class="fleet-distribution glass-card p-6 mb-8">
						<h3 class="text-xl font-bold mb-4">Fleet Distribution by Yard</h3>
						<div class="distribution-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{#each [
								{ yard: 'Permian Basin', trucks: 24, active: 18, maintenance: 3, available: 3 },
								{ yard: 'Eagle Ford', trucks: 22, active: 17, maintenance: 2, available: 3 },
								{ yard: 'Bakken North', trucks: 19, active: 15, maintenance: 2, available: 2 },
								{ yard: 'Marcellus', trucks: 16, active: 12, maintenance: 2, available: 2 },
								{ yard: 'Haynesville', trucks: 15, active: 11, maintenance: 2, available: 2 },
								{ yard: 'Barnett', trucks: 18, active: 14, maintenance: 2, available: 2 }
							] as yard}
								<div class="yard-fleet-card p-4 bg-white/50 rounded-lg border">
									<h4 class="font-semibold mb-3">{yard.yard}</h4>
									<div class="fleet-stats space-y-2">
										<div class="stat-row flex justify-between">
											<span class="text-oil-gray">Total:</span>
											<span class="font-medium">{yard.trucks}</span>
										</div>
										<div class="stat-row flex justify-between">
											<span class="text-emerald-600">Active:</span>
											<span class="font-medium">{yard.active}</span>
										</div>
										<div class="stat-row flex justify-between">
											<span class="text-amber-600">Maintenance:</span>
											<span class="font-medium">{yard.maintenance}</span>
										</div>
										<div class="stat-row flex justify-between">
											<span class="text-gray-600">Available:</span>
											<span class="font-medium">{yard.available}</span>
										</div>
									</div>
									<div class="utilization-bar mt-3">
										<div class="bg-gray-200 rounded-full h-2">
											<div class="bg-emerald-500 h-2 rounded-full" style="width: {(yard.active / yard.trucks * 100)}%"></div>
										</div>
										<span class="text-xs text-oil-gray mt-1">{((yard.active / yard.trucks) * 100).toFixed(1)}% utilization</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

			{:else if regionalTab === 'driver-regional'}
				<div class="tab-content">
					<div class="regional-driver-summary grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<MetricCard 
							title="Total Drivers" 
							value="312" 
							unit="" 
							icon="👥" 
							status="normal"
							trend="up"
							trendValue="+18"
							color="blue"
						/>
						<MetricCard 
							title="Active Today" 
							value="247" 
							unit="" 
							icon="🚛" 
							status="normal"
							trend="up"
							trendValue="+15"
							color="emerald"
						/>
						<MetricCard 
							title="Avg Safety Score" 
							value="95.7" 
							unit="%" 
							icon="🛡️" 
							status="normal"
							trend="up"
							trendValue="+1.8%"
							color="emerald"
						/>
						<MetricCard 
							title="Training Compliance" 
							value="97.2" 
							unit="%" 
							icon="📚" 
							status="normal"
							trend="up"
							trendValue="+2.1%"
							color="blue"
						/>
					</div>

					<!-- Driver Distribution by Yard -->
					<div class="driver-distribution glass-card p-6 mb-8">
						<h3 class="text-xl font-bold mb-4">Driver Performance by Yard</h3>
						<div class="distribution-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{#each [
								{ yard: 'Permian Basin', drivers: 28, avgSafety: 96.8, avgEfficiency: 94.3, topPerformer: 'John Smith' },
								{ yard: 'Eagle Ford', drivers: 26, avgSafety: 95.9, avgEfficiency: 93.7, topPerformer: 'Mike Johnson' },
								{ yard: 'Bakken North', drivers: 23, avgSafety: 95.2, avgEfficiency: 92.8, topPerformer: 'Dave Wilson' },
								{ yard: 'Marcellus', drivers: 20, avgSafety: 94.8, avgEfficiency: 91.9, topPerformer: 'Tom Brown' },
								{ yard: 'Haynesville', drivers: 18, avgSafety: 94.5, avgEfficiency: 91.2, topPerformer: 'Steve Davis' },
								{ yard: 'Barnett', drivers: 22, avgSafety: 95.1, avgEfficiency: 92.5, topPerformer: 'Paul Miller' }
							] as yard}
								<div class="yard-driver-card p-4 bg-white/50 rounded-lg border">
									<h4 class="font-semibold mb-3">{yard.yard}</h4>
									<div class="driver-stats space-y-2">
										<div class="stat-row flex justify-between">
											<span class="text-oil-gray">Drivers:</span>
											<span class="font-medium">{yard.drivers}</span>
										</div>
										<div class="stat-row flex justify-between">
											<span class="text-emerald-600">Avg Safety:</span>
											<span class="font-medium">{yard.avgSafety}%</span>
										</div>
										<div class="stat-row flex justify-between">
											<span class="text-oil-black">Avg Efficiency:</span>
											<span class="font-medium">{yard.avgEfficiency}%</span>
										</div>
										<div class="stat-row flex justify-between">
											<span class="text-oil-gray">Top Performer:</span>
											<span class="font-medium text-sm">{yard.topPerformer}</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

			{:else}
				<!-- Other regional tabs with similar comprehensive content -->
				<div class="tab-content">
					<div class="hero-metrics-grid mb-8">
						{#each $selectedRole.layout.heroMetrics as metricId}
							{@const metric = $selectedRole.metrics.find(m => m.id === metricId)}
							{#if metric}
								<RoleMetricCard {metric} colorScheme={$selectedRole.colorScheme} />
							{/if}
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
{/if}

<!-- System Overview Dashboard (when no role is selected) -->
{#if !$isRoleView}
	<!-- Core Operations Metrics (Row 1) -->
	<div class="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
		<MetricCard 
			title="Current Temp" 
			value={currentTemp.toFixed(1)} 
			unit="°F" 
			icon="🌡️" 
			status={currentTemp > 80 ? 'warning' : 'normal'}
			trend="up"
			trendValue="+2.3°F"
			color="orange"
		/>
		<MetricCard 
			title="Ambient Temp" 
			value={ambientTemp.toFixed(1)} 
			unit="°F" 
			icon="🌤️" 
			status={ambientTemp > 100 ? 'critical' : 'normal'}
			trend="up"
			trendValue="+5.1°F"
			color="red"
		/>
		<MetricCard 
			title="System Pressure" 
			value={systemPressure.toFixed(1)} 
			unit="PSI" 
			icon="⚡" 
			status={systemPressure > 160 ? 'warning' : 'normal'}
			trend="stable"
			trendValue="+2.1 PSI"
			color="blue"
		/>
		<MetricCard 
			title="Flow Rate" 
			value={flowRate.toFixed(1)} 
			unit="BBL/min" 
			icon="💧" 
			status="normal"
			trend="up"
			trendValue="+0.3"
			color="emerald"
		/>
	</div>

	<!-- Coriolis Measurements (Row 2) -->
	<div class="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
		<MetricCard 
			title="Net Volume" 
			value={netVolume.toFixed(1)} 
			unit="BBL" 
			icon="🛢️" 
			status="normal"
			trend="up"
			trendValue="+12.3 BBL"
			color="orange"
		/>
		<MetricCard 
			title="API Gravity" 
			value={apiGravity.toFixed(1)} 
			unit="° API" 
			icon="⚖️" 
			status="normal"
			trend="stable"
			trendValue="+0.2°"
			color="blue"
		/>
		<MetricCard 
			title="Water Cut" 
			value={waterCut.toFixed(1)} 
			unit="%" 
			icon="💧" 
			status={waterCut > 2 ? 'warning' : 'normal'}
			trend="down"
			trendValue="-0.1%"
			color="emerald"
		/>
		<MetricCard 
			title="Mass Flow Rate" 
			value={massFlowRate.toFixed(1)} 
			unit="BBL/min" 
			icon="📊" 
			status="normal"
			trend="up"
			trendValue="+0.2"
			color="purple"
		/>
	</div>

	<!-- Safety & Pressure (Row 3) -->
	<div class="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
		<MetricCard 
			title="H2S Levels" 
			value={h2sLevels.toFixed(1)} 
			unit="PPM" 
			icon="☠️" 
			status={h2sLevels > 1.5 ? 'critical' : h2sLevels > 1.0 ? 'warning' : 'normal'}
			trend={h2sLevels > 1.0 ? 'up' : 'stable'}
			trendValue={h2sLevels > 1.0 ? '+0.3 PPM' : 'Safe'}
			color={h2sLevels > 1.5 ? 'red' : h2sLevels > 1.0 ? 'amber' : 'emerald'}
		/>
		<MetricCard 
			title="Tanker Pressure" 
			value={tankerPressure.toFixed(1)} 
			unit="PSI" 
			icon="🚛" 
			status={tankerPressure > 155 ? 'warning' : 'normal'}
			trend="stable"
			trendValue="+1.2 PSI"
			color="blue"
		/>
		<MetricCard 
			title="Gas Detection" 
			value={gasDetectionStatus === 'normal' ? 'Normal' : gasDetectionStatus === 'warning' ? 'Warning' : 'Critical'} 
			unit="" 
			icon="🔍" 
			status={gasDetectionStatus}
			trend={gasDetectionStatus === 'normal' ? 'stable' : 'up'}
			trendValue={gasDetectionStatus === 'normal' ? 'All Clear' : 'Alert'}
			color={gasDetectionStatus === 'normal' ? 'emerald' : gasDetectionStatus === 'warning' ? 'amber' : 'red'}
		/>
		<MetricCard 
			title="Pump RPM" 
			value={pumpRpm.toFixed(0)} 
			unit="RPM" 
			icon="⚙️" 
			status={pumpRpm > 1800 ? 'warning' : 'normal'}
			trend="stable"
			trendValue="+25 RPM"
			color="purple"
		/>
	</div>

	<!-- System Health (Row 4) -->
	<div class="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
		<MetricCard 
			title="SCADA Status" 
			value={scadaStatusValue === 'online' ? 'Online' : 'Offline'} 
			unit="" 
			icon="🖥️" 
			status={scadaStatusValue === 'online' ? 'normal' : 'critical'}
			trend="stable"
			trendValue="99.8% Uptime"
			color={scadaStatusValue === 'online' ? 'emerald' : 'red'}
		/>
		<MetricCard 
			title="DryDrive Temp" 
			value={dryDriveTemp.toFixed(1)} 
			unit="°F" 
			icon="🌡️" 
			status={dryDriveTemp > 190 ? 'warning' : 'normal'}
			trend="stable"
			trendValue="+3.2°F"
			color="orange"
		/>
		<MetricCard 
			title="Network Health" 
			value={networkHealth.toFixed(1)} 
			unit="%" 
			icon="📡" 
			status={networkHealth < 95 ? 'warning' : 'normal'}
			trend="up"
			trendValue="+0.3%"
			color="emerald"
		/>
		<MetricCard 
			title="Active Alerts" 
			value={activeAlerts.toString()} 
			unit="alerts" 
			icon="🚨" 
			status={activeAlerts > 0 ? 'warning' : 'normal'}
			trend={activeAlerts > 0 ? 'up' : 'stable'}
			trendValue={activeAlerts > 0 ? `+${activeAlerts}` : 'None'}
			color={activeAlerts > 0 ? 'amber' : 'emerald'}
		/>
	</div>

	<!-- Fleet Operations Summary (Row 5) -->
	<div class="metrics-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
		<MetricCard 
			title="Active Hauls" 
			value={$activeHauls.length.toString()} 
			unit="" 
			icon="🚛" 
			status="normal"
			trend="up"
			trendValue="+3"
			color="blue"
		/>
		<MetricCard 
			title="Total Volume" 
			value={totalActiveVolume.toLocaleString()} 
			unit="BBL" 
			icon="🛢️" 
			status="normal"
			trend="up"
			trendValue="+1,247 BBL"
			color="orange"
		/>
		<MetricCard 
			title="Expected Loss" 
			value={totalExpectedLoss.toFixed(1)} 
			unit="BBL" 
			icon="📉" 
			status={totalExpectedLoss > 50 ? 'warning' : 'normal'}
			trend="down"
			trendValue="-2.3 BBL"
			color="emerald"
		/>
		<MetricCard 
			title="Completed Today" 
			value={completedToday.toString()} 
			unit="hauls" 
			icon="✅" 
			status="normal"
			trend="up"
			trendValue="+8"
			color="emerald"
		/>
	</div>

	<!-- Real-time Charts Section -->
	<div class="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
		<div class="chart-container">
			<RealtimeChart 
				title="Temperature Monitoring"
				color="#F59E0B"
				height={400}
				unit="°F"
				animated={true}
			/>
		</div>
		<div class="chart-container">
			<RealtimeChart 
				title="Pressure Systems"
				color="#3B82F6"
				height={400}
				unit=" PSI"
				animated={true}
			/>
		</div>
		<div class="chart-container">
			<RealtimeChart 
				title="Flow Rate Analysis"
				color="#10B981"
				height={450}
				unit=" BBL/min"
				animated={true}
			/>
		</div>
		<div class="chart-container">
			<RealtimeChart 
				title="Volume Tracking"
				color="#8B5CF6"
				height={450}
				unit=" BBL"
				animated={true}
			/>
		</div>
	</div>

	<!-- Gauge Charts Section -->
	<div class="gauges-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
		<div class="gauge-container">
			<GaugeChart 
				title="System Efficiency"
				value={87.3}
				max={100}
				unit="%"
				color="#10B981"
				thresholds={{ warning: 70, critical: 85 }}
			/>
		</div>
		<div class="gauge-container">
			<GaugeChart 
				title="Safety Score"
				value={96.8}
				max={100}
				unit="%"
				color="#059669"
				thresholds={{ warning: 80, critical: 90 }}
			/>
		</div>
		<div class="gauge-container">
			<GaugeChart 
				title="Equipment Health"
				value={92.1}
				max={100}
				unit="%"
				color="#3B82F6"
				thresholds={{ warning: 75, critical: 85 }}
			/>
		</div>
	</div>

	<!-- Active Hauls Overview -->
	<div class="hauls-section mb-6 sm:mb-8">
		<div class="section-header mb-4 sm:mb-6">
			<h2 class="text-xl sm:text-2xl font-bold text-oil-black mb-2">Active Hauls Overview</h2>
			<p class="text-sm sm:text-base text-oil-gray">Real-time monitoring of oil transport operations</p>
		</div>
		
		<div class="hauls-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
			{#each $activeHauls.slice(0, 6) as haul}
				{@const driver = $drivers.find(d => d.id === haul.driverId)}
				{@const truck = $trucks.find(t => t.id === haul.truckId)}
				{#if driver && truck}
					<HaulCard {haul} {driver} {truck} />
				{/if}
			{/each}
		</div>
		
		{#if $activeHauls.length > 6}
			<div class="text-center mt-6">
				<a href="/hauls" class="inline-flex items-center gap-2 px-6 py-3 bg-oil-orange text-white rounded-lg font-medium hover:bg-oil-orange/90 transition-colors">
					View All {$activeHauls.length} Active Hauls
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</a>
			</div>
		{/if}
	</div>
{/if}

<!-- Job Detail Modal -->
{#if showJobModal && selectedJob}
	<JobDetailModal 
		job={selectedJob}
		isOpen={showJobModal}
		on:close={() => showJobModal = false}
		on:start-navigation={handleDirectNavigation}
	/>
{/if}

<!-- Map View -->
{#if showMapView && selectedJob}
	<JobMapView 
		job={selectedJob}
		on:exit-map={handleExitMap}
		on:start-transit={handleStartTransit}
	/>
{/if}

<!-- In-Transit View -->
{#if showTransitView && selectedJob}
	<InTransitView 
		job={selectedJob}
		on:exit-transit={handleExitTransit}
	/>
{/if}

<style>
	.focus-banner {
		padding: 12px 20px;
		border-radius: 12px;
		border: 1px solid;
		margin-top: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 14px;
	}

	.role-metrics-container {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.hero-metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.primary-metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 16px;
	}

	.role-charts-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
	}

	.hero-chart-container {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 2px solid;
		border-radius: 20px;
		padding: 24px;
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.12),
			0 4px 12px rgba(0, 0, 0, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.chart-header {
		margin-bottom: 20px;
	}

	.chart-title {
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 8px;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.chart-relevance {
		font-size: 14px;
		color: #374151;
		font-weight: 500;
	}

	.chart-placeholder {
		height: 300px;
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		font-weight: 600;
		border: 1px solid rgba(124, 179, 66, 0.2);
	}

	@media (max-width: 768px) {
		.hero-metrics-grid {
			grid-template-columns: 1fr;
		}

		.primary-metrics-grid {
			grid-template-columns: 1fr;
		}

		.chart-title {
			font-size: 20px;
		}

		.chart-placeholder {
			height: 200px;
			font-size: 16px;
		}
	}

	.tab-navigation {
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	}

	.tab-button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: transparent;
		border: none;
		border-radius: 12px 12px 0 0;
		color: #6b7280;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border-bottom: 2px solid transparent;
	}

	.tab-button:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #1a1a1a;
	}

	.tab-button.active {
		background: rgba(124, 179, 66, 0.1);
		color: #7CB342;
		border-bottom-color: #7CB342;
	}

	.tab-icon {
		font-size: 16px;
	}

	.tab-count {
		background: rgba(124, 179, 66, 0.2);
		color: #558B2F;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.tab-button.active .tab-count {
		background: #7CB342;
		color: white;
	}

	.view-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.truck-card {
		transition: all 0.2s ease;
	}

	.truck-card:hover {
		transform: translateY(-2px);
	}

	.status-badge {
		font-size: 11px;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 6px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.btn-sm {
		font-size: 12px;
		font-weight: 500;
		transition: all 0.2s ease;
	}

	.btn-sm:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.table-header {
		font-size: 14px;
	}

	.table-row {
		font-size: 14px;
		transition: all 0.2s ease;
	}

	.detail-row {
		font-size: 13px;
	}

	.trend-indicator {
		font-size: 16px;
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		.metrics-grid {
			grid-template-columns: 1fr;
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}

		.trucks-grid {
			grid-template-columns: 1fr;
		}

		.table-header, .table-row {
			grid-template-columns: 1fr;
			gap: 1rem;
		}

		.tab-button {
			padding: 8px 12px;
			font-size: 14px;
		}
	}

	/* Role-Based Navigation Styles */
	.role-navigation {
		margin-bottom: 2rem;
	}

	.nav-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		border-bottom: 2px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 1rem;
	}

	.nav-tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid transparent;
		border-radius: 12px;
		color: #6b7280;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.nav-tab:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.nav-tab.active {
		background: var(--primary-color, #7CB342);
		color: white;
		border-color: var(--primary-color, #7CB342);
		box-shadow: 0 8px 25px rgba(124, 179, 66, 0.3);
	}

	.tab-icon {
		font-size: 16px;
	}

	.tab-label {
		font-weight: 600;
		white-space: nowrap;
	}

	.tab-content {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Status Badges */
	.status-badge {
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-loading {
		background: #fef3c7;
		color: #d97706;
	}

	.status-transit {
		background: #dbeafe;
		color: #2563eb;
	}

	.status-offloading {
		background: #d1fae5;
		color: #059669;
	}

	.status-completed {
		background: #d1fae5;
		color: #059669;
	}

	.status-in-progress {
		background: #dbeafe;
		color: #2563eb;
	}

	.status-scheduled {
		background: #f3f4f6;
		color: #6b7280;
	}

	/* Priority Badges */
	.priority-badge {
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
	}

	.priority-high {
		background: #fee2e2;
		color: #dc2626;
	}

	.priority-medium {
		background: #fef3c7;
		color: #d97706;
	}

	.priority-low {
		background: #f3f4f6;
		color: #6b7280;
	}

	/* Alert Styles */
	.alert-item {
		border-left-width: 4px;
	}

	.alert-critical {
		background: #fef2f2;
		border-left-color: #dc2626;
	}

	.alert-warning {
		background: #fffbeb;
		border-left-color: #d97706;
	}

	.alert-info {
		background: #eff6ff;
		border-left-color: #2563eb;
	}

	/* Time Badge */
	.time-badge {
		background: rgba(124, 179, 66, 0.1);
		color: #558B2F;
		padding: 8px 12px;
		border-radius: 8px;
		font-weight: 600;
		min-width: 60px;
		text-align: center;
	}

	/* Charts Grid */
	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
		gap: 24px;
	}

	/* Hero Metrics Grid */
	.hero-metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 2rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.nav-tabs {
			flex-direction: column;
		}

		.nav-tab {
			justify-content: center;
			padding: 10px 16px;
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}

		.hero-metrics-grid {
			grid-template-columns: 1fr;
		}

		.tab-label {
			font-size: 14px;
		}
	}

	/* Filter Selects */
	.filter-select {
		padding: 8px 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		color: #1a1a1a;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-select:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(124, 179, 66, 0.3);
	}

	.filter-select:focus {
		outline: none;
		border-color: #7CB342;
		box-shadow: 0 0 0 3px rgba(124, 179, 66, 0.1);
	}

	/* Metric Items */
	.metric-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.metric-label {
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.metric-value {
		font-size: 16px;
		font-weight: 700;
		color: #1a1a1a;
	}

	/* Time Badge Small */
	.time-badge-small {
		background: rgba(124, 179, 66, 0.1);
		color: #558B2F;
		padding: 4px 8px;
		border-radius: 6px;
		font-weight: 600;
		min-width: 50px;
		text-align: center;
		font-size: 11px;
	}

	/* Status Badge Small */
	.status-badge-small {
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Truck and Driver Detail Cards */
	.truck-detail-card,
	.driver-detail-card {
		transition: all 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.truck-detail-card:hover,
	.driver-detail-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
		border-color: rgba(124, 179, 66, 0.3);
	}

	/* Yard Fleet and Driver Cards */
	.yard-fleet-card,
	.yard-driver-card {
		transition: all 0.2s ease;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.yard-fleet-card:hover,
	.yard-driver-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
		border-color: rgba(124, 179, 66, 0.2);
	}

	/* Utilization Bar */
	.utilization-bar {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	/* Bay Status */
	.bay-status {
		transition: all 0.2s ease;
	}

	.bay-status:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	/* Maintenance and Inventory Items */
	.maintenance-item,
	.inventory-item {
		transition: all 0.2s ease;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.maintenance-item:hover,
	.inventory-item:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: rgba(124, 179, 66, 0.2);
	}

	/* Status Categories */
	.status-category {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Additional Status Badge Styles */
	.status-active {
		background: #d1fae5;
		color: #059669;
	}

	.status-maintenance {
		background: #fef3c7;
		color: #d97706;
	}

	.status-available {
		background: #f3f4f6;
		color: #6b7280;
	}
	
	/* System Overview Styles */
	.metrics-grid {
		display: grid;
		gap: 1.5rem;
	}
	
	.chart-container {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
		min-height: 440px; /* Ensure enough space for 400px charts */
	}
	
	.chart-container:hover {
		transform: translateY(-2px);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.15),
			0 4px 12px rgba(0, 0, 0, 0.08);
	}
	
	.gauge-container {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.05);
		transition: all 0.3s ease;
	}
	
	.gauge-container:hover {
		transform: translateY(-2px);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.15),
			0 4px 12px rgba(0, 0, 0, 0.08);
	}
	
	.section-header {
		text-align: center;
		margin-bottom: 2rem;
	}
	
	.hauls-section {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 20px;
		padding: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.hauls-grid {
		display: grid;
		gap: 1.5rem;
	}
	
	@media (max-width: 768px) {
		.metrics-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.charts-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.gauges-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.hauls-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.hauls-section {
			padding: 1rem;
		}
	}

	/* Gauge Chart Styles */
	.gauge-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.gauge-chart {
		position: relative;
		width: 200px;
		height: 120px;
	}
	
	/* Haul Ticket Styles - Mobile First */
	.haul-ticket-section {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.08),
			0 1px 4px rgba(0, 0, 0, 0.04),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		padding: 16px;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	@media (min-width: 768px) {
		.haul-ticket-section {
			border-radius: 20px;
			box-shadow: 
				0 8px 32px rgba(0, 0, 0, 0.1),
				0 2px 8px rgba(0, 0, 0, 0.05),
				inset 0 1px 0 rgba(255, 255, 255, 0.8);
			padding: 24px;
		}
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	@media (min-width: 640px) {
		.section-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: 16px;
			margin-bottom: 20px;
			padding-bottom: 16px;
		}
	}

	@media (min-width: 768px) {
		.section-header {
			margin-bottom: 24px;
		}
	}

	.section-header h2 {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
		text-align: center;
	}

	@media (min-width: 640px) {
		.section-header h2 {
			font-size: 20px;
			text-align: left;
		}
	}

	@media (min-width: 768px) {
		.section-header h2 {
			font-size: 24px;
		}
	}

	.haul-controls {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
	}

	@media (min-width: 640px) {
		.haul-controls {
			gap: 12px;
			width: auto;
			justify-content: flex-end;
		}
	}

	.haul-nav-btn {
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 8px;
		color: #3b82f6;
		padding: 8px 12px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		transition: all 0.2s ease;
		min-height: 44px;
		min-width: 44px;
		justify-content: center;
	}

	@media (min-width: 640px) {
		.haul-nav-btn {
			border-radius: 10px;
			padding: 8px 12px;
			font-size: 14px;
			gap: 6px;
			min-width: auto;
		}
	}

	.haul-nav-btn:hover {
		background: rgba(59, 130, 246, 0.2);
		transform: translateY(-1px);
	}

	.haul-counter {
		font-size: 13px;
		color: #64748b;
		font-weight: 500;
		font-family: 'JetBrains Mono', monospace;
		padding: 0 8px;
	}

	@media (min-width: 640px) {
		.haul-counter {
			font-size: 14px;
		}
	}

	.haul-ticket-container {
		background: white;
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	@media (min-width: 768px) {
		.haul-ticket-container {
			border-radius: 16px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		}
	}

	.ticket-header {
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
		color: white;
		padding: 16px 20px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	@media (min-width: 640px) {
		.ticket-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: flex-start;
			gap: 16px;
			padding: 18px 24px;
		}
	}

	@media (min-width: 768px) {
		.ticket-header {
			padding: 20px 24px;
		}
	}

	.ticket-info h3 {
		font-size: 16px;
		font-weight: 700;
		margin: 0 0 4px 0;
		font-family: 'JetBrains Mono', monospace;
	}

	@media (min-width: 640px) {
		.ticket-info h3 {
			font-size: 18px;
		}
	}

	@media (min-width: 768px) {
		.ticket-info h3 {
			font-size: 20px;
		}
	}

	.ticket-status {
		padding: 3px 8px;
		border-radius: 16px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.5px;
		margin-bottom: 6px;
		display: inline-block;
	}

	@media (min-width: 640px) {
		.ticket-status {
			padding: 4px 12px;
			border-radius: 20px;
			font-size: 12px;
			margin-bottom: 8px;
		}
	}

	.ticket-status.in-transit {
		background: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
		border: 1px solid rgba(245, 158, 11, 0.3);
	}

	.ticket-info small {
		color: rgba(255, 255, 255, 0.8);
		font-size: 12px;
		font-weight: 500;
	}

	@media (min-width: 640px) {
		.ticket-info small {
			font-size: 14px;
		}
	}

	.ticket-time {
		display: flex;
		flex-direction: column;
		gap: 3px;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.9);
	}

	@media (min-width: 640px) {
		.ticket-time {
			text-align: right;
			font-size: 14px;
			gap: 4px;
		}
	}

	.ticket-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	@media (min-width: 768px) {
		.ticket-content {
			padding: 24px;
			gap: 24px;
		}
	}

	.ticket-section {
		border-bottom: 1px solid #e2e8f0;
		padding-bottom: 16px;
	}

	@media (min-width: 768px) {
		.ticket-section {
			padding-bottom: 20px;
		}
	}

	.ticket-section:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.ticket-section h4 {
		font-size: 14px;
		font-weight: 600;
		color: #334155;
		margin: 0 0 8px 0;
	}

	@media (min-width: 640px) {
		.ticket-section h4 {
			font-size: 15px;
			margin: 0 0 10px 0;
		}
	}

	@media (min-width: 768px) {
		.ticket-section h4 {
			font-size: 16px;
			margin: 0 0 12px 0;
		}
	}

	.route-info {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	@media (min-width: 640px) {
		.route-info {
			grid-template-columns: 1fr auto 1fr;
			gap: 16px;
			align-items: center;
		}
	}

	@media (min-width: 768px) {
		.route-info {
			gap: 20px;
		}
	}

	.location {
		padding: 12px;
		background: rgba(248, 250, 252, 0.8);
		border-radius: 8px;
		border: 1px solid rgba(226, 232, 240, 0.8);
	}

	@media (min-width: 768px) {
		.location {
			padding: 16px;
			border-radius: 12px;
		}
	}

	.location strong {
		color: #1e293b;
		font-weight: 600;
		font-size: 13px;
	}

	@media (min-width: 640px) {
		.location strong {
			font-size: 14px;
		}
	}

	.location small {
		color: #64748b;
		font-size: 11px;
		line-height: 1.4;
	}

	@media (min-width: 640px) {
		.location small {
			font-size: 12px;
		}
	}

	@media (min-width: 768px) {
		.location small {
			font-size: 13px;
		}
	}

	.route-arrow {
		font-size: 16px;
		color: #94a3b8;
		font-weight: bold;
		text-align: center;
		transform: rotate(90deg);
	}

	@media (min-width: 640px) {
		.route-arrow {
			font-size: 18px;
			transform: none;
		}
	}

	@media (min-width: 768px) {
		.route-arrow {
			font-size: 20px;
		}
	}

	.ticket-metrics {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	@media (min-width: 640px) {
		.ticket-metrics {
			grid-template-columns: repeat(4, 1fr);
			gap: 12px;
		}
	}

	@media (min-width: 768px) {
		.ticket-metrics {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 16px;
		}
	}

	.metric-item {
		text-align: center;
		padding: 12px 8px;
		background: rgba(248, 250, 252, 0.8);
		border-radius: 8px;
		border: 1px solid rgba(226, 232, 240, 0.8);
	}

	@media (min-width: 768px) {
		.metric-item {
			padding: 16px;
			border-radius: 12px;
		}
	}

	.metric-item label {
		display: block;
		font-size: 10px;
		color: #64748b;
		font-weight: 500;
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	@media (min-width: 640px) {
		.metric-item label {
			font-size: 11px;
		}
	}

	@media (min-width: 768px) {
		.metric-item label {
			font-size: 12px;
		}
	}

	.metric-value {
		font-size: 14px;
		font-weight: 600;
		color: #1e293b;
		font-family: 'JetBrains Mono', monospace;
		line-height: 1.2;
	}

	@media (min-width: 640px) {
		.metric-value {
			font-size: 16px;
		}
	}

	@media (min-width: 768px) {
		.metric-value {
			font-size: 18px;
		}
	}

	.metric-value.safe {
		color: #059669;
	}

	.measurement-financial {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	@media (min-width: 640px) {
		.measurement-financial {
			grid-template-columns: 1fr 1fr;
			gap: 16px;
		}
	}

	@media (min-width: 768px) {
		.measurement-financial {
			gap: 20px;
		}
	}

	.measurement-data,
	.financial-data {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 12px;
		background: rgba(248, 250, 252, 0.8);
		border-radius: 8px;
		border: 1px solid rgba(226, 232, 240, 0.8);
	}

	@media (min-width: 768px) {
		.measurement-data,
		.financial-data {
			gap: 8px;
			padding: 16px;
			border-radius: 12px;
		}
	}

	.measurement-data span,
	.financial-data span {
		font-size: 12px;
		color: #475569;
	}

	@media (min-width: 640px) {
		.measurement-data span,
		.financial-data span {
			font-size: 13px;
		}
	}

	@media (min-width: 768px) {
		.measurement-data span,
		.financial-data span {
			font-size: 14px;
		}
	}

	.document-status {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	@media (min-width: 768px) {
		.document-status {
			gap: 12px;
		}
	}

	.doc-item {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 8px;
		background: rgba(220, 252, 231, 0.8);
		color: #065f46;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 500;
		font-family: 'JetBrains Mono', monospace;
	}

	@media (min-width: 640px) {
		.doc-item {
			gap: 6px;
			padding: 6px 10px;
			font-size: 12px;
		}
	}

	@media (min-width: 768px) {
		.doc-item {
			padding: 6px 12px;
			border-radius: 8px;
			font-size: 13px;
		}
	}

	.ticket-actions {
		padding: 16px;
		background: rgba(248, 250, 252, 0.8);
		border-top: 1px solid #e2e8f0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	@media (min-width: 640px) {
		.ticket-actions {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 10px;
			padding: 18px 20px;
		}
	}

	@media (min-width: 768px) {
		.ticket-actions {
			gap: 12px;
			padding: 20px 24px;
		}
	}

	.action-btn {
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	@media (min-width: 640px) {
		.action-btn {
			padding: 10px 16px;
			border-radius: 10px;
			min-height: auto;
			flex: 1;
		}
	}

	.action-btn.primary {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.action-btn.primary:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	.action-btn.secondary {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
		border-color: rgba(59, 130, 246, 0.2);
	}

	.action-btn.secondary:hover {
		background: rgba(59, 130, 246, 0.2);
		transform: translateY(-1px);
	}

	.action-btn.danger {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		border-color: rgba(239, 68, 68, 0.2);
	}

	.action-btn.danger:hover {
		background: rgba(239, 68, 68, 0.2);
		transform: translateY(-1px);
	}

	/* Analytics Button Styles */
	.analytics-access {
		display: flex;
		justify-content: center;
		margin: 0 auto;
		max-width: 600px;
	}

	.analytics-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 24px;
		background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
		min-height: 56px;
	}

	.analytics-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
		background: linear-gradient(135deg, #ff5722 0%, #ff9800 100%);
	}

	.analytics-btn.analytics-active {
		background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
		box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
	}

	.analytics-btn.analytics-active:hover {
		background: linear-gradient(135deg, #388e3c 0%, #689f38 100%);
		box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
	}

	.analytics-icon {
		font-size: 20px;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	.analytics-label {
		font-family: 'Inter', sans-serif;
	}

	/* Analytics Container */
	.analytics-container {
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		border: 1px solid rgba(226, 232, 240, 0.8);
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

	.error-state {
		padding: 48px 24px;
		text-align: center;
		color: #ef4444;
	}

	.error-state p:first-child {
		font-weight: 600;
		margin-bottom: 8px;
	}

	.error-state p:last-child {
		font-size: 14px;
		color: #64748b;
		margin: 0;
	}

	@media (max-width: 640px) {
		.analytics-btn {
			padding: 14px 20px;
			font-size: 14px;
			gap: 10px;
			min-height: 48px;
		}

		.analytics-icon {
			font-size: 18px;
		}

		.analytics-header {
			padding: 20px 16px;
		}

		.analytics-header h2 {
			font-size: 20px;
		}

		.analytics-header p {
			font-size: 13px;
		}
	}

	/* Driver Section Visibility Control */
	.driver-section {
		display: none;
		width: 100%;
		padding: 0;
		margin: 0;
	}

	.driver-section.section-visible {
		display: block;
		width: 100%;
		height: auto;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		margin-bottom: 0;
		position: sticky;
		top: 80px;
		z-index: 10;
	}

	.section-title {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.back-to-overview-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 16px;
		background: rgba(148, 163, 184, 0.1);
		color: #475569;
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.back-to-overview-btn:hover {
		background: rgba(148, 163, 184, 0.2);
		transform: translateX(-2px);
	}

	.scrollable-content {
		width: 100%;
		height: auto;
		overflow: visible;
		padding: 24px;
	}

	/* Driver Dashboard Layout */
	.driver-dashboard {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9f0 50%, #e8f5e8 100%);
		width: 100%;
	}

	.driver-content-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		position: relative;
		min-height: calc(100vh - 60px);
	}

	/* Mobile responsiveness for driver sections */
	@media (max-width: 768px) {
		.section-header {
			padding: 16px 20px;
			flex-direction: column;
			gap: 12px;
			align-items: flex-start;
			top: 65px;
		}

		.section-title {
			font-size: 20px;
		}

		.back-to-overview-btn {
			align-self: flex-end;
		}

		.driver-content-container {
			min-height: calc(100vh - 60px);
		}

		.scrollable-content {
			padding: 16px;
		}
	}
</style>
