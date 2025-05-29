<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Haul, Driver, Truck } from '$lib/stores/haulStore';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';

	export let haul: Haul;
	export let driver: Driver;
	export let truck: Truck;

	const dispatch = createEventDispatcher();

	// Tab management
	let activeTab = 'overview';
	const tabs = [
		{ id: 'overview', label: 'Overview', icon: '📊' },
		{ id: 'coriolis', label: 'Coriolis', icon: '🛢️' },
		{ id: 'temperature', label: 'Temperature', icon: '🌡️' },
		{ id: 'pressure', label: 'Pressure', icon: '⚡' },
		{ id: 'safety', label: 'Safety', icon: '🛡️' },
		{ id: 'drydrive', label: 'DryDrive', icon: '⚙️' }
	];

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

	function getSafetyStatus(value: number, thresholds: { warning: number; critical: number }) {
		if (value >= thresholds.critical) return 'critical';
		if (value >= thresholds.warning) return 'warning';
		return 'normal';
	}

	$: latestReading = haul.temperatureReadings[haul.temperatureReadings.length - 1];
	$: latestCoriolis = haul.coriolisReadings[haul.coriolisReadings.length - 1];
	$: latestPressure = haul.pressureReadings[haul.pressureReadings.length - 1];
	$: latestGas = haul.gasDetections[haul.gasDetections.length - 1];
	$: latestScada = haul.scadaReadings[haul.scadaReadings.length - 1];
	$: latestDryDrive = haul.dryDriveData[haul.dryDriveData.length - 1];
	$: varianceStatus = getVarianceStatus(haul.expectedLoss, haul.actualLoss);
	$: isCompleted = haul.status === 'completed' || haul.status === 'offloading';
</script>

<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
	<div class="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
		<!-- Header -->
		<div class="bg-white/90 backdrop-blur-md rounded-t-3xl border-b border-slate-200/50 p-6 flex-shrink-0">
			<div class="flex items-center justify-between mb-4">
				<div>
					<h2 class="display-medium text-oil-black">Haul Details</h2>
					<p class="text-oil-gray">ID: {haul.id.slice(-8)} • {truck.plateNumber} • {driver.name}</p>
				</div>
				<button 
					on:click={() => dispatch('close')}
					class="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
				>
					<span class="text-slate-600">✕</span>
				</button>
			</div>

			<!-- Tab Navigation -->
			<div class="flex space-x-1 bg-slate-100 rounded-xl p-1">
				{#each tabs as tab}
					<button
						class="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 {activeTab === tab.id ? 'bg-white text-oil-black shadow-sm' : 'text-oil-gray hover:text-oil-black'}"
						on:click={() => activeTab = tab.id}
					>
						<span class="text-base">{tab.icon}</span>
						<span class="hidden sm:inline">{tab.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Tab Content -->
		<div class="flex-1 overflow-y-auto p-6">
			{#if activeTab === 'overview'}
				<!-- Overview Tab - Enhanced version of original content -->
				<div class="space-y-6">
					<!-- Route Overview -->
					<div class="glass-card p-6">
						<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
							<span class="text-lg">🛣️</span>
							Route Information
						</h3>
						<div class="flex flex-col sm:flex-row items-center gap-4">
							<div class="w-full sm:flex-1 text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
								<div class="text-2xl mb-2">📍</div>
								<div class="font-semibold text-emerald-700">{haul.onloadSite.name}</div>
								<div class="text-sm text-emerald-600">Origin</div>
							</div>
							
							<div class="hidden sm:flex items-center gap-2">
								<div class="w-12 h-1 bg-gradient-to-r from-emerald-400 to-oil-blue rounded"></div>
								<span class="text-2xl">→</span>
								<div class="w-12 h-1 bg-gradient-to-r from-oil-blue to-orange-400 rounded"></div>
							</div>
							
							<div class="w-full sm:flex-1 text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
								<div class="text-2xl mb-2">🏭</div>
								<div class="font-semibold text-orange-700">{haul.offloadSite.name}</div>
								<div class="text-sm text-orange-600">Destination</div>
							</div>
						</div>
					</div>

					<!-- Key Metrics Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div class="glass-card p-4 text-center">
							<div class="text-2xl mb-2">🛢️</div>
							<div class="metric-display text-oil-orange text-2xl mb-1">{haul.initialVolume.toLocaleString()}</div>
							<div class="text-sm text-oil-gray">Initial Volume (gal)</div>
						</div>
						<div class="glass-card p-4 text-center">
							<div class="text-2xl mb-2">📊</div>
							<div class="metric-display text-oil-blue text-2xl mb-1">{haul.transitProgress}%</div>
							<div class="text-sm text-oil-gray">Transit Progress</div>
						</div>
						<div class="glass-card p-4 text-center">
							<div class="text-2xl mb-2">⏱️</div>
							<div class="metric-display text-amber-600 text-2xl mb-1">{haul.estimatedTimeRemaining}</div>
							<div class="text-sm text-oil-gray">Minutes Remaining</div>
						</div>
						<div class="glass-card p-4 text-center">
							<div class="text-2xl mb-2">🎯</div>
							<div class="metric-display text-emerald-600 text-2xl mb-1">{haul.expectedLoss.toFixed(1)}</div>
							<div class="text-sm text-oil-gray">Expected Loss (gal)</div>
						</div>
					</div>

					<!-- Status Summary -->
					<div class="glass-card p-6">
						<h3 class="font-semibold text-oil-black mb-4">Current Status</h3>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div class="text-center p-4 bg-blue-50 rounded-xl">
								<div class="text-xl mb-2">🚛</div>
								<div class="font-semibold text-blue-700 capitalize">{haul.status}</div>
								<div class="text-sm text-blue-600">Haul Status</div>
							</div>
							<div class="text-center p-4 bg-emerald-50 rounded-xl">
								<div class="text-xl mb-2">👨‍💼</div>
								<div class="font-semibold text-emerald-700">{driver.averageEfficiency.toFixed(1)}%</div>
								<div class="text-sm text-emerald-600">Driver Efficiency</div>
							</div>
							<div class="text-center p-4 bg-amber-50 rounded-xl">
								<div class="text-xl mb-2">🚚</div>
								<div class="font-semibold text-amber-700">{truck.averageEfficiency.toFixed(1)}%</div>
								<div class="text-sm text-amber-600">Truck Efficiency</div>
							</div>
						</div>
					</div>
				</div>

			{:else if activeTab === 'coriolis'}
				<!-- Coriolis Tab -->
				<div class="space-y-6">
					<div class="text-center mb-6">
						<h3 class="text-2xl font-semibold text-oil-black mb-2">Coriolis Meter Readings</h3>
						<p class="text-oil-gray">Real-time volume, flow, and gravity measurements</p>
					</div>

					{#if latestCoriolis}
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🛢️</div>
								<div class="metric-display text-oil-orange text-3xl mb-2">{latestCoriolis.netVolume.toFixed(1)}</div>
								<div class="text-oil-gray font-medium">Net Volume (BBL)</div>
								<div class="mt-2 text-sm text-oil-gray">Real-time measurement</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🌊</div>
								<div class="metric-display text-blue-600 text-3xl mb-2">{latestCoriolis.massFlowRate.toFixed(2)}</div>
								<div class="text-oil-gray font-medium">Mass Flow Rate (BBL/min)</div>
								<div class="mt-2 text-sm text-oil-gray">Current flow</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">⚖️</div>
								<div class="metric-display text-emerald-600 text-3xl mb-2">{latestCoriolis.apiGravity.toFixed(1)}°</div>
								<div class="text-oil-gray font-medium">API Gravity</div>
								<div class="mt-2 text-sm text-oil-gray">Oil density measure</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">💧</div>
								<div class="metric-display text-amber-600 text-3xl mb-2">{latestCoriolis.waterCut.toFixed(2)}%</div>
								<div class="text-oil-gray font-medium">Water Cut</div>
								<div class="mt-2 text-sm text-oil-gray">Water content</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🌡️</div>
								<div class="metric-display text-red-600 text-3xl mb-2">{latestCoriolis.oilTemp.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Oil Temperature</div>
								<div class="mt-2 text-sm text-oil-gray">At meter</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">💨</div>
								<div class="metric-display text-purple-600 text-3xl mb-2">{latestCoriolis.entrainedGas.toFixed(2)}%</div>
								<div class="text-oil-gray font-medium">Entrained Gas</div>
								<div class="mt-2 text-sm text-oil-gray">Gas content</div>
							</div>
						</div>

						<!-- Coriolis Trends Chart -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">Volume & Flow Trends</h4>
							<RealtimeChart 
								title="Volume & Flow Rate"
								color="#004E89"
								height={300}
								unit=" BBL/min"
								animated={true}
							/>
						</div>
					{:else}
						<div class="text-center py-12">
							<div class="text-4xl mb-4">📊</div>
							<div class="text-xl text-oil-gray">No Coriolis data available</div>
						</div>
					{/if}
				</div>

			{:else if activeTab === 'temperature'}
				<!-- Temperature Tab -->
				<div class="space-y-6">
					<div class="text-center mb-6">
						<h3 class="text-2xl font-semibold text-oil-black mb-2">Temperature Monitoring</h3>
						<p class="text-oil-gray">Multi-sensor temperature tracking and analysis</p>
					</div>

					{#if latestReading}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🌡️</div>
								<div class="metric-display text-blue-600 text-3xl mb-2">{latestReading.internal.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Internal Oil Temperature</div>
								<div class="mt-2 text-sm text-oil-gray">Primary measurement</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">☀️</div>
								<div class="metric-display text-orange-600 text-3xl mb-2">{latestReading.ambient.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Ambient Temperature</div>
								<div class="mt-2 text-sm text-oil-gray">External conditions</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🚛</div>
								<div class="metric-display text-emerald-600 text-3xl mb-2">{latestReading.tankerTemp.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Tanker Temperature</div>
								<div class="mt-2 text-sm text-oil-gray">Tank wall temperature</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🛢️</div>
								<div class="metric-display text-red-600 text-3xl mb-2">{latestReading.oilTemp.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Oil Temperature</div>
								<div class="mt-2 text-sm text-oil-gray">Product temperature</div>
							</div>
						</div>

						<!-- Temperature Differential Analysis -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">Temperature Analysis</h4>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div class="text-center p-4 bg-blue-50 rounded-xl">
									<div class="text-lg mb-2">🔄</div>
									<div class="font-semibold text-blue-700">{(latestReading.ambient - latestReading.internal).toFixed(1)}°F</div>
									<div class="text-sm text-blue-600">Ambient Differential</div>
								</div>
								<div class="text-center p-4 bg-emerald-50 rounded-xl">
									<div class="text-lg mb-2">📊</div>
									<div class="font-semibold text-emerald-700">{(latestReading.tankerTemp - latestReading.oilTemp).toFixed(1)}°F</div>
									<div class="text-sm text-emerald-600">Tank Differential</div>
								</div>
								<div class="text-center p-4 bg-amber-50 rounded-xl">
									<div class="text-lg mb-2">⚡</div>
									<div class="font-semibold text-amber-700">Normal</div>
									<div class="text-sm text-amber-600">Thermal Status</div>
								</div>
							</div>
						</div>

						<!-- Temperature Trends Chart -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">Temperature Trends</h4>
							<RealtimeChart 
								title="Multi-Sensor Temperature"
								color="#FF6B35"
								height={300}
								unit="°F"
								animated={true}
							/>
						</div>
					{:else}
						<div class="text-center py-12">
							<div class="text-4xl mb-4">🌡️</div>
							<div class="text-xl text-oil-gray">No temperature data available</div>
						</div>
					{/if}
				</div>

			{:else if activeTab === 'pressure'}
				<!-- Pressure Tab -->
				<div class="space-y-6">
					<div class="text-center mb-6">
						<h3 class="text-2xl font-semibold text-oil-black mb-2">Pressure Systems</h3>
						<p class="text-oil-gray">Comprehensive pressure monitoring and safety thresholds</p>
					</div>

					{#if latestPressure}
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">⬆️</div>
								<div class="metric-display text-emerald-600 text-3xl mb-2">{latestPressure.tankerOnLoad.toFixed(1)}</div>
								<div class="text-oil-gray font-medium">Tanker OnLoad (PSI)</div>
								<div class="mt-2 text-sm text-emerald-600">✓ Normal Range</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">⬇️</div>
								<div class="metric-display text-blue-600 text-3xl mb-2">{latestPressure.tankerOffLoad.toFixed(1)}</div>
								<div class="text-oil-gray font-medium">Tanker OffLoad (PSI)</div>
								<div class="mt-2 text-sm text-blue-600">✓ Vacuum Normal</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🔄</div>
								<div class="metric-display text-amber-600 text-3xl mb-2">{latestPressure.tankerInternal.toFixed(1)}</div>
								<div class="text-oil-gray font-medium">Internal Pressure (PSI)</div>
								<div class="mt-2 text-sm text-amber-600">✓ Optimal</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">💨</div>
								<div class="metric-display text-purple-600 text-3xl mb-2">{latestPressure.tankVentLine.toFixed(1)}</div>
								<div class="text-oil-gray font-medium">Vent Line (PSI)</div>
								<div class="mt-2 text-sm text-purple-600">✓ Safe</div>
							</div>
						</div>

						<!-- Pressure Safety Thresholds -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">Safety Thresholds</h4>
							<div class="space-y-4">
								<div class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
									<span class="font-medium text-emerald-700">OnLoad Pressure</span>
									<div class="text-right">
										<div class="text-emerald-700 font-semibold">{latestPressure.tankerOnLoad.toFixed(1)} PSI</div>
										<div class="text-sm text-emerald-600">Safe: 120-180 PSI</div>
									</div>
								</div>
								<div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
									<span class="font-medium text-blue-700">Internal Pressure</span>
									<div class="text-right">
										<div class="text-blue-700 font-semibold">{latestPressure.tankerInternal.toFixed(1)} PSI</div>
										<div class="text-sm text-blue-600">Safe: 10-20 PSI</div>
									</div>
								</div>
								<div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
									<span class="font-medium text-purple-700">Vent Line</span>
									<div class="text-right">
										<div class="text-purple-700 font-semibold">{latestPressure.tankVentLine.toFixed(1)} PSI</div>
										<div class="text-sm text-purple-600">Safe: 0-5 PSI</div>
									</div>
								</div>
							</div>
						</div>

						<!-- Pressure Trends Chart -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">Pressure Trends</h4>
							<RealtimeChart 
								title="Pressure System Monitoring"
								color="#10b981"
								height={300}
								unit=" PSI"
								animated={true}
							/>
						</div>
					{:else}
						<div class="text-center py-12">
							<div class="text-4xl mb-4">⚡</div>
							<div class="text-xl text-oil-gray">No pressure data available</div>
						</div>
					{/if}
				</div>

			{:else if activeTab === 'safety'}
				<!-- Safety Tab -->
				<div class="space-y-6">
					<div class="text-center mb-6">
						<h3 class="text-2xl font-semibold text-oil-black mb-2">Safety Systems</h3>
						<p class="text-oil-gray">Gas detection, valve status, and safety alerts</p>
					</div>

					{#if latestGas}
						<!-- Gas Detection Grid -->
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">☠️</div>
								<div class="metric-display text-red-600 text-2xl mb-2">{latestGas.h2sExternal.toFixed(1)} PPM</div>
								<div class="text-oil-gray font-medium">H2S External</div>
								<div class="mt-2 text-sm {getSafetyStatus(latestGas.h2sExternal, {warning: 10, critical: 20}) === 'normal' ? 'text-emerald-600' : 'text-red-600'}">
									{getSafetyStatus(latestGas.h2sExternal, {warning: 10, critical: 20}) === 'normal' ? '✓ Safe' : '⚠️ Monitor'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🏠</div>
								<div class="metric-display text-red-600 text-2xl mb-2">{latestGas.h2sInternal.toFixed(1)} PPM</div>
								<div class="text-oil-gray font-medium">H2S Internal</div>
								<div class="mt-2 text-sm {getSafetyStatus(latestGas.h2sInternal, {warning: 10, critical: 20}) === 'normal' ? 'text-emerald-600' : 'text-red-600'}">
									{getSafetyStatus(latestGas.h2sInternal, {warning: 10, critical: 20}) === 'normal' ? '✓ Safe' : '⚠️ Monitor'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">💨</div>
								<div class="metric-display text-blue-600 text-2xl mb-2">{latestGas.coExternal.toFixed(1)} PPM</div>
								<div class="text-oil-gray font-medium">CO External</div>
								<div class="mt-2 text-sm {getSafetyStatus(latestGas.coExternal, {warning: 35, critical: 200}) === 'normal' ? 'text-emerald-600' : 'text-red-600'}">
									{getSafetyStatus(latestGas.coExternal, {warning: 35, critical: 200}) === 'normal' ? '✓ Safe' : '⚠️ Monitor'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🔥</div>
								<div class="metric-display text-amber-600 text-2xl mb-2">{latestGas.lelExternal.toFixed(1)}%</div>
								<div class="text-oil-gray font-medium">LEL External</div>
								<div class="mt-2 text-sm {getSafetyStatus(latestGas.lelExternal, {warning: 10, critical: 25}) === 'normal' ? 'text-emerald-600' : 'text-red-600'}">
									{getSafetyStatus(latestGas.lelExternal, {warning: 10, critical: 25}) === 'normal' ? '✓ Safe' : '⚠️ Monitor'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">💨</div>
								<div class="metric-display text-emerald-600 text-2xl mb-2">{latestGas.o2External.toFixed(1)}%</div>
								<div class="text-oil-gray font-medium">O2 External</div>
								<div class="mt-2 text-sm {getSafetyStatus(Math.abs(latestGas.o2External - 20.9), {warning: 1, critical: 3}) === 'normal' ? 'text-emerald-600' : 'text-red-600'}">
									{getSafetyStatus(Math.abs(latestGas.o2External - 20.9), {warning: 1, critical: 3}) === 'normal' ? '✓ Normal' : '⚠️ Monitor'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🛡️</div>
								<div class="metric-display text-emerald-600 text-2xl mb-2">All Clear</div>
								<div class="text-oil-gray font-medium">Safety Status</div>
								<div class="mt-2 text-sm text-emerald-600">✓ Systems Normal</div>
							</div>
						</div>

						<!-- Safety Alerts -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">Active Safety Alerts</h4>
							<div class="text-center py-8">
								<div class="text-4xl mb-3">✅</div>
								<div class="text-xl font-semibold text-emerald-700 mb-2">No Active Alerts</div>
								<div class="text-emerald-600">All safety systems operating normally</div>
							</div>
						</div>
					{:else}
						<div class="text-center py-12">
							<div class="text-4xl mb-4">🛡️</div>
							<div class="text-xl text-oil-gray">No safety data available</div>
						</div>
					{/if}
				</div>

			{:else if activeTab === 'drydrive'}
				<!-- DryDrive Tab -->
				<div class="space-y-6">
					<div class="text-center mb-6">
						<h3 class="text-2xl font-semibold text-oil-black mb-2">DryDrive System</h3>
						<p class="text-oil-gray">Pump performance and electrical system monitoring</p>
					</div>

					{#if latestDryDrive}
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">⚙️</div>
								<div class="metric-display text-blue-600 text-3xl mb-2">{latestDryDrive.pumpRpm.toFixed(0)}</div>
								<div class="text-oil-gray font-medium">Pump RPM</div>
								<div class="mt-2 text-sm text-blue-600">✓ Optimal Speed</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🌡️</div>
								<div class="metric-display text-red-600 text-3xl mb-2">{latestDryDrive.pumpTemp.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Pump Temperature</div>
								<div class="mt-2 text-sm {latestDryDrive.pumpTemp > 200 ? 'text-red-600' : 'text-emerald-600'}">
									{latestDryDrive.pumpTemp > 200 ? '⚠️ High' : '✓ Normal'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">⚡</div>
								<div class="metric-display text-amber-600 text-3xl mb-2">{latestDryDrive.inverterVoltage.toFixed(1)}V</div>
								<div class="text-oil-gray font-medium">Inverter Voltage</div>
								<div class="mt-2 text-sm text-amber-600">✓ Stable</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🔥</div>
								<div class="metric-display text-orange-600 text-3xl mb-2">{latestDryDrive.inverterTemp.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Inverter Temp</div>
								<div class="mt-2 text-sm {latestDryDrive.inverterTemp > 160 ? 'text-red-600' : 'text-emerald-600'}">
									{latestDryDrive.inverterTemp > 160 ? '⚠️ High' : '✓ Normal'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">🔧</div>
								<div class="metric-display text-purple-600 text-3xl mb-2">{latestDryDrive.motorTemp.toFixed(1)}°F</div>
								<div class="text-oil-gray font-medium">Motor Temperature</div>
								<div class="mt-2 text-sm {latestDryDrive.motorTemp > 180 ? 'text-red-600' : 'text-emerald-600'}">
									{latestDryDrive.motorTemp > 180 ? '⚠️ High' : '✓ Normal'}
								</div>
							</div>

							<div class="glass-card p-6 text-center">
								<div class="text-3xl mb-3">⏱️</div>
								<div class="metric-display text-emerald-600 text-3xl mb-2">{latestDryDrive.totalPumpTime}</div>
								<div class="text-oil-gray font-medium">Runtime (min)</div>
								<div class="mt-2 text-sm text-emerald-600">✓ Tracking</div>
							</div>
						</div>

						<!-- System Performance Summary -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">System Performance</h4>
							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div class="text-center p-4 bg-emerald-50 rounded-xl">
									<div class="text-lg mb-2">✅</div>
									<div class="font-semibold text-emerald-700">Excellent</div>
									<div class="text-sm text-emerald-600">Overall Performance</div>
								</div>
								<div class="text-center p-4 bg-blue-50 rounded-xl">
									<div class="text-lg mb-2">⚡</div>
									<div class="font-semibold text-blue-700">98.5%</div>
									<div class="text-sm text-blue-600">Efficiency Rating</div>
								</div>
								<div class="text-center p-4 bg-amber-50 rounded-xl">
									<div class="text-lg mb-2">🔧</div>
									<div class="font-semibold text-amber-700">Normal</div>
									<div class="text-sm text-amber-600">Maintenance Status</div>
								</div>
							</div>
						</div>

						<!-- Performance Trends Chart -->
						<div class="glass-card p-6">
							<h4 class="font-semibold text-oil-black mb-4">Performance Trends</h4>
							<RealtimeChart 
								title="DryDrive Performance Metrics"
								color="#8b5cf6"
								height={300}
								unit="%"
								animated={true}
							/>
						</div>
					{:else}
						<div class="text-center py-12">
							<div class="text-4xl mb-4">⚙️</div>
							<div class="text-xl text-oil-gray">No DryDrive data available</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div> 