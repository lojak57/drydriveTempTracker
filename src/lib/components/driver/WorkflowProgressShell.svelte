<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		WORKFLOW_STEPS, 
		getStepIcon, 
		getStepLabel, 
		isStepCompleted,
		type WorkflowStep 
	} from './workflowConfig.js';

	// Props
	export let currentStep: WorkflowStep = 'job-overview';
	export let driverInfo: { id: string; name: string; truck?: string } = { id: 'driver-001', name: 'Current Driver' };
	export let completedSteps: WorkflowStep[] = [];

	// Event dispatchers (preserve existing pattern)
	const dispatch = createEventDispatcher<{
		'reset-workflow': void;
		'step-clicked': { step: WorkflowStep };
	}>();

	function handleReset() {
		dispatch('reset-workflow');
	}

	function handleStepClick(step: WorkflowStep) {
		dispatch('step-clicked', { step });
	}

	// Dynamic header title based on current step
	$: headerTitle = getStepLabel(currentStep);
</script>

<div class="workflow-shell">
	<!-- Progress Header -->
	<div class="workflow-header">
		<div class="driver-info">
			<h2>{headerTitle}</h2>
			<span class="driver-label">Driver: {driverInfo.id}</span>
		</div>
		<!-- HIDDEN: Reset workflow button as requested (keeping code) -->
		<!-- <button class="reset-btn" on:click={handleReset}>Reset Workflow</button> -->
	</div>
	
	<!-- Progress Steps -->
	<div class="progress-container">
		{#each WORKFLOW_STEPS as step, index}
			<div class="step-container">
				<button 
					class="step-icon" 
					class:active={currentStep === step} 
					class:completed={isStepCompleted(step, completedSteps)}
					on:click={() => handleStepClick(step)}
					aria-label="Go to {getStepLabel(step)}"
				>
					<svelte:component this={getStepIcon(step)} size={20} />
				</button>
				<span class="step-label">{getStepLabel(step)}</span>
				{#if index < WORKFLOW_STEPS.length - 1}
					<div class="step-connector" class:completed={isStepCompleted(step, completedSteps)}></div>
				{/if}
			</div>
		{/each}
	</div>
	
	<!-- Content Slot (preserves existing component rendering) -->
	<div class="workflow-content">
		<slot />
	</div>
</div>

<style>
	/* Workflow Progress Bar */
	.workflow-shell {
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	}

	.workflow-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px;
		background: #1e293b;
		border-bottom: 1px solid #334155;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.driver-info h2 {
		font-size: 24px;
		font-weight: 700;
		color: white;
		margin: 0;
	}

	.driver-label {
		font-size: 14px;
		color: #94a3b8;
		font-weight: 500;
	}

	.reset-btn {
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 12px 20px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 14px;
	}

	.reset-btn:hover {
		background: #2563eb;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
	}

	/* Progress Steps - Make sticky to stay visible while scrolling */
	.progress-container {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
		background: white;
		border-bottom: 1px solid #e2e8f0;
		gap: 16px;
		flex-wrap: wrap;
		position: sticky;
		top: 80px;
		z-index: 40;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.step-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		position: relative;
		flex: 1;
		min-width: 80px;
		max-width: 120px;
	}

	.step-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f1f5f9;
		border: 2px solid #e2e8f0;
		color: #64748b;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.step-icon:hover {
		border-color: #cbd5e1;
		transform: translateY(-1px);
	}

	.step-icon.active {
		background: #3b82f6;
		border-color: #3b82f6;
		color: white;
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.step-icon.completed {
		background: #10b981;
		border-color: #10b981;
		color: white;
	}

	.step-label {
		font-size: 12px;
		font-weight: 600;
		color: #64748b;
		text-align: center;
		white-space: nowrap;
		line-height: 1.2;
	}

	.step-connector {
		position: absolute;
		top: 24px;
		left: calc(100% - 8px);
		width: 24px;
		height: 2px;
		background: #e2e8f0;
		transition: background 0.3s ease;
		z-index: 1;
	}

	.step-connector.completed {
		background: #10b981;
	}

	/* Content Area */
	.workflow-content {
		flex: 1;
		overflow-y: auto;
		max-height: calc(100vh - 160px);
		margin-top: 0;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.workflow-header {
			padding: 16px 20px;
		}

		.driver-info h2 {
			font-size: 20px;
		}

		.progress-container {
			padding: 20px 16px;
			gap: 12px;
		}
		
		.step-container {
			min-width: 70px;
			max-width: 90px;
		}
		
		.step-icon {
			width: 40px;
			height: 40px;
		}

		.step-connector {
			display: none; /* Hide connectors on mobile */
		}

		.step-label {
			font-size: 11px;
		}

		.reset-btn {
			padding: 10px 16px;
			font-size: 13px;
		}
	}

	/* Accessibility */
	.step-icon:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.step-icon:focus:not(.active) {
		border-color: #3b82f6;
	}
</style> 