<script lang="ts">
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let title: string;
	export let count: number;
	export let status: 'active' | 'maintenance' | 'available' | 'warning' = 'active';
	export let expanded = false;
	export let items: Array<{ id: string; name: string; status: string; extra?: string }> = [];
	
	const dispatch = createEventDispatcher();
	
	function toggleExpanded() {
		expanded = !expanded;
		dispatch('toggle', { expanded, section: title });
	}
	
	function getStatusColor(status: string) {
		switch (status) {
			case 'active': return 'border-green-500 bg-green-50 text-green-700';
			case 'maintenance': return 'border-orange-500 bg-orange-50 text-orange-700';
			case 'available': return 'border-slate-500 bg-slate-50 text-slate-700';
			case 'warning': return 'border-red-500 bg-red-50 text-red-700';
			default: return 'border-slate-500 bg-slate-50 text-slate-700';
		}
	}
	
	function getItemStatusColor(itemStatus: string) {
		switch (itemStatus.toLowerCase()) {
			case 'on route':
			case 'loading':
			case 'ready':
			case 'active':
				return 'text-green-600 bg-green-50 border-l-green-500';
			case 'service':
			case 'inspection':
			case 'maintenance':
				return 'text-orange-600 bg-orange-50 border-l-orange-500';
			case 'repair':
			case 'offline':
				return 'text-red-600 bg-red-50 border-l-red-500';
			default:
				return 'text-slate-600 bg-slate-50 border-l-slate-500';
		}
	}
</script>

<div class="fleet-status-section border rounded-lg bg-white shadow-sm">
	<button 
		class="section-header w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
		on:click={toggleExpanded}
		type="button"
	>
		<div class="header-content flex items-center gap-3">
			<div class="status-badge px-3 py-1 rounded-full text-sm font-semibold {getStatusColor(status)}">
				{title} ({count})
			</div>
		</div>
		<div class="expand-icon text-slate-400">
			{#if expanded}
				<ChevronDown size={20} />
			{:else}
				<ChevronRight size={20} />
			{/if}
		</div>
	</button>
	
	{#if expanded}
		<div class="section-content border-t bg-slate-50">
			{#if items.length > 0}
				<div class="items-grid p-4 space-y-2">
					{#each items as item}
						<div class="item-card p-3 bg-white rounded border-l-4 {getItemStatusColor(item.status)} transition-colors hover:shadow-sm">
							<div class="item-header flex items-center justify-between">
								<span class="item-name font-medium text-sm text-slate-800">{item.name}</span>
								<span class="item-status text-xs font-medium {getItemStatusColor(item.status).split(' ')[0]}">{item.status}</span>
							</div>
							{#if item.extra}
								<div class="item-extra text-xs text-slate-500 mt-1">{item.extra}</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="empty-state p-4 text-center text-sm text-slate-500">
					No {title.toLowerCase()} items
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.section-header:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}
	
	.item-card {
		transition: all 0.2s ease;
	}
	
	.item-card:hover {
		transform: translateY(-1px);
	}
</style> 