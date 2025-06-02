<script lang="ts">
	import { fleetData, type TruckMetrics } from '$lib/stores/calibrationData';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let viewMode: 'table' | 'grid' = 'table';
	export let filterStatus: 'all' | 'good' | 'warning' | 'critical' = 'all';
	export let sortBy: 'id' | 'lastCalibrated' | 'avgLoadDelta' | 'status' = 'status';
	export let sortDirection: 'asc' | 'desc' = 'desc';

	let searchTerm = '';
	let selectedTrucks: string[] = [];

	// Percentage color logic function
	function getPercentageColor(value: number, threshold = 80): string {
		if (value < threshold) return 'text-red-500 font-semibold';
		return 'text-slate-200';
	}

	// Filtered and sorted truck data
	$: filteredTrucks = $fleetData
		.filter(truck => {
			// Status filter
			if (filterStatus !== 'all' && truck.status !== filterStatus) {
				return false;
			}
			
			// Search filter
			if (searchTerm && !truck.id.toLowerCase().includes(searchTerm.toLowerCase())) {
				return false;
			}
			
			return true;
		})
		.sort((a, b) => {
			let aValue: any, bValue: any;
			
			switch (sortBy) {
				case 'id':
					aValue = a.id;
					bValue = b.id;
					break;
				case 'lastCalibrated':
					aValue = a.lastCalibrated.getTime();
					bValue = b.lastCalibrated.getTime();
					break;
				case 'avgLoadDelta':
					aValue = Math.abs(a.avgLoadDelta);
					bValue = Math.abs(b.avgLoadDelta);
					break;
				case 'status':
					const statusOrder = { 'critical': 3, 'warning': 2, 'good': 1 };
					aValue = statusOrder[a.status];
					bValue = statusOrder[b.status];
					break;
				default:
					aValue = a.id;
					bValue = b.id;
			}
			
			if (sortDirection === 'asc') {
				return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
			} else {
				return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
			}
		});

	function formatDaysAgo(date: Date): string {
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - date.getTime());
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		
		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return '1 day ago';
		return `${diffDays} days ago`;
	}

	function formatDelta(delta: number): string {
		const sign = delta >= 0 ? '+' : '';
		return `${sign}${delta.toFixed(2)}%`;
	}

	function getStatusIcon(status: TruckMetrics['status']): string {
		switch (status) {
			case 'good': return '✅';
			case 'warning': return '⚠️';
			case 'critical': return '🔴';
			default: return '❓';
		}
	}

	function getStatusLabel(status: TruckMetrics['status']): string {
		switch (status) {
			case 'good': return 'Good';
			case 'warning': return 'Needs Cal';
			case 'critical': return 'Critical';
			default: return 'Unknown';
		}
	}

	function handleSort(column: typeof sortBy) {
		if (sortBy === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = column;
			sortDirection = 'desc';
		}
	}

	function toggleTruckSelection(truckId: string) {
		if (selectedTrucks.includes(truckId)) {
			selectedTrucks = selectedTrucks.filter(id => id !== truckId);
		} else {
			selectedTrucks = [...selectedTrucks, truckId];
		}
	}

	function selectAllVisible() {
		selectedTrucks = filteredTrucks.map(truck => truck.id);
	}

	function clearSelection() {
		selectedTrucks = [];
	}

	function scheduleCalibration(truckIds: string[]) {
		dispatch('schedule-calibration', { truckIds });
	}

	// Mock percentage for demonstration - in real app would come from truck data
	function getCalibrationPercentage(truck: TruckMetrics): number {
		// Simulate calibration percentage based on status
		if (truck.status === 'good') return Math.random() * 15 + 85; // 85-100%
		if (truck.status === 'warning') return Math.random() * 20 + 60; // 60-80%
		return Math.random() * 40 + 20; // 20-60% for critical
	}
</script>

<div class="truck-status-container">
	<!-- Controls Section -->
	<div class="controls-section">
		<div class="search-filters">
			<input
				type="text"
				placeholder="Search truck ID..."
				bind:value={searchTerm}
				class="search-input"
			/>
			
			<select bind:value={filterStatus} class="filter-select">
				<option value="all">All Status</option>
				<option value="good">✅ Good</option>
				<option value="warning">⚠️ Needs Cal</option>
				<option value="critical">🔴 Critical</option>
			</select>
			
			<div class="view-toggle">
				<button 
					class="view-btn"
					class:active={viewMode === 'table'}
					on:click={() => viewMode = 'table'}
				>
					📋 Table
				</button>
				<button 
					class="view-btn"
					class:active={viewMode === 'grid'}
					on:click={() => viewMode = 'grid'}
				>
					🔲 Grid
				</button>
			</div>
		</div>
		
		<div class="results-info">
			<span class="results-count">
				{filteredTrucks.length} of {$fleetData.length} trucks
			</span>
			
			{#if selectedTrucks.length > 0}
				<div class="selection-actions">
					<span class="selection-count">{selectedTrucks.length} selected</span>
					<button class="action-btn schedule" on:click={() => scheduleCalibration(selectedTrucks)}>
						📅 Schedule Calibration
					</button>
					<button class="action-btn clear" on:click={clearSelection}>Clear</button>
				</div>
			{/if}
		</div>
	</div>

	<!-- Table View -->
	{#if viewMode === 'table'}
		<div class="table-container">
			<table class="trucks-table">
				<thead>
					<tr>
						<th class="checkbox-column">
							<input 
								type="checkbox" 
								on:change={selectAllVisible}
								checked={selectedTrucks.length === filteredTrucks.length && filteredTrucks.length > 0}
							/>
						</th>
						<th class="sortable" on:click={() => handleSort('id')}>
							Truck ID
							{#if sortBy === 'id'}
								<span class="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</th>
						<th class="sortable" on:click={() => handleSort('lastCalibrated')}>
							Last Calibrated
							{#if sortBy === 'lastCalibrated'}
								<span class="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</th>
						<th class="sortable" on:click={() => handleSort('avgLoadDelta')}>
							Avg Load Delta
							{#if sortBy === 'avgLoadDelta'}
								<span class="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</th>
						<th>Calibration %</th>
						<th class="sortable" on:click={() => handleSort('status')}>
							Status
							{#if sortBy === 'status'}
								<span class="sort-icon">{sortDirection === 'asc' ? '↑' : '↓'}</span>
							{/if}
						</th>
						<th>Total Loads</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredTrucks as truck (truck.id)}
						{@const calibrationPercent = getCalibrationPercentage(truck)}
						<tr 
							class="truck-row"
							class:selected={selectedTrucks.includes(truck.id)}
							class:good={truck.status === 'good'}
							class:warning={truck.status === 'warning'}
							class:critical={truck.status === 'critical'}
						>
							<td class="checkbox-column">
								<input 
									type="checkbox" 
									checked={selectedTrucks.includes(truck.id)}
									on:change={() => toggleTruckSelection(truck.id)}
								/>
							</td>
							<td class="truck-id">
								<span class="id-text">{truck.id}</span>
							</td>
							<td class="last-calibrated">
								{formatDaysAgo(truck.lastCalibrated)}
							</td>
							<td class="load-delta" class:positive={truck.avgLoadDelta > 0} class:negative={truck.avgLoadDelta < 0}>
								{formatDelta(truck.avgLoadDelta)}
							</td>
							<td class="calibration-percent">
								<span class={getPercentageColor(calibrationPercent)}>
									{calibrationPercent.toFixed(1)}%
								</span>
							</td>
							<td class="status-cell">
								<div class="status-badge" class:good={truck.status === 'good'} class:warning={truck.status === 'warning'} class:critical={truck.status === 'critical'}>
									<span class="status-icon">{getStatusIcon(truck.status)}</span>
									<span class="status-text">{getStatusLabel(truck.status)}</span>
								</div>
							</td>
							<td class="total-loads">
								{truck.totalLoads.toLocaleString()}
							</td>
							<td class="actions-cell">
								<button class="action-btn small primary" on:click={() => dispatch('view-details', { truck })}>
									📊 Details
								</button>
								{#if truck.status !== 'good'}
									<button class="action-btn small secondary" on:click={() => scheduleCalibration([truck.id])}>
										📅 Calibrate
									</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Grid View -->
	{#if viewMode === 'grid'}
		<div class="grid-container">
			{#each filteredTrucks as truck (truck.id)}
				{@const calibrationPercent = getCalibrationPercentage(truck)}
				<div 
					class="truck-card"
					class:selected={selectedTrucks.includes(truck.id)}
					class:good={truck.status === 'good'}
					class:warning={truck.status === 'warning'}
					class:critical={truck.status === 'critical'}
					on:click={() => toggleTruckSelection(truck.id)}
				>
					<div class="card-header">
						<div class="truck-id-card">{truck.id}</div>
						<div class="status-badge" class:good={truck.status === 'good'} class:warning={truck.status === 'warning'} class:critical={truck.status === 'critical'}>
							{getStatusIcon(truck.status)}
						</div>
					</div>
					
					<div class="card-metrics">
						<div class="metric">
							<span class="metric-label">Last Cal</span>
							<span class="metric-value">{formatDaysAgo(truck.lastCalibrated)}</span>
						</div>
						<div class="metric">
							<span class="metric-label">Delta</span>
							<span class="metric-value" class:positive={truck.avgLoadDelta > 0} class:negative={truck.avgLoadDelta < 0}>
								{formatDelta(truck.avgLoadDelta)}
							</span>
						</div>
						<div class="metric">
							<span class="metric-label">Cal %</span>
							<span class="metric-value {getPercentageColor(calibrationPercent)}">
								{calibrationPercent.toFixed(1)}%
							</span>
						</div>
						<div class="metric">
							<span class="metric-label">Loads</span>
							<span class="metric-value">{truck.totalLoads}</span>
						</div>
					</div>
					
					{#if truck.status !== 'good'}
						<div class="card-actions">
							<button class="action-btn small secondary" on:click|stopPropagation={() => scheduleCalibration([truck.id])}>
								Schedule Cal
							</button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.truck-status-container {
		background: rgba(15, 23, 42, 0.95);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
	}

	.controls-section {
		background: linear-gradient(135deg, #1e293b, #334155);
		padding: 20px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
	}

	.search-filters {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.search-input {
		padding: 8px 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(30, 41, 59, 0.8);
		color: #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		min-width: 200px;
		transition: all 0.2s ease;
	}

	.search-input::placeholder {
		color: #94a3b8;
	}

	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}

	.filter-select {
		padding: 8px 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(30, 41, 59, 0.8);
		color: #e2e8f0;
		border-radius: 6px;
		font-size: 14px;
		cursor: pointer;
	}

	.filter-select option {
		background: #1e293b;
		color: #e2e8f0;
	}

	.view-toggle {
		display: flex;
		background: rgba(30, 41, 59, 0.8);
		border-radius: 6px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.view-btn {
		padding: 8px 12px;
		background: transparent;
		border: none;
		color: #94a3b8;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 12px;
	}

	.view-btn:hover {
		background: rgba(51, 65, 85, 0.5);
		color: #e2e8f0;
	}

	.view-btn.active {
		background: #3b82f6;
		color: white;
	}

	.results-info {
		display: flex;
		align-items: center;
		gap: 16px;
		color: #e2e8f0;
	}

	.results-count {
		font-size: 14px;
		color: #94a3b8;
	}

	.selection-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.selection-count {
		font-size: 14px;
		font-weight: 500;
		color: #3b82f6;
	}

	.action-btn {
		padding: 6px 12px;
		border: 1px solid transparent;
		border-radius: 6px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.action-btn.small {
		padding: 4px 8px;
		font-size: 11px;
	}

	.action-btn.primary {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.action-btn.secondary {
		background: #f59e0b;
		color: white;
		border-color: #f59e0b;
	}

	.action-btn.schedule {
		background: #059669;
		color: white;
		border-color: #059669;
	}

	.action-btn.clear {
		background: #6b7280;
		color: white;
		border-color: #6b7280;
	}

	.action-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	/* Table Styles */
	.table-container {
		overflow-x: auto;
		max-height: 600px;
		overflow-y: auto;
		background: #0f172a;
	}

	.trucks-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
		background: #0f172a;
	}

	.trucks-table th {
		background: #1e293b;
		padding: 12px 8px;
		text-align: left;
		font-weight: 600;
		color: #e2e8f0;
		border-bottom: 2px solid rgba(255, 255, 255, 0.1);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.trucks-table th.sortable {
		cursor: pointer;
		user-select: none;
		transition: background-color 0.2s ease;
	}

	.trucks-table th.sortable:hover {
		background: #334155;
	}

	.sort-icon {
		margin-left: 4px;
		color: #3b82f6;
		font-weight: bold;
	}

	.trucks-table td {
		padding: 10px 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
		vertical-align: middle;
		color: #cbd5e1;
	}

	.truck-row {
		transition: all 0.2s ease;
		cursor: pointer;
		background: #0f172a;
	}

	.truck-row:nth-child(even) {
		background: #1e293b;
	}

	.truck-row:nth-child(odd) {
		background: #0f172a;
	}

	.truck-row:hover {
		background: #334155 !important;
	}

	.truck-row.selected {
		background: rgba(59, 130, 246, 0.1) !important;
		border-left: 3px solid #3b82f6;
	}

	.truck-row.good {
		border-left: 3px solid #22c55e;
	}

	.truck-row.warning {
		border-left: 3px solid #f59e0b;
	}

	.truck-row.critical {
		border-left: 3px solid #ef4444;
	}

	.checkbox-column {
		width: 40px;
		text-align: center;
	}

	.truck-id {
		font-weight: 600;
		font-family: 'JetBrains Mono', monospace;
		color: #e2e8f0;
	}

	.load-delta {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
	}

	.load-delta.positive {
		color: #ef4444;
	}

	.load-delta.negative {
		color: #3b82f6;
	}

	.calibration-percent {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
	}

	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 500;
		background: #374151;
		color: #d1d5db;
		border: 1px solid #4b5563;
	}

	.status-badge.good {
		background: rgba(34, 197, 94, 0.1);
		color: #16a34a;
		border: 1px solid rgba(34, 197, 94, 0.2);
	}

	.status-badge.warning {
		background: rgba(245, 158, 11, 0.1);
		color: #d97706;
		border: 1px solid rgba(245, 158, 11, 0.2);
	}

	.status-badge.critical {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.actions-cell {
		display: flex;
		gap: 4px;
	}

	/* Grid Styles */
	.grid-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 16px;
		padding: 20px;
		max-height: 600px;
		overflow-y: auto;
		background: #0f172a;
	}

	.truck-card {
		background: #1e293b;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.truck-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		background: #334155;
	}

	.truck-card.selected {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}

	.truck-card.good {
		border-left: 4px solid #22c55e;
	}

	.truck-card.warning {
		border-left: 4px solid #f59e0b;
	}

	.truck-card.critical {
		border-left: 4px solid #ef4444;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.truck-id-card {
		font-size: 16px;
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
		color: #e2e8f0;
	}

	.card-metrics {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		margin-bottom: 12px;
	}

	.metric {
		text-align: center;
	}

	.metric-label {
		display: block;
		font-size: 11px;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 4px;
	}

	.metric-value {
		display: block;
		font-size: 13px;
		font-weight: 600;
		color: #e2e8f0;
		font-family: 'JetBrains Mono', monospace;
	}

	.metric-value.positive {
		color: #ef4444;
	}

	.metric-value.negative {
		color: #3b82f6;
	}

	.card-actions {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding-top: 12px;
		margin-top: 12px;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.controls-section {
			flex-direction: column;
			align-items: stretch;
		}

		.search-filters {
			flex-direction: column;
		}

		.search-input {
			min-width: auto;
			width: 100%;
		}

		.results-info {
			justify-content: space-between;
		}

		.grid-container {
			grid-template-columns: 1fr;
		}

		.table-container {
			font-size: 12px;
		}

		.trucks-table th,
		.trucks-table td {
			padding: 8px 4px;
		}

		.card-metrics {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style> 