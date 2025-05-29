import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface CustomerDocument {
  id: string;
  customerId: string;
  haulId?: string;
  type: 'IFTA' | 'Insurance' | 'Contract' | 'PreTrip' | 'JSA' | 'Emissions' | 'BOL' | 'Manifest' | 'Safety' | 'Maintenance';
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
  expiryDate?: Date;
  status: 'valid' | 'expired' | 'pending' | 'rejected' | 'expiring_soon';
  uploadedBy: string;
  fileSize: number;
  tags: string[];
  metadata: {
    description?: string;
    version?: string;
    approvedBy?: string;
    approvalDate?: Date;
    notes?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: FormField[];
  customerId?: string;
  isRequired: boolean;
  renewalPeriod?: number; // days
  category: 'legal' | 'safety' | 'operational' | 'financial';
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ComplianceAlert {
  id: string;
  documentId: string;
  type: 'expiring' | 'expired' | 'missing' | 'invalid';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  daysUntilExpiry?: number;
  actionRequired: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface DocumentStats {
  totalDocuments: number;
  validDocuments: number;
  expiredDocuments: number;
  expiringDocuments: number;
  pendingDocuments: number;
  complianceScore: number;
  lastUpdated: Date;
}

// Mock data for demonstration
const mockDocuments: CustomerDocument[] = [
  {
    id: 'doc-001',
    customerId: 'customer-001',
    haulId: 'haul-001',
    type: 'IFTA',
    fileName: 'IFTA_Q4_2024.pdf',
    fileUrl: '/documents/ifta_q4_2024.pdf',
    uploadDate: new Date('2024-01-15'),
    expiryDate: new Date('2024-12-31'),
    status: 'valid',
    uploadedBy: 'John Smith',
    fileSize: 2048576,
    tags: ['quarterly', 'tax', 'fuel'],
    metadata: {
      description: 'Q4 2024 IFTA fuel tax report',
      version: '1.0',
      approvedBy: 'Sarah Johnson',
      approvalDate: new Date('2024-01-16'),
      priority: 'high'
    }
  },
  {
    id: 'doc-002',
    customerId: 'customer-001',
    type: 'Insurance',
    fileName: 'Commercial_Auto_Insurance_2024.pdf',
    fileUrl: '/documents/insurance_2024.pdf',
    uploadDate: new Date('2024-01-01'),
    expiryDate: new Date('2024-03-15'),
    status: 'expiring_soon',
    uploadedBy: 'Mike Davis',
    fileSize: 1536000,
    tags: ['insurance', 'commercial', 'auto'],
    metadata: {
      description: 'Commercial auto insurance policy',
      version: '2024.1',
      priority: 'critical',
      notes: 'Renewal required before March 15th'
    }
  },
  {
    id: 'doc-003',
    customerId: 'customer-002',
    type: 'PreTrip',
    fileName: 'PreTrip_Inspection_20240115.pdf',
    fileUrl: '/documents/pretrip_20240115.pdf',
    uploadDate: new Date('2024-01-15'),
    status: 'valid',
    uploadedBy: 'Driver Tom Wilson',
    fileSize: 512000,
    tags: ['inspection', 'safety', 'daily'],
    metadata: {
      description: 'Daily pre-trip inspection report',
      version: '1.0',
      priority: 'medium'
    }
  },
  {
    id: 'doc-004',
    customerId: 'customer-001',
    type: 'JSA',
    fileName: 'Job_Safety_Analysis_Tank_Cleaning.pdf',
    fileUrl: '/documents/jsa_tank_cleaning.pdf',
    uploadDate: new Date('2023-12-01'),
    expiryDate: new Date('2024-01-10'),
    status: 'expired',
    uploadedBy: 'Safety Manager',
    fileSize: 768000,
    tags: ['safety', 'jsa', 'tank-cleaning'],
    metadata: {
      description: 'Job Safety Analysis for tank cleaning operations',
      version: '3.2',
      priority: 'critical',
      notes: 'Requires immediate renewal'
    }
  }
];

const mockTemplates: DocumentTemplate[] = [
  {
    id: 'template-001',
    name: 'IFTA Quarterly Report',
    type: 'IFTA',
    description: 'International Fuel Tax Agreement quarterly filing',
    isRequired: true,
    renewalPeriod: 90,
    category: 'legal',
    fields: [
      {
        id: 'quarter',
        name: 'quarter',
        type: 'select',
        label: 'Reporting Quarter',
        required: true,
        options: ['Q1', 'Q2', 'Q3', 'Q4']
      },
      {
        id: 'year',
        name: 'year',
        type: 'number',
        label: 'Reporting Year',
        required: true,
        validation: { min: 2020, max: 2030 }
      },
      {
        id: 'totalMiles',
        name: 'totalMiles',
        type: 'number',
        label: 'Total Miles Driven',
        required: true,
        validation: { min: 0 }
      }
    ]
  },
  {
    id: 'template-002',
    name: 'Pre-Trip Inspection',
    type: 'PreTrip',
    description: 'Daily vehicle inspection checklist',
    isRequired: true,
    category: 'safety',
    fields: [
      {
        id: 'vehicleId',
        name: 'vehicleId',
        type: 'text',
        label: 'Vehicle ID',
        required: true
      },
      {
        id: 'driverName',
        name: 'driverName',
        type: 'text',
        label: 'Driver Name',
        required: true
      },
      {
        id: 'inspectionDate',
        name: 'inspectionDate',
        type: 'date',
        label: 'Inspection Date',
        required: true
      },
      {
        id: 'defectsFound',
        name: 'defectsFound',
        type: 'checkbox',
        label: 'Defects Found',
        required: false
      },
      {
        id: 'notes',
        name: 'notes',
        type: 'textarea',
        label: 'Additional Notes',
        required: false
      }
    ]
  }
];

// Create stores
export const documents = writable<CustomerDocument[]>(mockDocuments);
export const documentTemplates = writable<DocumentTemplate[]>(mockTemplates);
export const selectedDocument = writable<CustomerDocument | null>(null);
export const uploadProgress = writable<{ [key: string]: number }>({});

// Derived stores for analytics
export const documentStats = derived(documents, ($documents: CustomerDocument[]): DocumentStats => {
  // Use static timestamp for SSR consistency, will be updated on client
  const now = browser ? new Date() : new Date(1735064220000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const total = $documents.length;
  const valid = $documents.filter((doc: CustomerDocument) => doc.status === 'valid').length;
  const expired = $documents.filter((doc: CustomerDocument) => doc.status === 'expired').length;
  const expiring = $documents.filter((doc: CustomerDocument) => 
    doc.expiryDate && doc.expiryDate <= thirtyDaysFromNow && doc.expiryDate > now
  ).length;
  const pending = $documents.filter((doc: CustomerDocument) => doc.status === 'pending').length;
  
  const complianceScore = total > 0 ? Math.round(((valid + pending) / total) * 100) : 100;
  
  return {
    totalDocuments: total,
    validDocuments: valid,
    expiredDocuments: expired,
    expiringDocuments: expiring,
    pendingDocuments: pending,
    complianceScore,
    lastUpdated: now
  };
});

export const complianceAlerts = derived(documents, ($documents: CustomerDocument[]): ComplianceAlert[] => {
  const alerts: ComplianceAlert[] = [];
  // Use static timestamp for SSR consistency, will be updated on client
  const now = browser ? new Date() : new Date(1735064220000);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  $documents.forEach((doc: CustomerDocument) => {
    if (doc.status === 'expired') {
      alerts.push({
        id: `alert-${doc.id}-expired`,
        documentId: doc.id,
        type: 'expired',
        severity: 'critical',
        message: `${doc.type} document "${doc.fileName}" has expired`,
        actionRequired: 'Upload new document immediately',
        createdAt: now,
        acknowledged: false
      });
    } else if (doc.expiryDate && doc.expiryDate <= thirtyDaysFromNow && doc.expiryDate > now) {
      const daysUntilExpiry = Math.ceil((doc.expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      alerts.push({
        id: `alert-${doc.id}-expiring`,
        documentId: doc.id,
        type: 'expiring',
        severity: daysUntilExpiry <= 7 ? 'high' : 'medium',
        message: `${doc.type} document "${doc.fileName}" expires in ${daysUntilExpiry} days`,
        daysUntilExpiry,
        actionRequired: 'Schedule document renewal',
        createdAt: now,
        acknowledged: false
      });
    }
  });
  
  return alerts.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
});

// Document management functions
export const documentActions = {
  // Add new document
  addDocument: (document: Omit<CustomerDocument, 'id' | 'uploadDate'>) => {
    const newDocument: CustomerDocument = {
      ...document,
      id: `doc-${browser ? Date.now() : 1735064220000}`,
      uploadDate: browser ? new Date() : new Date(1735064220000)
    };
    
    documents.update((docs: CustomerDocument[]) => [...docs, newDocument]);
    return newDocument.id;
  },
  
  // Update document
  updateDocument: (id: string, updates: Partial<CustomerDocument>) => {
    documents.update((docs: CustomerDocument[]) => 
      docs.map((doc: CustomerDocument) => doc.id === id ? { ...doc, ...updates } : doc)
    );
  },
  
  // Delete document
  deleteDocument: (id: string) => {
    documents.update((docs: CustomerDocument[]) => docs.filter((doc: CustomerDocument) => doc.id !== id));
  },
  
  // Get documents by type
  getDocumentsByType: (type: CustomerDocument['type']) => {
    let result: CustomerDocument[] = [];
    documents.subscribe((docs: CustomerDocument[]) => {
      result = docs.filter((doc: CustomerDocument) => doc.type === type);
    })();
    return result;
  },
  
  // Get documents by customer
  getDocumentsByCustomer: (customerId: string) => {
    let result: CustomerDocument[] = [];
    documents.subscribe((docs: CustomerDocument[]) => {
      result = docs.filter((doc: CustomerDocument) => doc.customerId === customerId);
    })();
    return result;
  },
  
  // Search documents
  searchDocuments: (query: string) => {
    let result: CustomerDocument[] = [];
    documents.subscribe((docs: CustomerDocument[]) => {
      const lowercaseQuery = query.toLowerCase();
      result = docs.filter((doc: CustomerDocument) => 
        doc.fileName.toLowerCase().includes(lowercaseQuery) ||
        doc.type.toLowerCase().includes(lowercaseQuery) ||
        doc.tags.some((tag: string) => tag.toLowerCase().includes(lowercaseQuery)) ||
        doc.metadata.description?.toLowerCase().includes(lowercaseQuery)
      );
    })();
    return result;
  },
  
  // Update upload progress
  setUploadProgress: (fileId: string, progress: number) => {
    uploadProgress.update(current => ({
      ...current,
      [fileId]: progress
    }));
  },
  
  // Clear upload progress
  clearUploadProgress: (fileId: string) => {
    uploadProgress.update(current => {
      const { [fileId]: removed, ...rest } = current;
      return rest;
    });
  },
  
  // Acknowledge alert
  acknowledgeAlert: (alertId: string) => {
    // In a real app, this would update the alert in the backend
    console.log(`Alert ${alertId} acknowledged`);
  },
  
  // Bulk operations
  bulkUpdateStatus: (documentIds: string[], status: CustomerDocument['status']) => {
    documents.update((docs: CustomerDocument[]) => 
      docs.map((doc: CustomerDocument) => 
        documentIds.includes(doc.id) ? { ...doc, status } : doc
      )
    );
  },
  
  // Export documents data
  exportDocuments: (format: 'csv' | 'json' = 'csv') => {
    let docsData: CustomerDocument[] = [];
    documents.subscribe((docs: CustomerDocument[]) => { docsData = docs; })();
    
    if (format === 'json') {
      return JSON.stringify(docsData, null, 2);
    } else {
      // CSV export
      const headers = ['ID', 'Customer ID', 'Type', 'File Name', 'Status', 'Upload Date', 'Expiry Date', 'Uploaded By'];
      const csvData = docsData.map((doc: CustomerDocument) => [
        doc.id,
        doc.customerId,
        doc.type,
        doc.fileName,
        doc.status,
        doc.uploadDate.toISOString().split('T')[0],
        doc.expiryDate?.toISOString().split('T')[0] || '',
        doc.uploadedBy
      ]);
      
      return [headers, ...csvData].map(row => row.join(',')).join('\n');
    }
  }
};

// Real-time simulation for demo
if (typeof window !== 'undefined') {
  setInterval(() => {
    // Simulate document status updates
    documents.update((docs: CustomerDocument[]) => {
      return docs.map((doc: CustomerDocument) => {
        // Randomly update some document statuses for demo
        if (Math.random() < 0.1) { // 10% chance
          const statuses: CustomerDocument['status'][] = ['valid', 'pending', 'expired', 'expiring_soon'];
          const currentIndex = statuses.indexOf(doc.status);
          const newStatus = statuses[(currentIndex + 1) % statuses.length];
          return { ...doc, status: newStatus };
        }
        return doc;
      });
    });
  }, 15000); // Update every 15 seconds for demo
} 