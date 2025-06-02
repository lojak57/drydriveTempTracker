<script lang="ts">
	import { ExternalLink, TrendingUp, BarChart3 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let label: string = 'Click to explore';
	export let variant: 'primary' | 'secondary' | 'subtle' = 'subtle';
	export let size: 'sm' | 'md' | 'lg' = 'sm';
	export let showIcon = true;
	export let icon: any = ExternalLink;
	
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		dispatch('click');
	}
	
	$: variantClasses = {
		primary: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
		secondary: 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100',
		subtle: 'text-slate-500 hover:text-slate-700'
	}[variant];
	
	$: sizeClasses = {
		sm: 'text-xs px-2 py-1',
		md: 'text-sm px-3 py-1.5',
		lg: 'text-base px-4 py-2'
	}[size];
	
	$: iconSize = { sm: 12, md: 14, lg: 16 }[size];
</script>

<button 
	class="click-to-explore {variantClasses} {sizeClasses} font-medium rounded-md transition-all duration-200 hover:scale-105 flex items-center gap-1.5"
	class:border={variant !== 'subtle'}
	on:click={handleClick}
	type="button"
>
	{#if showIcon}
		<svelte:component this={icon} size={iconSize} />
	{/if}
	{label}
</button>

<style>
	.click-to-explore {
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
	}
	
	.click-to-explore:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style> 