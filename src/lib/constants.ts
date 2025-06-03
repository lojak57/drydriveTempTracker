// UI Labels and Constants for Consistent Branding
export const LABELS = {
  FLEET_INTELLIGENCE: 'Fleet Intelligence Nexus',
  STATUS_POSITIVE: '+2.1%',
  STATUS_NEGATIVE: '-1.3%',
  APP_NAME: 'VeriHaul',
  APP_TAGLINE: 'Powered by DryDrive',
} as const;

// Semantic Color Classes for Consistent Usage
export const COLOR_CLASSES = {
  SUCCESS: 'text-success text-success-dark',
  WARNING: 'text-warning text-warning-dark', 
  ERROR: 'text-error text-error-dark',
  INFO: 'text-info text-info-dark',
  HIGHLIGHT: 'text-highlight text-highlight-dark',
  NEUTRAL: 'text-neutral text-neutral-dark',
} as const;

// Status indicator utilities
export const STATUS_INDICATORS = {
  VOLUME_GAIN: 'text-success font-semibold',
  VOLUME_LOSS: 'text-error font-semibold',
  EFFICIENCY_HIGH: 'text-success',
  EFFICIENCY_MEDIUM: 'text-warning',
  EFFICIENCY_LOW: 'text-error',
  NEUTRAL_METRIC: 'text-neutral',
} as const; 