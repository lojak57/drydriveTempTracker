<script lang="ts">
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
		if (efficiency >= 98) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
		if (efficiency >= 96) return 'text-blue-600 bg-blue-50 border-blue-200';
		if (efficiency >= 94) return 'text-amber-600 bg-amber-50 border-amber-200';
		return 'text-red-600 bg-red-50 border-red-200';
	}
</script>

<div class="glass-card p-6">
	<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
		<span class="text-lg">🏆</span>
		Driver Performance Leaderboard
	</h3>
	
	<div class="space-y-4">
		{#each sortedDrivers as driver, index}
			<div class="flex items-center gap-4 p-4 bg-white/50 rounded-xl border border-slate-200 hover:bg-white/70 transition-colors">
				<!-- Rank -->
				<div class="w-8 text-center">
					{#if index < 3}
						<span class="text-xl">{getRankIcon(index)}</span>
					{:else}
						<span class="text-sm font-bold text-slate-600">{getRankIcon(index)}</span>
					{/if}
				</div>
				
				<!-- Driver Info -->
				<div class="flex items-center gap-3 flex-1">
					<div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
						<span class="text-white text-sm font-bold">{driver.name.split(' ').map(n => n[0]).join('')}</span>
					</div>
					<div>
						<div class="font-semibold text-oil-black">{driver.name}</div>
						<div class="text-xs text-oil-gray">
							{driver.experience}y exp • {driver.totalHauls.toLocaleString()} total hauls
						</div>
					</div>
				</div>
				
				<!-- Recent Activity -->
				<div class="text-right">
					<div class="text-xs text-oil-gray mb-1">Recent Hauls</div>
					<div class="font-semibold text-oil-black">{driver.recentHauls}</div>
				</div>
				
				<!-- Efficiency Badge -->
				<div class="text-right">
					<div class="px-3 py-2 rounded-lg border {getEfficiencyColor(driver.currentEfficiency)}">
						<div class="font-bold text-sm">{driver.currentEfficiency.toFixed(1)}%</div>
						<div class="text-xs opacity-70">efficiency</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Summary Stats -->
	<div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
		<div class="text-center">
			<div class="metric-display text-oil-black text-lg mb-1">
				{drivers.length}
			</div>
			<div class="text-xs text-oil-gray">Active Drivers</div>
		</div>
		
		<div class="text-center">
			<div class="metric-display text-oil-black text-lg mb-1">
				{(drivers.reduce((sum, d) => sum + d.currentEfficiency, 0) / drivers.length).toFixed(1)}%
			</div>
			<div class="text-xs text-oil-gray">Avg Efficiency</div>
		</div>
		
		<div class="text-center">
			<div class="metric-display text-oil-black text-lg mb-1">
				{drivers.reduce((sum, d) => sum + d.recentHauls, 0)}
			</div>
			<div class="text-xs text-oil-gray">Recent Hauls</div>
		</div>
	</div>
</div> 