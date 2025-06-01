import { writable } from 'svelte/store';
import type maplibregl from 'maplibre-gl';

export interface MapLocation {
	lat: number;
	lng: number;
	address?: string;
}

export interface MapState {
	map: maplibregl.Map | null;
	currentLocation: MapLocation;
	isInitialized: boolean;
	isLoading: boolean;
}

const initialState: MapState = {
	map: null,
	currentLocation: {
		lat: 29.7604,
		lng: -95.3698,
		address: 'Current Location: I-45 North'
	},
	isInitialized: false,
	isLoading: false
};

function createMapStore() {
	const { subscribe, set, update } = writable<MapState>(initialState);

	return {
		subscribe,
		setMap: (map: maplibregl.Map) => update(state => ({ 
			...state, 
			map, 
			isInitialized: true,
			isLoading: false 
		})),
		setLoading: (isLoading: boolean) => update(state => ({ 
			...state, 
			isLoading 
		})),
		updateCurrentLocation: (location: MapLocation) => update(state => ({ 
			...state, 
			currentLocation: location 
		})),
		destroy: () => update(state => {
			if (state.map) {
				state.map.remove();
			}
			return { ...initialState };
		}),
		reset: () => set(initialState)
	};
}

export const mapStore = createMapStore(); 