<script lang="ts">
  import { onMount } from 'svelte';
  import { Upload, Library, Shield, Plus, Filter } from 'lucide-svelte';
  import DocumentUpload from '$lib/components/documents/DocumentUpload.svelte';
  import DocumentLibrary from '$lib/components/documents/DocumentLibrary.svelte';
  import ComplianceDashboard from '$lib/components/documents/ComplianceDashboard.svelte';
  import { documents, complianceAlerts } from '$lib/stores/documentStore';
  
  let activeTab: 'library' | 'upload' | 'compliance' = 'library';
  let showUploadModal = false;
  
  // Handle document upload success
  const handleDocumentUploaded = (event: CustomEvent) => {
    console.log('Document uploaded:', event.detail);
    showUploadModal = false;
    // Could show a success toast here
  };
  
  // Handle upload error
  const handleUploadError = (event: CustomEvent) => {
    console.error('Upload error:', event.detail);
    // Could show an error toast here
  };
  
  // Get alert count for badge
  $: alertCount = $complianceAlerts.filter(alert => !alert.acknowledged).length;
</script>

<svelte:head>
  <title>Document Management - Oil Field Tracker</title>
  <meta name="description" content="Comprehensive document management and compliance tracking for oil field operations" />
</svelte:head>

<div class="documents-page">
  <!-- Page Header -->
  <div class="page-header">
    <div class="header-content">
      <h1>Document Management</h1>
      <p class="page-description">
        Manage compliance documents, track expirations, and maintain regulatory requirements
      </p>
    </div>
    
    <div class="header-actions">
      <button 
        class="upload-btn"
        onclick={() => showUploadModal = true}
      >
        <Plus size={16} />
        Upload Documents
      </button>
    </div>
  </div>
  
  <!-- Tab Navigation -->
  <div class="tab-navigation">
    <button 
      class="tab-btn"
      class:active={activeTab === 'library'}
      onclick={() => activeTab = 'library'}
    >
      <Library size={16} />
      Document Library
      <span class="document-count">{$documents.length}</span>
    </button>
    
    <button 
      class="tab-btn"
      class:active={activeTab === 'compliance'}
      onclick={() => activeTab = 'compliance'}
    >
      <Shield size={16} />
      Compliance
      {#if alertCount > 0}
        <span class="alert-badge">{alertCount}</span>
      {/if}
    </button>
    
    <button 
      class="tab-btn"
      class:active={activeTab === 'upload'}
      onclick={() => activeTab = 'upload'}
    >
      <Upload size={16} />
      Upload
    </button>
  </div>
  
  <!-- Tab Content -->
  <div class="tab-content">
    {#if activeTab === 'library'}
      <div class="library-section">
        <DocumentLibrary 
          on:uploaded={handleDocumentUploaded}
          on:error={handleUploadError}
        />
      </div>
    {:else if activeTab === 'compliance'}
      <div class="compliance-section">
        <ComplianceDashboard />
      </div>
    {:else if activeTab === 'upload'}
      <div class="upload-section">
        <div class="upload-container">
          <div class="upload-header">
            <h2>Upload New Documents</h2>
            <p>Add new compliance documents to your library</p>
          </div>
          
          <DocumentUpload 
            customerId="customer-001"
            on:uploaded={handleDocumentUploaded}
            on:error={handleUploadError}
          />
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Upload Modal -->
{#if showUploadModal}
  <div 
    class="modal-overlay" 
    role="dialog" 
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="0"
    onclick={() => showUploadModal = false}
    onkeydown={(e) => e.key === 'Escape' && (showUploadModal = false)}
  >
    <div 
      class="modal-content" 
      role="document"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <div class="modal-header">
        <h3 id="modal-title">Upload Documents</h3>
        <button 
          class="modal-close"
          onclick={() => showUploadModal = false}
        >
          ×
        </button>
      </div>
      
      <div class="modal-body">
        <DocumentUpload 
          customerId="customer-001"
          on:uploaded={handleDocumentUploaded}
          on:error={handleUploadError}
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .documents-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
    padding: 12px;
  }
  
  /* Page Header */
  .page-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .header-content h1 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .page-description {
    color: #6b7280;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
  }
  
  .header-actions {
    display: flex;
    justify-content: center;
  }
  
  .upload-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: linear-gradient(135deg, #FF6B35 0%, #ff8c42 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
    touch-action: manipulation;
    min-height: 44px;
  }
  
  .upload-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 32px rgba(255, 107, 53, 0.4);
  }
  
  /* Tab Navigation */
  .tab-navigation {
    display: flex;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    overflow-x: auto;
    gap: 2px;
  }
  
  .tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    flex: 1;
    justify-content: center;
    min-height: 40px;
    touch-action: manipulation;
  }
  
  .tab-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #1a1a1a;
  }
  
  .tab-btn.active {
    background: linear-gradient(135deg, #FF6B35 0%, #ff8c42 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
  
  .document-count,
  .alert-badge {
    background: rgba(255, 255, 255, 0.2);
    color: inherit;
    padding: 2px 6px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }
  
  .alert-badge {
    background: #ef4444;
    color: white;
    animation: pulse 2s infinite;
  }
  
  /* Tab Content */
  .tab-content {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    min-height: 400px;
  }
  
  .upload-container {
    max-width: 100%;
  }
  
  .upload-header {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .upload-header h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  
  .upload-header p {
    color: #6b7280;
    font-size: 12px;
    margin: 0;
  }
  
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }
  
  .modal-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .modal-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s ease;
    touch-action: manipulation;
    min-width: 32px;
    min-height: 32px;
  }
  
  .modal-close:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #1a1a1a;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  /* Mobile optimizations */
  @media (max-width: 640px) {
    .documents-page {
      padding: 8px;
    }
    
    .page-header {
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 12px;
    }
    
    .header-content h1 {
      font-size: 18px;
    }
    
    .page-description {
      font-size: 11px;
    }
    
    .upload-btn {
      padding: 8px 12px;
      font-size: 12px;
      gap: 4px;
    }
    
    .tab-navigation {
      padding: 3px;
      border-radius: 10px;
      margin-bottom: 12px;
    }
    
    .tab-btn {
      padding: 6px 8px;
      font-size: 10px;
      gap: 4px;
      min-height: 36px;
    }
    
    .document-count,
    .alert-badge {
      padding: 1px 4px;
      font-size: 8px;
      min-width: 12px;
    }
    
    .tab-content {
      padding: 12px;
      border-radius: 12px;
      min-height: 300px;
    }
    
    .upload-header h2 {
      font-size: 16px;
    }
    
    .upload-header p {
      font-size: 11px;
    }
    
    .modal-overlay {
      padding: 8px;
    }
    
    .modal-content {
      border-radius: 12px;
      max-height: 95vh;
    }
    
    .modal-header {
      padding: 12px 16px;
    }
    
    .modal-header h3 {
      font-size: 16px;
    }
    
    .modal-body {
      padding: 16px;
    }
  }
  
  /* Tablet optimizations */
  @media (min-width: 641px) and (max-width: 1024px) {
    .documents-page {
      padding: 16px;
    }
    
    .page-header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    
    .header-actions {
      justify-content: flex-end;
    }
    
    .header-content h1 {
      font-size: 24px;
    }
    
    .page-description {
      font-size: 14px;
    }
    
    .tab-content {
      padding: 20px;
      min-height: 500px;
    }
  }
</style> 