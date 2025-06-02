<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import DriverSchedule from '../DriverSchedule.svelte';
  import LoadCalculator from '../LoadCalculator.svelte';
  
  const dispatch = createEventDispatcher();
  export let deliverySubStep: string;
  export let sharedState: any;
  export let eventHandlers: any;
  export let transitType: 'pickup' | 'dropoff' = 'dropoff';
  
  onMount(() => {
    console.log('📍 ToDeliveryStep mounted, substep:', deliverySubStep);
    console.log('🚛 Transit type:', transitType);
    if (sharedState?.jobStatusStore) {
      sharedState.jobStatusStore.set('Transit to Delivery');
    }
    window.scrollTo(0, 0);
  });

  $: destinationInfo = transitType === 'pickup' 
    ? {
        name: sharedState.activeJob?.pickupSiteName || 'Johnson Tank Battery #3',
        address: sharedState.activeJob?.pickupAddress || '2847 County Road 1250, Midland, TX 79701',
        contact: sharedState.activeJob?.pickupContact || '(432) 555-0157',
        icon: '📍',
        type: 'Pickup Location',
        detail: `Tank: ${sharedState.activeJob?.pickupTank || '#A-15'} | Expected Volume: ${sharedState.activeJob?.expectedVolume || '120'} BBL`
      }
    : {
        name: sharedState.activeJob?.deliverySiteName || 'Permian Basin Refinery',
        address: sharedState.activeJob?.deliveryAddress || '1425 Industrial Blvd, Odessa, TX 79761',
        contact: sharedState.activeJob?.deliveryContact || '(432) 555-0199',
        icon: '🏭',
        type: 'Delivery Location',
        detail: `Bay: ${sharedState.activeJob?.deliveryBay || '#7'} | Delivery Volume: ${sharedState.activeJob?.deliveryVolume || '120'} BBL`
      };

  $: routeData = {
    distance: sharedState.activeJob?.distance || '23.4 mi',
    estimatedTime: sharedState.activeJob?.estimatedTime || '42 min',
    eta: sharedState.activeJob?.deliveryETA || '2:45 PM'
  };

  $: navigationInstruction = transitType === 'pickup' 
    ? 'In 8.2 mi — Take Exit 118 toward Well Pad Access Rd'
    : 'In 8.2 mi — Take Exit 118 toward Industrial Blvd';
</script>

<div class="workflow-view to-delivery">
  {#if deliverySubStep === 'delivery-schedule'}
    <div class="delivery-content">
      <div class="delivery-header">
        <h2>🚛 Loaded & Ready for Delivery</h2>
        <p>Tank loaded with {sharedState.activeJob?.deliveryVolume || '120'} BBL - Plan your delivery route and navigate to offload site</p>
        
        <!-- Delivery Status Banner -->
        <div class="delivery-status-banner">
          <div class="status-item completed">
            <span class="status-icon">✅</span>
            <span class="status-text">Pickup Complete</span>
          </div>
          <div class="status-item completed">
            <span class="status-icon">✅</span>
            <span class="status-text">Loading Complete</span>
          </div>
          <div class="status-item active">
            <span class="status-icon">🎯</span>
            <span class="status-text">En Route to Delivery</span>
          </div>
          <div class="status-item pending">
            <span class="status-icon">⏳</span>
            <span class="status-text">Unloading Pending</span>
          </div>
        </div>
      </div>
      
      <DriverSchedule on:job-selected={eventHandlers.handleJobSelected} />
      <LoadCalculator 
        truckTare={15000}
        trailerTare={8000}
        on:calculation-complete={(e) => console.log('Load calculation:', e.detail)}
      />
      
      <div class="start-navigation-action">
        <button class="start-nav-btn" on:click={eventHandlers.handleStartDeliveryNavigation}>
          🗺️ Start Navigation to Delivery
        </button>
      </div>
    </div>
  {:else if deliverySubStep === 'delivery-details'}
    <div class="navigation-planning-content">
      <div class="navigation-header">
        <h2>🎯 Navigate to Delivery Site</h2>
        <p>Loaded with {sharedState.activeJob?.deliveryVolume || '120'} BBL - Navigate to {destinationInfo.name} for unloading</p>
      </div>
      
      <!-- Load Status -->
      <div class="load-status-card">
        <h3>🛢️ Current Load Status</h3>
        <div class="load-details">
          <div class="load-stat">
            <span class="stat-label">Loaded Volume</span>
            <span class="stat-value">{sharedState.activeJob?.deliveryVolume || '120'} BBL</span>
          </div>
          <div class="load-stat">
            <span class="stat-label">From</span>
            <span class="stat-value">{sharedState.activeJob?.pickupSiteName || 'Johnson Tank Battery #3'}</span>
          </div>
          <div class="load-stat">
            <span class="stat-label">Load Temp</span>
            <span class="stat-value">78°F</span>
          </div>
          <div class="load-stat">
            <span class="stat-label">Pressure</span>
            <span class="stat-value">145 PSI</span>
          </div>
        </div>
      </div>
      
      <div class="route-overview">
        <div class="route-card">
          <h3>{destinationInfo.icon} {destinationInfo.type}</h3>
          <p><strong>{destinationInfo.name}</strong></p>
          <p>{destinationInfo.address}</p>
          <p>{destinationInfo.detail}</p>
          <p>Contact: {destinationInfo.contact}</p>
        </div>
        
        <div class="route-details">
          <div class="route-stat">
            <span class="stat-label">Distance</span>
            <span class="stat-value">{routeData.distance}</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">Estimated Time</span>
            <span class="stat-value">{routeData.estimatedTime}</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">ETA</span>
            <span class="stat-value">{routeData.eta}</span>
          </div>
        </div>
      </div>
      
      <div class="navigation-actions">
        <button class="nav-btn secondary" on:click={() => deliverySubStep = 'delivery-schedule'}>
          ← Back to Delivery Schedule
        </button>
        <button class="nav-btn primary" on:click={eventHandlers.handleStartTransitToDelivery}>
          🚛 Start Transit
        </button>
      </div>
    </div>
  {:else if deliverySubStep === 'delivery-route'}
    <div class="navigation-planning-content">
      <div class="navigation-header">
        <h2>Delivery Route Planning</h2>
        <p>Final route review before transit to delivery location</p>
      </div>
      
      <div class="route-overview">
        <div class="route-card">
          <h3>{destinationInfo.icon} Final Destination</h3>
          <p><strong>{destinationInfo.name}</strong></p>
          <p>{destinationInfo.address}</p>
          <p>{destinationInfo.detail}</p>
          <p>Contact: {destinationInfo.contact}</p>
        </div>
        
        <div class="route-details">
          <div class="route-stat">
            <span class="stat-label">Distance</span>
            <span class="stat-value">{routeData.distance}</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">Estimated Time</span>
            <span class="stat-value">{routeData.estimatedTime}</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">ETA</span>
            <span class="stat-value">{routeData.eta}</span>
          </div>
        </div>
      </div>
      
      <div class="navigation-actions">
        <button class="nav-btn secondary" on:click={() => deliverySubStep = 'delivery-details'}>
          ← Back to Route Details
        </button>
        <button class="nav-btn primary" on:click={eventHandlers.handleStartTransitToDelivery}>
          🚛 Start Transit
        </button>
      </div>
    </div>
  {:else if deliverySubStep === 'delivery-transit'}
    <div class="in-transit-content">
      <div class="transit-header">
        <button class="exit-transit-btn" on:click={() => dispatch('exit-transit')}>
          ← Exit Transit
        </button>
        <div class="transit-title">
          <h1>{transitType === 'pickup' ? 'IN TRANSIT TO PICKUP' : 'IN TRANSIT TO DELIVERY'}</h1>
          <span class="job-id">#{sharedState.activeJob?.id || 'J08-002-DEL'}</span>
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
          <div class="metric-value">{routeData.estimatedTime}</div>
          <div class="metric-unit">ETA</div>
          <div class="metric-status">{routeData.eta}</div>
        </div>
      </div>
      
      <div class="destination-info">
        <div class="destination-icon">{destinationInfo.icon}</div>
        <div class="destination-text">
          <span class="destination-name">{destinationInfo.name}</span>
          <span class="destination-distance">{routeData.distance} remaining</span>
        </div>
      </div>
      
      <div class="map-section">
        <div class="map-placeholder">
          <div class="current-instruction">
            <div class="instruction-icon">↗️</div>
            <span class="instruction-text">{navigationInstruction}</span>
          </div>
        </div>
      </div>
      
      <div class="quick-actions-bottom">
        <button class="quick-action dispatch">DISPATCH</button>
        <button class="quick-action safety">SAFETY ALERT</button>
        <button class="quick-action emergency">EMERGENCY</button>
      </div>
      
      <div class="transit-actions">
        <button class="arrive-btn" on:click={() => {
          console.log('✅ Arrived at Delivery Site, advancing to Unload Step');
          if (sharedState?.jobProgress) {
            sharedState.jobProgress = 'readyToUnload';
          }
          eventHandlers.handleArriveAtDelivery();
        }}>
          🎯 Arrive at {transitType === 'pickup' ? 'Pickup' : 'Delivery'} Site
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
  
  .delivery-content, .navigation-planning-content, .in-transit-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .delivery-header, .navigation-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .delivery-header h2, .navigation-header h2 {
    font-size: 2rem;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .delivery-header p, .navigation-header p {
    color: #6b7280;
    font-size: 1.1rem;
  }
  
  .start-navigation-action {
    text-align: center;
    margin-top: 32px;
  }
  
  .start-nav-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .start-nav-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
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
  
  .destination-info {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1f2937;
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 24px;
  }
  
  .destination-icon {
    font-size: 2rem;
    margin-right: 16px;
  }
  
  .destination-text {
    display: flex;
    flex-direction: column;
  }
  
  .destination-name {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .destination-distance {
    color: #9ca3af;
    font-size: 0.875rem;
  }
  
  .map-section {
    background: #1f2937;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .map-placeholder {
    height: 200px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  
  .current-instruction {
    background: #3b82f6;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .instruction-icon {
    font-size: 1.5rem;
  }
  
  .instruction-text {
    font-weight: 500;
  }
  
  .quick-actions-bottom {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 24px;
  }
  
  .quick-action {
    background: #374151;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .quick-action:hover {
    background: #4b5563;
  }
  
  .quick-action.emergency {
    background: #dc2626;
  }
  
  .quick-action.emergency:hover {
    background: #b91c1c;
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
  
  .exit-transit-btn {
    background: #f3f4f6;
    color: #374151;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .exit-transit-btn:hover {
    background: #e5e7eb;
  }
  
  /* Delivery Status Styling */
  .delivery-status-banner {
    display: flex;
    justify-content: space-between;
    background: #f8fafc;
    border-radius: 12px;
    padding: 20px;
    margin-top: 24px;
    border: 2px solid #e2e8f0;
  }
  
  .status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    flex: 1;
  }
  
  .status-icon {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
  
  .status-text {
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .status-item.completed {
    color: #10b981;
  }
  
  .status-item.active {
    color: #3b82f6;
    font-weight: 600;
  }
  
  .status-item.pending {
    color: #6b7280;
  }
  
  /* Load Status Card */
  .load-status-card {
    background: #10b981;
    color: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  
  .load-status-card h3 {
    margin: 0 0 16px 0;
    font-size: 1.25rem;
  }
  
  .load-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .load-stat {
    text-align: center;
    background: rgba(255, 255, 255, 0.2);
    padding: 12px;
    border-radius: 8px;
  }
  
  .load-stat .stat-label {
    display: block;
    font-size: 0.875rem;
    opacity: 0.9;
    margin-bottom: 4px;
  }
  
  .load-stat .stat-value {
    display: block;
    font-size: 1.1rem;
    font-weight: 700;
  }
</style> 