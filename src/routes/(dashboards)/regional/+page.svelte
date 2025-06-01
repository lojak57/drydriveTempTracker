<script lang="ts">
	import MetricCard from '$lib/components/ui/MetricCard.svelte';
	import RegionalYardComparison from '$lib/components/regional/RegionalYardComparison.svelte';
	import { MapPin, Truck, BarChart3, Shield, TrendingUp, Users, Clock, Target } from 'lucide-svelte';

	// Regional comparison state
	let showYardComparison = false;
	let selectedRegion = '';

	// Active region filter
	let activeRegion = 'Gulf Coast';
	
	// Regional data structure - modular and scalable with industrial colors
	const regions = [
		{
			id: 'gulf-coast',
			name: 'Gulf Coast',
			color: '#475569', // Steel gray
			states: ['TX', 'LA', 'MS', 'AL', 'FL']
		},
		{
			id: 'southwest',
			name: 'Southwest (TX)',
			color: '#B45309', // Industrial orange
			states: ['TX']
		},
		{
			id: 'rockies',
			name: 'Rockies',
			color: '#374151', // Dark charcoal
			states: ['CO', 'WY', 'MT', 'ND']
		},
		{
			id: 'midcon',
			name: 'Midcon (OK, OH, VA, PA)',
			color: '#7C2D12', // Deep rust red
			states: ['OK', 'OH', 'VA', 'PA']
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
		'Southwest (TX)': {
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
		'Midcon (OK, OH, VA, PA)': {
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

	// Status color mapping - industrial palette
	function getStatusColor(status: string) {
		switch (status) {
			case 'excellent': return 'bg-slate-700'; // Dark steel for excellent
			case 'good': return 'bg-orange-600'; // Industrial orange for good
			case 'attention': return 'bg-red-700'; // Deep red for attention
			default: return 'bg-gray-500';
		}
	}

	// Trend color mapping - industrial palette
	function getTrendColor(trend: string) {
		switch (trend) {
			case 'up': return 'text-slate-700'; // Dark steel for positive
			case 'down': return 'text-red-700'; // Deep red for negative
			default: return 'text-gray-600';
		}
	}

	// Get region color
	function getRegionColor(regionName: string) {
		const region = regions.find(r => r.name === regionName);
		return region ? region.color : '#6B7280';
	}
</script>

<svelte:head>
	<title>Regional Manager Dashboard - Oil Field Temp Tracker</title>
</svelte:head>

<div class="regional-dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<div class="header-icon">
				<MapPin size={32} />
			</div>
			<div class="header-text">
				<h1 class="header-title">Regional Manager Dashboard</h1>
				<p class="header-subtitle">Multi-region oversight and performance comparison</p>
			</div>
		</div>
	</div>

	<!-- Region Filters -->
	<div class="region-filters">
		{#each regions as region}
			<button 
				class="region-filter"
				class:active={activeRegion === region.name}
				style="--region-color: {region.color}"
				on:click={() => selectRegion(region.name)}
			>
				<div class="filter-indicator" style="background-color: {region.color}"></div>
				<div class="filter-content">
					<span class="filter-name">{region.name}</span>
					<span class="filter-states">{region.states.join(', ')}</span>
				</div>
			</button>
		{/each}
	</div>

	<!-- Regional Overview Cards -->
	<div class="overview-metrics">
		<MetricCard 
			title="Regional Fleet" 
			value={currentRegionData.fleetSize.toString()} 
			unit="trucks" 
			icon={Truck}
			status="normal"
			trend={currentRegionData.trend}
			trendValue={currentRegionData.trend === 'up' ? '+8' : currentRegionData.trend === 'down' ? '-3' : '0'}
			color="blue"
		/>
		<MetricCard 
			title="Active Trucks" 
			value={currentRegionData.activeTrucks.toString()} 
			unit="operating" 
			icon={Truck}
			status="normal"
			trend={currentRegionData.trend}
			trendValue={`${Math.round(currentRegionData.utilization)}% util`}
			color="emerald"
		/>
		<MetricCard 
			title="Drivers Assigned" 
			value={currentRegionData.driversAssigned.toString()} 
			unit="certified" 
			icon={Users}
			status="normal"
			trend="stable"
			trendValue="full staffed"
			color="purple"
		/>
		<MetricCard 
			title="Regional Efficiency" 
			value={currentRegionData.efficiency.toString()} 
			unit="%" 
			icon={BarChart3}
			status="normal"
			trend={currentRegionData.trend}
			trendValue={currentRegionData.trend === 'up' ? '+2.1%' : currentRegionData.trend === 'down' ? '-1.5%' : '0%'}
			color="orange"
		/>
	</div>

	<!-- Main Content -->
	<div class="main-content">
		<!-- Enhanced Regional Performance Section -->
		<div class="content-section regional-performance-section">
			<div class="section-header">
				<h2>{activeRegion} Performance Overview</h2>
				<p>Detailed operational metrics for regional comparison</p>
			</div>
			
			<!-- Performance Cards -->
			<div class="performance-cards">
				<div class="perf-card clickable" on:click={() => openYardComparison(activeRegion)}>
					<div class="perf-header">
						<div class="perf-icon">
							<BarChart3 size={24} />
						</div>
						<div class="perf-status {getStatusColor(currentRegionData.status)}">
							{currentRegionData.status.toUpperCase()}
						</div>
					</div>
					<h3>Total BPD</h3>
					<div class="perf-value">{currentRegionData.totalBPD.toLocaleString()}</div>
					<p class="{getTrendColor(currentRegionData.trend)}">
						Regional daily output
					</p>
					<div class="click-hint">Click to compare yards</div>
				</div>

				<div class="perf-card clickable" on:click={() => openYardComparison(activeRegion)}>
					<div class="perf-header">
						<div class="perf-icon">
							<Clock size={24} />
						</div>
						<div class="perf-status bg-blue-500">OPTIMIZED</div>
					</div>
					<h3>Avg Drive Time</h3>
					<div class="perf-value">{currentRegionData.avgDriveTime}h</div>
					<p class="text-blue-600">
						Per haul efficiency
					</p>
					<div class="click-hint">View yard breakdown</div>
				</div>

				<div class="perf-card clickable" on:click={() => openYardComparison(activeRegion)}>
					<div class="perf-header">
						<div class="perf-icon">
							<Target size={24} />
						</div>
						<div class="perf-status bg-emerald-500">TARGET</div>
					</div>
					<h3>Barrels per Hour</h3>
					<div class="perf-value">{currentRegionData.barrelsPerHour}</div>
					<p class="text-emerald-600">
						Operational efficiency
					</p>
					<div class="click-hint">Analyze performance</div>
				</div>
			</div>

			<!-- Quick Regional Stats -->
			<div class="regional-stats">
				<div class="stat-item">
					<span class="stat-label">Fleet Utilization</span>
					<span class="stat-value">{currentRegionData.utilization}%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Regional Efficiency</span>
					<span class="stat-value">{currentRegionData.efficiency}%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Active/Total Ratio</span>
					<span class="stat-value">{Math.round((currentRegionData.activeTrucks / currentRegionData.fleetSize) * 100)}%</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Driver Coverage</span>
					<span class="stat-value">{Math.round((currentRegionData.driversAssigned / currentRegionData.fleetSize) * 100)}%</span>
				</div>
			</div>
		</div>

		<!-- Regional Comparison Summary -->
		<div class="content-section">
			<h2>Cross-Regional Performance</h2>
			<div class="comparison-grid">
				{#each Object.entries(regionalData) as [regionName, data]}
					<div class="region-summary-card" class:active={regionName === activeRegion} style="--region-color: {getRegionColor(regionName)}">
						<div class="region-header">
							<h3>{regionName}</h3>
							<div class="region-status {getStatusColor(data.status)}"></div>
						</div>
						<div class="region-metrics">
							<div class="metric-row">
								<span>Fleet Size:</span>
								<span class="metric-value">{data.fleetSize}</span>
							</div>
							<div class="metric-row">
								<span>Total BPD:</span>
								<span class="metric-value">{data.totalBPD.toLocaleString()}</span>
							</div>
							<div class="metric-row">
								<span>Efficiency:</span>
								<span class="metric-value">{data.efficiency}%</span>
							</div>
						</div>
						<button 
							class="compare-btn"
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
				<h2>Regional Performance Comparison Charts</h2>
				<p>Visual analysis of key operational metrics across all regions</p>
			</div>
			
			<div class="charts-grid">
				<!-- Fleet Size Comparison -->
				<div class="chart-card">
					<div class="chart-header">
						<h3>Fleet Size Distribution</h3>
						<span class="chart-subtitle">Total trucks by region</span>
					</div>
					<div class="chart-content">
						<div class="bar-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								{@const maxFleet = Math.max(...Object.values(regionalData).map(d => d.fleetSize))}
								{@const percentage = (data.fleetSize / maxFleet) * 100}
								<div class="chart-row">
									<div class="chart-label">{regionName.replace(' (TX)', '').replace(' (OK, OH, VA, PA)', '')}</div>
									<div class="chart-bar-container">
										<div 
											class="chart-bar"
											style="width: {percentage}%; background: linear-gradient(90deg, {getRegionColor(regionName)}, {getRegionColor(regionName)}aa);"
										></div>
										<span class="chart-value">{data.fleetSize}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- BPD Production Comparison -->
				<div class="chart-card">
					<div class="chart-header">
						<h3>Total BPD Production</h3>
						<span class="chart-subtitle">Daily barrels produced</span>
					</div>
					<div class="chart-content">
						<div class="bar-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								{@const maxBPD = Math.max(...Object.values(regionalData).map(d => d.totalBPD))}
								{@const percentage = (data.totalBPD / maxBPD) * 100}
								<div class="chart-row">
									<div class="chart-label">{regionName.replace(' (TX)', '').replace(' (OK, OH, VA, PA)', '')}</div>
									<div class="chart-bar-container">
										<div 
											class="chart-bar"
											style="width: {percentage}%; background: linear-gradient(90deg, {getRegionColor(regionName)}, {getRegionColor(regionName)}aa);"
										></div>
										<span class="chart-value">{data.totalBPD.toLocaleString()}</span>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Efficiency Comparison -->
				<div class="chart-card">
					<div class="chart-header">
						<h3>Regional Efficiency</h3>
						<span class="chart-subtitle">Operational efficiency percentage</span>
					</div>
					<div class="chart-content">
						<div class="efficiency-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								<div class="efficiency-item">
									<div class="efficiency-header">
										<span class="efficiency-label">{regionName.replace(' (TX)', '').replace(' (OK, OH, VA, PA)', '')}</span>
										<span class="efficiency-value" style="color: {getRegionColor(regionName)}">{data.efficiency}%</span>
									</div>
									<div class="efficiency-bar-bg">
										<div 
											class="efficiency-bar"
											style="width: {data.efficiency}%; background: linear-gradient(90deg, {getRegionColor(regionName)}, {getRegionColor(regionName)}aa);"
										></div>
									</div>
									<div class="efficiency-status">
										{#if data.efficiency >= 93}
											<span class="status-excellent">Excellent</span>
										{:else if data.efficiency >= 90}
											<span class="status-good">Good</span>
										{:else}
											<span class="status-attention">Needs Attention</span>
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
						<h3>Barrels per Hour</h3>
						<span class="chart-subtitle">Average productivity rate</span>
					</div>
					<div class="chart-content">
						<div class="bar-chart">
							{#each Object.entries(regionalData) as [regionName, data]}
								{@const maxBPH = Math.max(...Object.values(regionalData).map(d => d.barrelsPerHour))}
								{@const percentage = (data.barrelsPerHour / maxBPH) * 100}
								<div class="chart-row">
									<div class="chart-label">{regionName.replace(' (TX)', '').replace(' (OK, OH, VA, PA)', '')}</div>
									<div class="chart-bar-container">
										<div 
											class="chart-bar"
											style="width: {percentage}%; background: linear-gradient(90deg, {getRegionColor(regionName)}, {getRegionColor(regionName)}aa);"
										></div>
										<span class="chart-value">{data.barrelsPerHour}</span>
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
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.dashboard-header {
		background: white;
		border-radius: 16px;
		padding: 32px;
		margin-bottom: 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-icon {
		width: 60px;
		height: 60px;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		margin-right: 20px;
	}

	.header-text h1 {
		font-size: 28px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 4px 0;
	}

	.header-text p {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.region-filters {
		display: flex;
		gap: 12px;
		margin-bottom: 32px;
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

	.filter-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #64748b;
	}

	.filter-content {
		display: flex;
		flex-direction: column;
	}

	.filter-name {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 2px;
	}

	.filter-states {
		font-size: 12px;
		opacity: 0.7;
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

	.content-section h2 {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
	}

	.content-section p {
		font-size: 16px;
		color: #64748b;
		margin: 0 0 24px 0;
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

	.perf-icon {
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #475569;
	}

	.perf-status {
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		color: white;
	}

	.perf-card h3 {
		font-size: 16px;
		font-weight: 600;
		color: #475569;
		margin: 0 0 12px 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.perf-value {
		font-size: 36px;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		color: #1e293b;
		margin-bottom: 8px;
	}

	.perf-card p {
		margin: 0 0 16px 0;
		font-weight: 500;
	}

	.click-hint {
		font-size: 12px;
		color: #64748b;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.perf-card:hover .click-hint {
		opacity: 1;
	}

	.regional-stats {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 24px;
		margin-bottom: 32px;
	}

	.stat-item {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 20px;
		text-align: center;
		transition: all 0.3s ease;
	}

	.stat-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
		border-color: #3b82f6;
	}

	.stat-label {
		font-size: 12px;
		color: #64748b;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
		color: #1e293b;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
	}

	.region-summary-card {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 2px solid #e2e8f0;
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
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
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
		color: #64748b;
		font-weight: 500;
	}

	.metric-value {
		font-weight: 700;
		color: #1e293b;
		font-family: 'SF Mono', Monaco, monospace;
	}

	.compare-btn {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
		border: none;
		border-radius: 8px;
		padding: 12px 20px;
		font-size: 14px;
		color: white;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s ease;
		width: 100%;
	}

	.compare-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
	}

	.charts-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
	}

	.chart-card {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid #e2e8f0;
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
	}

	.chart-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
		border-color: #3b82f6;
	}

	.chart-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 2px solid #f1f5f9;
	}

	.chart-header h3 {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
		margin: 0;
	}

	.chart-subtitle {
		font-size: 12px;
		color: #64748b;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.chart-content {
		min-height: 200px;
	}

	.bar-chart {
		display: flex;
		flex-direction: column;
		gap: 16px;
		height: 100%;
	}

	.chart-row {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.chart-label {
		font-size: 14px;
		color: #64748b;
		font-weight: 600;
		min-width: 100px;
		text-align: right;
	}

	.chart-bar-container {
		flex: 1;
		height: 32px;
		background: #f1f5f9;
		border-radius: 6px;
		position: relative;
		overflow: hidden;
	}

	.chart-bar {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		border-radius: 6px;
		transition: all 0.6s ease;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.chart-value {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 12px;
		font-weight: 700;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		font-family: 'SF Mono', Monaco, monospace;
	}

	.efficiency-chart {
		display: flex;
		flex-direction: column;
		gap: 20px;
		height: 100%;
	}

	.efficiency-item {
		margin-bottom: 16px;
	}

	.efficiency-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.efficiency-label {
		font-size: 14px;
		color: #64748b;
		font-weight: 600;
	}

	.efficiency-value {
		font-size: 14px;
		font-weight: 700;
		font-family: 'SF Mono', Monaco, monospace;
	}

	.efficiency-bar-bg {
		height: 20px;
		border-radius: 10px;
		background: #f1f5f9;
		margin-bottom: 8px;
		overflow: hidden;
	}

	.efficiency-bar {
		height: 100%;
		border-radius: 10px;
		transition: all 0.6s ease;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.efficiency-status {
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-excellent {
		color: #059669;
	}

	.status-good {
		color: #d97706;
	}

	.status-attention {
		color: #dc2626;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.region-filters {
			flex-wrap: wrap;
		}

		.region-filter {
			flex: 1 1 calc(50% - 6px);
		}

		.overview-metrics {
			grid-template-columns: repeat(2, 1fr);
		}

		.performance-cards {
			grid-template-columns: 1fr;
		}

		.regional-stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.comparison-grid {
			grid-template-columns: 1fr;
		}

		.charts-grid {
			grid-template-columns: 1fr;
		}
	}
</style> 