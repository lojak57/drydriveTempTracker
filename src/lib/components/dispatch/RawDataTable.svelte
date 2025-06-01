<script lang="ts">
	import { dispatchAnalytics } from '$lib/stores/dispatchAnalytics';
	import type { DemoHaulData } from '$lib/stores/dispatchAnalytics';
	import { 
		Search, 
		Filter, 
		Download, 
		SortAsc, 
		SortDesc,
		Eye,
		AlertTriangle,
		CheckCircle,
		Clock,
		Calendar,
		Database
	} from 'lucide-svelte';
	import { format } from 'date-fns';

	// Reactive data
	$: allHauls = $dispatchAnalytics.demoHauls;
	$: allYards = $dispatchAnalytics.demoYards;
	$: allTrucks = $dispatchAnalytics.demoTrucks;

	// Filter and search state
	let searchQuery = '';
	let selectedYard = '';
	let selectedTruck = '';
	let selectedDriver = '';
	let selectedStatus = '';
	let sortField: keyof DemoHaulData = 'startTime';
	let sortDirection: 'asc' | 'desc' = 'desc';

	// Pagination
	let currentPage = 1;
	let itemsPerPage = 25;

	// Get unique values for filters
	$: uniqueDrivers = [...new Set(allHauls.map(h => h.driverName))].sort();
	$: uniqueStatuses = [...new Set(allHauls.map(h => h.status))];

	// Filter and sort data
	$: filteredHauls = allHauls.filter(haul => {
		const matchesSearch = !searchQuery || 
			haul.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
			haul.truckId.toLowerCase().includes(searchQuery.toLowerCase()) ||
			haul.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			haul.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
			haul.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
			haul.destination.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesYard = !selectedYard || 
			allTrucks.find(t => t.id === haul.truckId)?.yardId === selectedYard;

		const matchesTruck = !selectedTruck || haul.truckId === selectedTruck;
		const matchesDriver = !selectedDriver || haul.driverName === selectedDriver;
		const matchesStatus = !selectedStatus || haul.status === selectedStatus;

		return matchesSearch && matchesYard && matchesTruck && matchesDriver && matchesStatus;
	}).sort((a, b) => {
		let aVal = a[sortField];
		let bVal = b[sortField];

		// Handle null/undefined values
		if (aVal == null && bVal == null) return 0;
		if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
		if (bVal == null) return sortDirection === 'asc' ? 1 : -1;

		// Handle dates
		if (aVal instanceof Date && bVal instanceof Date) {
			aVal = aVal.getTime();
			bVal = bVal.getTime();
		}

		// Handle strings
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

	// Pagination calculations
	$: totalPages = Math.ceil(filteredHauls.length / itemsPerPage);
	$: paginatedHauls = filteredHauls.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Handle sorting
	function handleSort(field: keyof DemoHaulData) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'desc';
		}
	}

	// Mock CSV export
	function exportToCSV() {
		const headers = [
			'Haul ID', 'Truck ID', 'Driver', 'Customer', 'Origin', 'Destination',
			'Start Time', 'End Time', 'Duration (min)', 'Distance (mi)',
			'Onload Volume', 'Offload Volume', 'Volume Loss', 'Volume Loss %',
			'Avg Temp', 'Min Temp', 'Max Temp', 'Efficiency %', 'Revenue',
			'Fuel Cost', 'Status', 'Alerts', 'API Gravity', 'Water Cut', 'H2S Levels'
		];

		const csvData = filteredHauls.map(haul => [
			haul.id,
			haul.truckId,
			haul.driverName,
			haul.customer,
			haul.origin,
			haul.destination,
			format(haul.startTime, 'yyyy-MM-dd HH:mm:ss'),
			haul.endTime ? format(haul.endTime, 'yyyy-MM-dd HH:mm:ss') : '',
			haul.duration,
			haul.distance,
			haul.onloadVolume.toFixed(2),
			haul.offloadVolume.toFixed(2),
			haul.volumeLoss.toFixed(2),
			haul.volumeLossPercent.toFixed(2),
			haul.avgTemp.toFixed(1),
			haul.minTemp.toFixed(1),
			haul.maxTemp.toFixed(1),
			haul.efficiency.toFixed(1),
			haul.revenue.toFixed(2),
			haul.fuelCost.toFixed(2),
			haul.status,
			haul.alerts.length,
			haul.apiGravity.toFixed(1),
			haul.waterCut.toFixed(2),
			haul.h2sLevels.toFixed(2)
		]);

		const csvContent = [headers, ...csvData]
			.map(row => row.map(field => `"${field}"`).join(','))
			.join('\n');

		// Mock download
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `haul-tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Clear all filters
	function clearFilters() {
		searchQuery = '';
		selectedYard = '';
		selectedTruck = '';
		selectedDriver = '';
		selectedStatus = '';
		currentPage = 1;
	}

	// Get status styling
	function getStatusStyle(status: string) {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
			case 'in-progress':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
			case 'scheduled':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
		}
	}

	// Get status icon
	function getStatusIcon(status: string) {
		switch (status) {
			case 'completed':
				return CheckCircle;
			case 'in-progress':
				return Clock;
			case 'scheduled':
				return Calendar;
			default:
				return Clock;
		}
	}

	// Format currency
	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2
		}).format(amount);
	}

	// Format number with commas
	function formatNumber(num: number, decimals = 2) {
		return new Intl.NumberFormat('en-US', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		}).format(num);
	}

	// Handle row click to drill down to haul detail
	function handleHaulClick(haulId: string) {
		dispatchAnalytics.drillDown('haul', haulId);
		// Dispatch custom event to trigger parent tab change
		window.dispatchEvent(new CustomEvent('haul-detail-requested', { 
			detail: { haulId }
		}));
	}
</script>

<div class="raw-data-table">
	<!-- Header Section -->
	<div class="table-header">
		<div class="header-content">
			<div class="title-section">
				<h2 class="table-title">
					<Database class="w-5 h-5" />
					Raw Haul Ticket Data
				</h2>
				<p class="table-subtitle">
					{filteredHauls.length} of {allHauls.length} haul tickets • Click any row to view detailed data
				</p>
			</div>

			<div class="header-actions">
				<button 
					class="export-btn"
					on:click={exportToCSV}
					title="Export filtered data to CSV"
				>
					<Download class="w-4 h-4" />
					Export CSV
				</button>
			</div>
		</div>

		<!-- Filters Section -->
		<div class="filters-section">
			<div class="filter-row">
				<!-- Search -->
				<div class="search-box">
					<Search class="w-4 h-4 search-icon" />
					<input
						type="text"
						placeholder="Search hauls, trucks, drivers, customers..."
						bind:value={searchQuery}
						class="search-input"
					/>
				</div>

				<!-- Filter dropdowns -->
				<div class="filter-group">
					<select bind:value={selectedYard} class="filter-select">
						<option value="">All Yards</option>
						{#each allYards as yard}
							<option value={yard.id}>{yard.name}</option>
						{/each}
					</select>

					<select bind:value={selectedTruck} class="filter-select">
						<option value="">All Trucks</option>
						{#each allTrucks as truck}
							<option value={truck.id}>{truck.id} - {truck.model}</option>
						{/each}
					</select>

					<select bind:value={selectedDriver} class="filter-select">
						<option value="">All Drivers</option>
						{#each uniqueDrivers as driver}
							<option value={driver}>{driver}</option>
						{/each}
					</select>

					<select bind:value={selectedStatus} class="filter-select">
						<option value="">All Statuses</option>
						{#each uniqueStatuses as status}
							<option value={status}>{status}</option>
						{/each}
					</select>

					{#if searchQuery || selectedYard || selectedTruck || selectedDriver || selectedStatus}
						<button class="clear-filters-btn" on:click={clearFilters}>
							Clear Filters
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Table Section -->
	<div class="table-container">
		<table class="data-table">
			<thead>
				<tr>
					<th class="sortable" on:click={() => handleSort('id')}>
						<span class="th-content">
							Haul ID
							{#if sortField === 'id'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('truckId')}>
						<span class="th-content">
							Truck
							{#if sortField === 'truckId'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('driverName')}>
						<span class="th-content">
							Driver
							{#if sortField === 'driverName'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('customer')}>
						<span class="th-content">
							Customer
							{#if sortField === 'customer'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('startTime')}>
						<span class="th-content">
							Start Time
							{#if sortField === 'startTime'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('volumeLossPercent')}>
						<span class="th-content">
							Volume Loss %
							{#if sortField === 'volumeLossPercent'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('efficiency')}>
						<span class="th-content">
							Efficiency %
							{#if sortField === 'efficiency'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('revenue')}>
						<span class="th-content">
							Revenue
							{#if sortField === 'revenue'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th class="sortable" on:click={() => handleSort('status')}>
						<span class="th-content">
							Status
							{#if sortField === 'status'}
								<svelte:component this={sortDirection === 'asc' ? SortAsc : SortDesc} class="w-3 h-3" />
							{/if}
						</span>
					</th>
					<th>Alerts</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each paginatedHauls as haul (haul.id)}
					<tr class="data-row clickable-row" on:click={() => handleHaulClick(haul.id)}>
						<td class="font-mono text-sm">{haul.id}</td>
						<td class="font-mono font-medium">{haul.truckId}</td>
						<td>{haul.driverName}</td>
						<td>{haul.customer}</td>
						<td class="font-mono text-sm">
							{format(haul.startTime, 'MMM dd, HH:mm')}
						</td>
						<td class="text-right">
							<span class="volume-loss" class:high-loss={haul.volumeLossPercent > 3}>
								{formatNumber(haul.volumeLossPercent, 1)}%
							</span>
						</td>
						<td class="text-right">
							<span class="efficiency" class:low-efficiency={haul.efficiency < 85}>
								{formatNumber(haul.efficiency, 1)}%
							</span>
						</td>
						<td class="text-right font-mono">
							{formatCurrency(haul.revenue)}
						</td>
						<td>
							<span class="status-badge {getStatusStyle(haul.status)}">
								<svelte:component this={getStatusIcon(haul.status)} class="w-3 h-3" />
								{haul.status}
							</span>
						</td>
						<td>
							{#if haul.alerts.length > 0}
								<span class="alerts-badge">
									<AlertTriangle class="w-3 h-3" />
									{haul.alerts.length}
								</span>
							{:else}
								<span class="text-gray-400">—</span>
							{/if}
						</td>
						<td>
							<button class="action-btn" title="View Details" on:click|stopPropagation={() => handleHaulClick(haul.id)}>
								<Eye class="w-4 h-4" />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if filteredHauls.length === 0}
			<div class="empty-state">
				<Search class="w-12 h-12 text-gray-300" />
				<h3 class="empty-title">No haul tickets found</h3>
				<p class="empty-description">
					Try adjusting your search criteria or clearing filters.
				</p>
			</div>
		{/if}
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="pagination">
			<div class="pagination-info">
				Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHauls.length)} of {filteredHauls.length} results
			</div>
			
			<div class="pagination-controls">
				<button 
					class="pagination-btn"
					disabled={currentPage === 1}
					on:click={() => currentPage = 1}
				>
					First
				</button>
				<button 
					class="pagination-btn"
					disabled={currentPage === 1}
					on:click={() => currentPage--}
				>
					Previous
				</button>
				
				{#each Array.from({length: Math.min(5, totalPages)}, (_, i) => {
					const start = Math.max(1, currentPage - 2);
					return start + i;
				}).filter(page => page <= totalPages) as page}
					<button 
						class="pagination-btn"
						class:active={page === currentPage}
						on:click={() => currentPage = page}
					>
						{page}
					</button>
				{/each}
				
				<button 
					class="pagination-btn"
					disabled={currentPage === totalPages}
					on:click={() => currentPage++}
				>
					Next
				</button>
				<button 
					class="pagination-btn"
					disabled={currentPage === totalPages}
					on:click={() => currentPage = totalPages}
				>
					Last
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.raw-data-table {
		@apply flex flex-col h-full bg-white dark:bg-gray-800;
	}

	.table-header {
		@apply border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900;
	}

	.header-content {
		@apply flex justify-between items-center p-6;
	}

	.title-section {
		@apply flex flex-col gap-1;
	}

	.table-title {
		@apply flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white;
	}

	.table-subtitle {
		@apply text-sm text-gray-500 dark:text-gray-400;
	}

	.header-actions {
		@apply flex items-center gap-3;
	}

	.export-btn {
		@apply flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors;
	}

	.filters-section {
		@apply px-6 pb-4;
	}

	.filter-row {
		@apply flex flex-col lg:flex-row gap-4;
	}

	.search-box {
		@apply relative flex-1;
	}

	.search-icon {
		@apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
	}

	.search-input {
		@apply w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500;
	}

	.filter-group {
		@apply flex items-center gap-3 flex-wrap;
	}

	.filter-select {
		@apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm;
	}

	.clear-filters-btn {
		@apply px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors;
	}

	.table-container {
		@apply flex-1 overflow-auto;
	}

	.data-table {
		@apply w-full min-w-max;
	}

	.data-table th {
		@apply px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0;
	}

	.data-table th.sortable {
		@apply cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors;
	}

	.th-content {
		@apply flex items-center gap-1;
	}

	.data-table td {
		@apply px-4 py-3 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700;
	}

	.data-row {
		@apply border-b border-gray-100 dark:border-gray-700 transition-colors duration-150;
	}

	.clickable-row {
		@apply cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10;
	}

	.clickable-row:hover {
		@apply bg-blue-50 dark:bg-blue-900/10;
	}

	.volume-loss.high-loss {
		@apply text-red-600 dark:text-red-400 font-semibold;
	}

	.efficiency.low-efficiency {
		@apply text-yellow-600 dark:text-yellow-400 font-semibold;
	}

	.status-badge {
		@apply inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium;
	}

	.alerts-badge {
		@apply inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full text-xs font-medium;
	}

	.action-btn {
		@apply p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors;
	}

	.empty-state {
		@apply flex flex-col items-center justify-center py-12 text-center;
	}

	.empty-title {
		@apply mt-4 text-lg font-medium text-gray-900 dark:text-white;
	}

	.empty-description {
		@apply mt-2 text-sm text-gray-500 dark:text-gray-400;
	}

	.pagination {
		@apply flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700;
	}

	.pagination-info {
		@apply text-sm text-gray-500 dark:text-gray-400;
	}

	.pagination-controls {
		@apply flex items-center gap-2;
	}

	.pagination-btn {
		@apply px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
	}

	.pagination-btn.active {
		@apply bg-orange-600 border-orange-600 text-white hover:bg-orange-700;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.header-content {
			@apply flex-col gap-4 items-start;
		}

		.data-table {
			@apply text-xs;
		}

		.data-table th,
		.data-table td {
			@apply px-2 py-2;
		}

		.pagination {
			@apply flex-col gap-4;
		}

		.pagination-controls {
			@apply justify-center;
		}
	}
</style> 