import { writable, derived } from 'svelte/store';

export interface TemperatureReading {
	timestamp: Date;
	ambient: number;
	internal: number;
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
			{ timestamp: new Date(), ambient: 98.2, internal: 76.1 }
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
			{ timestamp: new Date(), ambient: 92.4, internal: 74.3 }
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
			{ timestamp: new Date(), ambient: 89.1, internal: 78.9 }
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
export const scadaStatus = writable({
	systemOnline: true,
	lastUpdate: new Date(),
	connectedDevices: 3,
	dataLatency: 1.2, // seconds
	networkHealth: 98.7 // percentage
}); 