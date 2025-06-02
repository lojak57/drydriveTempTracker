<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  export let sharedState: any;
  
  onMount(() => {
    console.log('📦 UnloadingStep mounted');
    window.scrollTo(0, 0);
  });
</script>

<div class="workflow-view unloading">
  <div class="offload-content">
    <div class="offload-header">
      <h2>Offload Operations</h2>
      <p>Complete delivery and transfer product to customer facility</p>
    </div>
    
    <div class="offload-workflow">
      <div class="delivery-site-info">
        <div class="site-card">
          <h3>🏭 Delivery Site Information</h3>
          <div class="site-details">
            <p><strong>Facility:</strong> Permian Basin Refinery</p>
            <p><strong>Bay:</strong> #7</p>
            <p><strong>Contact:</strong> Mike Rodriguez</p>
            <p><strong>Phone:</strong> (432) 555-0199</p>
          </div>
        </div>
      </div>
      
      <div class="volume-reconciliation">
        <h3>Volume Reconciliation</h3>
        <div class="reconciliation-table">
          <div class="recon-row header">
            <span>Measurement</span>
            <span>Volume</span>
            <span>Variance</span>
          </div>
          <div class="recon-row">
            <span>Loaded Volume</span>
            <span>120.0 BBL</span>
            <span class="baseline">Baseline</span>
          </div>
          <div class="recon-row">
            <span>Delivery Meter</span>
            <span>119.8 BBL</span>
            <span class="variance loss">-0.2 BBL</span>
          </div>
          <div class="recon-row">
            <span>Customer Tank</span>
            <span>119.6 BBL</span>
            <span class="variance loss">-0.4 BBL</span>
          </div>
          <div class="recon-row total">
            <span><strong>Net Delivered</strong></span>
            <span><strong>119.6 BBL</strong></span>
            <span class="variance loss"><strong>-0.4 BBL (-0.33%)</strong></span>
          </div>
        </div>
      </div>
      
      <div class="temperature-final">
        <h3>Final Temperature Reading</h3>
        <div class="temp-final-reading">
          <div class="temp-display">
            <span class="temp-value">76°F</span>
            <span class="temp-label">Delivery Temperature</span>
          </div>
          <div class="temp-variance">
            <span class="variance-label">Temperature Drop:</span>
            <span class="variance-value">-2°F</span>
          </div>
        </div>
      </div>
      
      <div class="delivery-documentation">
        <h3>Delivery Documentation</h3>
        <div class="doc-actions">
          <button class="doc-btn">📋 Generate Bill of Lading</button>
          <button class="doc-btn">✍️ Get Customer Signature</button>
          <button class="doc-btn">📸 Take Photos</button>
        </div>
      </div>
      
      <div class="offload-completion">
        <button class="complete-delivery-btn" on:click={() => dispatch('delivery-complete')}>
          🎯 Complete Delivery
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
  
  .offload-content {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .offload-header {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .offload-header h2 {
    font-size: 2rem;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .offload-header p {
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
  
  .volume-reconciliation {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .volume-reconciliation h3 {
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .reconciliation-table {
    display: grid;
    gap: 1px;
    background: #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .recon-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    padding: 12px 16px;
    background: white;
    align-items: center;
  }
  
  .recon-row.header {
    background: #f9fafb;
    font-weight: 600;
    color: #374151;
  }
  
  .recon-row.total {
    background: #fef3c7;
  }
  
  .baseline {
    color: #6b7280;
    font-weight: 500;
  }
  
  .variance.loss {
    color: #dc2626;
    font-weight: 600;
  }
  
  .temperature-final {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .temperature-final h3 {
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .temp-final-reading {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: center;
  }
  
  .temp-display {
    text-align: center;
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .temp-value {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 8px;
  }
  
  .temp-label {
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .temp-variance {
    text-align: center;
  }
  
  .variance-label {
    display: block;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .variance-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
  }
  
  .delivery-documentation {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }
  
  .delivery-documentation h3 {
    color: #1f2937;
    margin-bottom: 16px;
  }
  
  .doc-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  .doc-btn {
    padding: 12px 16px;
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    color: #374151;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .doc-btn:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }
  
  .offload-completion {
    text-align: center;
  }
  
  .complete-delivery-btn {
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
  
  .complete-delivery-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
  }
</style> 