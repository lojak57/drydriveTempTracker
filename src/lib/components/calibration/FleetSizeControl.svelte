<script lang="ts">
	import { calibrationConfig } from '$lib/stores/calibrationData';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let fleetSize = 100;
	let isSliding = false;

	// Subscribe to store changes
	calibrationConfig.subscribe((config) => {
		fleetSize = config.fleetSize;
	});

	function updateFleetSize(newSize: number) {
		if (newSize >= 10 && newSize <= 1000) {
			calibrationConfig.update((config) => ({
				...config,
				fleetSize: newSize
			}));
			dispatch('change', { fleetSize: newSize });
		}
	}

	function handleSliderInput(event: Event) {
		isSliding = true;
		const target = event.target as HTMLInputElement;
		updateFleetSize(parseInt(target.value));
	}

	function handleSliderEnd() {
		isSliding = false;
	}

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = parseInt(target.value);
		if (!isNaN(value)) {
			updateFleetSize(value);
		}
	}

	function incrementSize(amount: number) {
		updateFleetSize(fleetSize + amount);
	}

	// Suggested fleet sizes for quick selection
	const suggestedSizes = [25, 50, 100, 250, 500, 750];
</script>

<div class="fleet-control-container">
	<div class="control-header">
		<h3 class="control-title">Fleet Size</h3>
		<div class="current-size" class:sliding={isSliding}>
			{fleetSize.toLocaleString()} trucks
		</div>
	</div>

	<!-- Quick Size Buttons -->
	<div class="quick-sizes">
		{#each suggestedSizes as size}
			<button
				class="size-btn"
				class:active={fleetSize === size}
				on:click={() => updateFleetSize(size)}
			>
				{size}
			</button>
		{/each}
	</div>

	<!-- Slider Control -->
	<div class="slider-container">
		<input
			type="range"
			min="10"
			max="1000"
			step="5"
			bind:value={fleetSize}
			on:input={handleSliderInput}
			on:mouseup={handleSliderEnd}
			on:touchend={handleSliderEnd}
			class="fleet-slider"
		/>
		<div class="slider-labels">
			<span>10</span>
			<span>500</span>
			<span>1000</span>
		</div>
	</div>

	<!-- Manual Input -->
	<div class="manual-input">
		<label for="fleet-input">Exact number:</label>
		<div class="input-group">
			<button on:click={() => incrementSize(-10)} class="increment-btn">-10</button>
			<button on:click={() => incrementSize(-1)} class="increment-btn">-1</button>
			<input
				id="fleet-input"
				type="number"
				min="10"
				max="1000"
				bind:value={fleetSize}
				on:input={handleInputChange}
				class="fleet-input"
			/>
			<button on:click={() => incrementSize(1)} class="increment-btn">+1</button>
			<button on:click={() => incrementSize(10)} class="increment-btn">+10</button>
		</div>
	</div>
</div>

<style>
	.fleet-control-container {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.control-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.control-title {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.current-size {
		font-size: 20px;
		font-weight: 700;
		color: #0f172a;
		transition: all 0.2s ease;
	}

	.current-size.sliding {
		color: #3b82f6;
		transform: scale(1.05);
	}

	.quick-sizes {
		display: flex;
		gap: 8px;
		margin-bottom: 20px;
		flex-wrap: wrap;
	}

	.size-btn {
		padding: 8px 14px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		background: #f8fafc;
		color: #475569;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 14px;
	}

	.size-btn:hover {
		background: #e2e8f0;
		border-color: #cbd5e1;
	}

	.size-btn.active {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.slider-container {
		margin-bottom: 20px;
	}

	.fleet-slider {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: linear-gradient(to right, #e2e8f0 0%, #3b82f6 100%);
		outline: none;
		appearance: none;
		margin-bottom: 8px;
	}

	.fleet-slider::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
		transition: all 0.2s ease;
	}

	.fleet-slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-size: 12px;
		color: #64748b;
	}

	.manual-input {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.manual-input label {
		font-size: 14px;
		font-weight: 500;
		color: #475569;
	}

	.input-group {
		display: flex;
		gap: 4px;
		align-items: center;
	}

	.increment-btn {
		padding: 8px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		background: #f8fafc;
		color: #475569;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 14px;
		min-width: 40px;
	}

	.increment-btn:hover {
		background: #e2e8f0;
		border-color: #cbd5e1;
	}

	.fleet-input {
		flex: 1;
		padding: 10px 12px;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		font-size: 16px;
		font-weight: 600;
		text-align: center;
		background: #fefefe;
		color: #0f172a;
		max-width: 100px;
	}

	.fleet-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	/* Mobile responsive */
	@media (max-width: 480px) {
		.fleet-control-container {
			padding: 16px;
		}

		.control-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.quick-sizes {
			justify-content: center;
		}

		.size-btn {
			padding: 6px 12px;
			font-size: 13px;
		}

		.input-group {
			justify-content: center;
			flex-wrap: wrap;
		}

		.fleet-input {
			max-width: 80px;
		}
	}
</style> 