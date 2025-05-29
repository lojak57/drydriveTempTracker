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

	// NEW PHASE 5 ANALYTICS

	// Coriolis Efficiency Analysis
	$: coriolisEfficiency = allHauls.reduce((acc, haul) => {
		if (haul.coriolisReadings.length > 0) {
			const avgWaterCut = haul.coriolisReadings.reduce((sum, r) => sum + r.waterCut, 0) / haul.coriolisReadings.length;
			const avgApiGravity = haul.coriolisReadings.reduce((sum, r) => sum + r.apiGravity, 0) / haul.coriolisReadings.length;
			acc.totalWaterCut += avgWaterCut;
			acc.totalApiGravity += avgApiGravity;
			acc.count++;
		}
		return acc;
	}, { totalWaterCut: 0, totalApiGravity: 0, count: 0 });

	$: avgWaterCut = coriolisEfficiency.count > 0 ? coriolisEfficiency.totalWaterCut / coriolisEfficiency.count : 0;
	$: avgApiGravity = coriolisEfficiency.count > 0 ? coriolisEfficiency.totalApiGravity / coriolisEfficiency.count : 0;
	$: coriolisAccuracy = 100 - (avgWaterCut * 2); // Simplified accuracy metric

	// Temperature Management Analysis
	$: temperatureAnalysis = allHauls.reduce((acc, haul) => {
		if (haul.temperatureReadings.length > 0) {
			const avgAmbient = haul.temperatureReadings.reduce((sum, r) => sum + r.ambient, 0) / haul.temperatureReadings.length;
			const avgInternal = haul.temperatureReadings.reduce((sum, r) => sum + r.internal, 0) / haul.temperatureReadings.length;
			const tempDiff = Math.abs(avgAmbient - avgInternal);
			acc.totalTempDiff += tempDiff;
			acc.totalAmbient += avgAmbient;
			acc.totalInternal += avgInternal;
			acc.count++;
		}
		return acc;
	}, { totalTempDiff: 0, totalAmbient: 0, totalInternal: 0, count: 0 });

	$: avgTempDifferential = temperatureAnalysis.count > 0 ? temperatureAnalysis.totalTempDiff / temperatureAnalysis.count : 0;
	$: temperatureEfficiency = Math.max(0, 100 - (avgTempDifferential / 2)); // Simplified efficiency

	// Safety Performance Analysis
	$: safetyMetrics = allHauls.reduce((acc, haul) => {
		if (haul.gasDetections.length > 0) {
			const latestGas = haul.gasDetections[haul.gasDetections.length - 1];
			if (latestGas.h2sExternal > 10 || latestGas.h2sInternal > 10) acc.h2sAlerts++;
			if (latestGas.coExternal > 35 || latestGas.coInternal > 35) acc.coAlerts++;
			if (latestGas.lelExternal > 10 || latestGas.lelInternal > 10) acc.lelAlerts++;
			acc.totalChecks++;
		}
		return acc;
	}, { h2sAlerts: 0, coAlerts: 0, lelAlerts: 0, totalChecks: 0 });

	$: safetyScore = safetyMetrics.totalChecks > 0 ? 
		((safetyMetrics.totalChecks - safetyMetrics.h2sAlerts - safetyMetrics.coAlerts - safetyMetrics.lelAlerts) / safetyMetrics.totalChecks * 100) : 100;

	// Equipment Health Analysis
	$: equipmentHealth = allHauls.reduce((acc, haul) => {
		if (haul.dryDriveData.length > 0) {
			const latestDryDrive = haul.dryDriveData[haul.dryDriveData.length - 1];
			if (latestDryDrive.pumpTemp > 200) acc.highTempEvents++;
			if (latestDryDrive.inverterTemp > 160) acc.inverterIssues++;
			if (latestDryDrive.motorTemp > 180) acc.motorIssues++;
			acc.totalChecks++;
		}
		return acc;
	}, { highTempEvents: 0, inverterIssues: 0, motorIssues: 0, totalChecks: 0 });

	$: equipmentScore = equipmentHealth.totalChecks > 0 ? 
		((equipmentHealth.totalChecks - equipmentHealth.highTempEvents - equipmentHealth.inverterIssues - equipmentHealth.motorIssues) / equipmentHealth.totalChecks * 100) : 100;
	
	// Performance trends (simulated weekly data)
	$: weeklyData = [
		{ week: 'Week 1', efficiency: 96.2, volume: 45000, loss: 187 },
		{ week: 'Week 2', efficiency: 97.1, volume: 52000, loss: 203 },
		{ week: 'Week 3', efficiency: 95.8, volume: 48000, loss: 224 },
		{ week: 'Week 4', efficiency: 98.3, volume: 55000, loss: 156 },
		{ week: 'Current', efficiency: volumeEfficiency, volume: totalVolume, loss: totalActualLoss }
	];

	// Enhanced route analysis with efficiency heatmap data
	$: routeStats = allHauls.reduce((routes, haul) => {
		const routeKey = `${haul.onloadSite.name} → ${haul.offloadSite.name}`;
		if (!routes[routeKey]) {
			routes[routeKey] = { 
				route: routeKey, 
				hauls: 0, 
				totalVolume: 0, 
				totalLoss: 0,
				totalExpected: 0,
				avgTempDiff: 0,
				safetyIncidents: 0
			};
		}
		routes[routeKey].hauls++;
		routes[routeKey].totalVolume += haul.initialVolume;
		routes[routeKey].totalLoss += haul.actualLoss || 0;
		routes[routeKey].totalExpected += haul.expectedLoss;
		
		// Add temperature and safety data
		if (haul.temperatureReadings.length > 0) {
			const avgAmbient = haul.temperatureReadings.reduce((sum, r) => sum + r.ambient, 0) / haul.temperatureReadings.length;
			const avgInternal = haul.temperatureReadings.reduce((sum, r) => sum + r.internal, 0) / haul.temperatureReadings.length;
			routes[routeKey].avgTempDiff += Math.abs(avgAmbient - avgInternal);
		}
		
		if (haul.gasDetections.length > 0) {
			const latestGas = haul.gasDetections[haul.gasDetections.length - 1];
			if (latestGas.h2sExternal > 10 || latestGas.coExternal > 35) {
				routes[routeKey].safetyIncidents++;
			}
		}
		
		return routes;
	}, {} as Record<string, any>);
	
	$: topRoutes = Object.values(routeStats)
		.map((route: any) => ({
			...route,
			efficiency: route.totalVolume > 0 ? ((route.totalVolume - route.totalLoss) / route.totalVolume * 100) : 0,
			variance: route.totalExpected > 0 ? (Math.abs(route.totalLoss - route.totalExpected) / route.totalExpected * 100) : 0,
			avgTempDiff: route.hauls > 0 ? route.avgTempDiff / route.hauls : 0,
			safetyRating: route.hauls > 0 ? ((route.hauls - route.safetyIncidents) / route.hauls * 100) : 100
		}))
		.sort((a: any, b: any) => b.efficiency - a.efficiency)
		.slice(0, 5);
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	<Navigation />
	
	<main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
		<!-- Header -->
		<div class="text-center mb-6 sm:mb-8">
			<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-oil-black mb-2">Analytics Dashboard</h1>
			<p class="text-sm sm:text-base text-oil-gray">Performance insights and operational intelligence</p>
		</div>

		<!-- Enhanced Key Metrics Row - Phase 5 New Analytics -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
			<AnalyticsCard 
				title="Coriolis Efficiency"
				value={coriolisAccuracy}
				unit="%"
				trend={coriolisAccuracy > 98 ? 'up' : 'stable'}
				trendValue={`${avgWaterCut.toFixed(2)}% water cut`}
				icon="🛢️"
				color="blue"
			/>
			
			<AnalyticsCard 
				title="Temperature Management"
				value={temperatureEfficiency}
				unit="%"
				trend={avgTempDifferential < 15 ? 'up' : 'down'}
				trendValue={`${avgTempDifferential.toFixed(1)}°F avg diff`}
				icon="🌡️"
				color="emerald"
			/>
			
			<AnalyticsCard 
				title="Safety Performance"
				value={safetyScore}
				unit="%"
				trend={safetyScore > 95 ? 'up' : 'down'}
				trendValue={`${safetyMetrics.h2sAlerts + safetyMetrics.coAlerts + safetyMetrics.lelAlerts} alerts`}
				icon="🛡️"
				color={safetyScore > 95 ? 'emerald' : 'amber'}
			/>
			
			<AnalyticsCard 
				title="Equipment Health"
				value={equipmentScore}
				unit="%"
				trend={equipmentScore > 90 ? 'up' : 'down'}
				trendValue={`${equipmentHealth.highTempEvents} temp events`}
				icon="⚙️"
				color={equipmentScore > 90 ? 'emerald' : 'red'}
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
		</div>

		<!-- Enhanced Multi-Series Performance Chart -->
		<div class="mb-8">
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
					<span class="text-lg">📈</span>
					Multi-Series Performance Trends
				</h3>
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<!-- Performance Chart -->
					<div>
						<PerformanceChart data={weeklyData} />
					</div>
					
					<!-- Efficiency Heatmap -->
					<div class="space-y-4">
						<h4 class="font-medium text-oil-black">Route Efficiency Heatmap</h4>
						{#each topRoutes.slice(0, 4) as route}
							<div class="p-3 bg-white/50 rounded-xl">
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-oil-black truncate">{route.route.split(' → ')[0]}</span>
									<span class="text-xs text-oil-gray">{route.efficiency.toFixed(1)}%</span>
								</div>
								<div class="w-full bg-gray-200 rounded-full h-2">
									<div 
										class="h-2 rounded-full {route.efficiency > 98 ? 'bg-emerald-500' : route.efficiency > 96 ? 'bg-blue-500' : 'bg-amber-500'}" 
										style="width: {route.efficiency}%"
									></div>
								</div>
								<div class="flex justify-between text-xs text-oil-gray mt-1">
									<span>{route.hauls} hauls</span>
									<span>{route.safetyRating.toFixed(0)}% safety</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Enhanced Analytics Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
			<!-- Coriolis Analysis -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
					<span class="text-lg">🛢️</span>
					Coriolis Analysis
				</h3>
				<div class="space-y-4">
					<div class="text-center p-4 bg-blue-50 rounded-xl">
						<div class="metric-display text-blue-600 text-2xl mb-1">{avgApiGravity.toFixed(1)}°</div>
						<div class="text-sm text-blue-700 font-medium">Average API Gravity</div>
						<div class="text-xs text-blue-600 mt-1">Optimal range: 35-45°</div>
					</div>
					<div class="text-center p-4 bg-emerald-50 rounded-xl">
						<div class="metric-display text-emerald-600 text-2xl mb-1">{avgWaterCut.toFixed(2)}%</div>
						<div class="text-sm text-emerald-700 font-medium">Average Water Cut</div>
						<div class="text-xs text-emerald-600 mt-1">Target: &lt;2.0%</div>
					</div>
					<div class="text-center p-4 bg-amber-50 rounded-xl">
						<div class="metric-display text-amber-600 text-2xl mb-1">{coriolisAccuracy.toFixed(1)}%</div>
						<div class="text-sm text-amber-700 font-medium">Measurement Accuracy</div>
						<div class="text-xs text-amber-600 mt-1">Industry leading</div>
					</div>
				</div>
			</div>

			<!-- Temperature Management -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
					<span class="text-lg">🌡️</span>
					Temperature Management
				</h3>
				<div class="space-y-4">
					<div class="text-center p-4 bg-orange-50 rounded-xl">
						<div class="metric-display text-orange-600 text-2xl mb-1">{temperatureAnalysis.count > 0 ? (temperatureAnalysis.totalAmbient / temperatureAnalysis.count).toFixed(1) : '0'}°F</div>
						<div class="text-sm text-orange-700 font-medium">Avg Ambient Temp</div>
						<div class="text-xs text-orange-600 mt-1">Environmental conditions</div>
					</div>
					<div class="text-center p-4 bg-blue-50 rounded-xl">
						<div class="metric-display text-blue-600 text-2xl mb-1">{temperatureAnalysis.count > 0 ? (temperatureAnalysis.totalInternal / temperatureAnalysis.count).toFixed(1) : '0'}°F</div>
						<div class="text-sm text-blue-700 font-medium">Avg Internal Temp</div>
						<div class="text-xs text-blue-600 mt-1">Product temperature</div>
					</div>
					<div class="text-center p-4 bg-emerald-50 rounded-xl">
						<div class="metric-display text-emerald-600 text-2xl mb-1">{avgTempDifferential.toFixed(1)}°F</div>
						<div class="text-sm text-emerald-700 font-medium">Avg Differential</div>
						<div class="text-xs text-emerald-600 mt-1">Loss factor</div>
					</div>
				</div>
			</div>

			<!-- Safety & Equipment Health -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
					<span class="text-lg">🛡️</span>
					Safety & Equipment
				</h3>
				<div class="space-y-4">
					<div class="text-center p-4 bg-emerald-50 rounded-xl">
						<div class="metric-display text-emerald-600 text-2xl mb-1">{safetyScore.toFixed(1)}%</div>
						<div class="text-sm text-emerald-700 font-medium">Safety Score</div>
						<div class="text-xs text-emerald-600 mt-1">{safetyMetrics.totalChecks} safety checks</div>
					</div>
					<div class="text-center p-4 bg-blue-50 rounded-xl">
						<div class="metric-display text-blue-600 text-2xl mb-1">{equipmentScore.toFixed(1)}%</div>
						<div class="text-sm text-blue-700 font-medium">Equipment Health</div>
						<div class="text-xs text-blue-600 mt-1">{equipmentHealth.totalChecks} system checks</div>
					</div>
					<div class="text-center p-4 bg-amber-50 rounded-xl">
						<div class="metric-display text-amber-600 text-2xl mb-1">{safetyMetrics.h2sAlerts + safetyMetrics.coAlerts + safetyMetrics.lelAlerts}</div>
						<div class="text-sm text-amber-700 font-medium">Active Alerts</div>
						<div class="text-xs text-amber-600 mt-1">Gas detection events</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Driver & Truck Analytics -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
			<DriverLeaderboard drivers={$driverStats} />
			<TruckEfficiency trucks={$trucks} hauls={allHauls} />
		</div>

		<!-- Enhanced Route Optimization & Loss Analysis -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
			<LossAnalysis hauls={completedHaulsWithData} />
			
			<!-- Enhanced Route Performance with Multi-Variable Analysis -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-6 flex items-center gap-2">
					<span class="text-lg">🛣️</span>
					Route Optimization Analysis
				</h3>
				<div class="space-y-4">
					{#each topRoutes as route, index}
						<div class="p-4 bg-white/50 rounded-xl border border-slate-200">
							<div class="flex items-center justify-between mb-3">
								<div class="flex-1">
									<div class="font-medium text-oil-black text-sm leading-tight">{route.route}</div>
									<div class="text-xs text-oil-gray mt-1">{route.hauls} hauls • {route.totalVolume.toLocaleString()} gal</div>
								</div>
								<div class="text-right">
									<div class="metric-display text-lg {route.efficiency > 98 ? 'text-emerald-600' : route.efficiency > 96 ? 'text-blue-600' : 'text-amber-600'}">{route.efficiency.toFixed(1)}%</div>
									<div class="text-xs text-oil-gray">efficiency</div>
								</div>
							</div>
							
							<!-- Multi-variable metrics -->
							<div class="grid grid-cols-3 gap-2 text-center">
								<div class="p-2 bg-blue-50 rounded-lg">
									<div class="text-xs text-blue-600">Temp Diff</div>
									<div class="text-sm font-semibold text-blue-700">{route.avgTempDiff.toFixed(1)}°F</div>
								</div>
								<div class="p-2 bg-emerald-50 rounded-lg">
									<div class="text-xs text-emerald-600">Safety</div>
									<div class="text-sm font-semibold text-emerald-700">{route.safetyRating.toFixed(0)}%</div>
								</div>
								<div class="p-2 bg-amber-50 rounded-lg">
									<div class="text-xs text-amber-600">Variance</div>
									<div class="text-sm font-semibold text-amber-700">{route.variance.toFixed(1)}%</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<!-- Enhanced Real-time Alerts & Insights -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
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
					
					{#if safetyScore < 95}
						<div class="p-3 bg-amber-50 border border-amber-200 rounded-xl">
							<div class="flex items-center gap-2 text-amber-700 font-medium text-sm">
								<span>⚠️</span>
								Safety Score Below Target
							</div>
							<div class="text-xs text-amber-600 mt-1">Current: {safetyScore.toFixed(1)}% (Target: 95%)</div>
						</div>
					{/if}
					
					{#if equipmentScore < 90}
						<div class="p-3 bg-red-50 border border-red-200 rounded-xl">
							<div class="flex items-center gap-2 text-red-700 font-medium text-sm">
								<span>🔧</span>
								Equipment Issues Detected
							</div>
							<div class="text-xs text-red-600 mt-1">Health score: {equipmentScore.toFixed(1)}%</div>
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

			<!-- Enhanced Predictive Insights -->
			<div class="glass-card p-6">
				<h3 class="font-semibold text-oil-black mb-4 flex items-center gap-2">
					<span class="text-lg">🔮</span>
					Predictive Insights
				</h3>
				<div class="space-y-4">
					<div class="p-3 bg-blue-50 rounded-xl">
						<div class="text-sm font-medium text-blue-700 mb-1">Temperature Impact</div>
						<div class="text-xs text-blue-600">Forecast shows {avgTempDifferential > 15 ? 'high' : 'moderate'} temp differential. Expect {avgTempDifferential > 15 ? '+3.2%' : '+1.8%'} loss variance.</div>
					</div>
					
					<div class="p-3 bg-emerald-50 rounded-xl">
						<div class="text-sm font-medium text-emerald-700 mb-1">Coriolis Optimization</div>
						<div class="text-xs text-emerald-600">Water cut trending {avgWaterCut < 1.5 ? 'down' : 'up'}. {avgWaterCut < 1.5 ? 'Excellent' : 'Monitor'} product quality.</div>
					</div>
					
					<div class="p-3 bg-amber-50 rounded-xl">
						<div class="text-sm font-medium text-amber-700 mb-1">Equipment Maintenance</div>
						<div class="text-xs text-amber-600">DryDrive systems showing {equipmentScore > 95 ? 'excellent' : 'moderate'} performance. {equipmentScore < 90 ? 'Schedule inspection.' : 'Continue monitoring.'}</div>
					</div>
				</div>
			</div>

			<!-- Enhanced Financial Summary -->
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
					
					<div class="p-3 bg-blue-50 rounded-xl border border-blue-200">
						<div class="text-sm text-blue-600">Total Volume Value</div>
						<div class="metric-display text-blue-700 text-lg">${(totalVolume * oilPricePerGallon).toFixed(0)}</div>
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