<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import DriverSchedule from '../DriverSchedule.svelte';
  import LoadCalculator from '../LoadCalculator.svelte';
  
  const dispatch = createEventDispatcher();
  export let pickupSubStep: string;
  export let sharedState: any;
  export let eventHandlers: any;
  
  onMount(() => {
    console.log('📍 ToPickupStep mounted, substep:', pickupSubStep);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  });
  
  // Helper function to calculate realistic pickup ETA
  function getCurrentPickupETA() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 32); // Add 32 minutes for pickup
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
</script>

<div class="workflow-view to-pickup">
  {#if pickupSubStep === 'job-selection'}
    <div class="pickup-content">
      <div class="pickup-header">
        <h2>Job Selection & Route Planning</h2>
        <p>Select your job and plan your route to the pickup location</p>
      </div>
      
      <DriverSchedule 
        currentWorkflowStep="to-pickup"
        on:job-selected={eventHandlers.handleJobSelected} 
      />
      <LoadCalculator 
        truckTare={15000}
        trailerTare={8000}
        on:calculation-complete={(e) => console.log('Load calculation:', e.detail)}
      />
    </div>
  {:else if pickupSubStep === 'navigation'}
    <div class="navigation-planning-content">
      <div class="navigation-header">
        <h2>Route to Pickup Location</h2>
        <p>Review your route and start navigation to the pickup site</p>
      </div>
      
      <div class="route-overview">
        <div class="route-card">
          <h3>📍 Pickup Location</h3>
          <p><strong>Johnson Tank Battery #3</strong></p>
          <p>2847 County Road 1250, Midland, TX 79701</p>
          <p>Tank: #A-15 | Expected Volume: 120 BBL</p>
          <p>Contact: (432) 555-0157</p>
        </div>
        
        <div class="route-details">
          <div class="route-stat">
            <span class="stat-label">Distance</span>
            <span class="stat-value">18.2 mi</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">Estimated Time</span>
            <span class="stat-value">32 min</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">ETA</span>
            <span class="stat-value">{getCurrentPickupETA()}</span>
          </div>
        </div>
      </div>
      
      <div class="navigation-actions">
        <button class="nav-btn secondary" on:click={() => pickupSubStep = 'job-selection'}>
          ← Back to Job Selection
        </button>
        <button class="nav-btn primary" on:click={eventHandlers.handleStartTransitToPickup}>
          🚛 Start Transit
        </button>
      </div>
    </div>
  {:else if pickupSubStep === 'in-transit'}
    <div class="in-transit-content">
      <div class="transit-header">
        <button class="exit-transit-btn" on:click={() => dispatch('exit-transit')}>
          ← Exit Transit
        </button>
        <div class="transit-title">
          <h1>IN TRANSIT</h1>
          <span class="job-id">#{sharedState.activeJob?.id || 'J08-001'}</span>
        </div>
      </div>
      
      <div class="transit-metrics-grid">
        <div class="metric-card speed">
          <div class="metric-icon">🏃</div>
          <div class="metric-value">58</div>
          <div class="metric-unit">MPH</div>
          <div class="metric-max">Max: 65</div>
        </div>
        
        <div class="metric-card pressure">
          <div class="metric-icon">⚡</div>
          <div class="metric-value">145</div>
          <div class="metric-unit">PSI</div>
          <div class="metric-status">Normal</div>
        </div>
        
        <div class="metric-card temperature">
          <div class="metric-icon">🌡️</div>
          <div class="metric-value">78°</div>
          <div class="metric-unit">LOAD TEMP</div>
          <div class="metric-status">Optimal</div>
        </div>
        
        <div class="metric-card eta">
          <div class="metric-icon">⏰</div>
          <div class="metric-value">2h 29m</div>
          <div class="metric-unit">ETA</div>
          <div class="metric-status">10:40 PM</div>
        </div>
      </div>
      
      <div class="destination-info">
        <div class="destination-icon">📍</div>
        <div class="destination-text">
          <span class="destination-name">Falls City Harvest Pipeline</span>
          <span class="destination-distance">142.7 mi</span>
        </div>
      </div>
      
      <div class="map-section">
        <div class="map-placeholder">
          <div class="current-instruction">
            <div class="instruction-icon">↗️</div>
            <span class="instruction-text">In 5.4 mi — Exit Loop 250 toward US-87 South</span>
          </div>
        </div>
      </div>
      
      <div class="quick-actions-bottom">
        <button class="quick-action dispatch">DISPATCH</button>
        <button class="quick-action safety">SAFETY ALERT</button>
        <button class="quick-action emergency">EMERGENCY</button>
      </div>
      
      <div class="transit-actions">
        <button class="arrive-btn" on:click={eventHandlers.handleArriveAtPickup}>
          🎯 Arrive at Pickup Site
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .workflow-view {
    padding: 24px;
    overflow-y: auto;
    height: 100%;
  }
  
  .pickup-content, .navigation-planning-content, .in-transit-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .pickup-header, .navigation-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .pickup-header h2, .navigation-header h2 {
    font-size: 2rem;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .pickup-header p, .navigation-header p {
    color: #6b7280;
    font-size: 1.1rem;
  }
  
  .route-overview {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 32px;
  }
  
  .route-card {
    margin-bottom: 24px;
  }
  
  .route-card h3 {
    color: #1f2937;
    margin-bottom: 12px;
  }
  
  .route-card p {
    color: #6b7280;
    margin: 4px 0;
  }
  
  .route-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
  }
  
  .route-stat {
    text-align: center;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .stat-label {
    display: block;
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 4px;
  }
  
  .stat-value {
    display: block;
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 700;
  }
  
  .navigation-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
  
  .nav-btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .nav-btn.primary {
    background: #3b82f6;
    color: white;
  }
  
  .nav-btn.secondary {
    background: #f3f4f6;
    color: #374151;
  }
  
  .nav-btn:hover {
    transform: translateY(-1px);
  }
  
  /* In-transit styles */
  .transit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }
  
  .transit-title h1 {
    font-size: 2.5rem;
    color: #1f2937;
    margin: 0;
  }
  
  .job-id {
    color: #6b7280;
    font-size: 1rem;
  }
  
  .transit-metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }
  
  .metric-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .metric-icon {
    font-size: 2rem;
    margin-bottom: 12px;
  }
  
  .metric-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .metric-unit {
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 8px;
  }
  
  .metric-status, .metric-max {
    color: #10b981;
    font-size: 0.875rem;
  }
  
  .arrive-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    width: 100%;
    margin-top: 24px;
  }
  
  .arrive-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  }
</style> 