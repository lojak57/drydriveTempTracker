<script lang="ts">
  import { onMount } from 'svelte';
  import { Search, Filter, Grid, List, Download, Eye, Edit, Trash2, Calendar, User, FileText, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-svelte';
  import { documents, documentActions, type CustomerDocument } from '$lib/stores/documentStore';
  import DocumentViewer from './DocumentViewer.svelte';
  
  export let customerId: string | undefined = undefined;
  export let haulId: string | undefined = undefined;
  export let showActions = true;
  export let compact = false;
  
  let searchQuery = '';
  let selectedType: CustomerDocument['type'] | 'all' = 'all';
  let selectedStatus: CustomerDocument['status'] | 'all' = 'all';
  let sortBy: 'uploadDate' | 'fileName' | 'type' | 'status' | 'expiryDate' = 'uploadDate';
  let sortOrder: 'asc' | 'desc' = 'desc';
  let viewMode: 'grid' | 'list' = 'grid';
  let selectedDocuments: string[] = [];
  
  // Document viewer state
  let viewerDocument: CustomerDocument | null = null;
  let isViewerOpen = false;
  
  $: filteredDocuments = $documents
    .filter(doc => {
      // Filter by customer if specified
      if (customerId && doc.customerId !== customerId) return false;
      
      // Filter by haul if specified
      if (haulId && doc.haulId !== haulId) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          doc.fileName.toLowerCase().includes(query) ||
          doc.type.toLowerCase().includes(query) ||
          doc.tags.some(tag => tag.toLowerCase().includes(query)) ||
          doc.metadata.description?.toLowerCase().includes(query) ||
          doc.uploadedBy.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }
      
      // Filter by type
      if (selectedType !== 'all' && doc.type !== selectedType) return false;
      
      // Filter by status
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false;
      
      return true;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'expiryDate':
          aValue = a.expiryDate?.getTime() || 0;
          bValue = b.expiryDate?.getTime() || 0;
          break;
        default:
          aValue = a.uploadDate.getTime();
          bValue = b.uploadDate.getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  
  // Document type options
  const documentTypes: (CustomerDocument['type'] | 'all')[] = [
    'all', 'IFTA', 'Insurance', 'Contract', 'PreTrip', 'JSA', 'Emissions', 'BOL', 'Manifest', 'Safety', 'Maintenance'
  ];
  
  // Status options
  const statusOptions: (CustomerDocument['status'] | 'all')[] = [
    'all', 'valid', 'pending', 'expired', 'expiring_soon', 'rejected'
  ];
  
  // Get status info
  const getStatusInfo = (status: CustomerDocument['status']) => {
    switch (status) {
      case 'valid':
        return { icon: CheckCircle, color: 'status-valid', label: 'Valid' };
      case 'pending':
        return { icon: Clock, color: 'status-pending', label: 'Pending' };
      case 'expired':
        return { icon: XCircle, color: 'status-expired', label: 'Expired' };
      case 'expiring_soon':
        return { icon: AlertTriangle, color: 'status-expiring', label: 'Expiring Soon' };
      case 'rejected':
        return { icon: XCircle, color: 'status-rejected', label: 'Rejected' };
      default:
        return { icon: FileText, color: 'status-unknown', label: 'Unknown' };
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: Date): number => {
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Handle document selection
  const toggleDocumentSelection = (documentId: string) => {
    if (selectedDocuments.includes(documentId)) {
      selectedDocuments = selectedDocuments.filter(id => id !== documentId);
    } else {
      selectedDocuments = [...selectedDocuments, documentId];
    }
  };
  
  // Select all documents
  const selectAllDocuments = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      selectedDocuments = [];
    } else {
      selectedDocuments = filteredDocuments.map(doc => doc.id);
    }
  };
  
  // Bulk actions
  const bulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
      selectedDocuments.forEach(id => documentActions.deleteDocument(id));
      selectedDocuments = [];
    }
  };
  
  const bulkUpdateStatus = (status: CustomerDocument['status']) => {
    documentActions.bulkUpdateStatus(selectedDocuments, status);
    selectedDocuments = [];
  };
  
  // Individual actions
  const viewDocument = (document: CustomerDocument) => {
    viewerDocument = document;
    isViewerOpen = true;
  };
  
  const editDocument = (document: CustomerDocument) => {
    console.log('Editing document:', document);
  };
  
  const deleteDocument = (document: CustomerDocument) => {
    if (confirm(`Are you sure you want to delete "${document.fileName}"?`)) {
      documentActions.deleteDocument(document.id);
    }
  };
  
  const downloadDocument = (document: CustomerDocument) => {
    console.log('Downloading document:', document);
  };
  
  // Document viewer handlers
  const handleViewerClose = () => {
    isViewerOpen = false;
    viewerDocument = null;
  };
  
  const handleViewerDownload = (event: CustomEvent<{ document: CustomerDocument }>) => {
    downloadDocument(event.detail.document);
  };
</script>

<div class="document-library">
  <!-- Header -->
  <div class="library-header">
    <div class="header-content">
      <h2 class="library-title">Document Library</h2>
      <div class="document-count-badge">{filteredDocuments.length} documents</div>
    </div>
    
    <div class="view-controls">
      <button
        class="view-toggle-btn {viewMode === 'grid' ? 'active' : ''}"
        on:click={() => viewMode = 'grid'}
        aria-label="Grid view"
      >
        <Grid size={16} />
      </button>
      <button
        class="view-toggle-btn {viewMode === 'list' ? 'active' : ''}"
        on:click={() => viewMode = 'list'}
        aria-label="List view"
      >
        <List size={16} />
      </button>
    </div>
  </div>
  
  <!-- Search and Filters -->
  <div class="search-filters-section">
    <div class="search-container">
      <Search class="search-icon" size={18} />
      <input
        type="text"
        placeholder="Search documents..."
        bind:value={searchQuery}
        class="search-input"
      />
    </div>
    
    <div class="filters-container">
      <select bind:value={selectedType} class="filter-select">
        {#each documentTypes as type}
          <option value={type}>{type === 'all' ? 'All Types' : type}</option>
        {/each}
      </select>
      
      <select bind:value={selectedStatus} class="filter-select">
        {#each statusOptions as status}
          <option value={status}>{status === 'all' ? 'All Status' : getStatusInfo(status).label}</option>
        {/each}
      </select>
      
      <select bind:value={sortBy} class="filter-select">
        <option value="uploadDate">Upload Date</option>
        <option value="fileName">File Name</option>
        <option value="type">Type</option>
        <option value="status">Status</option>
        <option value="expiryDate">Expiry Date</option>
      </select>
      
      <button
        class="sort-order-btn"
        on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
        aria-label="Toggle sort order"
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  </div>
  
  <!-- Bulk Actions -->
  {#if selectedDocuments.length > 0}
    <div class="bulk-actions-bar">
      <div class="selected-info">
        <span class="selected-count">{selectedDocuments.length} selected</span>
      </div>
      
      <div class="bulk-buttons">
        <button class="bulk-action-btn valid" on:click={() => bulkUpdateStatus('valid')}>
          Mark Valid
        </button>
        <button class="bulk-action-btn pending" on:click={() => bulkUpdateStatus('pending')}>
          Mark Pending
        </button>
        <button class="bulk-action-btn danger" on:click={bulkDelete}>
          Delete Selected
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Documents Display -->
  <div class="documents-display {viewMode}">
    {#if filteredDocuments.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <FileText size={64} />
        </div>
        <h3 class="empty-title">No documents found</h3>
        <p class="empty-description">Try adjusting your search or filters</p>
      </div>
    {:else}
      {#if viewMode === 'grid'}
        <!-- Grid View -->
        <div class="documents-grid">
          {#each filteredDocuments as document}
            <div class="document-card glass-card">
              <div class="card-header">
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(document.id)}
                  on:change={() => toggleDocumentSelection(document.id)}
                  class="document-checkbox"
                />
                
                <div class="status-badge {getStatusInfo(document.status).color}">
                  <svelte:component this={getStatusInfo(document.status).icon} size={12} />
                  <span>{getStatusInfo(document.status).label}</span>
                </div>
              </div>
              
              <div class="card-body">
                <div class="document-icon-container">
                  <FileText size={32} />
                </div>
                
                <h4 class="document-title">{document.fileName}</h4>
                <p class="document-type">{document.type}</p>
                
                <div class="document-metadata">
                  <div class="metadata-item">
                    <Calendar size={12} />
                    <span>{formatDate(document.uploadDate)}</span>
                  </div>
                  <div class="metadata-item">
                    <User size={12} />
                    <span>{document.uploadedBy}</span>
                  </div>
                  <div class="metadata-item">
                    <span>{formatFileSize(document.fileSize)}</span>
                  </div>
                </div>
                
                {#if document.expiryDate}
                  <div class="expiry-indicator">
                    {#if document.status === 'expired'}
                      <span class="expired-text">Expired {Math.abs(getDaysUntilExpiry(document.expiryDate))} days ago</span>
                    {:else if document.status === 'expiring_soon'}
                      <span class="expiring-text">Expires in {getDaysUntilExpiry(document.expiryDate)} days</span>
                    {:else}
                      <span class="valid-text">Valid until {formatDate(document.expiryDate)}</span>
                    {/if}
                  </div>
                {/if}
              </div>
              
              {#if showActions}
                <div class="card-actions">
                  <button class="action-button view" on:click={() => viewDocument(document)} title="View">
                    <Eye size={14} />
                  </button>
                  <button class="action-button download" on:click={() => downloadDocument(document)} title="Download">
                    <Download size={14} />
                  </button>
                  <button class="action-button edit" on:click={() => editDocument(document)} title="Edit">
                    <Edit size={14} />
                  </button>
                  <button class="action-button delete" on:click={() => deleteDocument(document)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {:else}
        <!-- List View -->
        <div class="documents-list">
          <div class="list-header">
            <div class="list-cell checkbox-cell">
              <input
                type="checkbox"
                checked={selectedDocuments.length === filteredDocuments.length}
                on:change={selectAllDocuments}
              />
            </div>
            <div class="list-cell name-cell">Name</div>
            <div class="list-cell type-cell">Type</div>
            <div class="list-cell status-cell">Status</div>
            <div class="list-cell date-cell">Upload Date</div>
            <div class="list-cell size-cell">Size</div>
            {#if showActions}
              <div class="list-cell actions-cell">Actions</div>
            {/if}
          </div>
          
          {#each filteredDocuments as document}
            <div class="list-row">
              <div class="list-cell checkbox-cell">
                <input
                  type="checkbox"
                  checked={selectedDocuments.includes(document.id)}
                  on:change={() => toggleDocumentSelection(document.id)}
                />
              </div>
              
              <div class="list-cell name-cell">
                <div class="file-info">
                  <FileText size={16} />
                  <span class="file-name">{document.fileName}</span>
                </div>
              </div>
              
              <div class="list-cell type-cell">
                <span class="type-badge">{document.type}</span>
              </div>
              
              <div class="list-cell status-cell">
                <div class="status-badge small {getStatusInfo(document.status).color}">
                  <svelte:component this={getStatusInfo(document.status).icon} size={10} />
                  <span>{getStatusInfo(document.status).label}</span>
                </div>
              </div>
              
              <div class="list-cell date-cell">
                <span>{formatDate(document.uploadDate)}</span>
              </div>
              
              <div class="list-cell size-cell">
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
              
              {#if showActions}
                <div class="list-cell actions-cell">
                  <div class="list-actions">
                    <button class="action-button small view" on:click={() => viewDocument(document)} title="View">
                      <Eye size={12} />
                    </button>
                    <button class="action-button small download" on:click={() => downloadDocument(document)} title="Download">
                      <Download size={12} />
                    </button>
                    <button class="action-button small edit" on:click={() => editDocument(document)} title="Edit">
                      <Edit size={12} />
                    </button>
                    <button class="action-button small delete" on:click={() => deleteDocument(document)} title="Delete">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Document Viewer Modal -->
<DocumentViewer 
  document={viewerDocument}
  isOpen={isViewerOpen}
  on:close={handleViewerClose}
  on:download={handleViewerDownload}
/>

<style>
  .document-library {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
    min-height: 100vh;
  }
  
  /* Header */
  .library-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .library-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .document-count-badge {
    background: linear-gradient(135deg, #004E89 0%, #2563eb 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 78, 137, 0.3);
  }
  
  .view-controls {
    display: flex;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 4px;
    gap: 4px;
  }
  
  .view-toggle-btn {
    padding: 8px 12px;
    border: none;
    background: transparent;
    border-radius: 8px;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .view-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.5);
    color: #1a1a1a;
  }
  
  .view-toggle-btn.active {
    background: #FF6B35;
    color: white;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
  }
  
  /* Search and Filters */
  .search-filters-section {
    display: flex;
    gap: 20px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  
  .search-container {
    position: relative;
    flex: 1;
    min-width: 300px;
  }
  
  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }
  
  .search-input {
    width: 100%;
    padding: 16px 16px 16px 48px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    font-size: 16px;
    color: #1a1a1a;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #FF6B35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1), 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  .search-input::placeholder {
    color: #9ca3af;
  }
  
  .filters-container {
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .filter-select {
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    color: #1a1a1a;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
  }
  
  .filter-select:focus {
    outline: none;
    border-color: #FF6B35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }
  
  .sort-order-btn {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    color: #1a1a1a;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .sort-order-btn:hover {
    background: rgba(255, 255, 255, 0.4);
    transform: translateY(-1px);
  }
  
  /* Bulk Actions */
  .bulk-actions-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: linear-gradient(135deg, #004E89 0%, #2563eb 100%);
    border-radius: 16px;
    margin-bottom: 24px;
    box-shadow: 0 8px 24px rgba(0, 78, 137, 0.3);
  }
  
  .selected-info {
    color: white;
    font-weight: 600;
  }
  
  .bulk-buttons {
    display: flex;
    gap: 12px;
  }
  
  .bulk-action-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .bulk-action-btn.valid {
    background: #10b981;
    color: white;
  }
  
  .bulk-action-btn.pending {
    background: #f59e0b;
    color: white;
  }
  
  .bulk-action-btn.danger {
    background: #ef4444;
    color: white;
  }
  
  .bulk-action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 80px 20px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .empty-icon {
    color: #9ca3af;
    margin-bottom: 24px;
  }
  
  .empty-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 12px 0;
  }
  
  .empty-description {
    color: #6b7280;
    font-size: 16px;
    margin: 0;
  }
  
  /* Grid View */
  .documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
  
  .document-card {
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
  }
  
  .document-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .document-checkbox {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .status-badge.small {
    padding: 4px 8px;
    font-size: 10px;
  }
  
  .status-valid {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
  
  .status-pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
  
  .status-expired {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
  
  .status-expiring {
    background: rgba(255, 107, 53, 0.1);
    color: #ea580c;
    border: 1px solid rgba(255, 107, 53, 0.2);
  }
  
  .status-rejected {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
  
  .status-unknown {
    background: rgba(107, 114, 128, 0.1);
    color: #4b5563;
    border: 1px solid rgba(107, 114, 128, 0.2);
  }
  
  .card-body {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .document-icon-container {
    color: #004E89;
    margin-bottom: 16px;
  }
  
  .document-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    line-height: 1.4;
    word-break: break-word;
  }
  
  .document-type {
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    margin: 0 0 16px 0;
  }
  
  .document-metadata {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .metadata-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #6b7280;
    font-size: 12px;
  }
  
  .expiry-indicator {
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }
  
  .expired-text {
    color: #dc2626;
    background: rgba(239, 68, 68, 0.1);
  }
  
  .expiring-text {
    color: #ea580c;
    background: rgba(255, 107, 53, 0.1);
  }
  
  .valid-text {
    color: #059669;
    background: rgba(16, 185, 129, 0.1);
  }
  
  .card-actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .action-button {
    padding: 8px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .action-button.small {
    padding: 6px;
  }
  
  .action-button.view {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
  }
  
  .action-button.download {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }
  
  .action-button.edit {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
  }
  
  .action-button.delete {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }
  
  .action-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  /* List View */
  .documents-list {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .list-header {
    display: grid;
    grid-template-columns: 50px 1fr 120px 140px 120px 100px 120px;
    gap: 16px;
    padding: 20px 24px;
    background: rgba(0, 78, 137, 0.1);
    font-weight: 600;
    color: #1a1a1a;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .list-row {
    display: grid;
    grid-template-columns: 50px 1fr 120px 140px 120px 100px 120px;
    gap: 16px;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }
  
  .list-row:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .list-row:last-child {
    border-bottom: none;
  }
  
  .list-cell {
    display: flex;
    align-items: center;
  }
  
  .checkbox-cell {
    justify-content: center;
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .file-name {
    font-weight: 500;
    color: #1a1a1a;
    word-break: break-word;
  }
  
  .type-badge {
    background: rgba(0, 78, 137, 0.1);
    color: #004E89;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }
  
  .list-actions {
    display: flex;
    gap: 4px;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .document-library {
      padding: 16px;
    }
    
    .library-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }
    
    .search-filters-section {
      flex-direction: column;
    }
    
    .filters-container {
      flex-wrap: wrap;
    }
    
    .documents-grid {
      grid-template-columns: 1fr;
    }
    
    .list-header,
    .list-row {
      grid-template-columns: 1fr;
      gap: 8px;
    }
    
    .list-cell {
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .list-cell:last-child {
      border-bottom: none;
    }
  }
</style> 