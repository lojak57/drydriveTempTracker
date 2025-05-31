import { writable, derived } from 'svelte/store';

// Calibration configuration interface
export interface CalibrationConfig {
	fleetSize: number;
	hourlyRate: number;
	calibrationFrequency: 'monthly' | 'quarterly';
	timePerTruck: number; // days
	hoursPerDay: number;
}

// Individual truck metrics interface
export interface TruckMetrics {
	id: string;
	lastCalibrated: Date;
	avgLoadDelta: number;
	status: 'good' | 'warning' | 'critical';
	totalLoads: number;
	recentLoads: LoadReading[];
	nextRecommendedCalibration?: Date;
}

// Load reading interface
export interface LoadReading {
	timestamp: Date;
	loadAmount: number;
	terminalReading: number;
	delta: number;
	location: string;
}

// Cost breakdown interface
export interface CostBreakdown {
	costPerTruck: number;
	monthlyTotal: number;
	annualTotal: number;
	optimizedMonthly: number;
	optimizedAnnual: number;
	monthlySavings: number;
	annualSavings: number;
}

// Calibration configuration store
export const calibrationConfig = writable<CalibrationConfig>({
	fleetSize: 100,
	hourlyRate: 155,
	calibrationFrequency: 'monthly',
	timePerTruck: 0.5,
	hoursPerDay: 8
});

// Mock truck fleet data
export const mockTruckData: TruckMetrics[] = [
	{
		id: 'PLN-014',
		lastCalibrated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		avgLoadDelta: 0.01,
		status: 'good',
		totalLoads: 156,
		recentLoads: []
	},
	{
		id: 'PLN-027',
		lastCalibrated: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
		avgLoadDelta: 0.39,
		status: 'warning',
		totalLoads: 143,
		recentLoads: []
	},
	{
		id: 'PLN-133',
		lastCalibrated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		avgLoadDelta: -0.04,
		status: 'good',
		totalLoads: 189,
		recentLoads: []
	},
	{
		id: 'PLN-089',
		lastCalibrated: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
		avgLoadDelta: 0.67,
		status: 'critical',
		totalLoads: 98,
		recentLoads: []
	},
	{
		id: 'PLN-156',
		lastCalibrated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
		avgLoadDelta: 0.12,
		status: 'good',
		totalLoads: 167,
		recentLoads: []
	}
];

// Generate full fleet data
function generateFleetData(size: number): TruckMetrics[] {
	const baseData = [...mockTruckData];
	const fullFleet: TruckMetrics[] = [];
	
	for (let i = 0; i < size; i++) {
		const baseIndex = i % baseData.length;
		const baseTruck = baseData[baseIndex];
		
		// Generate varied data based on base
		const truck: TruckMetrics = {
			id: `PLN-${String(i + 1).padStart(3, '0')}`,
			lastCalibrated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
			avgLoadDelta: (Math.random() - 0.5) * 1.2, // -0.6 to +0.6
			status: 'good',
			totalLoads: Math.floor(Math.random() * 200) + 50,
			recentLoads: []
		};
		
		// Determine status based on delta
		if (Math.abs(truck.avgLoadDelta) <= 0.1) {
			truck.status = 'good';
		} else if (Math.abs(truck.avgLoadDelta) <= 0.5) {
			truck.status = 'warning';
		} else {
			truck.status = 'critical';
		}
		
		fullFleet.push(truck);
	}
	
	return fullFleet;
}

// Fleet data store
export const fleetData = derived(
	calibrationConfig,
	($config) => generateFleetData($config.fleetSize)
);

// Cost calculations derived store
export const costBreakdown = derived(
	calibrationConfig,
	($config): CostBreakdown => {
		const costPerTruck = $config.timePerTruck * $config.hoursPerDay * $config.hourlyRate;
		const monthlyTotal = $config.fleetSize * costPerTruck;
		const annualTotal = monthlyTotal * 12;
		
		// Optimization assumes 40% reduction in unnecessary calibrations
		const optimizationRate = 0.6; // 40% savings
		const optimizedMonthly = monthlyTotal * optimizationRate;
		const optimizedAnnual = optimizedMonthly * 12;
		
		return {
			costPerTruck,
			monthlyTotal,
			annualTotal,
			optimizedMonthly,
			optimizedAnnual,
			monthlySavings: monthlyTotal - optimizedMonthly,
			annualSavings: annualTotal - optimizedAnnual
		};
	}
);

// Fleet statistics derived store
export const fleetStats = derived(
	fleetData,
	($fleet) => {
		const total = $fleet.length;
		const good = $fleet.filter(t => t.status === 'good').length;
		const warning = $fleet.filter(t => t.status === 'warning').length;
		const critical = $fleet.filter(t => t.status === 'critical').length;
		
		const avgDelta = $fleet.reduce((sum, t) => sum + Math.abs(t.avgLoadDelta), 0) / total;
		
		const needsCalibration = $fleet.filter(t => t.status !== 'good').length;
		const calibrationsAvoided = total - needsCalibration;
		const moneySaved = calibrationsAvoided * 620; // $620 per calibration
		
		return {
			total,
			good,
			warning,
			critical,
			avgDelta,
			needsCalibration,
			calibrationsAvoided,
			moneySaved
		};
	}
); 