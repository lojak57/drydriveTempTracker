<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  onMount(() => {
    console.log('🏁 PostTripStep mounted');
    window.scrollTo(0, 0);
  });
</script>

<div class="workflow-view post-trip">
  <div class="safety-content">
    <div class="safety-header">
      <h2>Post-Trip Safety Check</h2>
      <p>Complete final safety inspection and documentation</p>
    </div>
    
    <div class="safety-metrics">
      <div class="metric-card">
        <div class="metric-icon">🏆</div>
        <div class="metric-info">
          <h3>Days Without Incident</h3>
          <div class="metric-value">247</div>
          <div class="metric-unit">days</div>
          <div class="metric-trend up">+1</div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">📚</div>
        <div class="metric-info">
          <h3>Safety Training</h3>
          <div class="metric-value">100</div>
          <div class="metric-unit">%</div>
          <div class="metric-trend stable">Current</div>
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-icon">🔍</div>
        <div class="metric-info">
          <h3>Vehicle Inspections</h3>
          <div class="metric-value">23/23</div>
          <div class="metric-unit"></div>
          <div class="metric-trend stable">Perfect</div>
        </div>
      </div>
    </div>
    
    <div class="post-trip-actions">
      <button class="action-btn final-inspection">
        🔍 Final Vehicle Inspection
      </button>
      <button class="action-btn complete-shift" on:click={() => dispatch('complete-shift')}>
        🏁 Complete Shift
      </button>
    </div>
  </div>
</div>

<style>
  .workflow-view {
    padding: 24px;
    overflow-y: auto;
    height: 100%;
  }
  
  .safety-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .safety-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .safety-header h2 {
    font-size: 2rem;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .safety-header p {
    color: #6b7280;
    font-size: 1.1rem;
  }
  
  .safety-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }
  
  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .metric-icon {
    font-size: 3rem;
    text-align: center;
    width: 80px;
  }
  
  .metric-info {
    flex: 1;
  }
  
  .metric-info h3 {
    color: #1f2937;
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  .metric-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #10b981;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .metric-unit {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 8px;
  }
  
  .metric-trend {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    display: inline-block;
  }
  
  .metric-trend.up {
    background: #dcfce7;
    color: #166534;
  }
  
  .metric-trend.stable {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .post-trip-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    text-align: center;
  }
  
  .action-btn {
    padding: 20px 24px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 1.1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .action-btn.final-inspection {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .action-btn.complete-shift {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  .action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  .action-btn.final-inspection:hover {
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  }
  
  .action-btn.complete-shift:hover {
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  }
</style> 