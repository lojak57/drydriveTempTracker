<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Props
	export let visible = false;

	// Time filter options
	let selectedTimeframe = 'Last 7 Days';
	const timeframeOptions = ['Last 7 Days', 'Last 30 Days', 'Custom'];

	// Sort state
	let sortColumn = 'date';
	let sortDirection: 'asc' | 'desc' = 'desc';

	// Mock analytics data that tells the "ops story"
	let yardAnalytics = [
		{
			date: '2024-01-15',
			dailyThroughput: 2847,
			barrelsPerDriveHour: 185.3,
			activeTrucksPercent: 75.3,
			driversEnRoutePercent: 68.2,
			loadEfficiencyIndex: 4.2,
			notes: 'Peak day - all systems optimal',
			trend: 'up',
			sparklineData: [2650, 2720, 2780, 2810, 2847, 2890, 2920]
		},
		{
			date: '2024-01-14',
			dailyThroughput: 2720,
			barrelsPerDriveHour: 178.9,
			activeTrucksPercent: 71.8,
			driversEnRoutePercent: 65.4,
			loadEfficiencyIndex: 3.9,
			notes: 'Slight weather delays morning',
			trend: 'up',
			sparklineData: [2580, 2620, 2670, 2690, 2720, 2750, 2780]
		},
		{
			date: '2024-01-13',
			dailyThroughput: 2535,
			barrelsPerDriveHour: 165.2,
			activeTrucksPercent: 67.4,
			driversEnRoutePercent: 62.1,
			loadEfficiencyIndex: 3.6,
			notes: 'Equipment maintenance - 3 trucks down',
			trend: 'down',
			sparklineData: [2620, 2590, 2570, 2550, 2535, 2520, 2510]
		},
		{
			date: '2024-01-12',
			dailyThroughput: 2892,
			barrelsPerDriveHour: 192.7,
			activeTrucksPercent: 82.1,
			driversEnRoutePercent: 74.5,
			loadEfficiencyIndex: 4.8,
			notes: 'High demand day - extra shifts',
			trend: 'up',
			sparklineData: [2750, 2800, 2830, 2860, 2892, 2910, 2920]
		},
		{
			date: '2024-01-11',
			dailyThroughput: 2674,
			barrelsPerDriveHour: 174.8,
			activeTrucksPercent: 73.6,
			driversEnRoutePercent: 67.8,
			loadEfficiencyIndex: 4.1,
			notes: 'Normal operations',
			trend: 'stable',
			sparklineData: [2650, 2660, 2670, 2674, 2680, 2675, 2670]
		},
		{
			date: '2024-01-10',
			dailyThroughput: 2456,
			barrelsPerDriveHour: 158.9,
			activeTrucksPercent: 65.2,
			driversEnRoutePercent: 58.7,
			loadEfficiencyIndex: 3.4,
			notes: 'Customer pipeline maintenance',
			trend: 'down',
			sparklineData: [2580, 2550, 2520, 2490, 2456, 2440, 2430]
		},
		{
			date: '2024-01-09',
			dailyThroughput: 2789,
			barrelsPerDriveHour: 183.4,
			activeTrucksPercent: 76.8,
			driversEnRoutePercent: 71.2,
			loadEfficiencyIndex: 4.4,
			notes: 'Strong performance - no issues',
			trend: 'up',
			sparklineData: [2700, 2730, 2760, 2780, 2789, 2800, 2810]
		}
	];

	// Sorting function
	function sortData(column: keyof typeof yardAnalytics[0]) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'desc';
		}

		yardAnalytics = yardAnalytics.sort((a, b) => {
			let aVal = a[column];
			let bVal = b[column];

			// Handle date sorting
			if (column === 'date') {
				aVal = new Date(aVal as string).getTime();
				bVal = new Date(bVal as string).getTime();
			}

			if (sortDirection === 'asc') {
				return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			} else {
				return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
			}
		});
	}

	// Format date for display
	function formatDate(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			weekday: 'short', 
			month: 'short', 
			day: 'numeric' 
		});
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
			case 'throughput':
				return value >= 2800 ? 'text-emerald-600' : value >= 2600 ? 'text-yellow-600' : 'text-red-600';
			case 'barrelsPerHour':
				return value >= 180 ? 'text-emerald-600' : value >= 160 ? 'text-yellow-600' : 'text-red-600';
			case 'activeTrucks':
				return value >= 75 ? 'text-emerald-600' : value >= 65 ? 'text-yellow-600' : 'text-red-600';
			case 'driversEnRoute':
				return value >= 70 ? 'text-emerald-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';
			case 'loadEfficiency':
				return value >= 4.0 ? 'text-emerald-600' : value >= 3.5 ? 'text-yellow-600' : 'text-red-600';
			default:
				return 'text-gray-900';
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

	// Close analytics table
	function closeAnalytics() {
		visible = false;
		dispatch('close');
	}
</script>

{#if visible}
	<div class="analytics-overlay" on:click={closeAnalytics}>
		<div class="analytics-container" on:click|stopPropagation>
			<!-- Header -->
			<div class="analytics-header">
				<div class="header-content">
					<h2>Yard Performance Analytics</h2>
					<p>Defend your numbers with complete operational context</p>
				</div>
				<div class="header-controls">
					<select bind:value={selectedTimeframe} class="timeframe-select">
						{#each timeframeOptions as option}
							<option value={option}>{option}</option>
						{/each}
					</select>
					<button on:click={closeAnalytics} class="close-btn">✕</button>
				</div>
			</div>

			<!-- Key Insights -->
			<div class="key-insights">
				<div class="insight-card">
					<h4>Performance Summary</h4>
					<p>Averaged <strong>2,701 BBL/day</strong> with <strong>92.3% operational efficiency</strong> despite planned maintenance affecting 3 trucks on Jan 13</p>
				</div>
				<div class="insight-card">
					<h4>Context Matters</h4>
					<p>Jan 10 low numbers due to <strong>customer pipeline maintenance</strong> - outside yard control. Peak performance Jan 12 shows true capability.</p>
				</div>
			</div>

			<!-- Analytics Table -->
			<div class="table-container">
				<table class="analytics-table">
					<thead>
						<tr>
							<th>
								<button on:click={() => sortData('date')} class="sort-button">
									Date
									{#if sortColumn === 'date'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('dailyThroughput')} class="sort-button">
									Daily Throughput (BBL)
									{#if sortColumn === 'dailyThroughput'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('barrelsPerDriveHour')} class="sort-button">
									BBL/Drive Hour
									{#if sortColumn === 'barrelsPerDriveHour'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('activeTrucksPercent')} class="sort-button">
									% Active Trucks
									{#if sortColumn === 'activeTrucksPercent'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('driversEnRoutePercent')} class="sort-button">
									% Drivers En Route
									{#if sortColumn === 'driversEnRoutePercent'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>
								<button on:click={() => sortData('loadEfficiencyIndex')} class="sort-button">
									Load Efficiency Index
									{#if sortColumn === 'loadEfficiencyIndex'}
										{#if sortDirection === 'asc'}<ChevronUp size={16} />{:else}<ChevronDown size={16} />{/if}
									{/if}
								</button>
							</th>
							<th>Trend</th>
							<th>Operational Notes</th>
						</tr>
					</thead>
					<tbody>
						{#each yardAnalytics as row}
							<tr>
								<td class="date-cell">{formatDate(row.date)}</td>
								<td class="metric-cell {getPerformanceColor(row.dailyThroughput, 'throughput')}">
									{row.dailyThroughput.toLocaleString()}
								</td>
								<td class="metric-cell {getPerformanceColor(row.barrelsPerDriveHour, 'barrelsPerHour')}">
									{row.barrelsPerDriveHour}
								</td>
								<td class="metric-cell {getPerformanceColor(row.activeTrucksPercent, 'activeTrucks')}">
									{row.activeTrucksPercent}%
								</td>
								<td class="metric-cell {getPerformanceColor(row.driversEnRoutePercent, 'driversEnRoute')}">
									{row.driversEnRoutePercent}%
								</td>
								<td class="metric-cell {getPerformanceColor(row.loadEfficiencyIndex, 'loadEfficiency')}">
									{row.loadEfficiencyIndex}
								</td>
								<td class="trend-cell">
									<div class="trend-container {getTrendColor(row.trend)}">
										{#if getTrendIcon(row.trend)}
											<svelte:component this={getTrendIcon(row.trend)} size={16} />
										{/if}
										<div class="sparkline-container">
											{@html generateSparklineSVG(row.sparklineData)}
										</div>
									</div>
								</td>
								<td class="notes-cell">{row.notes}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Footer Insights -->
			<div class="footer-insights">
				<div class="insight-stat">
					<strong>Average Performance:</strong> 2,701 BBL/day | 174.2 BBL/hr | 73.5% utilization
				</div>
				<div class="insight-stat">
					<strong>External Factors:</strong> 2 days impacted by factors outside yard control (weather, customer maintenance)
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.analytics-overlay {
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

	.analytics-container {
		background: white;
		border-radius: 20px;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
		max-width: 95vw;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.analytics-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32px;
		border-bottom: 1px solid #e2e8f0;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 100%);
	}

	.header-content h2 {
		font-size: 28px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.header-content p {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.timeframe-select {
		padding: 8px 16px;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		background: white;
		font-size: 14px;
		cursor: pointer;
	}

	.close-btn {
		width: 40px;
		height: 40px;
		border: none;
		background: #f3f4f6;
		border-radius: 8px;
		cursor: pointer;
		font-size: 18px;
		color: #6b7280;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.key-insights {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		padding: 24px 32px;
		background: #fefefe;
	}

	.insight-card {
		background: linear-gradient(135deg, #475569 0%, #334155 100%);
		color: white;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(71, 85, 105, 0.2);
	}

	.insight-card h4 {
		font-size: 16px;
		font-weight: 700;
		margin: 0 0 8px 0;
	}

	.insight-card p {
		font-size: 14px;
		margin: 0;
		line-height: 1.5;
	}

	.table-container {
		flex: 1;
		overflow: auto;
		padding: 0 32px;
	}

	.analytics-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}

	.analytics-table th {
		background: #f8fafc;
		padding: 16px 12px;
		text-align: left;
		font-weight: 600;
		color: #374151;
		border-bottom: 2px solid #e5e7eb;
		position: sticky;
		top: 0;
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

	.analytics-table td {
		padding: 16px 12px;
		border-bottom: 1px solid #f1f5f9;
	}

	.analytics-table tr:hover {
		background: #fafbfc;
	}

	.date-cell {
		font-weight: 600;
		color: #374151;
	}

	.metric-cell {
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
	}

	.trend-cell {
		padding: 16px 12px;
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
		max-width: 200px;
	}

	.footer-insights {
		padding: 24px 32px;
		background: #f8fafc;
		border-top: 1px solid #e2e8f0;
	}

	.insight-stat {
		margin-bottom: 8px;
		font-size: 14px;
		color: #374151;
	}

	.insight-stat:last-child {
		margin-bottom: 0;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.analytics-container {
			max-width: 100vw;
			max-height: 100vh;
			border-radius: 0;
		}

		.analytics-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
			padding: 20px;
		}

		.header-controls {
			width: 100%;
			justify-content: space-between;
		}

		.key-insights {
			grid-template-columns: 1fr;
			padding: 20px;
		}

		.table-container {
			padding: 0 20px;
		}

		.analytics-table {
			font-size: 12px;
		}

		.analytics-table th,
		.analytics-table td {
			padding: 12px 8px;
		}

		.footer-insights {
			padding: 20px;
		}
	}
</style> 