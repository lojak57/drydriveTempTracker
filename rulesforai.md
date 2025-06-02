# Oil Field Transport Operations - Technical Architecture

## Application Stack
- **Framework**: SvelteKit 5 with TypeScript
- **Build**: Vite 6.3.5 
- **Styling**: TailwindCSS with custom industrial theme
- **Maps**: MapLibre GL JS with CartoDB basemaps
- **Icons**: Lucide Svelte
- **Package Manager**: npm

## Route Architecture

### Core Route Structure
```
src/routes/
├── (dashboards)/                    # Route group for authenticated dashboards
│   ├── dispatch/+page.svelte       # 2-pane dispatch center (1,247 lines)
│   ├── driver/+page.svelte         # Mobile-first driver workflow (846 lines)
│   ├── executive/+page.svelte      # Executive KPI dashboard (374 lines)
│   └── regional/+page.svelte       # Multi-region comparison (885 lines)
├── calibration/
│   └── smart-recommender/+page.svelte
├── monitoring/
│   └── truck-diagram/+page.svelte
└── master-dispatch/+page.svelte    # Legacy dispatch view
```

### Route Group Pattern
Uses SvelteKit route groups `(dashboards)` to apply shared layout without affecting URL structure. Each dashboard is a single-page component with embedded state management.

## Component Architecture

### Driver Workflow System
**Primary File**: `src/routes/(dashboards)/driver/+page.svelte` (846 lines)

**State Management Pattern**:
```typescript
let currentView: 'dashboard' | 'job-map' | 'in-transit' = 'dashboard';
let activeJob: ScheduledJob | null = null;
let selectedJob: ScheduledJob | null = null;
let inspectionCompleted = false;
let activeSection: 'overview' | 'pretrip' | 'schedule' | 'performance' | 'safety' = 'overview';
```

**Component Hierarchy**:
```
src/lib/components/driver/
├── schedule/
│   ├── DriverSchedule.svelte        # 295 lines - Primary workflow hub
│   ├── ScheduleHeader.svelte        # 137 lines - Driver/truck status
│   ├── SummaryCards.svelte          # 120 lines - Daily metrics
│   ├── JobCard.svelte               # 614 lines - Individual job cards
│   └── QuickActionButtons.svelte    # 95 lines - Emergency/dispatch actions
├── JobDetailModal.svelte            # 1,042 lines - Job management interface
├── JobMapView.svelte                # 646 lines - MapLibre integration
├── InTransitView.svelte             # 390 lines - Real-time monitoring
├── InTransitHeader.svelte           # 161 lines - Transit status
├── PreTripInspection.svelte         # 1,085 lines - DOT compliance checklist
├── EmergencyActionPanel.svelte      # 141 lines - Emergency protocols
└── SafetyMetricsDashboard.svelte    # 210 lines - Safety tracking
```

### Dispatch Center System
**Primary File**: `src/routes/(dashboards)/dispatch/+page.svelte` (1,247 lines)

**Layout Pattern**: CSS Grid 2-pane layout
- Left pane: Driver/fleet status, route assignments
- Right pane: Interactive map with truck positions

**State Architecture**:
```typescript
// Driver assignment modal state
let showDriverModal = false;
let selectedRoute: PendingRoute | null = null;

// Map integration state  
let map: maplibregl.Map;
let trucksData = [/* GPS coordinates */];
```

**Key Components**:
```
src/lib/components/dispatch/
├── DispatchHub.svelte               # 1,127 lines - Left pane dispatch center
├── FleetAnalytics.svelte            # 520 lines - Fleet metrics/charts
├── DriverAssignmentModal.svelte     # 248 lines - Route assignment UI
└── YardAnalytics.svelte             # 1,132 lines - Operations analytics
```

**Map Implementation**:
- MapLibre GL JS with custom truck markers
- Real-time position updates via WebSocket simulation
- Click handlers for truck selection and route planning
- Custom popup templates with truck/driver details

### Executive Dashboard System
**Primary File**: `src/routes/(dashboards)/executive/+page.svelte` (374 lines)

**Data Structure**:
```typescript
interface ExecutiveMetric {
  title: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  status: 'good' | 'warning' | 'critical';
}
```

**Component Pattern**: MetricCard composition with shared `MetricCard.svelte` component

### Regional Manager System  
**Primary File**: `src/routes/(dashboards)/regional/+page.svelte` (885 lines)

**Architecture**: Multi-region state machine with dynamic chart rendering

**Regional Data Structure**:
```typescript
interface RegionalPerformance {
  fleetSize: number;
  activeTrucks: number;
  driversAssigned: number;
  totalBPD: number;
  avgDriveTime: number;
  barrelsPerHour: number;
  efficiency: number;
  utilization: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'attention';
}
```

**Chart Implementation**: Custom CSS Grid charts with gradient bars, animated on data change

## Shared Infrastructure

### Navigation System
**File**: `src/lib/components/ui/Navigation.svelte` (587 lines)

**Pattern**: Mobile-first responsive navigation with desktop sidebar
- Mobile: Collapsible overlay menu with backdrop
- Desktop: Fixed sidebar with glassmorphism effects
- Route matching via SvelteKit `$page.url.pathname`

### UI Components
```
src/lib/components/ui/
├── MetricCard.svelte                # 178 lines - Reusable metric display
├── Navigation.svelte                # 587 lines - App navigation
└── DryDriveLogo.svelte             # 45 lines - SVG logo component
```

### Type Definitions
**Job Management Types**:
```typescript
interface ScheduledJob {
  id: string;
  accountName: string;
  accountColor: string;
  pickupLocation: {
    name: string;
    address: string;
    padName: string;
    tankNumber: string;
    coordinates: { lat: number; lng: number };
  };
  deliveryLocation: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  estimatedBarrels: number;
  tankLevelHeight: string;
  scheduledTime: Date;
  estimatedDuration: number;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'delayed';
  distance: number;
  routeType: 'highway' | 'rural' | 'city';
  specialInstructions?: string;
  expectedTemperature: { min: number; max: number };
  loadType: 'crude' | 'condensate' | 'refined';
  hazmatRequired: boolean;
  customerContact: { name: string; phone: string };
}
```

## State Management Patterns

### Component Event System
Uses Svelte's `createEventDispatcher` for parent-child communication:

```typescript
// Child component
const dispatch = createEventDispatcher();
dispatch('job-selected', { job });

// Parent component  
function handleJobSelected(event: CustomEvent) {
  selectedJob = event.detail.job;
  showJobModal = true;
}
```

### View State Management
Multi-view components use string literals for type-safe state:

```typescript
let currentView: 'dashboard' | 'job-map' | 'in-transit' = 'dashboard';

// View switching with cleanup
function switchToJobMap(job: ScheduledJob) {
  activeJob = job;
  currentView = 'job-map';
  showJobModal = false;
}
```

### Modal Management Pattern
Consistent modal state across components:

```typescript
let showModal = false;
let modalData: any = null;

function openModal(data: any) {
  modalData = data;
  showModal = true;
}

function closeModal() {
  showModal = false;
  modalData = null;
}
```

## Styling Architecture

### CSS Custom Properties
Industrial color scheme with CSS variables:
```css
:root {
  --color-primary: #475569;      /* Steel gray */
  --color-secondary: #B45309;    /* Industrial orange */
  --color-accent: #374151;       /* Dark charcoal */
  --color-danger: #7C2D12;       /* Deep rust red */
}
```

### Component Styling Patterns
1. **Glassmorphism**: `backdrop-filter: blur(24px)` with semi-transparent backgrounds
2. **Gradient Cards**: Linear gradients for visual hierarchy
3. **Hover Animations**: `transform: translateY(-2px)` with `transition: all 0.3s ease`
4. **Industrial Palette**: Muted colors appropriate for oil field operations

### Responsive Design
Mobile-first approach with breakpoints:
- Mobile: Base styles
- Tablet: `@media (min-width: 768px)`  
- Desktop: `@media (min-width: 1025px)`

## Data Flow Architecture

### Driver Workflow Data Flow
1. **Job Assignment**: Dispatch → Driver via schedule state
2. **Status Updates**: Driver actions → Parent component via events
3. **Real-time Updates**: Simulated via setTimeout for demonstration
4. **Persistence**: Local component state (no backend integration)

### Map Integration Data Flow
1. **Truck Positions**: Hardcoded GPS coordinates for Texas region
2. **Map Updates**: Direct MapLibre GL API calls
3. **Marker Management**: Custom truck icons with status-based colors
4. **Popup System**: Template-based truck/driver information display

### Dashboard Data Flow
1. **Metrics Calculation**: Reactive statements `$:` for computed values
2. **Chart Updates**: Data changes trigger CSS transitions
3. **Filter State**: Local component state for region/time filtering
4. **Export Functions**: CSV/PDF generation via browser APIs

## Performance Optimization

### Code Splitting
- Route-based automatic splitting via SvelteKit
- Component lazy loading for large modals
- Map tiles loaded on-demand

### Bundle Analysis
```bash
npm run build && npm run preview
# Generates optimized production build
```

### Asset Optimization
- SVG icons inlined via Lucide components
- CSS purging via TailwindCSS
- Image optimization for map tiles

## Development Workflow

### Local Development
```bash
npm run dev          # Vite dev server on localhost:5173+
npm run build        # Production build
npm run preview      # Preview production build
```

### Code Quality
- TypeScript strict mode enabled
- Svelte compiler warnings addressed
- ESLint/Prettier configuration for code consistency

### Browser Support
- Modern browsers with ES2020+ support
- Mobile Safari optimization for field use
- Chrome DevTools debugging integration

## Technical Debt & Improvements

### Current Limitations
1. **No Backend Integration**: All data is hardcoded/simulated
2. **No Real-time WebSockets**: Updates simulated with setTimeout
3. **No Authentication**: Role-based access not implemented
4. **No Data Persistence**: State resets on page refresh

### Architecture Considerations
1. **State Management**: Consider Svelte stores for global state
2. **API Integration**: Design for REST/GraphQL backend integration  
3. **Real-time Updates**: WebSocket implementation for live data
4. **Testing**: Unit tests for components and integration tests for workflows

### Scalability Factors
1. **Component Modularity**: Clear separation of concerns
2. **Type Safety**: Full TypeScript coverage
3. **Performance**: Lazy loading and code splitting ready
4. **Accessibility**: ARIA labels and keyboard navigation implemented 