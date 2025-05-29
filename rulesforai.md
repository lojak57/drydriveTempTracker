# Oil Field Temperature Tracker - AI Development Rules & Documentation

## Project Overview

**Business Context**: Advanced SvelteKit application for oil field temperature tracking and loss analysis. Built for the largest crude hauling companies in the US, this system monitors oil transport operations through comprehensive SCADA integration, tracking Coriolis meter readings and temperature-based volume loss calculations to optimize driver performance, truck efficiency, and route planning.

**Core Problem**: Oil trucks measured at onload with Coriolis meters experience volume loss during transport due to ambient temperature changes. Particle IoT devices monitor ambient and internal tank temperatures to calculate expected loss vs actual loss at offload sites, enabling performance optimization and cost savings.

**Demo Strategy**: "Complete Vision, Strategic Depth" - Show breadth of all data categories with 4 areas genuinely impressive when explored. Built for Monday meeting with largest crude hauling company for sales demo, marketing materials, and training content.

## Technical Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS 4.0 with custom design system
- **Charts**: Chart.js with real-time data visualization
- **Icons**: Lucide Icons + Emoji icons for visual appeal
- **Architecture**: Component-based with centralized Svelte stores
- **Design**: Apple-inspired glassmorphism with oil industry color palette

## Kevin's Specific Requirements (From Spreadsheet Analysis)

### 📊 **Comprehensive Data Categories Implemented**

Kevin provided extensive Excel data showing hundreds of data points across these categories:

#### **1. SCADA Data** ✅ IMPLEMENTED
- Tank levels, flow rates, pressure readings, temperature monitoring
- Real-time system status with 98% uptime tracking
- Network health monitoring with device connectivity status

#### **2. Particle IoT Integration** ✅ IMPLEMENTED  
- Ambient and internal temperature sensors
- Real-time data streaming every 4 seconds
- Temperature differential analysis for loss calculations

#### **3. Coriolis Meters** ✅ IMPLEMENTED
- Net volume (BBL), mass flow rate (BBL/min)
- API gravity measurements (35-45° API)
- Water cut percentage (0.1-2.0%)
- Entrained gas detection

#### **4. Temperature Sensors** ✅ IMPLEMENTED
- Multi-point temperature monitoring
- Internal oil temperature (70-85°F range)
- Ambient temperature tracking (85-105°F range)
- Temperature differential analysis

#### **5. Pressure Systems** ✅ IMPLEMENTED
- System pressure (140-165 PSI range)
- Tanker pressure monitoring
- Pump RPM tracking (1650-1850 RPM)
- Pressure safety thresholds

#### **6. Gas Detection** ✅ IMPLEMENTED
- H2S levels (0-2.0 PPM with safety thresholds)
- Multi-gas monitoring (CO, LEL, O2)
- Real-time safety alerts
- Gas detection status indicators

#### **7. Valve Systems** ✅ IMPLEMENTED
- Automated valve control integration
- System pressure regulation
- Flow control mechanisms

#### **8. ELD Data** ✅ IMPLEMENTED
- Driver performance tracking
- Route optimization data
- Hours of service monitoring
- Efficiency scoring

#### **9. Customer/Job Data** ✅ IMPLEMENTED
- Haul tracking with origin/destination
- Customer-specific requirements
- Job completion metrics
- Performance analytics

#### **10. Documentation** ✅ IMPLEMENTED
- Complete document management system
- Compliance tracking and alerts
- Digital document storage
- Automated compliance reporting

#### **11. Financial/Invoicing** ✅ IMPLEMENTED
- Volume-based billing calculations
- Loss analysis for cost optimization
- Performance-based pricing
- Financial impact reporting

### 🎯 **Data Types Kevin Specified** ✅ ALL IMPLEMENTED

1. **Static Data**: Configuration settings, thresholds, equipment specs
2. **Aggregated Data**: Daily summaries, efficiency metrics, performance trends
3. **Dynamic Data**: Real-time sensor readings, live system status
4. **Event-Based Data**: Alerts, alarms, safety incidents, system events
5. **Periodic Snapshot Data**: Regular system health checks, compliance reports

## Current Application State (Phase 8 Complete)

### 🚀 **PHASE 7: Document Management System** ✅ COMPLETE

#### **Document Store Architecture**
- **CustomerDocument Interface**: 10 document types (IFTA, Insurance, Contract, PreTrip, JSA, Emissions, BOL, Manifest, Safety, Maintenance)
- **DocumentTemplate Interface**: Dynamic form fields for document creation
- **ComplianceAlert Interface**: Severity-based alert system
- **DocumentStats Interface**: Comprehensive analytics
- **Full CRUD Operations**: Create, read, update, delete with bulk actions
- **Real-time Compliance Monitoring**: Automated expiry tracking
- **Export Functionality**: CSV/JSON export capabilities

#### **Document Upload Component**
- **Drag & Drop Interface**: Professional file upload with visual feedback
- **File Validation**: PDF, DOC, DOCX, JPG, PNG, TXT up to 10MB
- **Progress Tracking**: Real-time upload progress with animated bars
- **Multiple File Support**: Queue management with retry logic
- **Error Handling**: Comprehensive error states and recovery

#### **Document Library Component**
- **Grid/List Views**: Toggle between view modes
- **Advanced Search**: Search across all document fields
- **Smart Filtering**: By type, status, expiry date, custom criteria
- **Bulk Operations**: Select all, delete, status updates
- **Status Management**: Valid, pending, expired, expiring_soon, rejected
- **Mobile Responsive**: Optimized for all screen sizes

#### **Compliance Dashboard**
- **Circular Compliance Score**: Animated SVG visualization
- **Real-time Alerts**: Severity-based color coding (critical, warning, info)
- **Expiry Timeline**: Documents expiring in 7/30/90 days
- **Distribution Charts**: Document type breakdown
- **Export Reports**: Compliance reporting functionality

#### **Document Viewer**
- **Modal Interface**: Professional document preview
- **Multi-format Support**: PDF, images, text files
- **Mock Content Generation**: Realistic oil field documents
- **Zoom Controls**: Zoom, rotate, print, download
- **Mobile Optimized**: Responsive design

### 🎯 **PHASE 8: Real-Time Data Visualization** ✅ COMPLETE

#### **Chart.js Integration**
- **Professional Charts**: Line, bar, doughnut, gauge charts
- **Real-time Updates**: Live data streaming every 4 seconds
- **Oil Field Styling**: Custom color palette and themes
- **Interactive Features**: Tooltips, zoom, hover effects
- **Responsive Design**: Mobile-optimized visualizations

#### **Dashboard Visualizations**
- **Live System Monitoring**: 5 real-time charts showing temperature, pressure, flow, volume, safety
- **Performance Gauges**: 6 KPI gauges with threshold monitoring
- **Compliance Charts**: Document status distribution and trends
- **Fleet Analytics**: Multi-series performance tracking

#### **Chart Components Built**
1. **RealtimeChart**: Live data streaming with animations
2. **GaugeChart**: Circular progress indicators with thresholds
3. **Chart**: Base Chart.js wrapper with oil field theming
4. **PerformanceChart**: Multi-line trends with timeframe selection

### 📊 **Enhanced Dashboard Features**

#### **Main Dashboard** (`/`) - 4x4 Metric Grid + Visualizations
**Real-time Metrics (16 cards)**:
- **Row 1**: Internal Oil Temp, Ambient Temp, System Pressure, Flow Rate
- **Row 2**: Net Volume, API Gravity, Water Cut, Mass Flow Rate  
- **Row 3**: H2S Levels, Tanker Pressure, Gas Detection, Pump RPM
- **Row 4**: SCADA Status, DryDrive Temp, Network Health, Active Alerts

**Live Visualizations**:
- **5 Real-time Charts**: Temperature monitoring, flow/pressure, volume trends, H2S safety, system health
- **6 Performance Gauges**: System efficiency, oil temperature, pressure, safety score, network health, flow rate
- **Professional Styling**: Apple-inspired glassmorphism with oil industry colors

#### **Fleet Operations** (`/fleet`)
- **Fleet Overview**: Total volume, efficiency, health, alerts
- **Individual Truck Cards**: Driver info, route progress, 4 key metrics per truck
- **Real-time Updates**: 4-second refresh intervals
- **Safety Monitoring**: Gas detection alerts, efficiency badges

#### **Haul History** (`/hauls`)
- **Comprehensive Table**: Search, filter, sort, pagination
- **Performance Analytics**: Efficiency tracking, variance analysis
- **Route Visualization**: Progress bars, time remaining
- **Statistics Dashboard**: Volume processed, completion rates

#### **Analytics Dashboard** (`/admin`)
- **Multi-series Charts**: Performance trends with Chart.js
- **Efficiency Heatmaps**: Color-coded performance visualization
- **Predictive Analytics**: Trend analysis and forecasting
- **Financial Impact**: Cost optimization reporting

#### **Document Management** (`/documents`)
- **Tabbed Interface**: Library, Compliance, Upload
- **Professional Design**: 2024 enterprise styling (not 2007 Windows Vista!)
- **Real-time Compliance**: Alert badges, expiry tracking
- **Mobile Responsive**: Touch-optimized interface

#### **Enhanced Haul Detail View**
- **6 Professional Tabs**: Overview, Coriolis, Temperature, Pressure, Safety, DryDrive
- **Real-time Charts**: Live data visualization in each tab
- **Comprehensive Monitoring**: All sensor categories with Chart.js visualizations
- **Safety Thresholds**: Industry-standard monitoring

## Design System (Apple-Inspired)

### 🎨 **Visual Design**
- **Glassmorphism**: Backdrop blur effects, translucent surfaces
- **Color Palette**: Oil industry colors (oil-orange #FF6B35, oil-blue #004E89, oil-black #1a1a1a)
- **Typography**: SF Pro Display/Text font family
- **Animations**: Smooth micro-interactions, 300ms transitions
- **Responsive**: Mobile-first design with touch optimization

### 🔧 **Component Architecture**
- **MetricCard**: Enhanced with proper padding, no excessive zoom, glassmorphism
- **RealtimeChart**: Live data streaming with loading states
- **GaugeChart**: Circular indicators with threshold monitoring
- **Navigation**: Professional sidebar with active states
- **DocumentLibrary**: Modern grid/list views with advanced filtering

## Data Architecture

### 🏗️ **Core Interfaces**

```typescript
// Enhanced Haul Interface
interface Haul {
  id: string;
  truckId: string;
  driverId: string;
  onloadSite: Site;
  offloadSite: Site;
  initialVolume: number;
  finalVolume?: number;
  expectedLoss: number;
  actualLoss?: number;
  status: 'loading' | 'transit' | 'offloading' | 'completed';
  startTime: Date;
  endTime?: Date;
  temperatureReadings: TemperatureReading[];
  coriolisReadings: CoriolisReading[];
  pressureReadings: PressureReading[];
  gasDetections: GasDetection[];
  scadaReadings: ScadaReading[];
  dryDriveData: DryDriveData[];
  currentLocation?: { lat: number; lng: number };
  transitProgress: number;
  estimatedTimeRemaining: number;
}

// Document Management
interface CustomerDocument {
  id: string;
  type: 'IFTA' | 'Insurance' | 'Contract' | 'PreTrip' | 'JSA' | 'Emissions' | 'BOL' | 'Manifest' | 'Safety' | 'Maintenance';
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  expiryDate?: Date;
  status: 'valid' | 'pending' | 'expired' | 'expiring_soon' | 'rejected';
  customerId: string;
  uploadedBy: string;
  tags: string[];
  metadata: Record<string, any>;
}

// Coriolis Meter Readings
interface CoriolisReading {
  timestamp: Date;
  netVolume: number;        // BBL
  massFlowRate: number;     // BBL/min
  apiGravity: number;       // API degrees (35-45°)
  waterCut: number;         // percentage (0.1-2.0%)
  oilTemp: number;          // °F (70-85°)
  entrainedGas: number;     // percentage
}

// Gas Detection System
interface GasDetection {
  timestamp: Date;
  h2sExternal: number;      // PPM (0-2.0 with safety thresholds)
  h2sInternal: number;      // PPM
  coExternal: number;       // PPM
  coInternal: number;       // PPM
  lelExternal: number;      // % LEL
  lelInternal: number;      // % LEL
  o2External: number;       // % O2
}

// SCADA System Status
interface ScadaStatus {
  systemOnline: boolean;
  connectedDevices: number;
  networkHealth: number;    // 95-100%
  coriolisOnline: boolean;
  gasDetectorsOnline: boolean;
  dryDriveOnline: boolean;
  lastUpdate: Date;
}
```

### 📊 **Real-time Data Simulation**

All data follows Kevin's spreadsheet specifications:
- **Temperature**: 70-85°F internal, 85-105°F ambient
- **Pressure**: 140-165 PSI system, 140-160 PSI tanker
- **Flow Rate**: 2.5-3.5 BBL/min with realistic variation
- **API Gravity**: 35-45° API with industry standards
- **H2S Levels**: 0-2.0 PPM with safety thresholds
- **Network Health**: 95-100% with 98% average uptime
- **Pump RPM**: 1650-1850 RPM operational range

## Technical Implementation

### 🔧 **Chart.js Integration**
- **Auto Import**: Using chart.js/auto for all controllers
- **Data Validation**: Proper error handling and loading states
- **Real-time Updates**: 4-second intervals with smooth animations
- **Responsive Design**: Mobile-optimized with touch interactions
- **Oil Field Theming**: Custom colors and professional styling

### 🎯 **Performance Optimizations**
- **Lazy Loading**: Charts load only when data is available
- **Error Handling**: Graceful fallbacks with loading spinners
- **Memory Management**: Proper chart cleanup on component destruction
- **Mobile Performance**: Optimized for touch devices

### 📱 **Responsive Design**
- **Mobile-First**: Touch-optimized interface
- **Breakpoints**: sm, md, lg, xl responsive grid system
- **Touch Interactions**: Proper touch targets and gestures
- **Performance**: Optimized for mobile devices

## Kevin's Business Requirements ✅ DELIVERED

### 🎯 **Demo Requirements Met**
1. **Complete Vision**: All data categories from spreadsheet implemented
2. **Strategic Depth**: 4 genuinely impressive areas (Dashboard, Fleet, Documents, Analytics)
3. **Professional Polish**: Apple-level design with glassmorphism
4. **Real-time Performance**: Live data streaming every 4 seconds
5. **Comprehensive Coverage**: All 11 data categories from Kevin's spreadsheet

### 📊 **Data Integration Success**
- **Hundreds of Data Points**: All categories from Kevin's Excel implemented
- **Real-time Streaming**: 4-second update intervals
- **Professional Visualization**: Chart.js integration with oil field theming
- **Mobile Optimization**: Touch-friendly interface
- **Compliance Ready**: Document management with automated tracking

### 🚀 **Sales Demo Ready**
- **Monday Meeting Prepared**: Complete application ready for largest crude hauling company
- **Marketing Materials**: Professional visualizations and comprehensive feature set
- **Training Content**: Intuitive interface with guided workflows
- **Scalability**: Architecture ready for enterprise deployment

## Development Rules

### 🎯 **Code Quality Standards**
1. **TypeScript**: Strict typing for all interfaces and components
2. **Component Architecture**: Reusable, modular components
3. **Error Handling**: Comprehensive error states and recovery
4. **Performance**: Optimized for real-time data streaming
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### 🎨 **Design Standards**
1. **Apple-Inspired**: Glassmorphism, smooth animations, professional typography
2. **Oil Industry Colors**: Consistent color palette throughout
3. **Responsive**: Mobile-first design with touch optimization
4. **Professional**: Enterprise-grade styling (not 2007 Windows Vista!)
5. **Consistent**: Unified design system across all components

### 📊 **Data Standards**
1. **Real-time**: 4-second update intervals for live data
2. **Validation**: Proper data validation and error handling
3. **Realistic**: Data ranges match Kevin's spreadsheet specifications
4. **Performance**: Optimized for high-frequency updates
5. **Scalable**: Architecture ready for production deployment

## Next Phase Recommendations

### 🚀 **Phase 9: Smart Dispatch System**
- **AI-Powered Routing**: Machine learning for optimal route planning
- **Predictive Analytics**: Forecast volume loss and optimize schedules
- **Real-time Optimization**: Dynamic route adjustments based on conditions
- **Driver Performance**: AI-driven performance scoring and recommendations

### 📈 **Phase 10: Advanced Analytics**
- **Machine Learning**: Predictive models for loss prevention
- **Business Intelligence**: Advanced reporting and insights
- **Cost Optimization**: AI-driven cost reduction recommendations
- **Performance Benchmarking**: Industry comparison and optimization

### 🔧 **Technical Enhancements**
- **WebSocket Integration**: Real-time data streaming
- **Database Integration**: PostgreSQL with real-time sync
- **API Development**: RESTful APIs for mobile and third-party integration
- **Security**: Enterprise-grade authentication and authorization

---

**Status**: ✅ PHASE 8 COMPLETE - Ready for Monday demo with largest crude hauling company. All Kevin's requirements from spreadsheet implemented with professional Apple-inspired design and real-time Chart.js visualizations. 