import { writable, derived } from 'svelte/store';

// Enhanced temperature readings
export interface TemperatureReading {
	timestamp: Date;
	ambient: number;
	internal: number;
	tankerTemp: number;
	oilTemp: number;
}

// New Coriolis meter readings
export interface CoriolisReading {
	timestamp: Date;
	netVolume: number;        // BBL
	massFlowRate: number;     // BBL/min
	apiGravity: number;       // API degrees
	waterCut: number;         // percentage
	oilTemp: number;          // °F
	entrainedGas: number;     // percentage
}

// Pressure sensor readings
export interface PressureReading {
	timestamp: Date;
	tankerOnLoad: number;     // PSI
	tankerOffLoad: number;    // PSI vacuum
	tankerInternal: number;   // PSI
	tankVentLine: number;     // PSI
}

// Gas detection readings
export interface GasDetection {
	timestamp: Date;
	h2sExternal: number;      // PPM
	h2sInternal: number;      // PPM
	coExternal: number;       // PPM
	coInternal: number;       // PPM
	lelExternal: number;      // % LEL
	lelInternal: number;      // % LEL
	o2External: number;       // % O2
}

// Enhanced SCADA readings
export interface ScadaReading {
	timestamp: Date;
	tankLevel: number;        // feet
	oilTemp: number;          // °F
	flowRate: number;         // BBL/min
	systemPressure: number;   // PSI
	gasDetection: boolean;    // safety status
}

// DryDrive pump system data
export interface DryDriveData {
	timestamp: Date;
	pumpRpm: number;
	pumpTemp: number;         // °F
	inverterVoltage: number;  // V
	inverterTemp: number;     // °F
	motorTemp: number;        // °F
	rectifierTemp: number;    // °F
	generatorTemp: number;    // °F
	pumpStartTime?: Date;
	pumpStopTime?: Date;
	totalPumpTime: number;    // minutes
}

// Enhanced SCADA status
export interface ScadaStatus {
	systemOnline: boolean;
	connectedDevices: number;
	networkHealth: number;        // percentage
	lastUpdate: Date;
	dataLatency: number;          // milliseconds
	coriolisOnline: boolean;
	gasDetectorsOnline: boolean;
	pressureSensorsOnline: boolean;
	temperatureSensorsOnline: boolean;
	dryDriveOnline: boolean;
}

export interface Site {
	id: string;
	name: string;
	location: { lat: number; lng: number };
	type: 'onload' | 'offload';
}

export interface Haul {
	id: string;
	truckId: string;
	driverId: string;
	onloadSite: Site;
	offloadSite: Site;
	initialVolume: number; // gallons
	finalVolume?: number; // gallons
	expectedLoss: number; // calculated gallons
	actualLoss?: number; // measured gallons
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
	transitProgress: number; // 0-100%
	estimatedTimeRemaining: number; // minutes
}

export interface Driver {
	id: string;
	name: string;
	experience: number; // years
	totalHauls: number;
	averageEfficiency: number; // percentage
}

export interface Truck {
	id: string;
	plateNumber: string;
	capacity: number; // gallons
	model: string;
	year: number;
	averageEfficiency: number;
}

// Current active haul
export const currentHaul = writable<Haul | null>(null);

// Historical hauls data
export const haulHistory = writable<Haul[]>([]);

// Available sites
export const sites = writable<Site[]>([
	{
		id: 'site-1',
		name: 'Permian Basin Terminal',
		location: { lat: 31.8457, lng: -102.3676 },
		type: 'onload'
	},
	{
		id: 'site-2',
		name: 'Eagle Ford Loading',
		location: { lat: 28.8644, lng: -97.9222 },
		type: 'onload'
	},
	{
		id: 'site-3',
		name: 'Houston Refinery',
		location: { lat: 29.7604, lng: -95.3698 },
		type: 'offload'
	},
	{
		id: 'site-4',
		name: 'Corpus Christi Terminal',
		location: { lat: 27.8006, lng: -97.3964 },
		type: 'offload'
	}
]);

// Drivers database
export const drivers = writable<Driver[]>([
	{
		id: 'driver-1',
		name: 'Jake Thompson',
		experience: 8,
		totalHauls: 1240,
		averageEfficiency: 97.2
	},
	{
		id: 'driver-2',
		name: 'Maria Santos',
		experience: 5,
		totalHauls: 890,
		averageEfficiency: 98.1
	},
	{
		id: 'driver-3',
		name: 'Robert Johnson',
		experience: 12,
		totalHauls: 2150,
		averageEfficiency: 96.8
	}
]);

// Trucks database
export const trucks = writable<Truck[]>([
	{
		id: 'truck-1',
		plateNumber: 'TX-8402',
		capacity: 8000,
		model: 'Peterbilt 579',
		year: 2021,
		averageEfficiency: 97.5
	},
	{
		id: 'truck-2',
		plateNumber: 'TX-9156',
		capacity: 9500,
		model: 'Kenworth T680',
		year: 2020,
		averageEfficiency: 96.9
	},
	{
		id: 'truck-3',
		plateNumber: 'TX-7234',
		capacity: 8500,
		model: 'Freightliner Cascadia',
		year: 2022,
		averageEfficiency: 98.1
	}
]);

// Live SCADA data - active hauls
export const activeHauls = writable<Haul[]>([
	{
		id: 'haul-1735064220000',
		truckId: 'truck-1',
		driverId: 'driver-1',
		onloadSite: {
			id: 'site-1',
			name: 'Permian Basin Terminal',
			location: { lat: 31.8457, lng: -102.3676 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-3',
			name: 'Houston Refinery',
			location: { lat: 29.7604, lng: -95.3698 },
			type: 'offload'
		},
		initialVolume: 7850,
		expectedLoss: 12.4,
		status: 'transit',
		startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
		temperatureReadings: [
			{ timestamp: new Date(), ambient: 98.2, internal: 76.1, tankerTemp: 78.5, oilTemp: 76.8 }
		],
		coriolisReadings: [
			{ timestamp: new Date(), netVolume: 172.5, massFlowRate: 3.2, apiGravity: 42.1, waterCut: 0.8, oilTemp: 76.8, entrainedGas: 0.2 }
		],
		pressureReadings: [
			{ timestamp: new Date(), tankerOnLoad: 145.2, tankerOffLoad: -12.3, tankerInternal: 14.7, tankVentLine: 2.1 }
		],
		gasDetections: [
			{ timestamp: new Date(), h2sExternal: 0.5, h2sInternal: 0.2, coExternal: 2.1, coInternal: 1.8, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.9 }
		],
		scadaReadings: [
			{ timestamp: new Date(), tankLevel: 18.2, oilTemp: 76.8, flowRate: 3.2, systemPressure: 145.2, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: new Date(), pumpRpm: 1750, pumpTemp: 185.3, inverterVoltage: 480.2, inverterTemp: 142.1, motorTemp: 156.7, rectifierTemp: 138.9, generatorTemp: 162.4, totalPumpTime: 42 }
		],
		currentLocation: { lat: 30.5, lng: -99.2 },
		transitProgress: 67,
		estimatedTimeRemaining: 38
	},
	{
		id: 'haul-1735064340000',
		truckId: 'truck-2',
		driverId: 'driver-2',
		onloadSite: {
			id: 'site-2',
			name: 'Eagle Ford Loading',
			location: { lat: 28.8644, lng: -97.9222 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-4',
			name: 'Corpus Christi Terminal',
			location: { lat: 27.8006, lng: -97.3964 },
			type: 'offload'
		},
		initialVolume: 9200,
		expectedLoss: 8.7,
		status: 'loading',
		startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
		temperatureReadings: [
			{ timestamp: new Date(), ambient: 92.4, internal: 74.3, tankerTemp: 75.1, oilTemp: 74.8 }
		],
		coriolisReadings: [
			{ timestamp: new Date(), netVolume: 202.4, massFlowRate: 4.1, apiGravity: 38.7, waterCut: 1.2, oilTemp: 74.8, entrainedGas: 0.1 }
		],
		pressureReadings: [
			{ timestamp: new Date(), tankerOnLoad: 152.8, tankerOffLoad: -8.9, tankerInternal: 16.2, tankVentLine: 1.8 }
		],
		gasDetections: [
			{ timestamp: new Date(), h2sExternal: 0.3, h2sInternal: 0.1, coExternal: 1.8, coInternal: 1.5, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.8 }
		],
		scadaReadings: [
			{ timestamp: new Date(), tankLevel: 22.1, oilTemp: 74.8, flowRate: 4.1, systemPressure: 152.8, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: new Date(), pumpRpm: 1820, pumpTemp: 178.9, inverterVoltage: 478.5, inverterTemp: 139.7, motorTemp: 151.2, rectifierTemp: 135.4, generatorTemp: 158.1, totalPumpTime: 12 }
		],
		currentLocation: { lat: 28.8644, lng: -97.9222 },
		transitProgress: 0,
		estimatedTimeRemaining: 95
	},
	{
		id: 'haul-1735063900000',
		truckId: 'truck-3',
		driverId: 'driver-3',
		onloadSite: {
			id: 'site-1',
			name: 'Permian Basin Terminal',
			location: { lat: 31.8457, lng: -102.3676 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-3',
			name: 'Houston Refinery',
			location: { lat: 29.7604, lng: -95.3698 },
			type: 'offload'
		},
		initialVolume: 8100,
		finalVolume: 8087.3,
		expectedLoss: 14.2,
		actualLoss: 12.7,
		status: 'offloading',
		startTime: new Date(Date.now() - 125 * 60 * 1000), // 2 hours 5 minutes ago
		temperatureReadings: [
			{ timestamp: new Date(), ambient: 89.1, internal: 78.9, tankerTemp: 79.2, oilTemp: 79.0 }
		],
		coriolisReadings: [
			{ timestamp: new Date(), netVolume: 177.8, massFlowRate: 2.8, apiGravity: 41.3, waterCut: 0.6, oilTemp: 79.0, entrainedGas: 0.3 }
		],
		pressureReadings: [
			{ timestamp: new Date(), tankerOnLoad: 148.7, tankerOffLoad: -15.2, tankerInternal: 13.9, tankVentLine: 2.3 }
		],
		gasDetections: [
			{ timestamp: new Date(), h2sExternal: 0.7, h2sInternal: 0.4, coExternal: 2.3, coInternal: 2.0, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.7 }
		],
		scadaReadings: [
			{ timestamp: new Date(), tankLevel: 19.5, oilTemp: 79.0, flowRate: 2.8, systemPressure: 148.7, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: new Date(), pumpRpm: 1680, pumpTemp: 192.1, inverterVoltage: 481.7, inverterTemp: 145.8, motorTemp: 162.3, rectifierTemp: 142.1, generatorTemp: 167.9, totalPumpTime: 118 }
		],
		currentLocation: { lat: 29.7604, lng: -95.3698 },
		transitProgress: 100,
		estimatedTimeRemaining: 0
	}
]);

// Historical completed hauls
export const completedHauls = writable<Haul[]>([
	{
		id: 'haul-1735050000000',
		truckId: 'truck-1',
		driverId: 'driver-1',
		onloadSite: {
			id: 'site-2',
			name: 'Eagle Ford Loading',
			location: { lat: 28.8644, lng: -97.9222 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-4',
			name: 'Corpus Christi Terminal',
			location: { lat: 27.8006, lng: -97.3964 },
			type: 'offload'
		},
		initialVolume: 7650,
		finalVolume: 7643.1,
		expectedLoss: 9.2,
		actualLoss: 6.9,
		status: 'completed',
		startTime: new Date(Date.now() - 180 * 60 * 1000),
		endTime: new Date(Date.now() - 60 * 60 * 1000),
		temperatureReadings: [],
		coriolisReadings: [],
		pressureReadings: [],
		gasDetections: [],
		scadaReadings: [],
		dryDriveData: [],
		transitProgress: 100,
		estimatedTimeRemaining: 0
	}
]);

// Derived stores for analytics
export const driverStats = derived([activeHauls, completedHauls, drivers], ([$active, $completed, $drivers]) => {
	const allHauls = [...$active, ...$completed];
	return $drivers.map(driver => {
		const driverHauls = allHauls.filter(haul => haul.driverId === driver.id);
		const efficiency = driverHauls.length > 0 
			? driverHauls.reduce((acc, haul) => {
				if (haul.actualLoss !== undefined && haul.expectedLoss > 0) {
					const lossPercentage = Math.abs(haul.actualLoss - haul.expectedLoss) / haul.expectedLoss;
					return acc + (1 - lossPercentage);
				}
				return acc;
			}, 0) / driverHauls.filter(h => h.actualLoss !== undefined).length * 100
			: driver.averageEfficiency;
		
		return {
			...driver,
			recentHauls: driverHauls.length,
			currentEfficiency: efficiency || driver.averageEfficiency
		};
	});
});

// Calculate expected loss based on temperature differential
export function calculateExpectedLoss(
	initialVolume: number,
	avgAmbient: number,
	avgInternal: number,
	transitTimeHours: number
): number {
	// Simplified thermal expansion calculation
	// Real formula would be more complex with oil-specific coefficients
	const tempDifferential = avgAmbient - avgInternal;
	const expansionRate = 0.00035; // per degree F per hour (simplified)
	const expectedLoss = initialVolume * expansionRate * tempDifferential * transitTimeHours;
	return Math.max(0, expectedLoss); // No negative loss in this demo
}

// SCADA system status
export const scadaStatus = writable<ScadaStatus>({
	systemOnline: true,
	lastUpdate: new Date(),
	connectedDevices: 15,
	dataLatency: 1.2, // seconds
	networkHealth: 98.7, // percentage
	coriolisOnline: true,
	gasDetectorsOnline: true,
	pressureSensorsOnline: true,
	temperatureSensorsOnline: true,
	dryDriveOnline: true
}); 