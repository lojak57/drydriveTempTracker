<script lang="ts">
	import { onMount } from 'svelte';
	import { completedHauls, drivers, trucks, type Haul } from '$lib/stores/haulStore';
	import HaulCard from '$lib/components/dashboard/HaulCard.svelte';
	import HaulDetailView from '$lib/components/dashboard/HaulDetailView.svelte';

	// Filter and sort options
	let searchTerm = '';
	let statusFilter = 'all';
	let sortBy = 'date';
	let sortOrder = 'desc';

	// Pagination
	let currentPage = 1;
	let itemsPerPage = 12;

	// Selected haul for detailed view
	let selectedHaul: Haul | null = null;

	// Get truck and driver info
	function getTruckInfo(truckId: string) {
		return $trucks.find(truck => truck.id === truckId);
	}

	function getDriverInfo(driverId: string) {
		return $drivers.find(driver => driver.id === driverId);
	}

	// Handle haul selection
	function handleHaulSelect(haul: Haul) {
		selectedHaul = haul;
	}

	function closeDetailView() {
		selectedHaul = null;
	}

	// Filter and sort hauls
	$: filteredHauls = $completedHauls
		.filter(haul => {
			const matchesSearch = searchTerm === '' || 
				haul.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				haul.onloadSite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				haul.offloadSite.name.toLowerCase().includes(searchTerm.toLowerCase());
			
			const matchesStatus = statusFilter === 'all' || haul.status === statusFilter;
			
			return matchesSearch && matchesStatus;
		})
		.sort((a, b) => {
			let aValue, bValue;
			
			switch (sortBy) {
				case 'date':
					aValue = a.startTime.getTime();
					bValue = b.startTime.getTime();
					break;
				case 'volume':
					aValue = a.initialVolume;
					bValue = b.initialVolume;
					break;
				case 'loss':
					aValue = a.actualLoss || 0;
					bValue = b.actualLoss || 0;
					break;
				default:
					aValue = a.startTime.getTime();
					bValue = b.startTime.getTime();
			}
			
			return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
		});

	// Pagination
	$: totalPages = Math.ceil(filteredHauls.length / itemsPerPage);
	$: paginatedHauls = filteredHauls.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	// Statistics
	$: totalVolume = filteredHauls.reduce((sum, haul) => sum + haul.initialVolume, 0);
	$: totalLoss = filteredHauls.reduce((sum, haul) => sum + (haul.actualLoss || 0), 0);
	$: averageEfficiency = filteredHauls.length > 0 
		? filteredHauls.reduce((sum, haul) => {
			const actualLoss = haul.actualLoss || 0;
			const efficiency = haul.initialVolume > 0 ? ((haul.initialVolume - actualLoss) / haul.initialVolume * 100) : 0;
			return sum + efficiency;
		}, 0) / filteredHauls.length 
		: 0;
</script>

<!-- Header -->
<div class="text-center mb-6 sm:mb-8">
	<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-oil-black mb-2">Haul History</h1>
	<p class="text-sm sm:text-base text-oil-gray">Complete history of all oil transport operations</p>
</div>

<!-- Summary Statistics -->
<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
	<div class="glass-card p-4 sm:p-6 text-center">
		<div class="metric-display text-oil-orange text-2xl sm:text-3xl mb-2">{filteredHauls.length}</div>
		<div class="text-oil-gray text-sm sm:text-base">Total Hauls</div>
	</div>
	
	<div class="glass-card p-4 sm:p-6 text-center">
		<div class="metric-display text-oil-blue text-2xl sm:text-3xl mb-2">{totalVolume.toLocaleString()}</div>
		<div class="text-oil-gray text-sm sm:text-base">Total Volume (gal)</div>
	</div>
	
	<div class="glass-card p-4 sm:p-6 text-center">
		<div class="metric-display text-emerald-600 text-2xl sm:text-3xl mb-2">{averageEfficiency.toFixed(1)}%</div>
		<div class="text-oil-gray text-sm sm:text-base">Average Efficiency</div>
	</div>
</div>

<!-- Filters and Search -->
<div class="glass-card p-4 sm:p-6 mb-6 sm:mb-8">
	<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
		<!-- Search -->
		<div>
			<label for="search" class="block text-sm font-medium text-oil-black mb-2">Search</label>
			<input
				id="search"
				type="text"
				bind:value={searchTerm}
				placeholder="Search hauls..."
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oil-orange focus:border-transparent"
			/>
		</div>
		
		<!-- Status Filter -->
		<div>
			<label for="status" class="block text-sm font-medium text-oil-black mb-2">Status</label>
			<select
				id="status"
				bind:value={statusFilter}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oil-orange focus:border-transparent"
			>
				<option value="all">All Status</option>
				<option value="completed">Completed</option>
				<option value="cancelled">Cancelled</option>
			</select>
		</div>
		
		<!-- Sort By -->
		<div>
			<label for="sortBy" class="block text-sm font-medium text-oil-black mb-2">Sort By</label>
			<select
				id="sortBy"
				bind:value={sortBy}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oil-orange focus:border-transparent"
			>
				<option value="date">Date</option>
				<option value="volume">Volume</option>
				<option value="loss">Loss</option>
			</select>
		</div>
		
		<!-- Sort Order -->
		<div>
			<label for="sortOrder" class="block text-sm font-medium text-oil-black mb-2">Order</label>
			<select
				id="sortOrder"
				bind:value={sortOrder}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oil-orange focus:border-transparent"
			>
				<option value="desc">Newest First</option>
				<option value="asc">Oldest First</option>
			</select>
		</div>
	</div>
</div>

<!-- Hauls Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
	{#each paginatedHauls as haul}
		{@const truck = getTruckInfo(haul.truckId)}
		{@const driver = getDriverInfo(haul.driverId)}
		
		{#if truck && driver}
			<HaulCard 
				{haul}
				{truck}
				{driver}
				on:select={() => handleHaulSelect(haul)}
			/>
		{/if}
	{/each}
</div>

<!-- Pagination -->
{#if totalPages > 1}
	<div class="flex justify-center items-center space-x-2 mb-6">
		<button
			onclick={() => currentPage = Math.max(1, currentPage - 1)}
			disabled={currentPage === 1}
			class="px-3 py-2 rounded-lg bg-white border border-gray-300 text-oil-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
		>
			Previous
		</button>
		
		{#each Array(totalPages).fill(0) as _, i}
			{@const page = i + 1}
			<button
				onclick={() => currentPage = page}
				class="px-3 py-2 rounded-lg border {currentPage === page 
					? 'bg-oil-orange text-white border-oil-orange' 
					: 'bg-white text-oil-black border-gray-300 hover:bg-gray-50'}"
			>
				{page}
			</button>
		{/each}
		
		<button
			onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
			disabled={currentPage === totalPages}
			class="px-3 py-2 rounded-lg bg-white border border-gray-300 text-oil-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
		>
			Next
		</button>
	</div>
{/if}

<!-- Empty State -->
{#if filteredHauls.length === 0}
	<div class="glass-card p-8 sm:p-12 text-center">
		<div class="text-6xl mb-4">📋</div>
		<h3 class="text-xl font-semibold text-oil-black mb-2">No Hauls Found</h3>
		<p class="text-oil-gray">Try adjusting your search criteria or filters.</p>
	</div>
{/if}

<!-- Haul Detail Modal -->
{#if selectedHaul}
	{@const selectedTruck = getTruckInfo(selectedHaul.truckId)}
	{@const selectedDriver = getDriverInfo(selectedHaul.driverId)}
	
	{#if selectedTruck && selectedDriver}
		<div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div class="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
				<div class="p-6 border-b border-gray-200 flex items-center justify-between">
					<h2 class="text-2xl font-bold text-oil-black">Haul Details - {selectedHaul.id.slice(-8)}</h2>
					<button 
						onclick={closeDetailView}
						class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
						</svg>
					</button>
				</div>
				<div class="overflow-y-auto max-h-[calc(90vh-120px)]">
					<HaulDetailView 
						haul={selectedHaul}
						truck={selectedTruck}
						driver={selectedDriver}
					/>
				</div>
			</div>
		</div>
	{/if}
{/if} 