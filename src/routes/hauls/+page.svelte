<script lang="ts">
	import { onMount } from 'svelte';
	import Navigation from '$lib/components/ui/Navigation.svelte';
	import { activeHauls, completedHauls, drivers, trucks } from '$lib/stores/haulStore';
	import HaulDetailView from '$lib/components/dashboard/HaulDetailView.svelte';
	import type { Haul } from '$lib/stores/haulStore';

	let selectedHaul: Haul | null = null;
	let searchTerm = '';
	let statusFilter = 'all';
	let sortBy = 'timestamp';
	let sortOrder = 'desc';
	let currentPage = 1;
	let itemsPerPage = 10;

	// Combine all hauls and sort by most recent
	$: allHauls = [...$activeHauls, ...$completedHauls].sort((a, b) => {
		const aTime = new Date(a.startTime).getTime();
		const bTime = new Date(b.startTime).getTime();
		return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
	});

	// Filter hauls based on search and status
	$: filteredHauls = allHauls.filter(haul => {
		const matchesSearch = searchTerm === '' || 
			haul.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			haul.onloadSite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			haul.offloadSite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			getDriver(haul.driverId)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			getTruck(haul.truckId)?.plateNumber.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = statusFilter === 'all' || haul.status === statusFilter;
		
		return matchesSearch && matchesStatus;
	});

	// Pagination
	$: totalPages = Math.ceil(filteredHauls.length / itemsPerPage);
	$: paginatedHauls = filteredHauls.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	function getDriver(driverId: string) {
		return $drivers.find(d => d.id === driverId);
	}

	function getTruck(truckId: string) {
		return $trucks.find(t => t.id === truckId);
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'loading': return 'bg-amber-100 text-amber-700 border-amber-200';
			case 'transit': return 'bg-blue-100 text-blue-700 border-blue-200';
			case 'offloading': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
			case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
			default: return 'bg-gray-100 text-gray-700 border-gray-200';
		}
	}

	function getVarianceStatus(expectedLoss: number, actualLoss?: number) {
		if (!actualLoss) return { label: 'In Progress', color: 'text-blue-600', icon: '⏳' };
		
		const variance = Math.abs(actualLoss - expectedLoss);
		const variancePercent = (variance / expectedLoss) * 100;
		
		if (variancePercent <= 5) {
			return { label: 'Good', color: 'text-emerald-600', icon: '✅' };
		} else if (variancePercent <= 15) {
			return { label: 'Moderate', color: 'text-amber-600', icon: '⚠️' };
		} else {
			return { label: 'High Variance', color: 'text-red-600', icon: '🚨' };
		}
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	function openHaulDetail(haul: Haul) {
		selectedHaul = haul;
	}

	function closeHaulDetail() {
		selectedHaul = null;
	}

	// Statistics
	$: stats = {
		total: allHauls.length,
		completed: allHauls.filter(h => h.status === 'completed').length,
		active: allHauls.filter(h => h.status !== 'completed').length,
		totalVolume: allHauls.reduce((sum, h) => sum + h.initialVolume, 0),
		avgEfficiency: allHauls.length > 0 ? 
			allHauls.reduce((sum, h) => {
				const efficiency = h.actualLoss ? ((h.initialVolume - h.actualLoss) / h.initialVolume * 100) : 0;
				return sum + efficiency;
			}, 0) / allHauls.length : 0
	};
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
	<Navigation />
	
	<main class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
		<!-- Header -->
		<div class="text-center mb-6 sm:mb-8">
			<h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-oil-black mb-2">Haul History</h1>
			<p class="text-sm sm:text-base text-oil-gray">Complete record of all haul operations and tickets</p>
		</div>

		<!-- Statistics Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
			<div class="glass-card p-4 text-center">
				<div class="text-2xl mb-2">📋</div>
				<div class="metric-display text-oil-blue text-2xl mb-1">{stats.total}</div>
				<div class="text-sm text-oil-gray">Total Hauls</div>
			</div>
			<div class="glass-card p-4 text-center">
				<div class="text-2xl mb-2">✅</div>
				<div class="metric-display text-emerald-600 text-2xl mb-1">{stats.completed}</div>
				<div class="text-sm text-oil-gray">Completed</div>
			</div>
			<div class="glass-card p-4 text-center">
				<div class="text-2xl mb-2">🚛</div>
				<div class="metric-display text-blue-600 text-2xl mb-1">{stats.active}</div>
				<div class="text-sm text-oil-gray">Active</div>
			</div>
			<div class="glass-card p-4 text-center">
				<div class="text-2xl mb-2">🛢️</div>
				<div class="metric-display text-oil-orange text-2xl mb-1">{stats.totalVolume.toLocaleString()}</div>
				<div class="text-sm text-oil-gray">Total Volume (gal)</div>
			</div>
			<div class="glass-card p-4 text-center">
				<div class="text-2xl mb-2">📊</div>
				<div class="metric-display text-emerald-600 text-2xl mb-1">{stats.avgEfficiency.toFixed(1)}%</div>
				<div class="text-sm text-oil-gray">Avg Efficiency</div>
			</div>
		</div>

		<!-- Filters and Search -->
		<div class="glass-card p-6 mb-6">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
				<!-- Search -->
				<div class="md:col-span-2">
					<label for="search" class="block text-sm font-medium text-oil-black mb-2">Search Hauls</label>
					<input
						id="search"
						type="text"
						bind:value={searchTerm}
						placeholder="Search by ID, driver, truck, or location..."
						class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-oil-blue focus:border-transparent"
					/>
				</div>

				<!-- Status Filter -->
				<div>
					<label for="status" class="block text-sm font-medium text-oil-black mb-2">Status</label>
					<select
						id="status"
						bind:value={statusFilter}
						class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-oil-blue focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="loading">Loading</option>
						<option value="transit">Transit</option>
						<option value="offloading">Offloading</option>
						<option value="completed">Completed</option>
					</select>
				</div>

				<!-- Sort -->
				<div>
					<label for="sort" class="block text-sm font-medium text-oil-black mb-2">Sort By</label>
					<select
						id="sort"
						bind:value={sortBy}
						class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-oil-blue focus:border-transparent"
					>
						<option value="timestamp">Date</option>
						<option value="volume">Volume</option>
						<option value="efficiency">Efficiency</option>
						<option value="status">Status</option>
					</select>
				</div>
			</div>

			<div class="flex items-center justify-between mt-4">
				<div class="text-sm text-oil-gray">
					Showing {paginatedHauls.length} of {filteredHauls.length} hauls
				</div>
				<button
					on:click={() => sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'}
					class="px-3 py-1 text-sm bg-white/50 hover:bg-white/70 rounded-lg border border-slate-200 transition-colors"
				>
					{sortOrder === 'desc' ? '↓' : '↑'} {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
				</button>
			</div>
		</div>

		<!-- Hauls Table -->
		<div class="glass-card overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-white/50 border-b border-slate-200">
						<tr>
							<th class="px-6 py-4 text-left text-xs font-medium text-oil-gray uppercase tracking-wider">Haul Details</th>
							<th class="px-6 py-4 text-left text-xs font-medium text-oil-gray uppercase tracking-wider">Route</th>
							<th class="px-6 py-4 text-left text-xs font-medium text-oil-gray uppercase tracking-wider">Volume & Loss</th>
							<th class="px-6 py-4 text-left text-xs font-medium text-oil-gray uppercase tracking-wider">Performance</th>
							<th class="px-6 py-4 text-left text-xs font-medium text-oil-gray uppercase tracking-wider">Status</th>
							<th class="px-6 py-4 text-left text-xs font-medium text-oil-gray uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-200">
						{#each paginatedHauls as haul}
							{@const driver = getDriver(haul.driverId)}
							{@const truck = getTruck(haul.truckId)}
							{@const variance = getVarianceStatus(haul.expectedLoss, haul.actualLoss)}
							{@const efficiency = haul.actualLoss ? ((haul.initialVolume - haul.actualLoss) / haul.initialVolume * 100) : 0}
							{@const latestTemp = haul.temperatureReadings[haul.temperatureReadings.length - 1]}
							{@const latestCoriolis = haul.coriolisReadings[haul.coriolisReadings.length - 1]}
							
							<tr class="hover:bg-white/30 transition-colors">
								<!-- Haul Details -->
								<td class="px-6 py-4">
									<div class="flex items-center space-x-3">
										<div class="w-10 h-10 bg-oil-orange/10 rounded-xl flex items-center justify-center">
											<span class="text-lg">{haul.status === 'completed' ? '✅' : '🚛'}</span>
										</div>
										<div>
											<div class="font-semibold text-oil-black">#{haul.id.slice(-8)}</div>
											<div class="text-sm text-oil-gray">{formatDate(haul.startTime)}</div>
											<div class="text-xs text-oil-gray">{driver?.name} • {truck?.plateNumber}</div>
										</div>
									</div>
								</td>

								<!-- Route -->
								<td class="px-6 py-4">
									<div class="text-sm">
										<div class="font-medium text-oil-black">{haul.onloadSite.name}</div>
										<div class="text-oil-gray">↓</div>
										<div class="font-medium text-oil-black">{haul.offloadSite.name}</div>
									</div>
									{#if haul.status !== 'completed'}
										<div class="mt-2">
											<div class="w-full bg-gray-200 rounded-full h-1.5">
												<div class="bg-blue-500 h-1.5 rounded-full" style="width: {haul.transitProgress}%"></div>
											</div>
											<div class="text-xs text-oil-gray mt-1">{haul.transitProgress}% complete</div>
										</div>
									{/if}
								</td>

								<!-- Volume & Loss -->
								<td class="px-6 py-4">
									<div class="text-sm">
										<div class="font-semibold text-oil-black">{haul.initialVolume.toLocaleString()} gal</div>
										<div class="text-oil-gray">Expected Loss: {haul.expectedLoss.toFixed(1)} gal</div>
										{#if haul.actualLoss}
											<div class="text-oil-gray">Actual Loss: {haul.actualLoss.toFixed(1)} gal</div>
										{:else}
											<div class="text-blue-600">In Progress</div>
										{/if}
									</div>
								</td>

								<!-- Performance -->
								<td class="px-6 py-4">
									<div class="space-y-1">
										{#if haul.actualLoss}
											<div class="flex items-center gap-2">
												<span class="text-lg">{variance.icon}</span>
												<span class="text-sm font-medium {variance.color}">{efficiency.toFixed(1)}%</span>
											</div>
											<div class="text-xs text-oil-gray">{variance.label}</div>
										{:else}
											<div class="text-sm text-blue-600">In Progress</div>
										{/if}
										
										<!-- Latest sensor data -->
										{#if latestTemp && latestCoriolis}
											<div class="text-xs text-oil-gray">
												Temp: {latestTemp.oilTemp.toFixed(1)}°F • API: {latestCoriolis.apiGravity.toFixed(1)}°
											</div>
										{/if}
									</div>
								</td>

								<!-- Status -->
								<td class="px-6 py-4">
									<div class="px-3 py-1 rounded-full text-xs font-medium border {getStatusColor(haul.status)}">
										{haul.status.charAt(0).toUpperCase() + haul.status.slice(1)}
									</div>
									{#if haul.status !== 'completed'}
										<div class="text-xs text-oil-gray mt-1">{haul.estimatedTimeRemaining} min remaining</div>
									{/if}
								</td>

								<!-- Actions -->
								<td class="px-6 py-4">
									<button
										on:click={() => openHaulDetail(haul)}
										class="px-3 py-1 bg-oil-blue hover:bg-oil-blue/80 text-white rounded-lg text-sm font-medium transition-colors"
									>
										View Details
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
					<div class="text-sm text-oil-gray">
						Page {currentPage} of {totalPages}
					</div>
					<div class="flex space-x-2">
						<button
							on:click={() => currentPage = Math.max(1, currentPage - 1)}
							disabled={currentPage === 1}
							class="px-3 py-1 bg-white/50 hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-200 text-sm transition-colors"
						>
							Previous
						</button>
						<button
							on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
							disabled={currentPage === totalPages}
							class="px-3 py-1 bg-white/50 hover:bg-white/70 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border border-slate-200 text-sm transition-colors"
						>
							Next
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Empty State -->
		{#if filteredHauls.length === 0}
			<div class="glass-card p-12 text-center">
				<div class="text-4xl mb-4">📋</div>
				<h3 class="text-xl font-semibold text-oil-black mb-2">No Hauls Found</h3>
				<p class="text-oil-gray">
					{searchTerm || statusFilter !== 'all' 
						? 'Try adjusting your search or filter criteria.' 
						: 'No haul records available yet.'}
				</p>
			</div>
		{/if}
	</main>
</div>

<!-- Haul Detail Modal -->
{#if selectedHaul}
	{@const driver = getDriver(selectedHaul.driverId)}
	{@const truck = getTruck(selectedHaul.truckId)}
	{#if driver && truck}
		<HaulDetailView 
			haul={selectedHaul} 
			driver={driver} 
			truck={truck} 
			on:close={closeHaulDetail} 
		/>
	{/if}
{/if} 