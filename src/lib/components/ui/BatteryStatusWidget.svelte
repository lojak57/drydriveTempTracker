<script lang="ts">
	import { Battery, BatteryLow, Zap, MapPin, Clock } from 'lucide-svelte';
	
	export let items: Array<{
		id: string;
		label: string;
		value: string;
		status: 'excellent' | 'good' | 'warning' | 'critical';
		percentage?: number;
		sparklineData?: number[];
		location?: string;
		lastUpdated?: string;
	}> = [];
	
	export let viewMode: '3-card' | 'table' = '3-card';
	export let maxItems = 3;
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'excellent': return 'text-green-600 bg-green-100';
			case 'good': return 'text-blue-600 bg-blue-100';
			case 'warning': return 'text-orange-600 bg-orange-100';
			case 'critical': return 'text-red-600 bg-red-100';
			default: return 'text-slate-600 bg-slate-100';
		}
	}
	
	function getBatteryIcon(percentage: number) {
		return percentage > 25 ? Battery : BatteryLow;
	}
	
	function getBatteryColor(percentage: number) {
		if (percentage >= 75) return 'text-green-600';
		if (percentage >= 50) return 'text-blue-600';
		if (percentage >= 25) return 'text-orange-600';
		return 'text-red-600';
	}
	
	function generateSparkline(data: number[] = []) {
		if (data.length === 0) return '';
		
		const width = 40;
		const height = 16;
		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min || 1;
		
		const points = data.map((value, index) => {
			const x = (index / (data.length - 1)) * width;
			const y = height - ((value - min) / range) * height;
			return `${x},${y}`;
		}).join(' ');
		
		return `<svg width="${width}" height="${height}" class="sparkline">
			<polyline fill="none" stroke="currentColor" stroke-width="1.5" points="${points}"/>
		</svg>`;
	}
	
	$: displayItems = items.slice(0, viewMode === '3-card' ? maxItems : items.length);
</script>

<div class="battery-status-widget">
	{#if viewMode === '3-card'}
		<div class="card-grid grid grid-cols-1 md:grid-cols-3 gap-4">
			{#each displayItems as item}
				<div class="status-card bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
					<div class="card-header flex items-center justify-between mb-3">
						<div class="status-badge px-2 py-1 rounded-full text-xs font-semibold {getStatusColor(item.status)}">
							{item.status.toUpperCase()}
						</div>
						{#if item.percentage !== undefined}
							<div class="battery-indicator {getBatteryColor(item.percentage)}">
								<svelte:component this={getBatteryIcon(item.percentage)} size={16} />
								<span class="text-xs font-mono ml-1">{item.percentage}%</span>
							</div>
						{/if}
					</div>
					
					<div class="card-content">
						<h3 class="text-sm font-semibold text-white mb-1">{item.label}</h3>
						<div class="metric-row flex items-center justify-between">
							<span class="text-lg font-bold font-mono text-white">{item.value}</span>
							{#if item.sparklineData}
								<div class="sparkline-container {getStatusColor(item.status).split(' ')[0]}">
									{@html generateSparkline(item.sparklineData)}
								</div>
							{/if}
						</div>
						
						{#if item.location || item.lastUpdated}
							<div class="card-footer mt-2 pt-2 border-t border-slate-600">
								{#if item.location}
									<div class="location flex items-center gap-1 text-xs text-slate-300">
										<MapPin size={12} />
										{item.location}
									</div>
								{/if}
								{#if item.lastUpdated}
									<div class="timestamp flex items-center gap-1 text-xs text-slate-300">
										<Clock size={12} />
										{item.lastUpdated}
									</div>
								{/if}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="table-view bg-white rounded-xl border shadow-sm overflow-hidden">
			<div class="table-header bg-slate-50 px-4 py-3 border-b">
				<h3 class="text-sm font-semibold text-slate-800">Status Overview</h3>
			</div>
			<div class="table-content">
				{#each displayItems as item}
					<div class="table-row flex items-center justify-between p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
						<div class="row-info flex-1">
							<div class="row-header flex items-center gap-2 mb-1">
								<div class="status-dot w-2 h-2 rounded-full {getStatusColor(item.status).split(' ')[1]}"></div>
								<span class="text-sm font-medium text-slate-800">{item.label}</span>
							</div>
							{#if item.location}
								<div class="location text-xs text-slate-500 flex items-center gap-1">
									<MapPin size={10} />
									{item.location}
								</div>
							{/if}
						</div>
						
						<div class="row-metrics flex items-center gap-4">
							{#if item.sparklineData}
								<div class="sparkline-container {getStatusColor(item.status).split(' ')[0]}">
									{@html generateSparkline(item.sparklineData)}
								</div>
							{/if}
							<span class="metric-value text-sm font-bold font-mono text-slate-900">{item.value}</span>
							{#if item.percentage !== undefined}
								<div class="battery-indicator {getBatteryColor(item.percentage)} flex items-center gap-1">
									<svelte:component this={getBatteryIcon(item.percentage)} size={14} />
									<span class="text-xs font-mono">{item.percentage}%</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	{#if items.length > maxItems && viewMode === '3-card'}
		<div class="view-toggle mt-4 text-center">
			<button 
				class="toggle-btn text-sm text-slate-600 hover:text-slate-800 font-medium"
				on:click={() => viewMode = 'table'}
			>
				View All {items.length} Items →
			</button>
		</div>
	{:else if viewMode === 'table'}
		<div class="view-toggle mt-4 text-center">
			<button 
				class="toggle-btn text-sm text-slate-600 hover:text-slate-800 font-medium"
				on:click={() => viewMode = '3-card'}
			>
				← Back to Card View
			</button>
		</div>
	{/if}
</div>

<style>
	.sparkline {
		display: block;
	}
	
	.status-card {
		min-height: 140px;
	}
	
	.battery-indicator {
		display: flex;
		align-items: center;
		font-weight: 600;
	}
	
	.toggle-btn:hover {
		text-decoration: underline;
	}
	
	/* Mobile-first responsive design */
	@media (max-width: 768px) {
		.card-grid {
			grid-template-columns: 1fr;
		}
		
		.status-card {
			min-height: 120px;
		}
		
		.table-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		
		.row-metrics {
			width: 100%;
			justify-content: space-between;
		}
	}
</style> 