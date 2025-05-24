<script lang="ts">
	import { scadaStatus } from '$lib/stores/haulStore';

	function getLatencyStatus(latency: number) {
		if (latency < 1.0) return { color: 'text-emerald-600', status: 'Excellent' };
		if (latency < 2.0) return { color: 'text-amber-600', status: 'Good' };
		return { color: 'text-red-600', status: 'Poor' };
	}

	function getHealthStatus(health: number) {
		if (health >= 99) return { color: 'bg-emerald-400', ring: 'ring-emerald-200' };
		if (health >= 95) return { color: 'bg-amber-400', ring: 'ring-amber-200' };
		return { color: 'bg-red-400', ring: 'ring-red-200' };
	}

	$: latencyInfo = getLatencyStatus($scadaStatus.dataLatency);
	$: healthInfo = getHealthStatus($scadaStatus.networkHealth);
</script>

<div class="glass-card p-6">
	<div class="flex items-center gap-3 mb-4">
		<div class="w-3 h-3 {$scadaStatus.systemOnline ? 'bg-emerald-400' : 'bg-red-400'} rounded-full shadow-sm animate-pulse"></div>
		<h3 class="font-semibold text-oil-black">SCADA Status</h3>
	</div>

	<!-- System Online Status -->
	<div class="flex items-center justify-between mb-4 p-3 bg-white/30 rounded-xl">
		<div class="flex items-center gap-2">
			<div class="text-lg">🖥️</div>
			<span class="text-sm font-medium text-oil-black">System</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm {$scadaStatus.systemOnline ? 'text-emerald-600' : 'text-red-600'} font-medium">
				{$scadaStatus.systemOnline ? 'Online' : 'Offline'}
			</span>
			<div class="w-2 h-2 {$scadaStatus.systemOnline ? 'bg-emerald-400' : 'bg-red-400'} rounded-full"></div>
		</div>
	</div>

	<!-- Connected Devices -->
	<div class="flex items-center justify-between mb-4 p-3 bg-white/30 rounded-xl">
		<div class="flex items-center gap-2">
			<div class="text-lg">📡</div>
			<span class="text-sm font-medium text-oil-black">Devices</span>
		</div>
		<div class="text-right">
			<div class="metric-display text-oil-blue text-lg">{$scadaStatus.connectedDevices}</div>
			<div class="text-xs text-oil-gray">Connected</div>
		</div>
	</div>

	<!-- Network Health -->
	<div class="flex items-center justify-between mb-4 p-3 bg-white/30 rounded-xl">
		<div class="flex items-center gap-2">
			<div class="text-lg">📶</div>
			<span class="text-sm font-medium text-oil-black">Network</span>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-sm font-mono text-oil-black">{$scadaStatus.networkHealth.toFixed(1)}%</span>
			<div class="w-3 h-3 {healthInfo.color} rounded-full ring-2 {healthInfo.ring}"></div>
		</div>
	</div>

	<!-- Data Latency -->
	<div class="flex items-center justify-between mb-4 p-3 bg-white/30 rounded-xl">
		<div class="flex items-center gap-2">
			<div class="text-lg">⚡</div>
			<span class="text-sm font-medium text-oil-black">Latency</span>
		</div>
		<div class="text-right">
			<div class="text-sm font-mono {latencyInfo.color}">{$scadaStatus.dataLatency.toFixed(2)}s</div>
			<div class="text-xs text-oil-gray">{latencyInfo.status}</div>
		</div>
	</div>

	<!-- Last Update -->
	<div class="text-center pt-4 border-t border-white/20">
		<div class="text-xs text-oil-gray">Last Update</div>
		<div class="font-mono text-xs text-oil-black mt-1">
			{$scadaStatus.lastUpdate.toLocaleTimeString()}
		</div>
	</div>
</div> 