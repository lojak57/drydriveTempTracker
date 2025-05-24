<script lang="ts">
	import { activeHauls } from '$lib/stores/haulStore';
	import { onMount } from 'svelte';

	let feedData: Array<{
		timestamp: Date;
		type: 'temp' | 'location' | 'status' | 'system';
		message: string;
		value?: string;
		severity: 'info' | 'warning' | 'success';
	}> = [];

	function addFeedItem(type: any, message: string, value?: string, severity: 'info' | 'warning' | 'success' = 'info') {
		feedData = [
			{
				timestamp: new Date(),
				type,
				message,
				value,
				severity
			},
			...feedData.slice(0, 4) // Keep only last 5 items
		];
	}

	function getSeverityIcon(severity: string) {
		switch (severity) {
			case 'warning': return '⚠️';
			case 'success': return '✅';
			default: return 'ℹ️';
		}
	}

	function getSeverityColor(severity: string) {
		switch (severity) {
			case 'warning': return 'text-amber-600 bg-amber-50';
			case 'success': return 'text-emerald-600 bg-emerald-50';
			default: return 'text-blue-600 bg-blue-50';
		}
	}

	onMount(() => {
		// Add initial feed items
		addFeedItem('system', 'SCADA system initialized', 'Online', 'success');
		
		// Add periodic feed updates
		const interval = setInterval(() => {
			const messages = [
				{ type: 'temp', message: 'Temperature reading updated', severity: 'info' },
				{ type: 'location', message: 'GPS position updated', severity: 'info' },
				{ type: 'system', message: 'Heartbeat received from truck', severity: 'success' },
				{ type: 'temp', message: 'High ambient temperature detected', severity: 'warning' }
			];
			
			const randomMessage = messages[Math.floor(Math.random() * messages.length)];
			addFeedItem(
				randomMessage.type, 
				randomMessage.message, 
				undefined, 
				randomMessage.severity as 'info' | 'warning' | 'success'
			);
		}, 8000); // Add new feed item every 8 seconds

		return () => clearInterval(interval);
	});
</script>

<div class="glass-card p-6">
	<div class="flex items-center gap-3 mb-4">
		<div class="w-3 h-3 bg-blue-400 rounded-full shadow-sm animate-pulse"></div>
		<h3 class="font-semibold text-oil-black">Live Data Feed</h3>
	</div>

	<div class="space-y-3 max-h-64 overflow-y-auto">
		{#each feedData as item (item.timestamp.getTime())}
			<div class="flex items-start gap-3 p-3 rounded-xl {getSeverityColor(item.severity)} transition-all duration-300 fade-in">
				<div class="text-sm flex-shrink-0">
					{getSeverityIcon(item.severity)}
				</div>
				<div class="flex-1 min-w-0">
					<div class="text-sm font-medium text-oil-black truncate">
						{item.message}
					</div>
					{#if item.value}
						<div class="text-xs font-mono text-oil-gray mt-1">
							{item.value}
						</div>
					{/if}
					<div class="text-xs text-oil-gray mt-1">
						{item.timestamp.toLocaleTimeString()}
					</div>
				</div>
			</div>
		{/each}

		{#if feedData.length === 0}
			<div class="text-center py-8 text-oil-gray">
				<div class="text-2xl mb-2">📡</div>
				<div class="text-sm">Waiting for data...</div>
			</div>
		{/if}
	</div>

	<!-- Real-time indicator -->
	<div class="flex items-center justify-center pt-4 border-t border-white/20">
		<div class="flex items-center gap-2">
			<div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
			<span class="text-xs text-oil-gray">Real-time data stream</span>
		</div>
	</div>
</div> 