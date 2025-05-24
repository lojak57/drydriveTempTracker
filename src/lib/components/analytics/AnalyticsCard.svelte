<script lang="ts">
	export let title: string;
	export let value: number | string;
	export let unit: string = '';
	export let trend: 'up' | 'down' | 'stable' = 'stable';
	export let trendValue: string = '';
	export let icon: string = '📊';
	export let color: 'blue' | 'emerald' | 'amber' | 'red' | 'slate' = 'blue';

	function getTrendIcon(trend: string) {
		switch (trend) {
			case 'up': return '📈';
			case 'down': return '📉';
			default: return '➡️';
		}
	}

	function getTrendColor(trend: string) {
		switch (trend) {
			case 'up': return 'text-emerald-600';
			case 'down': return 'text-red-600';
			default: return 'text-slate-600';
		}
	}

	function getCardTheme(color: string) {
		switch (color) {
			case 'emerald': return 'from-emerald-50 to-emerald-100 border-emerald-200';
			case 'amber': return 'from-amber-50 to-amber-100 border-amber-200';
			case 'red': return 'from-red-50 to-red-100 border-red-200';
			case 'slate': return 'from-slate-50 to-slate-100 border-slate-200';
			default: return 'from-blue-50 to-blue-100 border-blue-200';
		}
	}

	function getValueColor(color: string) {
		switch (color) {
			case 'emerald': return 'text-emerald-700';
			case 'amber': return 'text-amber-700';
			case 'red': return 'text-red-700';
			case 'slate': return 'text-slate-700';
			default: return 'text-blue-700';
		}
	}
</script>

<div class="glass-card p-4 sm:p-6 bg-gradient-to-br {getCardTheme(color)} border">
	<div class="flex items-start justify-between mb-3 sm:mb-4">
		<div class="text-lg sm:text-2xl">{icon}</div>
		{#if trendValue}
			<div class="flex items-center gap-1 text-xs {getTrendColor(trend)}">
				<span>{getTrendIcon(trend)}</span>
				<span class="font-medium">{trendValue}</span>
			</div>
		{/if}
	</div>
	
	<div class="space-y-1 sm:space-y-2">
		<h3 class="text-xs sm:text-sm font-medium text-oil-black leading-tight">{title}</h3>
		<div class="flex items-baseline gap-1 sm:gap-2">
			<div class="metric-display text-xl sm:text-3xl {getValueColor(color)} leading-tight">
				{typeof value === 'number' ? value.toFixed(1) : value}
			</div>
			{#if unit}
				<span class="text-xs sm:text-sm {getValueColor(color)} opacity-70">{unit}</span>
			{/if}
		</div>
	</div>
</div> 