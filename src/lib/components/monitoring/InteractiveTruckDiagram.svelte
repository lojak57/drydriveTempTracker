<script lang="ts">
	import { valveStatuses, sensorReadings, toggleValve, type ValveStatus, type SensorReading } from '$lib/stores/truckMonitoringData';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let showLabels = true;
	export let interactive = true;

	let selectedHotspot: string | null = null;

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

	function getValveColor(status: string): string {
		switch (status) {
			case 'open': return '#22c55e'; // Green
			case 'closed': return '#ef4444'; // Red
			case 'unknown': return '#f59e0b'; // Orange
			default: return '#94a3b8'; // Gray
		}
	}

	function getSensorColor(status: string): string {
		switch (status) {
			case 'normal': return '#22c55e'; // Green
			case 'warning': return '#f59e0b'; // Orange
			case 'critical': return '#ef4444'; // Red
			default: return '#94a3b8'; // Gray
		}
	}

	function formatSensorValue(sensor: SensorReading): string {
		return `${sensor.currentValue}${sensor.unit}`;
	}

	// Position functions for valves based on truck layout
	function getValvePosition(valveId: string): { x: number, y: number } {
		switch (valveId) {
			case 'pressure-relief-vent':
				return { x: 350, y: 180 }; // Spill dam area
			case 'belly-valve':
				return { x: 300, y: 250 }; // After pump
			case 'fire-valve':
				return { x: 700, y: 300 }; // Bottom center of trailer
			case 'vent-valve':
				return { x: 700, y: 150 }; // Top of tank
			case 'right-load-valve':
				return { x: 1050, y: 225 }; // Right side of trailer
			case 'left-load-valve':
				return { x: 350, y: 225 }; // Left side of trailer
			default:
				return { x: 0, y: 0 };
		}
	}

	// Position functions for sensors
	function getSensorPosition(sensorId: string): { x: number, y: number } {
		switch (sensorId) {
			case 'tanker-onload-pressure':
				return { x: 280, y: 200 }; // Between pump & tanker
			case 'tanker-offload-vacuum':
				return { x: 280, y: 250 }; // Between pump & tanker
			case 'external-offload-pressure':
				return { x: 250, y: 225 }; // Pump to external
			default:
				return { x: 0, y: 0 };
		}
	}

	// Connection points for sensor lines
	function getSensorConnectionPoint(sensorId: string): { x: number, y: number } {
		switch (sensorId) {
			case 'tanker-onload-pressure':
				return { x: 320, y: 200 };
			case 'tanker-offload-vacuum':
				return { x: 320, y: 250 };
			case 'external-offload-pressure':
				return { x: 200, y: 225 };
			default:
				return { x: 0, y: 0 };
		}
	}

	// Valve icons based on type
	function getValveIcon(valveId: string): string {
		switch (valveId) {
			case 'pressure-relief-vent': return '💨';
			case 'belly-valve': return '🔧';
			case 'fire-valve': return '🔥';
			case 'vent-valve': return '💨';
			case 'right-load-valve': return '➡️';
			case 'left-load-valve': return '⬅️';
			default: return '⚙️';
		}
	}
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
		<!-- SVG Truck Diagram -->
		<div class="truck-svg-container">
			<svg viewBox="0 0 1200 400" class="truck-svg">
				<!-- Truck Cab -->
				<g class="truck-cab">
					<rect x="50" y="150" width="200" height="150" rx="10" fill="none" stroke="#64748b" stroke-width="2"/>
					<rect x="70" y="170" width="160" height="80" rx="5" fill="none" stroke="#64748b" stroke-width="1"/>
					<!-- Cab details -->
					<circle cx="80" cy="320" r="25" fill="none" stroke="#64748b" stroke-width="2"/>
					<circle cx="220" cy="320" r="25" fill="none" stroke="#64748b" stroke-width="2"/>
				</g>

				<!-- Tank Trailer -->
				<g class="tank-trailer">
					<!-- Main tank body -->
					<ellipse cx="700" cy="225" rx="400" ry="75" fill="none" stroke="#64748b" stroke-width="2"/>
					<line x1="300" y1="225" x2="1100" y2="225" stroke="#64748b" stroke-width="1" stroke-dasharray="5,5"/>
					
					<!-- Tank supports -->
					<rect x="350" y="300" width="700" height="20" rx="5" fill="none" stroke="#64748b" stroke-width="1"/>
					
					<!-- Wheels -->
					<circle cx="400" cy="340" r="25" fill="none" stroke="#64748b" stroke-width="2"/>
					<circle cx="500" cy="340" r="25" fill="none" stroke="#64748b" stroke-width="2"/>
					<circle cx="900" cy="340" r="25" fill="none" stroke="#64748b" stroke-width="2"/>
					<circle cx="1000" cy="340" r="25" fill="none" stroke="#64748b" stroke-width="2"/>
				</g>

				<!-- DryDrive Logo -->
				<g class="logo-container">
					<rect x="600" y="200" width="200" height="50" rx="5" fill="rgba(0,0,0,0.8)"/>
					<text x="700" y="220" text-anchor="middle" fill="#7CB342" font-family="Arial, sans-serif" font-size="14" font-weight="bold">DRYDRIVE</text>
					<text x="700" y="235" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">Oil Transport Operations</text>
				</g>

				<!-- Interactive Valve Hotspots -->
				{#each $valveStatuses as valve}
					{@const position = getValvePosition(valve.id)}
					<g class="valve-hotspot" on:click={() => handleValveClick(valve)} class:interactive>
						<!-- Valve indicator circle -->
						<circle 
							cx={position.x} 
							cy={position.y} 
							r="12" 
							fill={getValveColor(valve.status)}
							stroke="white" 
							stroke-width="2"
							class="valve-indicator"
							class:pulsing={valve.status === 'unknown'}
						/>
						
						<!-- Valve icon -->
						<text 
							x={position.x} 
							y={position.y + 4} 
							text-anchor="middle" 
							fill="white" 
							font-size="12"
							font-weight="bold"
							pointer-events="none"
						>
							{getValveIcon(valve.id)}
						</text>

						{#if showLabels}
							<!-- Valve label -->
							<text 
								x={position.x} 
								y={position.y - 20} 
								text-anchor="middle" 
								fill="#374151" 
								font-size="10"
								font-weight="500"
								pointer-events="none"
							>
								{valve.name.split(' ')[0]}
							</text>
						{/if}
					</g>
				{/each}

				<!-- Interactive Sensor Hotspots -->
				{#each $sensorReadings as sensor}
					{@const position = getSensorPosition(sensor.id)}
					<g class="sensor-hotspot" on:click={() => handleSensorClick(sensor)}>
						<!-- Sensor indicator diamond -->
						<rect 
							x={position.x - 8} 
							y={position.y - 8} 
							width="16" 
							height="16" 
							rx="2"
							transform="rotate(45 {position.x} {position.y})"
							fill={getSensorColor(sensor.status)}
							stroke="white" 
							stroke-width="2"
							class="sensor-indicator"
							class:pulsing={sensor.status === 'critical'}
						/>
						
						{#if showLabels}
							<!-- Sensor value display -->
							<rect 
								x={position.x - 25} 
								y={position.y + 15} 
								width="50" 
								height="20" 
								rx="3"
								fill="rgba(0,0,0,0.8)"
							/>
							<text 
								x={position.x} 
								y={position.y + 28} 
								text-anchor="middle" 
								fill="white" 
								font-size="9"
								font-weight="600"
								pointer-events="none"
							>
								{formatSensorValue(sensor)}
							</text>
						{/if}
					</g>
				{/each}

				<!-- Connection lines for sensors -->
				{#each $sensorReadings as sensor}
					{@const position = getSensorPosition(sensor.id)}
					{@const connectionPoint = getSensorConnectionPoint(sensor.id)}
					<line 
						x1={position.x} 
						y1={position.y}
						x2={connectionPoint.x}
						y2={connectionPoint.y}
						stroke="#94a3b8"
						stroke-width="1"
						stroke-dasharray="3,3"
						opacity="0.6"
					/>
				{/each}
			</svg>
		</div>

		<!-- Legend -->
		<div class="diagram-legend">
			<div class="legend-section">
				<h4>Valve Status</h4>
				<div class="legend-items">
					<div class="legend-item">
						<div class="legend-indicator valve" style="background-color: #22c55e;"></div>
						<span>Open</span>
					</div>
					<div class="legend-item">
						<div class="legend-indicator valve" style="background-color: #ef4444;"></div>
						<span>Closed</span>
					</div>
					<div class="legend-item">
						<div class="legend-indicator valve" style="background-color: #f59e0b;"></div>
						<span>Unknown</span>
					</div>
				</div>
			</div>
			
			<div class="legend-section">
				<h4>Sensor Status</h4>
				<div class="legend-items">
					<div class="legend-item">
						<div class="legend-indicator sensor" style="background-color: #22c55e;"></div>
						<span>Normal</span>
					</div>
					<div class="legend-item">
						<div class="legend-indicator sensor" style="background-color: #f59e0b;"></div>
						<span>Warning</span>
					</div>
					<div class="legend-item">
						<div class="legend-indicator sensor" style="background-color: #ef4444;"></div>
						<span>Critical</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.truck-diagram-container {
		background: rgba(255, 255, 255, 0.98);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.diagram-header {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		padding: 16px 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.diagram-title {
		font-size: 18px;
		font-weight: 600;
		color: #0f172a;
		margin: 0;
	}

	.connection-status {
		display: flex;
		align-items: center;
		gap: 8px;
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

	.diagram-content {
		display: grid;
		grid-template-columns: 1fr 250px;
		gap: 20px;
		padding: 20px;
	}

	.truck-svg-container {
		background: #fafafa;
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		padding: 20px;
		overflow: hidden;
	}

	.truck-svg {
		width: 100%;
		height: auto;
		max-height: 400px;
	}

	.valve-hotspot.interactive {
		cursor: pointer;
	}

	.valve-indicator {
		transition: all 0.2s ease;
	}

	.valve-hotspot:hover .valve-indicator {
		r: 14;
		filter: brightness(1.1);
	}

	.sensor-indicator {
		transition: all 0.2s ease;
	}

	.sensor-hotspot {
		cursor: pointer;
	}

	.sensor-hotspot:hover .sensor-indicator {
		filter: brightness(1.1);
		transform: scale(1.1);
	}

	.pulsing {
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.diagram-legend {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.legend-section h4 {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		margin: 0 0 12px 0;
	}

	.legend-items {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: #64748b;
	}

	.legend-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid white;
	}

	.legend-indicator.sensor {
		border-radius: 2px;
		transform: rotate(45deg);
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.diagram-content {
			grid-template-columns: 1fr;
		}

		.diagram-legend {
			flex-direction: row;
			justify-content: space-around;
		}

		.truck-svg {
			max-height: 300px;
		}
	}
</style> 