<script lang="ts">
	import type { GasDetection } from '$lib/stores/haulStore';

	export let gasReading: GasDetection;
	export let compact: boolean = false;

	// Safety thresholds (industry standard)
	const thresholds = {
		h2s: { warning: 10, critical: 20 }, // PPM
		co: { warning: 35, critical: 200 }, // PPM
		lel: { warning: 10, critical: 25 }, // % LEL
		o2: { normal: { min: 19.5, max: 23.5 } } // % O2
	};

	function getSafetyStatus(value: number, threshold: { warning: number; critical: number }) {
		if (value >= threshold.critical) return 'critical';
		if (value >= threshold.warning) return 'warning';
		return 'normal';
	}

	function getO2Status(value: number) {
		if (value < thresholds.o2.normal.min || value > thresholds.o2.normal.max) return 'warning';
		return 'normal';
	}

	$: h2sExternalStatus = getSafetyStatus(gasReading.h2sExternal, thresholds.h2s);
	$: h2sInternalStatus = getSafetyStatus(gasReading.h2sInternal, thresholds.h2s);
	$: coExternalStatus = getSafetyStatus(gasReading.coExternal, thresholds.co);
	$: coInternalStatus = getSafetyStatus(gasReading.coInternal, thresholds.co);
	$: lelExternalStatus = getSafetyStatus(gasReading.lelExternal, thresholds.lel);
	$: lelInternalStatus = getSafetyStatus(gasReading.lelInternal, thresholds.lel);
	$: o2Status = getO2Status(gasReading.o2External);

	$: overallStatus = (() => {
		const statuses = [h2sExternalStatus, h2sInternalStatus, coExternalStatus, coInternalStatus, lelExternalStatus, lelInternalStatus, o2Status];
		if (statuses.includes('critical')) return 'critical';
		if (statuses.includes('warning')) return 'warning';
		return 'normal';
	})();

	$: statusColor = overallStatus === 'critical' ? 'red' : overallStatus === 'warning' ? 'amber' : 'emerald';
	$: statusIcon = overallStatus === 'critical' ? '🚨' : overallStatus === 'warning' ? '⚠️' : '✅';

	function getStatusClasses(status: string) {
		switch (status) {
			case 'critical': return 'bg-red-50 border-red-200 text-red-700';
			case 'warning': return 'bg-amber-50 border-amber-200 text-amber-700';
			default: return 'bg-emerald-50 border-emerald-200 text-emerald-700';
		}
	}
</script>

<div class="glass-card p-4 sm:p-6 {compact ? 'p-3' : ''}">
	<div class="flex items-center justify-between mb-4">
		<h3 class="font-semibold text-oil-black flex items-center gap-2 {compact ? 'text-sm' : ''}">
			<span class="text-lg {compact ? 'text-base' : ''}">{statusIcon}</span>
			Gas Detection System
		</h3>
		<div class="px-2 py-1 rounded-full text-xs font-medium border {getStatusClasses(overallStatus)}">
			{overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
		</div>
	</div>

	{#if compact}
		<!-- Compact View -->
		<div class="grid grid-cols-2 gap-2">
			<div class="text-center p-2 rounded-lg {getStatusClasses(h2sExternalStatus)}">
				<div class="text-xs font-medium">H2S</div>
				<div class="text-sm font-bold">{gasReading.h2sExternal.toFixed(1)} PPM</div>
			</div>
			<div class="text-center p-2 rounded-lg {getStatusClasses(coExternalStatus)}">
				<div class="text-xs font-medium">CO</div>
				<div class="text-sm font-bold">{gasReading.coExternal.toFixed(1)} PPM</div>
			</div>
			<div class="text-center p-2 rounded-lg {getStatusClasses(lelExternalStatus)}">
				<div class="text-xs font-medium">LEL</div>
				<div class="text-sm font-bold">{gasReading.lelExternal.toFixed(1)}%</div>
			</div>
			<div class="text-center p-2 rounded-lg {getStatusClasses(o2Status)}">
				<div class="text-xs font-medium">O2</div>
				<div class="text-sm font-bold">{gasReading.o2External.toFixed(1)}%</div>
			</div>
		</div>
	{:else}
		<!-- Full View -->
		<div class="space-y-4">
			<!-- H2S Readings -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="p-3 rounded-xl border {getStatusClasses(h2sExternalStatus)}">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">H2S External</span>
						<span class="text-xs">PPM</span>
					</div>
					<div class="text-2xl font-bold mb-1">{gasReading.h2sExternal.toFixed(1)}</div>
					<div class="text-xs opacity-75">
						Warning: {thresholds.h2s.warning} • Critical: {thresholds.h2s.critical}
					</div>
				</div>
				<div class="p-3 rounded-xl border {getStatusClasses(h2sInternalStatus)}">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">H2S Internal</span>
						<span class="text-xs">PPM</span>
					</div>
					<div class="text-2xl font-bold mb-1">{gasReading.h2sInternal.toFixed(1)}</div>
					<div class="text-xs opacity-75">
						Warning: {thresholds.h2s.warning} • Critical: {thresholds.h2s.critical}
					</div>
				</div>
			</div>

			<!-- CO Readings -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="p-3 rounded-xl border {getStatusClasses(coExternalStatus)}">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">CO External</span>
						<span class="text-xs">PPM</span>
					</div>
					<div class="text-2xl font-bold mb-1">{gasReading.coExternal.toFixed(1)}</div>
					<div class="text-xs opacity-75">
						Warning: {thresholds.co.warning} • Critical: {thresholds.co.critical}
					</div>
				</div>
				<div class="p-3 rounded-xl border {getStatusClasses(coInternalStatus)}">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">CO Internal</span>
						<span class="text-xs">PPM</span>
					</div>
					<div class="text-2xl font-bold mb-1">{gasReading.coInternal.toFixed(1)}</div>
					<div class="text-xs opacity-75">
						Warning: {thresholds.co.warning} • Critical: {thresholds.co.critical}
					</div>
				</div>
			</div>

			<!-- LEL and O2 Readings -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="p-3 rounded-xl border {getStatusClasses(lelExternalStatus)}">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">LEL External</span>
						<span class="text-xs">% LEL</span>
					</div>
					<div class="text-2xl font-bold mb-1">{gasReading.lelExternal.toFixed(1)}</div>
					<div class="text-xs opacity-75">
						Warning: {thresholds.lel.warning}% • Critical: {thresholds.lel.critical}%
					</div>
				</div>
				<div class="p-3 rounded-xl border {getStatusClasses(o2Status)}">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium">O2 External</span>
						<span class="text-xs">% O2</span>
					</div>
					<div class="text-2xl font-bold mb-1">{gasReading.o2External.toFixed(1)}</div>
					<div class="text-xs opacity-75">
						Normal: {thresholds.o2.normal.min}-{thresholds.o2.normal.max}%
					</div>
				</div>
			</div>
		</div>

		<!-- Safety Summary -->
		<div class="mt-4 p-3 bg-white/30 rounded-xl">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-oil-black">Safety Status</span>
				<div class="flex items-center gap-2">
					<span class="text-lg">{statusIcon}</span>
					<span class="text-sm font-medium capitalize text-oil-black">{overallStatus}</span>
				</div>
			</div>
			<div class="text-xs text-oil-gray mt-1">
				Last updated: {gasReading.timestamp.toLocaleTimeString()}
			</div>
		</div>
	{/if}
</div> 