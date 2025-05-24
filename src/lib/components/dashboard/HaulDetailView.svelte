<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Haul, Driver, Truck } from '$lib/stores/haulStore';

	export let haul: Haul;
	export let driver: Driver;
	export let truck: Truck;

	const dispatch = createEventDispatcher();

	function getVarianceStatus(expectedLoss: number, actualLoss?: number) {
		if (!actualLoss) return { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: '⏳' };
		
		const variance = Math.abs(actualLoss - expectedLoss);
		const variancePercent = (variance / expectedLoss) * 100;
		
		if (variancePercent <= 5) {
			return { label: 'Good', color: 'bg-emerald-100 text-emerald-700', icon: '✅' };
		} else if (variancePercent <= 15) {
			return { label: 'Low Variance', color: 'bg-amber-100 text-amber-700', icon: '⚠️' };
		} else {
			return { label: 'High Variance', color: 'bg-red-100 text-red-700', icon: '🚨' };
		}
	}

	function formatTime(minutes: number) {
		const hours = Math.floor(minutes / 60);
		const mins = Math.round(minutes % 60);
		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m`;
	}

	$: latestReading = haul.temperatureReadings[haul.temperatureReadings.length - 1];
	$: varianceStatus = getVarianceStatus(haul.expectedLoss, haul.actualLoss);
	$: isCompleted = haul.status === 'completed' || haul.status === 'offloading';
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
		<!-- Header -->
		<div class="sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl border-b border-slate-200/50 p-6">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="display-medium text-oil-black">Haul Details</h2>
					<p class="text-oil-gray">ID: {haul.id.slice(-8)} • {truck.plateNumber}</p>
				</div>
				<button 
					on:click={() => dispatch('close')}
					class="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
				>
					<span class="text-slate-600">✕</span>
				</button>
			</div>
		</div>

		<div class="p-6 space-y-8">
			<!-- Route Overview -->
			<div class="glass-card p-4 sm:p-6">
				<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
					<span class="text-lg">🛣️</span>
					Route Information
				</h3>
				<!-- Mobile: Stack vertically, Desktop: Horizontal with arrow -->
				<div class="flex flex-col sm:flex-row items-center gap-4">
					<div class="w-full sm:flex-1 text-center p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200">
						<div class="text-xl sm:text-2xl mb-2">📍</div>
						<div class="font-semibold text-emerald-700 text-sm sm:text-base leading-tight">{haul.onloadSite.name}</div>
						<div class="text-xs sm:text-sm text-emerald-600">Origin</div>
					</div>
					
					<!-- Arrow - Hidden on mobile, shown on larger screens -->
					<div class="hidden sm:flex items-center gap-2">
						<div class="w-8 sm:w-12 h-1 bg-gradient-to-r from-emerald-400 to-oil-blue rounded"></div>
						<span class="text-xl sm:text-2xl">→</span>
						<div class="w-8 sm:w-12 h-1 bg-gradient-to-r from-oil-blue to-orange-400 rounded"></div>
					</div>
					
					<!-- Mobile: Show vertical arrow -->
					<div class="sm:hidden flex flex-col items-center gap-1">
						<div class="h-8 w-1 bg-gradient-to-b from-emerald-400 to-orange-400 rounded"></div>
						<span class="text-lg">↓</span>
					</div>
					
					<div class="w-full sm:flex-1 text-center p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200">
						<div class="text-xl sm:text-2xl mb-2">🏭</div>
						<div class="font-semibold text-orange-700 text-sm sm:text-base leading-tight">{haul.offloadSite.name}</div>
						<div class="text-xs sm:text-sm text-orange-600">Destination</div>
					</div>
				</div>
			</div>

			<!-- Flow Timeline -->
			<div class="space-y-6">
				<!-- Step 1: Initial Load -->
				<div class="relative">
					<div class="flex items-start gap-3 sm:gap-6">
						<div class="flex flex-col items-center flex-shrink-0">
							<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white font-bold text-sm sm:text-base">1</span>
							</div>
							<div class="w-1 h-12 sm:h-16 bg-emerald-300 mt-2"></div>
						</div>
						<div class="flex-1 min-w-0 glass-card p-4 sm:p-6">
							<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
								<span class="text-base sm:text-lg">📦</span>
								<span class="text-sm sm:text-base">Initial Load</span>
							</h3>
							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
								<!-- Volume Card -->
								<div class="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 shadow-sm">
									<div class="text-xl sm:text-2xl mb-2">🛢️</div>
									<div class="metric-display text-oil-orange text-lg sm:text-2xl mb-2 leading-tight">{haul.initialVolume.toLocaleString()}</div>
									<div class="text-xs sm:text-sm text-orange-700 font-medium">Gallons Loaded</div>
								</div>

								<!-- Driver Card -->
								<div class="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
									<div class="flex items-center gap-2 sm:gap-3">
										<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
											<span class="text-white text-xs sm:text-sm font-bold">{driver.name.split(' ').map(n => n[0]).join('')}</span>
										</div>
										<div class="flex-1 min-w-0">
											<div class="font-semibold text-blue-800 text-sm sm:text-lg leading-tight truncate">{driver.name}</div>
											<div class="text-xs sm:text-sm text-blue-600 truncate">{driver.experience} years exp</div>
											<div class="text-xs text-blue-500 truncate">{driver.totalHauls.toLocaleString()} hauls</div>
										</div>
									</div>
								</div>

								<!-- Truck Card -->
								<div class="p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 shadow-sm">
									<div class="flex items-center gap-2 sm:gap-3">
										<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
											<span class="text-white text-base sm:text-lg">🚛</span>
										</div>
										<div class="flex-1 min-w-0">
											<div class="font-semibold text-slate-800 text-sm sm:text-lg leading-tight truncate">{truck.model}</div>
											<div class="text-xs sm:text-sm text-slate-600 font-mono truncate">{truck.plateNumber}</div>
											<div class="text-xs text-slate-500 truncate">Cap: {truck.capacity.toLocaleString()} gal</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Step 2: Transit -->
				<div class="relative">
					<div class="flex items-start gap-3 sm:gap-6">
						<div class="flex flex-col items-center flex-shrink-0">
							<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white font-bold text-sm sm:text-base">2</span>
							</div>
							<div class="w-1 h-20 sm:h-24 bg-blue-300 mt-2"></div>
						</div>
						<div class="flex-1 min-w-0 glass-card p-4 sm:p-6">
							<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
								<span class="text-base sm:text-lg">🚛</span>
								<span class="text-sm sm:text-base">Transit Monitoring</span>
							</h3>
							
							<!-- Progress Bar -->
							<div class="mb-4 sm:mb-6">
								<div class="flex justify-between text-xs sm:text-sm text-oil-gray mb-2">
									<span>Transit Progress</span>
									<span>{haul.transitProgress.toFixed(1)}%</span>
								</div>
								<div class="w-full bg-slate-200 rounded-full h-2 sm:h-3">
									<div 
										class="bg-gradient-to-r from-blue-500 to-blue-600 h-2 sm:h-3 rounded-full transition-all duration-500 relative"
										style="width: {haul.transitProgress}%"
									>
										<div class="absolute right-0 top-0 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full shadow-md transform translate-x-1/2"></div>
									</div>
								</div>
								{#if haul.status === 'transit'}
									<div class="text-xs sm:text-sm text-oil-gray mt-2">ETA: {formatTime(haul.estimatedTimeRemaining)}</div>
								{:else if haul.status === 'completed'}
									<div class="text-xs sm:text-sm text-emerald-600 mt-2">✅ Transit Completed</div>
								{/if}
							</div>

							<!-- Temperature Readings -->
							{#if latestReading}
								<div class="grid grid-cols-2 gap-3 sm:gap-4">
									<div class="text-center p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
										<div class="flex items-center justify-center gap-1 sm:gap-2 mb-2">
											<span class="text-lg sm:text-2xl">🌡️</span>
											<span class="font-semibold text-amber-700 text-xs sm:text-sm">Internal</span>
										</div>
										<div class="metric-display text-amber-700 text-base sm:text-xl leading-tight">{latestReading.internal.toFixed(1)}°F</div>
										<div class="text-xs text-amber-600 mt-1">Oil Temperature</div>
									</div>
									<div class="text-center p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
										<div class="flex items-center justify-center gap-1 sm:gap-2 mb-2">
											<span class="text-lg sm:text-2xl">☀️</span>
											<span class="font-semibold text-orange-700 text-xs sm:text-sm">Ambient</span>
										</div>
										<div class="metric-display text-orange-700 text-base sm:text-xl leading-tight">{latestReading.ambient.toFixed(1)}°F</div>
										<div class="text-xs text-orange-600 mt-1">External Temperature</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Step 3: Expected Loss Calculation -->
				<div class="relative">
					<div class="flex items-start gap-3 sm:gap-6">
						<div class="flex flex-col items-center flex-shrink-0">
							<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white font-bold text-sm sm:text-base">3</span>
							</div>
							<div class="w-1 h-12 sm:h-16 bg-amber-300 mt-2"></div>
						</div>
						<div class="flex-1 min-w-0 glass-card p-4 sm:p-6">
							<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
								<span class="text-base sm:text-lg">🧮</span>
								<span class="text-sm sm:text-base">Expected Loss Calculation</span>
							</h3>
							<div class="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4">
								<div class="text-center">
									<div class="metric-display text-amber-700 text-2xl sm:text-3xl mb-2 leading-tight">{haul.expectedLoss.toFixed(1)}</div>
									<div class="text-amber-600 font-semibold text-sm sm:text-base">Gallons Expected Loss</div>
									<div class="text-xs text-amber-600 mt-2 leading-relaxed">Calculated using thermal expansion coefficients and temperature differential</div>
									{#if haul.status === 'transit' || haul.status === 'loading'}
										<div class="flex items-center justify-center gap-2 mt-3 p-2 bg-amber-100 rounded-lg">
											<div class="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></div>
											<span class="text-xs text-amber-700 font-medium leading-relaxed">Real-time calculation updates based on live SCADA telemetry</span>
										</div>
									{:else}
										<div class="text-xs text-amber-600 mt-3 opacity-70">Final calculation based on completed transit data</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Step 4: Actual Results & Variance -->
				<div class="relative">
					<div class="flex items-start gap-3 sm:gap-6">
						<div class="flex flex-col items-center flex-shrink-0">
							<div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
								<span class="text-white font-bold text-sm sm:text-base">4</span>
							</div>
						</div>
						<div class="flex-1 min-w-0 glass-card p-4 sm:p-6">
							<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
								<span class="text-base sm:text-lg">📊</span>
								<span class="text-sm sm:text-base">Offload Results & Variance Analysis</span>
							</h3>
							
							{#if isCompleted && haul.finalVolume && haul.actualLoss !== undefined}
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
									<div class="text-center p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
										<div class="metric-display text-blue-700 text-lg sm:text-2xl mb-2 leading-tight">{haul.finalVolume.toLocaleString()}</div>
										<div class="text-xs sm:text-sm text-blue-600">Gallons Offloaded</div>
									</div>
									<div class="text-center p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200">
										<div class="metric-display text-red-700 text-lg sm:text-2xl mb-2 leading-tight">{haul.actualLoss.toFixed(1)}</div>
										<div class="text-xs sm:text-sm text-red-600">Actual Loss</div>
									</div>
									<div class="text-center p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
										<div class="metric-display text-slate-700 text-lg sm:text-2xl mb-2 leading-tight">{Math.abs(haul.actualLoss - haul.expectedLoss).toFixed(1)}</div>
										<div class="text-xs sm:text-sm text-slate-600">Variance</div>
									</div>
								</div>

								<!-- Variance Status -->
								<div class="text-center p-4 sm:p-6 {varianceStatus.color} rounded-xl border-2">
									<div class="text-3xl sm:text-4xl mb-3">{varianceStatus.icon}</div>
									<div class="text-xl sm:text-2xl font-bold mb-2">{varianceStatus.label}</div>
									<div class="text-xs sm:text-sm opacity-80 leading-relaxed">
										{#if varianceStatus.label === 'Good'}
											Variance within acceptable range (≤5%)
										{:else if varianceStatus.label === 'Low Variance'}
											Moderate variance detected (5-15%)
										{:else if varianceStatus.label === 'High Variance'}
											High variance requires investigation (>15%)
										{/if}
									</div>
									{#if haul.actualLoss !== undefined}
										<div class="mt-3 text-xs opacity-70">
											Variance: {(Math.abs(haul.actualLoss - haul.expectedLoss) / haul.expectedLoss * 100).toFixed(1)}%
										</div>
									{/if}
								</div>
							{:else}
								<div class="text-center p-6 sm:p-8 bg-slate-50 rounded-xl border border-slate-200">
									<div class="text-4xl mb-3">⏳</div>
									<div class="text-xl font-semibold text-slate-700 mb-2">Awaiting Offload</div>
									<div class="text-sm text-slate-600">
										{#if haul.status === 'loading'}
											Truck is currently loading at origin
										{:else if haul.status === 'transit'}
											Truck is in transit to destination
										{:else if haul.status === 'offloading'}
											Offload in progress...
										{/if}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Summary Card -->
			<div class="glass-card p-6 bg-gradient-to-br from-slate-50 to-slate-100">
				<h3 class="font-semibold text-oil-black mb-4">Summary</h3>
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
					<div>
						<div class="text-sm text-oil-gray">Start Time</div>
						<div class="font-mono text-oil-black">{haul.startTime.toLocaleTimeString()}</div>
					</div>
					<div>
						<div class="text-sm text-oil-gray">Duration</div>
						<div class="font-mono text-oil-black">
							{#if haul.endTime}
								{Math.round((haul.endTime.getTime() - haul.startTime.getTime()) / (1000 * 60))}m
							{:else}
								{Math.round((Date.now() - haul.startTime.getTime()) / (1000 * 60))}m (ongoing)
							{/if}
						</div>
					</div>
					<div>
						<div class="text-sm text-oil-gray">Driver Efficiency</div>
						<div class="font-mono text-oil-black">{driver.averageEfficiency.toFixed(1)}%</div>
					</div>
					<div>
						<div class="text-sm text-oil-gray">Truck Efficiency</div>
						<div class="font-mono text-oil-black">{truck.averageEfficiency.toFixed(1)}%</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div> 