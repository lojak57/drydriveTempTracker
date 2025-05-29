<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RealtimeChart from '$lib/components/charts/RealtimeChart.svelte';
	import GaugeChart from '$lib/components/charts/GaugeChart.svelte';
	import DryDriveLogo from '$lib/components/ui/DryDriveLogo.svelte';
	import HaulCard from '$lib/components/dashboard/HaulCard.svelte';
	import { activeHauls, completedHauls, scadaStatus, drivers, trucks } from '$lib/stores/haulStore';

	// Enhanced real-time metrics
	let currentTemp = 76.3;
	let ambientTemp = 98.7;
	let systemPressure = 154.2;
	let flowRate = 3.0;
	
	// New Coriolis metrics
	let netVolume = 172.5;
	let apiGravity = 42.1;
	let waterCut = 0.8;
	let massFlowRate = 3.2;
	
	// Safety & Pressure metrics
	let h2sLevels = 0.5;
	let tankerPressure = 145.2;
	let gasDetectionStatus: 'normal' | 'warning' | 'critical' = 'normal';
	let pumpRpm = 1750;
	
	// System Health metrics
	let scadaStatusValue = 'online';
	let dryDriveTemp = 185.3;
	let networkHealth = 98.7;
	let activeAlerts = 0;
	
	let updateInterval: number;
	let currentDate = new Date(1735064220000); // Static timestamp for SSR consistency

	// Enhanced real-time SCADA simulation
	onMount(() => {
		// Update to current time once mounted
		currentDate = new Date();
		
		updateInterval = setInterval(() => {
			// Core Operations (Row 1)
			currentTemp = 70 + Math.random() * 15; // 70-85°F
			ambientTemp = 85 + Math.random() * 20; // 85-105°F
			systemPressure = 140 + Math.random() * 25; // 140-165 PSI
			flowRate = 2.5 + Math.random() * 1.0; // 2.5-3.5 bbl/min
			
			// Coriolis Measurements (Row 2)
			netVolume = 150 + Math.random() * 30; // 150-180 BBL
			apiGravity = 35 + Math.random() * 10; // 35-45° API
			waterCut = 0.1 + Math.random() * 1.9; // 0.1-2.0%
			massFlowRate = 2.8 + Math.random() * 1.4; // 2.8-4.2 BBL/min
			
			// Safety & Pressure (Row 3)
			h2sLevels = Math.random() * 2.0; // 0-2.0 PPM
			tankerPressure = 140 + Math.random() * 20; // 140-160 PSI
			gasDetectionStatus = h2sLevels > 1.5 ? 'warning' : 'normal';
			pumpRpm = 1650 + Math.random() * 200; // 1650-1850 RPM
			
			// System Health (Row 4)
			dryDriveTemp = 175 + Math.random() * 25; // 175-200°F
			networkHealth = 95 + Math.random() * 5; // 95-100%
			activeAlerts = Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0;
			
			// Update current date for real-time calculations
			currentDate = new Date();
		}, 4000);
	});

	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	});

	// Derived metrics
	$: totalActiveVolume = $activeHauls.reduce((sum, haul) => sum + haul.initialVolume, 0);
	$: totalExpectedLoss = $activeHauls.reduce((sum, haul) => sum + haul.expectedLoss, 0);
	$: completedToday = browser ? $completedHauls.filter(haul => {
		const haulDate = haul.endTime || haul.startTime;
		return haulDate.toDateString() === currentDate.toDateString();
	}).length : 0;
	
	$: haulsByStatus = $activeHauls.reduce((counts, haul) => {
		counts[haul.status] = (counts[haul.status] || 0) + 1;
		return counts;
	}, {} as Record<string, number>);
</script>

<!-- Header -->
<div class="text-center mb-4 sm:mb-8">
	<div class="flex justify-center mb-3 sm:mb-4">
		<DryDriveLogo size={240} />
	</div>
	<h1 class="text-xl sm:text-2xl lg:text-4xl font-bold tracking-tight text-oil-black mb-2">Oil Transport Operations Center</h1>
	<p class="text-xs sm:text-base text-oil-gray">Real-time SCADA monitoring and fleet management platform</p>
</div>

<!-- Enhanced System Status Banner -->
<div class="glass-card p-3 sm:p-6 mb-4 sm:mb-8">
	<div class="status-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
		<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
			<div class="flex items-center gap-2 justify-center sm:justify-start">
				<div class="w-3 h-3 sm:w-4 sm:h-4 {$scadaStatus.systemOnline ? 'bg-emerald-400' : 'bg-red-400'} rounded-full animate-pulse"></div>
				<span class="font-semibold text-oil-black text-sm sm:text-base">System Online</span>
			</div>
			<div class="hidden sm:block text-oil-gray">|</div>
			<div class="text-xs sm:text-sm text-oil-gray text-center sm:text-left">
				{$scadaStatus.connectedDevices} devices connected
			</div>
			<div class="hidden sm:block text-oil-gray">|</div>
			<div class="text-xs sm:text-sm text-oil-gray text-center sm:text-left">
				Coriolis: {$scadaStatus.coriolisOnline ? '✓' : '✗'}
			</div>
			<div class="hidden sm:block text-oil-gray">|</div>
			<div class="text-xs sm:text-sm text-oil-gray text-center sm:text-left">
				Gas Detectors: {$scadaStatus.gasDetectorsOnline ? '✓' : '✗'}
			</div>
			<div class="hidden sm:block text-oil-gray">|</div>
			<div class="text-xs sm:text-sm text-oil-gray text-center sm:text-left">
				DryDrive: {$scadaStatus.dryDriveOnline ? '✓' : '✗'}
			</div>
		</div>
		<div class="text-center sm:text-right">
			<div class="text-xs sm:text-sm text-oil-gray">Network Health: {$scadaStatus.networkHealth.toFixed(1)}%</div>
			<div class="font-mono text-oil-black text-xs sm:text-sm">{$scadaStatus.lastUpdate.toLocaleTimeString()}</div>
		</div>
	</div>
</div>

<!-- Primary Navigation Actions -->
<div class="glass-card p-4 sm:p-8 text-center mb-4 sm:mb-8">
	<h3 class="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black mb-3 sm:mb-6">Dashboard Navigation</h3>
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
		<a 
			href="/haul" 
			class="nav-card block p-3 sm:p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation"
			style="background: linear-gradient(135deg, #7CB342 0%, #9CCC65 100%);"
		>
			<div class="text-xl sm:text-3xl mb-2">🚛</div>
			<div class="font-bold text-sm sm:text-lg mb-1 text-white">Live Haul Monitoring</div>
			<div class="text-white/90 text-xs sm:text-sm font-medium">Monitor active hauls and real-time data</div>
		</a>
		
		<a 
			href="/fleet" 
			class="nav-card block p-3 sm:p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation"
			style="background: linear-gradient(135deg, #558B2F 0%, #7CB342 100%);"
		>
			<div class="text-xl sm:text-3xl mb-2">🚚</div>
			<div class="font-bold text-sm sm:text-lg mb-1 text-white">Fleet Operations</div>
			<div class="text-white/90 text-xs sm:text-sm font-medium">Complete fleet visibility and control</div>
		</a>
		
		<a 
			href="/admin" 
			class="nav-card block p-3 sm:p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 touch-manipulation"
			style="background: linear-gradient(135deg, #CDDC39 0%, #9CCC65 100%);"
		>
			<div class="text-xl sm:text-3xl mb-2">📊</div>
			<div class="font-bold text-sm sm:text-lg mb-1 text-white">Analytics Dashboard</div>
			<div class="text-white/90 text-xs sm:text-sm font-medium">Historical data and performance metrics</div>
		</a>
	</div>
</div>

<!-- Enhanced 4x4 Metrics Grid -->
<div class="metric-grid grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 sm:mb-8">
	<!-- Row 1: Core Operations -->
	<MetricCard 
		title="Internal Oil Temp" 
		value={currentTemp} 
		unit="°F" 
		icon="🌡️" 
		status={currentTemp > 120 ? 'warning' : 'normal'}
		trend="stable"
		trendValue="+0.2°"
		color="orange"
	/>
	<MetricCard 
		title="Ambient Temp" 
		value={ambientTemp} 
		unit="°F" 
		icon="🌤️" 
		status="normal"
		trend="up"
		trendValue="+1.5°"
		color="blue"
	/>
	<MetricCard 
		title="System Pressure" 
		value={systemPressure} 
		unit="PSI" 
		icon="📊" 
		status={systemPressure > 180 ? 'warning' : 'normal'}
		trend="stable"
		trendValue="-0.3"
		color="emerald"
	/>
	<MetricCard 
		title="Flow Rate" 
		value={flowRate} 
		unit="BBL/min" 
		icon="🌊" 
		status="normal"
		trend="up"
		trendValue="+0.8"
		color="blue"
	/>

	<!-- Row 2: Coriolis Measurements -->
	<MetricCard 
		title="Net Volume" 
		value={netVolume} 
		unit="BBL" 
		icon="🛢️" 
		status="normal"
		trend="stable"
		trendValue="+2.1"
		color="orange"
	/>
	<MetricCard 
		title="API Gravity" 
		value={apiGravity} 
		unit="°API" 
		icon="⚖️" 
		status="normal"
		trend="stable"
		trendValue="+0.1"
		color="emerald"
	/>
	<MetricCard 
		title="Water Cut" 
		value={waterCut} 
		unit="%" 
		icon="💧" 
		status={waterCut > 2 ? 'warning' : 'normal'}
		trend="down"
		trendValue="-0.05"
		color="blue"
	/>
	<MetricCard 
		title="Mass Flow Rate" 
		value={massFlowRate} 
		unit="BBL/min" 
		icon="⚡" 
		status="normal"
		trend="up"
		trendValue="+1.2"
		color="amber"
	/>

	<!-- Row 3: Safety & Pressure -->
	<MetricCard 
		title="H2S Levels" 
		value={h2sLevels.toFixed(1)} 
		unit="PPM" 
		icon="⚠️" 
		status={h2sLevels > 10 ? 'critical' : h2sLevels > 5 ? 'warning' : 'normal'}
		trend="stable"
		trendValue="0.0"
		color="red"
	/>
	<MetricCard 
		title="Tanker Pressure" 
		value={tankerPressure.toFixed(1)} 
		unit="PSI" 
		icon="🔧" 
		status={tankerPressure > 180 ? 'warning' : 'normal'}
		trend="down"
		trendValue="-2.1"
		color="emerald"
	/>
	<MetricCard 
		title="Gas Detection" 
		value={gasDetectionStatus === 'normal' ? 'SAFE' : gasDetectionStatus.toUpperCase()} 
		unit="" 
		icon="🛡️" 
		status={gasDetectionStatus}
		trend="stable"
		trendValue="All Clear"
		color="emerald"
	/>
	<MetricCard 
		title="Pump RPM" 
		value={pumpRpm.toFixed(0)} 
		unit="RPM" 
		icon="⚙️" 
		status="normal"
		trend="stable"
		trendValue="+5"
		color="blue"
	/>

	<!-- Row 4: System Health -->
	<MetricCard 
		title="SCADA Status" 
		value={$scadaStatus.systemOnline ? 'ONLINE' : 'OFFLINE'} 
		unit="" 
		icon="📡" 
		status={$scadaStatus.systemOnline ? 'normal' : 'critical'}
		trend="stable"
		trendValue="98% uptime"
		color="emerald"
	/>
	<MetricCard 
		title="DryDrive Temp" 
		value={dryDriveTemp.toFixed(1)} 
		unit="°F" 
		icon="🔥" 
		status={dryDriveTemp > 200 ? 'warning' : 'normal'}
		trend="up"
		trendValue="+3.2°"
		color="orange"
	/>
	<MetricCard 
		title="Network Health" 
		value={networkHealth.toFixed(1)} 
		unit="%" 
		icon="📶" 
		status={networkHealth < 90 ? 'warning' : 'normal'}
		trend="stable"
		trendValue="+1%"
		color="blue"
	/>
	<MetricCard 
		title="Active Alerts" 
		value={activeAlerts} 
		unit="" 
		icon="🚨" 
		status={activeAlerts > 0 ? 'warning' : 'normal'}
		trend="stable"
		trendValue="0 critical"
		color={activeAlerts > 0 ? 'red' : 'emerald'}
	/>
</div>

<!-- Real-time Data Visualizations -->
<div class="mb-4 sm:mb-8">
	<div class="text-center mb-4 sm:mb-6">
		<h2 class="text-lg sm:text-3xl font-bold tracking-tight text-oil-black mb-2">Live System Monitoring</h2>
		<p class="text-oil-gray text-xs sm:text-base">Real-time visualization of critical oil field operations</p>
	</div>
	
	{#if currentTemp && ambientTemp && systemPressure && flowRate}
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
		<!-- Temperature Monitoring Chart -->
		<div class="chart-container">
			<RealtimeChart 
				title="Temperature Monitoring"
				color="#7CB342"
				height={200}
				unit="°F"
				animated={true}
			/>
		</div>
		
		<!-- Flow Rate & Pressure Chart -->
		<div class="chart-container">
			<RealtimeChart 
				title="Flow Rate & System Pressure"
				color="#558B2F"
				height={200}
				unit=" BBL/min"
				animated={true}
			/>
		</div>
	</div>
	
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
		<!-- Volume Trends -->
		<div class="chart-container">
			<RealtimeChart 
				title="Net Volume Trends"
				color="#9CCC65"
				height={180}
				unit=" BBL"
				animated={true}
			/>
		</div>
		
		<!-- Safety Monitoring -->
		<div class="chart-container">
			<RealtimeChart 
				title="H2S Safety Levels"
				color="#ef4444"
				height={180}
				unit=" PPM"
				animated={true}
			/>
		</div>
		
		<!-- System Health -->
		<div class="chart-container">
			<RealtimeChart 
				title="Network & System Health"
				color="#CDDC39"
				height={180}
				unit="%"
				animated={true}
			/>
		</div>
	</div>
	{/if}
</div>

<!-- Key Performance Indicators -->
<div class="mb-4 sm:mb-8">
	<div class="text-center mb-4 sm:mb-6">
		<h2 class="text-lg sm:text-3xl font-bold tracking-tight text-oil-black mb-2">Performance Dashboard</h2>
		<p class="text-oil-gray text-xs sm:text-base">Critical performance indicators and safety metrics</p>
	</div>
	
	{#if currentTemp && systemPressure && h2sLevels && networkHealth && flowRate}
	<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
		<!-- System Efficiency -->
		<div class="glass-card">
			<GaugeChart 
				title="System Efficiency"
				value={96.8}
				max={100}
				unit="%"
				color="emerald"
				size={100}
				thresholds={{ warning: 85, critical: 75 }}
			/>
		</div>
		
		<!-- Temperature Status -->
		<div class="glass-card">
			<GaugeChart 
				title="Oil Temperature"
				value={currentTemp}
				max={120}
				min={60}
				unit="°F"
				color="emerald"
				size={100}
				thresholds={{ warning: 95, critical: 110 }}
			/>
		</div>
		
		<!-- Pressure Status -->
		<div class="glass-card">
			<GaugeChart 
				title="System Pressure"
				value={systemPressure}
				max={200}
				min={100}
				unit=" PSI"
				color="emerald"
				size={100}
				thresholds={{ warning: 180, critical: 190 }}
			/>
		</div>
		
		<!-- Safety Score -->
		<div class="glass-card">
			<GaugeChart 
				title="Safety Score"
				value={h2sLevels < 5 ? 98 : h2sLevels < 10 ? 85 : 65}
				max={100}
				unit="%"
				color="emerald"
				size={100}
				thresholds={{ warning: 80, critical: 70 }}
			/>
		</div>
		
		<!-- Network Health -->
		<div class="glass-card">
			<GaugeChart 
				title="Network Health"
				value={networkHealth}
				max={100}
				unit="%"
				color="emerald"
				size={100}
				thresholds={{ warning: 90, critical: 80 }}
			/>
		</div>
		
		<!-- Flow Rate Status -->
		<div class="glass-card">
			<GaugeChart 
				title="Flow Rate"
				value={flowRate}
				max={5}
				min={0}
				unit=" BBL/min"
				color="emerald"
				size={100}
				thresholds={{ warning: 4.5, critical: 4.8 }}
			/>
		</div>
	</div>
	{/if}
</div>

<!-- Operations Overview -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 mb-4 sm:mb-8">
	<!-- Active Operations -->
	<div class="glass-card p-3 sm:p-6">
		<div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
			<div class="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
			<h3 class="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black">Active Operations</h3>
		</div>
		
		<div class="space-y-3 sm:space-y-4">
			<div class="flex justify-between items-center p-2 sm:p-3 bg-white/30 rounded-xl">
				<span class="text-oil-gray text-xs sm:text-sm">Total Active Hauls</span>
				<span class="metric-display text-oil-orange text-lg sm:text-xl">{$activeHauls.length}</span>
			</div>
			
			<div class="flex justify-between items-center p-2 sm:p-3 bg-white/30 rounded-xl">
				<span class="text-oil-gray text-xs sm:text-sm">Total Volume</span>
				<span class="metric-display text-oil-blue text-lg sm:text-xl">{totalActiveVolume.toLocaleString()}</span>
			</div>
			
			<div class="flex justify-between items-center p-2 sm:p-3 bg-white/30 rounded-xl">
				<span class="text-oil-gray text-xs sm:text-sm">Expected Loss</span>
				<span class="metric-display text-amber-600 text-lg sm:text-xl">{totalExpectedLoss.toFixed(1)}</span>
			</div>
		</div>
	</div>

	<!-- Haul Status Breakdown -->
	<div class="glass-card p-3 sm:p-6">
		<div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
			<div class="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></div>
			<h3 class="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black">Haul Status</h3>
		</div>
		
		<div class="space-y-2 sm:space-y-3">
			<div class="flex justify-between items-center p-2 sm:p-3 bg-amber-50 rounded-xl border border-amber-200">
				<div class="flex items-center gap-1 sm:gap-2">
					<span class="text-base sm:text-lg">📦</span>
					<span class="text-amber-700 font-medium text-xs sm:text-sm">Loading</span>
				</div>
				<span class="metric-display text-amber-700 text-base sm:text-lg">{haulsByStatus.loading || 0}</span>
			</div>
			
			<div class="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-xl border border-blue-200">
				<div class="flex items-center gap-1 sm:gap-2">
					<span class="text-base sm:text-lg">🚛</span>
					<span class="text-blue-700 font-medium text-xs sm:text-sm">In Transit</span>
				</div>
				<span class="metric-display text-blue-700 text-base sm:text-lg">{haulsByStatus.transit || 0}</span>
			</div>
			
			<div class="flex justify-between items-center p-2 sm:p-3 bg-emerald-50 rounded-xl border border-emerald-200">
				<div class="flex items-center gap-1 sm:gap-2">
					<span class="text-base sm:text-lg">🏭</span>
					<span class="text-emerald-700 font-medium text-xs sm:text-sm">Offloading</span>
				</div>
				<span class="metric-display text-emerald-700 text-base sm:text-lg">{haulsByStatus.offloading || 0}</span>
			</div>
		</div>
	</div>

	<!-- Daily Summary -->
	<div class="glass-card p-3 sm:p-6 md:col-span-2 lg:col-span-1">
		<div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
			<div class="w-2 h-2 sm:w-3 sm:h-3 bg-oil-orange rounded-full"></div>
			<h3 class="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-oil-black">Today's Summary</h3>
		</div>
		
		<div class="space-y-3 sm:space-y-4">
			<div class="text-center p-3 sm:p-4 bg-white/30 rounded-xl">
				<div class="metric-display text-oil-orange text-xl sm:text-2xl mb-1">{completedToday}</div>
				<div class="text-oil-gray text-xs sm:text-sm">Completed Hauls</div>
			</div>
			
			<div class="text-center p-3 sm:p-4 bg-white/30 rounded-xl">
				<div class="metric-display text-oil-blue text-xl sm:text-2xl mb-1">{$drivers.length}</div>
				<div class="text-oil-gray text-xs sm:text-sm">Active Drivers</div>
			</div>
			
			<div class="text-center p-3 sm:p-4 bg-white/30 rounded-xl">
				<div class="metric-display text-emerald-600 text-xl sm:text-2xl mb-1">98.2%</div>
				<div class="text-oil-gray text-xs sm:text-sm">System Uptime</div>
			</div>
		</div>
	</div>
</div>
