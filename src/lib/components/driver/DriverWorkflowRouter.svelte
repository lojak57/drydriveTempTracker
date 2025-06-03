<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { WorkflowStep } from './workflowConfig.js';
  
  // Import all step components (will create these next)
  import JobOverviewStep from './steps/JobOverviewStep.svelte';
  import PreTripStep from './steps/PreTripStep.svelte';
  import ToTransitStep from './steps/ToTransitStep.svelte';
  import LoadingStep from './steps/LoadingStep.svelte';
  import UnloadingStep from './steps/UnloadingStep.svelte';
  import PostTripStep from './steps/PostTripStep.svelte';
  
  const dispatch = createEventDispatcher();
  
  // Props from parent
  export let currentWorkflowView: WorkflowStep;
  export let pickupSubStep: string = 'job-selection';
  export let deliverySubStep: string = 'delivery-schedule';
  export let sharedState: {
    activeJob: any;
    selectedJob: any;
    inspectionCompleted: boolean;
    workflowProgress: Record<string, boolean>;
    [key: string]: any;
  };
  
  // Event handlers object - SIMPLIFIED
  export let eventHandlers: {
    navigateToStep: (step: WorkflowStep) => void;
    markStepComplete: (step: WorkflowStep) => void;
    handleJobSelected: (event: CustomEvent) => void;
    handleInspectionComplete: (event: CustomEvent) => void;
    [key: string]: any;
  };
</script>

<div class="workflow-router">
  {#if currentWorkflowView === 'job-overview'}
    <JobOverviewStep 
      {sharedState}
      on:start-pretrip={() => eventHandlers.navigateToStep('pre-trip')}
    />
  {:else if currentWorkflowView === 'pre-trip'}
    <PreTripStep 
      on:inspection-complete={eventHandlers.handleInspectionComplete}
    />
  {:else if currentWorkflowView === 'to-pickup'}
    <ToTransitStep 
      {pickupSubStep}
      {sharedState}
      {eventHandlers}
      transitType="pickup"
    />
  {:else if currentWorkflowView === 'loading'}
    <LoadingStep 
      {sharedState}
      on:loading-complete={() => eventHandlers.navigateToStep('to-delivery')}
      on:back-to-pickup={() => eventHandlers.navigateToStep('to-pickup')}
    />
  {:else if currentWorkflowView === 'to-delivery'}
    <ToTransitStep 
      {deliverySubStep}
      {sharedState}
      {eventHandlers}
      transitType="delivery"
    />
  {:else if currentWorkflowView === 'unloading'}
    <UnloadingStep 
      {sharedState}
      on:delivery-complete={() => eventHandlers.navigateToStep('post-trip')}
    />
  {:else if currentWorkflowView === 'post-trip'}
    <PostTripStep 
      on:complete-shift={() => {
        eventHandlers.markStepComplete('post-trip');
        eventHandlers.navigateToStep('job-overview');
      }}
    />
  {/if}
</div>

<style>
  .workflow-router {
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
</style> 