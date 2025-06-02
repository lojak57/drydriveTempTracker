<script lang="ts">
	import { STATUS_INDICATORS } from '$lib/constants';
	
	export let drivers: Array<{
		id: string;
		name: string;
		experience: number;
		totalHauls: number;
		averageEfficiency: number;
		recentHauls: number;
		currentEfficiency: number;
	}>;

	$: sortedDrivers = drivers
		.slice()
		.sort((a, b) => b.currentEfficiency - a.currentEfficiency);

	function getRankIcon(index: number) {
		switch (index) {
			case 0: return '🥇';
			case 1: return '🥈';
			case 2: return '🥉';
			default: return `#${index + 1}`;
		}
	}

	function getEfficiencyColor(efficiency: number) {
		if (efficiency >= 98) return 'text-success bg-green-50 border-green-200 text-success-dark';
		if (efficiency >= 96) return 'text-info bg-blue-50 border-blue-200 text-info-dark';
		if (efficiency >= 94) return 'text-warning bg-yellow-50 border-yellow-200 text-warning-dark';
		return 'text-error bg-red-50 border-red-200 text-error-dark';
	}
</script>

<div class="glass-card p-4 sm:p-6">
	<h3 class="font-semibold text-oil-black mb-4 sm:mb-6 flex items-center gap-2">
		<span class="text-base sm:text-lg">🏆</span>
		<span class="text-sm sm:text-base">Driver Performance Leaderboard</span>
	</h3>
	
	<div class="space-y-3 sm:space-y-4">
		{#each sortedDrivers as driver, index}
			<div class="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-white/50 rounded-xl border border-slate-200 hover:bg-white/70 transition-colors">
				<!-- Rank -->
				<div class="w-6 sm:w-8 text-center flex-shrink-0">
					{#if index < 3}
						<span class="text-base sm:text-xl">{getRankIcon(index)}</span>
					{:else}
						<span class="text-xs sm:text-sm font-bold text-slate-600">{getRankIcon(index)}</span>
					{/if}
				</div>
				
				<!-- Driver Info -->
				<div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
					<div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
						<span class="text-white text-xs sm:text-sm font-bold">{driver.name.split(' ').map(n => n[0]).join('')}</span>
					</div>
					<div class="min-w-0 flex-1">
						<div class="font-semibold text-oil-black text-sm sm:text-base leading-tight truncate">{driver.name}</div>
						<div class="text-xs text-oil-gray truncate">
							{driver.experience}y exp • {driver.totalHauls.toLocaleString()} hauls
						</div>
					</div>
				</div>
				
				<!-- Recent Activity -->
				<div class="text-right flex-shrink-0 hidden sm:block">
					<div class="text-xs text-oil-gray mb-1">Recent Hauls</div>
					<div class="font-semibold text-oil-black text-sm">{driver.recentHauls}</div>
				</div>
				
				<!-- Efficiency Badge -->
				<div class="text-right flex-shrink-0">
					<div class="px-2 sm:px-3 py-1 sm:py-2 rounded-lg border {getEfficiencyColor(driver.currentEfficiency)}">
						<div class="font-bold text-xs sm:text-sm leading-tight">{driver.currentEfficiency.toFixed(1)}%</div>
						<div class="text-xs opacity-70 hidden sm:block">efficiency</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Summary Stats -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
		<div class="text-center">
			<div class="metric-display text-oil-black text-base sm:text-lg mb-1 leading-tight">
				{drivers.length}
			</div>
			<div class="text-xs text-oil-gray">Active Drivers</div>
		</div>
		
		<div class="text-center">
			<div class="metric-display text-oil-black text-base sm:text-lg mb-1 leading-tight">
				{(drivers.reduce((sum, d) => sum + d.currentEfficiency, 0) / drivers.length).toFixed(1)}%
			</div>
			<div class="text-xs text-oil-gray">Avg Efficiency</div>
		</div>
		
		<div class="text-center">
			<div class="metric-display text-oil-black text-base sm:text-lg mb-1 leading-tight">
				{drivers.reduce((sum, d) => sum + d.recentHauls, 0)}
			</div>
			<div class="text-xs text-oil-gray">Recent Hauls</div>
		</div>
	</div>
</div> 