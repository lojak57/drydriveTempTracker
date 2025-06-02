<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  export let sharedState: any;
  
  onMount(() => {
    console.log('🚛 LoadingStep mounted');
    window.scrollTo(0, 0);
  });
</script>

<div class="workflow-view loading">
  <div class="loading-content">
    <div class="loading-header">
      <h2>Loading Operations</h2>
      <p>Monitor and manage the loading process at pickup site</p>
    </div>
    
    <div class="loading-workflow">
      <div class="site-info">
        <div class="site-card">
          <h3>📍 Pickup Site Information</h3>
          <div class="site-details">
            <p><strong>Location:</strong> Johnson Tank Battery #3</p>
            <p><strong>Tank:</strong> #A-15</p>
            <p><strong>Current Level:</strong> 17' 4"</p>
            <p><strong>Product:</strong> Crude Oil</p>
            <p><strong>API Gravity:</strong> 42.5°</p>
          </div>
        </div>
      </div>
      
      <div class="loading-progress">
        <div class="progress-header">
          <h3>Loading Progress</h3>
          <div class="loading-status active">ACTIVE LOADING</div>
        </div>
        
        <div class="volume-tracking">
          <div class="volume-display">
            <div class="volume-circle">
              <div class="volume-fill" style="height: 72%;">
                <span class="volume-text">87 BBL</span>
              </div>
            </div>
          </div>
          
          <div class="volume-details">
            <div class="volume-row">
              <span class="label">Target Volume:</span>
              <span class="value target">120 BBL</span>
            </div>
            <div class="volume-row">
              <span class="label">Current Volume:</span>
              <span class="value current">87 BBL</span>
            </div>
            <div class="volume-row">
              <span class="label">Remaining:</span>
              <span class="value remaining">33 BBL</span>
            </div>
            <div class="volume-row">
              <span class="label">Loading Rate:</span>
              <span class="value rate">5.2 BBL/min</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="temperature-monitoring">
        <h3>Temperature Monitoring</h3>
        <div class="temp-readings">
          <div class="temp-gauge">
            <div class="gauge-label">Product Temp</div>
            <div class="gauge-value">78°F</div>
            <div class="gauge-status normal">Normal</div>
          </div>
          <div class="temp-gauge">
            <div class="gauge-label">Ambient Temp</div>
            <div class="gauge-value">85°F</div>
            <div class="gauge-status normal">Normal</div>
          </div>
        </div>
      </div>
      
      <div class="loading-controls">
        <button class="control-btn emergency">🛑 Emergency Stop</button>
        <button class="control-btn complete" on:click={() => dispatch('loading-complete')}>
          ✅ Loading Complete
        </button>
      </div>
      
      <div class="workflow-navigation">
        <button class="workflow-nav-btn secondary" on:click={() => dispatch('back-to-pickup')}>
          ← Back to Pickup
        </button>
        <button class="workflow-nav-btn primary" on:click={() => dispatch('loading-complete')}>
          🚛 Begin Transit to Delivery →
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .workflow-view {
    padding: 24px;
    overflow-y: auto;
    height: 100%;
  }
  
  .loading-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .loading-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .loading-header h2 {
    font-size: 2rem;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .loading-header p {
    color: #6b7280;
    font-size: 1.1rem;
  }
  
  .site-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .site-card h3 {
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .site-details p {
    color: #6b7280;
    margin: 8px 0;
  }
  
  .loading-progress {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .progress-header h3 {
    color: #1f2937;
    margin: 0;
  }
  
  .loading-status {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .loading-status.active {
    background: #dcfce7;
    color: #166534;
  }
  
  .volume-tracking {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 32px;
    align-items: center;
  }
  
  .volume-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: #f3f4f6;
    position: relative;
    margin: 0 auto;
  }
  
  .volume-fill {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 50%;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: height 0.3s ease;
  }
  
  .volume-text {
    color: white;
    font-weight: 700;
    font-size: 1.2rem;
  }
  
  .volume-details {
    display: grid;
    gap: 12px;
  }
  
  .volume-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .volume-row:last-child {
    border-bottom: none;
  }
  
  .label {
    color: #6b7280;
    font-weight: 500;
  }
  
  .value {
    font-weight: 700;
  }
  
  .value.target {
    color: #3b82f6;
  }
  
  .value.current {
    color: #10b981;
  }
  
  .value.remaining {
    color: #f59e0b;
  }
  
  .value.rate {
    color: #8b5cf6;
  }
  
  .temperature-monitoring {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .temperature-monitoring h3 {
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .temp-readings {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  
  .temp-gauge {
    text-align: center;
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .gauge-label {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 8px;
  }
  
  .gauge-value {
    color: #1f2937;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 4px;
  }
  
  .gauge-status.normal {
    color: #10b981;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .loading-controls {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 32px;
  }
  
  .control-btn {
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-size: 1.1rem;
  }
  
  .control-btn.emergency {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
  
  .control-btn.complete {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  .control-btn:hover {
    transform: translateY(-2px);
  }
  
  .workflow-navigation {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
  
  .workflow-nav-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .workflow-nav-btn.primary {
    background: #3b82f6;
    color: white;
  }
  
  .workflow-nav-btn.secondary {
    background: #f3f4f6;
    color: #374151;
  }
  
  .workflow-nav-btn:hover {
    transform: translateY(-1px);
  }
</style> 