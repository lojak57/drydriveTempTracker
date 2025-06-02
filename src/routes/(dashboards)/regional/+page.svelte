<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RegionalYardComparison from '$lib/components/regional/RegionalYardComparison.svelte';

	// Regional comparison state
	let showYardComparison = false;
	let selectedRegion = '';

	// Active region filter
	let activeRegion = 'Gulf Coast';
	
	// Regional data structure - consolidated to regional rollups only (no states)
	const regions = [
		{
			id: 'gulf-coast',
			name: 'Gulf Coast',
			color: '#475569' // Steel gray
		},
		{
			id: 'southwest',
			name: 'Southwest TX',
			color: '#B45309' // Industrial orange
		},
		{
			id: 'rockies',
			name: 'Rockies',
			color: '#374151' // Dark charcoal
		},
		{
			id: 'midcon',
			name: 'Midcon',
			color: '#7C2D12' // Deep rust red
		}
	];

	// Regional performance data - scalable structure with proper typing
	interface RegionalPerformance {
		fleetSize: number;
		activeTrucks: number;
		driversAssigned: number;
		totalBPD: number;
		avgDriveTime: number;
		barrelsPerHour: number;
		efficiency: number;
		utilization: number;
		trend: 'up' | 'down' | 'stable';
		status: 'excellent' | 'good' | 'attention';
	}

	const regionalData: Record<string, RegionalPerformance> = {
		'Gulf Coast': {
			fleetSize: 142,
			activeTrucks: 125,
			driversAssigned: 234,
			totalBPD: 12847,
			avgDriveTime: 3.2,
			barrelsPerHour: 185.3,
			efficiency: 94.2,
			utilization: 88.0,
			trend: 'up',
			status: 'excellent'
		},
		'Southwest TX': {
			fleetSize: 89,
			activeTrucks: 78,
			driversAssigned: 156,
			totalBPD: 8456,
			avgDriveTime: 3.8,
			barrelsPerHour: 165.2,
			efficiency: 91.8,
			utilization: 87.6,
			trend: 'stable',
			status: 'good'
		},
		'Rockies': {
			fleetSize: 67,
			activeTrucks: 54,
			driversAssigned: 98,
			totalBPD: 5987,
			avgDriveTime: 4.2,
			barrelsPerHour: 142.8,
			efficiency: 87.3,
			utilization: 80.6,
			trend: 'down',
			status: 'attention'
		},
		'Midcon': {
			fleetSize: 104,
			activeTrucks: 92,
			driversAssigned: 178,
			totalBPD: 9124,
			avgDriveTime: 3.5,
			barrelsPerHour: 168.7,
			efficiency: 92.5,
			utilization: 88.5,
			trend: 'up',
			status: 'excellent'
		}
	};

	// Get current region data
	$: currentRegionData = regionalData[activeRegion];

	// Regional filter functions
	function selectRegion(regionName: string) {
		activeRegion = regionName;
	}

	// Yard comparison functions
	function openYardComparison(regionName: string) {
		selectedRegion = regionName;
		showYardComparison = true;
	}

	function closeYardComparison() {
		showYardComparison = false;
		selectedRegion = '';
	}

	// Status color mapping - using only green/red for performance indicators
	function getStatusColor(status: string) {
		switch (status) {
			case 'excellent': return 'bg-green-600'; // Green for excellent
			case 'good': return 'bg-slate-600'; // Neutral for good
			case 'attention': return 'bg-red-600'; // Red for attention
			default: return 'bg-slate-500';
		}
	}

	// Trend color mapping - only green/red for performance indicators
	function getTrendColor(trend: string) {
		switch (trend) {
			case 'up': return 'text-green-600'; // Green for positive
			case 'down': return 'text-red-600'; // Red for negative
			default: return 'text-slate-600';
		}
	}

	// Get region color
	function getRegionColor(regionName: string) {
		const region = regions.find(r => r.name === regionName);
		return region ? region.color : '#6B7280';
	}

	// Get performance-based bar color (dark default, red for low performers)
	function getPerformanceBarColor(value: number, metric: string) {
		let threshold = 0;
		switch (metric) {
			case 'bpd': threshold = 2000; break;
			case 'efficiency': threshold = 88; break;
			case 'bph': threshold = 150; break;
			default: threshold = 0;
		}
		
		return value < threshold ? '#ef4444' : '#1e293b'; // Red for low performers, navy for others
	}

	// Check if region needs attention (for alert icons)
	function needsAttention(value: number, metric: string) {
		let threshold = 0;
		switch (metric) {
			case 'bpd': threshold = 2000; break;
			case 'efficiency': threshold = 88; break;
			case 'bph': threshold = 150; break;
			default: threshold = 0;
		}
		
		return value < threshold;
	}

	// Dropdown menu state
	let hoveredRegion = '';
	let dropdownTimeout: number;

	// Handle dropdown visibility
	function showDropdown(regionName: string) {
		clearTimeout(dropdownTimeout);
		hoveredRegion = regionName;
	}

	function hideDropdown() {
		dropdownTimeout = setTimeout(() => {
			hoveredRegion = '';
		}, 150);
	}

	function keepDropdown() {
		clearTimeout(dropdownTimeout);
	}
</script>

<svelte:head>
	<title>Regional Manager Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="regional-dashboard font-sans text-sm text-slate-800">
	<!-- Darker Header Banner -->
	<div class="dashboard-header bg-slate-800 text-white">
		<div class="header-content">
			<div class="header-text">
				<h1 class="header-title text-xl font-semibold">Regional Manager Dashboard</h1>
				<p class="header-subtitle text-slate-300">Multi-region oversight and performance comparison</p>
			</div>
		</div>
	</div>

	<!-- Region Filters with Hover Dropdowns -->
	<div class="region-filters">
		{#each regions as region}
			<div class="region-dropdown-container">
				<button 
					class="region-filter"
					class:active={activeRegion === region.name}
					style="--region-color: {region.color}"
					on:click={() => selectRegion(region.name)}
					on:mouseenter={() => showDropdown(region.name)}
					on:mouseleave={hideDropdown}
				>
					<div class="filter-indicator" style="background-color: {region.color}"></div>
					<div class="filter-content">
						<span class="filter-name text-slate-800">{region.name}</span>
					</div>
					<span class="dropdown-arrow text-slate-600">▾</span>
				</button>

				<!-- Hover Dropdown Menu -->
				{#if hoveredRegion === region.name}
					<div 
						class="dropdown-menu"
						on:mouseenter={keepDropdown}
						on:mouseleave={hideDropdown}
					>
						<ul class="text-sm text-slate-800 divide-y divide-slate-200">
							<li><button class="dropdown-item" on:click={() => openYardComparison(region.name)}>Regional Fleet</button></li>
							<li><button class="dropdown-item" on:click={() => openYardComparison(region.name)}>Active Trucks</button></li>
							<li><button class="dropdown-item" on:click={() => openYardComparison(region.name)}>Drivers Assigned</button></li>
							<li><button class="dropdown-item" on:click={() => openYardComparison(region.name)}>Regional Efficiency</button></li>
						</ul>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Regional Overview Cards (no icons) -->
	<div class="overview-metrics">
		<MetricCard 
			title="Regional Fleet" 
			value={currentRegionData.fleetSize.toString()} 
			unit="trucks" 
			status="normal"
			trend={currentRegionData.trend}
			trendValue={currentRegionData.trend === 'up' ? '+8' : currentRegionData.trend === 'down' ? '-3' : '0'}
			color="blue"
		/>
		<MetricCard 
			title="Active Trucks" 
			value={currentRegionData.activeTrucks.toString()} 
			unit="operating" 
			status="normal"
			trend={currentRegionData.trend}
			trendValue={`${Math.round(currentRegionData.utilization)}% util`}
			color="emerald"
		/>
		<MetricCard 
			title="Drivers Assigned" 
			value={currentRegionData.driversAssigned.toString()} 
			unit="certified" 
			status="normal"
			trend="stable"
			trendValue="full staffed"
			color="purple"
		/>
		<MetricCard 
			title="Regional Efficiency" 
			value={currentRegionData.efficiency.toString()} 
			unit="%" 
			status="normal"
			trend={currentRegionData.trend}
			trendValue={currentRegionData.trend === 'up' ? '+2.1%' : currentRegionData.trend === 'down' ? '-1.5%' : '0%'}
			color="orange"
		/>
	</div>

	<!-- Main Content -->
	<div class="main-content">
		<!-- Enhanced Regional Performance Section (removed footer verbiage) -->
		<div class="content-section regional-performance-section">
			<div class="section-header">
				<h2 class="text-xl font-semibold text-slate-800">{activeRegion} Performance Overview</h2>
				<p class="text-slate-600">Detailed operational metrics for regional comparison</p>
			</div>
			
			<!-- Performance Cards (no icons) -->
			<div class="performance-cards">
				<div class="perf-card clickable" on:click={() => openYardComparison(activeRegion)}>
					<div class="perf-header">
						<div class="perf-status {getStatusColor(currentRegionData.status)}">
							{currentRegionData.status.toUpperCase()}
						</div>
					</div>
					<h3 class="text-base font-semibold text-slate-800">Total BPD</h3>
					<div class="perf-value text-2xl font-bold text-slate-800">{currentRegionData.totalBPD.toLocaleString()}</div>
					<div class="click-hint text-xs text-slate-500">Click to compare yards</div>
				</div>

				<div class="perf-card clickable" on:click={() => openYardComparison(activeRegion)}>
					<div class="perf-header">
						<div class="perf-status bg-slate-500">OPTIMIZED</div>
					</div>
					<h3 class="text-base font-semibold text-slate-800">Avg Drive Time</h3>
					<div class="perf-value text-2xl font-bold text-slate-800">{currentRegionData.avgDriveTime}h</div>
					<div class="click-hint text-xs text-slate-500">View yard breakdown</div>
				</div>

				<div class="perf-card clickable" on:click={() => openYardComparison(activeRegion)}>
					<div class="perf-header">
						<div class="perf-status bg-slate-500">TARGET</div>
					</div>
					<h3 class="text-base font-semibold text-slate-800">Barrels per Hour</h3>
					<div class="perf-value text-2xl font-bold text-slate-800">{currentRegionData.barrelsPerHour}</div>
					<div class="click-hint text-xs text-slate-500">Analyze performance</div>
				</div>
			</div>

			<!-- Quick Regional Stats -->
			<div class="regional-stats">
				<div class="stat-item">
					<span class="stat-label text-slate-600">Fleet Utilization</span>
					<span class="stat-value font-mono font-semibold text-slate-800">{currentRegionData.utilization}%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label text-slate-600">Regional Efficiency</span>
					<span class="stat-value font-mono font-semibold text-slate-800">{currentRegionData.efficiency}%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label text-slate-600">Active/Total Ratio</span>
					<span class="stat-value font-mono font-semibold text-slate-800">{Math.round((currentRegionData.activeTrucks / currentRegionData.fleetSize) * 100)}%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label text-slate-600">Driver Coverage</span>
					<span class="stat-value font-mono font-semibold text-slate-800">{Math.round((currentRegionData.driversAssigned / currentRegionData.fleetSize) * 100)}%</span>
				</div>
			</div>
		</div>

		<!-- Regional Comparison Summary -->
		<div class="content-section">
			<h2 class="text-xl font-semibold text-slate-800 mb-6">Cross-Regional Performance</h2>
			<div class="comparison-grid">
				{#each Object.entries(regionalData) as [regionName, data]}
					<div class="region-summary-card" class:active={regionName === activeRegion} style="--region-color: {getRegionColor(regionName)}">
						<div class="region-header">
							<h3 class="text-lg font-semibold text-slate-800">{regionName}</h3>
							<div class="region-status {getStatusColor(data.status)}"></div>
						</div>
						<div class="region-metrics">
							<div class="metric-row">
								<span class="text-slate-600">Fleet Size:</span>
								<span class="metric-value font-mono font-semibold text-slate-800">{data.fleetSize}</span>
							</div>
							<div class="metric-row">
								<span class="text-slate-600">Total BPD:</span>
								<span class="metric-value font-mono font-semibold text-slate-800">{data.totalBPD.toLocaleString()}</span>
							</div>
							<div class="metric-row">
								<span class="text-slate-600">Efficiency:</span>
								<span class="metric-value font-mono font-semibold {data.efficiency >= 93 ? 'text-green-600' : data.efficiency >= 90 ? 'text-slate-800' : 'text-red-600'}">{data.efficiency}%</span>
							</div>
						</div>
						<button 
							class="compare-btn border border-slate-400 text-slate-700 bg-transparent hover:bg-slate-100 px-4 py-2 rounded text-sm font-medium transition-colors"
							on:click={() => openYardComparison(regionName)}
						>
							Compare Yards →
						</button>
					</div>
				{/each}
			</div>
		</div>

		<!-- Visual Comparison Charts -->
		<div class="content-section">
			<div class="section-header">
				<h2 class="text-xl font-semibold text-slate-800">Regional Performance Comparison Charts</h2>
				<p class="text-slate-600">Visual analysis of key operational metrics across all regions</p>
			</div>
			
			<div class="charts-grid chart-card-container">
				<!-- Fleet Size Comparison -->
				<div class="chart-card">
					<div class="chart-header">
						<h3 class="text-base font-semibold text-slate-800">Fleet Size Distribution</h3>
						<span class="chart-subtitle text-sm text-slate-600">Total trucks by region</span>
					</div>
					<div class="chart-content">
						<div class="bar-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								{@const maxFleet = Math.max(...Object.values(regionalData).map(d => d.fleetSize))}
								{@const percentage = (data.fleetSize / maxFleet) * 100}
								<div class="chart-row">
									<div class="chart-label text-slate-700">{regionName}</div>
									<div class="chart-bar-container">
										<div 
											class="chart-bar chart-bar-with-value"
											style="width: {percentage}%; background: {getPerformanceBarColor(data.fleetSize, 'fleet')};"
										>
											<span class="chart-value-inside">{data.fleetSize}</span>
											{#if needsAttention(data.fleetSize, 'fleet')}
												<span class="alert-icon">❗</span>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- BPD Production Comparison -->
				<div class="chart-card">
					<div class="chart-header">
						<h3 class="text-base font-semibold text-slate-800">Total BPD Production</h3>
						<span class="chart-subtitle text-sm text-slate-600">Daily barrels produced</span>
					</div>
					<div class="chart-content">
						<div class="bar-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								{@const maxBPD = Math.max(...Object.values(regionalData).map(d => d.totalBPD))}
								{@const percentage = (data.totalBPD / maxBPD) * 100}
								<div class="chart-row">
									<div class="chart-label text-slate-700">{regionName}</div>
									<div class="chart-bar-container">
										<div 
											class="chart-bar chart-bar-with-value"
											style="width: {percentage}%; background: {getPerformanceBarColor(data.totalBPD, 'bpd')};"
										>
											<span class="chart-value-inside">{data.totalBPD.toLocaleString()}</span>
											{#if needsAttention(data.totalBPD, 'bpd')}
												<span class="alert-icon">❗</span>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Efficiency Comparison -->
				<div class="chart-card">
					<div class="chart-header">
						<h3 class="text-base font-semibold text-slate-800">Regional Efficiency</h3>
						<span class="chart-subtitle text-sm text-slate-600">Operational efficiency percentage</span>
					</div>
					<div class="chart-content">
						<div class="efficiency-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								<div class="efficiency-item">
									<div class="efficiency-header">
										<span class="efficiency-label text-slate-700">{regionName}</span>
									</div>
									<div class="efficiency-bar-bg">
										<div 
											class="efficiency-bar chart-bar-with-value"
											style="width: {data.efficiency}%; background: {getPerformanceBarColor(data.efficiency, 'efficiency')};"
										>
											<span class="chart-value-inside">{data.efficiency}%</span>
											{#if needsAttention(data.efficiency, 'efficiency')}
												<span class="alert-icon">❗</span>
											{/if}
										</div>
									</div>
									<div class="efficiency-status">
										{#if data.efficiency >= 93}
											<span class="status-excellent text-green-600 font-medium">Excellent</span>
										{:else if data.efficiency >= 88}
											<span class="status-good text-slate-700 font-medium">Good</span>
										{:else}
											<span class="status-attention text-red-600 font-medium">Needs Attention</span>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Productivity Comparison -->
				<div class="chart-card">
					<div class="chart-header">
						<h3 class="text-base font-semibold text-slate-800">Barrels per Hour</h3>
						<span class="chart-subtitle text-sm text-slate-600">Average productivity rate</span>
					</div>
					<div class="chart-content">
						<div class="bar-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								{@const maxBPH = Math.max(...Object.values(regionalData).map(d => d.barrelsPerHour))}
								{@const percentage = (data.barrelsPerHour / maxBPH) * 100}
								<div class="chart-row">
									<div class="chart-label text-slate-700">{regionName}</div>
									<div class="chart-bar-container">
										<div 
											class="chart-bar chart-bar-with-value"
											style="width: {percentage}%; background: {getPerformanceBarColor(data.barrelsPerHour, 'bph')};"
										>
											<span class="chart-value-inside">{data.barrelsPerHour}</span>
											{#if needsAttention(data.barrelsPerHour, 'bph')}
												<span class="alert-icon">❗</span>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Yard Comparison Modal -->
	<RegionalYardComparison 
		visible={showYardComparison} 
		regionName={selectedRegion}
		regionData={[]}
		on:close={closeYardComparison}
	/>
</div>

<style>
	.regional-dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
		padding: 20px;
	}

	.dashboard-header {
		border-radius: 16px;
		padding: 24px 32px;
		margin-bottom: 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-text h1 {
		margin: 0 0 4px 0;
	}

	.header-text p {
		margin: 0;
	}

	.region-filters {
		display: flex;
		gap: 12px;
		margin-bottom: 32px;
	}

	.region-dropdown-container {
		position: relative;
	}

	.region-filter {
		background: white;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
		font-weight: 600;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		gap: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		position: relative;
		overflow: hidden;
	}

	.region-filter::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--region-color);
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	.region-filter:hover {
		border-color: #3b82f6;
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
	}

	.region-filter:hover::before {
		transform: scaleX(1);
	}

	.region-filter.active {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		color: white;
		border-color: #3b82f6;
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
	}

	.region-filter.active::before {
		transform: scaleX(1);
		background: rgba(255, 255, 255, 0.3);
	}

	.region-filter.active .filter-name {
		color: white;
	}

	.filter-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #64748b;
	}

	.filter-content {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.filter-name {
		font-size: 14px;
		font-weight: 600;
	}

	.dropdown-arrow {
		font-size: 12px;
		transition: transform 0.2s ease;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 10;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		margin-top: 4px;
	}

	.dropdown-item {
		width: 100%;
		padding: 12px 16px;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
		font-size: 14px;
	}

	.dropdown-item:hover {
		background-color: #f1f5f9;
	}

	.overview-metrics {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20px;
		margin-bottom: 32px;
	}

	.content-section {
		background: white;
		border-radius: 16px;
		padding: 32px;
		margin-bottom: 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.section-header {
		margin-bottom: 24px;
	}

	.section-header h2 {
		margin: 0 0 8px 0;
	}

	.section-header p {
		margin: 0;
	}

	.performance-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		margin-bottom: 32px;
	}

	.perf-card {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		text-align: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.perf-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	.perf-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
		border-color: #3b82f6;
	}

	.perf-card:hover::before {
		transform: scaleX(1);
	}

	.perf-card.clickable {
		cursor: pointer;
	}

	.perf-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-bottom: 20px;
	}

	.perf-status {
		padding: 4px 12px;
		border-radius: 20px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.5px;
		color: white;
	}

	.perf-card h3 {
		margin: 0 0 16px 0;
	}

	.perf-value {
		margin: 0 0 12px 0;
	}

	.click-hint {
		margin-top: 12px;
	}

	.regional-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 24px;
		padding: 20px;
		background: #f8fafc;
		border-radius: 12px;
		border: 1px solid #e2e8f0;
	}

	.stat-item {
		text-align: center;
	}

	.stat-label {
		display: block;
		font-size: 12px;
		font-weight: 500;
		margin-bottom: 8px;
	}

	.stat-value {
		display: block;
		font-size: 18px;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
	}

	.region-summary-card {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.region-summary-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--region-color);
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	.region-summary-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
		border-color: var(--region-color);
	}

	.region-summary-card:hover::before {
		transform: scaleX(1);
	}

	.region-summary-card.active {
		border-color: var(--region-color);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
	}

	.region-summary-card.active::before {
		transform: scaleX(1);
	}

	.region-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin-bottom: 20px;
	}

	.region-header h3 {
		margin: 0;
	}

	.region-status {
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.region-metrics {
		margin-bottom: 24px;
	}

	.metric-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
		padding: 8px 0;
		border-bottom: 1px solid #f1f5f9;
	}

	.metric-row:last-child {
		border-bottom: none;
	}

	.metric-row span:first-child {
		font-size: 14px;
		font-weight: 500;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
	}

	.chart-card {
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.chart-header {
		margin-bottom: 16px;
		border-bottom: 1px solid #f1f5f9;
		padding-bottom: 12px;
	}

	.chart-header h3 {
		margin: 0 0 4px 0;
	}

	.chart-subtitle {
		margin: 0;
	}

	.bar-chart {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.chart-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.chart-label {
		min-width: 80px;
		font-size: 12px;
		font-weight: 500;
	}

	.chart-bar-container {
		display: flex;
		align-items: center;
		flex: 1;
		gap: 8px;
	}

	.chart-bar {
		height: 20px;
		border-radius: 4px;
		min-width: 4px;
		transition: width 0.3s ease;
	}

	.chart-bar-with-value {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px;
		min-height: 24px;
	}

	.chart-value-inside {
		color: white;
		font-weight: 700;
		font-size: 11px;
		font-family: 'JetBrains Mono', monospace;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		white-space: nowrap;
	}

	.alert-icon {
		color: #fef3c7;
		font-size: 12px;
		font-weight: 700;
		margin-left: 4px;
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.chart-value {
		font-size: 12px;
		min-width: 40px;
		text-align: right;
	}

	.efficiency-chart {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.efficiency-item {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.efficiency-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.efficiency-label {
		font-size: 12px;
		font-weight: 500;
	}

	.efficiency-value {
		font-size: 14px;
	}

	.efficiency-bar-bg {
		height: 24px;
		background: #f1f5f9;
		border-radius: 8px;
		overflow: hidden;
	}

	.efficiency-bar {
		height: 100%;
		border-radius: 8px;
		transition: width 0.3s ease;
		min-width: 60px; /* Ensure enough space for percentage values */
	}

	.efficiency-status {
		font-size: 11px;
		text-align: center;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.overview-metrics,
		.performance-cards {
			grid-template-columns: 1fr;
		}
		
		.regional-stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.comparison-grid,
		.charts-grid {
			grid-template-columns: 1fr;
		}

		.region-filters {
			flex-direction: column;
		}
	}
</style> 