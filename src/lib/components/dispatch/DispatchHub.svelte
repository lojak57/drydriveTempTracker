<script lang="ts">
	import { dispatchAnalytics, currentLevel, viewMode } from '$lib/stores/dispatchAnalytics';
	import FleetAnalytics from './FleetAnalytics.svelte';
	import YardAnalytics from './YardAnalytics.svelte';
	import TruckAnalytics from './TruckAnalytics.svelte';
	import HaulDetailView from './HaulDetailView.svelte';
	import { ChevronLeft, Home, BarChart3, Grid3X3, FileText } from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';

	// Reactive state
	$: ({ currentLevel: level, selectedYard, selectedTruck, selectedHaul, lastUpdate } = $dispatchAnalytics);

	// Breadcrumb generation
	$: breadcrumbs = getBreadcrumbs(level, selectedYard, selectedTruck, selectedHaul);
	
	function getBreadcrumbs(level: string, yardId: string | null, truckId: string | null, haulId: string | null) {
		const crumbs = [{ label: 'Fleet Overview', level: 'fleet' }];
		
		if (level !== 'fleet' && yardId) {
			const yardData = $dispatchAnalytics.demoYards.find(y => y.id === yardId);
			crumbs.push({ label: yardData?.name || 'Yard', level: 'yard' });
		}
		
		if (level !== 'fleet' && level !== 'yard' && truckId) {
			crumbs.push({ label: `Truck ${truckId}`, level: 'truck' });
		}
		
		if (level === 'haul' && haulId) {
			crumbs.push({ label: `Haul ${haulId}`, level: 'haul' });
		}
		
		return crumbs;
	}

	function handleBreadcrumbClick(targetLevel: string) {
		switch (targetLevel) {
			case 'fleet':
				dispatchAnalytics.resetToFleet();
				break;
			case 'yard':
				if (selectedYard) {
					dispatchAnalytics.drillDown('yard', selectedYard);
				}
				break;
			case 'truck':
				if (selectedTruck) {
					dispatchAnalytics.drillDown('truck', selectedTruck);
				}
				break;
		}
	}

	function handleViewModeChange(mode: 'analytics' | 'cards' | 'raw') {
		dispatchAnalytics.setViewMode(mode);
	}

	function formatLastUpdate(date: Date) {
		return formatDistanceToNow(date, { addSuffix: true });
	}
</script>

<div class="dispatch-hub">
	<!-- Header with breadcrumbs and controls -->
	<div class="hub-header">
		<div class="breadcrumb-container">
			<nav class="breadcrumb">
				{#each breadcrumbs as crumb, index}
					<button 
						class="breadcrumb-item"
						class:active={index === breadcrumbs.length - 1}
						on:click={() => handleBreadcrumbClick(crumb.level)}
						disabled={index === breadcrumbs.length - 1}
					>
						{#if index === 0}
							<Home class="w-4 h-4" />
						{/if}
						{crumb.label}
					</button>
					{#if index < breadcrumbs.length - 1}
						<ChevronLeft class="w-4 h-4 breadcrumb-separator" />
					{/if}
				{/each}
			</nav>
			
			<div class="last-update">
				Last updated: {formatLastUpdate(lastUpdate)}
			</div>
		</div>

		<!-- View mode toggle -->
		<div class="view-controls">
			<div class="view-mode-toggle">
				<button 
					class="view-btn"
					class:active={$viewMode === 'analytics'}
					on:click={() => handleViewModeChange('analytics')}
				>
					<BarChart3 class="w-4 h-4" />
					Analytics
				</button>
				<button 
					class="view-btn"
					class:active={$viewMode === 'cards'}
					on:click={() => handleViewModeChange('cards')}
				>
					<Grid3X3 class="w-4 h-4" />
					Cards
				</button>
				{#if level === 'haul'}
					<button 
						class="view-btn"
						class:active={$viewMode === 'raw'}
						on:click={() => handleViewModeChange('raw')}
					>
						<FileText class="w-4 h-4" />
						Raw Data
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Content area -->
	<div class="hub-content">
		{#if level === 'fleet'}
			<FleetAnalytics />
		{:else if level === 'yard'}
			<YardAnalytics />
		{:else if level === 'truck'}
			<TruckAnalytics />
		{:else if level === 'haul'}
			<HaulDetailView />
		{/if}
	</div>
</div>

<style>
	.dispatch-hub {
		@apply flex flex-col h-full bg-gray-50 dark:bg-gray-900;
	}

	.hub-header {
		@apply flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm;
	}

	.breadcrumb-container {
		@apply flex items-center gap-4;
	}

	.breadcrumb {
		@apply flex items-center gap-2;
	}

	.breadcrumb-item {
		@apply flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors;
	}

	.breadcrumb-item.active {
		@apply text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 cursor-default;
	}

	.breadcrumb-item:disabled {
		@apply cursor-default hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400;
	}

	.breadcrumb-separator {
		@apply text-gray-400 dark:text-gray-500 rotate-180;
	}

	.last-update {
		@apply text-xs text-gray-500 dark:text-gray-400 font-mono;
	}

	.view-controls {
		@apply flex items-center gap-4;
	}

	.view-mode-toggle {
		@apply flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1;
	}

	.view-btn {
		@apply flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors;
	}

	.view-btn.active {
		@apply bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm;
	}

	.hub-content {
		@apply flex-1 overflow-hidden;
	}
</style> 