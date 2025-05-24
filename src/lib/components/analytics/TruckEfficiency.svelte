<script lang="ts">
	import type { Truck, Haul } from '$lib/stores/haulStore';

	export let trucks: Truck[];
	export let hauls: Haul[];

	// Calculate truck performance from hauls
	$: truckPerformance = trucks.map(truck => {
		const truckHauls = hauls.filter(h => h.truckId === truck.id);
		const completedHauls = truckHauls.filter(h => h.actualLoss !== undefined);
		
		const totalVolume = truckHauls.reduce((sum, h) => sum + h.initialVolume, 0);
		const totalLoss = completedHauls.reduce((sum, h) => sum + (h.actualLoss || 0), 0);
		const currentEfficiency = totalVolume > 0 ? ((totalVolume - totalLoss) / totalVolume * 100) : truck.averageEfficiency;
		
		// Calculate trend (last 5 vs previous 5 hauls)
		const recent5 = completedHauls.slice(-5);
		const previous5 = completedHauls.slice(-10, -5);
		
		const recentEff = recent5.length > 0 
			? recent5.reduce((sum, h) => sum + ((h.initialVolume - (h.actualLoss || 0)) / h.initialVolume * 100), 0) / recent5.length
			: currentEfficiency;
		
		const previousEff = previous5.length > 0 
			? previous5.reduce((sum, h) => sum + ((h.initialVolume - (h.actualLoss || 0)) / h.initialVolume * 100), 0) / previous5.length
			: currentEfficiency;
		
		const trend = recentEff - previousEff;

		return {
			...truck,
			currentEfficiency,
			totalHauls: truckHauls.length,
			completedHauls: completedHauls.length,
			totalVolume,
			trend,
			status: getMaintenanceStatus(currentEfficiency, trend)
		};
	});

	$: sortedTrucks = truckPerformance
		.slice()
		.sort((a, b) => b.currentEfficiency - a.currentEfficiency);

	function getMaintenanceStatus(efficiency: number, trend: number) {
		if (efficiency < 95 || trend < -2) return 'maintenance';
		if (efficiency < 97 || trend < -1) return 'warning';
		return 'good';
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'good': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
			case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
			case 'maintenance': return 'text-red-600 bg-red-50 border-red-200';
			default: return 'text-slate-600 bg-slate-50 border-slate-200';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'good': return '✅';
			case 'warning': return '⚠️';
			case 'maintenance': return '🔧';
			default: return '⚪';
		}
	}

	function getTrendIcon(trend: number) {
		if (trend > 1) return '📈';
		if (trend < -1) return '📉';
		return '➡️';
	}
</script>

<div class="glass-card p-4 sm:p-6">
	<h3 class="font-semibold text-oil-black mb-4 sm:mb-6 flex items-center gap-2">
		<span class="text-base sm:text-lg">🚛</span>
		<span class="text-sm sm:text-base">Truck Efficiency Analysis</span>
	</h3>
	
	<div class="space-y-3 sm:space-y-4">
		{#each sortedTrucks as truck}
			<div class="p-3 sm:p-4 bg-white/50 rounded-xl border border-slate-200 hover:bg-white/70 transition-colors">
				<div class="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3">
					<div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
						<div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
							<span class="text-white text-sm sm:text-lg">🚛</span>
						</div>
						<div class="min-w-0 flex-1">
							<div class="font-semibold text-oil-black text-sm sm:text-base leading-tight truncate">{truck.model}</div>
							<div class="text-xs text-oil-gray font-mono truncate">{truck.plateNumber}</div>
						</div>
					</div>
					
					<div class="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 flex-shrink-0">
						<!-- Trend -->
						<div class="text-center">
							<div class="text-xs text-oil-gray mb-1">Trend</div>
							<div class="flex items-center gap-1 text-xs">
								<span>{getTrendIcon(truck.trend)}</span>
								<span class="{truck.trend > 0 ? 'text-emerald-600' : truck.trend < 0 ? 'text-red-600' : 'text-slate-600'}">
									{truck.trend > 0 ? '+' : ''}{truck.trend.toFixed(1)}%
								</span>
							</div>
						</div>

						<!-- Status -->
						<div class="px-2 sm:px-3 py-1 sm:py-2 rounded-lg border {getStatusColor(truck.status)}">
							<div class="flex items-center gap-1 text-xs font-medium">
								<span>{getStatusIcon(truck.status)}</span>
								<span class="capitalize hidden sm:inline">{truck.status}</span>
							</div>
						</div>

						<!-- Efficiency -->
						<div class="text-right">
							<div class="metric-display text-lg sm:text-xl {truck.currentEfficiency >= 98 ? 'text-emerald-600' : truck.currentEfficiency >= 96 ? 'text-blue-600' : 'text-amber-600'} leading-tight">
								{truck.currentEfficiency.toFixed(1)}%
							</div>
							<div class="text-xs text-oil-gray">efficiency</div>
						</div>
					</div>
				</div>

				<!-- Details -->
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-3 border-t border-slate-200">
					<div class="text-center">
						<div class="text-xs text-oil-gray">Capacity</div>
						<div class="text-xs sm:text-sm font-semibold text-oil-black leading-tight">{truck.capacity.toLocaleString()}</div>
						<div class="text-xs text-oil-gray">gallons</div>
					</div>
					
					<div class="text-center">
						<div class="text-xs text-oil-gray">Total Hauls</div>
						<div class="text-xs sm:text-sm font-semibold text-oil-black leading-tight">{truck.totalHauls}</div>
						<div class="text-xs text-oil-gray">completed</div>
					</div>
					
					<div class="text-center">
						<div class="text-xs text-oil-gray">Volume</div>
						<div class="text-xs sm:text-sm font-semibold text-oil-black leading-tight">{(truck.totalVolume / 1000).toFixed(0)}k</div>
						<div class="text-xs text-oil-gray">gallons</div>
					</div>
					
					<div class="text-center">
						<div class="text-xs text-oil-gray">Utilization</div>
						<div class="text-xs sm:text-sm font-semibold text-oil-black leading-tight">
							{truck.totalVolume > 0 ? ((truck.totalVolume / truck.totalHauls / truck.capacity) * 100).toFixed(0) : 0}%
						</div>
						<div class="text-xs text-oil-gray">avg load</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Fleet Summary -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-200">
		<div class="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
			<div class="metric-display text-blue-700 text-base sm:text-lg mb-1 leading-tight">
				{trucks.length}
			</div>
			<div class="text-xs text-blue-600">Total Trucks</div>
		</div>
		
		<div class="text-center p-3 bg-emerald-50 rounded-xl border border-emerald-200">
			<div class="metric-display text-emerald-700 text-base sm:text-lg mb-1 leading-tight">
				{(truckPerformance.reduce((sum, t) => sum + t.currentEfficiency, 0) / truckPerformance.length).toFixed(1)}%
			</div>
			<div class="text-xs text-emerald-600">Fleet Avg</div>
		</div>
		
		<div class="text-center p-3 bg-amber-50 rounded-xl border border-amber-200">
			<div class="metric-display text-amber-700 text-base sm:text-lg mb-1 leading-tight">
				{truckPerformance.filter(t => t.status === 'warning' || t.status === 'maintenance').length}
			</div>
			<div class="text-xs text-amber-600">Need Attention</div>
		</div>
		
		<div class="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
			<div class="metric-display text-slate-700 text-base sm:text-lg mb-1 leading-tight">
				{((truckPerformance.reduce((sum, t) => sum + t.totalVolume, 0)) / 1000).toFixed(0)}k
			</div>
			<div class="text-xs text-slate-600">Total Volume</div>
		</div>
	</div>
</div> 