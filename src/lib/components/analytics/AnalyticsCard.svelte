<script lang="ts">
	export let title: string;
	export let value: string | number;
	export let subtitle: string = '';
	export let trend: 'up' | 'down' | 'stable' = 'stable';
	export let trendValue: string = '';
	export let icon: string = '';
	export let color: string = 'blue';
	export let size: 'small' | 'medium' | 'large' = 'medium';

	// Enhanced color mappings for analytics
	const colorMap = {
		blue: { 
			primary: 'text-oil-blue', 
			bg: 'from-blue-50/90 to-blue-100/70',
			accent: 'bg-oil-blue/15',
			border: 'border-oil-blue/25',
			gradient: 'from-oil-blue/20 to-oil-blue/5'
		},
		orange: { 
			primary: 'text-oil-orange', 
			bg: 'from-orange-50/90 to-orange-100/70',
			accent: 'bg-oil-orange/15',
			border: 'border-oil-orange/25',
			gradient: 'from-oil-orange/20 to-oil-orange/5'
		},
		emerald: { 
			primary: 'text-emerald-600', 
			bg: 'from-emerald-50/90 to-emerald-100/70',
			accent: 'bg-emerald-600/15',
			border: 'border-emerald-600/25',
			gradient: 'from-emerald-600/20 to-emerald-600/5'
		},
		amber: { 
			primary: 'text-amber-600', 
			bg: 'from-amber-50/90 to-amber-100/70',
			accent: 'bg-amber-600/15',
			border: 'border-amber-600/25',
			gradient: 'from-amber-600/20 to-amber-600/5'
		},
		red: { 
			primary: 'text-red-600', 
			bg: 'from-red-50/90 to-red-100/70',
			accent: 'bg-red-600/15',
			border: 'border-red-600/25',
			gradient: 'from-red-600/20 to-red-600/5'
		},
		purple: { 
			primary: 'text-purple-600', 
			bg: 'from-purple-50/90 to-purple-100/70',
			accent: 'bg-purple-600/15',
			border: 'border-purple-600/25',
			gradient: 'from-purple-600/20 to-purple-600/5'
		}
	};

	$: colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;

	// Size configurations
	$: sizeClasses = {
		small: {
			container: 'p-4',
			icon: 'w-10 h-10 text-xl',
			title: 'text-sm',
			value: 'text-xl',
			subtitle: 'text-xs'
		},
		medium: {
			container: 'p-6',
			icon: 'w-12 h-12 text-2xl',
			title: 'text-base',
			value: 'text-2xl',
			subtitle: 'text-sm'
		},
		large: {
			container: 'p-8',
			icon: 'w-16 h-16 text-3xl',
			title: 'text-lg',
			value: 'text-4xl',
			subtitle: 'text-base'
		}
	}[size];

	// Trend indicators
	$: trendIcon = trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️';
	$: trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-oil-gray';
</script>

<div class="analytics-card {sizeClasses.container} group">
	<!-- Enhanced header with analytics styling -->
	<div class="flex items-start justify-between mb-4">
		<div class="flex items-center gap-4">
			{#if icon}
				<div class="{sizeClasses.icon} rounded-2xl {colors.accent} flex items-center justify-center shadow-inner border {colors.border}">
					<span class="filter drop-shadow-sm">{icon}</span>
				</div>
			{/if}
			<div class="flex-1">
				<h3 class="font-bold text-oil-black {sizeClasses.title} leading-tight mb-1">{title}</h3>
				{#if subtitle}
					<p class="text-oil-gray {sizeClasses.subtitle} font-medium">{subtitle}</p>
				{/if}
			</div>
		</div>
		
		<!-- Enhanced trend indicator -->
		{#if trendValue}
			<div class="text-right">
				<div class="flex items-center gap-1 {sizeClasses.subtitle} {trendColor} font-bold">
					<span>{trendIcon}</span>
					<span>{trendValue}</span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Enhanced value display with analytics styling -->
	<div class="relative mb-4">
		<div class="display-medium {colors.primary} {sizeClasses.value} font-bold group-hover:scale-105 transition-transform duration-300">
			{typeof value === 'number' ? value.toLocaleString() : value}
		</div>
		
		<!-- Analytics background accent -->
		<div class="absolute inset-0 bg-gradient-to-br {colors.bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
	</div>

	<!-- Enhanced analytics accent elements -->
	<div class="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r {colors.gradient} rounded-b-2xl opacity-70"></div>
	
	<!-- Analytics corner indicators -->
	<div class="absolute top-4 right-4 flex gap-1">
		<div class="w-1.5 h-1.5 {colors.accent} rounded-full opacity-60"></div>
		<div class="w-1.5 h-1.5 {colors.accent} rounded-full opacity-40"></div>
		<div class="w-1.5 h-1.5 {colors.accent} rounded-full opacity-20"></div>
	</div>

	<!-- Professional data visualization hint -->
	<div class="absolute bottom-4 right-4 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
		<div class="w-8 h-4 bg-gradient-to-r {colors.gradient} rounded-sm"></div>
	</div>
</div> 