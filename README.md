# 🛢️ Oil Field Temperature Tracker

A modern, real-time temperature monitoring dashboard built specifically for oil field operations. This application provides critical infrastructure monitoring with beautiful, responsive design and real-time data visualization.

## ✨ Features

- **Real-time Temperature Monitoring**: Live updates from multiple sensor locations
- **Critical System Metrics**: Monitor pressure, flow rates, and system status
- **Responsive Dashboard**: Beautiful UI that works on desktop, tablet, and mobile
- **Status Indicators**: Visual alerts for normal, warning, and critical conditions
- **Modern Design**: Built with Tailwind CSS and oil field-specific color schemes
- **TypeScript Support**: Full type safety for robust development

## 🚀 Technology Stack

- **Frontend**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS with custom oil field theme
- **Build Tool**: Vite
- **Icons**: Emoji-based for universal compatibility

## 🎨 Design Philosophy

This application is designed specifically for oil field environments with:

- **High contrast colors** for visibility in bright outdoor conditions
- **Large, readable fonts** for easy viewing from a distance
- **Status indicators** that are colorblind-friendly
- **Professional color scheme** using industry-standard oranges and blues
- **Responsive design** that works on rugged tablets and mobile devices

## 📊 Dashboard Features

### Key Metrics Cards
- **Current Temperature**: Real-time temperature with target comparison
- **System Pressure**: Live pressure readings in PSI
- **Flow Rate**: Current flow rate in barrels per minute
- **System Status**: Overall operational status

### Sensor Readings Table
- Multiple sensor locations (Well Heads, Pipeline Sections, Storage Tanks, etc.)
- Real-time temperature updates
- Color-coded status indicators
- Quick action buttons for detailed views

### Quick Actions
- View Reports
- System Settings
- Alert Management

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
src/
├── routes/
│   ├── +layout.svelte    # Main application layout
│   └── +page.svelte      # Dashboard page
├── app.css               # Global styles and Tailwind CSS
├── app.html              # HTML template
└── app.d.ts              # TypeScript declarations
```

## 🎨 Custom Theme

The application includes a custom Tailwind CSS theme with oil field-specific colors:

- **Oil Black**: `#1a1a1a` - Primary dark color
- **Oil Orange**: `#ff6b35` - Primary brand color
- **Oil Blue**: `#2563eb` - Secondary brand color
- **Success Green**: `#10b981` - Normal status
- **Warning Yellow**: `#f59e0b` - Warning status
- **Danger Red**: `#ef4444` - Critical status

## 📱 Responsive Design

The dashboard is fully responsive and optimized for:
- **Desktop**: Full dashboard with all features
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Stacked layout with essential information

## 🔧 Customization

### Adding New Sensors
Update the `sensorReadings` array in `src/routes/+page.svelte`:

```javascript
let sensorReadings = $state([
  { id: 1, location: "Your Location", temp: 70.0, status: "normal" },
  // Add more sensors...
]);
```

### Modifying Colors
Update the theme in `tailwind.config.js`:

```javascript
colors: {
  'your-color': '#hexcode',
  // Add custom colors...
}
```

## 🚀 Deployment

This application can be deployed to any static hosting service:

```bash
npm run build
```

The built files will be in the `build/` directory.

## 🤝 Contributing

This project is designed for oil field operations. When contributing:

1. Maintain the professional, industrial design aesthetic
2. Ensure all features work in harsh environmental conditions
3. Test on various screen sizes and devices
4. Follow accessibility guidelines for outdoor visibility

## 📈 Future Enhancements

- [ ] Historical data visualization with charts
- [ ] Alert notification system
- [ ] Multi-site support
- [ ] Data export functionality
- [ ] Mobile app version
- [ ] Integration with IoT sensors
- [ ] Advanced analytics and reporting

## 📞 Support

For oil field-specific requirements or customizations, please reach out with your specific monitoring needs.

---

Built with ❤️ for the oil and gas industry
