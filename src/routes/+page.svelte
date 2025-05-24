<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Navigation from '$lib/components/ui/Navigation.svelte';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import { activeHauls, completedHauls, scadaStatus, drivers } from '$lib/stores/haulStore';

	let currentTemp = 76.3;
	let ambientTemp = 98.7;
	let systemPressure = 154.2;
	let flowRate = 3.0;
	let updateInterval: number;

	// Simulate real-time SCADA metrics
	onMount(() => {
		updateInterval = setInterval(() => {
			currentTemp = 70 + Math.random() * 15; // 70-85°F
			ambientTemp = 85 + Math.random() * 20; // 85-105°F
			systemPressure = 140 + Math.random() * 25; // 140-165 PSI
			flowRate = 2.5 + Math.random() * 1.0; // 2.5-3.5 bbl/min
		}, 4000);
	});

	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	});

	// Derived metrics
	$: totalActiveVolume = $activeHauls.reduce((sum, haul) => sum + haul.initialVolume, 0);
	$: totalExpectedLoss = $activeHauls.reduce((sum, haul) => sum + haul.expectedLoss, 0);
	$: completedToday = $completedHauls.filter(haul => {
		const today = new Date();
		const haulDate = haul.endTime || haul.startTime;
		return haulDate.toDateString() === today.toDateString();
	}).length;
	
	$: haulsByStatus = $activeHauls.reduce((counts, haul) => {
		counts[haul.status] = (counts[haul.status] || 0) + 1;
		return counts;
	}, {} as Record<string, number>);
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	<Navigation />
	
	<main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
		<!-- Header -->
		<div class="text-center mb-6 sm:mb-8">
			<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-oil-black mb-2">Oil Field Temperature Tracker</h1>
			<p class="text-sm sm:text-base text-oil-gray">Real-time SCADA monitoring of oil transport operations</p>
		</div>

		<!-- System Status Banner -->
		<div class="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
					<div class="flex items-center gap-2">
						<div class="w-4 h-4 {$scadaStatus.systemOnline ? 'bg-emerald-400' : 'bg-red-400'} rounded-full animate-pulse"></div>
						<span class="font-semibold text-oil-black">System Online</span>
					</div>
					<div class="hidden sm:block text-oil-gray">|</div>
					<div class="text-sm text-oil-gray">
						{$scadaStatus.connectedDevices} devices connected
					</div>
					<div class="hidden sm:block text-oil-gray">|</div>
					<div class="text-sm text-oil-gray">
						Network health: {$scadaStatus.networkHealth.toFixed(1)}%
					</div>
				</div>
				<div class="text-left sm:text-right">
					<div class="text-sm text-oil-gray">Last update</div>
					<div class="font-mono text-oil-black text-sm">{$scadaStatus.lastUpdate.toLocaleTimeString()}</div>
				</div>
			</div>
		</div>

		<!-- Primary Navigation Actions -->
		<div class="glass-card p-6 sm:p-8 text-center mb-6 sm:mb-8">
			<h3 class="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black mb-4 sm:mb-6">Dashboard Navigation</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
				<a 
					href="/haul" 
					class="block p-4 sm:p-6 bg-gradient-to-br from-oil-orange to-amber-500 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation"
				>
					<div class="text-2xl sm:text-3xl mb-2">🚛</div>
					<div class="font-semibold text-base sm:text-lg mb-1">Live Haul Monitoring</div>
					<div class="text-white/80 text-xs sm:text-sm">Monitor active hauls and real-time data</div>
				</a>
				
				<a 
					href="/admin" 
					class="block p-4 sm:p-6 bg-gradient-to-br from-oil-blue to-blue-600 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation"
				>
					<div class="text-2xl sm:text-3xl mb-2">📊</div>
					<div class="font-semibold text-base sm:text-lg mb-1">Analytics Dashboard</div>
					<div class="text-white/80 text-xs sm:text-sm">View historical data and performance metrics</div>
				</a>
			</div>
		</div>

		<!-- Real-time Metrics -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
			<MetricCard
				title="Internal Temp"
				value={currentTemp}
				unit="°F"
				icon="🌡️"
				status="normal"
				trend="stable"
				trendValue="±0.5°F"
			/>
			
			<MetricCard
				title="Ambient Temp"
				value={ambientTemp}
				unit="°F"
				icon="☀️"
				status={ambientTemp > 100 ? 'warning' : 'normal'}
				trend="up"
				trendValue="+2.3°F"
			/>
			
			<MetricCard
				title="System Pressure"
				value={systemPressure}
				unit="PSI"
				icon="⚡"
				status="normal"
				trend="stable"
				trendValue="Normal"
			/>
			
			<MetricCard
				title="Flow Rate"
				value={flowRate}
				unit="bbl/min"
				icon="🌊"
				status="normal"
				trend="stable"
				trendValue="Optimal"
			/>
		</div>

		<!-- Operations Overview -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
			<!-- Active Operations -->
			<div class="glass-card p-4 sm:p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
					<h3 class="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black">Active Operations</h3>
				</div>
				
				<div class="space-y-4">
					<div class="flex justify-between items-center p-3 bg-white/30 rounded-xl">
						<span class="text-oil-gray">Total Active Hauls</span>
						<span class="metric-display text-oil-orange text-xl">{$activeHauls.length}</span>
					</div>
					
					<div class="flex justify-between items-center p-3 bg-white/30 rounded-xl">
						<span class="text-oil-gray">Total Volume</span>
						<span class="metric-display text-oil-blue text-xl">{totalActiveVolume.toLocaleString()}</span>
					</div>
					
					<div class="flex justify-between items-center p-3 bg-white/30 rounded-xl">
						<span class="text-oil-gray">Expected Loss</span>
						<span class="metric-display text-amber-600 text-xl">{totalExpectedLoss.toFixed(1)}</span>
					</div>
				</div>
			</div>

			<!-- Haul Status Breakdown -->
			<div class="glass-card p-4 sm:p-6">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-3 h-3 bg-blue-400 rounded-full"></div>
					<h3 class="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black">Haul Status</h3>
				</div>
				
				<div class="space-y-3">
					<div class="flex justify-between items-center p-3 bg-amber-50 rounded-xl border border-amber-200">
						<div class="flex items-center gap-2">
							<span class="text-lg">📦</span>
							<span class="text-amber-700 font-medium">Loading</span>
						</div>
						<span class="metric-display text-amber-700 text-lg">{haulsByStatus.loading || 0}</span>
					</div>
					
					<div class="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
						<div class="flex items-center gap-2">
							<span class="text-lg">🚛</span>
							<span class="text-blue-700 font-medium">In Transit</span>
						</div>
						<span class="metric-display text-blue-700 text-lg">{haulsByStatus.transit || 0}</span>
					</div>
					
					<div class="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
						<div class="flex items-center gap-2">
							<span class="text-lg">🏭</span>
							<span class="text-emerald-700 font-medium">Offloading</span>
						</div>
						<span class="metric-display text-emerald-700 text-lg">{haulsByStatus.offloading || 0}</span>
					</div>
				</div>
			</div>

			<!-- Daily Summary -->
			<div class="glass-card p-4 sm:p-6 md:col-span-2 lg:col-span-1">
				<div class="flex items-center gap-3 mb-4">
					<div class="w-3 h-3 bg-oil-orange rounded-full"></div>
					<h3 class="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black">Today's Summary</h3>
				</div>
				
				<div class="space-y-4">
					<div class="text-center p-4 bg-white/30 rounded-xl">
						<div class="metric-display text-oil-orange text-2xl mb-1">{completedToday}</div>
						<div class="text-oil-gray text-sm">Completed Hauls</div>
					</div>
					
					<div class="text-center p-4 bg-white/30 rounded-xl">
						<div class="metric-display text-oil-blue text-2xl mb-1">{$drivers.length}</div>
						<div class="text-oil-gray text-sm">Active Drivers</div>
					</div>
					
					<div class="text-center p-4 bg-white/30 rounded-xl">
						<div class="metric-display text-emerald-600 text-2xl mb-1">98.2%</div>
						<div class="text-oil-gray text-sm">System Uptime</div>
					</div>
				</div>
			</div>
		</div>


	</main>
</div>
