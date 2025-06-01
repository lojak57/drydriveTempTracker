import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Demo Data Types
export interface DemoAlert {
	type: 'volume_loss' | 'temp_variance' | 'idle_time' | 'efficiency' | 'maintenance';
	severity: 'low' | 'medium' | 'high' | 'critical';
	summary: string;
	timestamp: Date;
}

export interface DemoHaulData {
	id: string;
	truckId: string;
	driverId: string;
	driverName: string;
	origin: string;
	destination: string;
	customer: string;
	onloadVolume: number;
	offloadVolume: number;
	volumeLoss: number;
	volumeLossPercent: number;
	avgTemp: number;
	minTemp: number;
	maxTemp: number;
	startTime: Date;
	endTime: Date | null;
	duration: number; // minutes
	distance: number; // miles
	efficiency: number;
	revenue: number;
	fuelCost: number;
	status: 'completed' | 'in-progress' | 'scheduled';
	alerts: DemoAlert[];
	apiGravity: number;
	waterCut: number;
	h2sLevels: number;
	pressureReadings: number[];
	tempReadings: number[];
	gpsTrail: { lat: number; lng: number; timestamp: Date }[];
}

export interface DemoTruckData {
	id: string;
	model: string;
	year: number;
	capacity: number;
	driverId: string;
	driverName: string;
	yardId: string;
	currentStatus: 'active' | 'loading' | 'transit' | 'maintenance' | 'available';
	todayHauls: number;
	weekHauls: number;
	efficiency: number;
	avgVolumeLoss: number;
	safetyScore: number;
	lastHaulTime: Date | null;
	nextScheduled: Date | null;
	alerts: DemoAlert[];
	mileage: number;
	fuelEfficiency: number;
	lastMaintenance: Date;
	nextMaintenance: Date;
}

export interface DemoYardData {
	id: string;
	name: string;
	location: string;
	region: string;
	totalTrucks: number;
	activeTrucks: number;
	todayHauls: number;
	weekHauls: number;
	efficiency: number;
	revenue: number;
	avgVolumeLoss: number;
	status: 'excellent' | 'good' | 'attention' | 'critical';
	loadingBays: number;
	activeBays: number;
	alerts: DemoAlert[];
}

export interface DemoFleetData {
	totalTrucks: number;
	totalDrivers: number;
	totalYards: number;
	totalHauls: number;
	todayHauls: number;
	weekHauls: number;
	monthHauls: number;
	efficiency: number;
	totalRevenue: number;
	monthlyRevenue: number;
	avgVolumeLoss: number;
	safetyScore: number;
	alerts: DemoAlert[];
}

export type DrillDownLevel = 'fleet' | 'yard' | 'truck' | 'haul';
export type ViewMode = 'analytics' | 'cards' | 'raw';

interface DispatchAnalyticsState {
	// Drill-down state
	currentLevel: DrillDownLevel;
	selectedYard: string | null;
	selectedTruck: string | null;
	selectedHaul: string | null;
	
	// View preferences
	viewMode: ViewMode;
	timeframe: 'today' | 'week' | 'month' | 'quarter';
	
	// Demo mode
	demoMode: boolean;
	simulatedUpdates: boolean;
	lastUpdate: Date;
	autoAdvance: boolean;
	
	// Demo data
	demoFleet: DemoFleetData;
	demoYards: DemoYardData[];
	demoTrucks: DemoTruckData[];
	demoHauls: DemoHaulData[];
}

// Demo Seed Data
const DEMO_FLEET: DemoFleetData = {
	totalTrucks: 247,
	totalDrivers: 312,
	totalYards: 6,
	totalHauls: 1247,
	todayHauls: 89,
	weekHauls: 634,
	monthHauls: 2847,
	efficiency: 89.3,
	totalRevenue: 28470000,
	monthlyRevenue: 4200000,
	avgVolumeLoss: 2.1,
	safetyScore: 96.8,
	alerts: [
		{
			type: 'efficiency',
			severity: 'medium',
			summary: 'Fleet efficiency 3.2% below target',
			timestamp: new Date(Date.now() - 1800000)
		}
	]
};

const DEMO_YARDS: DemoYardData[] = [
	{
		id: 'permian-basin',
		name: 'Permian Basin',
		location: 'Midland, TX',
		region: 'West Texas',
		totalTrucks: 41,
		activeTrucks: 38,
		todayHauls: 23,
		weekHauls: 167,
		efficiency: 91.2,
		revenue: 847000,
		avgVolumeLoss: 1.8,
		status: 'attention',
		loadingBays: 6,
		activeBays: 4,
		alerts: [
			{
				type: 'efficiency',
				severity: 'medium',
				summary: 'Truck T-205 underperforming',
				timestamp: new Date(Date.now() - 3600000)
			}
		]
	},
	{
		id: 'eagle-ford',
		name: 'Eagle Ford',
		location: 'San Antonio, TX',
		region: 'South Texas',
		totalTrucks: 38,
		activeTrucks: 35,
		todayHauls: 21,
		weekHauls: 152,
		efficiency: 94.7,
		revenue: 723000,
		avgVolumeLoss: 1.6,
		status: 'excellent',
		loadingBays: 5,
		activeBays: 3,
		alerts: []
	}
];

const DEMO_TRUCKS: DemoTruckData[] = [
	// Permian Basin Trucks
	{
		id: 'T-205',
		model: 'Peterbilt 579',
		year: 2021,
		capacity: 130,
		driverId: 'D-147',
		driverName: 'Mike Johnson',
		yardId: 'permian-basin',
		currentStatus: 'active',
		todayHauls: 2,
		weekHauls: 12,
		efficiency: 76.2, // Problem truck
		avgVolumeLoss: 4.1,
		safetyScore: 89.3,
		lastHaulTime: new Date(Date.now() - 7200000),
		nextScheduled: new Date(Date.now() + 3600000),
		alerts: [
			{
				type: 'volume_loss',
				severity: 'high',
				summary: '4.8% loss on last haul - above threshold',
				timestamp: new Date(Date.now() - 7200000)
			},
			{
				type: 'temp_variance',
				severity: 'medium',
				summary: 'Excessive temperature variance detected',
				timestamp: new Date(Date.now() - 7200000)
			}
		],
		mileage: 87432,
		fuelEfficiency: 6.2,
		lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
	},
	{
		id: 'T-212',
		model: 'Kenworth T680',
		year: 2022,
		capacity: 130,
		driverId: 'D-189',
		driverName: 'Sarah Davis',
		yardId: 'permian-basin',
		currentStatus: 'transit',
		todayHauls: 3,
		weekHauls: 18,
		efficiency: 98.7, // Top performer
		avgVolumeLoss: 1.2,
		safetyScore: 99.1,
		lastHaulTime: new Date(Date.now() - 1800000),
		nextScheduled: new Date(Date.now() + 5400000),
		alerts: [],
		mileage: 45231,
		fuelEfficiency: 7.8,
		lastMaintenance: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000)
	},
	{
		id: 'T-198',
		model: 'Freightliner Cascadia',
		year: 2020,
		capacity: 130,
		driverId: 'D-203',
		driverName: 'Tom Wilson',
		yardId: 'permian-basin',
		currentStatus: 'loading',
		todayHauls: 2,
		weekHauls: 15,
		efficiency: 92.4,
		avgVolumeLoss: 2.0,
		safetyScore: 95.7,
		lastHaulTime: new Date(Date.now() - 14400000),
		nextScheduled: new Date(Date.now() + 900000),
		alerts: [],
		mileage: 112847,
		fuelEfficiency: 6.9,
		lastMaintenance: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
	},
	// Eagle Ford Trucks (Top Performers)
	{
		id: 'T-301',
		model: 'Peterbilt 579',
		year: 2023,
		capacity: 130,
		driverId: 'D-267',
		driverName: 'Carlos Rodriguez',
		yardId: 'eagle-ford',
		currentStatus: 'active',
		todayHauls: 3,
		weekHauls: 19,
		efficiency: 96.8,
		avgVolumeLoss: 1.4,
		safetyScore: 98.2,
		lastHaulTime: new Date(Date.now() - 3600000),
		nextScheduled: new Date(Date.now() + 7200000),
		alerts: [],
		mileage: 23451,
		fuelEfficiency: 7.6,
		lastMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
	},
	{
		id: 'T-318',
		model: 'Kenworth T680',
		year: 2023,
		capacity: 130,
		driverId: 'D-291',
		driverName: 'Jennifer Kim',
		yardId: 'eagle-ford',
		currentStatus: 'available',
		todayHauls: 2,
		weekHauls: 16,
		efficiency: 95.3,
		avgVolumeLoss: 1.6,
		safetyScore: 97.9,
		lastHaulTime: new Date(Date.now() - 10800000),
		nextScheduled: new Date(Date.now() + 1800000),
		alerts: [],
		mileage: 18732,
		fuelEfficiency: 7.4,
		lastMaintenance: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
	},
	{
		id: 'T-334',
		model: 'Volvo VNL',
		year: 2022,
		capacity: 130,
		driverId: 'D-315',
		driverName: 'David Chen',
		yardId: 'eagle-ford',
		currentStatus: 'maintenance',
		todayHauls: 0,
		weekHauls: 14,
		efficiency: 93.1,
		avgVolumeLoss: 1.9,
		safetyScore: 96.4,
		lastHaulTime: new Date(Date.now() - 86400000),
		nextScheduled: new Date(Date.now() + 21600000),
		alerts: [
			{
				type: 'maintenance',
				severity: 'low',
				summary: 'Scheduled maintenance in progress',
				timestamp: new Date(Date.now() - 3600000)
			}
		],
		mileage: 67234,
		fuelEfficiency: 6.8,
		lastMaintenance: new Date(),
		nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
	}
];

const DEMO_HAULS: DemoHaulData[] = [
	// The "Problem Haul" - T-205's smoking gun
	{
		id: 'HL-001547',
		truckId: 'T-205',
		driverId: 'D-147',
		driverName: 'Mike Johnson',
		origin: 'Permian Basin Site A',
		destination: 'Houston Refinery Terminal',
		customer: 'ExxonMobil',
		onloadVolume: 27845.6,
		offloadVolume: 26510.3,
		volumeLoss: 1335.3,
		volumeLossPercent: 4.8,
		avgTemp: 102.3,
		minTemp: 68.1, // The smoking gun
		maxTemp: 118.7,
		startTime: new Date(Date.now() - 7200000),
		endTime: new Date(Date.now() - 1800000),
		duration: 270,
		distance: 347,
		efficiency: 76.2,
		revenue: 485.50,
		fuelCost: 142.30,
		status: 'completed',
		alerts: [
			{
				type: 'volume_loss',
				severity: 'high',
				summary: '4.8% loss - above 3% threshold',
				timestamp: new Date(Date.now() - 1800000)
			},
			{
				type: 'temp_variance',
				severity: 'medium',
				summary: 'Excessive cooling detected - 50°F drop',
				timestamp: new Date(Date.now() - 5400000)
			}
		],
		apiGravity: 38.5,
		waterCut: 0.8,
		h2sLevels: 0.6,
		pressureReadings: [145, 147, 149, 146, 144, 142],
		tempReadings: [102, 98, 89, 78, 71, 68, 69, 71, 74, 78],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 7200000) },
			{ lat: 30.2672, lng: -97.7431, timestamp: new Date(Date.now() - 5400000) },
			{ lat: 29.7604, lng: -95.3698, timestamp: new Date(Date.now() - 1800000) }
		]
	},
	// Perfect haul - T-212's excellence
	{
		id: 'HL-001612',
		truckId: 'T-212',
		driverId: 'D-189',
		driverName: 'Sarah Davis',
		origin: 'Permian Basin Site B',
		destination: 'Corpus Christi Terminal',
		customer: 'Chevron',
		onloadVolume: 28156.2,
		offloadVolume: 27823.7,
		volumeLoss: 332.5,
		volumeLossPercent: 1.2,
		avgTemp: 89.4,
		minTemp: 85.2,
		maxTemp: 94.1,
		startTime: new Date(Date.now() - 21600000),
		endTime: new Date(Date.now() - 14400000),
		duration: 240,
		distance: 312,
		efficiency: 98.7,
		revenue: 525.75,
		fuelCost: 138.20,
		status: 'completed',
		alerts: [],
		apiGravity: 42.1,
		waterCut: 0.3,
		h2sLevels: 0.2,
		pressureReadings: [152, 153, 154, 153, 152, 151],
		tempReadings: [89, 88, 87, 86, 85, 86, 87, 89, 91, 94],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 21600000) },
			{ lat: 28.3949, lng: -96.3903, timestamp: new Date(Date.now() - 18000000) },
			{ lat: 27.8006, lng: -97.3964, timestamp: new Date(Date.now() - 14400000) }
		]
	},
	// More demo hauls for context...
	{
		id: 'HL-001634',
		truckId: 'T-198',
		driverId: 'D-203',
		driverName: 'Tom Wilson',
		origin: 'Permian Basin Site C',
		destination: 'Beaumont Refinery',
		customer: 'Shell',
		onloadVolume: 27934.1,
		offloadVolume: 27389.6,
		volumeLoss: 544.5,
		volumeLossPercent: 1.9,
		avgTemp: 91.7,
		minTemp: 87.3,
		maxTemp: 97.2,
		startTime: new Date(Date.now() - 14400000),
		endTime: new Date(Date.now() - 7200000),
		duration: 285,
		distance: 389,
		efficiency: 92.4,
		revenue: 467.80,
		fuelCost: 156.40,
		status: 'completed',
		alerts: [],
		apiGravity: 39.8,
		waterCut: 0.6,
		h2sLevels: 0.4,
		pressureReadings: [148, 149, 150, 149, 147, 146],
		tempReadings: [92, 91, 90, 89, 88, 87, 89, 92, 95, 97],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 14400000) },
			{ lat: 30.0668, lng: -94.1265, timestamp: new Date(Date.now() - 10800000) },
			{ lat: 30.0860, lng: -94.1018, timestamp: new Date(Date.now() - 7200000) }
		]
	}
];

// Create the store
function createDispatchAnalyticsStore() {
	const initialState: DispatchAnalyticsState = {
		currentLevel: 'fleet',
		selectedYard: null,
		selectedTruck: null,
		selectedHaul: null,
		viewMode: 'analytics',
		timeframe: 'today',
		demoMode: true,
		simulatedUpdates: true,
		lastUpdate: new Date(),
		autoAdvance: false,
		demoFleet: DEMO_FLEET,
		demoYards: DEMO_YARDS,
		demoTrucks: DEMO_TRUCKS,
		demoHauls: DEMO_HAULS
	};

	const { subscribe, set, update } = writable(initialState);

	return {
		subscribe,
		set,
		update,
		
		// Drill-down actions
		drillDown: (level: DrillDownLevel, id: string) => {
			update(state => {
				const newState = { ...state };
				
				switch (level) {
					case 'yard':
						newState.currentLevel = 'yard';
						newState.selectedYard = id;
						newState.selectedTruck = null;
						newState.selectedHaul = null;
						break;
					case 'truck':
						newState.currentLevel = 'truck';
						newState.selectedTruck = id;
						newState.selectedHaul = null;
						break;
					case 'haul':
						newState.currentLevel = 'haul';
						newState.selectedHaul = id;
						break;
				}
				
				return newState;
			});
		},
		
		drillUp: () => {
			update(state => {
				const newState = { ...state };
				
				switch (state.currentLevel) {
					case 'haul':
						newState.currentLevel = 'truck';
						newState.selectedHaul = null;
						break;
					case 'truck':
						newState.currentLevel = 'yard';
						newState.selectedTruck = null;
						newState.selectedHaul = null;
						break;
					case 'yard':
						newState.currentLevel = 'fleet';
						newState.selectedYard = null;
						newState.selectedTruck = null;
						newState.selectedHaul = null;
						break;
				}
				
				return newState;
			});
		},
		
		resetToFleet: () => {
			update(state => ({
				...state,
				currentLevel: 'fleet',
				selectedYard: null,
				selectedTruck: null,
				selectedHaul: null
			}));
		},
		
		setViewMode: (mode: ViewMode) => {
			update(state => ({ ...state, viewMode: mode }));
		},
		
		setTimeframe: (timeframe: 'today' | 'week' | 'month' | 'quarter') => {
			update(state => ({ ...state, timeframe }));
		},
		
		toggleDemoMode: () => {
			update(state => ({ ...state, demoMode: !state.demoMode }));
		},
		
		toggleSimulatedUpdates: () => {
			update(state => ({ ...state, simulatedUpdates: !state.simulatedUpdates }));
		},
		
		updateLastRefresh: () => {
			update(state => ({ ...state, lastUpdate: new Date() }));
		}
	};
}

export const dispatchAnalytics = createDispatchAnalyticsStore();

// Derived stores for easier access
export const currentLevel = derived(dispatchAnalytics, $state => $state.currentLevel);
export const selectedYard = derived(dispatchAnalytics, $state => $state.selectedYard);
export const selectedTruck = derived(dispatchAnalytics, $state => $state.selectedTruck);
export const selectedHaul = derived(dispatchAnalytics, $state => $state.selectedHaul);
export const viewMode = derived(dispatchAnalytics, $state => $state.viewMode);
export const demoMode = derived(dispatchAnalytics, $state => $state.demoMode);

// Computed data stores
export const currentYardData = derived(
	[dispatchAnalytics, selectedYard],
	([$state, $selectedYard]) => {
		if (!$selectedYard) return null;
		return $state.demoYards.find(yard => yard.id === $selectedYard) || null;
	}
);

export const currentTruckData = derived(
	[dispatchAnalytics, selectedTruck],
	([$state, $selectedTruck]) => {
		if (!$selectedTruck) return null;
		return $state.demoTrucks.find(truck => truck.id === $selectedTruck) || null;
	}
);

export const currentHaulData = derived(
	[dispatchAnalytics, selectedHaul],
	([$state, $selectedHaul]) => {
		if (!$selectedHaul) return null;
		return $state.demoHauls.find(haul => haul.id === $selectedHaul) || null;
	}
);

export const yardsForCurrentLevel = derived(
	dispatchAnalytics,
	$state => $state.demoYards
);

export const trucksForCurrentYard = derived(
	[dispatchAnalytics, selectedYard],
	([$state, $selectedYard]) => {
		if (!$selectedYard) return [];
		return $state.demoTrucks.filter(truck => truck.yardId === $selectedYard);
	}
);

export const haulsForCurrentTruck = derived(
	[dispatchAnalytics, selectedTruck],
	([$state, $selectedTruck]) => {
		if (!$selectedTruck) return [];
		return $state.demoHauls.filter(haul => haul.truckId === $selectedTruck);
	}
);

// Demo simulation
if (browser) {
	let updateInterval: number;
	
	dispatchAnalytics.subscribe(state => {
		if (state.simulatedUpdates && state.demoMode) {
			if (updateInterval) clearInterval(updateInterval);
			
			updateInterval = setInterval(() => {
				dispatchAnalytics.updateLastRefresh();
			}, 30000); // Update every 30 seconds
		} else {
			if (updateInterval) clearInterval(updateInterval);
		}
	});
} 