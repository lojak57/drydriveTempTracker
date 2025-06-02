<script lang="ts">
	import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte';
	
	export let value: number | string;
	export let type: 'percentage' | 'absolute' | 'text' = 'percentage';
	export let showIcon = true;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	
	// Determine trend direction and color
	function getTrendInfo(val: number | string) {
		if (typeof val === 'string') {
			if (val.includes('+') || val.includes('up') || val.includes('gain')) {
				return { direction: 'up', color: 'text-green-600', icon: TrendingUp };
			} else if (val.includes('-') || val.includes('down') || val.includes('loss')) {
				return { direction: 'down', color: 'text-red-500', icon: TrendingDown };
			}
			return { direction: 'flat', color: 'text-slate-600', icon: Minus };
		}
		
		if (val > 0) {
			return { direction: 'up', color: 'text-green-600', icon: TrendingUp };
		} else if (val < 0) {
			return { direction: 'down', color: 'text-red-500', icon: TrendingDown };
		}
		return { direction: 'flat', color: 'text-slate-600', icon: Minus };
	}
	
	// Format value for display
	function formatValue(val: number | string) {
		if (typeof val === 'string') return val;
		
		switch (type) {
			case 'percentage':
				return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
			case 'absolute':
				return val > 0 ? `+${val}` : val.toString();
			default:
				return val.toString();
		}
	}
	
	$: trendInfo = getTrendInfo(value);
	$: formattedValue = formatValue(value);
	$: sizeClasses = {
		sm: 'text-xs gap-1',
		md: 'text-sm gap-1.5', 
		lg: 'text-base gap-2'
	}[size];
	$: iconSize = { sm: 12, md: 14, lg: 16 }[size];
</script>

<span class="trend-cell {sizeClasses} {trendInfo.color} font-medium flex items-center">
	{#if showIcon}
		<svelte:component this={trendInfo.icon} size={iconSize} />
	{/if}
	<span class="font-mono">{formattedValue}</span>
</span>

<style>
	.trend-cell {
		display: inline-flex;
		align-items: center;
		white-space: nowrap;
	}
</style> 