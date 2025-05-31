<script lang="ts">
	import CalibrationCostVisualizer from '$lib/components/calibration/CalibrationCostVisualizer.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		// Set page title
		document.title = 'Coriolis Calibration Cost Visualizer - DryDrive Oil Field Temp Tracker';
	});
</script>

<svelte:head>
	<title>Coriolis Calibration Cost Visualizer - DryDrive Oil Field Temp Tracker</title>
	<meta name="description" content="Calculate the true cost of monthly calibrations across your fleet and discover potential savings with VeriHaul optimization.">
</svelte:head>

<CalibrationCostVisualizer /> 