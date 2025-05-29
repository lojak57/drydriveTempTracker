<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Upload, FileText, X, CheckCircle, AlertCircle, Image, FileIcon } from 'lucide-svelte';
  import { documentActions, uploadProgress, type CustomerDocument } from '$lib/stores/documentStore';
  
  export let customerId: string;
  export let haulId: string | undefined = undefined;
  export let allowedTypes: CustomerDocument['type'][] = ['IFTA', 'Insurance', 'Contract', 'PreTrip', 'JSA', 'Emissions', 'BOL', 'Manifest', 'Safety', 'Maintenance'];
  export let maxFileSize = 10 * 1024 * 1024; // 10MB default
  export let multiple = true;
  
  const dispatch = createEventDispatcher<{
    uploaded: { documentId: string; document: CustomerDocument };
    error: { message: string; file?: File };
  }>();
  
  let dragActive = false;
  let files: File[] = [];
  let uploadingFiles: { [key: string]: { file: File; progress: number; status: 'uploading' | 'success' | 'error'; error?: string } } = {};
  
  // File validation
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > maxFileSize) {
      return { valid: false, error: `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit` };
    }
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'File type not supported. Please use PDF, DOC, DOCX, JPG, PNG, or TXT files.' };
    }
    
    return { valid: true };
  };
  
  // Get file icon based on type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    switch (extension) {
      case '.pdf':
        return FileText;
      case '.jpg':
      case '.jpeg':
      case '.png':
        return Image;
      default:
        return FileIcon;
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
  
  // Handle drag events
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    dragActive = true;
  };
  
  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragActive = false;
  };
  
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragActive = false;
    
    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    addFiles(droppedFiles);
  };
  
  // Handle file input
  const handleFileInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const selectedFiles = Array.from(target.files || []);
    addFiles(selectedFiles);
    target.value = ''; // Reset input
  };
  
  // Add files to upload queue
  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        dispatch('error', { message: validation.error!, file });
        return false;
      }
      return true;
    });
    
    if (multiple) {
      files = [...files, ...validFiles];
    } else {
      files = validFiles.slice(0, 1);
    }
  };
  
  // Remove file from queue
  const removeFile = (index: number) => {
    files = files.filter((_, i) => i !== index);
  };
  
  // Simulate file upload
  const uploadFile = async (file: File, documentType: CustomerDocument['type'], tags: string[] = []): Promise<string> => {
    const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    uploadingFiles[fileId] = {
      file,
      progress: 0,
      status: 'uploading'
    };
    
    // Simulate upload progress
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        uploadingFiles[fileId].progress += Math.random() * 20;
        
        if (uploadingFiles[fileId].progress >= 100) {
          clearInterval(interval);
          uploadingFiles[fileId].progress = 100;
          uploadingFiles[fileId].status = 'success';
          
          // Create document record
          const documentId = documentActions.addDocument({
            customerId,
            haulId,
            type: documentType,
            fileName: file.name,
            fileUrl: `/documents/${fileId}/${file.name}`,
            status: 'pending',
            uploadedBy: 'Current User', // In real app, get from auth
            fileSize: file.size,
            tags: tags.length > 0 ? tags : [documentType.toLowerCase()],
            metadata: {
              description: `Uploaded ${documentType} document`,
              version: '1.0',
              priority: 'medium'
            }
          });
          
          resolve(documentId);
        }
      }, 200);
      
      // Simulate potential upload failure
      setTimeout(() => {
        if (Math.random() < 0.05) { // 5% chance of failure
          clearInterval(interval);
          uploadingFiles[fileId].status = 'error';
          uploadingFiles[fileId].error = 'Upload failed. Please try again.';
          reject(new Error('Upload failed'));
        }
      }, 1000);
    });
  };
  
  // Upload all files
  const uploadAllFiles = async () => {
    for (const file of files) {
      try {
        const documentId = await uploadFile(file, allowedTypes[0]); // Default to first allowed type
        dispatch('uploaded', { 
          documentId, 
          document: {
            id: documentId,
            customerId,
            haulId,
            type: allowedTypes[0],
            fileName: file.name,
            fileUrl: `/documents/${documentId}/${file.name}`,
            uploadDate: new Date(),
            status: 'pending',
            uploadedBy: 'Current User',
            fileSize: file.size,
            tags: [allowedTypes[0].toLowerCase()],
            metadata: {
              description: `Uploaded ${allowedTypes[0]} document`,
              version: '1.0',
              priority: 'medium'
            }
          }
        });
      } catch (error) {
        dispatch('error', { message: `Failed to upload ${file.name}`, file });
      }
    }
    
    // Clear uploaded files
    files = [];
  };
  
  $: hasFiles = files.length > 0;
  $: isUploading = Object.values(uploadingFiles).some(f => f.status === 'uploading');
</script>

<div class="document-upload">
  <!-- Drop Zone -->
  <div 
    class="drop-zone"
    class:drag-active={dragActive}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
  >
    <div class="drop-zone-content">
      <Upload class="upload-icon" size={48} />
      <h3>Drop files here or click to browse</h3>
      <p>Support for PDF, DOC, DOCX, JPG, PNG, TXT files up to {Math.round(maxFileSize / 1024 / 1024)}MB</p>
      
      <input
        type="file"
        {multiple}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        on:change={handleFileInput}
        class="file-input"
      />
    </div>
  </div>
  
  <!-- File Queue -->
  {#if hasFiles}
    <div class="file-queue">
      <h4>Files Ready for Upload ({files.length})</h4>
      
      <div class="file-list">
        {#each files as file, index}
          <div class="file-item">
            <div class="file-info">
              <svelte:component this={getFileIcon(file.name)} class="file-icon" size={20} />
              <div class="file-details">
                <span class="file-name">{file.name}</span>
                <span class="file-size">{formatFileSize(file.size)}</span>
              </div>
            </div>
            
            <button
              class="remove-btn"
              on:click={() => removeFile(index)}
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
          </div>
        {/each}
      </div>
      
      <div class="upload-actions">
        <button
          class="btn btn-primary"
          on:click={uploadAllFiles}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length > 1 ? 's' : ''}`}
        </button>
        
        <button
          class="btn btn-secondary"
          on:click={() => files = []}
          disabled={isUploading}
        >
          Clear All
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Upload Progress -->
  {#if Object.keys(uploadingFiles).length > 0}
    <div class="upload-progress">
      <h4>Upload Progress</h4>
      
      {#each Object.entries(uploadingFiles) as [fileId, uploadFile]}
        <div class="progress-item">
          <div class="progress-info">
            <div class="progress-details">
              <span class="progress-name">{uploadFile.file.name}</span>
              <span class="progress-status">
                {#if uploadFile.status === 'uploading'}
                  {Math.round(uploadFile.progress)}%
                {:else if uploadFile.status === 'success'}
                  <CheckCircle class="success-icon" size={16} />
                  Complete
                {:else if uploadFile.status === 'error'}
                  <AlertCircle class="error-icon" size={16} />
                  Failed
                {/if}
              </span>
            </div>
            
            {#if uploadFile.status === 'uploading'}
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  style="width: {uploadFile.progress}%"
                ></div>
              </div>
            {/if}
            
            {#if uploadFile.error}
              <span class="error-message">{uploadFile.error}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .document-upload {
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
  }
  
  /* Drop Zone */
  .drop-zone {
    position: relative;
    border: 2px dashed rgba(0, 78, 137, 0.3);
    border-radius: 20px;
    padding: 48px 32px;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    margin-bottom: 32px;
  }
  
  .drop-zone:hover {
    border-color: rgba(0, 78, 137, 0.5);
    background: rgba(0, 78, 137, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  .drop-zone.drag-active {
    border-color: #FF6B35;
    background: rgba(255, 107, 53, 0.1);
    transform: scale(1.02);
    box-shadow: 0 12px 32px rgba(255, 107, 53, 0.2);
  }
  
  .drop-zone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .upload-icon {
    color: #004E89;
    margin-bottom: 8px;
  }
  
  .drop-zone h3 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .drop-zone p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
    max-width: 400px;
    line-height: 1.5;
  }
  
  .file-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  
  /* File Queue */
  .file-queue {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .file-queue h4 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 20px 0;
  }
  
  .file-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    transition: all 0.2s ease;
  }
  
  .file-item:hover {
    background: rgba(255, 255, 255, 0.7);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }
  
  .file-icon {
    color: #004E89;
  }
  
  .file-details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .file-name {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    word-break: break-word;
  }
  
  .file-size {
    font-size: 12px;
    color: #6b7280;
  }
  
  .remove-btn {
    padding: 8px;
    border: none;
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    transform: scale(1.1);
  }
  
  .upload-actions {
    display: flex;
    gap: 12px;
  }
  
  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #FF6B35 0%, #ff8c42 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
  }
  
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(255, 107, 53, 0.4);
  }
  
  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
  }
  
  .btn-secondary {
    background: rgba(0, 78, 137, 0.1);
    color: #004E89;
    border: 1px solid rgba(0, 78, 137, 0.2);
  }
  
  .btn-secondary:hover:not(:disabled) {
    background: rgba(0, 78, 137, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 78, 137, 0.2);
  }
  
  .btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  /* Upload Progress */
  .upload-progress {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .upload-progress h4 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 20px 0;
  }
  
  .progress-item {
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    margin-bottom: 12px;
  }
  
  .progress-item:last-child {
    margin-bottom: 0;
  }
  
  .progress-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .progress-details {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .progress-name {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    word-break: break-word;
  }
  
  .progress-status {
    font-size: 12px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
  }
  
  .success-icon {
    color: #059669;
  }
  
  .error-icon {
    color: #dc2626;
  }
  
  .progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(0, 78, 137, 0.2);
    border-radius: 3px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF6B35 0%, #ff8c42 100%);
    transition: width 0.3s ease-out;
    border-radius: 3px;
  }
  
  .error-message {
    font-size: 12px;
    color: #dc2626;
    font-weight: 500;
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .document-upload {
      padding: 16px;
    }
    
    .drop-zone {
      padding: 32px 20px;
    }
    
    .drop-zone h3 {
      font-size: 20px;
    }
    
    .drop-zone p {
      font-size: 14px;
    }
    
    .file-queue,
    .upload-progress {
      padding: 20px;
    }
    
    .file-item {
      padding: 12px 16px;
    }
    
    .upload-actions {
      flex-direction: column;
    }
    
    .btn {
      width: 100%;
    }
    
    .progress-details {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
</style> 