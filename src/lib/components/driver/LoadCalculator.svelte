<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Calculator, Truck, Weight, AlertTriangle } from 'lucide-svelte';

	// Props with defaults for typical oil field truck
	export let truckTare = 15000;
	export let trailerTare = 8000;
	export let driverWeight = 180;
	export let equipment = 500;
	export let materialDensity = 8.5; // lbs per gallon (typical for crude oil)
	export let weatherPenalty = 0;
	export let roadConditions: 'Good' | 'Fair' | 'Poor' = 'Good';

	const dispatch = createEventDispatcher<{
		'calculation-complete': {
			maxBarrels: number;
			totalVolume: number;
			availableWeight: number;
			weightUtilization: number;
		};
	}>();

	// Calculations (no backend dependencies)
	$: totalTare = truckTare + trailerTare + driverWeight + equipment;
	$: grossVehicleWeightLimit = 80000; // Standard DOT limit
	$: roadPenalty = roadConditions === 'Poor' ? 2000 : roadConditions === 'Fair' ? 1000 : 0;
	$: availableWeight = grossVehicleWeightLimit - totalTare - weatherPenalty - roadPenalty;
	$: maxBarrels = Math.floor(availableWeight / (materialDensity * 42)); // 42 gallons per barrel
	$: totalVolume = maxBarrels * 42; // Convert to gallons
	$: weightUtilization = (totalTare / grossVehicleWeightLimit) * 100;
	$: loadCapacityPercent = (availableWeight / grossVehicleWeightLimit) * 100;

	// Dispatch calculation results
	$: {
		dispatch('calculation-complete', {
			maxBarrels,
			totalVolume,
			availableWeight,
			weightUtilization
		});
	}

	// Helper functions
	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(Math.round(num));
	}

	function getCapacityStatus(percent: number): 'good' | 'warning' | 'danger' {
		if (percent >= 70) return 'good';
		if (percent >= 50) return 'warning';
		return 'danger';
	}

	$: capacityStatus = getCapacityStatus(loadCapacityPercent);
</script>

<div class="load-calculator">
	<div class="calculator-header">
		<div class="header-icon">
			<Calculator size={24} />
		</div>
		<div class="header-info">
			<h3>Load Calculator</h3>
			<p>Real-time capacity calculations</p>
		</div>
		<div class="status-badge" class:good={capacityStatus === 'good'} class:warning={capacityStatus === 'warning'} class:danger={capacityStatus === 'danger'}>
			{capacityStatus.toUpperCase()}
		</div>
	</div>

	<div class="calculator-content">
		<!-- Input Section -->
		<div class="input-section">
			<h4>Vehicle Specifications</h4>
			<div class="input-grid">
				<div class="input-group">
					<label for="truck-tare">Truck Tare Weight</label>
					<div class="input-with-unit">
						<input id="truck-tare" type="number" bind:value={truckTare} min="0" max="30000" />
						<span class="unit">lbs</span>
					</div>
				</div>

				<div class="input-group">
					<label for="trailer-tare">Trailer Tare Weight</label>
					<div class="input-with-unit">
						<input id="trailer-tare" type="number" bind:value={trailerTare} min="0" max="20000" />
						<span class="unit">lbs</span>
					</div>
				</div>

				<div class="input-group">
					<label for="driver-weight">Driver + Personal Gear</label>
					<div class="input-with-unit">
						<input id="driver-weight" type="number" bind:value={driverWeight} min="100" max="500" />
						<span class="unit">lbs</span>
					</div>
				</div>

				<div class="input-group">
					<label for="equipment">Equipment Weight</label>
					<div class="input-with-unit">
						<input id="equipment" type="number" bind:value={equipment} min="0" max="2000" />
						<span class="unit">lbs</span>
					</div>
				</div>

				<div class="input-group">
					<label for="material-density">Material Density</label>
					<div class="input-with-unit">
						<input id="material-density" type="number" bind:value={materialDensity} min="6" max="12" step="0.1" />
						<span class="unit">lbs/gal</span>
					</div>
				</div>

				<div class="input-group">
					<label for="weather-penalty">Weather Penalty</label>
					<div class="input-with-unit">
						<input id="weather-penalty" type="number" bind:value={weatherPenalty} min="0" max="5000" step="100" />
						<span class="unit">lbs</span>
					</div>
				</div>
			</div>

			<div class="road-conditions">
				<label>Road Conditions</label>
				<div class="condition-buttons">
					<button 
						class="condition-btn" 
						class:active={roadConditions === 'Good'}
						on:click={() => roadConditions = 'Good'}
					>
						Good
					</button>
					<button 
						class="condition-btn" 
						class:active={roadConditions === 'Fair'}
						on:click={() => roadConditions = 'Fair'}
					>
						Fair
					</button>
					<button 
						class="condition-btn" 
						class:active={roadConditions === 'Poor'}
						on:click={() => roadConditions = 'Poor'}
					>
						Poor
					</button>
				</div>
			</div>
		</div>

		<!-- Results Section -->
		<div class="results-section">
			<h4>Load Capacity Results</h4>
			
			<div class="results-grid">
				<div class="result-card primary">
					<div class="result-icon">
						<Truck size={20} />
					</div>
					<div class="result-content">
						<div class="result-value">{formatNumber(maxBarrels)}</div>
						<div class="result-label">Max Barrels</div>
					</div>
				</div>

				<div class="result-card">
					<div class="result-content">
						<div class="result-value">{formatNumber(totalVolume)}</div>
						<div class="result-label">Total Gallons</div>
					</div>
				</div>

				<div class="result-card">
					<div class="result-content">
						<div class="result-value">{formatNumber(availableWeight)}</div>
						<div class="result-label">Available Weight (lbs)</div>
					</div>
				</div>

				<div class="result-card">
					<div class="result-content">
						<div class="result-value">{formatNumber(totalTare)}</div>
						<div class="result-label">Total Tare Weight (lbs)</div>
					</div>
				</div>
			</div>

			<!-- Capacity Bar -->
			<div class="capacity-bar-container">
				<div class="capacity-header">
					<span class="capacity-label">Load Capacity</span>
					<span class="capacity-percent">{loadCapacityPercent.toFixed(1)}%</span>
				</div>
				<div class="capacity-bar">
					<div 
						class="capacity-fill" 
						class:good={capacityStatus === 'good'} 
						class:warning={capacityStatus === 'warning'} 
						class:danger={capacityStatus === 'danger'}
						style="width: {loadCapacityPercent}%"
					></div>
				</div>
				<div class="capacity-info">
					<small>DOT Limit: {formatNumber(grossVehicleWeightLimit)} lbs</small>
				</div>
			</div>

			<!-- Warnings -->
			{#if loadCapacityPercent < 50}
				<div class="warning-alert">
					<AlertTriangle size={16} />
					<span>Low load capacity. Check vehicle specifications.</span>
				</div>
			{/if}

			{#if availableWeight < 0}
				<div class="danger-alert">
					<AlertTriangle size={16} />
					<span>Vehicle exceeds DOT weight limits!</span>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.load-calculator {
		background: white;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		margin: 24px 0;
	}

	.calculator-header {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		padding: 20px 24px;
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

	.header-info {
		flex: 1;
	}

	.header-info h3 {
		margin: 0 0 4px 0;
		font-size: 20px;
		font-weight: 700;
	}

	.header-info p {
		margin: 0;
		opacity: 0.9;
		font-size: 14px;
	}

	.status-badge {
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-badge.good {
		background: rgba(16, 185, 129, 0.2);
		color: #10b981;
	}

	.status-badge.warning {
		background: rgba(245, 158, 11, 0.2);
		color: #f59e0b;
	}

	.status-badge.danger {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
	}

	.calculator-content {
		padding: 24px;
	}

	.input-section, .results-section {
		margin-bottom: 32px;
	}

	.input-section h4, .results-section h4 {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0 0 16px 0;
	}

	.input-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-bottom: 24px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.input-group label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.input-with-unit {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-with-unit input {
		flex: 1;
		padding: 10px 12px;
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		font-size: 14px;
		transition: border-color 0.2s ease;
	}

	.input-with-unit input:focus {
		outline: none;
		border-color: #3b82f6;
	}

	.unit {
		position: absolute;
		right: 12px;
		font-size: 12px;
		color: #6b7280;
		font-weight: 500;
		pointer-events: none;
	}

	.road-conditions {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.road-conditions label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.condition-buttons {
		display: flex;
		gap: 8px;
	}

	.condition-btn {
		flex: 1;
		padding: 10px 16px;
		border: 2px solid #e5e7eb;
		background: white;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.condition-btn:hover {
		border-color: #3b82f6;
	}

	.condition-btn.active {
		background: #3b82f6;
		border-color: #3b82f6;
		color: white;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-bottom: 24px;
	}

	.result-card {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 20px;
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.result-card.primary {
		background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
		border-color: #3b82f6;
	}

	.result-icon {
		width: 40px;
		height: 40px;
		background: #3b82f6;
		color: white;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.result-content {
		flex: 1;
	}

	.result-value {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		line-height: 1;
	}

	.result-label {
		font-size: 12px;
		color: #64748b;
		margin-top: 4px;
		font-weight: 500;
	}

	.capacity-bar-container {
		background: #f8fafc;
		border-radius: 12px;
		padding: 20px;
		border: 1px solid #e2e8f0;
	}

	.capacity-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.capacity-label {
		font-size: 14px;
		font-weight: 500;
		color: #374151;
	}

	.capacity-percent {
		font-size: 16px;
		font-weight: 700;
		color: #1e293b;
	}

	.capacity-bar {
		width: 100%;
		height: 8px;
		background: #e5e7eb;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 8px;
	}

	.capacity-fill {
		height: 100%;
		border-radius: 4px;
		transition: all 0.3s ease;
	}

	.capacity-fill.good {
		background: linear-gradient(90deg, #10b981, #059669);
	}

	.capacity-fill.warning {
		background: linear-gradient(90deg, #f59e0b, #d97706);
	}

	.capacity-fill.danger {
		background: linear-gradient(90deg, #ef4444, #dc2626);
	}

	.capacity-info {
		text-align: center;
	}

	.capacity-info small {
		color: #6b7280;
		font-size: 12px;
	}

	.warning-alert, .danger-alert {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 16px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		margin-top: 16px;
	}

	.warning-alert {
		background: #fef3c7;
		color: #d97706;
		border: 1px solid #fcd34d;
	}

	.danger-alert {
		background: #fee2e2;
		color: #dc2626;
		border: 1px solid #fca5a5;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.calculator-header {
			padding: 16px 20px;
		}

		.calculator-content {
			padding: 20px;
		}

		.input-grid {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.results-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
		}

		.result-card {
			padding: 16px;
		}

		.result-value {
			font-size: 20px;
		}

		.condition-buttons {
			flex-direction: column;
		}
	}
</style> 