<script lang="ts">
	import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-svelte';
	import type { ComponentType } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let title: string;
	export let value: string | number;
	export let unit: string = '';
	export let icon: ComponentType | null = null;
	export let status: 'normal' | 'warning' | 'critical' = 'normal';
	export let trend: 'up' | 'down' | 'stable' = 'stable';
	export let trendValue: string = '';
	export let color: string = 'blue';
	export let clickable: boolean = false;
	export let onClick: (() => void) | null = null;

	const dispatch = createEventDispatcher();

	function handleClick() {
		if (clickable) {
			if (onClick) {
				onClick();
			} else {
				dispatch('click', { title, value, unit });
			}
		}
	}

	// Enhanced color mappings for cleaner, more subdued look
	const colorMap = {
		blue: { 
			primary: '#1e293b', // Neutral dark for primary text
			bg: 'rgba(248, 250, 252, 0.8)', // Very light neutral background
			accent: 'rgba(226, 232, 240, 0.4)', // Light gray accent
			border: 'rgba(226, 232, 240, 0.6)'
		},
		orange: { 
			primary: '#1e293b',
			bg: 'rgba(248, 250, 252, 0.8)',
			accent: 'rgba(226, 232, 240, 0.4)',
			border: 'rgba(226, 232, 240, 0.6)'
		},
		emerald: { 
			primary: '#1e293b',
			bg: 'rgba(248, 250, 252, 0.8)',
			accent: 'rgba(226, 232, 240, 0.4)',
			border: 'rgba(226, 232, 240, 0.6)'
		},
		amber: { 
			primary: '#1e293b',
			bg: 'rgba(248, 250, 252, 0.8)',
			accent: 'rgba(226, 232, 240, 0.4)',
			border: 'rgba(226, 232, 240, 0.6)'
		},
		red: { 
			primary: '#1e293b',
			bg: 'rgba(248, 250, 252, 0.8)',
			accent: 'rgba(226, 232, 240, 0.4)',
			border: 'rgba(226, 232, 240, 0.6)'
		},
		gray: { 
			primary: '#1e293b',
			bg: 'rgba(248, 250, 252, 0.8)',
			accent: 'rgba(226, 232, 240, 0.4)',
			border: 'rgba(226, 232, 240, 0.6)'
		}
	};

	$: colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;

	// Status indicator styling - keep these colorful for importance
	$: statusClasses = {
		normal: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/60',
		warning: 'bg-amber-100/80 text-amber-700 border-amber-200/60',
		critical: 'bg-red-100/80 text-red-700 border-red-200/60'
	}[status];

	// Trend indicator with Lucide icons - keep trend colors for clarity
	$: trendIconComponent = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : ArrowRight;
	$: trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';
</script>

<div 
	class="metric-card" 
	class:clickable
	style="--primary-color: {colors.primary}; --accent-bg: {colors.accent}; --gradient-bg: {colors.bg}; --border-color: {colors.border}"
	on:click={handleClick}
	role={clickable ? 'button' : undefined}
	tabindex={clickable ? 0 : undefined}
>
	<!-- Header -->
	<div class="card-header">
		<div class="header-left">
			{#if icon}
				<div class="icon-container">
					<svelte:component this={icon} size={18} />
				</div>
			{/if}
			<div class="title-section">
				<h3 class="card-title">{title}</h3>
				{#if status !== 'normal'}
					<div class="status-badge status-{status}">
						<div class="status-dot"></div>
						<span>{status}</span>
					</div>
				{/if}
			</div>
		</div>
		
		<!-- Trend indicator -->
		{#if trendValue}
			<div class="trend-indicator" style="color: {trendColor}">
				<svelte:component this={trendIconComponent} size={14} />
				<span class="trend-value">{trendValue}</span>
			</div>
		{/if}
	</div>

	<!-- Metric display -->
	<div class="metric-display">
		<span class="metric-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
		{#if unit}
			<span class="metric-unit">{unit}</span>
		{/if}
	</div>

	<!-- Click indicator for drill-down -->
	{#if clickable}
		<div class="click-indicator">
			<span>Click for details →</span>
		</div>
	{/if}

	<!-- Background accent -->
	<div class="background-accent"></div>
	
	<!-- Corner detail -->
	<div class="corner-detail"></div>
</div>

<style>
	.metric-card {
		position: relative;
		padding: 20px;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: all 0.2s ease;
		overflow: hidden;
		min-height: 120px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	
	.metric-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-color: rgba(203, 213, 225, 0.8);
	}

	.metric-card.clickable {
		cursor: pointer;
	}

	.metric-card.clickable:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
		border-color: #cbd5e1;
	}

	.metric-card.clickable:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.click-indicator {
		position: absolute;
		bottom: 8px;
		right: 12px;
		font-size: 10px;
		color: #64748b;
		opacity: 0;
		transition: opacity 0.2s ease;
		font-weight: 500;
	}

	.metric-card.clickable:hover .click-indicator {
		opacity: 1;
	}
	
	.card-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 12px;
	}
	
	.header-left {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		flex: 1;
	}
	
	.icon-container {
		width: 36px;
		height: 36px;
		border-radius: 10px;
		background: var(--accent-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
		flex-shrink: 0;
	}
	
	.title-section {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
		flex: 1;
	}
	
	.card-title {
		font-size: 12px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
		line-height: 1.3;
		word-wrap: break-word;
	}
	
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 3px 6px;
		border-radius: 6px;
		font-size: 9px;
		font-weight: 600;
		text-transform: capitalize;
		border: 1px solid;
		max-width: fit-content;
	}
	
	.status-badge.status-normal {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
		border-color: rgba(16, 185, 129, 0.2);
	}
	
	.status-badge.status-warning {
		background: rgba(245, 158, 11, 0.1);
		color: #d97706;
		border-color: rgba(245, 158, 11, 0.2);
	}
	
	.status-badge.status-critical {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
		border-color: rgba(239, 68, 68, 0.2);
	}
	
	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}
	
	.trend-indicator {
		display: flex;
		align-items: center;
		gap: 3px;
		font-size: 10px;
		font-weight: 600;
		padding: 3px 6px;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		flex-shrink: 0;
	}
	
	.trend-icon {
		font-size: 10px;
	}
	
	.trend-value {
		font-size: 9px;
		font-weight: 600;
	}
	
	.metric-display {
		display: flex;
		align-items: baseline;
		gap: 6px;
		margin-top: auto;
	}
	
	.metric-value {
		font-size: 20px;
		font-weight: 700;
		color: var(--primary-color);
		line-height: 1.1;
		word-break: break-all;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}
	
	.metric-unit {
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		opacity: 0.8;
	}
	
	.background-accent {
		position: absolute;
		inset: 0;
		background: var(--gradient-bg);
		border-radius: 20px;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}
	
	.metric-card:hover .background-accent {
		opacity: 1;
	}
	
	.corner-detail {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 8px;
		height: 8px;
		background: var(--accent-bg);
		border-radius: 50%;
		opacity: 0.4;
	}
	
	/* Responsive Design */
	@media (max-width: 768px) {
		.metric-card {
			padding: 20px;
			min-height: 120px;
		}
		
		.card-header {
			margin-bottom: 12px;
		}
		
		.icon-container {
			width: 40px;
			height: 40px;
			font-size: 20px;
		}
		
		.card-title {
			font-size: 13px;
		}
		
		.metric-value {
			font-size: 28px;
		}
		
		.metric-unit {
			font-size: 14px;
		}
	}
	
	@media (max-width: 480px) {
		.metric-card {
			padding: 16px;
		}
		
		.metric-value {
			font-size: 24px;
		}
		
		.header-left {
			gap: 8px;
		}
		
		.icon-container {
			width: 36px;
			height: 36px;
			font-size: 18px;
		}
	}
	
	/* Mobile optimizations */
	@media (max-width: 640px) {
		.metric-card {
			padding: 12px;
			min-height: 100px;
			border-radius: 12px;
		}
		
		.card-header {
			margin-bottom: 8px;
		}
		
		.header-left {
			gap: 6px;
		}
		
		.icon-container {
			width: 28px;
			height: 28px;
			border-radius: 8px;
			font-size: 14px;
		}
		
		.card-title {
			font-size: 11px;
			line-height: 1.2;
		}
		
		.metric-value {
			font-size: 18px;
		}
		
		.metric-unit {
			font-size: 10px;
		}
		
		.status-badge {
			padding: 2px 4px;
			font-size: 8px;
			gap: 2px;
		}
		
		.trend-indicator {
			padding: 2px 4px;
			font-size: 8px;
			gap: 2px;
		}
		
		.trend-icon {
			font-size: 8px;
		}
		
		.trend-value {
			font-size: 7px;
		}
		
		.metric-card:hover {
			transform: none;
		}
	}
	
	/* Tablet optimizations */
	@media (min-width: 641px) and (max-width: 1024px) {
		.metric-card {
			padding: 18px;
			min-height: 130px;
		}
		
		.metric-value {
			font-size: 24px;
		}
		
		.metric-unit {
			font-size: 14px;
		}
	}
</style> 