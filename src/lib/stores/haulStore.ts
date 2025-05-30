import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

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

// Helper function to create consistent timestamps
function getStaticTimestamp(offsetMinutes: number = 0): Date {
	// Use a fixed base timestamp for SSR consistency
	const baseTime = 1735064220000; // Fixed timestamp
	return new Date(baseTime + (offsetMinutes * 60 * 1000));
}

// Helper function to get current time only on client
function getCurrentTime(): Date {
	return browser ? new Date() : getStaticTimestamp();
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
		startTime: getStaticTimestamp(-45), // 45 minutes ago
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(), ambient: 98.2, internal: 76.1, tankerTemp: 78.5, oilTemp: 76.8 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(), netVolume: 172.5, massFlowRate: 3.2, apiGravity: 42.1, waterCut: 0.8, oilTemp: 76.8, entrainedGas: 0.2 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(), tankerOnLoad: 145.2, tankerOffLoad: -12.3, tankerInternal: 14.7, tankVentLine: 2.1 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(), h2sExternal: 0.5, h2sInternal: 0.2, coExternal: 2.1, coInternal: 1.8, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.9 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(), tankLevel: 18.2, oilTemp: 76.8, flowRate: 3.2, systemPressure: 145.2, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(), pumpRpm: 1750, pumpTemp: 185.3, inverterVoltage: 480.2, inverterTemp: 142.1, motorTemp: 156.7, rectifierTemp: 138.9, generatorTemp: 162.4, totalPumpTime: 42 }
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
		startTime: getStaticTimestamp(-15), // 15 minutes ago
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(), ambient: 92.4, internal: 74.3, tankerTemp: 75.1, oilTemp: 74.8 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(), netVolume: 202.4, massFlowRate: 4.1, apiGravity: 38.7, waterCut: 1.2, oilTemp: 74.8, entrainedGas: 0.1 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(), tankerOnLoad: 152.8, tankerOffLoad: -8.9, tankerInternal: 16.2, tankVentLine: 1.8 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(), h2sExternal: 0.3, h2sInternal: 0.1, coExternal: 1.8, coInternal: 1.5, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.8 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(), tankLevel: 22.1, oilTemp: 74.8, flowRate: 4.1, systemPressure: 152.8, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(), pumpRpm: 1820, pumpTemp: 178.9, inverterVoltage: 478.5, inverterTemp: 139.7, motorTemp: 151.2, rectifierTemp: 135.4, generatorTemp: 158.1, totalPumpTime: 12 }
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
		startTime: getStaticTimestamp(-125), // 2 hours 5 minutes ago
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(), ambient: 89.1, internal: 78.9, tankerTemp: 79.2, oilTemp: 79.0 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(), netVolume: 177.8, massFlowRate: 2.8, apiGravity: 41.3, waterCut: 0.6, oilTemp: 79.0, entrainedGas: 0.3 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(), tankerOnLoad: 148.7, tankerOffLoad: -15.2, tankerInternal: 13.9, tankVentLine: 2.3 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(), h2sExternal: 0.7, h2sInternal: 0.4, coExternal: 2.3, coInternal: 2.0, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.7 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(), tankLevel: 19.5, oilTemp: 79.0, flowRate: 2.8, systemPressure: 148.7, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(), pumpRpm: 1680, pumpTemp: 192.1, inverterVoltage: 481.7, inverterTemp: 145.8, motorTemp: 162.3, rectifierTemp: 142.1, generatorTemp: 167.9, totalPumpTime: 118 }
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
		startTime: getStaticTimestamp(-180),
		endTime: getStaticTimestamp(-60),
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(-120), ambient: 94.2, internal: 76.8, tankerTemp: 77.1, oilTemp: 76.9 },
			{ timestamp: getStaticTimestamp(-90), ambient: 96.1, internal: 78.3, tankerTemp: 78.6, oilTemp: 78.4 },
			{ timestamp: getStaticTimestamp(-60), ambient: 91.7, internal: 77.9, tankerTemp: 78.2, oilTemp: 78.0 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(-180), netVolume: 7650.0, massFlowRate: 5.2, apiGravity: 39.4, waterCut: 0.8, oilTemp: 76.9, entrainedGas: 0.2 },
			{ timestamp: getStaticTimestamp(-60), netVolume: 7643.1, massFlowRate: 4.8, apiGravity: 39.4, waterCut: 0.8, oilTemp: 78.0, entrainedGas: 0.2 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(-120), tankerOnLoad: 145.3, tankerOffLoad: -12.1, tankerInternal: 14.7, tankVentLine: 2.1 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(-90), h2sExternal: 0.4, h2sInternal: 0.2, coExternal: 1.9, coInternal: 1.6, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.9 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(-120), tankLevel: 18.7, oilTemp: 76.9, flowRate: 5.2, systemPressure: 145.3, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(-90), pumpRpm: 1750, pumpTemp: 185.4, inverterVoltage: 479.2, inverterTemp: 142.3, motorTemp: 156.8, rectifierTemp: 138.9, generatorTemp: 162.5, totalPumpTime: 95 }
		],
		transitProgress: 100,
		estimatedTimeRemaining: 0
	},
	{
		id: 'haul-1735040000000',
		truckId: 'truck-2',
		driverId: 'driver-2',
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
		initialVolume: 8200,
		finalVolume: 8185.4,
		expectedLoss: 16.8,
		actualLoss: 14.6,
		status: 'completed',
		startTime: getStaticTimestamp(-360),
		endTime: getStaticTimestamp(-240),
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(-330), ambient: 88.5, internal: 72.1, tankerTemp: 72.4, oilTemp: 72.2 },
			{ timestamp: getStaticTimestamp(-300), ambient: 92.8, internal: 74.6, tankerTemp: 74.9, oilTemp: 74.7 },
			{ timestamp: getStaticTimestamp(-270), ambient: 95.3, internal: 76.8, tankerTemp: 77.1, oilTemp: 76.9 },
			{ timestamp: getStaticTimestamp(-240), ambient: 89.2, internal: 75.4, tankerTemp: 75.7, oilTemp: 75.5 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(-360), netVolume: 8200.0, massFlowRate: 5.8, apiGravity: 41.2, waterCut: 0.5, oilTemp: 72.2, entrainedGas: 0.1 },
			{ timestamp: getStaticTimestamp(-240), netVolume: 8185.4, massFlowRate: 5.1, apiGravity: 41.2, waterCut: 0.5, oilTemp: 75.5, entrainedGas: 0.1 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(-300), tankerOnLoad: 158.7, tankerOffLoad: -9.8, tankerInternal: 17.3, tankVentLine: 1.9 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(-270), h2sExternal: 0.6, h2sInternal: 0.3, coExternal: 2.1, coInternal: 1.8, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.8 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(-300), tankLevel: 21.3, oilTemp: 74.7, flowRate: 5.8, systemPressure: 158.7, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(-270), pumpRpm: 1890, pumpTemp: 198.7, inverterVoltage: 482.1, inverterTemp: 148.9, motorTemp: 164.2, rectifierTemp: 145.6, generatorTemp: 171.3, totalPumpTime: 112 }
		],
		transitProgress: 100,
		estimatedTimeRemaining: 0
	},
	{
		id: 'haul-1735030000000',
		truckId: 'truck-3',
		driverId: 'driver-3',
		onloadSite: {
			id: 'site-5',
			name: 'Bakken North Station',
			location: { lat: 47.7511, lng: -101.7777 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-6',
			name: 'Midwest Refinery',
			location: { lat: 41.2524, lng: -95.9980 },
			type: 'offload'
		},
		initialVolume: 7890,
		finalVolume: 7878.2,
		expectedLoss: 13.4,
		actualLoss: 11.8,
		status: 'completed',
		startTime: getStaticTimestamp(-540),
		endTime: getStaticTimestamp(-420),
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(-510), ambient: 82.1, internal: 68.9, tankerTemp: 69.2, oilTemp: 69.0 },
			{ timestamp: getStaticTimestamp(-480), ambient: 86.4, internal: 71.3, tankerTemp: 71.6, oilTemp: 71.4 },
			{ timestamp: getStaticTimestamp(-450), ambient: 89.7, internal: 73.8, tankerTemp: 74.1, oilTemp: 73.9 },
			{ timestamp: getStaticTimestamp(-420), ambient: 84.3, internal: 72.5, tankerTemp: 72.8, oilTemp: 72.6 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(-540), netVolume: 7890.0, massFlowRate: 4.9, apiGravity: 38.8, waterCut: 1.1, oilTemp: 69.0, entrainedGas: 0.3 },
			{ timestamp: getStaticTimestamp(-420), netVolume: 7878.2, massFlowRate: 4.6, apiGravity: 38.8, waterCut: 1.1, oilTemp: 72.6, entrainedGas: 0.3 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(-480), tankerOnLoad: 142.9, tankerOffLoad: -11.4, tankerInternal: 15.8, tankVentLine: 2.2 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(-450), h2sExternal: 0.5, h2sInternal: 0.2, coExternal: 1.7, coInternal: 1.4, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.9 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(-480), tankLevel: 19.8, oilTemp: 71.4, flowRate: 4.9, systemPressure: 142.9, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(-450), pumpRpm: 1720, pumpTemp: 182.1, inverterVoltage: 477.8, inverterTemp: 140.7, motorTemp: 153.4, rectifierTemp: 136.2, generatorTemp: 159.8, totalPumpTime: 87 }
		],
		transitProgress: 100,
		estimatedTimeRemaining: 0
	},
	{
		id: 'haul-1735020000000',
		truckId: 'truck-1',
		driverId: 'driver-1',
		onloadSite: {
			id: 'site-2',
			name: 'Eagle Ford Loading',
			location: { lat: 28.8644, lng: -97.9222 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-7',
			name: 'Port Arthur Terminal',
			location: { lat: 29.8833, lng: -93.9300 },
			type: 'offload'
		},
		initialVolume: 7750,
		finalVolume: 7741.8,
		expectedLoss: 10.1,
		actualLoss: 8.2,
		status: 'completed',
		startTime: getStaticTimestamp(-720),
		endTime: getStaticTimestamp(-600),
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(-690), ambient: 91.3, internal: 75.2, tankerTemp: 75.5, oilTemp: 75.3 },
			{ timestamp: getStaticTimestamp(-660), ambient: 94.8, internal: 77.6, tankerTemp: 77.9, oilTemp: 77.7 },
			{ timestamp: getStaticTimestamp(-630), ambient: 97.2, internal: 79.1, tankerTemp: 79.4, oilTemp: 79.2 },
			{ timestamp: getStaticTimestamp(-600), ambient: 92.7, internal: 78.3, tankerTemp: 78.6, oilTemp: 78.4 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(-720), netVolume: 7750.0, massFlowRate: 5.3, apiGravity: 40.1, waterCut: 0.7, oilTemp: 75.3, entrainedGas: 0.2 },
			{ timestamp: getStaticTimestamp(-600), netVolume: 7741.8, massFlowRate: 4.9, apiGravity: 40.1, waterCut: 0.7, oilTemp: 78.4, entrainedGas: 0.2 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(-660), tankerOnLoad: 149.6, tankerOffLoad: -10.7, tankerInternal: 16.1, tankVentLine: 2.0 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(-630), h2sExternal: 0.3, h2sInternal: 0.1, coExternal: 1.8, coInternal: 1.5, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.8 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(-660), tankLevel: 20.2, oilTemp: 77.7, flowRate: 5.3, systemPressure: 149.6, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(-630), pumpRpm: 1780, pumpTemp: 189.3, inverterVoltage: 480.4, inverterTemp: 144.2, motorTemp: 158.7, rectifierTemp: 140.8, generatorTemp: 165.1, totalPumpTime: 102 }
		],
		transitProgress: 100,
		estimatedTimeRemaining: 0
	},
	{
		id: 'haul-1735010000000',
		truckId: 'truck-2',
		driverId: 'driver-2',
		onloadSite: {
			id: 'site-1',
			name: 'Permian Basin Terminal',
			location: { lat: 31.8457, lng: -102.3676 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-4',
			name: 'Corpus Christi Terminal',
			location: { lat: 27.8006, lng: -97.3964 },
			type: 'offload'
		},
		initialVolume: 8150,
		finalVolume: 8132.7,
		expectedLoss: 18.9,
		actualLoss: 17.3,
		status: 'completed',
		startTime: getStaticTimestamp(-900),
		endTime: getStaticTimestamp(-780),
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(-870), ambient: 87.9, internal: 71.4, tankerTemp: 71.7, oilTemp: 71.5 },
			{ timestamp: getStaticTimestamp(-840), ambient: 91.2, internal: 73.8, tankerTemp: 74.1, oilTemp: 73.9 },
			{ timestamp: getStaticTimestamp(-810), ambient: 94.6, internal: 76.2, tankerTemp: 76.5, oilTemp: 76.3 },
			{ timestamp: getStaticTimestamp(-780), ambient: 90.1, internal: 75.1, tankerTemp: 75.4, oilTemp: 75.2 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(-900), netVolume: 8150.0, massFlowRate: 5.7, apiGravity: 39.7, waterCut: 0.9, oilTemp: 71.5, entrainedGas: 0.1 },
			{ timestamp: getStaticTimestamp(-780), netVolume: 8132.7, massFlowRate: 5.2, apiGravity: 39.7, waterCut: 0.9, oilTemp: 75.2, entrainedGas: 0.1 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(-840), tankerOnLoad: 153.2, tankerOffLoad: -8.6, tankerInternal: 18.4, tankVentLine: 1.7 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(-810), h2sExternal: 0.7, h2sInternal: 0.4, coExternal: 2.2, coInternal: 1.9, lelExternal: 0.0, lelInternal: 0.0, o2External: 20.7 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(-840), tankLevel: 21.7, oilTemp: 73.9, flowRate: 5.7, systemPressure: 153.2, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(-810), pumpRpm: 1850, pumpTemp: 195.8, inverterVoltage: 481.9, inverterTemp: 147.6, motorTemp: 161.9, rectifierTemp: 143.4, generatorTemp: 168.7, totalPumpTime: 108 }
		],
		transitProgress: 100,
		estimatedTimeRemaining: 0
	},
	{
		id: 'haul-1735000000000',
		truckId: 'truck-3',
		driverId: 'driver-3',
		onloadSite: {
			id: 'site-5',
			name: 'Bakken North Station',
			location: { lat: 47.7511, lng: -101.7777 },
			type: 'onload'
		},
		offloadSite: {
			id: 'site-8',
			name: 'Chicago Terminal',
			location: { lat: 41.8781, lng: -87.6298 },
			type: 'offload'
		},
		initialVolume: 7920,
		finalVolume: 7905.6,
		expectedLoss: 15.7,
		actualLoss: 14.4,
		status: 'completed',
		startTime: getStaticTimestamp(-1080),
		endTime: getStaticTimestamp(-960),
		temperatureReadings: [
			{ timestamp: getStaticTimestamp(-1050), ambient: 79.8, internal: 66.2, tankerTemp: 66.5, oilTemp: 66.3 },
			{ timestamp: getStaticTimestamp(-1020), ambient: 83.1, internal: 68.7, tankerTemp: 69.0, oilTemp: 68.8 },
			{ timestamp: getStaticTimestamp(-990), ambient: 86.4, internal: 71.1, tankerTemp: 71.4, oilTemp: 71.2 },
			{ timestamp: getStaticTimestamp(-960), ambient: 81.9, internal: 69.8, tankerTemp: 70.1, oilTemp: 69.9 }
		],
		coriolisReadings: [
			{ timestamp: getStaticTimestamp(-1080), netVolume: 7920.0, massFlowRate: 4.8, apiGravity: 37.9, waterCut: 1.3, oilTemp: 66.3, entrainedGas: 0.4 },
			{ timestamp: getStaticTimestamp(-960), netVolume: 7905.6, massFlowRate: 4.4, apiGravity: 37.9, waterCut: 1.3, oilTemp: 69.9, entrainedGas: 0.4 }
		],
		pressureReadings: [
			{ timestamp: getStaticTimestamp(-1020), tankerOnLoad: 138.4, tankerOffLoad: -13.2, tankerInternal: 14.9, tankVentLine: 2.4 }
		],
		gasDetections: [
			{ timestamp: getStaticTimestamp(-990), h2sExternal: 0.4, h2sInternal: 0.2, coExternal: 1.6, coInternal: 1.3, lelExternal: 0.0, lelInternal: 0.0, o2External: 21.0 }
		],
		scadaReadings: [
			{ timestamp: getStaticTimestamp(-1020), tankLevel: 18.9, oilTemp: 68.8, flowRate: 4.8, systemPressure: 138.4, gasDetection: false }
		],
		dryDriveData: [
			{ timestamp: getStaticTimestamp(-990), pumpRpm: 1690, pumpTemp: 176.7, inverterVoltage: 475.3, inverterTemp: 138.1, motorTemp: 150.8, rectifierTemp: 133.7, generatorTemp: 156.4, totalPumpTime: 79 }
		],
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
	lastUpdate: getStaticTimestamp(),
	connectedDevices: 15,
	dataLatency: 1.2, // seconds
	networkHealth: 98.7, // percentage
	coriolisOnline: true,
	gasDetectorsOnline: true,
	pressureSensorsOnline: true,
	temperatureSensorsOnline: true,
	dryDriveOnline: true
});

// Initialize real-time updates only on client side
if (browser) {
	// Update timestamps to current time once hydrated
	setTimeout(() => {
		scadaStatus.update(status => ({
			...status,
			lastUpdate: new Date()
		}));
		
		// Update active hauls with current timestamps
		activeHauls.update(hauls => 
			hauls.map(haul => ({
				...haul,
				temperatureReadings: haul.temperatureReadings.map(reading => ({
					...reading,
					timestamp: new Date()
				})),
				coriolisReadings: haul.coriolisReadings.map(reading => ({
					...reading,
					timestamp: new Date()
				})),
				pressureReadings: haul.pressureReadings.map(reading => ({
					...reading,
					timestamp: new Date()
				})),
				gasDetections: haul.gasDetections.map(reading => ({
					...reading,
					timestamp: new Date()
				})),
				scadaReadings: haul.scadaReadings.map(reading => ({
					...reading,
					timestamp: new Date()
				})),
				dryDriveData: haul.dryDriveData.map(reading => ({
					...reading,
					timestamp: new Date()
				}))
			}))
		);
	}, 100); // Small delay to ensure hydration is complete
} 