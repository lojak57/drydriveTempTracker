<script lang="ts">
	import SmartCalibrationRecommender from '$lib/components/calibration/SmartCalibrationRecommender.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		// Set page title
		document.title = 'Smart Calibration Recommender - DryDrive Oil Field Temp Tracker';
	});

	function handleScheduleCalibration(event: CustomEvent) {
		const { truckIds } = event.detail;
		console.log('Calibration scheduled for trucks:', truckIds);
		// Show success message or redirect to calibration scheduling
		alert(`Calibration scheduled for ${truckIds.length} truck${truckIds.length > 1 ? 's' : ''}: ${truckIds.join(', ')}`);
	}

	function handleViewTruckDetails(event: CustomEvent) {
		const { truck } = event.detail;
		console.log('Viewing details for truck:', truck.id);
		// Navigate to truck details or show modal
		alert(`Viewing details for truck ${truck.id}`);
	}
</script>

<svelte:head>
	<title>Smart Calibration Recommender - DryDrive Oil Field Temp Tracker</title>
	<meta name="description" content="AI-powered fleet monitoring and data-driven calibration recommendations for optimal Coriolis meter accuracy.">
</svelte:head>

<SmartCalibrationRecommender 
	on:schedule-calibration={handleScheduleCalibration}
	on:view-truck-details={handleViewTruckDetails}
/> 