# 🛢️ Oil Field Temperature Tracker

A professional SCADA-style web application for monitoring oil transport temperature variations and calculating expected vs actual volume loss during truck hauls.

## 🚀 Live Demo

- **Main Dashboard**: [http://localhost:5180/](http://localhost:5180/) - SCADA monitoring interface
- **Analytics Dashboard**: [http://localhost:5180/admin](http://localhost:5180/admin) - Performance insights and operational intelligence

## ✨ Features

### 📡 Real-Time SCADA Monitoring
- **Live temperature tracking** with 3-second update intervals
- **Multi-site operations** (Permian Basin, Eagle Ford, Houston Refinery, Corpus Christi)
- **Real-time transit progress** with GPS location simulation
- **Coriolis meter integration** for accurate volume measurements

### 🧮 Advanced Loss Calculations
- **Thermal expansion modeling** based on temperature differentials
- **Expected vs actual loss analysis** with variance detection
- **Professional variance categorization** (Good ≤5%, Moderate 5-15%, High >15%)
- **Financial impact tracking** with real oil price calculations

### 📊 Analytics Dashboard
- **Driver performance leaderboard** with efficiency rankings
- **Truck fleet analysis** with maintenance alerts
- **Route optimization insights** for maximum efficiency
- **Predictive analytics** with weather impact forecasting
- **Financial KPIs** showing cost savings and losses

### 🎨 Professional Design
- **Apple-inspired glassmorphism UI** with industrial automation feel
- **SCADA-style color coding** and professional terminology
- **Responsive design** optimized for all devices
- **Real-time animations** and smooth transitions

## 🛠️ Technology Stack

- **Frontend**: SvelteKit with TypeScript for type safety
- **Styling**: Tailwind CSS 4.0 with custom oil field color scheme
- **Architecture**: Component-based with reactive stores
- **Real-time**: Live data simulation with WebSocket-ready architecture

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/lojak57/drydriveTempTracker.git
cd drydriveTempTracker

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:5173
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Run Svelte check
npm run check:watch  # Run Svelte check in watch mode
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── analytics/          # Analytics dashboard components
│   │   │   ├── AnalyticsCard.svelte
│   │   │   ├── DriverLeaderboard.svelte
│   │   │   ├── LossAnalysis.svelte
│   │   │   ├── PerformanceChart.svelte
│   │   │   └── TruckEfficiency.svelte
│   │   ├── dashboard/          # Main SCADA components
│   │   │   ├── HaulCard.svelte
│   │   │   ├── HaulDetailView.svelte
│   │   │   ├── LiveDataFeed.svelte
│   │   │   └── SystemStatusCard.svelte
│   │   └── ui/                 # Reusable UI components
│   │       ├── MetricCard.svelte
│   │       └── Navigation.svelte
│   └── stores/
│       └── haulStore.ts        # Reactive data management
└── routes/
    ├── +page.svelte           # Main SCADA dashboard
    ├── admin/+page.svelte     # Analytics dashboard
    └── haul/+page.svelte      # Individual haul monitoring
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# API Configuration (for future backend integration)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WEBSOCKET_URL=ws://localhost:3000/ws

# SCADA Configuration
VITE_UPDATE_INTERVAL=3000
VITE_OIL_PRICE_API=your-oil-price-api-key
```

### Tailwind Customization
The app uses a custom color scheme defined in `tailwind.config.js`:

```js
colors: {
  oil: {
    orange: '#ff6b35',
    blue: '#004e89',
    black: '#1a1a1a',
    gray: '#6b7280'
  }
}
```

## 📈 Data Model

### Core Interfaces

```typescript
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
  temperatureReadings: TemperatureReading[];
  transitProgress: number;
}

interface TemperatureReading {
  timestamp: Date;
  ambient: number;
  internal: number;
}
```

## 🎯 Usage

### Main Dashboard
Navigate to the main dashboard to:
- Monitor active hauls in real-time
- View live temperature readings
- Track transit progress
- Review SCADA system status

### Analytics Dashboard  
Access `/admin` to:
- Analyze driver and truck performance
- Review loss variance patterns
- Monitor financial impact
- View predictive insights

### Haul Details
Click any haul card to see:
- Complete 4-step workflow visualization
- Real-time temperature monitoring
- Expected loss calculations
- Variance analysis results

## 🔮 Future Enhancements

- [ ] **Backend Integration** with real SCADA hardware
- [ ] **WebSocket real-time updates** for live data streaming
- [ ] **Advanced ML predictions** for loss optimization
- [ ] **Mobile app** for field operations
- [ ] **Historical data analysis** with trend forecasting
- [ ] **Alert system** with SMS/email notifications
- [ ] **Multi-tenant support** for different oil companies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Oil Industry Standards** for thermal expansion calculations
- **SCADA Best Practices** for industrial monitoring interfaces
- **Apple Design System** for UI/UX inspiration
- **SvelteKit Community** for excellent documentation and support

---

**Built with ❤️ for the oil & gas industry**

For questions or support, please open an issue or contact the development team.
