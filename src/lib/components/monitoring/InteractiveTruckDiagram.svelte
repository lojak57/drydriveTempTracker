<script lang="ts">
	import { valveStatuses, sensorReadings, toggleValve, type ValveStatus, type SensorReading } from '$lib/stores/truckMonitoringData';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import ValveOverlay from './ValveOverlay.svelte';

	const dispatch = createEventDispatcher();

	export let showLabels = true;
	export let interactive = true;

	let selectedHotspot: string | null = null;
	let imageLoaded = false;
	let showLoadingState = true;
	let showErrorState = false;
	let hoveredValve: string | null = null;

	// Define valve configuration for clean, maintainable setup
	const valveConfig = [
		{
			id: 'vent',
			top: '48%',
			left: '51%',
			status: 'closed' as const,
			label: 'Vent Valve - CLOSED',
			align: 'top' as const
		},
		{
			id: 'pressure-relief-tank',
			top: '45%',
			left: '30%',
			status: 'closed' as const,
			label: 'Pressure Relief - CLOSED',
			align: 'left' as const
		},
		{
			id: 'pressure-relief-cab',
			top: '45%',
			left: '28%',
			status: 'closed' as const,
			label: 'PR CAB - CLOSED',
			align: 'left' as const
		},
		{
			id: 'load-left',
			top: '52%',
			left: '20%',
			status: 'closed' as const,
			label: 'Load Left - CLOSED',
			align: 'left' as const
		},
		{
			id: 'belly',
			top: '62%',
			left: '45%',
			status: 'open' as const,
			label: 'Belly Valve - OPEN',
			align: 'left' as const
		},
		{
			id: 'fire',
			top: '58%',
			left: '51%',
			status: 'closed' as const,
			label: 'Fire Valve - CLOSED',
			align: 'right' as const
		},
		{
			id: 'load-right',
			top: '52%',
			left: '80%',
			status: 'open' as const,
			label: 'Load Right - OPEN',
			align: 'right' as const
		}
	];

	// Define sensor configuration for clean positioning
	const sensorConfig = [
		{
			id: 'temp-1',
			top: '52%',
			left: '25%',
			value: '145°F',
			status: 'normal'
		},
		{
			id: 'temp-2',
			top: '65%',
			left: '25%',
			value: '142°F',
			status: 'normal'
		},
		{
			id: 'temp-3',
			top: '58%',
			left: '22%',
			value: '148°F',
			status: 'warning'
		}
	];

	function handleValveClick(valve: ValveStatus) {
		if (!interactive) return;
		
		if (valve.requiresConfirmation) {
			const confirmed = confirm(`Toggle ${valve.name}?\nCurrent status: ${valve.status.toUpperCase()}`);
			if (confirmed) {
				toggleValve(valve.id);
				dispatch('valve-toggled', { valve });
			}
		} else {
			toggleValve(valve.id);
			dispatch('valve-toggled', { valve });
		}
	}

	function handleSensorClick(sensor: SensorReading) {
		selectedHotspot = sensor.id;
		dispatch('sensor-clicked', { sensor });
	}

	function handleValveHover(valveId: string) {
		hoveredValve = valveId;
	}

	function handleValveLeave() {
		hoveredValve = null;
	}

	function handleValveToggle(valveId: string) {
		console.log(`Valve ${valveId} clicked - implement toggle logic`);
		// TODO: Integrate with actual valve control system
	}

	function handleImageLoad() {
		console.log('✅ Truck diagram image loaded successfully');
		console.log('📐 Image dimensions will be available after render');
		imageLoaded = true;
		showLoadingState = false;
		showErrorState = false;
	}

	function handleImageError(event: Event) {
		console.error('❌ Failed to load truck diagram image');
		console.error('Error event:', event);
		console.error('Image src was:', (event.target as HTMLImageElement)?.src);
		imageLoaded = false;
		showLoadingState = false;
		showErrorState = true;
	}

	onMount(() => {
		console.log('🚛 InteractiveTruckDiagram component mounted');
		console.log('📍 Image source: /truck-diagram.png');
		console.log('🔥 NEW CODE VERSION - PRESSURE RELIEF VALVES ADDED');
		console.log('Valve config length:', valveConfig.length);
	});
</script>

<div class="truck-diagram-container">
	<div class="diagram-header">
		<h3 class="diagram-title">🚛 Live Truck Monitoring - PLN-014</h3>
		<div class="connection-status connected">
			<div class="status-dot"></div>
			<span>LOVISVision Connected</span>
		</div>
	</div>

	<div class="diagram-content">
		<div class="truck-wireframe-container">
			<!-- Compass Labels -->
			<div class="compass-labels">
				<div class="compass-label">Driver Side</div>
				<div class="compass-label">←→</div>
				<div class="compass-label">Passenger</div>
			</div>

			{#if showLoadingState}
				<div class="loading-indicator">
					<div class="spinner"></div>
					<p>Loading truck diagram...</p>
				</div>
			{/if}

			{#if showErrorState}
				<div class="error-indicator">
					<p>⚠️ Could not load truck diagram</p>
					<p>Debug: Image path = /truck-diagram.png</p>
					<p>Check browser network tab for 404 errors</p>
				</div>
			{/if}

			{#if imageLoaded}
				<!-- Image and overlays wrapper with relative positioning -->
				<div class="truck-image-wrapper">
					<img
						src="/truck-diagram.png"
						alt="Truck Wireframe Diagram"
						class="truck-wireframe loaded"
						on:load={handleImageLoad}
						on:error={handleImageError}
					/>

					<!-- Clean Valve Overlays using ValveOverlay component -->
					{#each valveConfig as valve (valve.id)}
						<ValveOverlay
							top={valve.top}
							left={valve.left}
							status={valve.status}
							label={valve.label}
							align={valve.align}
							valveId={valve.id}
							{interactive}
							onHover={handleValveHover}
							onLeave={handleValveLeave}
							onClick={() => handleValveToggle(valve.id)}
							showTooltip={hoveredValve === valve.id}
						/>
					{/each}

					<!-- DryDrive Logo -->
					<div class="logo-overlay">
						<svg width="40" height="20" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
							<text x="50" y="30" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="12" font-weight="bold">DryDrive</text>
						</svg>
					</div>
				</div>
			{:else}
				<img
					src="/truck-diagram.png"
					alt="Truck Wireframe Diagram"
					class="truck-wireframe"
					on:load={handleImageLoad}
					on:error={handleImageError}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.truck-diagram-container {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.diagram-header {
		background: #f8fafc;
		padding: 16px 20px;
		border-bottom: 1px solid #e2e8f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.diagram-title {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.connection-status {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		font-weight: 500;
	}

	.connection-status.connected {
		color: #16a34a;
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #16a34a;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.diagram-content {
		padding: 20px;
	}

	.truck-wireframe-container {
		position: relative;
		background: white;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
		border: 1px solid #f1f5f9;
		min-height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.truck-wireframe {
		position: relative;
		width: 100%;
		max-width: 700px;
		height: auto;
		opacity: 0;
		transition: opacity 0.3s ease-in-out;
	}

	.truck-wireframe.loaded {
		opacity: 1;
	}

	.truck-image-wrapper {
		position: relative;
		display: inline-block;
		max-width: 700px;
		width: 100%;
	}

	.loading-indicator, .error-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		background: #f8fafc;
		border: 2px dashed #e2e8f0;
		border-radius: 8px;
		color: #64748b;
		text-align: center;
	}

	.error-indicator {
		border-color: #fca5a5;
		background: #fef2f2;
		color: #dc2626;
	}

	.spinner {
		width: 24px;
		height: 24px;
		border: 2px solid #e2e8f0;
		border-top: 2px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 12px;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.compass-labels {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 10px;
		color: #64748b;
		font-weight: 500;
	}

	.compass-label {
		padding: 2px 6px;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 4px;
		text-align: center;
		border: 1px solid #f1f5f9;
	}

	.sensor-indicator {
		position: absolute;
		width: 8px;
		height: 8px;
		background-color: #3b82f6;
		border: 1px solid white;
		transform: rotate(45deg);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.sensor-indicator:hover {
		transform: rotate(45deg) scale(1.3);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
	}

	.sensor-1 { top: 25%; left: 15%; }
	.sensor-2 { top: 25%; right: 20%; }
	.sensor-3 { bottom: 25%; left: 20%; }
	.sensor-4 { bottom: 25%; right: 15%; }

	.logo-overlay {
		position: absolute;
		bottom: 10px;
		right: 10px;
		width: 40px;
		height: auto;
		opacity: 0.7;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.truck-wireframe-container {
			min-height: 350px;
			padding: 12px;
		}

		.diagram-header {
			padding: 12px 16px;
		}

		.diagram-title {
			font-size: 14px;
		}

		.diagram-content {
			padding: 16px;
		}
	}

	@media (max-width: 480px) {
		.diagram-header {
			flex-direction: column;
			gap: 8px;
			align-items: flex-start;
		}

		.sensor-indicator {
			width: 6px;
			height: 6px;
		}

		.truck-wireframe-container {
			min-height: 300px;
		}
	}
</style> 