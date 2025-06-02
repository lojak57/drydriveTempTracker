<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import PreTripInspection from '../PreTripInspection.svelte';
  
  const dispatch = createEventDispatcher();
  
  onMount(() => {
    console.log('🔧 PreTripStep mounted');
    window.scrollTo(0, 0);
  });
</script>

<div class="workflow-view pre-trip">
  <PreTripInspection on:inspection-complete />
</div>

<style>
  .workflow-view {
    padding: 24px;
    overflow-y: auto;
    height: 100%;
  }
</style> 