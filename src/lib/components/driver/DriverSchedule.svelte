<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ScheduleHeader from './schedule/ScheduleHeader.svelte';
	import SummaryCards from './schedule/SummaryCards.svelte';
	import JobCard from './schedule/JobCard.svelte';
	import QuickActionButtons from './schedule/QuickActionButtons.svelte';

	const dispatch = createEventDispatcher();

	// NEW: Accept current workflow step to control highlighting
	export let currentWorkflowStep: string = 'job-overview';

	// Job/Haul data structure
	interface ScheduledJob {
		id: string;
		accountName: string;
		accountLogo?: string;
		accountColor: string;
		pickupLocation: {
			name: string;
			address: string;
			padName: string;
			tankNumber: string;
			coordinates: { lat: number; lng: number };
		};
		deliveryLocation: {
			name: string;
			address: string;
			coordinates: { lat: number; lng: number };
		};
		estimatedBarrels: number;
		tankLevelHeight: string;
		scheduledTime: Date;
		estimatedDuration: number; // hours
		priority: 'urgent' | 'high' | 'normal' | 'low';
		status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
		distance: number; // miles
		routeType: 'highway' | 'rural' | 'city';
		specialInstructions?: string;
		expectedTemperature: { min: number; max: number };
		loadType: 'crude' | 'condensate' | 'refined';
		hazmatRequired: boolean;
		customerContact: {
			name: string;
			phone: string;
		};
	}

	// Mock scheduled jobs for today
	let todaysJobs: ScheduledJob[] = [
		{
			id: 'JOB-001',
			accountName: 'Shell Energy',
			accountColor: '#FFD100',
			pickupLocation: {
				name: 'QRVWX',
				address: 'LAT: 28.970028, LONG: -98.235694',
				padName: 'Eagle Point Pad',
				tankNumber: 'Tank 7-A',
				coordinates: { lat: 28.970028, lng: -98.235694 }
			},
			deliveryLocation: {
				name: 'Falls City Harvest Pipeline',
				address: 'LAT: 28.99683, LONG: -98.03021',
				coordinates: { lat: 28.99683, lng: -98.03021 }
			},
			estimatedBarrels: 185,
			tankLevelHeight: "17' 4\"",
			scheduledTime: new Date(2024, 0, 15, 6, 0), // 6:00 AM
			estimatedDuration: 3.5,
			priority: 'high',
			status: 'scheduled',
			distance: 24.5,
			routeType: 'highway',
			specialInstructions: 'Use east gate entrance. Check tank temp before loading.',
			expectedTemperature: { min: 75, max: 85 },
			loadType: 'crude',
			hazmatRequired: true,
			customerContact: {
				name: 'Mike Rodriguez',
				phone: '(432) 555-0123'
			}
		},
		{
			id: 'JOB-002',
			accountName: 'Devon Energy',
			accountColor: '#0033A0',
			pickupLocation: {
				name: 'Carmody',
				address: 'LAT: 28.84805, LONG: -97.98977',
				padName: 'Thunder Creek Pad',
				tankNumber: 'Tank 12-B',
				coordinates: { lat: 28.84805, lng: -97.98977 }
			},
			deliveryLocation: {
				name: 'Sugarhorn Marathon Facility',
				address: 'LAT: 28.84889, LONG: -97.99120',
				coordinates: { lat: 28.84889, lng: -97.99120 }
			},
			estimatedBarrels: 210,
			tankLevelHeight: "22' 8\"",
			scheduledTime: new Date(2024, 0, 15, 11, 30), // 11:30 AM
			estimatedDuration: 4.2,
			priority: 'urgent',
			status: 'scheduled',
			distance: 89.3,
			routeType: 'highway',
			specialInstructions: 'Priority delivery - customer waiting. Call dispatch if delays.',
			expectedTemperature: { min: 78, max: 88 },
			loadType: 'crude',
			hazmatRequired: true,
			customerContact: {
				name: 'Sarah Chen',
				phone: '(361) 555-0456'
			}
		},
		{
			id: 'JOB-003',
			accountName: 'Shell Energy',
			accountColor: '#0066CC',
			pickupLocation: {
				name: 'Linhart',
				address: 'LAT: 28.93972, LONG: -97.86080',
				padName: 'Mustang Ridge Pad',
				tankNumber: 'Tank 5-C',
				coordinates: { lat: 28.93972, lng: -97.86080 }
			},
			deliveryLocation: {
				name: 'Falls City Harvest Pipeline',
				address: 'LAT: 28.99683, LONG: -98.03021',
				coordinates: { lat: 28.99683, lng: -98.03021 }
			},
			estimatedBarrels: 165,
			tankLevelHeight: "14' 11\"",
			scheduledTime: new Date(2024, 0, 15, 16, 0), // 4:00 PM
			estimatedDuration: 3.8,
			priority: 'normal',
			status: 'scheduled',
			distance: 156.7,
			routeType: 'highway',
			expectedTemperature: { min: 76, max: 82 },
			loadType: 'condensate',
			hazmatRequired: true,
			customerContact: {
				name: 'David Thompson',
				phone: '(713) 555-0789'
			}
		}
	];

	// Driver information - would come from auth store
	let driverInfo = {
		name: 'Mike Johnson',
		id: 'DRV-892',
		truckId: 'TX-TRK-892',
		trailerNumber: 'TX-TRL-445',
		currentLocation: 'Houston Dispatch Yard'
	};

	// Schedule stats
	$: totalJobs = todaysJobs.length;
	$: totalBarrels = todaysJobs.reduce((sum, job) => sum + job.estimatedBarrels, 0);
	$: totalDistance = todaysJobs.reduce((sum, job) => sum + job.distance, 0);
	$: totalHours = todaysJobs.reduce((sum, job) => sum + job.estimatedDuration, 0);
	$: urgentJobs = todaysJobs.filter(job => job.priority === 'urgent').length;

	// Current time tracking
	let currentTime = new Date();
	let timeInterval: number;

	// Update current time every minute
	if (typeof window !== 'undefined') {
		timeInterval = window.setInterval(() => {
			currentTime = new Date();
		}, 60000);
	}

	// Event handlers
	function handleJobSelected(event: CustomEvent) {
		const { job } = event.detail;
		dispatch('job-selected', { job });
	}

	// NEW: Determine if a job should be highlighted based on workflow step
	function shouldHighlightJob(jobIndex: number): boolean {
		console.log('🟡 Checking highlight for job index:', jobIndex, 'currentStep:', currentWorkflowStep);
		
		if (currentWorkflowStep === 'to-pickup') {
			const highlight = jobIndex === 0; // Highlight FIRST job (index 0)
			console.log('🟡 to-pickup step - highlight first job:', highlight);
			return highlight;
		}
		if (currentWorkflowStep === 'to-delivery') {
			const highlight = jobIndex === 1; // Highlight SECOND job (index 1)
			console.log('🟡 to-delivery step - highlight second job:', highlight);
			return highlight;
		}
		return false;
	}

	function handleEmergencyContact() {
		console.log('Emergency contact initiated');
		// Handle emergency contact logic
	}

	function handleCallDispatch() {
		console.log('Calling dispatch');
		// Handle dispatch call logic
	}

	function handleOpenNavigation() {
		console.log('Opening navigation');
		// Handle navigation logic
	}
</script>

<div class="driver-schedule mobile-container">
	<!-- Header Component -->
	<ScheduleHeader 
		{driverInfo}
		{currentTime}
		{totalJobs}
		{urgentJobs}
	/>

	<!-- Summary Cards Component -->
	<SummaryCards 
		{totalBarrels}
		{totalDistance}
		{totalHours}
		trailerNumber={driverInfo.trailerNumber}
	/>

	<!-- Job List -->
	<div class="jobs-section">
		<div class="section-header">
			<h2 class="section-title">Scheduled Jobs</h2>
			<p class="section-subtitle">Open Tickets</p>
		</div>

		<div class="job-list">
			{#each todaysJobs as job, index}
				<JobCard 
					{job} 
					{index}
					isHighlighted={shouldHighlightJob(index)}
					on:job-selected={handleJobSelected}
				/>
			{/each}
		</div>
	</div>

	<!-- Quick Action Buttons Component -->
	<QuickActionButtons 
		on:emergency-contact={handleEmergencyContact}
		on:call-dispatch={handleCallDispatch}
		on:open-navigation={handleOpenNavigation}
	/>
</div>

<style>
	/* Global box-sizing for better layout control */
	.driver-schedule *,
	.driver-schedule *::before,
	.driver-schedule *::after {
		box-sizing: border-box;
	}

	.driver-schedule {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e8f5e8 100%);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.mobile-container {
		max-width: 100%;
		margin: 0 auto;
		padding: 0;
	}

	@media (min-width: 768px) {
		.mobile-container {
			max-width: 800px;
			padding: 0 12px;
		}
	}

	/* Jobs Section */
	.jobs-section {
		padding: 0 12px 16px;
	}

	.section-header {
		margin-bottom: 16px;
		padding: 0 4px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 4px 0;
	}

	.section-subtitle {
		font-size: 14px;
		color: #6b7280;
		margin: 0;
	}

	.job-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style> 