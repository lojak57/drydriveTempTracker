<script lang="ts">
	import { onMount } from 'svelte';
	import Navigation from '$lib/components/ui/Navigation.svelte';
	import { activeHauls, completedHauls, drivers, trucks, driverStats } from '$lib/stores/haulStore';
	import AnalyticsCard from '$lib/components/analytics/AnalyticsCard.svelte';
	import PerformanceChart from '$lib/components/analytics/PerformanceChart.svelte';
	import DriverLeaderboard from '$lib/components/analytics/DriverLeaderboard.svelte';
	import LossAnalysis from '$lib/components/analytics/LossAnalysis.svelte';
	import TruckEfficiency from '$lib/components/analytics/TruckEfficiency.svelte';

	// Calculate analytics data
	$: allHauls = [...$activeHauls, ...$completedHauls];
	
	// Financial metrics
	$: totalVolume = allHauls.reduce((sum, haul) => sum + haul.initialVolume, 0);
	$: totalExpectedLoss = allHauls.reduce((sum, haul) => sum + haul.expectedLoss, 0);
	$: totalActualLoss = allHauls.reduce((sum, haul) => sum + (haul.actualLoss || 0), 0);
	$: volumeEfficiency = totalVolume > 0 ? ((totalVolume - totalActualLoss) / totalVolume * 100) : 0;
	
	// Cost calculations (example rates)
	$: oilPricePerGallon = 2.85; // Current oil price
	$: lossValueExpected = totalExpectedLoss * oilPricePerGallon;
	$: lossValueActual = totalActualLoss * oilPricePerGallon;
	$: savingsFromEfficiency = (totalExpectedLoss - totalActualLoss) * oilPricePerGallon;
	
	// Variance analysis
	$: completedHaulsWithData = allHauls.filter(h => h.actualLoss !== undefined && h.expectedLoss > 0);
	$: averageVariance = completedHaulsWithData.length > 0 
		? completedHaulsWithData.reduce((sum, haul) => {
			return sum + Math.abs((haul.actualLoss! - haul.expectedLoss) / haul.expectedLoss * 100);
		}, 0) / completedHaulsWithData.length 
		: 0;
	
	// Performance trends (simulated weekly data)
	$: weeklyData = [
		{ week: 'Week 1', efficiency: 96.2, volume: 45000, loss: 187 },
		{ week: 'Week 2', efficiency: 97.1, volume: 52000, loss: 203 },
		{ week: 'Week 3', efficiency: 95.8, volume: 48000, loss: 224 },
		{ week: 'Week 4', efficiency: 98.3, volume: 55000, loss: 156 },
		{ week: 'Current', efficiency: volumeEfficiency, volume: totalVolume, loss: totalActualLoss }
	];

	// Top routes by efficiency
	$: routeStats = allHauls.reduce((routes, haul) => {
		const routeKey = `${haul.onloadSite.name} → ${haul.offloadSite.name}`;
		if (!routes[routeKey]) {
			routes[routeKey] = { 
				route: routeKey, 
				hauls: 0, 
				totalVolume: 0, 
				totalLoss: 0,
				totalExpected: 0
			};
		}
		routes[routeKey].hauls++;
		routes[routeKey].totalVolume += haul.initialVolume;
		routes[routeKey].totalLoss += haul.actualLoss || 0;
		routes[routeKey].totalExpected += haul.expectedLoss;
		return routes;
	}, {} as Record<string, any>);
	
	$: topRoutes = Object.values(routeStats)
		.map((route: any) => ({
			...route,
			efficiency: route.totalVolume > 0 ? ((route.totalVolume - route.totalLoss) / route.totalVolume * 100) : 0,
			variance: route.totalExpected > 0 ? (Math.abs(route.totalLoss - route.totalExpected) / route.totalExpected * 100) : 0
		}))
		.sort((a: any, b: any) => b.efficiency - a.efficiency)
		.slice(0, 5);
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	<Navigation />
	
	<main class="max-w-7xl mx-auto px-6 py-8">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="display-large text-oil-black mb-2">Analytics Dashboard</h1>
			<p class="text-oil-gray">Performance insights and operational intelligence</p>
		</div>

		<!-- Key Metrics Row -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<AnalyticsCard 
				title="Total Volume Transported"
				value={totalVolume.toLocaleString()}
				unit="gallons"
				trend="up"
				trendValue="+12.3%"
				icon="🛢️"
				color="blue"
			/>
			
			<AnalyticsCard 
				title="Volume Efficiency"
				value={volumeEfficiency}
				unit="%"
				trend={volumeEfficiency > 97 ? 'up' : 'stable'}
				trendValue={volumeEfficiency > 97 ? '+0.8%' : 'Target: 97%'}
				icon="📊"
				color="emerald"
			/>
			
			<AnalyticsCard 
				title="Average Variance"
				value={averageVariance}
				unit="%"
				trend={averageVariance < 8 ? 'down' : 'up'}
				trendValue={averageVariance < 8 ? '-2.1%' : '+1.2%'}
				icon="⚖️"
				color={averageVariance < 8 ? 'emerald' : 'amber'}
			/>
			
			<AnalyticsCard 
				title="Cost Impact"
				value={Math.abs(savingsFromEfficiency)}
				unit="USD"
				trend={savingsFromEfficiency > 0 ? 'down' : 'up'}
				trendValue={savingsFromEfficiency > 0 ? 'Savings' : 'Losses'}
				icon="💰"
				color={savingsFromEfficiency > 0 ? 'emerald' : 'red'}
			/>
		</div>

		<!-- Performance Trends -->
		<div class="mb-8">
			<PerformanceChart data={weeklyData} />
		</div>

		<!-- Driver & Truck Analytics -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
			<DriverLeaderboard drivers={$driverStats} />
			<TruckEfficiency trucks={$trucks} hauls={allHauls} />
		</div>

		<!-- Loss Analysis & Route Performance -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
			<LossAnalysis hauls={completedHaulsWithData} />
			
			<!-- Route Performance -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
					<span class="text-lg">🛣️</span>
					Top Routes by Efficiency
				</h3>
				<div class="space-y-4">
					{#each topRoutes as route, index}
						<div class="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-slate-200">
							<div class="flex-1">
								<div class="font-medium text-oil-black text-sm leading-tight">{route.route}</div>
								<div class="text-xs text-oil-gray mt-1">{route.hauls} hauls • {route.totalVolume.toLocaleString()} gal</div>
							</div>
							<div class="text-right">
								<div class="metric-display text-lg {route.efficiency > 98 ? 'text-emerald-600' : route.efficiency > 96 ? 'text-blue-600' : 'text-amber-600'}">{route.efficiency.toFixed(1)}%</div>
								<div class="text-xs text-oil-gray">efficiency</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Real-time Alerts & Insights -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Active Alerts -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
					<span class="text-lg">🚨</span>
					Active Alerts
				</h3>
				<div class="space-y-3">
					{#if averageVariance > 10}
						<div class="p-3 bg-red-50 border border-red-200 rounded-xl">
							<div class="flex items-center gap-2 text-red-700 font-medium text-sm">
								<span>⚠️</span>
								High Variance Detected
							</div>
							<div class="text-xs text-red-600 mt-1">Average variance: {averageVariance.toFixed(1)}%</div>
						</div>
					{/if}
					
					{#if volumeEfficiency < 95}
						<div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
							<div class="flex items-center gap-2 text-amber-700 font-medium text-sm">
								<span>⚠️</span>
								Efficiency Below Target
							</div>
							<div class="text-xs text-amber-600 mt-1">Current: {volumeEfficiency.toFixed(1)}% (Target: 97%)</div>
						</div>
					{/if}
					
					{#if $activeHauls.filter(h => h.status === 'transit').length > 2}
						<div class="p-3 bg-blue-50 border border-blue-200 rounded-xl">
							<div class="flex items-center gap-2 text-blue-700 font-medium text-sm">
								<span>ℹ️</span>
								High Traffic Period
							</div>
							<div class="text-xs text-blue-600 mt-1">{$activeHauls.filter(h => h.status === 'transit').length} trucks in transit</div>
						</div>
					{:else}
						<div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
							<div class="flex items-center gap-2 text-emerald-700 font-medium text-sm">
								<span>✅</span>
								All Systems Nominal
							</div>
							<div class="text-xs text-emerald-600 mt-1">No active alerts or warnings</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Predictive Insights -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
					<span class="text-lg">🔮</span>
					Predictive Insights
				</h3>
				<div class="space-y-4">
					<div class="p-3 bg-blue-50 rounded-xl">
						<div class="text-sm font-medium text-blue-700 mb-1">Weather Impact</div>
						<div class="text-xs text-blue-600">Forecast shows 15°F temp increase tomorrow. Expect +2.3% loss variance.</div>
					</div>
					
					<div class="p-3 bg-emerald-50 rounded-xl">
						<div class="text-sm font-medium text-emerald-700 mb-1">Route Optimization</div>
						<div class="text-xs text-emerald-600">Eagle Ford → Corpus Christi route showing 12% better efficiency than Houston route.</div>
					</div>
					
					<div class="p-3 bg-amber-50 rounded-xl">
						<div class="text-sm font-medium text-amber-700 mb-1">Maintenance Alert</div>
						<div class="text-xs text-amber-600">TX-8402 efficiency down 3.2% over last 10 hauls. Consider inspection.</div>
					</div>
				</div>
			</div>

			<!-- Financial Summary -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
					<span class="text-lg">💼</span>
					Financial Impact
				</h3>
				<div class="space-y-4">
					<div class="p-3 bg-white/30 rounded-xl">
						<div class="text-sm text-oil-gray">Oil Price</div>
						<div class="metric-display text-oil-black text-xl">${oilPricePerGallon.toFixed(2)}/gal</div>
					</div>
					
					<div class="p-3 bg-red-50 rounded-xl border border-red-200">
						<div class="text-sm text-red-600">Expected Loss Value</div>
						<div class="metric-display text-red-700 text-lg">${lossValueExpected.toFixed(0)}</div>
					</div>
					
					<div class="p-3 rounded-xl border {savingsFromEfficiency > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}">
						<div class="text-sm {savingsFromEfficiency > 0 ? 'text-emerald-600' : 'text-red-600'}">
							{savingsFromEfficiency > 0 ? 'Cost Savings' : 'Additional Losses'}
						</div>
						<div class="metric-display text-lg {savingsFromEfficiency > 0 ? 'text-emerald-700' : 'text-red-700'}">
							${Math.abs(savingsFromEfficiency).toFixed(0)}
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</div> 