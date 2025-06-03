import { 
  ClipboardList, 
  ListChecks, 
  MapPin, 
  Truck, 
  Navigation, 
  PackageCheck, 
  CheckCircle2 
} from 'lucide-svelte';

export type WorkflowStep = 
  | 'job-overview'   // Job Overview & Selection
  | 'pre-trip'       // Pre-Trip Inspection  
  | 'to-pickup'      // Navigate & Load
  | 'loading'        // Loading at Site
  | 'to-delivery'    // Navigate to Delivery
  | 'unloading'      // Unloading at Site
  | 'post-trip';     // Post-Trip & Complete

export const WORKFLOW_STEPS: WorkflowStep[] = [
  'job-overview',
  'pre-trip',
  'to-pickup', 
  'loading',
  'to-delivery',
  'unloading',
  'post-trip'
];

export const STEP_CONFIG = {
  'job-overview': { icon: ClipboardList, label: 'Jobs' },
  'pre-trip': { icon: ListChecks, label: 'Pre-Trip' },
  'to-pickup': { icon: MapPin, label: 'Navigate' },
  'loading': { icon: Truck, label: 'Load' },
  'to-delivery': { icon: Navigation, label: 'Deliver' },
  'unloading': { icon: PackageCheck, label: 'Unload' },
  'post-trip': { icon: CheckCircle2, label: 'Complete' }
};

export const WORKFLOW_STEP_LABELS: Record<WorkflowStep, string> = {
  'job-overview': 'Job Selection',
  'pre-trip': 'Pre-Trip Inspection',
  'to-pickup': 'Navigate & Load',
  'loading': 'Loading',
  'to-delivery': 'Navigate to Delivery',
  'unloading': 'Unloading',
  'post-trip': 'Trip Complete'
};

// State mapping function (preserves existing logic)
export function mapSectionToStep(section: string, currentView: string, activeJob: any): WorkflowStep {
  if (activeJob) {
    if (currentView === 'job-map') return 'to-pickup';
    if (currentView === 'in-transit') return 'to-delivery';
  }
  
  switch (section) {
    case 'pretrip': return 'pre-trip';
    case 'schedule': return activeJob ? 'to-pickup' : 'job-overview';
    case 'performance': return 'loading';
    case 'safety': return 'post-trip';
    default: return 'job-overview';
  }
}

// Helper functions for the shell component
export function getStepIcon(step: WorkflowStep) {
  return STEP_CONFIG[step].icon;
}

export function getStepLabel(step: WorkflowStep) {
  return STEP_CONFIG[step].label;
}

export function isStepCompleted(step: WorkflowStep, completedSteps: WorkflowStep[]): boolean {
  return completedSteps.includes(step);
} 