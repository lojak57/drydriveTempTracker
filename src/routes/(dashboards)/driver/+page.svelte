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
	
	// NEW: Workflow imports
	import WorkflowProgressShell from '$lib/components/driver/WorkflowProgressShell.svelte';
	import DriverWorkflowRouter from '$lib/components/driver/DriverWorkflowRouter.svelte';
	import { WORKFLOW_STEPS, type WorkflowStep } from '$lib/components/driver/workflowConfig.js';
	import LoadCalculator from '$lib/components/driver/LoadCalculator.svelte';
	
	import { Truck, BarChart3, Shield, CheckCircle, Clock, Zap, Package, Trophy, BookOpen, Search } from 'lucide-svelte';

	// Driver workflow state - SIMPLIFIED
	let selectedJob: any = null;
	let showJobModal = false;
	let inspectionCompleted = false;
	
	// Job flow states
	let currentView = 'dashboard'; // 'dashboard' | 'job-map' | 'in-transit'
	let activeJob: any = null;

	// SIMPLIFIED: Workflow view system (removed complex sub-steps)
	let currentWorkflowView: WorkflowStep = 'job-overview';
	let workflowProgress = {
		'job-overview': false,
		'pre-trip': false,
		'to-pickup': false,
		'loading': false,
		'to-delivery': false,
		'unloading': false,
		'post-trip': false
	};
	
	// SIMPLIFIED: Computed workflow state 
	$: currentWorkflowStep = currentWorkflowView;
	$: completedSteps = getCompletedSteps(currentWorkflowStep, inspectionCompleted, activeJob, workflowProgress);
	$: driverInfo = { id: 'driver-001', name: 'Current Driver' };

	// NEW: Shared state object (replaces scattered state management)
	$: sharedState = {
		activeJob: activeJob || {
			id: 'J08-002-DEL',
			pickupSiteName: 'Johnson Tank Battery #3',
			pickupAddress: '2847 County Road 1250, Midland, TX 79701',
			pickupContact: '(432) 555-0157',
			pickupTank: '#A-15',
			expectedVolume: '120',
			deliverySiteName: 'Permian Basin Refinery',
			deliveryAddress: '1425 Industrial Blvd, Odessa, TX 79761',
			deliveryContact: '(432) 555-0199',
			deliveryBay: '#7',
			deliveryVolume: '120',
			distance: '23.4 mi',
			estimatedTime: '42 min',
			deliveryETA: getCurrentTime(42) // Make ETA realistic based on current time
		},
		selectedJob,
		inspectionCompleted,
		workflowProgress,
		jobProgress: 'inTransitToDelivery' // Track current job phase
	};

	// Create event handlers object  
	$: eventHandlers = {
		navigateToStep,
		markStepComplete,
		handleJobSelected,
		handleInspectionComplete,
		handleStartNavigation,
		handleStartTransitToPickup,
		handleArriveAtPickup,
		handleStartDeliveryNavigation,
		handleStartTransitToDelivery,
		handleArriveAtDelivery
	};

	// NEW: Workflow reset handler (preserves existing reset logic)
	function handleWorkflowReset() {
		// Reset to existing initial state - no new logic needed
		currentView = 'dashboard';
		currentWorkflowView = 'job-overview';
		activeJob = null;
		selectedJob = null;
		inspectionCompleted = false;
		showJobModal = false;
	}

	// NEW: Completed steps logic
	function getCompletedSteps(
		currentStep: WorkflowStep, 
		inspectionCompleted: boolean, 
		activeJob: any,
		workflowProgress: Record<string, boolean>
	): WorkflowStep[] {
		const completed: WorkflowStep[] = [];
		
		// Add completed steps based on progress tracking
		for (const [step, isCompleted] of Object.entries(workflowProgress)) {
			if (isCompleted) {
				completed.push(step as WorkflowStep);
			}
		}
		
		// Special completion logic (preserves existing business rules)
		if (inspectionCompleted && !completed.includes('pre-trip')) {
			completed.push('pre-trip');
			workflowProgress['pre-trip'] = true;
		}
		
		if (activeJob && activeJob.status === 'completed') {
			completed.push('job-overview', 'pre-trip', 'to-pickup', 'loading', 'to-delivery', 'unloading');
		}
		
		return completed;
	}

	// NEW: Handle workflow step clicks (direct view navigation)
	function handleStepClick(event: CustomEvent) {
		const { step } = event.detail;
		
		// IMPORTANT: If clicking directly on 'to-delivery', ensure all prerequisites are met
		if (step === 'to-delivery') {
			setDeliveryProgressState();
		}
		
		currentWorkflowView = step;
		
		// NEW: Scroll to top when clicking to to-pickup step
		if (step === 'to-pickup') {
			setTimeout(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			}, 100);
		}
	}

	// Helper function to set proper delivery progress state
	function setDeliveryProgressState() {
		workflowProgress['job-overview'] = true;
		workflowProgress['pre-trip'] = true;
		workflowProgress['to-pickup'] = true;
		workflowProgress['loading'] = true;
		workflowProgress = { ...workflowProgress }; // Trigger reactivity
		console.log('✅ Set delivery state - all previous steps marked as complete');
	}

	// NEW: Mark workflow step as complete
	function markStepComplete(step: WorkflowStep) {
		workflowProgress[step] = true;
		workflowProgress = { ...workflowProgress }; // Trigger reactivity
	}

	// NEW: Navigate to next workflow step
	function navigateToStep(step: WorkflowStep) {
		markStepComplete(currentWorkflowView);
		currentWorkflowView = step;
		
		// IMPORTANT: When navigating to 'to-delivery', ensure all previous steps are marked complete
		if (step === 'to-delivery') {
			workflowProgress['job-overview'] = true;
			workflowProgress['pre-trip'] = true;
			workflowProgress['to-pickup'] = true;
			workflowProgress['loading'] = true;
			workflowProgress = { ...workflowProgress }; // Trigger reactivity
			console.log('✅ Navigated to delivery - marking all previous steps as complete');
		}
		
		// NEW: Scroll to top when navigating to any workflow step
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 100);
	}

	// PRESERVE: All existing functions unchanged
	function handleJobSelected(event: CustomEvent) {
		selectedJob = event.detail.job;
		showJobModal = true;
	}

	function handleJobStart(event: CustomEvent) {
		const { job } = event.detail;
		console.log('🚀 Starting job:', job.id, '| Account:', job.accountName);
		console.log('📍 Route:', job.pickupLocation.name, '→', job.deliveryLocation.name);
		
		// SMART: Detect if this is a delivery job (second leg) based on job data
		const isDeliveryJob = job.id === 'JOB-002' || job.status === 'loaded' || job.currentLeg === 'delivery';
		
		if (isDeliveryJob) {
			// This is a delivery job - mark pickup/loading as complete and set to delivery
			workflowProgress['job-overview'] = true;
			workflowProgress['pre-trip'] = true;
			workflowProgress['to-pickup'] = true;
			workflowProgress['loading'] = true;
			// Set current workflow to to-delivery so status shows correctly
			currentWorkflowView = 'to-delivery';
			console.log('🚛 Delivery job detected - marking pickup/loading complete, setting to-delivery active');
		} else {
			// This is a pickup job - reset progress  
			workflowProgress = {
				'job-overview': false,
				'pre-trip': false,
				'to-pickup': false,
				'loading': false,
				'to-delivery': false,
				'unloading': false,
				'post-trip': false
			};
			// Set current workflow to to-pickup for pickup jobs
			currentWorkflowView = 'to-pickup';
			console.log('📦 Pickup job detected - resetting workflow progress, setting to-pickup active');
		}
		
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
		// FIXED: Go to actual in-transit view with map, NOT workflow
		currentView = 'in-transit';
		activeJob = job;
	}

	function handleTransitComplete() {
		// SMART: Check workflow progress to determine if going to pickup or delivery
		const isLoadingComplete = workflowProgress['loading'];
		const isToDeliveryComplete = workflowProgress['to-delivery'];
		
		currentView = 'dashboard';
		
		// Smart routing based on workflow state
		if (isLoadingComplete || isToDeliveryComplete) {
			// If loading is done, we're going to delivery for unloading
			currentWorkflowView = 'unloading';
			console.log('🚚 Transit complete → Going to UNLOADING (delivery site)');
		} else {
			// If loading not done, we're going to pickup for loading  
			currentWorkflowView = 'loading';
			console.log('🚚 Transit complete → Going to LOADING (pickup site)');
		}
		
		// Mark previous steps as complete since we came from job flow
		workflowProgress['job-overview'] = true;
		workflowProgress['pre-trip'] = true;
		workflowProgress['to-pickup'] = true;
		
		// If we're going to unloading, also mark delivery steps complete
		if (currentWorkflowView === 'unloading') {
			workflowProgress['loading'] = true;
			workflowProgress['to-delivery'] = true;
		}
	}

	function handleInspectionComplete(event: CustomEvent) {
		const inspectionData = event.detail.inspectionData;
		inspectionCompleted = true;
		console.log('Inspection completed:', inspectionData);
		currentWorkflowView = 'to-pickup';
		
		// NEW: Scroll to top when navigating to to-pickup after inspection
		setTimeout(() => {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}, 100);
	}

	// NEW: Handle starting navigation from job selection
	function handleStartNavigation() {
		// No need to implement as the workflow is simplified
	}

	// NEW: Handle starting transit
	function handleStartTransitToPickup() {
		// No need to implement as the workflow is simplified
	}

	// NEW: Handle arriving at pickup site
	function handleArriveAtPickup() {
		// No need to implement as the workflow is simplified
	}

	// NEW: Handle starting delivery navigation
	function handleStartDeliveryNavigation() {
		// No need to implement as the workflow is simplified
	}

	// NEW: Handle starting transit to delivery
	function handleStartTransitToDelivery() {
		// No need to implement as the workflow is simplified
	}

	// NEW: Handle arriving at delivery site
	function handleArriveAtDelivery() {
		// No need to implement as the workflow is simplified
	}

	// Helper function to calculate realistic ETA
	function getCurrentTime(addMinutes = 0) {
		const now = new Date();
		now.setMinutes(now.getMinutes() + addMinutes);
		return now.toLocaleTimeString('en-US', { 
			hour: 'numeric', 
			minute: '2-digit',
			hour12: true 
		});
	}
</script>

<svelte:head>
	<title>Driver Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<WorkflowProgressShell 
	currentStep={currentWorkflowStep} 
	{completedSteps} 
	{driverInfo}
	on:reset-workflow={handleWorkflowReset}
	on:step-clicked={handleStepClick}
>
	<div class="driver-dashboard">
		<!-- PRESERVE: All existing conditional rendering logic -->
		{#if currentView === 'dashboard'}
			<!-- NEW: Simplified workflow router replaces 2000+ lines -->
			<DriverWorkflowRouter
				{currentWorkflowView}
				{sharedState}
				{eventHandlers}
			/>
		{/if}

		<!-- PRESERVE: Existing job map view -->
		{#if currentView === 'job-map' && activeJob}
			<JobMapView 
				job={activeJob}
				on:exit-map={handleExitMap}
				on:start-transit={handleStartTransit}
			/>
		{/if}

		<!-- PRESERVE: Existing in-transit view -->
		{#if currentView === 'in-transit' && activeJob}
			<InTransitView 
				job={activeJob}
				on:transit-complete={handleTransitComplete}
				on:exit-transit={() => currentView = 'job-map'}
			/>
		{/if}
	</div>

	<!-- PRESERVE: Existing modals -->
	{#if showJobModal && selectedJob}
		<JobDetailModal 
			job={selectedJob}
			isOpen={showJobModal}
			on:close={() => showJobModal = false}
			on:start-navigation={handleJobStart}
		/>
	{/if}
</WorkflowProgressShell>

<style>
	.driver-dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9f0 50%, #e8f5e8 100%);
		padding-bottom: 80px;
	}
</style> 