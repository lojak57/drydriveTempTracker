<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Navigation from '$lib/components/ui/Navigation.svelte';
	import { activeHauls, drivers, trucks, scadaStatus, currentHaul, type Haul, type Driver, type Truck } from '$lib/stores/haulStore';
	import HaulCard from '$lib/components/dashboard/HaulCard.svelte';
	import HaulDetailView from '$lib/components/dashboard/HaulDetailView.svelte';
	import SystemStatusCard from '$lib/components/dashboard/SystemStatusCard.svelte';
	import LiveDataFeed from '$lib/components/dashboard/LiveDataFeed.svelte';

	let dataUpdateInterval: number;
	let lastUpdate = new Date();
	let selectedHaul: Haul | null = null;

	// Simulate live SCADA data updates
	onMount(() => {
		dataUpdateInterval = setInterval(() => {
			// Update SCADA system status
			scadaStatus.update(status => ({
				...status,
				lastUpdate: new Date(),
				dataLatency: 0.8 + Math.random() * 0.8, // 0.8-1.6 seconds
				networkHealth: 97 + Math.random() * 2 // 97-99%
			}));

			// Update temperature readings for active hauls
			activeHauls.update(hauls => {
				return hauls.map(haul => {
					if (haul.status === 'transit' || haul.status === 'loading') {
						const newReading = {
							timestamp: new Date(),
							ambient: 88 + Math.random() * 15, // 88-103°F
							internal: 70 + Math.random() * 10  // 70-80°F
						};
						
						// Update transit progress for hauls in transit
						let newProgress = haul.transitProgress;
						let newETA = haul.estimatedTimeRemaining;
						
						if (haul.status === 'transit') {
							newProgress = Math.min(100, haul.transitProgress + 0.5); // Progress 0.5% every update
							newETA = Math.max(0, haul.estimatedTimeRemaining - 0.5); // Reduce ETA
							
							// Update location based on progress
							const lat1 = haul.onloadSite.location.lat;
							const lng1 = haul.onloadSite.location.lng;
							const lat2 = haul.offloadSite.location.lat;
							const lng2 = haul.offloadSite.location.lng;
							
							const progressRatio = newProgress / 100;
							const currentLat = lat1 + (lat2 - lat1) * progressRatio;
							const currentLng = lng1 + (lng2 - lng1) * progressRatio;
							
							haul.currentLocation = { lat: currentLat, lng: currentLng };
						}
						
						return {
							...haul,
							temperatureReadings: [newReading],
							transitProgress: newProgress,
							estimatedTimeRemaining: newETA
						};
					}
					return haul;
				});
			});

			lastUpdate = new Date();
		}, 3000); // Update every 3 seconds
	});

	onDestroy(() => {
		if (dataUpdateInterval) {
			clearInterval(dataUpdateInterval);
		}
	});

	function selectHaul(haul: Haul) {
		selectedHaul = haul;
	}

	function closeHaulDetail() {
		selectedHaul = null;
	}

	$: driverMap = $drivers.reduce((map: Record<string, Driver>, driver) => {
		map[driver.id] = driver;
		return map;
	}, {});

	$: truckMap = $trucks.reduce((map: Record<string, Truck>, truck) => {
		map[truck.id] = truck;
		return map;
	}, {});
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	<Navigation />
	
	<main class="max-w-7xl mx-auto px-6 py-8">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="display-large text-oil-black">Live Haul Monitoring</h1>
				<p class="text-oil-gray mt-2">Real-time SCADA data from field operations</p>
			</div>
			<div class="text-right">
				<div class="text-sm text-oil-gray">Last Update</div>
				<div class="font-mono text-oil-black">{lastUpdate.toLocaleTimeString()}</div>
			</div>
		</div>

		<!-- System Status Row -->
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
			<SystemStatusCard />
			<LiveDataFeed />
			<div class="glass-card p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-3 h-3 bg-emerald-400 rounded-full shadow-sm animate-pulse"></div>
					<h3 class="font-semibold text-oil-black">Active Hauls</h3>
				</div>
				<div class="metric-display text-oil-orange">{$activeHauls.length}</div>
				<p class="text-sm text-oil-gray mt-2">Currently monitoring</p>
			</div>
			<div class="glass-card p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-3 h-3 bg-oil-blue rounded-full shadow-sm"></div>
					<h3 class="font-semibold text-oil-black">Fleet Status</h3>
				</div>
				<div class="metric-display text-oil-blue">{$trucks.length}</div>
				<p class="text-sm text-oil-gray mt-2">Trucks operational</p>
			</div>
		</div>

		<!-- Active Hauls Grid -->
		<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
			{#each $activeHauls as haul (haul.id)}
				<HaulCard 
					{haul} 
					driver={driverMap[haul.driverId]}
					truck={truckMap[haul.truckId]}
					on:select={() => selectHaul(haul)}
				/>
			{/each}
		</div>

		{#if $activeHauls.length === 0}
			<div class="glass-card p-12 text-center">
				<div class="text-6xl mb-4">🚛</div>
				<h3 class="display-medium text-oil-black mb-2">No Active Hauls</h3>
				<p class="text-oil-gray">All trucks are currently idle or offline</p>
			</div>
		{/if}
	</main>
</div>

<!-- Haul Detail Modal -->
{#if selectedHaul}
	<HaulDetailView 
		haul={selectedHaul}
		driver={driverMap[selectedHaul.driverId]}
		truck={truckMap[selectedHaul.truckId]}
		on:close={closeHaulDetail}
	/>
{/if} 