import { writable, derived } from 'svelte/store';

// Valve status interface
export interface ValveStatus {
	id: string;
	name: string;
	location: string;
	status: 'open' | 'closed' | 'unknown';
	hassensor: boolean;
	isAirActuated: boolean;
	requiresConfirmation: boolean;
	lastUpdated: Date;
}

// Sensor reading interface
export interface SensorReading {
	id: string;
	name: string;
	location: string;
	type: 'pressure' | 'vacuum' | 'temperature';
	currentValue: number;
	unit: string;
	minThreshold?: number;
	maxThreshold: number;
	status: 'normal' | 'warning' | 'critical';
	lovisVisionCapture: boolean;
	lastUpdated: Date;
}

// Truck monitoring data interface
export interface TruckMonitoringData {
	truckId: string;
	valves: ValveStatus[];
	sensors: SensorReading[];
	lastSync: Date;
	connectionStatus: 'connected' | 'disconnected' | 'syncing';
}

// Mock valve data based on spreadsheet
const mockValves: ValveStatus[] = [
	{
		id: 'pressure-relief-vent',
		name: 'Pressure Relief Vent',
		location: 'Spill Dam',
		status: 'closed',
		hassensor: true,
		isAirActuated: false,
		requiresConfirmation: true,
		lastUpdated: new Date()
	},
	{
		id: 'belly-valve',
		name: 'Belly Valve',
		location: 'After pump',
		status: 'open',
		hassensor: false,
		isAirActuated: true,
		requiresConfirmation: true,
		lastUpdated: new Date()
	},
	{
		id: 'fire-valve',
		name: 'Fire Valve / Emergency Valve',
		location: 'Bottom center of trailer',
		status: 'closed',
		hassensor: false,
		isAirActuated: true,
		requiresConfirmation: true,
		lastUpdated: new Date()
	},
	{
		id: 'vent-valve',
		name: 'Vent Valve Switch',
		location: 'Top of tank',
		status: 'closed',
		hassensor: false,
		isAirActuated: false,
		requiresConfirmation: true,
		lastUpdated: new Date()
	},
	{
		id: 'right-load-valve',
		name: 'Right Side Load Valve',
		location: 'Trailer side (right)',
		status: 'open',
		hassensor: false,
		isAirActuated: false,
		requiresConfirmation: true,
		lastUpdated: new Date()
	},
	{
		id: 'left-load-valve',
		name: 'Left Side Load Valve',
		location: 'Trailer side (left)',
		status: 'closed',
		hassensor: false,
		isAirActuated: false,
		requiresConfirmation: true,
		lastUpdated: new Date()
	}
];

// Mock sensor data based on spreadsheet
const mockSensors: SensorReading[] = [
	{
		id: 'tanker-onload-pressure',
		name: 'Tanker On-Load Pressure',
		location: 'Between pump & tanker',
		type: 'pressure',
		currentValue: 18.7,
		unit: 'psi',
		maxThreshold: 20,
		status: 'normal',
		lovisVisionCapture: true,
		lastUpdated: new Date()
	},
	{
		id: 'tanker-offload-vacuum',
		name: 'Tanker Off-Load Vacuum',
		location: 'Between pump & tanker',
		type: 'vacuum',
		currentValue: -6.2,
		unit: 'psi',
		minThreshold: -7,
		maxThreshold: 0,
		status: 'normal',
		lovisVisionCapture: true,
		lastUpdated: new Date()
	},
	{
		id: 'external-offload-pressure',
		name: 'External Off-Load Pressure',
		location: 'Pump → External connection',
		type: 'pressure',
		currentValue: 29.4,
		unit: 'psi',
		maxThreshold: 30,
		status: 'warning',
		lovisVisionCapture: true,
		lastUpdated: new Date()
	}
];

// Create truck monitoring store
export const selectedTruckId = writable<string>('PLN-014');

export const truckMonitoringData = writable<TruckMonitoringData>({
	truckId: 'PLN-014',
	valves: mockValves,
	sensors: mockSensors,
	lastSync: new Date(),
	connectionStatus: 'connected'
});

// Derived stores for easy access
export const valveStatuses = derived(
	truckMonitoringData,
	($data) => $data.valves
);

export const sensorReadings = derived(
	truckMonitoringData,
	($data) => $data.sensors
);

export const systemAlerts = derived(
	truckMonitoringData,
	($data) => {
		const alerts: string[] = [];
		
		// Check for valve issues
		$data.valves.forEach(valve => {
			if (valve.status === 'unknown') {
				alerts.push(`${valve.name} status unknown`);
			}
		});
		
		// Check for sensor alerts
		$data.sensors.forEach(sensor => {
			if (sensor.status === 'critical') {
				alerts.push(`${sensor.name}: CRITICAL - ${sensor.currentValue}${sensor.unit}`);
			} else if (sensor.status === 'warning') {
				alerts.push(`${sensor.name}: Warning - ${sensor.currentValue}${sensor.unit}`);
			}
		});
		
		return alerts;
	}
);

// Function to toggle valve status (for simulation)
export function toggleValve(valveId: string) {
	truckMonitoringData.update(data => {
		const valve = data.valves.find(v => v.id === valveId);
		if (valve) {
			valve.status = valve.status === 'open' ? 'closed' : 'open';
			valve.lastUpdated = new Date();
		}
		return { ...data, lastSync: new Date() };
	});
}

// Function to simulate sensor readings
export function simulateSensorReadings() {
	truckMonitoringData.update(data => {
		data.sensors.forEach(sensor => {
			// Add small random variation
			const variation = (Math.random() - 0.5) * 2; // ±1 unit variation
			sensor.currentValue = Math.round((sensor.currentValue + variation) * 10) / 10;
			
			// Update status based on thresholds
			if (sensor.type === 'vacuum') {
				if (sensor.currentValue < sensor.minThreshold!) {
					sensor.status = 'critical';
				} else if (sensor.currentValue < sensor.minThreshold! + 1) {
					sensor.status = 'warning';
				} else {
					sensor.status = 'normal';
				}
			} else {
				if (sensor.currentValue > sensor.maxThreshold) {
					sensor.status = 'critical';
				} else if (sensor.currentValue > sensor.maxThreshold - 2) {
					sensor.status = 'warning';
				} else {
					sensor.status = 'normal';
				}
			}
			
			sensor.lastUpdated = new Date();
		});
		
		return { ...data, lastSync: new Date() };
	});
}

// Auto-simulation for demo purposes
if (typeof window !== 'undefined') {
	setInterval(() => {
		simulateSensorReadings();
	}, 3000); // Update every 3 seconds
} 