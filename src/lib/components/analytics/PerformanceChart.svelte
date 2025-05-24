<script lang="ts">
	export let data: Array<{
		week: string;
		efficiency: number;
		volume: number;
		loss: number;
	}>;

	$: maxVolume = Math.max(...data.map(d => d.volume));
	$: maxEfficiency = Math.max(...data.map(d => d.efficiency));
</script>

<div class="glass-card p-6">
	<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
		<span class="text-lg">📈</span>
		Performance Trends
	</h3>
	
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Efficiency Trend -->
		<div>
			<h4 class="text-sm font-medium text-oil-black mb-4">Volume Efficiency (%)</h4>
			<div class="space-y-3">
				{#each data as point, index}
					<div class="flex items-center gap-4">
						<div class="w-16 text-xs text-oil-gray font-medium">{point.week}</div>
						<div class="flex-1 relative">
							<div class="w-full bg-slate-200 rounded-full h-3">
								<div 
									class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-700 relative"
									style="width: {(point.efficiency / 100) * 100}%"
								>
									<div class="absolute right-0 top-0 w-3 h-3 bg-white rounded-full shadow-sm transform translate-x-1/2"></div>
								</div>
							</div>
						</div>
						<div class="w-12 text-xs font-mono {point.efficiency >= 97 ? 'text-emerald-600' : point.efficiency >= 95 ? 'text-amber-600' : 'text-red-600'}">
							{point.efficiency.toFixed(1)}%
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Volume Trend -->
		<div>
			<h4 class="text-sm font-medium text-oil-black mb-4">Volume Transported (gallons)</h4>
			<div class="space-y-3">
				{#each data as point, index}
					<div class="flex items-center gap-4">
						<div class="w-16 text-xs text-oil-gray font-medium">{point.week}</div>
						<div class="flex-1 relative">
							<div class="w-full bg-slate-200 rounded-full h-3">
								<div 
									class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700 relative"
									style="width: {(point.volume / maxVolume) * 100}%"
								>
									<div class="absolute right-0 top-0 w-3 h-3 bg-white rounded-full shadow-sm transform translate-x-1/2"></div>
								</div>
							</div>
						</div>
						<div class="w-16 text-xs font-mono text-blue-600">
							{(point.volume / 1000).toFixed(0)}k
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Summary Stats -->
	<div class="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-200">
		<div class="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
			<div class="metric-display text-emerald-700 text-xl mb-1">
				{data[data.length - 1]?.efficiency.toFixed(1)}%
			</div>
			<div class="text-xs text-emerald-600">Current Efficiency</div>
		</div>
		
		<div class="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
			<div class="metric-display text-blue-700 text-xl mb-1">
				{((data.reduce((sum, d) => sum + d.volume, 0)) / 1000).toFixed(0)}k
			</div>
			<div class="text-xs text-blue-600">Total Volume</div>
		</div>
		
		<div class="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
			<div class="metric-display text-amber-700 text-xl mb-1">
				{data.reduce((sum, d) => sum + d.loss, 0).toFixed(0)}
			</div>
			<div class="text-xs text-amber-600">Total Loss (gal)</div>
		</div>
	</div>
</div> 