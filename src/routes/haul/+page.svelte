<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { activeHauls, drivers, trucks, scadaStatus, currentHaul, type Haul, type Driver, type Truck } from '$lib/stores/haulStore';
	import HaulCard from '$lib/components/dashboard/HaulCard.svelte';
	import HaulDetailView from '$lib/components/dashboard/HaulDetailView.svelte';
	import SystemStatusCard from '$lib/components/dashboard/SystemStatusCard.svelte';
	import LiveDataFeed from '$lib/components/dashboard/LiveDataFeed.svelte';

	let dataUpdateInterval: number;
	let lastUpdate = new Date(1735064220000); // Static timestamp for SSR consistency
	let selectedHaul: Haul | null = null;
	let haulId: string | null = null;

	// Simulate live SCADA data updates
	onMount(() => {
		// Update to current time once mounted
		lastUpdate = new Date();
		
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
							internal: 70 + Math.random() * 10,  // 70-80°F
							tankerTemp: 75 + Math.random() * 8, // 75-83°F
							oilTemp: 72 + Math.random() * 6 // 72-78°F
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

		// Get haul ID from URL params
		haulId = $page.url.searchParams.get('id');
		if (haulId) {
			selectedHaul = $activeHauls.find(h => h.id === haulId) || null;
		}
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
		// Navigate back to fleet or hauls page
		if (browser) {
			window.history.back();
		}
	}

	// Get driver and truck info
	$: driver = selectedHaul ? $drivers.find(d => d.id === selectedHaul.driverId) : null;
	$: truck = selectedHaul ? $trucks.find(t => t.id === selectedHaul.truckId) : null;

	$: driverMap = $drivers.reduce((map: Record<string, Driver>, driver) => {
		map[driver.id] = driver;
		return map;
	}, {});

	$: truckMap = $trucks.reduce((map: Record<string, Truck>, truck) => {
		map[truck.id] = truck;
		return map;
	}, {});
</script>

<!-- Header -->
<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
	<div>
		<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-oil-black">Live Haul Monitoring</h1>
		<p class="text-sm sm:text-base text-oil-gray mt-2">Real-time SCADA data from field operations</p>
	</div>
	<div class="text-left sm:text-right">
		<div class="text-sm text-oil-gray">Last Update</div>
		<div class="font-mono text-oil-black text-sm">{lastUpdate.toLocaleTimeString()}</div>
	</div>
</div>

<!-- System Status Row -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

<!-- Haul Detail Modal -->
{#if selectedHaul && driver && truck}
	<HaulDetailView 
		haul={selectedHaul} 
		{driver} 
		{truck} 
		on:close={closeHaulDetail} 
	/>
{:else if haulId}
	<!-- Loading or not found state -->
	<div class="glass-card p-8 sm:p-12 text-center">
		<div class="text-6xl mb-4">🔍</div>
		<h3 class="text-xl font-semibold text-oil-black mb-2">Haul Not Found</h3>
		<p class="text-oil-gray mb-4">The requested haul could not be found or may have been completed.</p>
		<button 
			onclick={() => window.history.back()}
			class="px-4 py-2 bg-oil-orange text-white rounded-lg hover:bg-oil-orange/80 transition-colors"
		>
			Go Back
		</button>
	</div>
{:else}
	<!-- No haul ID provided -->
	<div class="glass-card p-8 sm:p-12 text-center">
		<div class="text-6xl mb-4">📋</div>
		<h3 class="text-xl font-semibold text-oil-black mb-2">No Haul Selected</h3>
		<p class="text-oil-gray mb-4">Please select a haul from the fleet operations or haul history page.</p>
		<div class="space-x-4">
			<a 
				href="/fleet"
				class="inline-block px-4 py-2 bg-oil-orange text-white rounded-lg hover:bg-oil-orange/80 transition-colors"
			>
				View Fleet
			</a>
			<a 
				href="/hauls"
				class="inline-block px-4 py-2 bg-oil-blue text-white rounded-lg hover:bg-oil-blue/80 transition-colors"
			>
				View History
			</a>
		</div>
	</div>
{/if} 