<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Award, Target, AlertTriangle } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let visible = false;
	export let regionName = '';
	export let regionData: any[] = [];

	// Time filter options
	let selectedTimeframe = 'Last 7 Days';
	const timeframeOptions = ['Last 7 Days', 'Last 30 Days', 'Custom'];

	// Sort state
	let sortColumn = 'yardName';
	let sortDirection: 'asc' | 'desc' = 'asc';

	// Mock yard comparison data - modular for different regions
	let yardComparison = [
		{
			yardName: 'North Texas Hub',
			location: 'Dallas, TX',
			fleetSize: 28,
			activeTrucks: 24,
			driversAssigned: 42,
			totalBPD: 2847,
			avgDriveTime: 3.2,
			barrelsPerHour: 185.3,
			utilizationRate: 85.7,
			efficiency: 94.2,
			rank: 1,
			trend: 'up',
			status: 'excellent',
			notes: 'Peak performer - model yard',
			sparklineData: [2650, 2720, 2780, 2810, 2847, 2890, 2920]
		},
		{
			yardName: 'Oklahoma Central',
			location: 'Oklahoma City, OK',
			fleetSize: 22,
			activeTrucks: 18,
			driversAssigned: 34,
			totalBPD: 2456,
			avgDriveTime: 3.8,
			barrelsPerHour: 165.2,
			utilizationRate: 81.8,
			efficiency: 91.8,
			rank: 3,
			trend: 'stable',
			status: 'good',
			notes: 'Consistent performance',
			sparklineData: [2320, 2380, 2420, 2440, 2456, 2470, 2480]
		},
		{
			yardName: 'Louisiana East',
			location: 'Baton Rouge, LA',
			fleetSize: 35,
			activeTrucks: 31,
			driversAssigned: 58,
			totalBPD: 3124,
			avgDriveTime: 2.9,
			barrelsPerHour: 198.7,
			utilizationRate: 88.6,
			efficiency: 96.1,
			rank: 1,
			trend: 'up',
			status: 'excellent',
			notes: 'Highest efficiency in region',
			sparklineData: [2950, 3020, 3080, 3100, 3124, 3150, 3180]
		},
		{
			yardName: 'Kansas West',
			location: 'Wichita, KS',
			fleetSize: 19,
			activeTrucks: 15,
			driversAssigned: 28,
			totalBPD: 1987,
			avgDriveTime: 4.2,
			barrelsPerHour: 142.8,
			utilizationRate: 78.9,
			efficiency: 87.3,
			rank: 4,
			trend: 'down',
			status: 'attention',
			notes: 'Needs operational review',
			sparklineData: [2150, 2100, 2050, 2020, 1987, 1960, 1940]
		}
	];

	// Sorting function
	function sortData(column: keyof typeof yardComparison[0]) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'desc';
		}

		yardComparison = yardComparison.sort((a, b) => {
			let aVal = a[column];
			let bVal = b[column];

			if (typeof aVal === 'string' && typeof bVal === 'string') {
				aVal = aVal.toLowerCase();
				bVal = bVal.toLowerCase();
			}

			if (sortDirection === 'asc') {
				return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			} else {
				return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
			}
		});
	}

	// Get status color and icon
	function getStatusInfo(status: string) {
		switch (status) {
			case 'excellent':
				return { color: 'text-emerald-600', icon: Award, bgColor: 'bg-emerald-50' };
			case 'good':
				return { color: 'text-blue-600', icon: Target, bgColor: 'bg-blue-50' };
			case 'attention':
				return { color: 'text-orange-600', icon: AlertTriangle, bgColor: 'bg-orange-50' };
			default:
				return { color: 'text-gray-600', icon: Target, bgColor: 'bg-gray-50' };
		}
	}

	// Get trend icon
	function getTrendIcon(trend: string) {
		switch (trend) {
			case 'up': return TrendingUp;
			case 'down': return TrendingDown;
			default: return null;
		}
	}

	// Get trend color
	function getTrendColor(trend: string) {
		switch (trend) {
			case 'up': return 'text-emerald-600';
			case 'down': return 'text-red-600';
			default: return 'text-gray-600';
		}
	}

	// Performance color coding
	function getPerformanceColor(value: number, metric: string) {
		switch (metric) {
			case 'efficiency':
				return value >= 95 ? 'text-emerald-600' : value >= 90 ? 'text-blue-600' : value >= 85 ? 'text-yellow-600' : 'text-red-600';
			case 'utilization':
				return value >= 85 ? 'text-emerald-600' : value >= 80 ? 'text-blue-600' : value >= 75 ? 'text-yellow-600' : 'text-red-600';
			case 'bpd':
				return value >= 2800 ? 'text-emerald-600' : value >= 2400 ? 'text-blue-600' : value >= 2000 ? 'text-yellow-600' : 'text-red-600';
			case 'bph':
				return value >= 180 ? 'text-emerald-600' : value >= 160 ? 'text-blue-600' : value >= 140 ? 'text-yellow-600' : 'text-red-600';
			default:
				return 'text-gray-900';
		}
	}

	// Get rank badge color
	function getRankColor(rank: number) {
		switch (rank) {
			case 1: return 'bg-yellow-500 text-white';
			case 2: return 'bg-gray-400 text-white';
			case 3: return 'bg-amber-600 text-white';
			default: return 'bg-gray-300 text-gray-700';
		}
	}

	// Simple sparkline component
	function generateSparklineSVG(data: number[]) {
		const width = 80;
		const height = 24;
		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min || 1;
		
		const points = data.map((value, index) => {
			const x = (index / (data.length - 1)) * width;
			const y = height - ((value - min) / range) * height;
			return `${x},${y}`;
		}).join(' ');

		return `<svg width="${width}" height="${height}" class="sparkline">
			<polyline fill="none" stroke="currentColor" stroke-width="1.5" points="${points}"/>
		</svg>`;
	}

	// Calculate regional averages
	$: regionalAverage = {
		totalBPD: Math.round(yardComparison.reduce((sum, yard) => sum + yard.totalBPD, 0) / yardComparison.length),
		efficiency: Math.round((yardComparison.reduce((sum, yard) => sum + yard.efficiency, 0) / yardComparison.length) * 10) / 10,
		utilization: Math.round((yardComparison.reduce((sum, yard) => sum + yard.utilizationRate, 0) / yardComparison.length) * 10) / 10,
		avgDriveTime: Math.round((yardComparison.reduce((sum, yard) => sum + yard.avgDriveTime, 0) / yardComparison.length) * 10) / 10
	};

	// Close comparison table
	function closeComparison() {
		visible = false;
		dispatch('close');
	}
</script>

{#if visible}
	<div class="comparison-overlay" on:click={closeComparison}>
		<div class="comparison-container" on:click|stopPropagation>
			<!-- Header -->
			<div class="comparison-header">
				<div class="header-content">
					<h2>{regionName} Region - Yard Performance Comparison</h2>
					<p>Compare operational KPIs across all yards in your region</p>
				</div>
				<div class="header-controls">
					<select bind:value={selectedTimeframe} class="timeframe-select">
						{#each timeframeOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
					<button on:click={closeComparison} class="close-btn">✕</button>
				</div>
			</div>

			<!-- Regional Summary -->
			<div class="regional-summary">
				<div class="summary-card">
					<h4>Regional Performance</h4>
					<div class="summary-stats">
						<div class="stat">
							<span class="stat-label">Avg BPD</span>
							<span class="stat-value">{regionalAverage.totalBPD.toLocaleString()}</span>
						</div>
						<div class="stat">
							<span class="stat-label">Avg Efficiency</span>
							<span class="stat-value">{regionalAverage.efficiency}%</span>
						</div>
						<div class="stat">
							<span class="stat-label">Avg Utilization</span>
							<span class="stat-value">{regionalAverage.utilization}%</span>
						</div>
						<div class="stat">
							<span class="stat-label">Avg Drive Time</span>
							<span class="stat-value">{regionalAverage.avgDriveTime}h</span>
						</div>
					</div>
				</div>
				<div class="summary-card">
					<h4>Key Insights</h4>
					<p><strong>Louisiana East</strong> leads in efficiency (96.1%) and BPD output. <strong>Kansas West</strong> needs operational review to improve below-average metrics.</p>
				</div>
			</div>

			<!-- Comparison Table -->
			<div class="table-container">
				<table class="comparison-table">
					<thead>
						<tr>
							<th>Rank</th>
							<th>
								<button on:click={() => sortData('yardName')} class="sort-button">
									Yard Name
									{#if sortColumn === 'yardName'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('fleetSize')} class="sort-button">
									Fleet Size
									{#if sortColumn === 'fleetSize'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('activeTrucks')} class="sort-button">
									Active Trucks
									{#if sortColumn === 'activeTrucks'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('driversAssigned')} class="sort-button">
									Drivers Assigned
									{#if sortColumn === 'driversAssigned'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('totalBPD')} class="sort-button">
									Total BPD
									{#if sortColumn === 'totalBPD'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('avgDriveTime')} class="sort-button">
									Avg Drive Time
									{#if sortColumn === 'avgDriveTime'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('barrelsPerHour')} class="sort-button">
									Barrels per Hour
									{#if sortColumn === 'barrelsPerHour'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>Status</th>
							<th>Trend</th>
							<th>Notes</th>
						</tr>
					</thead>
					<tbody>
						{#each yardComparison as yard}
							<tr class="yard-row">
								<td class="rank-cell">
									<div class="rank-badge {getRankColor(yard.rank)}">
										{yard.rank}
									</div>
								</td>
								<td class="yard-cell">
									<div class="yard-info">
										<div class="yard-name">{yard.yardName}</div>
										<div class="yard-location">{yard.location}</div>
									</div>
								</td>
								<td class="metric-cell">{yard.fleetSize}</td>
								<td class="metric-cell {getPerformanceColor(yard.utilizationRate, 'utilization')}">
									{yard.activeTrucks}
								</td>
								<td class="metric-cell">{yard.driversAssigned}</td>
								<td class="metric-cell {getPerformanceColor(yard.totalBPD, 'bpd')}">
									{yard.totalBPD.toLocaleString()}
								</td>
								<td class="metric-cell">
									{yard.avgDriveTime}h
								</td>
								<td class="metric-cell {getPerformanceColor(yard.barrelsPerHour, 'bph')}">
									{yard.barrelsPerHour}
								</td>
								<td class="status-cell">
									<div class="status-container {getStatusInfo(yard.status).bgColor}">
										<svelte:component this={getStatusInfo(yard.status).icon} size={16} class={getStatusInfo(yard.status).color} />
										<span class="{getStatusInfo(yard.status).color} font-medium">{yard.status.toUpperCase()}</span>
									</div>
								</td>
								<td class="trend-cell">
									<div class="trend-container {getTrendColor(yard.trend)}">
										{#if getTrendIcon(yard.trend)}
											<svelte:component this={getTrendIcon(yard.trend)} size={16} />
										{/if}
										<div class="sparkline-container">
											{@html generateSparklineSVG(yard.sparklineData)}
										</div>
									</div>
								</td>
								<td class="notes-cell">{yard.notes}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Footer Actions -->
			<div class="footer-actions">
				<div class="action-stat">
					<strong>Best Performer:</strong> Louisiana East (96.1% efficiency, 3,124 BPD)
				</div>
				<div class="action-stat">
					<strong>Improvement Opportunity:</strong> Kansas West could increase BPD by 15% with operational optimization
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.comparison-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.comparison-container {
		background: white;
		border-radius: 20px;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
		max-width: 95vw;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.comparison-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32px;
		border-bottom: 1px solid #e2e8f0;
		background: linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%);
		color: white;
	}

	.header-content h2 {
		font-size: 28px;
		font-weight: 700;
		margin: 0 0 8px 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.header-content p {
		font-size: 16px;
		margin: 0;
		opacity: 0.9;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.timeframe-select {
		padding: 8px 16px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 14px;
		cursor: pointer;
	}

	.timeframe-select option {
		background: #1e293b;
		color: white;
	}

	.close-btn {
		width: 40px;
		height: 40px;
		border: none;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		cursor: pointer;
		font-size: 18px;
		color: white;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.regional-summary {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		padding: 24px 32px;
		background: #fefefe;
	}

	.summary-card {
		background: linear-gradient(135deg, #475569 0%, #334155 100%);
		color: white;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(71, 85, 105, 0.2);
	}

	.summary-card h4 {
		font-size: 16px;
		font-weight: 700;
		margin: 0 0 16px 0;
	}

	.summary-stats {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.stat {
		text-align: center;
	}

	.stat-label {
		display: block;
		font-size: 12px;
		opacity: 0.8;
		margin-bottom: 4px;
	}

	.stat-value {
		display: block;
		font-size: 18px;
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
	}

	.summary-card p {
		font-size: 14px;
		margin: 0;
		line-height: 1.5;
	}

	.table-container {
		flex: 1;
		overflow: auto;
		padding: 0 32px;
	}

	.comparison-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.comparison-table th {
		background: #f8fafc;
		padding: 16px 12px;
		text-align: left;
		font-weight: 600;
		color: #374151;
		border-bottom: 2px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.sort-button {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		font-weight: 600;
		color: #374151;
		font-size: 14px;
	}

	.sort-button:hover {
		color: #475569;
	}

	.comparison-table td {
		padding: 16px 12px;
		border-bottom: 1px solid #f1f5f9;
	}

	.yard-row:hover {
		background: #fafbfc;
	}

	.rank-cell {
		text-align: center;
	}

	.rank-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		font-weight: 700;
		font-size: 14px;
	}

	.yard-cell {
		min-width: 200px;
	}

	.yard-info {
		display: flex;
		flex-direction: column;
	}

	.yard-name {
		font-weight: 600;
		color: #374151;
		margin-bottom: 2px;
	}

	.yard-location {
		font-size: 12px;
		color: #64748b;
	}

	.metric-cell {
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
	}

	.status-cell {
		min-width: 120px;
	}

	.status-container {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border-radius: 8px;
		font-size: 12px;
	}

	.trend-cell {
		min-width: 100px;
	}

	.trend-container {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.sparkline-container {
		opacity: 0.7;
	}

	.notes-cell {
		font-style: italic;
		color: #6b7280;
		min-width: 180px;
	}

	.footer-actions {
		padding: 24px 32px;
		background: #f8fafc;
		border-top: 1px solid #e2e8f0;
	}

	.action-stat {
		margin-bottom: 8px;
		font-size: 14px;
		color: #374151;
	}

	.action-stat:last-child {
		margin-bottom: 0;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.comparison-container {
			max-width: 100vw;
			max-height: 100vh;
			border-radius: 0;
		}

		.comparison-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
			padding: 20px;
		}

		.header-controls {
			width: 100%;
			justify-content: space-between;
		}

		.regional-summary {
			grid-template-columns: 1fr;
			padding: 20px;
		}

		.summary-stats {
			grid-template-columns: repeat(2, 1fr);
		}

		.table-container {
			padding: 0 20px;
		}

		.comparison-table {
			font-size: 12px;
		}

		.comparison-table th,
		.comparison-table td {
			padding: 12px 8px;
		}

		.footer-actions {
			padding: 20px;
		}
	}
</style> 