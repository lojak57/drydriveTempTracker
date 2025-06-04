<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import DriverSchedule from '../DriverSchedule.svelte';
  import LoadCalculator from '../LoadCalculator.svelte';
  
  const dispatch = createEventDispatcher();
  export let transitType: 'pickup' | 'delivery' = 'pickup';
  export let pickupSubStep: string = 'job-selection';
  export let deliverySubStep: string = 'delivery-schedule';
  export let sharedState: any;
  export let eventHandlers: any;
  
  // SIMPLIFIED: Get the correct substep based on transitType
  $: currentSubStep = transitType === 'pickup' ? pickupSubStep : deliverySubStep;
  
  onMount(() => {
    console.log(`📍 ToTransitStep mounted, type: ${transitType}, substep: ${currentSubStep}`);
    // Ensure scroll to top with longer delay to avoid conflicts
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  });
  
  // Dynamic data based on transitType
  $: currentLocation = {
    lat: transitType === 'pickup' ? 29.8000 : 30.3100,
    lng: transitType === 'pickup' ? -95.4000 : -95.1000,
    address: transitType === 'pickup' ? 'En Route to Well Pad' : 'En Route to Delivery Terminal'
  };
  
  $: destination = transitType === 'pickup'
    ? {
        name: sharedState.activeJob?.pickupSiteName || 'Johnson Tank Battery #3',
        address: sharedState.activeJob?.pickupAddress || '2847 County Road 1250, Midland, TX 79701',
        coordinates: { lat: 31.8457, lng: -102.3676 }
      }
    : {
        name: sharedState.activeJob?.deliverySiteName || 'Permian Basin Refinery',
        address: sharedState.activeJob?.deliveryAddress || '1425 Industrial Blvd, Odessa, TX 79761',
        coordinates: { lat: 31.8457, lng: -102.2676 }
      };
  
  // Dynamic headers and content
  $: headerTitle = transitType === 'pickup' 
    ? 'Drive to Pickup Site' 
    : 'Loaded & Ready for Delivery';
    
  $: headerDescription = transitType === 'pickup'
    ? 'Review your pickup jobs and plan your route to the selected site'
    : 'Tank loaded - Plan your delivery route and navigate to offload site';
    
  $: transitTitle = transitType === 'pickup' 
    ? 'IN TRANSIT TO PICKUP' 
    : 'IN TRANSIT TO DELIVERY';
    
  $: arriveButtonText = transitType === 'pickup'
    ? 'Arrive at Pickup Site'
    : 'Arrive at Delivery Site';
  
  // Helper function to calculate realistic ETA
  function getCurrentETA() {
    const now = new Date();
    const addMinutes = transitType === 'pickup' ? 32 : 42;
    now.setMinutes(now.getMinutes() + addMinutes);
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // Dynamic distance and time
  $: routeStats = transitType === 'pickup' 
    ? { distance: '18.2 mi', time: '32 min' }
    : { distance: '23.4 mi', time: '42 min' };
</script>

<div class="workflow-view to-transit {transitType}">
  {#if currentSubStep === (transitType + '-schedule') || currentSubStep === 'job-selection'}
    <div class="transit-content">
      <div class="transit-header">
        <h2>{headerTitle}</h2>
        <p>{headerDescription}</p>
        
        <!-- Status Banner -->
        {#if transitType === 'delivery'}
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
              <span class="status-icon">🚛</span>
              <span class="status-text">Drive to Delivery</span>
            </div>
            <div class="status-item pending">
              <span class="status-icon">⏳</span>
              <span class="status-text">Unloading</span>
            </div>
          </div>
        {/if}
      </div>
      
      <DriverSchedule 
        currentWorkflowStep={transitType === 'pickup' ? 'to-pickup' : 'to-delivery'}
        on:job-selected={eventHandlers.handleJobSelected}
      />
    </div>
    
  {:else if currentSubStep === (transitType + '-details') || currentSubStep === 'navigation'}
    <div class="navigation-planning-content">
      <div class="navigation-header">
        <h2>🎯 Navigate to {transitType === 'pickup' ? 'Pickup' : 'Delivery'} Site</h2>
        <p>{transitType === 'pickup' ? 'Navigate to well pad for loading' : `Loaded with ${sharedState.activeJob?.deliveryVolume || '120'} BBL - Navigate to ${destination.name} for unloading`}</p>
      </div>
      
      <!-- Load Status for Delivery -->
      {#if transitType === 'delivery'}
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
              <span class="stat-label">To</span>
              <span class="stat-value">{destination.name}</span>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Site Details -->
      <div class="site-details-card">
        <h3>📍 {transitType === 'pickup' ? 'Pickup' : 'Delivery'} Site Details</h3>
        <div class="site-info">
          <div class="info-row">
            <span class="info-label">Site Name</span>
            <span class="info-value">{destination.name}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Address</span>
            <span class="info-value">{destination.address}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Contact</span>
            <span class="info-value">{transitType === 'pickup' ? sharedState.activeJob?.pickupContact : sharedState.activeJob?.deliveryContact || '(432) 555-0199'}</span>
          </div>
          {#if transitType === 'pickup'}
            <div class="info-row">
              <span class="info-label">Tank</span>
              <span class="info-value">{sharedState.activeJob?.pickupTank || '#A-15'}</span>
            </div>
          {:else}
            <div class="info-row">
              <span class="info-label">Bay</span>
              <span class="info-value">{sharedState.activeJob?.deliveryBay || '#7'}</span>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Route Details -->
      <div class="route-details-card">
        <h3>🗺️ Route Information</h3>
        <div class="route-details">
          <div class="route-stat">
            <span class="stat-label">Distance</span>
            <span class="stat-value">{routeStats.distance}</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">Estimated Time</span>
            <span class="stat-value">{routeStats.time}</span>
          </div>
          <div class="route-stat">
            <span class="stat-label">ETA</span>
            <span class="stat-value">{getCurrentETA()}</span>
          </div>
        </div>
      </div>
      
      <div class="primary-actions">
        <button 
          class="action-btn primary" 
          on:click={() => {
            if (transitType === 'pickup') {
              eventHandlers.handleStartTransit && eventHandlers.handleStartTransit();
            } else {
              eventHandlers.handleStartTransitToDelivery && eventHandlers.handleStartTransitToDelivery();
            }
          }}
        >
          Start Transit
        </button>
      </div>
    </div>
    
  {:else if currentSubStep === (transitType + '-transit') || currentSubStep === 'in-transit'}
    <div class="in-transit-view">
      <div class="transit-header-dark">
        <h1>{transitTitle}</h1>
        <p class="destination-info">
          <span class="destination-name">{destination.name}</span>
          <span class="destination-address">{destination.address}</span>
        </p>
      </div>
      
      <div class="transit-status">
        <div class="current-location">
          <span class="location-label">Current Location</span>
          <span class="location-value">{currentLocation.address}</span>
        </div>
        
        <div class="navigation-instruction">
          <span class="instruction-text">
            In 8.2 mi — Take Exit 118 toward {transitType === 'pickup' ? 'Well Pad Access Rd' : 'Industrial Blvd'}
          </span>
        </div>
        
        <div class="arrival-eta">
          <span class="eta-label">Estimated Arrival</span>
          <span class="eta-time">{getCurrentETA()}</span>
        </div>
      </div>
      
      <div class="transit-actions">
        <button 
          class="action-btn primary large" 
          on:click={() => {
            if (transitType === 'pickup') {
              eventHandlers.handleArriveAtPickup && eventHandlers.handleArriveAtPickup();
            } else {
              eventHandlers.handleArriveAtDelivery && eventHandlers.handleArriveAtDelivery();
            }
          }}
        >
          {arriveButtonText}
        </button>
        
        <button class="action-btn secondary" on:click={() => eventHandlers.handleEmergencyCall && eventHandlers.handleEmergencyCall()}>
          Emergency Call
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .workflow-view {
    padding: 24px;
    background: #ffffff;
    min-height: 100vh;
  }
  
  .transit-content, .navigation-planning-content {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .transit-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .transit-header h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 12px;
  }
  
  .transit-header p {
    font-size: 1.125rem;
    color: #6b7280;
    margin-bottom: 0;
  }
  
  /* Delivery Status Banner */
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
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .load-status-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .load-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .load-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  /* Site Details Card */
  .site-details-card, .route-details-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
  }
  
  .site-details-card h3, .route-details-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .site-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .info-row:last-child {
    border-bottom: none;
  }
  
  .info-label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .info-value {
    font-size: 0.875rem;
    color: #1f2937;
    font-weight: 600;
    text-align: right;
  }
  
  /* Route Details */
  .route-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .route-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  /* In-Transit Dark View */
  .in-transit-view {
    background: #1f2937;
    color: #ffffff;
    min-height: 100vh;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  
  .transit-header-dark {
    background: #111827;
    padding: 48px 24px;
    text-align: center;
  }
  
  .transit-header-dark h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 16px;
    color: #ffffff;
  }
  
  .destination-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .destination-name {
    font-size: 1.5rem;
    font-weight: 600;
    color: #3b82f6;
  }
  
  .destination-address {
    font-size: 1rem;
    color: #9ca3af;
  }
  
  .transit-status {
    flex: 1;
    padding: 48px 24px;
    display: flex;
    flex-direction: column;
    gap: 32px;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .current-location, .arrival-eta {
    text-align: center;
  }
  
  .location-label, .eta-label {
    display: block;
    font-size: 0.875rem;
    color: #9ca3af;
    margin-bottom: 8px;
  }
  
  .location-value, .eta-time {
    font-size: 1.25rem;
    font-weight: 600;
    color: #ffffff;
  }
  
  .navigation-instruction {
    background: #374151;
    border-radius: 12px;
    padding: 24px;
    text-align: center;
  }
  
  .instruction-text {
    font-size: 1.125rem;
    color: #ffffff;
    line-height: 1.6;
  }
  
  .transit-actions {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .action-btn {
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-btn.primary {
    background: #3b82f6;
    color: #ffffff;
  }
  
  .action-btn.primary:hover {
    background: #2563eb;
  }
  
  .action-btn.secondary {
    background: #6b7280;
    color: #ffffff;
  }
  
  .action-btn.secondary:hover {
    background: #4b5563;
  }
  
  .action-btn.large {
    padding: 18px 36px;
    font-size: 1.125rem;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .delivery-status-banner {
      flex-direction: column;
      gap: 16px;
    }
    
    .load-details, .route-details {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .info-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
    
    .info-value {
      text-align: left;
    }
  }
</style> 