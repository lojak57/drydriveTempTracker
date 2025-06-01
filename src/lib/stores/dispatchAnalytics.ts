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
		id: 'qrvwx',
		name: 'QRVWX',
		location: 'LAT: 28.970028, LONG: -98.235694',
		region: 'South Texas',
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
		id: 'carmody',
		name: 'Carmody',
		location: 'LAT: 28.84805, LONG: -97.98977',
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
	// QRVWX Trucks
	{
		id: 'T-205',
		model: 'Peterbilt 579',
		year: 2021,
		capacity: 130,
		driverId: 'D-147',
		driverName: 'Mike Johnson',
		yardId: 'qrvwx',
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
		yardId: 'qrvwx',
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
		yardId: 'qrvwx',
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
	{
		id: 'T-156',
		model: 'Volvo VNL',
		year: 2023,
		capacity: 130,
		driverId: 'D-224',
		driverName: 'Jake Martinez',
		yardId: 'qrvwx',
		currentStatus: 'active',
		todayHauls: 2,
		weekHauls: 14,
		efficiency: 94.1,
		avgVolumeLoss: 1.7,
		safetyScore: 97.2,
		lastHaulTime: new Date(Date.now() - 10800000),
		nextScheduled: new Date(Date.now() + 7200000),
		alerts: [],
		mileage: 28734,
		fuelEfficiency: 7.3,
		lastMaintenance: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
	},
	{
		id: 'T-187',
		model: 'Mack Anthem',
		year: 2022,
		capacity: 130,
		driverId: 'D-245',
		driverName: 'Robert Lee',
		yardId: 'qrvwx',
		currentStatus: 'available',
		todayHauls: 1,
		weekHauls: 11,
		efficiency: 88.9,
		avgVolumeLoss: 2.4,
		safetyScore: 94.8,
		lastHaulTime: new Date(Date.now() - 25200000),
		nextScheduled: new Date(Date.now() + 1800000),
		alerts: [],
		mileage: 63421,
		fuelEfficiency: 6.5,
		lastMaintenance: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
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
	},
	{
		id: 'T-342',
		model: 'Freightliner Cascadia',
		year: 2023,
		capacity: 130,
		driverId: 'D-331',
		driverName: 'Maria Gonzalez',
		yardId: 'eagle-ford',
		currentStatus: 'transit',
		todayHauls: 2,
		weekHauls: 17,
		efficiency: 97.1,
		avgVolumeLoss: 1.3,
		safetyScore: 98.5,
		lastHaulTime: new Date(Date.now() - 5400000),
		nextScheduled: new Date(Date.now() + 9000000),
		alerts: [],
		mileage: 15632,
		fuelEfficiency: 7.7,
		lastMaintenance: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000)
	},
	{
		id: 'T-358',
		model: 'Peterbilt 389',
		year: 2021,
		capacity: 130,
		driverId: 'D-352',
		driverName: 'Tony Rivera',
		yardId: 'eagle-ford',
		currentStatus: 'loading',
		todayHauls: 1,
		weekHauls: 13,
		efficiency: 91.7,
		avgVolumeLoss: 2.1,
		safetyScore: 95.9,
		lastHaulTime: new Date(Date.now() - 18000000),
		nextScheduled: new Date(Date.now() + 3600000),
		alerts: [],
		mileage: 78924,
		fuelEfficiency: 6.7,
		lastMaintenance: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
		nextMaintenance: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000)
	}
];

const DEMO_HAULS: DemoHaulData[] = [
	// The "Problem Haul" - T-205's smoking gun
	{
		id: 'HL-001547',
		truckId: 'T-205',
		driverId: 'D-147',
		driverName: 'Mike Johnson',
		origin: 'QRVWX',
		destination: 'Falls City Harvest Pipeline',
		customer: 'Devon Energy',
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
			{ lat: 28.970028, lng: -98.235694, timestamp: new Date(Date.now() - 7200000) },
			{ lat: 28.99683, lng: -98.03021, timestamp: new Date(Date.now() - 5400000) },
			{ lat: 28.99683, lng: -98.03021, timestamp: new Date(Date.now() - 1800000) }
		]
	},
	// Perfect haul - T-212's excellence
	{
		id: 'HL-001612',
		truckId: 'T-212',
		driverId: 'D-189',
		driverName: 'Sarah Davis',
		origin: 'QRVWX',
		destination: 'Sugarhorn Marathon Facility',
		customer: 'Shell Energy',
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
			{ lat: 28.970028, lng: -98.235694, timestamp: new Date(Date.now() - 21600000) },
			{ lat: 28.84889, lng: -97.99120, timestamp: new Date(Date.now() - 18000000) },
			{ lat: 28.84889, lng: -97.99120, timestamp: new Date(Date.now() - 14400000) }
		]
	},
	// More demo hauls for context...
	{
		id: 'HL-001634',
		truckId: 'T-198',
		driverId: 'D-203',
		driverName: 'Tom Wilson',
		origin: 'QRVWX',
		destination: 'Linhart',
		customer: 'Shell Energy',
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
			{ lat: 28.970028, lng: -98.235694, timestamp: new Date(Date.now() - 14400000) },
			{ lat: 28.93972, lng: -97.86080, timestamp: new Date(Date.now() - 10800000) },
			{ lat: 28.93972, lng: -97.86080, timestamp: new Date(Date.now() - 7200000) }
		]
	},
	// Carmody hauls - excellent performance
	{
		id: 'HL-001645',
		truckId: 'T-301',
		driverId: 'D-267',
		driverName: 'Carlos Rodriguez',
		origin: 'Carmody',
		destination: 'Sugarhorn Marathon Facility',
		customer: 'Devon Energy',
		onloadVolume: 28234.7,
		offloadVolume: 27889.2,
		volumeLoss: 345.5,
		volumeLossPercent: 1.2,
		avgTemp: 88.6,
		minTemp: 84.7,
		maxTemp: 93.1,
		startTime: new Date(Date.now() - 18000000),
		endTime: new Date(Date.now() - 10800000),
		duration: 225,
		distance: 287,
		efficiency: 96.8,
		revenue: 512.40,
		fuelCost: 126.80,
		status: 'completed',
		alerts: [],
		apiGravity: 41.2,
		waterCut: 0.4,
		h2sLevels: 0.3,
		pressureReadings: [151, 152, 153, 152, 151, 150],
		tempReadings: [89, 88, 87, 85, 84, 85, 87, 90, 92, 93],
		gpsTrail: [
			{ lat: 28.84805, lng: -97.98977, timestamp: new Date(Date.now() - 18000000) },
			{ lat: 28.84889, lng: -97.99120, timestamp: new Date(Date.now() - 14400000) },
			{ lat: 28.84889, lng: -97.99120, timestamp: new Date(Date.now() - 10800000) }
		]
	},
	{
		id: 'HL-001656',
		truckId: 'T-318',
		driverId: 'D-291',
		driverName: 'Jennifer Kim',
		origin: 'Carmody',
		destination: 'Falls City Harvest Pipeline',
		customer: 'Devon Energy',
		onloadVolume: 27987.3,
		offloadVolume: 27612.8,
		volumeLoss: 374.5,
		volumeLossPercent: 1.3,
		avgTemp: 90.2,
		minTemp: 86.4,
		maxTemp: 95.7,
		startTime: new Date(Date.now() - 25200000),
		endTime: new Date(Date.now() - 18000000),
		duration: 255,
		distance: 342,
		efficiency: 95.3,
		revenue: 498.60,
		fuelCost: 145.30,
		status: 'completed',
		alerts: [],
		apiGravity: 40.7,
		waterCut: 0.5,
		h2sLevels: 0.4,
		pressureReadings: [149, 150, 151, 150, 149, 148],
		tempReadings: [90, 89, 88, 87, 86, 87, 89, 92, 94, 96],
		gpsTrail: [
			{ lat: 28.84805, lng: -97.98977, timestamp: new Date(Date.now() - 25200000) },
			{ lat: 28.99683, lng: -98.03021, timestamp: new Date(Date.now() - 21600000) },
			{ lat: 28.99683, lng: -98.03021, timestamp: new Date(Date.now() - 18000000) }
		]
	},
	{
		id: 'HL-001667',
		truckId: 'T-342',
		driverId: 'D-331',
		driverName: 'Maria Gonzalez',
		origin: 'Carmody',
		destination: 'Falls City Harvest Pipeline',
		customer: 'Devon Energy',
		onloadVolume: 28098.4,
		offloadVolume: 27734.1,
		volumeLoss: 364.3,
		volumeLossPercent: 1.3,
		avgTemp: 87.9,
		minTemp: 83.2,
		maxTemp: 92.8,
		startTime: new Date(Date.now() - 32400000),
		endTime: new Date(Date.now() - 25200000),
		duration: 240,
		distance: 298,
		efficiency: 97.1,
		revenue: 523.70,
		fuelCost: 133.90,
		status: 'completed',
		alerts: [],
		apiGravity: 42.8,
		waterCut: 0.2,
		h2sLevels: 0.1,
		pressureReadings: [153, 154, 155, 154, 153, 152],
		tempReadings: [88, 87, 86, 84, 83, 84, 86, 89, 91, 93],
		gpsTrail: [
			{ lat: 28.84805, lng: -97.98977, timestamp: new Date(Date.now() - 32400000) },
			{ lat: 28.99683, lng: -98.03021, timestamp: new Date(Date.now() - 28800000) },
			{ lat: 28.99683, lng: -98.03021, timestamp: new Date(Date.now() - 25200000) }
		]
	},
	// More Permian Basin hauls
	{
		id: 'HL-001678',
		truckId: 'T-156',
		driverId: 'D-224',
		driverName: 'Jake Martinez',
		origin: 'Permian Basin Site D',
		destination: 'Baytown Refinery',
		customer: 'ExxonMobil',
		onloadVolume: 27756.2,
		offloadVolume: 27289.7,
		volumeLoss: 466.5,
		volumeLossPercent: 1.7,
		avgTemp: 93.4,
		minTemp: 89.1,
		maxTemp: 98.6,
		startTime: new Date(Date.now() - 39600000),
		endTime: new Date(Date.now() - 32400000),
		duration: 265,
		distance: 356,
		efficiency: 94.1,
		revenue: 478.30,
		fuelCost: 151.20,
		status: 'completed',
		alerts: [],
		apiGravity: 39.3,
		waterCut: 0.7,
		h2sLevels: 0.5,
		pressureReadings: [147, 148, 149, 148, 147, 146],
		tempReadings: [93, 92, 91, 90, 89, 90, 92, 95, 97, 99],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 39600000) },
			{ lat: 29.7355, lng: -95.2691, timestamp: new Date(Date.now() - 36000000) },
			{ lat: 29.7355, lng: -95.2691, timestamp: new Date(Date.now() - 32400000) }
		]
	},
	{
		id: 'HL-001689',
		truckId: 'T-187',
		driverId: 'D-245',
		driverName: 'Robert Lee',
		origin: 'Permian Basin Site E',
		destination: 'Texas City Terminal',
		customer: 'Marathon',
		onloadVolume: 28021.8,
		offloadVolume: 27349.4,
		volumeLoss: 672.4,
		volumeLossPercent: 2.4,
		avgTemp: 95.7,
		minTemp: 91.3,
		maxTemp: 101.2,
		startTime: new Date(Date.now() - 46800000),
		endTime: new Date(Date.now() - 39600000),
		duration: 290,
		distance: 374,
		efficiency: 88.9,
		revenue: 456.80,
		fuelCost: 163.50,
		status: 'completed',
		alerts: [
			{
				type: 'volume_loss',
				severity: 'medium',
				summary: '2.4% loss - approaching threshold',
				timestamp: new Date(Date.now() - 39600000)
			}
		],
		apiGravity: 38.9,
		waterCut: 0.9,
		h2sLevels: 0.7,
		pressureReadings: [146, 147, 148, 147, 146, 145],
		tempReadings: [96, 95, 94, 92, 91, 92, 94, 97, 99, 101],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 46800000) },
			{ lat: 29.3738, lng: -94.9077, timestamp: new Date(Date.now() - 43200000) },
			{ lat: 29.3738, lng: -94.9077, timestamp: new Date(Date.now() - 39600000) }
		]
	},
	// More Eagle Ford hauls
	{
		id: 'HL-001690',
		truckId: 'T-358',
		driverId: 'D-352',
		driverName: 'Tony Rivera',
		origin: 'Eagle Ford Site D',
		destination: 'Freeport Terminal',
		customer: 'BASF',
		onloadVolume: 27834.6,
		offloadVolume: 27249.8,
		volumeLoss: 584.8,
		volumeLossPercent: 2.1,
		avgTemp: 92.1,
		minTemp: 87.8,
		maxTemp: 97.4,
		startTime: new Date(Date.now() - 54000000),
		endTime: new Date(Date.now() - 46800000),
		duration: 275,
		distance: 331,
		efficiency: 91.7,
		revenue: 489.70,
		fuelCost: 148.60,
		status: 'completed',
		alerts: [],
		apiGravity: 40.1,
		waterCut: 0.6,
		h2sLevels: 0.4,
		pressureReadings: [148, 149, 150, 149, 148, 147],
		tempReadings: [92, 91, 90, 88, 87, 88, 90, 93, 96, 97],
		gpsTrail: [
			{ lat: 28.9384, lng: -97.9222, timestamp: new Date(Date.now() - 54000000) },
			{ lat: 28.9544, lng: -95.3593, timestamp: new Date(Date.now() - 50400000) },
			{ lat: 28.9544, lng: -95.3593, timestamp: new Date(Date.now() - 46800000) }
		]
	},
	// Additional recent hauls for more data
	{
		id: 'HL-001701',
		truckId: 'T-212',
		driverId: 'D-189',
		driverName: 'Sarah Davis',
		origin: 'Permian Basin Site F',
		destination: 'Pasadena Terminal',
		customer: 'Chevron',
		onloadVolume: 28187.9,
		offloadVolume: 27854.3,
		volumeLoss: 333.6,
		volumeLossPercent: 1.2,
		avgTemp: 88.7,
		minTemp: 84.9,
		maxTemp: 93.2,
		startTime: new Date(Date.now() - 61200000),
		endTime: new Date(Date.now() - 54000000),
		duration: 245,
		distance: 318,
		efficiency: 98.4,
		revenue: 531.20,
		fuelCost: 142.70,
		status: 'completed',
		alerts: [],
		apiGravity: 41.8,
		waterCut: 0.3,
		h2sLevels: 0.2,
		pressureReadings: [152, 153, 154, 153, 152, 151],
		tempReadings: [89, 88, 87, 85, 84, 85, 87, 90, 92, 93],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 61200000) },
			{ lat: 29.6911, lng: -95.2091, timestamp: new Date(Date.now() - 57600000) },
			{ lat: 29.6911, lng: -95.2091, timestamp: new Date(Date.now() - 54000000) }
		]
	},
	{
		id: 'HL-001712',
		truckId: 'T-301',
		driverId: 'D-267',
		driverName: 'Carlos Rodriguez',
		origin: 'Eagle Ford Site E',
		destination: 'Deer Park Refinery',
		customer: 'Shell',
		onloadVolume: 28056.1,
		offloadVolume: 27698.4,
		volumeLoss: 357.7,
		volumeLossPercent: 1.3,
		avgTemp: 89.3,
		minTemp: 85.6,
		maxTemp: 94.1,
		startTime: new Date(Date.now() - 68400000),
		endTime: new Date(Date.now() - 61200000),
		duration: 235,
		distance: 295,
		efficiency: 96.9,
		revenue: 518.40,
		fuelCost: 136.50,
		status: 'completed',
		alerts: [],
		apiGravity: 42.3,
		waterCut: 0.4,
		h2sLevels: 0.3,
		pressureReadings: [151, 152, 153, 152, 151, 150],
		tempReadings: [89, 88, 87, 86, 85, 86, 88, 91, 93, 94],
		gpsTrail: [
			{ lat: 28.9384, lng: -97.9222, timestamp: new Date(Date.now() - 68400000) },
			{ lat: 29.7030, lng: -95.1269, timestamp: new Date(Date.now() - 64800000) },
			{ lat: 29.7030, lng: -95.1269, timestamp: new Date(Date.now() - 61200000) }
		]
	},
	// More diverse hauls for testing
	{
		id: 'HL-001723',
		truckId: 'T-198',
		driverId: 'D-203',
		driverName: 'Tom Wilson',
		origin: 'Permian Basin Site G',
		destination: 'La Porte Terminal',
		customer: 'Valero',
		onloadVolume: 27923.5,
		offloadVolume: 27456.2,
		volumeLoss: 467.3,
		volumeLossPercent: 1.7,
		avgTemp: 91.8,
		minTemp: 87.4,
		maxTemp: 96.9,
		startTime: new Date(Date.now() - 75600000),
		endTime: new Date(Date.now() - 68400000),
		duration: 260,
		distance: 343,
		efficiency: 92.8,
		revenue: 476.90,
		fuelCost: 154.20,
		status: 'completed',
		alerts: [],
		apiGravity: 39.6,
		waterCut: 0.6,
		h2sLevels: 0.4,
		pressureReadings: [148, 149, 150, 149, 148, 147],
		tempReadings: [92, 91, 90, 88, 87, 88, 90, 93, 95, 97],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 75600000) },
			{ lat: 29.6602, lng: -95.0802, timestamp: new Date(Date.now() - 72000000) },
			{ lat: 29.6602, lng: -95.0802, timestamp: new Date(Date.now() - 68400000) }
		]
	},
	{
		id: 'HL-001734',
		truckId: 'T-318',
		driverId: 'D-291',
		driverName: 'Jennifer Kim',
		origin: 'Eagle Ford Site F',
		destination: 'Channelview Terminal',
		customer: 'LyondellBasell',
		onloadVolume: 28145.7,
		offloadVolume: 27789.3,
		volumeLoss: 356.4,
		volumeLossPercent: 1.3,
		avgTemp: 88.9,
		minTemp: 84.7,
		maxTemp: 93.8,
		startTime: new Date(Date.now() - 82800000),
		endTime: new Date(Date.now() - 75600000),
		duration: 250,
		distance: 308,
		efficiency: 95.7,
		revenue: 524.80,
		fuelCost: 141.30,
		status: 'completed',
		alerts: [],
		apiGravity: 41.7,
		waterCut: 0.4,
		h2sLevels: 0.3,
		pressureReadings: [150, 151, 152, 151, 150, 149],
		tempReadings: [89, 88, 87, 85, 84, 85, 87, 90, 92, 94],
		gpsTrail: [
			{ lat: 28.9384, lng: -97.9222, timestamp: new Date(Date.now() - 82800000) },
			{ lat: 29.7752, lng: -95.1357, timestamp: new Date(Date.now() - 79200000) },
			{ lat: 29.7752, lng: -95.1357, timestamp: new Date(Date.now() - 75600000) }
		]
	},
	// Current day hauls (in progress and scheduled)
	{
		id: 'HL-001745',
		truckId: 'T-156',
		driverId: 'D-224',
		driverName: 'Jake Martinez',
		origin: 'Permian Basin Site H',
		destination: 'Mont Belvieu Terminal',
		customer: 'Enterprise Products',
		onloadVolume: 27889.3,
		offloadVolume: 0,
		volumeLoss: 0,
		volumeLossPercent: 0,
		avgTemp: 94.2,
		minTemp: 89.7,
		maxTemp: 99.1,
		startTime: new Date(Date.now() - 10800000),
		endTime: null,
		duration: 0,
		distance: 362,
		efficiency: 0,
		revenue: 0,
		fuelCost: 0,
		status: 'in-progress',
		alerts: [],
		apiGravity: 40.2,
		waterCut: 0.5,
		h2sLevels: 0.4,
		pressureReadings: [149, 150, 151, 150, 149],
		tempReadings: [94, 93, 92, 90, 89, 90, 92, 95, 97, 99],
		gpsTrail: [
			{ lat: 31.9973, lng: -102.0779, timestamp: new Date(Date.now() - 10800000) },
			{ lat: 30.5449, lng: -98.6789, timestamp: new Date(Date.now() - 7200000) },
			{ lat: 29.5833, lng: -94.9833, timestamp: new Date(Date.now() - 3600000) }
		]
	},
	{
		id: 'HL-001756',
		truckId: 'T-342',
		driverId: 'D-331',
		driverName: 'Maria Gonzalez',
		origin: 'Falls City Harvest Pipeline',
		destination: 'Sweeny Refinery',
		customer: 'Phillips 66',
		onloadVolume: 28234.1,
		offloadVolume: 0,
		volumeLoss: 0,
		volumeLossPercent: 0,
		avgTemp: 0,
		minTemp: 0,
		maxTemp: 0,
		startTime: new Date(Date.now() + 3600000),
		endTime: null,
		duration: 0,
		distance: 285,
		efficiency: 0,
		revenue: 0,
		fuelCost: 0,
		status: 'scheduled',
		alerts: [],
		apiGravity: 42.5,
		waterCut: 0.3,
		h2sLevels: 0.2,
		pressureReadings: [],
		tempReadings: [],
		gpsTrail: []
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