<script lang="ts">
	export let value: number = 0;
	export let max: number = 100;
	export let min: number = 0;
	export let title: string = 'Gauge';
	export let unit: string = '';
	export let color: string = 'blue';
	export let size: number = 120;
	export let thickness: number = 8;
	export let showValue: boolean = true;
	export let thresholds: { warning?: number; critical?: number } = {};

	// Color mappings
	const colorMap = {
		blue: { primary: '#3B82F6', warning: '#F59E0B', critical: '#EF4444', background: '#E5E7EB' },
		emerald: { primary: '#10B981', warning: '#F59E0B', critical: '#EF4444', background: '#E5E7EB' },
		amber: { primary: '#F59E0B', warning: '#EF4444', critical: '#DC2626', background: '#E5E7EB' },
		red: { primary: '#EF4444', warning: '#DC2626', critical: '#B91C1C', background: '#E5E7EB' },
		purple: { primary: '#8B5CF6', warning: '#F59E0B', critical: '#EF4444', background: '#E5E7EB' }
	};

	$: colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;
	$: normalizedValue = Math.max(min, Math.min(max, value));
	$: percentage = ((normalizedValue - min) / (max - min)) * 100;
	$: circumference = 2 * Math.PI * (size / 2 - thickness / 2);
	$: strokeDasharray = circumference;
	$: strokeDashoffset = circumference - (percentage / 100) * circumference;

	// Determine gauge color based on thresholds
	$: gaugeColor = (() => {
		if (thresholds.critical && normalizedValue >= thresholds.critical) return colors.critical;
		if (thresholds.warning && normalizedValue >= thresholds.warning) return colors.warning;
		return colors.primary;
	})();

	// Status indicator
	$: status = (() => {
		if (thresholds.critical && normalizedValue >= thresholds.critical) return 'critical';
		if (thresholds.warning && normalizedValue >= thresholds.warning) return 'warning';
		return 'normal';
	})();

	$: statusIcon = status === 'critical' ? '🚨' : status === 'warning' ? '⚠️' : '✅';
</script>

<div class="flex flex-col items-center p-4">
	<!-- Gauge Title -->
	<div class="text-sm font-medium text-oil-black mb-2 text-center">{title}</div>
	
	<!-- Gauge SVG -->
	<div class="relative">
		<svg width={size} height={size} class="transform -rotate-90">
			<!-- Background circle -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={size / 2 - thickness / 2}
				fill="none"
				stroke={colors.background}
				stroke-width={thickness}
				class="opacity-30"
			/>
			
			<!-- Progress circle -->
			<circle
				cx={size / 2}
				cy={size / 2}
				r={size / 2 - thickness / 2}
				fill="none"
				stroke={gaugeColor}
				stroke-width={thickness}
				stroke-linecap="round"
				stroke-dasharray={strokeDasharray}
				stroke-dashoffset={strokeDashoffset}
				class="transition-all duration-1000 ease-out"
			/>
		</svg>
		
		<!-- Center content -->
		<div class="absolute inset-0 flex flex-col items-center justify-center">
			{#if showValue}
				<div class="text-xl font-bold text-oil-black leading-tight">
					{normalizedValue.toFixed(1)}{unit}
				</div>
				<div class="text-xs text-oil-gray">{percentage.toFixed(0)}%</div>
			{:else}
				<div class="text-2xl">{statusIcon}</div>
			{/if}
		</div>
	</div>
	
	<!-- Status indicator -->
	<div class="flex items-center gap-1 mt-2 px-2 py-1 rounded-lg text-xs font-medium"
		 class:bg-emerald-100={status === 'normal'}
		 class:text-emerald-700={status === 'normal'}
		 class:bg-amber-100={status === 'warning'}
		 class:text-amber-700={status === 'warning'}
		 class:bg-red-100={status === 'critical'}
		 class:text-red-700={status === 'critical'}>
		<span>{statusIcon}</span>
		<span class="capitalize">{status}</span>
	</div>
	
	<!-- Threshold indicators -->
	{#if thresholds.warning || thresholds.critical}
		<div class="flex gap-2 mt-2 text-xs">
			{#if thresholds.warning}
				<div class="flex items-center gap-1 text-amber-600">
					<div class="w-2 h-2 bg-amber-500 rounded-full"></div>
					<span>Warning: {thresholds.warning}{unit}</span>
				</div>
			{/if}
			{#if thresholds.critical}
				<div class="flex items-center gap-1 text-red-600">
					<div class="w-2 h-2 bg-red-500 rounded-full"></div>
					<span>Critical: {thresholds.critical}{unit}</span>
				</div>
			{/if}
		</div>
	{/if}
</div> 