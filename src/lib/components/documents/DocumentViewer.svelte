<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Image, File, Printer } from 'lucide-svelte';
  import type { CustomerDocument } from '$lib/stores/documentStore';
  
  export let document: CustomerDocument | null = null;
  export let isOpen = false;
  
  const dispatch = createEventDispatcher<{
    close: void;
    download: { document: CustomerDocument };
  }>();
  
  let zoomLevel = 100;
  let rotation = 0;
  
  // Mock document content based on document type
  const getMockDocumentContent = (doc: CustomerDocument) => {
    const fileExtension = doc.fileName.toLowerCase().split('.').pop();
    
    switch (fileExtension) {
      case 'pdf':
        return {
          type: 'pdf',
          content: generateMockPDFContent(doc),
          icon: FileText
        };
      case 'jpg':
      case 'jpeg':
      case 'png':
        return {
          type: 'image',
          content: generateMockImageContent(doc),
          icon: Image
        };
      case 'txt':
        return {
          type: 'text',
          content: generateMockTextContent(doc),
          icon: File
        };
      case 'doc':
      case 'docx':
        return {
          type: 'document',
          content: generateMockDocumentContent(doc),
          icon: FileText
        };
      default:
        return {
          type: 'unknown',
          content: 'Document preview not available',
          icon: File
        };
    }
  };
  
  const generateMockPDFContent = (doc: CustomerDocument) => {
    switch (doc.type) {
      case 'IFTA':
        return `
          <div class="pdf-page">
            <div class="pdf-header">
              <h1>INTERNATIONAL FUEL TAX AGREEMENT</h1>
              <h2>QUARTERLY FUEL TAX REPORT</h2>
              <div class="report-period">Q4 2024</div>
            </div>
            
            <div class="pdf-section">
              <h3>Carrier Information</h3>
              <div class="info-grid">
                <div><strong>Carrier Name:</strong> Apex Oil Transport LLC</div>
                <div><strong>IFTA Account:</strong> TX-123456789</div>
                <div><strong>Report Period:</strong> October 1 - December 31, 2024</div>
                <div><strong>Due Date:</strong> January 31, 2025</div>
              </div>
            </div>
            
            <div class="pdf-section">
              <h3>Fuel Summary</h3>
              <table class="fuel-table">
                <thead>
                  <tr>
                    <th>Jurisdiction</th>
                    <th>Miles Traveled</th>
                    <th>Gallons Purchased</th>
                    <th>Gallons Used</th>
                    <th>Tax Rate</th>
                    <th>Tax Due</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Texas</td>
                    <td>12,450</td>
                    <td>2,100</td>
                    <td>1,867</td>
                    <td>$0.20</td>
                    <td>$373.40</td>
                  </tr>
                  <tr>
                    <td>Oklahoma</td>
                    <td>8,230</td>
                    <td>1,200</td>
                    <td>1,234</td>
                    <td>$0.19</td>
                    <td>$234.46</td>
                  </tr>
                  <tr>
                    <td>Louisiana</td>
                    <td>6,890</td>
                    <td>950</td>
                    <td>1,033</td>
                    <td>$0.20</td>
                    <td>$206.60</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="pdf-footer">
              <div class="signature-section">
                <div class="signature-line">
                  <div>Authorized Signature: _________________________</div>
                  <div>Date: ${new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        `;
        
      case 'Insurance':
        return `
          <div class="pdf-page">
            <div class="pdf-header">
              <h1>COMMERCIAL AUTO INSURANCE POLICY</h1>
              <div class="policy-number">Policy #: CAI-2024-789456</div>
            </div>
            
            <div class="pdf-section">
              <h3>Policy Holder Information</h3>
              <div class="info-grid">
                <div><strong>Insured:</strong> Apex Oil Transport LLC</div>
                <div><strong>Address:</strong> 1234 Industrial Blvd, Houston, TX 77001</div>
                <div><strong>Policy Period:</strong> January 1, 2024 - December 31, 2024</div>
                <div><strong>Premium:</strong> $45,000 annually</div>
              </div>
            </div>
            
            <div class="pdf-section">
              <h3>Coverage Details</h3>
              <table class="coverage-table">
                <thead>
                  <tr>
                    <th>Coverage Type</th>
                    <th>Limit</th>
                    <th>Deductible</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Bodily Injury Liability</td>
                    <td>$1,000,000 per person / $2,000,000 per accident</td>
                    <td>$0</td>
                  </tr>
                  <tr>
                    <td>Property Damage Liability</td>
                    <td>$1,000,000 per accident</td>
                    <td>$0</td>
                  </tr>
                  <tr>
                    <td>Comprehensive</td>
                    <td>Actual Cash Value</td>
                    <td>$2,500</td>
                  </tr>
                  <tr>
                    <td>Collision</td>
                    <td>Actual Cash Value</td>
                    <td>$5,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="pdf-section">
              <h3>Covered Vehicles</h3>
              <div class="vehicle-list">
                <div class="vehicle-item">
                  <strong>Unit #001:</strong> 2022 Peterbilt 579 - VIN: 1XPWD40X1ED123456
                </div>
                <div class="vehicle-item">
                  <strong>Unit #002:</strong> 2023 Kenworth T680 - VIN: 1XKWD40X2FD789012
                </div>
                <div class="vehicle-item">
                  <strong>Unit #003:</strong> 2021 Freightliner Cascadia - VIN: 3AKJHHDR3MSAB1234
                </div>
              </div>
            </div>
          </div>
        `;
        
      case 'PreTrip':
        return `
          <div class="pdf-page">
            <div class="pdf-header">
              <h1>PRE-TRIP INSPECTION REPORT</h1>
              <div class="inspection-date">Date: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="pdf-section">
              <h3>Vehicle Information</h3>
              <div class="info-grid">
                <div><strong>Vehicle ID:</strong> Unit #002</div>
                <div><strong>Driver:</strong> John Smith</div>
                <div><strong>Odometer:</strong> 245,678 miles</div>
                <div><strong>Inspection Time:</strong> 06:30 AM</div>
              </div>
            </div>
            
            <div class="pdf-section">
              <h3>Inspection Checklist</h3>
              <div class="checklist">
                <div class="checklist-category">
                  <h4>Engine Compartment</h4>
                  <div class="checklist-item">✓ Oil Level - OK</div>
                  <div class="checklist-item">✓ Coolant Level - OK</div>
                  <div class="checklist-item">✓ Belt Condition - OK</div>
                  <div class="checklist-item">✓ Hoses - OK</div>
                </div>
                
                <div class="checklist-category">
                  <h4>Tires & Wheels</h4>
                  <div class="checklist-item">✓ Tire Pressure - All OK</div>
                  <div class="checklist-item">✓ Tread Depth - Adequate</div>
                  <div class="checklist-item">✓ Wheel Nuts - Secure</div>
                  <div class="checklist-item">✓ No Visible Damage</div>
                </div>
                
                <div class="checklist-category">
                  <h4>Lights & Electrical</h4>
                  <div class="checklist-item">✓ Headlights - Working</div>
                  <div class="checklist-item">✓ Tail Lights - Working</div>
                  <div class="checklist-item">✓ Turn Signals - Working</div>
                  <div class="checklist-item">✓ Brake Lights - Working</div>
                </div>
                
                <div class="checklist-category">
                  <h4>Brakes</h4>
                  <div class="checklist-item">✓ Air Pressure - 120 PSI</div>
                  <div class="checklist-item">✓ Brake Lines - No Leaks</div>
                  <div class="checklist-item">✓ Brake Pads - Good</div>
                </div>
              </div>
            </div>
            
            <div class="pdf-footer">
              <div class="signature-section">
                <div>Driver Signature: John Smith</div>
                <div>Date: ${new Date().toLocaleDateString()}</div>
                <div>Status: PASSED - Vehicle Safe for Operation</div>
              </div>
            </div>
          </div>
        `;
        
      default:
        return `
          <div class="pdf-page">
            <div class="pdf-header">
              <h1>${doc.type.toUpperCase()} DOCUMENT</h1>
              <div class="document-info">${doc.fileName}</div>
            </div>
            
            <div class="pdf-section">
              <h3>Document Details</h3>
              <div class="info-grid">
                <div><strong>Document Type:</strong> ${doc.type}</div>
                <div><strong>Upload Date:</strong> ${doc.uploadDate.toLocaleDateString()}</div>
                <div><strong>Uploaded By:</strong> ${doc.uploadedBy}</div>
                <div><strong>Status:</strong> ${doc.status}</div>
              </div>
            </div>
            
            <div class="pdf-section">
              <p>This is a mock ${doc.type} document for demonstration purposes. In a real application, this would display the actual document content.</p>
            </div>
          </div>
        `;
    }
  };
  
  const generateMockImageContent = (doc: CustomerDocument) => {
    // Generate a placeholder image with document info
    return `
      <div class="image-container">
        <div class="image-placeholder">
          <div class="image-icon">📷</div>
          <div class="image-info">
            <h3>${doc.fileName}</h3>
            <p>Image Document</p>
            <div class="image-details">
              <div>Type: ${doc.type}</div>
              <div>Size: ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
              <div>Uploaded: ${doc.uploadDate.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };
  
  const generateMockTextContent = (doc: CustomerDocument) => {
    return `
      <div class="text-document">
        <h2>${doc.fileName}</h2>
        <div class="text-content">
          <p><strong>Document Type:</strong> ${doc.type}</p>
          <p><strong>Created:</strong> ${doc.uploadDate.toLocaleDateString()}</p>
          <p><strong>Author:</strong> ${doc.uploadedBy}</p>
          
          <hr>
          
          <h3>Sample Content</h3>
          <p>This is a sample text document for the Oil Field Temperature Tracking system. This document contains important information related to ${doc.type} operations.</p>
          
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          
          <h4>Key Points:</h4>
          <ul>
            <li>Temperature monitoring protocols</li>
            <li>Safety compliance requirements</li>
            <li>Equipment maintenance schedules</li>
            <li>Regulatory documentation</li>
          </ul>
        </div>
      </div>
    `;
  };
  
  const generateMockDocumentContent = (doc: CustomerDocument) => {
    return generateMockPDFContent(doc); // Use PDF format for Word docs
  };
  
  const handleClose = () => {
    dispatch('close');
  };
  
  const handleDownload = () => {
    if (document) {
      dispatch('download', { document });
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const zoomIn = () => {
    zoomLevel = Math.min(zoomLevel + 25, 200);
  };
  
  const zoomOut = () => {
    zoomLevel = Math.max(zoomLevel - 25, 50);
  };
  
  const rotate = () => {
    rotation = (rotation + 90) % 360;
  };
  
  $: documentContent = document ? getMockDocumentContent(document) : null;
</script>

{#if isOpen && document && documentContent}
  <div class="modal-overlay" on:click={handleClose}>
    <div class="document-viewer" on:click|stopPropagation>
      <!-- Header -->
      <div class="viewer-header">
        <div class="document-info">
          <svelte:component this={documentContent.icon} size={20} />
          <div class="document-details">
            <h3>{document.fileName}</h3>
            <span class="document-type">{document.type}</span>
          </div>
        </div>
        
        <div class="viewer-controls">
          <button class="control-btn" on:click={zoomOut} title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          
          <span class="zoom-level">{zoomLevel}%</span>
          
          <button class="control-btn" on:click={zoomIn} title="Zoom In">
            <ZoomIn size={16} />
          </button>
          
          <button class="control-btn" on:click={rotate} title="Rotate">
            <RotateCw size={16} />
          </button>
          
          <div class="control-divider"></div>
          
          <button class="control-btn" on:click={handlePrint} title="Print">
            <Printer size={16} />
          </button>
          
          <button class="control-btn" on:click={handleDownload} title="Download">
            <Download size={16} />
          </button>
          
          <button class="control-btn close-btn" on:click={handleClose} title="Close">
            <X size={16} />
          </button>
        </div>
      </div>
      
      <!-- Document Content -->
      <div class="viewer-content">
        <div 
          class="document-container"
          style="transform: scale({zoomLevel / 100}) rotate({rotation}deg)"
        >
          {@html documentContent.content}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: fadeIn 0.2s ease-out;
  }
  
  .document-viewer {
    background: white;
    border-radius: 12px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 1200px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  .viewer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }
  
  .document-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .document-details h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }
  
  .document-type {
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }
  
  .viewer-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .control-btn {
    padding: 8px;
    border: none;
    background: rgba(107, 114, 128, 0.1);
    color: #6b7280;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .control-btn:hover {
    background: rgba(107, 114, 128, 0.2);
    color: #1a1a1a;
  }
  
  .close-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }
  
  .zoom-level {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    min-width: 40px;
    text-align: center;
  }
  
  .control-divider {
    width: 1px;
    height: 20px;
    background: #e5e7eb;
    margin: 0 4px;
  }
  
  .viewer-content {
    flex: 1;
    overflow: auto;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .document-container {
    transition: transform 0.3s ease;
    transform-origin: center;
  }
  
  /* PDF Document Styles */
  :global(.pdf-page) {
    background: white;
    width: 8.5in;
    min-height: 11in;
    padding: 1in;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    font-family: 'Times New Roman', serif;
    line-height: 1.6;
  }
  
  :global(.pdf-header) {
    text-align: center;
    margin-bottom: 2rem;
    border-bottom: 2px solid #1a1a1a;
    padding-bottom: 1rem;
  }
  
  :global(.pdf-header h1) {
    font-size: 24px;
    font-weight: bold;
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }
  
  :global(.pdf-header h2) {
    font-size: 18px;
    font-weight: normal;
    margin: 0 0 0.5rem 0;
    color: #4b5563;
  }
  
  :global(.report-period, .policy-number, .inspection-date, .document-info) {
    font-size: 14px;
    font-weight: bold;
    color: #6b7280;
  }
  
  :global(.pdf-section) {
    margin-bottom: 2rem;
  }
  
  :global(.pdf-section h3) {
    font-size: 16px;
    font-weight: bold;
    margin: 0 0 1rem 0;
    color: #1a1a1a;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }
  
  :global(.info-grid) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  :global(.fuel-table, .coverage-table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }
  
  :global(.fuel-table th, .coverage-table th) {
    background: #f3f4f6;
    padding: 8px;
    text-align: left;
    border: 1px solid #d1d5db;
    font-weight: bold;
  }
  
  :global(.fuel-table td, .coverage-table td) {
    padding: 8px;
    border: 1px solid #d1d5db;
  }
  
  :global(.vehicle-list) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  :global(.vehicle-item) {
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 4px;
  }
  
  :global(.checklist) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  :global(.checklist-category h4) {
    font-size: 14px;
    font-weight: bold;
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
  }
  
  :global(.checklist-item) {
    font-size: 12px;
    margin-bottom: 0.25rem;
    color: #059669;
  }
  
  :global(.pdf-footer) {
    margin-top: 3rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }
  
  :global(.signature-section) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  :global(.signature-line) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  /* Image Document Styles */
  :global(.image-container) {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    text-align: center;
  }
  
  :global(.image-placeholder) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  :global(.image-icon) {
    font-size: 4rem;
    opacity: 0.5;
  }
  
  :global(.image-info h3) {
    margin: 0;
    font-size: 18px;
    color: #1a1a1a;
  }
  
  :global(.image-details) {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 14px;
  }
  
  /* Text Document Styles */
  :global(.text-document) {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-width: 800px;
    font-family: 'Georgia', serif;
    line-height: 1.6;
  }
  
  :global(.text-document h2) {
    margin: 0 0 1rem 0;
    color: #1a1a1a;
  }
  
  :global(.text-content) {
    color: #374151;
  }
  
  :global(.text-content h3, .text-content h4) {
    color: #1a1a1a;
    margin: 1.5rem 0 0.5rem 0;
  }
  
  :global(.text-content hr) {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 1.5rem 0;
  }
  
  :global(.text-content ul) {
    padding-left: 1.5rem;
  }
  
  :global(.text-content li) {
    margin-bottom: 0.5rem;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 10px;
    }
    
    .document-viewer {
      height: 95vh;
    }
    
    .viewer-header {
      padding: 12px 16px;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
    
    .viewer-controls {
      justify-content: center;
    }
    
    :global(.pdf-page) {
      width: 100%;
      padding: 0.5in;
    }
    
    :global(.info-grid) {
      grid-template-columns: 1fr;
    }
    
    :global(.checklist) {
      grid-template-columns: 1fr;
    }
  }
</style> 