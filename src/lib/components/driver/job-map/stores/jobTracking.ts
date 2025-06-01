import { writable } from 'svelte/store';

export type JobStep = 'driving-to-pickup' | 'at-pickup' | 'loading' | 'driving-to-delivery' | 'at-delivery' | 'unloading' | 'completed';

export interface JobStepInfo {
	id: JobStep;
	label: string;
	status: 'pending' | 'active' | 'completed';
	eta: string;
}

export interface JobTrackingState {
	currentStep: JobStep;
	estimatedArrival: Date;
	currentSpeed: number;
	distanceRemaining: number;
	jobSteps: JobStepInfo[];
}

const initialJobSteps: JobStepInfo[] = [
	{ id: 'driving-to-pickup', label: 'Drive to Pickup', status: 'active', eta: '6:45 AM' },
	{ id: 'at-pickup', label: 'Arrive at Pickup', status: 'pending', eta: '6:45 AM' },
	{ id: 'loading', label: 'Load Tank', status: 'pending', eta: '7:15 AM' },
	{ id: 'driving-to-delivery', label: 'Drive to Delivery', status: 'pending', eta: '7:30 AM' },
	{ id: 'at-delivery', label: 'Arrive at Delivery', status: 'pending', eta: '11:00 AM' },
	{ id: 'unloading', label: 'Unload Tank', status: 'pending', eta: '11:30 AM' },
	{ id: 'completed', label: 'Job Complete', status: 'pending', eta: '12:00 PM' }
];

const initialState: JobTrackingState = {
	currentStep: 'driving-to-pickup',
	estimatedArrival: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
	currentSpeed: 62, // mph
	distanceRemaining: 18.3, // miles
	jobSteps: initialJobSteps
};

function createJobTrackingStore() {
	const { subscribe, set, update } = writable<JobTrackingState>(initialState);

	return {
		subscribe,
		nextStep: () => update(state => {
			const currentIndex = state.jobSteps.findIndex(step => step.id === state.currentStep);
			if (currentIndex < state.jobSteps.length - 1) {
				const newSteps = state.jobSteps.map((step, index) => ({
					...step,
					status: index <= currentIndex ? 'completed' : 
							index === currentIndex + 1 ? 'active' : 'pending'
				})) as JobStepInfo[];
				
				return {
					...state,
					currentStep: state.jobSteps[currentIndex + 1].id,
					jobSteps: newSteps
				};
			}
			return state;
		}),
		updateMetrics: (speed: number, distance: number, eta: Date) => update(state => ({
			...state,
			currentSpeed: speed,
			distanceRemaining: distance,
			estimatedArrival: eta
		})),
		setCurrentStep: (step: JobStep) => update(state => {
			const stepIndex = state.jobSteps.findIndex(s => s.id === step);
			const newSteps = state.jobSteps.map((s, index) => ({
				...s,
				status: index < stepIndex ? 'completed' : 
						index === stepIndex ? 'active' : 'pending'
			})) as JobStepInfo[];
			
			return {
				...state,
				currentStep: step,
				jobSteps: newSteps
			};
		}),
		reset: () => set(initialState)
	};
}

export const jobTrackingStore = createJobTrackingStore(); 