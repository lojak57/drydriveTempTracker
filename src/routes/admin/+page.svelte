<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import PerformanceChart from '$lib/components/analytics/PerformanceChart.svelte';
	import AnalyticsCard from '$lib/components/analytics/AnalyticsCard.svelte';
	import { completedHauls, drivers, trucks } from '$lib/stores/haulStore';

	// Analytics metrics
	let totalVolume = 0;
	let averageEfficiency = 0;
	let totalRevenue = 0;
	let costPerBarrel = 0;
	
	let updateInterval: number;

	// Calculate analytics metrics
	onMount(() => {
		updateInterval = setInterval(() => {
			// Calculate from completed hauls
			const completed = $completedHauls;
			totalVolume = completed.reduce((sum, haul) => sum + haul.initialVolume, 0);
			// Calculate efficiency based on volume loss
			averageEfficiency = completed.length > 0 
				? completed.reduce((sum, haul) => {
					const actualLoss = haul.actualLoss || 0;
					const efficiency = haul.initialVolume > 0 ? ((haul.initialVolume - actualLoss) / haul.initialVolume * 100) : 0;
					return sum + efficiency;
				}, 0) / completed.length 
				: 0;
			totalRevenue = totalVolume * 65.50; // $65.50 per barrel
			costPerBarrel = 12.75 + Math.random() * 2.5; // $12.75-15.25 per barrel
		}, 5000);
	});

	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	});

	// Performance metrics
	$: performanceMetrics = {
		efficiency: averageEfficiency,
		volume: totalVolume,
		revenue: totalRevenue,
		cost: costPerBarrel
	};
</script>

<!-- Header -->
<div class="text-center mb-6 sm:mb-8">
	<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-oil-black mb-2">Analytics Dashboard</h1>
	<p class="text-sm sm:text-base text-oil-gray">Historical data and performance insights</p>
</div>

<!-- Key Performance Metrics -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
	<MetricCard
		title="Total Volume"
		value={totalVolume}
		unit="BBL"
		icon="🛢️"
		status="normal"
		trend="up"
		trendValue="+12.5%"
	/>
	
	<MetricCard
		title="Average Efficiency"
		value={averageEfficiency}
		unit="%"
		icon="⚡"
		status={averageEfficiency > 95 ? 'normal' : 'warning'}
		trend="up"
		trendValue="+2.1%"
	/>
	
	<MetricCard
		title="Total Revenue"
		value={totalRevenue}
		unit="$"
		icon="💰"
		status="normal"
		trend="up"
		trendValue="+8.7%"
	/>
	
	<MetricCard
		title="Cost per Barrel"
		value={costPerBarrel}
		unit="$"
		icon="📊"
		status={costPerBarrel < 14 ? 'normal' : 'warning'}
		trend="down"
		trendValue="-$0.45"
	/>
</div>

<!-- Performance Charts -->
<div class="mb-6 sm:mb-8">
	<div class="text-center mb-4 sm:mb-6">
		<h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-oil-black mb-2">Performance Trends</h2>
		<p class="text-oil-gray text-sm sm:text-base">Historical performance data and trends</p>
	</div>
	
	<div class="glass-card p-4 sm:p-6">
		<PerformanceChart />
	</div>
</div>

<!-- Analytics Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
	<!-- Fleet Performance -->
	<AnalyticsCard
		title="Fleet Performance"
		subtitle="Overall fleet efficiency metrics"
		value={averageEfficiency}
		trend="up"
		trendValue="+2.1%"
		color="emerald"
		icon="🚛"
	/>
	
	<!-- Volume Analysis -->
	<AnalyticsCard
		title="Volume Analysis"
		subtitle="Total volume transported"
		value={totalVolume}
		trend="up"
		trendValue="+12.5%"
		color="blue"
		icon="📊"
	/>
	
	<!-- Revenue Tracking -->
	<AnalyticsCard
		title="Revenue Tracking"
		subtitle="Total revenue generated"
		value={totalRevenue}
		trend="up"
		trendValue="+8.7%"
		color="orange"
		icon="💰"
	/>
	
	<!-- Driver Performance -->
	<AnalyticsCard
		title="Driver Performance"
		subtitle="Average driver efficiency"
		value={96.2}
		trend="stable"
		trendValue="+0.3%"
		color="purple"
		icon="👨‍💼"
	/>
	
	<!-- Route Optimization -->
	<AnalyticsCard
		title="Route Optimization"
		subtitle="Route efficiency score"
		value={94.8}
		trend="up"
		trendValue="+1.2%"
		color="amber"
		icon="🗺️"
	/>
	
	<!-- Cost Analysis -->
	<AnalyticsCard
		title="Cost Analysis"
		subtitle="Cost per barrel transported"
		value={costPerBarrel}
		trend="down"
		trendValue="-$0.45"
		color="red"
		icon="💸"
	/>
</div>

<!-- Summary Statistics -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
	<!-- Fleet Summary -->
	<div class="glass-card p-4 sm:p-6">
		<h3 class="text-lg sm:text-xl font-semibold tracking-tight text-oil-black mb-4">Fleet Summary</h3>
		<div class="space-y-3">
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Total Trucks</span>
				<span class="font-semibold text-oil-black">{$trucks.length}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Active Drivers</span>
				<span class="font-semibold text-oil-black">{$drivers.length}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Completed Hauls</span>
				<span class="font-semibold text-oil-black">{$completedHauls.length}</span>
			</div>
		</div>
	</div>
	
	<!-- Performance Summary -->
	<div class="glass-card p-4 sm:p-6">
		<h3 class="text-lg sm:text-xl font-semibold tracking-tight text-oil-black mb-4">Performance Summary</h3>
		<div class="space-y-3">
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Avg Efficiency</span>
				<span class="font-semibold text-emerald-600">{averageEfficiency.toFixed(1)}%</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">System Uptime</span>
				<span class="font-semibold text-emerald-600">99.2%</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Safety Score</span>
				<span class="font-semibold text-emerald-600">98.7%</span>
			</div>
		</div>
	</div>
	
	<!-- Financial Summary -->
	<div class="glass-card p-4 sm:p-6">
		<h3 class="text-lg sm:text-xl font-semibold tracking-tight text-oil-black mb-4">Financial Summary</h3>
		<div class="space-y-3">
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Total Revenue</span>
				<span class="font-semibold text-emerald-600">${totalRevenue.toLocaleString()}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Cost per BBL</span>
				<span class="font-semibold text-oil-black">${costPerBarrel.toFixed(2)}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-oil-gray text-sm">Profit Margin</span>
				<span class="font-semibold text-emerald-600">78.2%</span>
			</div>
		</div>
	</div>
</div> 