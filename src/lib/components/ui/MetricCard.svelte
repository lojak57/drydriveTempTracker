<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		unit?: string;
		status?: 'normal' | 'warning' | 'critical';
		subtitle?: string;
		icon?: string;
		loading?: boolean;
		trend?: 'up' | 'down' | 'stable';
		trendValue?: string;
	}
	
	let { 
		title, 
		value, 
		unit = '', 
		status = 'normal', 
		subtitle, 
		icon,
		loading = false,
		trend,
		trendValue
	}: Props = $props();
	
	function getStatusClass(status: string): string {
		switch (status) {
			case 'warning': return 'status-warning';
			case 'critical': return 'status-critical';
			default: return 'status-normal';
		}
	}
	
	function getTrendIcon(trend?: string): string {
		switch (trend) {
			case 'up': return '↗️';
			case 'down': return '↘️';
			case 'stable': return '→';
			default: return '';
		}
	}
	
	function getTrendColor(trend?: string): string {
		switch (trend) {
			case 'up': return 'text-emerald-600';
			case 'down': return 'text-red-500';
			case 'stable': return 'text-oil-gray';
			default: return 'text-oil-gray';
		}
	}
</script>

<div class="glass-card p-4 sm:p-6 fade-in">
	<!-- Header -->
	<div class="flex items-center justify-between mb-3 sm:mb-4">
		<div class="flex items-center space-x-2 sm:space-x-3">
			{#if icon}
				<div class="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-xl flex items-center justify-center">
					<span class="text-lg sm:text-xl">{icon}</span>
				</div>
			{/if}
			<div>
				<h3 class="text-base sm:text-lg font-semibold text-oil-black leading-tight">{title}</h3>
				{#if subtitle}
					<p class="text-xs sm:text-sm text-oil-gray">{subtitle}</p>
				{/if}
			</div>
		</div>
		<div class="status-dot {getStatusClass(status)}"></div>
	</div>

	<!-- Value Display -->
	<div class="mb-4">
		{#if loading}
			<div class="skeleton h-12 w-32 mb-2"></div>
			<div class="skeleton h-4 w-24"></div>
		{:else}
			<div class="metric-display text-oil-blue">
				{typeof value === 'number' ? value.toFixed(1) : value}
				{#if unit}
					<span class="text-xl text-oil-gray ml-1">{unit}</span>
				{/if}
			</div>
			
			{#if trend && trendValue}
				<div class="flex items-center space-x-1 mt-2">
					<span class="text-sm {getTrendColor(trend)}">{getTrendIcon(trend)}</span>
					<span class="text-sm {getTrendColor(trend)} font-medium">{trendValue}</span>
				</div>
			{/if}
		{/if}
	</div>
</div> 