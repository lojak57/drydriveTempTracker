import { 
  ClipboardList, 
  ListChecks, 
  ArrowUpRight, 
  Truck, 
  Navigation, 
  PackageOpen, 
  CheckCircle2 
} from 'lucide-svelte';

export type WorkflowStep = 
  | 'job-overview'   // Job Overview (clipboard icon)
  | 'pre-trip'         // Pre-Trip (checklist icon)  
  | 'to-pickup'        // To Pickup (arrow up-right icon)
  | 'loading'          // Loading (truck icon)
  | 'to-delivery'      // To Delivery (navigation icon)
  | 'unloading'        // Unloading (package icon)
  | 'post-trip';       // Post-Trip (checkmark icon)

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
  'job-overview': { icon: ClipboardList, label: 'Job Overview' },
  'pre-trip': { icon: ListChecks, label: 'Pre-Trip' },
  'to-pickup': { icon: ArrowUpRight, label: 'To Pickup' },
  'loading': { icon: Truck, label: 'Loading' },
  'to-delivery': { icon: Navigation, label: 'To Delivery' },
  'unloading': { icon: PackageOpen, label: 'Unloading' },
  'post-trip': { icon: CheckCircle2, label: 'Post-Trip' }
};

export const WORKFLOW_STEP_LABELS: Record<WorkflowStep, string> = {
  'job-overview': 'Job Overview',
  'pre-trip': 'Pre-Trip',
  'to-pickup': 'To Pickup',
  'loading': 'Loading',
  'to-delivery': 'To Delivery',
  'unloading': 'Unloading',
  'post-trip': 'Post-Trip'
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