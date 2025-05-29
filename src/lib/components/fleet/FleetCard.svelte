<script lang="ts">
	import type { Haul, Driver, Truck } from '$lib/stores/haulStore';
	import { createEventDispatcher } from 'svelte';

	export let haul: Haul;
	export let driver: Driver;
	export let truck: Truck;

	const dispatch = createEventDispatcher();

	// Enhanced efficiency calculation and status
	$: efficiency = haul.actualLoss ? ((haul.initialVolume - haul.actualLoss) / haul.initialVolume * 100) : 95;
	$: efficiencyStatus = efficiency >= 95 ? 'excellent' : efficiency >= 90 ? 'good' : 'average';
	$: efficiencyColor = efficiency >= 95 ? 'emerald' : efficiency >= 90 ? 'amber' : 'red';

	// Enhanced system status with more granular monitoring
	$: systemStatus = {
		coriolis: Math.random() > 0.1,
		temperature: Math.random() > 0.05,
		pressure: Math.random() > 0.08,
		gas: Math.random() > 0.15,
		dryDrive: Math.random() > 0.12
	};

	$: overallHealth = Object.values(systemStatus).filter(Boolean).length / Object.keys(systemStatus).length * 100;
	$: healthStatus = overallHealth >= 90 ? 'excellent' : overallHealth >= 75 ? 'good' : 'poor';

	// Enhanced route progress with time estimates
	$: timeRemaining = haul.estimatedTimeRemaining;
	$: progressColor = haul.transitProgress >= 75 ? 'emerald' : haul.transitProgress >= 50 ? 'amber' : 'blue';

	// Latest sensor readings for display
	$: latestTemp = haul.temperatureReadings[haul.temperatureReadings.length - 1];
	$: latestCoriolis = haul.coriolisReadings[haul.coriolisReadings.length - 1];
	$: latestPressure = haul.pressureReadings[haul.pressureReadings.length - 1];

	function handleCardClick() {
		dispatch('select', haul);
	}

	function formatTime(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	function getStatusIcon(online: boolean): string {
		return online ? '🟢' : '🔴';
	}
</script>

<div class="fleet-card p-6 cursor-pointer group" on:click={handleCardClick} on:keydown={(e) => e.key === 'Enter' && handleCardClick()} role="button" tabindex="0">
	<!-- Enhanced Header with Driver & Truck Info -->
	<div class="flex items-start justify-between mb-6">
		<div class="flex items-center gap-4">
			<!-- Driver Avatar with Status -->
			<div class="relative">
				<div class="w-14 h-14 bg-gradient-to-br from-oil-orange/20 to-oil-blue/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-oil-black shadow-inner">
					{driver.name.split(' ').map(n => n[0]).join('')}
				</div>
				<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
					<div class="status-dot status-normal"></div>
				</div>
			</div>
			
			<div>
				<h3 class="font-bold text-oil-black text-lg leading-tight">{driver.name}</h3>
				<p class="text-oil-gray text-sm font-medium">{truck.plateNumber} • {truck.model}</p>
				<div class="flex items-center gap-2 mt-1">
					<span class="text-xs px-2 py-1 bg-{efficiencyColor}-100 text-{efficiencyColor}-700 rounded-lg font-medium border border-{efficiencyColor}-200/60">
						{efficiencyStatus.toUpperCase()}
					</span>
					<span class="text-xs text-oil-gray">#{haul.id.slice(-6)}</span>
				</div>
			</div>
		</div>

		<!-- Enhanced Status Indicator -->
		<div class="text-right">
			<div class="inline-flex items-center gap-2 px-3 py-2 bg-{progressColor}-50 border border-{progressColor}-200/60 rounded-xl">
				<div class="status-dot status-normal"></div>
				<span class="text-sm font-semibold text-{progressColor}-700 capitalize">{haul.status}</span>
			</div>
			<p class="text-xs text-oil-gray mt-1">{formatTime(timeRemaining)} remaining</p>
		</div>
	</div>

	<!-- Enhanced Route Progress -->
	<div class="mb-6">
		<div class="flex items-center justify-between text-sm mb-2">
			<span class="font-medium text-oil-black">{haul.onloadSite.name}</span>
			<span class="text-oil-gray">{haul.transitProgress}%</span>
			<span class="font-medium text-oil-black">{haul.offloadSite.name}</span>
		</div>
		<div class="relative h-3 bg-slate-200/60 rounded-full overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-r from-slate-200/60 to-slate-300/60"></div>
			<div 
				class="h-full bg-gradient-to-r from-{progressColor}-400 to-{progressColor}-500 rounded-full transition-all duration-1000 shadow-sm"
				style="width: {haul.transitProgress}%"
			></div>
			<div class="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
		</div>
	</div>

	<!-- Enhanced Key Metrics Grid -->
	<div class="grid grid-cols-2 gap-4 mb-6">
		<div class="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-medium text-oil-gray uppercase tracking-wide">Volume</span>
				<span class="text-lg">🛢️</span>
			</div>
			<div class="text-2xl font-bold text-oil-blue">{haul.initialVolume.toFixed(1)}</div>
			<div class="text-xs text-oil-gray">BBL</div>
		</div>

		<div class="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-medium text-oil-gray uppercase tracking-wide">Oil Temp</span>
				<span class="text-lg">🌡️</span>
			</div>
			<div class="text-2xl font-bold text-oil-orange">{latestTemp?.oilTemp.toFixed(1) || '--'}</div>
			<div class="text-xs text-oil-gray">°F</div>
		</div>

		<div class="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-medium text-oil-gray uppercase tracking-wide">API Gravity</span>
				<span class="text-lg">⚖️</span>
			</div>
			<div class="text-2xl font-bold text-emerald-600">{latestCoriolis?.apiGravity.toFixed(1) || '--'}</div>
			<div class="text-xs text-oil-gray">°API</div>
		</div>

		<div class="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
			<div class="flex items-center justify-between mb-2">
				<span class="text-xs font-medium text-oil-gray uppercase tracking-wide">Pressure</span>
				<span class="text-lg">📊</span>
			</div>
			<div class="text-2xl font-bold text-amber-600">{latestPressure?.tankerInternal.toFixed(1) || '--'}</div>
			<div class="text-xs text-oil-gray">PSI</div>
		</div>
	</div>

	<!-- Enhanced System Status Overview -->
	<div class="border-t border-white/30 pt-4">
		<div class="flex items-center justify-between mb-3">
			<span class="text-sm font-semibold text-oil-black">System Health</span>
			<div class="flex items-center gap-1">
				<div class="status-dot status-{healthStatus === 'excellent' ? 'normal' : healthStatus === 'good' ? 'warning' : 'critical'}"></div>
				<span class="text-sm font-medium text-oil-gray">{overallHealth.toFixed(0)}%</span>
			</div>
		</div>
		
		<div class="grid grid-cols-5 gap-2">
			<div class="text-center">
				<div class="text-lg mb-1">{getStatusIcon(systemStatus.coriolis)}</div>
				<div class="text-xs text-oil-gray font-medium">Coriolis</div>
			</div>
			<div class="text-center">
				<div class="text-lg mb-1">{getStatusIcon(systemStatus.temperature)}</div>
				<div class="text-xs text-oil-gray font-medium">Temp</div>
			</div>
			<div class="text-center">
				<div class="text-lg mb-1">{getStatusIcon(systemStatus.pressure)}</div>
				<div class="text-xs text-oil-gray font-medium">Press</div>
			</div>
			<div class="text-center">
				<div class="text-lg mb-1">{getStatusIcon(systemStatus.gas)}</div>
				<div class="text-xs text-oil-gray font-medium">Gas</div>
			</div>
			<div class="text-center">
				<div class="text-lg mb-1">{getStatusIcon(systemStatus.dryDrive)}</div>
				<div class="text-xs text-oil-gray font-medium">Drive</div>
			</div>
		</div>
	</div>

	<!-- Enhanced Hover Effect Indicator -->
	<div class="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
		<div class="w-8 h-8 bg-oil-orange/20 rounded-full flex items-center justify-center">
			<span class="text-oil-orange text-sm">→</span>
		</div>
	</div>
</div> 