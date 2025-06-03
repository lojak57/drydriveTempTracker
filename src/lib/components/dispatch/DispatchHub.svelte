<script lang="ts">
	import { dispatchAnalytics, currentLevel, viewMode } from '$lib/stores/dispatchAnalytics';
	import FleetAnalytics from './FleetAnalytics.svelte';
	import YardAnalytics from './YardAnalytics.svelte';
	import TruckAnalytics from './TruckAnalytics.svelte';
	import HaulDetailView from './HaulDetailView.svelte';
	import RawDataTable from './RawDataTable.svelte';
	import { 
		Home, 
		Building2, 
		Truck, 
		FileText, 
		Database,
		ChevronRight,
		Activity,
		AlertTriangle,
		TrendingUp
	} from 'lucide-svelte';
	import { formatDistanceToNow } from 'date-fns';
	import { onMount, onDestroy } from 'svelte';

	// Active tab management
	let activeTab: 'fleet' | 'yard' | 'truck' | 'haul' | 'raw' = 'fleet';

	// Reactive state
	$: ({ currentLevel: level, selectedYard, selectedTruck, selectedHaul, lastUpdate } = $dispatchAnalytics);
	$: fleetData = $dispatchAnalytics.demoFleet;
	$: yardData = $dispatchAnalytics.demoYards;
	$: truckData = $dispatchAnalytics.demoTrucks;
	$: haulData = $dispatchAnalytics.demoHauls;

	// Breadcrumb generation for current drill-down
	$: breadcrumbs = getBreadcrumbs(level, selectedYard, selectedTruck, selectedHaul);
	
	function getBreadcrumbs(level: string, yardId: string | null, truckId: string | null, haulId: string | null) {
		const crumbs = [{ label: 'Fleet Overview', level: 'fleet', icon: Home }];
		
		if (level !== 'fleet' && yardId) {
			const yard = $dispatchAnalytics.demoYards.find(y => y.id === yardId);
			crumbs.push({ label: yard?.name || 'Yard', level: 'yard', icon: Building2 });
		}
		
		if (level !== 'fleet' && level !== 'yard' && truckId) {
			crumbs.push({ label: `Truck ${truckId}`, level: 'truck', icon: Truck });
		}
		
		if (level === 'haul' && haulId) {
			crumbs.push({ label: `Haul ${haulId}`, level: 'haul', icon: FileText });
		}
		
		return crumbs;
	}

	// Tab management
	function handleTabChange(tab: typeof activeTab) {
		activeTab = tab;
		
		// Reset drill-down when switching to raw data
		if (tab === 'raw') {
			dispatchAnalytics.resetToFleet();
		}
		// Auto-drill down to first yard when accessing yard tab directly
		else if (tab === 'yard' && level === 'fleet') {
			const firstYard = $dispatchAnalytics.demoYards[0];
			if (firstYard) {
				dispatchAnalytics.drillDown('yard', firstYard.id);
			}
		}
		// Auto-drill down to first truck when accessing truck tab directly
		else if (tab === 'truck' && level === 'fleet') {
			const firstYard = $dispatchAnalytics.demoYards[0];
			const firstTruck = $dispatchAnalytics.demoTrucks.find(t => t.yardId === firstYard?.id);
			if (firstYard && firstTruck) {
				dispatchAnalytics.drillDown('yard', firstYard.id);
				dispatchAnalytics.drillDown('truck', firstTruck.id);
			}
		}
		// Auto-drill down to first haul when accessing haul tab directly
		else if (tab === 'haul' && level === 'fleet') {
			const firstHaul = $dispatchAnalytics.demoHauls[0];
			if (firstHaul) {
				dispatchAnalytics.drillDown('haul', firstHaul.id);
			}
		}
	}

	// Handle drill-down navigation
	function handleDrillDown(targetLevel: string, id?: string) {
		switch (targetLevel) {
			case 'fleet':
				dispatchAnalytics.resetToFleet();
				activeTab = 'fleet';
				break;
			case 'yard':
				if (id) {
					dispatchAnalytics.drillDown('yard', id);
					activeTab = 'yard';
				}
				break;
			case 'truck':
				if (id) {
					dispatchAnalytics.drillDown('truck', id);
					activeTab = 'truck';
				}
				break;
			case 'haul':
				if (id) {
					dispatchAnalytics.drillDown('haul', id);
					activeTab = 'haul';
				}
				break;
		}
	}

	function formatLastUpdate(date: Date) {
		return formatDistanceToNow(date, { addSuffix: true });
	}

	// Get summary stats for tab indicators
	$: tabStats = {
		fleet: {
			count: 1,
			alerts: fleetData.alerts.length,
			efficiency: fleetData.efficiency
		},
		yard: {
			count: yardData.length,
			alerts: yardData.reduce((sum, y) => sum + y.alerts.length, 0),
			efficiency: yardData.reduce((sum, y) => sum + y.efficiency, 0) / yardData.length
		},
		truck: {
			count: truckData.length,
			alerts: truckData.reduce((sum, t) => sum + t.alerts.length, 0),
			efficiency: truckData.reduce((sum, t) => sum + t.efficiency, 0) / truckData.length
		},
		haul: {
			count: haulData.length,
			alerts: haulData.reduce((sum, h) => sum + h.alerts.length, 0),
			efficiency: haulData.reduce((sum, h) => sum + h.efficiency, 0) / haulData.length
		}
	};

	// Handle haul detail requests from raw data table
	let haulDetailEventListener: ((event: CustomEvent) => void) | null = null;

	onMount(() => {
		haulDetailEventListener = (event: CustomEvent) => {
			const { haulId } = event.detail;
			activeTab = 'haul';
		};
		
		window.addEventListener('haul-detail-requested', haulDetailEventListener as EventListener);
	});

	onDestroy(() => {
		if (haulDetailEventListener) {
			window.removeEventListener('haul-detail-requested', haulDetailEventListener as EventListener);
		}
	});
</script>

<div class="fleet-intelligence-analytics">
	<!-- Header with title and stats -->
	<div class="analytics-header">
		<div class="header-content">
			<div class="title-section">
				<h1 class="analytics-title">
					<Activity class="w-5 h-5 text-orange-500" />
					Fleet Intelligence Nexus
				</h1>
				<p class="analytics-subtitle">
					Real-time fleet operations intelligence • Last updated {formatLastUpdate(lastUpdate)}
				</p>
			</div>
			
			<!-- Quick Stats -->
			<div class="quick-stats">
				<div class="stat-item">
					<span class="stat-value">{fleetData.totalTrucks}</span>
					<span class="stat-label">Trucks</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">${(fleetData.monthlyRevenue / 1000000).toFixed(1)}M</span>
					<span class="stat-label">Monthly Revenue</span>
				</div>
				<div class="stat-item">
					<span class="stat-value">{fleetData.efficiency}%</span>
					<span class="stat-label">Fleet Efficiency</span>
				</div>
			</div>
		</div>

		<!-- Breadcrumb for drill-down context -->
		{#if level !== 'fleet' && activeTab !== 'raw'}
			<div class="breadcrumb-bar">
				<nav class="breadcrumb">
					{#each breadcrumbs as crumb, index}
						<button 
							class="breadcrumb-item"
							class:active={index === breadcrumbs.length - 1}
							on:click={() => handleDrillDown(crumb.level)}
						>
							<svelte:component this={crumb.icon} class="w-4 h-4" />
							{crumb.label}
						</button>
						{#if index < breadcrumbs.length - 1}
							<ChevronRight class="w-4 h-4 breadcrumb-separator" />
						{/if}
					{/each}
				</nav>
			</div>
		{/if}
	</div>

	<!-- Main Navigation Tabs -->
	<div class="main-tabs">
		<div class="tab-list">
			<!-- Data Level Tabs -->
			<button 
				class="main-tab"
				class:active={activeTab === 'fleet'}
				on:click={() => handleTabChange('fleet')}
			>
				<Home class="w-5 h-5" />
				<span class="tab-content">
					<span class="tab-label">Fleet Overview</span>
					<span class="tab-meta">
						{tabStats.fleet.efficiency}% efficiency
						{#if tabStats.fleet.alerts > 0}
							<span class="alert-indicator">{tabStats.fleet.alerts}</span>
						{/if}
					</span>
				</span>
			</button>

			<button 
				class="main-tab"
				class:active={activeTab === 'yard'}
				on:click={() => handleTabChange('yard')}
			>
				<Building2 class="w-5 h-5" />
				<span class="tab-content">
					<span class="tab-label">Yards ({tabStats.yard.count})</span>
					<span class="tab-meta">
						{tabStats.yard.efficiency.toFixed(1)}% avg efficiency
						{#if tabStats.yard.alerts > 0}
							<span class="alert-indicator">{tabStats.yard.alerts}</span>
						{/if}
					</span>
				</span>
			</button>

			<button 
				class="main-tab"
				class:active={activeTab === 'truck'}
				on:click={() => handleTabChange('truck')}
			>
				<Truck class="w-5 h-5" />
				<span class="tab-content">
					<span class="tab-label">Trucks ({tabStats.truck.count})</span>
					<span class="tab-meta">
						{tabStats.truck.efficiency.toFixed(1)}% avg efficiency
						{#if tabStats.truck.alerts > 0}
							<span class="alert-indicator">{tabStats.truck.alerts}</span>
						{/if}
					</span>
				</span>
			</button>

			<button 
				class="main-tab"
				class:active={activeTab === 'haul'}
				on:click={() => handleTabChange('haul')}
			>
				<FileText class="w-5 h-5" />
				<span class="tab-content">
					<span class="tab-label">Haul Tickets ({tabStats.haul.count})</span>
					<span class="tab-meta">
						{tabStats.haul.efficiency.toFixed(1)}% avg efficiency
						{#if tabStats.haul.alerts > 0}
							<span class="alert-indicator">{tabStats.haul.alerts}</span>
						{/if}
					</span>
				</span>
			</button>

			<!-- Separator -->
			<div class="tab-separator"></div>

			<!-- Raw Data Tab -->
			<button 
				class="main-tab raw-data-tab"
				class:active={activeTab === 'raw'}
				on:click={() => handleTabChange('raw')}
			>
				<Database class="w-5 h-5" />
				<span class="tab-content">
					<span class="tab-label">Raw Data</span>
					<span class="tab-meta">Filterable haul tickets</span>
				</span>
			</button>
		</div>
	</div>

	<!-- Content Area -->
	<div class="analytics-content">
		{#if activeTab === 'fleet'}
			<FleetAnalytics {handleDrillDown} />
		{:else if activeTab === 'yard'}
			<YardAnalytics {handleDrillDown} />
		{:else if activeTab === 'truck'}
			<TruckAnalytics {handleDrillDown} />
		{:else if activeTab === 'haul'}
			<HaulDetailView {handleDrillDown} />
		{:else if activeTab === 'raw'}
			<RawDataTable />
		{/if}
	</div>
</div>

<style>
	.fleet-intelligence-analytics {
		@apply flex flex-col h-full bg-gray-50 dark:bg-gray-900;
	}

	.analytics-header {
		@apply bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm;
	}

	.header-content {
		@apply flex justify-between items-center p-6;
	}

	.title-section {
		@apply flex flex-col gap-1;
	}

	.analytics-title {
		@apply flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white;
	}

	.analytics-subtitle {
		@apply text-xs text-gray-500 dark:text-gray-400 font-medium;
	}

	.quick-stats {
		@apply flex items-center gap-6;
	}

	.stat-item {
		@apply flex flex-col items-center;
	}

	.stat-value {
		@apply text-lg font-bold text-gray-900 dark:text-white;
	}

	.stat-label {
		@apply text-xs text-gray-500 dark:text-gray-400 font-medium;
	}

	.breadcrumb-bar {
		@apply px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600;
	}

	.breadcrumb {
		@apply flex items-center gap-2;
	}

	.breadcrumb-item {
		@apply flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-colors;
	}

	.breadcrumb-item.active {
		@apply text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20;
	}

	.breadcrumb-separator {
		@apply text-gray-400 dark:text-gray-500;
	}

	.main-tabs {
		@apply bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700;
	}

	.tab-list {
		@apply flex items-center px-4 overflow-x-hidden;
	}

	.main-tab {
		@apply flex items-center gap-2 px-4 py-3 text-left border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors min-w-0 flex-shrink-0;
		min-width: max-content;
	}

	.main-tab.active {
		@apply border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20;
	}

	.main-tab.raw-data-tab {
		@apply border-l border-gray-200 dark:border-gray-600 ml-3 pl-4;
		min-width: 120px; /* Reduced space for "Raw Data" text */
	}

	.tab-content {
		@apply flex flex-col gap-0.5;
		min-width: max-content;
		overflow: visible;
	}

	.tab-label {
		@apply text-sm font-semibold text-gray-900 dark:text-white;
		white-space: nowrap;
		overflow: visible;
	}

	.tab-meta {
		@apply text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2;
		white-space: nowrap;
		overflow: visible;
		line-height: 1.2;
	}

	.main-tab.active .tab-label {
		@apply text-orange-600 dark:text-orange-400;
	}

	.alert-indicator {
		@apply inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full;
	}

	.tab-separator {
		@apply w-px h-8 bg-gray-200 dark:bg-gray-600 mx-4;
	}

	.analytics-content {
		@apply flex-1 overflow-hidden;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.header-content {
			@apply flex-col gap-4 items-start;
		}

		.quick-stats {
			@apply gap-4;
		}

		.main-tab {
			@apply px-4 py-3;
		}

		.tab-content {
			@apply gap-0;
		}

		.tab-meta {
			@apply text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1;
		}
	}
</style> 