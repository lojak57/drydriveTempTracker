<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckCircle } from 'lucide-svelte';
	import { jobTrackingStore } from './stores/jobTracking.js';

	const dispatch = createEventDispatcher();

	$: trackingState = $jobTrackingStore;

	function handleNextStep() {
		jobTrackingStore.nextStep();
		dispatch('step-completed', { 
			currentStep: $jobTrackingStore.currentStep 
		});
	}
</script>

<div class="progress-section">
	<div class="section-header">
		<h3 class="section-title">Job Progress</h3>
		<button class="next-step-btn" on:click={handleNextStep}>
			<CheckCircle size={16} />
			<span>Next Step</span>
		</button>
	</div>
	
	<div class="step-list">
		{#each trackingState.jobSteps as step}
			<div class="step-item {step.id === trackingState.currentStep ? 'active' : step.status}">
				<div class="step-indicator">
					{#if step.status === 'completed'}
						<CheckCircle size={16} />
					{:else if step.id === trackingState.currentStep}
						<div class="active-dot"></div>
					{:else}
						<div class="pending-dot"></div>
					{/if}
				</div>
				<div class="step-details">
					<span class="step-label">{step.label}</span>
					<span class="step-eta">ETA: {step.eta}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.progress-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.section-title {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.next-step-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 12px;
		background: linear-gradient(135deg, #059669 0%, #047857 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.next-step-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
	}

	.step-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.step-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border-radius: 12px;
		background: white;
		border: 1px solid #e2e8f0;
		transition: all 0.2s ease;
	}

	.step-item.active {
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%);
		border-color: #3b82f6;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
	}

	.step-item.completed {
		background: linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(4, 120, 87, 0.02) 100%);
		border-color: #059669;
	}

	.step-indicator {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.step-indicator :global(svg) {
		color: #059669;
	}

	.active-dot {
		width: 12px;
		height: 12px;
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	.pending-dot {
		width: 8px;
		height: 8px;
		background: #cbd5e1;
		border-radius: 50%;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	.step-details {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.step-label {
		font-size: 14px;
		font-weight: 600;
		color: #1e293b;
		line-height: 1.2;
	}

	.step-eta {
		font-size: 12px;
		color: #64748b;
		line-height: 1.2;
	}

	.step-item.active .step-label {
		color: #3b82f6;
	}

	.step-item.active .step-eta {
		color: #2563eb;
	}

	.step-item.completed .step-label {
		color: #059669;
	}

	.step-item.completed .step-eta {
		color: #047857;
		text-decoration: line-through;
		opacity: 0.7;
	}
</style> 