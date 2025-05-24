<script lang="ts">
	import type { Haul } from '$lib/stores/haulStore';

	export let hauls: Haul[];

	// Calculate variance distribution
	$: varianceData = hauls.map(haul => {
		const variance = Math.abs((haul.actualLoss! - haul.expectedLoss) / haul.expectedLoss * 100);
		return {
			id: haul.id,
			variance,
			category: variance <= 5 ? 'good' : variance <= 15 ? 'moderate' : 'high'
		};
	});

	$: distributionStats = {
		good: varianceData.filter(d => d.category === 'good').length,
		moderate: varianceData.filter(d => d.category === 'moderate').length,
		high: varianceData.filter(d => d.category === 'high').length,
		total: varianceData.length
	};

	$: averageVariance = varianceData.length > 0 
		? varianceData.reduce((sum, d) => sum + d.variance, 0) / varianceData.length 
		: 0;

	function getVarianceColor(category: string) {
		switch (category) {
			case 'good': return 'bg-emerald-500';
			case 'moderate': return 'bg-amber-500';
			case 'high': return 'bg-red-500';
			default: return 'bg-slate-500';
		}
	}
</script>

<div class="glass-card p-6">
	<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
		<span class="text-lg">⚖️</span>
		Loss Variance Analysis
	</h3>

	<!-- Variance Distribution Chart -->
	<div class="mb-6">
		<h4 class="text-sm font-medium text-oil-black mb-4">Variance Distribution</h4>
		<div class="space-y-3">
			<!-- Good (≤5%) -->
			<div class="flex items-center gap-4">
				<div class="w-20 text-xs text-emerald-700 font-medium">Good (≤5%)</div>
				<div class="flex-1 relative">
					<div class="w-full bg-slate-200 rounded-full h-4">
						<div 
							class="bg-emerald-500 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
							style="width: {distributionStats.total > 0 ? (distributionStats.good / distributionStats.total) * 100 : 0}%"
						>
							{#if distributionStats.good > 0}
								<span class="text-white text-xs font-bold">{distributionStats.good}</span>
							{/if}
						</div>
					</div>
				</div>
				<div class="w-12 text-xs font-mono text-emerald-600">
					{distributionStats.total > 0 ? ((distributionStats.good / distributionStats.total) * 100).toFixed(0) : 0}%
				</div>
			</div>

			<!-- Moderate (5-15%) -->
			<div class="flex items-center gap-4">
				<div class="w-20 text-xs text-amber-700 font-medium">Moderate</div>
				<div class="flex-1 relative">
					<div class="w-full bg-slate-200 rounded-full h-4">
						<div 
							class="bg-amber-500 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
							style="width: {distributionStats.total > 0 ? (distributionStats.moderate / distributionStats.total) * 100 : 0}%"
						>
							{#if distributionStats.moderate > 0}
								<span class="text-white text-xs font-bold">{distributionStats.moderate}</span>
							{/if}
						</div>
					</div>
				</div>
				<div class="w-12 text-xs font-mono text-amber-600">
					{distributionStats.total > 0 ? ((distributionStats.moderate / distributionStats.total) * 100).toFixed(0) : 0}%
				</div>
			</div>

			<!-- High (>15%) -->
			<div class="flex items-center gap-4">
				<div class="w-20 text-xs text-red-700 font-medium">High (>15%)</div>
				<div class="flex-1 relative">
					<div class="w-full bg-slate-200 rounded-full h-4">
						<div 
							class="bg-red-500 h-4 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
							style="width: {distributionStats.total > 0 ? (distributionStats.high / distributionStats.total) * 100 : 0}%"
						>
							{#if distributionStats.high > 0}
								<span class="text-white text-xs font-bold">{distributionStats.high}</span>
							{/if}
						</div>
					</div>
				</div>
				<div class="w-12 text-xs font-mono text-red-600">
					{distributionStats.total > 0 ? ((distributionStats.high / distributionStats.total) * 100).toFixed(0) : 0}%
				</div>
			</div>
		</div>
	</div>

	<!-- Recent Variances -->
	<div class="mb-6">
		<h4 class="text-sm font-medium text-oil-black mb-4">Recent Variance Patterns</h4>
		<div class="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
			{#each varianceData.slice(-6) as item}
				<div class="flex items-center justify-between p-2 bg-white/30 rounded-lg">
					<div class="text-xs text-oil-gray font-mono">Haul {item.id.slice(-6)}</div>
					<div class="flex items-center gap-2">
						<div class="w-2 h-2 rounded-full {getVarianceColor(item.category)}"></div>
						<span class="text-xs font-mono {item.category === 'good' ? 'text-emerald-600' : item.category === 'moderate' ? 'text-amber-600' : 'text-red-600'}">
							{item.variance.toFixed(1)}%
						</span>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Summary Stats -->
	<div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
		<div class="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
			<div class="metric-display text-emerald-700 text-lg mb-1">
				{averageVariance.toFixed(1)}%
			</div>
			<div class="text-xs text-emerald-600">Avg Variance</div>
		</div>
		
		<div class="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
			<div class="metric-display text-blue-700 text-lg mb-1">
				{distributionStats.total}
			</div>
			<div class="text-xs text-blue-600">Total Hauls</div>
		</div>
		
		<div class="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
			<div class="metric-display text-slate-700 text-lg mb-1">
				{distributionStats.total > 0 ? ((distributionStats.good / distributionStats.total) * 100).toFixed(0) : 0}%
			</div>
			<div class="text-xs text-slate-600">Success Rate</div>
		</div>
	</div>
</div> 