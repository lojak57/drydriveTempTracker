<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  export let sharedState: any;
  
  onMount(() => {
    console.log('🏁 JobOverviewStep mounted');
    window.scrollTo(0, 0);
  });
</script>

<div class="workflow-view job-overview">
  <div class="job-overview-content">
    <div class="overview-header">
      <h2>Today's Hauls</h2>
      <p>Review your assigned jobs for today and start your shift</p>
    </div>
    
    <div class="daily-hauls">
      <div class="haul-card">
        <div class="haul-info">
          <h3>Job #TK-2024-001</h3>
          <p><strong>Pickup:</strong> Johnson Tank Battery #3</p>
          <p><strong>Delivery:</strong> Permian Basin Refinery</p>
          <p><strong>Expected Volume:</strong> 120 BBL</p>
          <p><strong>Scheduled:</strong> 8:00 AM - 12:00 PM</p>
        </div>
        <div class="haul-status pending">PENDING</div>
      </div>
      
      <div class="haul-card">
        <div class="haul-info">
          <h3>Job #TK-2024-002</h3>
          <p><strong>Pickup:</strong> Eagle Ford Tank #7</p>
          <p><strong>Delivery:</strong> Marathon Refinery</p>
          <p><strong>Expected Volume:</strong> 98 BBL</p>
          <p><strong>Scheduled:</strong> 1:00 PM - 4:30 PM</p>
        </div>
        <div class="haul-status scheduled">SCHEDULED</div>
      </div>
      
      <div class="haul-card">
        <div class="haul-info">
          <h3>Job #TK-2024-003</h3>
          <p><strong>Pickup:</strong> Bakken Wells #12</p>
          <p><strong>Delivery:</strong> Local Storage</p>
          <p><strong>Expected Volume:</strong> 105 BBL</p>
          <p><strong>Scheduled:</strong> 5:00 PM - 7:00 PM</p>
        </div>
        <div class="haul-status scheduled">SCHEDULED</div>
      </div>
    </div>
    
    <div class="daily-summary">
      <div class="summary-stat">
        <span class="stat-label">Total Hauls</span>
        <span class="stat-value">3</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Total Volume</span>
        <span class="stat-value">323 BBL</span>
      </div>
      <div class="summary-stat">
        <span class="stat-label">Estimated Hours</span>
        <span class="stat-value">8.5 hrs</span>
      </div>
    </div>
    
    <div class="start-day-action">
      <button class="start-day-btn" on:click={() => dispatch('start-pretrip')}>
        🚀 Start Day - Begin Pre-Trip Inspection
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
  
  .job-overview-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .overview-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .overview-header h2 {
    font-size: 2rem;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .overview-header p {
    color: #6b7280;
    font-size: 1.1rem;
  }
  
  .daily-hauls {
    display: grid;
    gap: 20px;
    margin-bottom: 32px;
  }
  
  .haul-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .haul-info h3 {
    color: #1f2937;
    margin-bottom: 12px;
    font-size: 1.2rem;
  }
  
  .haul-info p {
    color: #6b7280;
    margin: 4px 0;
  }
  
  .haul-status {
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .haul-status.pending {
    background: #fef3c7;
    color: #92400e;
  }
  
  .haul-status.scheduled {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .daily-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .summary-stat {
    text-align: center;
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
    font-size: 2rem;
    font-weight: 700;
  }
  
  .start-day-action {
    text-align: center;
  }
  
  .start-day-btn {
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
  }
  
  .start-day-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  }
</style> 